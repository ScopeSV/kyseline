import fs from 'fs'
import path from 'path'
class FileWriter {
    constructor(
        public command: string,
        public template: string
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
        const dir = '../migrations'
        if (!fs.existsSync(path.join(__dirname, dir))) {
            fs.mkdirSync(dir)
        }
        const filename = `${this.getCurrTimeStamp()}_${this.command}.ts`
        const filePath = path.join(__dirname, dir, filename)
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
