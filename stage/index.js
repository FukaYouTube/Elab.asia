const Stage = require('telegraf/stage')
const stage = new Stage()

stage.register(require('./auth.stage'))
stage.register(require('./news.stage'))
stage.register(require('./help.stage'))
stage.register(require('./answer.stage'))
stage.register(require('./certificate.stage'))

module.exports = stage