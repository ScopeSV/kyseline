import fs from 'fs'
import path from 'path'
import { ConfigParser } from './config-file/ConfigParser'

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
    createMigrationFile() {
        const dir = this.configParser.getMigrationDir()
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        const filename = `${this.getCurrTimeStamp()}_${this.command}.ts`
        const filePath = path.join(dir, filename)

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
