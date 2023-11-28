import { Config, ConfigParser } from '../config-file/ConfigParser'
import ts from 'typescript'
import {
    Kysely,
    PostgresDialect,
    Migrator as KyselyMigrator,
    FileMigrationProvider,
    MigrationResult,
} from 'kysely'
import { Pool } from 'pg'
import { promises as fs } from 'fs'
import * as fileSys from 'fs'
import * as path from 'path'

export type Direction = 'up' | 'down'

export class Migrator {
    #tempFileDir = 'tempMigrations'
    #db: Kysely<any>
    #migrator: KyselyMigrator

    constructor(
        public cfg: Config,
        public configParser: ConfigParser
    ) {
        this.#db = this.#createDbConnector()
        this.#migrator = this.#createDbMigrator()
    }

    #createDbConnector = () => {
        return new Kysely<any>({
            dialect: new PostgresDialect({
                pool: new Pool(this.cfg.dbCreds),
            }),
        })
    }

    #getMigrationDir = () => {
        if (this.cfg.useJsExtension) {
            return this.configParser.getMigrationDir()
        }
        return path.resolve('tempMigrations')
    }

    #createDbMigrator = () => {
        return new KyselyMigrator({
            db: this.#db,
            provider: new FileMigrationProvider({
                fs,
                path,
                migrationFolder: this.#getMigrationDir(),
            }),
        })
    }

    #deleteDirectoryContents() {
        if (fileSys.existsSync(this.#tempFileDir)) {
            const files = fileSys.readdirSync(this.#tempFileDir)

            files.forEach((file) => {
                const currentPath = path.join(this.#tempFileDir, file)
                if (fileSys.lstatSync(currentPath).isDirectory()) {
                    this.#deleteDirectoryContents()
                } else {
                    fileSys.unlinkSync(currentPath)
                }
            })
        }
    }
    #deleteDirectory() {
        if (!fileSys.existsSync(this.#tempFileDir)) return
        this.#deleteDirectoryContents()
        fileSys.rmdirSync(this.#tempFileDir)
    }

    #transpileMigrationFiles() {
        const files = fileSys.readdirSync(this.cfg.migrationDir)
        for (const file of files) {
            if (path.extname(file) !== '.ts') {
                continue
            }

            const filePath = path.resolve(this.cfg.migrationDir, file)
            const src = fileSys.readFileSync(filePath, 'utf-8')
            const res = ts.transpileModule(src, {
                compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ESNext,
                },
            })
            const outFilePath = path.join(
                'tempMigrations',
                path.basename(file, '.ts') + '.js'
            )
            if (!fileSys.existsSync('tempMigrations')) {
                fileSys.mkdirSync('tempMigrations', { recursive: true })
            }
            fileSys.writeFileSync(outFilePath, res.outputText)
        }
    }

    printResults = (d: Direction, results?: MigrationResult[]) => {
        if (!results) return

        if (results.length === 0) {
            d === 'up'
                ? console.log('Already up to date')
                : console.log('No migrations to roll back')
            return
        }

        results.forEach((result) => {
            if (result.status === 'Success') {
                const msg = d === 'up' ? 'Migrated' : 'Rolled back'
                console.log(`${msg} ${result.migrationName}`)
            } else if (result.status === 'Error') {
                const msg =
                    d === 'up' ? 'Failed to migrate' : 'Failed to roll back'
                console.log(`${msg} ${result.migrationName}`)
            }
        })
    }

    migrateUp = async () => {
        const { error, results } = await this.#migrator.migrateToLatest()

        this.printResults('up', results)

        if (error) {
            console.error('Failed to migrate files')
            console.error(error)
            return
        }

        await this.#db.destroy()
    }

    migrateDown = async () => {
        const { error, results } = await this.#migrator.migrateDown()

        this.printResults('down', results)

        if (error) {
            console.error('Failed to roll back')
            console.error(error)
            return
        }

        await this.#db.destroy()
    }

    migrate = async (d: Direction) => {
        try {
            this.#transpileMigrationFiles()
            if (d === 'up') {
                await this.migrateUp()
            }

            if (d === 'down') {
                await this.migrateDown()
            }
        } finally {
            this.#deleteDirectory()
            process.exit(0)
        }
    }
}
