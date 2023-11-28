import { ConfigParser } from '../config-file/ConfigParser'
import { Direction, Migrator } from '../migrator/migrator'

export const migrateMigrationsHandler = (direction: Direction) => () => {
    const configParser = new ConfigParser()
    const cfg = configParser.getConfig()
    if (!cfg.migrationDir) {
        console.error('Migration directory not found in config')
        process.exit(1)
    }
    if (!cfg.dbCreds) {
        console.error('Database creds not found in config')
        process.exit(1)
    }
    const migrator = new Migrator(cfg, configParser)
    migrator.migrate(direction)
}
