import path from 'path'
import fs from 'fs'

export type Config = {
    migrationDir: string
}

export class ConfigParser {
    config: Config

    constructor() {
        this.config = this.#readConfigFile()
    }

    #readConfigFile = () => {
        const configPath = path.resolve(process.cwd() + '/.kyselycli.json')

        if (!fs.existsSync(configPath)) {
            console.error("Couldn't find .kyselycli.json file")
            process.exit(1)
        }

        try {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        } catch (err) {
            console.error('Error parsing .kyselycli.json file')
            process.exit(1)
        }
    }
    getResolvedPath = (relativePath: string) => {
        return path.resolve(process.cwd(), relativePath)
    }

    getConfig = () => {
        return this.config
    }

    getMigrationDir = () => {
        return this.getResolvedPath(this.config.migrationDir)
    }
}
