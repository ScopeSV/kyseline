import { describe, expect, it, vi, afterEach } from 'vitest'
import { ConfigParser } from './configParser'
import fs from 'fs'

describe('ConfigParser', () => {
    afterEach(() => {
        vi.resetModules()
    })
    it('Should read the test file', () => {
        vi.mock('fs')
        vi.mocked(fs.existsSync).mockReturnValue(true)
        vi.mocked(fs.readFileSync).mockReturnValue(
            JSON.stringify({ migrationDir: 'migrations' })
        )

        const parser = new ConfigParser()

        expect(parser.getConfig()).toEqual({ migrationDir: 'migrations' })
    })
    it('Handles absence of config file', () => {
        vi.mock('fs')
        vi.mocked(fs.existsSync).mockReturnValue(true)
        vi.mocked(fs.readFileSync).mockReturnValue(() => {})

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
            return undefined as never
        })

        new ConfigParser()

        expect(exitSpy).toHaveBeenCalledWith(1)
    })
    it('Handles invalid config file', () => {
        vi.mock('fs')
        vi.mocked(fs.existsSync).mockReturnValue(true)
        vi.mocked(fs.readFileSync).mockReturnValue('invalid json')

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
            return undefined as never
        })

        new ConfigParser()

        expect(exitSpy).toHaveBeenCalledWith(1)
    })
})
