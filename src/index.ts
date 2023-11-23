#!/usr/bin/env node
import { Command } from 'commander'
import createMigrationHandler from './handlers/migrationHandler'
import { migrateMigrationsHandler } from './handlers/migrateMigrationsHandler'

const program = new Command()

program.name('kyseline').description('Cli tool for kysely').version('0.0.1')

program
    .command('migration')
    .description('Manage migrations')
    .on('--help', () => {
        console.log(`
    MAKE:
    To create a new table:
    $ kyseline migration:make create_foo_table foo:string bar:integer

    To add fields to an existing table:
    $ kyseline migration:make add_foo_from_foo_table foo:string bar:integer

    To remove fields from an existing table:
    $ kyseline migration:make remove_foo_from_footable foo
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

program
    .command('migrate:up')
    .description('Migrates the database')
    .action(migrateMigrationsHandler('up'))

program
    .command('migrate:down')
    .description('Migrates the database')
    .action(migrateMigrationsHandler('down'))

program.parse()
