import fs from 'fs'
import path from 'path'
import { ConfigParser } from '../config-file/ConfigParser'
import ts from 'typescript'

class FileWriter {
    constructor(
        public command: string,
        public template: string,
        public configParser: ConfigParser
    ) {}

    getCurrTimeStamp = () => {
        const date = new Date()

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        const second = String(date.getSeconds()).padStart(2, '0')

        return parseInt(`${year}${month}${day}${hour}${minute}${second}`)
    }

    #hasTsConfigInCurrentDir = () => {
        const tsConfigPath = path.resolve(process.cwd() + '/tsconfig.json')
        return fs.existsSync(tsConfigPath)
    }

    #transpileToJs = () => {
        const defaultOptions = {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
            jsx: ts.JsxEmit.Preserve,
        }

        this.template = ts.transpileModule(this.template, {
            compilerOptions: defaultOptions,
        }).outputText
    }

    determineFileExtension = () => {
        const cfg = this.configParser.getConfig()
        if (this.#hasTsConfigInCurrentDir() && cfg.useJsExtension !== true) {
            return 'ts'
        }
        return 'js'
    }

    createMigrationFile() {
        const dir = this.configParser.getMigrationDir()
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        const fileExt = this.determineFileExtension()
        const filename = `${this.getCurrTimeStamp()}_${this.command}.${fileExt}`
        const filePath = path.join(dir, filename)

        if (fileExt === 'js') {
            this.#transpileToJs()
        }

        fs.writeFile(filePath, this.template, (err: any) => {
            if (err) {
                console.error(err)
                return
            }
            console.log(`Migration file created: ${filename}`)
        })
    }
}

export default FileWriter
