import FileWriter from '../file-writer/FileWriter'
import { ConfigParser } from '../config-file/ConfigParser'
import TemplateBuilder from '../template/TemplateBuilder'

export enum Commands {
    AddFields = 'add',
    CreateTable = 'create',
    RemoveField = 'remove',
}

const parseInput = (input: string) => {
    const inputParts = input.split('_')
    const type = inputParts[0]
    let tableName
    if (type === Commands.CreateTable) {
        tableName = inputParts[1]
    } else {
        tableName = inputParts[inputParts.length - 1]
    }

    return { tableName, type }
}

const getOpositeMigrationType = (type: string): string => {
    switch (type) {
        case 'createTable':
            return 'dropTable'
        case 'alterTable':
            return 'alterTable'
        case 'dropTable':
            return 'createTable'
        default:
            return ''
    }
}

const buildTableAction = (
    b: TemplateBuilder,
    action: string,
    tableName: string,
    options: string[],
    operation: (
        columnName: string,
        columnType: string,
        opts?: string[]
    ) => void,
    downOperation?: (
        columnName: string,
        columnType: string,
        opts?: string[]
    ) => void
): void => {
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

    if (downOperation) {
        const downAction = getOpositeMigrationType(action)
        b.addDown()
            .indent(1)
            .addLine('await db.schema')
            .indent(2)
            .addLine(`.${downAction}('${tableName}')`)

        if (action !== 'createTable') {
            for (const option of options.slice().reverse()) {
                const [columnName, columnType, ...stuff] = option.split(':')
                downOperation(columnName, columnType, stuff)
            }

            b.indent(2).do()
            b.addEnd()
        } else {
            b.indent(2).do().addEnd()
        }
    }
}

export const generateTemplate = (
    command: string,
    options: string[]
): TemplateBuilder => {
    const { tableName, type } = parseInput(command)
    const b = new TemplateBuilder(command, tableName)

    b.addHeader().addUp()

    console.log('type: ', type)
    switch (type) {
        case Commands.AddFields:
            buildTableAction(
                b,
                'alterTable',
                tableName,
                options,
                (columnName, columnType, opts?: string[]) => {
                    b.indent(2).addColumn(columnName, columnType, opts)
                },
                (columnName, columnType, opts?: string[]) => {
                    b.indent(2).dropColumn(columnName)
                }
            )
            break

        case Commands.CreateTable:
            buildTableAction(
                b,
                'createTable',
                tableName,
                options,
                (columnName, columnType) => {
                    console.log('ready to create a table')
                    b.indent(2).addColumn(columnName, columnType)
                },
                (columnName, columnType, opts?: string[]) => {
                    b.indent(2).dropColumn(columnName).indent(2).do().addEnd()
                }
            )
            break

        case Commands.RemoveField:
            buildTableAction(
                b,
                'alterTable',
                tableName,
                options,
                (columnName) => {
                    b.indent(2).dropColumn(columnName)
                },
                (columnName, columnType, opts?: string[]) => {
                    b.indent(2).addColumn(columnName, '')
                }
            )
            break

        default:
            b.addEnd()
            b.addDown().addEnd()
            break
    }

    return b
}

const createMigrationHandler = (command: string, options: string[]): void => {
    const configParser = new ConfigParser()
    const templateBuilder = generateTemplate(command, options)
    const fileWriter = new FileWriter(
        command,
        templateBuilder.getTemplate(),
        configParser
    )
    fileWriter.createMigrationFile()
}

export default createMigrationHandler
