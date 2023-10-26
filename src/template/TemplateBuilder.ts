class TemplateBuilder {
    private template: string

    constructor(
        public command: string,
        public tableName: string
    ) {
        this.template = ''
    }

    #addImport(importName: string, from: string) {
        this.template += `import { ${importName} } from '${from}'\n\n`
    }

    #addMigrationType(type: string) {
        this.template += `export const ${type}: Migration['${type}'] = async (db) => {\n`
    }

    addEnd() {
        this.template += '}\n\n'
    }

    addHeader() {
        this.#addImport('Migration', 'kysely')
        return this
    }

    addUp() {
        this.#addMigrationType('up')
        return this
    }

    addDown() {
        this.#addMigrationType('down')
        return this
    }

    indent(times: number) {
        const indent = '\t'.repeat(times)
        this.template += indent
        return this
    }

    addLine(line: string) {
        this.template += `${line}\n`
        return this
    }

    handleOpts(opts: string[]) {
        for (const opt of opts) {
            if (opt === 'not_null') {
                return `, (col) => col.notNull()`
            }
        }
    }

    addColumn(columnName: string, type: string, opts?: string[]) {
        let line = `.addColumn('${columnName}', '${type}'`
        if (opts && opts.length > 0) {
            line += this.handleOpts(opts)
        }
        line += ')'
        this.template += line + '\n'
        return this
    }

    dropColumn(columnName: string) {
        this.template += `.dropColumn('${columnName}')\n`
        return this
    }

    do() {
        this.template += '.execute()\n'
    }

    getTemplate() {
        return this.template
    }
}

export default TemplateBuilder
