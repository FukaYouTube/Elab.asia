const WizardScene = require('telegraf/scenes/wizard')

// ...
const fs = require('fs')
const jsYAML = require('js-yaml')

// telegraf
const { keyboard, removeKeyboard } = require('telegraf/markup')

// User model
const User = require('../models/user.model')

// regex
const iin_regex = /^((0[48]|[2468][048]|[13579][26])0229[1-6]|000229[34]|\d\d((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[469]|11)(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8]))[1-6])\d{5}$/gm

// scene
let scene = new WizardScene('auth-scene', ctx => {

    let message = jsYAML.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    ctx.session.reguster_users = []
    ctx.replyWithMarkdown(message.welcome['new-user']['1-scene'], removeKeyboard().oneTime().resize().extra())
    
    return ctx.wizard.next()

}, ctx => {

    let message = jsYAML.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    ctx.session.reguster_users.push([ctx.message.text.split(' ')])
    ctx.replyWithMarkdown(message.welcome['new-user']['2-scene'])

    return ctx.wizard.next()

}, ctx => {

    let message = jsYAML.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    if(iin_regex.test(ctx.message.text.split(/[\s\n]/g)[0]) && Number(ctx.message.text.split(/[\s\n]/g)[1]) && ctx.message.text.split(/[\s\n]/g)[2]){
        ctx.session.reguster_users.push([ctx.message.text.split(/[\s\n]/g)])
        ctx.replyWithMarkdown(message.welcome['new-user']['3-scene'], keyboard(message.welcome['new-user'].buttons[0]).oneTime().resize().extra())
        return ctx.wizard.next()
    }else{
        ctx.replyWithMarkdown(message.welcome['new-user'].error['error-2-scene'])
        return ctx.scene.leave()
    }

}, ctx => {

    let message = jsYAML.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    ctx.replyWithMarkdown(message.welcome['new-user']['4-scene'], keyboard(message.welcome['new-user'].buttons[1]).oneTime().resize().extra())
    return ctx.wizard.next()

}, async ctx => {

    let message = jsYAML.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    let user = new User({
        _id: ctx.from.id,
        telegram_username: ctx.from.username,
        telegram_first_name: ctx.from.first_name,
        client_first_name: ctx.session.reguster_users[0][0][0],
        client_last_name: ctx.session.reguster_users[0][0][1],
        client_iin: ctx.session.reguster_users[1][0][0],
        client_phone: ctx.session.reguster_users[1][0][1],
        client_email: ctx.session.reguster_users[1][0][2],
        elab_card: ctx.message.text
    })
    user.save()

    ctx.replyWithMarkdown(message.welcome['new-user'].done['success-register-user'], keyboard(message.menu.buttons).oneTime().resize().extra())
    ctx.scene.leave()

})

module.exports = scene