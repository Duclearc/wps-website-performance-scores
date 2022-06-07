import { Args, FormattedReport, InitialReport } from "./models/types.model"
import puppeteer, { Browser, Viewport } from 'puppeteer'
import fs from 'fs'
import { Flags } from 'lighthouse/types/externs'

const lighthouse = require('lighthouse');

class WPS {
    targetWebsite: string
    logFilePath: string
    screenshotFilePath: string
    fullDate: boolean
    viewport: Viewport
    imageType: string

    constructor(config: any) {
        this.targetWebsite = config.targetWebsite
        this.logFilePath = config.logFilePath || './logs/scoreLogs.json'
        this.screenshotFilePath = config.screenshotFilePath || './screenshots/'
        this.fullDate = config.fullDate || true
        this.viewport = config.viewport
        this.imageType = config.imageType
    }

    /** Transforms/filters the `initialReport` type into `FormattedReport` */
    async formatReport(initialReport: InitialReport): Promise<FormattedReport> {

        const formattedReport: any = {
            website: this.targetWebsite,
            scoreDate: this.getCurrentFormattedDate()
        }

        for (const category in initialReport) {
            if (Object.hasOwnProperty.call(initialReport, category)) {
                const { id, score }: { id: string, score: number } = (initialReport as any)[category]
                formattedReport[id.replace(/-/g, '_')] = score
            }
        }

        const finalReport: FormattedReport = formattedReport

        return finalReport

    }

    /** Returns the current date formatted as `YYYY.MM.DD-HH:mm:ss` */
    getCurrentFormattedDate(full = this.fullDate): string {
        const today = new Date()
        const day = today.getDate().toString().length === 2 ? today.getDate() : `0${today.getDate()}`
        const month = today.getMonth().toString().length === 2 ? today.getMonth() : `0${today.getMonth()}`
        const year = today.getFullYear()
        const hour = today.getHours()
        const minutes = today.getMinutes()
        const seconds = today.getSeconds()

        const baseDate = `${year}.${month}.${day}`

        return full ? `${baseDate}-${hour}:${minutes}:${seconds}` : baseDate
    }

    /**
     * Lighthouse will open the URL.
     * Puppeteer will observe `targetWebsite` and return the report.
     *
     * @param browser
     * @returns
     */
     async getTargetScore(browser: Browser): Promise<InitialReport> {
        // Adapted from original at: https://github.com/GoogleChrome/lighthouse/blob/master/docs/puppeteer.md#option-1-launch-chrome-with-puppeteer-and-handoff-to-lighthouse

        const flags: Flags = {
            port: +(new URL(browser.wsEndpoint())).port,
            output: 'json',
            logLevel: 'info',
            screenEmulation: {
                disabled: true
            }
        }
        const { lhr } = await lighthouse(this.targetWebsite, flags)

        const report: InitialReport = lhr.categories

        return report
    }

    /** Gets the args (if any) and formats them into an object. */
    processArgs(): Args {
        const argsArray = process.argv.slice(2)
        const argsObj: { [key: string]: any } = {};
        if (argsArray) {
            argsArray.map((value: string) => {
                const separator = value.includes('=') ? '=' : ':'
                const [key, ...val] = value.split(separator)
                if (val.length) argsObj[key] = val.join(separator)
                else argsObj[key] = true
            })
        }
        return argsObj
    }

    /** Runs WPS with the given arguments. */
    async run(): Promise<void> {
        const args = this.processArgs()
        this.setArgs(args)
        if (!this.targetWebsite) throw new Error('Please specify a target website in ./config.json')
        const browser = await this.startBrowser()
        const initialReport: InitialReport = await this.getTargetScore(browser)
        const formattedReport: FormattedReport = await this.formatReport(initialReport)
        this.saveToFolder(formattedReport, this.logFilePath)
        if (args.screenshot) await this.takeScreenshot(browser)
        console.log(
            '\n===== YOUR LIGHTHOUSE SCORES =====\n',
            formattedReport,
            '\n=================================='
        )
        await browser.close()
    }

    /** Saves file to folder */
    saveToFolder(file: FormattedReport, folder: string): void {
        try {
            fs.appendFileSync(
                folder,
                `${JSON.stringify(file)},\n`,
            )
        }
        catch (error) {
            console.log(error)
        }
    }

    /** Sets the data as defined in the `config.json` */
    setArgs(args: Args) {
        if (args.target) this.targetWebsite = (args.target as string)
        if (args.fullDate) this.fullDate = (args.fullDate as boolean)
    }

    /**
     * Use Puppeteer to launch headful Chrome and use the default viewport set in `config.json`.
     */
     async startBrowser(): Promise<Browser> {
        return await puppeteer.launch({
            headless: false,
            defaultViewport: this.viewport
        })
    }

    /** Takes screenshot and saves it to the `screenshots/` folder */
    async takeScreenshot(browser: Browser) {
        const page = await browser.newPage()
        await page.goto(this.targetWebsite)
        let domain: string = new URL(this.targetWebsite).host
        domain = domain.includes('www.') ? domain.split('www.')[1].split('.')[0] : domain.split('.')[0]
        await page.screenshot({
            path: `${this.screenshotFilePath}${this.getCurrentFormattedDate()}_${domain}.${this.imageType}`
            // './screenshots/YYYY.MM.DD-HH:mm:ss_google.png'
        })
    }
}

module.exports = WPS