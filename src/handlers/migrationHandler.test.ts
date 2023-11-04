import { describe, it, expect } from 'vitest'
import { generateTemplate } from './migrationHandler'

describe('migrationHandler', () => {
    describe('General', () => {
        it('adds kysely import', () => {
            const template = generateTemplate('add_complete_to_todo', [
                'complete:boolean',
            ]).getTemplate()
            expect(template).toContain("import { Migration } from 'kysely'")
        })
        it('adds up and down methods', () => {
            const template = generateTemplate('add_complete_to_todo', [
                'complete:boolean',
            ]).getTemplate()
            expect(template).toContain(
                "export const up: Migration['up'] = async (db) => {"
            )
            expect(template).toContain(
                "export const down: Migration['down'] = async (db) => {"
            )
        })
    })
    describe('CreateTable', () => {
        it('creates a table', () => {
            const template = generateTemplate('create_todo', []).getTemplate()
            expect(template).toContain(
                "await db.schema\n\t\t.createTable('todo')\n\t\t.execute()"
            )
            expect(template).toContain(
                "await db.schema\n\t\t.dropTable('todo')\n\t\t.execute()"
            )
        })
        it('creates a table with columns', () => {
            const template = generateTemplate('create_todo', [
                'id:uuid',
                'name:string',
            ]).getTemplate()
            expect(template).toContain(
                "await db.schema\n\t\t.createTable('todo')\n\t\t.addColumn('id', 'uuid')\n\t\t.addColumn('name', 'string')\n\t\t.execute()"
            )
            expect(template).toContain(
                "await db.schema\n\t\t.dropTable('todo')\n\t\t.execute()"
            )
        })
        it('creates a table with multiple columns', () => {
            const template = generateTemplate('create_todo', [
                'id:uuid',
                'name:string',
                'complete:boolean',
            ]).getTemplate()
            expect(template).toContain(
                "await db.schema\n\t\t.createTable('todo')\n\t\t.addColumn('id', 'uuid')\n\t\t.addColumn('name', 'string')\n\t\t.addColumn('complete', 'boolean')\n\t\t.execute()"
            )
            expect(template).toContain(
                "await db.schema\n\t\t.dropTable('todo')\n\t\t.execute()"
            )
        })
    })
    describe('AddFields', () => {
        it('adds a column', () => {
            const template = generateTemplate('add_complete_to_todo', [
                'complete:boolean',
            ]).getTemplate()
            expect(template).toContain(
                "await db.schema\n\t\t.alterTable('todo')\n\t\t.addColumn('complete', 'boolean')\n\t\t.execute()"
            )
            expect(template).toContain(
                "await db.schema\n\t\t.alterTable('todo')\n\t\t.dropColumn('complete')\n\t\t.execute()"
            )
        })
        it('adds multiple columns', () => {
            const template = generateTemplate('add_complete_to_todo', [
                'complete:boolean',
                'name:string',
            ]).getTemplate()
            expect(template).toContain(
                "await db.schema\n\t\t.alterTable('todo')\n\t\t.addColumn('complete', 'boolean')\n\t\t.addColumn('name', 'string')\n\t\t.execute()"
            )
            expect(template).toContain(
                "await db.schema\n\t\t.alterTable('todo')\n\t\t.dropColumn('name')\n\t\t.dropColumn('complete')\n\t\t.execute()"
            )
        })
        it('adds a column with not null', () => {
            const template = generateTemplate('add_complete_to_todo', [
                'complete:boolean:not_null',
            ]).getTemplate()

            expect(template).toContain(
                "await db.schema\n\t\t.alterTable('todo')\n\t\t.addColumn('complete', 'boolean', (col) => col.notNull())\n\t\t.execute()"
            )
            expect(template).toContain(
                "await db.schema\n\t\t.alterTable('todo')\n\t\t.dropColumn('complete')\n\t\t.execute()"
            )
        })
        it('adds an end if cant find the action', () => {
            const template = generateTemplate('do_stuff', []).getTemplate()
            expect(template).toContain(
                "import { Migration } from 'kysely'\n\nexport const up: Migration['up'] = async (db) => {\n}\n\nexport const down: Migration['down'] = async (db) => {\n}\n\n"
            )
        })
    })
})
