// v3
# WPS - Website Performance Scores
# Description
- Website Performance Scores (WPS) is a Puppeteer-based library developed in order to measure the performance of a website using WebVitals scores (like Lighthouse).

# Concept
- this is a prototype
- [NPM package page](https://www.npmjs.com/package/wps-website-performance-scores)
- [Git Repo](https://github.com/Duclearc/wps-website-performance-scores)
- **GOAL:** feed this a webpage (through a `config.js` file) and WPS should return it's WebVitals (through Lighthouse) score
- **STACK:**
    - [Puppeteer](https://pptr.dev/)
    - [Lighthouse](https://developers.google.com/web/tools/lighthouse)

# Usage
- go to `config.json` and set your `targetWebsite`
- on your terminal, navigate to the root and use `npm start` to initialise the process
- the console will show your lighthouse scores. They will also be available in the `./logs/scoreLogs.json` file (or whichever file you've determined in the `logFilePath` in `config.json`)

# Dataflow
- `main.js`
    - instantiates WPS with `./config.json` and immediately runs it
- `wps.js`
    - `constructor()`from the class `wps` deconstructs the data `targetWebsite` and `logFilePath` from `./config.json` and saves it for internal use
    - `run()` method is activated
    - `getTargetScore()` method is activated
        - uses puppeteer to launch the browser
        - calls on lighthouse to use the browser and load the URL to extract json info
        - closes browser
        - gets relevant data (`report`)
        - returns `report`
    - `run()` saves `report` as `initialReport`
    - `formatReport()` method is activated
        - filters only the `id`s and its `scores`
        - saved them as an object formatted as `{ id: score }`
        - returns that object with all `id`s and its respective scores (`formattedReport`)
    - `run()` saves `formattedReport` and passes it on for local saving
    - `saveReportToScoreLog()` method gets activated
        - it uses the [FileSystem API](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem)(`fs`) to append the `formattedReport` to the file under `logFilePath` (set in `./config.json`)
    `run()` displays `formattedReport` in the console to signalise the operation is complete

# example data returned from `formatReport()`
```
 {
  website: 'https://www.google.com/',
  scoreDate: '2022.01.03-19:1:40',
  performance: 0.32,
  accessibility: 0.7,
  best_practices: 0.75,
  seo: 0.85,
  pwa: 0.3
} 
```

# example data returned from `getTargetScore()`
```
{
    performance: {
      title: 'Performance',
      supportedModes: [Array],
      auditRefs: [Array],
      id: 'performance',
      score: 0.31
    },
    accessibility: {
      title: 'Accessibility',
      description: 'These checks highlight opportunities to [improve the accessibility of your web app](https://developers.google.com/web/fundamentals/accessibility). Only a subset of accessibility issues can be automatically detected so manual testing is also encouraged.',
      manualDescription: 'These items address areas which an automated testing tool cannot cover. Learn more in our guide on [conducting an accessibility review](https://developers.google.com/web/fundamentals/accessibility/how-to-review).',
      supportedModes: [Array],
      auditRefs: [Array],
      id: 'accessibility',
      score: 0.7
    },
    'best-practices': {
      title: 'Best Practices',
      supportedModes: [Array],
      auditRefs: [Array],
      id: 'best-practices',
      score: 0.75
    },
    seo: {
      title: 'SEO',
      description: 'These checks ensure that your page is following basic search engine optimization advice. There are many additional factors Lighthouse does not score here that may affect your search ranking, including performance on [Core Web Vitals](https://web.dev/learn-web-vitals/). [Learn more](https://support.google.com/webmasters/answer/35769).',
      manualDescription: 'Run these additional validators on your site to check additional SEO best practices.',
      supportedModes: [Array],
      auditRefs: [Array],
      id: 'seo',
      score: 0.85
    },
    pwa: {
      title: 'PWA',
      description: 'These checks validate the aspects of a Progressive Web App. [Learn more](https://developers.google.com/web/progressive-web-apps/checklist).',
      manualDescription: "These checks are required by the baseline [PWA Checklist](https://developers.google.com/web/progressive-web-apps/checklist) but are not automatically checked by Lighthouse. They do not affect your score but it's important that you verify them manually.",
      supportedModes: [Array],
      auditRefs: [Array],
      id: 'pwa',
      score: 0.3
    }
}
```
