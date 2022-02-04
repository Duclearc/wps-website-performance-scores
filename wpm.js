const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse')
const {URL} = require('url')
const fs = require('fs');

class WPM {
    constructor({targetWebsite, logFilePath}) {
        this.targetWebsite = targetWebsite
        this.logFilePath = logFilePath || './logs/scoreLogs.json'
    }

    async run() {
        if (!this.targetWebsite) return console.log('Please specify a target website in ./config.json');
        const initialReport = await this.getTargetScore()
        const formattedReport = await this.formatReport(initialReport)
        this.saveReportToScoreLog(formattedReport)
        console.log(
            '\n===== YOUR LIGHTHOUSE SCORES =====\n',
            formattedReport,
            '\n=================================='
        )
    }

    async getTargetScore() {
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
        
        const report = lhr.categories

        return report
    }

    getCurrentFormattedDate() {
        const today = new Date()
        const day = today.getDate().toString().length === 2 ? today.getDate(): `0${today.getDate()}`
        const month = today.getMonth().toString().length === 2 ? today.getMonth(): `0${today.getMonth()}`
        const year = today.getFullYear()
        const hour = today.getHours()
        const minutes = today.getMinutes()
        const seconds = today.getSeconds()

        return `${year}.${month}.${day}-${hour}:${minutes}:${seconds}`
    }

    async formatReport(originalReport) {

        const formattedReport = {
            website: this.targetWebsite,
            scoreDate: this.getCurrentFormattedDate()
        }

        for (const category in originalReport) {
            if (Object.hasOwnProperty.call(originalReport, category)) {
                const {id, score} = originalReport[category]
                formattedReport[id.replace(/-/g,'_')] = score
            }
        }

        return formattedReport

    }

    saveReportToScoreLog(formattedReport) {
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