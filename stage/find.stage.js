const WizardScene = require('telegraf/scenes/wizard')

// ...
const fs = require('fs')
const jsYAML = require('js-yaml')
const { StringParser } = require('string-compiler')

// telegraf
const { keyboard, removeKeyboard } = require('telegraf/markup')

// User model
const User = require('../models/user.model')

// scene
let scene = new WizardScene('client-find-scene', ctx => {

    let messages = jsYAML.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    ctx.replyWithMarkdown(messages['client-find'].text, keyboard(messages['client-find'].buttons).oneTime().resize().extra())
    
    return ctx.wizard.next()

}, async ctx => {

    let messages = jsYAML.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    if(!ctx.message.text || ctx.message.text === messages['client-find'].buttons[0]){
        ctx.reply(messages['client-find']['success']['cancel-text'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let user = await User.find({ $or: [{ client_first_name: ctx.message.text }, { client_last_name: ctx.message.text }] })

    let message = 'List: \n\n'
    for(client of user){        
        message += StringParser.rules(messages['clients-info']['body-more-text'], { client }) + '\n'

        if(client.get_certificate){
            for(course of client.get_certificate_list){
                message += StringParser.rules(messages['clients-info']['course-certificate'], { course }) + '\n'
            }
        }
    }

    ctx.reply(message, keyboard(messages.menu.buttons).oneTime().resize().extra())
    return ctx.scene.leave()

})

module.exports = scene