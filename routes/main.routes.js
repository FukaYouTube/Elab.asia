// main.routes.js

const Composer = require('telegraf/composer')
const app = new Composer()

// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { inlineKeyboard, callbackButton, keyboard, removeKeyboard } = require('telegraf/markup')

// DataBase User models
const User = require('../models/user.model')

// Import modules
const SaveToDataBase = require('../source/module/save.module')

// Plug for black_list
app.use(async (ctx, next) => {
    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    let user = await User.findById(ctx.from.id)
    if(user && user._is_black_list) return ctx.reply(messages['black-list'], removeKeyboard().oneTime().resize().extra())
    next()
})

app.start(async ctx => {
    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
    
    let user = await User.findById(ctx.from.id)
    if(!user){
        if(!ctx.startPayload){
            ctx.reply('Выберите язык для вашего удобства / Сізге ыңғайлы болу үшін тілді таңдаңыз', inlineKeyboard([
                callbackButton('Русский язык', 'rus-lang'),
                callbackButton('Қазақ тілі', 'kaz-lang')
            ]).extra())
        }else{
            let action = ctx.startPayload.split('_')
            if(action[0] === 'email') return SaveToDataBase['save-client-to-database'](ctx, action[1])
            if(action[0] === 'requestOnAdminPanels') return SaveToDataBase['access-to-admin-panels'](ctx, action[1])
        }
    }else{
        ctx.replyWithMarkdown(StringParser.rules(messages.welcome['old-user'], { client: user }), keyboard(messages.menu.buttons).oneTime().resize().extra())
    }
})

// CallbackQuery action
app.action(/./gm, async (ctx, next) => {
    ctx.deleteMessage()
    ctx.answerCbQuery()

    switch(ctx.update.callback_query.data){
        case 'rus-lang':
            ctx.session.lang = 'ru'
            await ctx.reply('Установлен русский язык! Можно поменять язык в настройках')
            ctx.scene.enter('auth-scene')
        break
        case 'kaz-lang':
            ctx.session.lang = 'kz'
            await ctx.reply('Қазақ тілі орнатылды! Параметрлерде тілді өзгертуге болады')
            ctx.scene.enter('auth-scene')
        break
        case 'rus-lang-not-new-user':
            ctx.session.lang = 'ru'
            let messages_ru = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
            await ctx.reply('Установлен русский язык! Можно поменять язык в настройках', keyboard(messages_ru.menu.buttons).oneTime().resize().extra())
        break
        case 'kaz-lang-not-new-user':
            ctx.session.lang = 'kz'
            let messages_kz = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
            await ctx.reply('Қазақ тілі орнатылды! Параметрлерде тілді өзгертуге болады', keyboard(messages_kz.menu.buttons).oneTime().resize().extra())
        break
        default: next()
    }
})

// Plug
app.use(async (ctx, next) => {
    if(ctx.match){
        let callback_query_type = ctx.match.input.split('-')
        if(callback_query_type[0] == 'approve_request_id' || callback_query_type[0] == 'not_approve_request_id') return next()
    }

    let user = await User.findById(ctx.from.id)
    if(!user) return null
    next()
})

module.exports = app