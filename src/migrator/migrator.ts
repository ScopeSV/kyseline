import { Config } from '../config-file/ConfigParser'
import ts from 'typescript'
import {
    Kysely,
    PostgresDialect,
    Migrator as KyselyMigrator,
    FileMigrationProvider,
} from 'kysely'
import { Pool } from 'pg'
import { promises as fs } from 'fs'
import * as fileSys from 'fs'
import * as path from 'path'

export class Migrator {
    constructor(public cfg: Config) {}

    #tempFileDir = 'tempMigrations'

    #createDbConnector = () => {
        return new Kysely<any>({
            dialect: new PostgresDialect({
                pool: new Pool(this.cfg.dbCreds),
            }),
        })
    }

    #createDbMigrator = (db: Kysely<any>) => {
        return new KyselyMigrator({
            db,
            provider: new FileMigrationProvider({
                fs,
                path,
                migrationFolder: path.resolve('tempMigrations'),
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

    migrateUp = async () => {
        this.#transpileMigrationFiles()

        try {
            const db = this.#createDbConnector()
            const migrator = this.#createDbMigrator(db)
            const { error, results } = await migrator.migrateToLatest()

            results?.forEach((result) => {
                if (result.status === 'Success') {
                    console.log(`Migrated ${result.migrationName}`)
                } else if (result.status === 'Error') {
                    console.log(`Failed to migrate ${result.migrationName}`)
                }
            })

            if (error) {
                console.error('Failed to migrate files')
                console.error(error)
                process.exit(1)
            }

            if (results?.length === 0) {
                console.log('No migrations to run')
            }

            await db.destroy()
        } finally {
            this.#deleteDirectory()
        }
    }
}
