import { FormattedReport, InitialReport } from "./models/reports.model";

const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse')
const fs = require('fs');

class WPM {
    targetWebsite: string
    logFilePath: string
    
    constructor({targetWebsite, logFilePath}: { targetWebsite: string, logFilePath: string }) {
        this.targetWebsite = targetWebsite
        this.logFilePath = logFilePath || './logs/scoreLogs.json'
    }

    async run(): Promise<void> {
        if (!this.targetWebsite) return console.log('Please specify a target website in ./config.json');
        const initialReport: InitialReport = await this.getTargetScore()
        const formattedReport: FormattedReport = await this.formatReport(initialReport)
        this.saveReportToScoreLog(formattedReport)
        console.log(
            '\n===== YOUR LIGHTHOUSE SCORES =====\n',
            formattedReport,
            '\n=================================='
        )
    }

    async getTargetScore(): Promise<InitialReport> {
        // Adapted from original at: https://github.com/GoogleChrome/lighthouse/blob/master/docs/puppeteer.md#option-1-launch-chrome-with-puppeteer-and-handoff-to-lighthouse

        // Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
        })
        
        // Lighthouse will open the URL.
        // Puppeteer will observe `targetchanged` and inject our stylesheet.
        const {lhr} = await lighthouse(this.targetWebsite, {
          port: (new URL(browser.wsEndpoint())).port,
          output: 'json',
          logLevel: 'info',
        })
        
        await browser.close()
        
        const report: InitialReport = lhr.categories

        return report
    }

    getCurrentFormattedDate(): string {
        const today = new Date()
        const day = today.getDate().toString().length === 2 ? today.getDate(): `0${today.getDate()}`
        const month = today.getMonth().toString().length === 2 ? today.getMonth(): `0${today.getMonth()}`
        const year = today.getFullYear()
        const hour = today.getHours()
        const minutes = today.getMinutes()
        const seconds = today.getSeconds()

        return `${year}.${month}.${day}-${hour}:${minutes}:${seconds}`
    }

    async formatReport(initialReport: InitialReport): Promise<FormattedReport> {

        const formattedReport: any = {
            website: this.targetWebsite,
            scoreDate: this.getCurrentFormattedDate()
        }

        for (const category in initialReport) {
            if (Object.hasOwnProperty.call(initialReport, category)) {
                const {id, score}: { id: string, score: number } = (initialReport as any)[category]
                formattedReport[id.replace(/-/g,'_')] = score
            }
        }

        const finalReport: FormattedReport = formattedReport

        return finalReport

    }

    saveReportToScoreLog(formattedReport: FormattedReport): void {
        try {
            fs.appendFileSync(
                this.logFilePath,
                `${JSON.stringify(formattedReport)},\n`,
            )
        }
        catch (error) {
         console.log(error)
        }
    }
}

module.exports = WPM