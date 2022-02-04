const WPS = require('./wps')
const config = require('./config.json')

const wps = new WPS(config).run()

module.exports = wps