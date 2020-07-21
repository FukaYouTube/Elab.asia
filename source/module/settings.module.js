// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { inlineKeyboard, callbackButton, keyboard } = require('telegraf/markup')

module.exports = {
    'edit-lang': ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

        ctx.reply(messages.settings.language['lang-edit'], inlineKeyboard([
            callbackButton(messages.settings.language.langs[0], 'rus-lang-not-new-user'),
            callbackButton(messages.settings.language.langs[1], 'kaz-lang-not-new-user'),
        ]).extra())
    }
}