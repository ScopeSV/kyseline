import { ConfigParser } from '../config-file/ConfigParser'
import { Migrator } from '../migrator/migrator'

export const migrateMigrationsHandler = () => {
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
    const migrator = new Migrator(cfg)
    migrator.migrateUp()
}
