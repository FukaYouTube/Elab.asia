// auth.stage.js

const Wizard = require('telegraf/scenes/wizard')

// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_LOGIN,
        pass: process.env.EMAIL_PASS
    }
})

// Import modules
const APIRequest = require('../source/module/api.module')

// Regex email
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

// Scene
const WizardScene = new Wizard('login-scene', ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    // send message
    ctx.replyWithMarkdown(StringParser.rules(messages.welcome['new-user'], { user: ctx.from }))

    // next scene
    return ctx.wizard.next()

}, async ctx => {

    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
    let messagesEmail = yaml.safeLoad(fs.readFileSync(`source/languages/email/${ctx.session.lang || 'ru'}.lang.yml`))

    // chekced messages
    if(!ctx.message.text){
        ctx.reply(messages['import-data-users']['error']['this-not-message'])
        return ctx.scene.leave()
    }

    // chekced email
    if(!emailRegex.test(ctx.message.text)){
        ctx.reply(messages['import-data-users']['error']['this-not-email'])
        return ctx.scene.leave()
    }

    await ctx.reply(messages['import-data-users']['info']['loading-text'])

    // API request
    APIRequest['get-api-request'](ctx.message.text).then(data => { 
        if(!data){
            ctx.reply(StringParser.rules(messages['import-data-users']['error']['not-found-email'], { email: ctx.message.text }))
            return ctx.scene.leave()
        }

        ctx.session.email = {
            code: Math.floor(1000 + Math.random() * 9000) + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10),
            mail: ctx.message.text
        }

        transporter.sendMail({
            from: process.env.EMAIL_LOGIN,
            to: ctx.message.text,
            subject: messagesEmail.email.subject,
            text: StringParser.rules(messagesEmail.email.text, { user: ctx.from, url: `https://t.me/ElabAsiaBot?start=email_accountActivation-${ctx.session.email.code}` })
        }).catch(error => console.log(error))

        ctx.reply(messagesEmail.email['success']['send-messages'])
        return ctx.scene.leave()
    })
})

module.exports = WizardScene