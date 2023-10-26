#!/usr/bin/env node
import { Command } from 'commander'
import createMigrationHandler from './handlers/migrationHandler'

const program = new Command()

program.name('kysely-cli').description('Cli tool for kysely').version('0.0.1')

program
    .command('migration')
    .description('Manage migrations')
    .on('--help', () => {
        console.log(`
    MAKE:
    To create a new table:
    $ kycli migration:make create_foo_table foo:string bar:integer

    To add fields to an existing table:
    $ kycli migration:make add_foo_from_foo_table foo:string bar:integer

    To remove fields from an existing table:
    $ kycli migration:make remove_foo_from_footable foo
        `)
    })
    .action((cmdObj) => {
        if (cmdObj.args.length === 0) {
            cmdObj.outputHelp()
            process.exit(1)
        }
    })

program
    .command('migration:make')
    .description('Create a new migration file')
    .arguments('<migrationType> [otherArgs...]')
    .action(createMigrationHandler)

program.parse()
