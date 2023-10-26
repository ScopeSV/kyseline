import { Command } from 'commander'
import createMigrationHandler from './handlers/migrationHandler'

const program = new Command()

program.name('kysely-cli').description('Cli tool for kysely').version('0.0.1')

program
    .command('migration:make')
    .description('Create a new migration file')
    .arguments('<migrationType> [otherArgs...]')
    .action(createMigrationHandler)

program.parse()
