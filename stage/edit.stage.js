// edit.stage.js

const Wizard = require('telegraf/scenes/wizard')

// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { keyboard, removeKeyboard } = require('telegraf/markup')

// DataBase User models
const User = require('../models/user.model')

// regex
const iin_regex = /^((0[48]|[2468][048]|[13579][26])0229[1-6]|000229[34]|\d\d((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[469]|11)(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8]))[1-6])\d{5}$/gm
const email_regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

// Scene
const WizardScene = new Wizard('edit-user-info-scene', async ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    // send message
    ctx.replyWithMarkdown(messages['user-info'].edit['q-1'], keyboard(messages['user-info'].edit.menu).oneTime().resize().extra())

    // next scene
    return ctx.wizard.next()

}, ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    // cancel
    if(!ctx.message.text || ctx.message.text === messages['user-info'].edit.menu[3][0]){
        ctx.reply(messages['user-info'].edit.success['cancel-text'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    ctx.session.edit_user_data = ctx.message.text

    switch(ctx.message.text){
        case messages['user-info'].edit.menu[0][0]: // изменить имя
            ctx.reply(messages['user-info'].edit['q-2'][0], keyboard(messages['user-info'].edit['cancel-button']).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[0][1]: // изменить фамилию
            ctx.reply(messages['user-info'].edit['q-2'][1], keyboard(messages['user-info'].edit['cancel-button']).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[1][0]: // изменить ИИН
            ctx.reply(messages['user-info'].edit['q-2'][2], keyboard(messages['user-info'].edit['cancel-button']).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[1][1]: // изменить электронную почту
            ctx.reply(messages['user-info'].edit['q-2'][3], keyboard(messages['user-info'].edit['cancel-button']).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[2][0]: // изменить номер телефона
            ctx.reply(messages['user-info'].edit['q-2'][4], keyboard(messages['user-info'].edit['cancel-button']).oneTime().resize().extra())
        break
    }
    
    return ctx.wizard.next()

}, async ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    // cancel
    if(!ctx.message.text || ctx.message.text === messages['user-info'].edit.menu[3][0]){
        ctx.reply(messages['user-info'].edit.success['cancel-text'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    switch(ctx.session.edit_user_data){
        case messages['user-info'].edit.menu[0][0]: // изменить имя
            await User.findByIdAndUpdate(ctx.from.id, { client_first_name: ctx.message.text })
            ctx.replyWithMarkdown(messages['user-info'].edit.success.saved, keyboard(messages.menu.buttons).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[0][1]: // изменить фамилию
            await User.findByIdAndUpdate(ctx.from.id, { client_last_name: ctx.message.text })
            ctx.replyWithMarkdown(messages['user-info'].edit.success.saved, keyboard(messages.menu.buttons).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[1][0]: // изменить ИИН
            if(!iin_regex.test(ctx.message.text)){
                ctx.replyWithMarkdown(messages['user-info'].edit.error['iin-failed'], keyboard(messages.menu.buttons).oneTime().resize().extra())
                return ctx.scene.leave()
            }

            await User.findByIdAndUpdate(ctx.from.id, { client_iin: ctx.message.text })
            ctx.replyWithMarkdown(messages['user-info'].edit.success.saved, keyboard(messages.menu.buttons).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[1][1]: // изменить электронную почту
            if(!email_regex.test(ctx.message.text)){
                ctx.replyWithMarkdown(messages['user-info'].edit.error['email-failed'], keyboard(messages.menu.buttons).oneTime().resize().extra())
                return ctx.scene.leave()
            }

            await User.findByIdAndUpdate(ctx.from.id, { client_email: ctx.message.text })
            ctx.replyWithMarkdown(messages['user-info'].edit.success.saved, keyboard(messages.menu.buttons).oneTime().resize().extra())
        break
        case messages['user-info'].edit.menu[2][0]: // изменить номер телефона
            if(!Number(ctx.message.text)){
                ctx.replyWithMarkdown(messages['user-info'].edit.error['phone-failed'], keyboard(messages.menu.buttons).oneTime().resize().extra())
                return ctx.scene.leave()
            }

            await User.findByIdAndUpdate(ctx.from.id, { client_phone: ctx.message.text })
            ctx.replyWithMarkdown(messages['user-info'].edit.success.saved, keyboard(messages.menu.buttons).oneTime().resize().extra())
        break
    }

    return ctx.scene.leave()
})

module.exports = WizardScene