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
const WizardScene = new Wizard('news-scene', ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    // send message
    ctx.replyWithMarkdown(messages['news-post']['text'], keyboard(messages['news-post']['button']).oneTime().resize().extra())

    // next scene
    return ctx.wizard.next()

}, async ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    if(ctx.message.text === messages['news-post']['button'][0]){
        ctx.reply(messages['news-post']['cancel-text'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let clients = await User.find({})
    
    for(client of clients){
        if(ctx.message.photo){
            ctx.telegram.sendPhoto(client._id, ctx.message.photo[2].file_id, { caption: ctx.message.caption })
        }else if(ctx.message.text){
            ctx.telegram.sendMessage(client._id, ctx.message.text)
        }else if(ctx.message.video){
            ctx.telegram.sendVideo(client._id, ctx.message.video.file_id, { caption: ctx.message.caption })
        }
    }

    ctx.reply(messages['news-post']['success-send'], keyboard(messages.menu.buttons).oneTime().resize().extra())
    return ctx.scene.leave()

})

module.exports = WizardScene