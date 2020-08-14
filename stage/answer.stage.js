// news.stage.js

const Wizard = require('telegraf/scenes/wizard')

// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { keyboard, removeKeyboard } = require('telegraf/markup')

// DataBase User models
const User = require('../models/user.model')

// Scene
const WizardScene = new Wizard('answer-scene', async ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))
    
    let client = await User.findById(ctx.session.send_message_to_id)

    // send message
    ctx.replyWithMarkdown(StringParser.rules(messages['send-to-support']['text'], { client }), keyboard(messages['send-to-support']['button']).oneTime().resize().extra())

    // next scene
    return ctx.wizard.next()

}, async ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    if(!ctx.message.text){
        ctx.reply(messages['send-to-support']['error']['not-text'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    if(ctx.message.text === messages['send-to-support']['button'][0]){
        ctx.reply(messages['send-to-support']['success']['cancel-text'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let client = await User.findById(ctx.session.send_message_to_id)
    if(!client) return ctx.scene.leave()
    
    if(client){
        ctx.telegram.sendMessage(client._id, ctx.message.text)
        ctx.reply(messages['send-to-support']['success']['send'], keyboard(messages.menu.buttons).oneTime().resize().extra())
    }else{
        ctx.reply(messages['send-to-support']['error']['not-client'], keyboard(messages.menu.buttons).oneTime().resize().extra())
    }
    
    return ctx.scene.leave()

})

module.exports = WizardScene