const WPM = require('./wpm')
const config = require('./config.json')

const wpm = new WPM(config).run()

module.exports = wpm