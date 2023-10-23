import { Command } from 'commander'
import FileWriter from './FileWriter'
import TemplateBuilder from './TemplateBuilder'

enum Commands {
    AddFields = 'add',
    CreateTable = 'create',
    RemoveField = 'remove',
}

const parseInput = (input: string) => {
    const inputParts = input.split('_')
    const type = inputParts[0]
    let tableName
    if (type == Commands.CreateTable) {
        tableName = inputParts[1]
    } else {
        tableName = inputParts[inputParts.length - 1]
    }

    return { tableName, type }
}

const program = new Command()

program.name('kysely-cli').description('Cli tool for kysely').version('0.0.1')

program
    .command('migration:make')
    .description('Create a new migration file')
    .arguments('<migrationType> [otherArgs...]')
    .action((command: string, options: string[]) => {
        const { tableName, type } = parseInput(command)
        const b = new TemplateBuilder(command, tableName)

        const buildTableAction = (
            action: string,
            operation: (
                columnName: string,
                columnType: string,
                opts?: string[]
            ) => void
        ) => {
            b.indent(1)
                .addLine('await db.schema')
                .indent(2)
                .addLine(`.${action}('${tableName}')`)

            for (const option of options) {
                const [columnName, columnType, ...stuff] = option.split(':')
                operation(columnName, columnType, stuff)
            }
            b.indent(2).do()

            b.addEnd()
        }
        b.addHeader().addUp()

        switch (type) {
            case Commands.AddFields:
                buildTableAction(
                    'alterTable',
                    (columnName, columnType, opts?: string[]) => {
                        b.indent(2).addColumn(columnName, columnType, opts)
                    }
                )
                break

            case Commands.CreateTable:
                buildTableAction('createTable', (columnName, columnType) => {
                    b.indent(2).addColumn(columnName, columnType)
                })
                break

            case Commands.RemoveField:
                buildTableAction('alterTable', (columnName) => {
                    b.indent(2).dropColumn(columnName)
                })
                break
        }

        b.addDown().addEnd()
        const fileWriter = new FileWriter(command, b.getTemplate())
        fileWriter.createMigrationFile()
    })

program.parse()
