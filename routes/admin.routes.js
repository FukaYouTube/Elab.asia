// admin.routes.js

const Composer = require('telegraf/composer')
const app = new Composer()

// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { inlineKeyboard, callbackButton, keyboard } = require('telegraf/markup')

// DataBase User models
const User = require('../models/user.model')

// Import modules
const SaveToDataBase = require('../source/module/save.module')

// Page pagiantion
function paginate(array, page_size, page_number, max_page){
    let keys = []

    if(page_number > 1) keys.push({ text: `\u21e4 1`, callback: '1' })
    if(page_number > 2) keys.push({ text: `\u2190 ${page_number - 1}`, callback: (page_number - 1).toString() })

    keys.push({ text: `\u21A4 ${page_number} \u21A6`, callback: page_number.toString() })

    if(page_number < max_page - 1) keys.push({ text: `${page_number + 1} \u2192`, callback: (page_number + 1).toString() })
    if(page_number < max_page) keys.push({ text: `${max_page} \u21e5`, callback: max_page.toString() })

    return {
        keys,
        arr: array.slice((page_number - 1) * page_size, page_number * page_size)
    }
}

// Commands
app.command('create_secret_code', (ctx, next) => {
    if(ctx.from.id != process.env.DEVELOPER_ID_TELEGRAM) return next()
    ctx.reply(`https://t.me/ElabAsiaBot?start=requestOnAdminPanels_key-12345678`)
})

app.command('panels', async (ctx, next) => {
    let user = await User.findById(ctx.from.id)
    if(!user._is_admin) return next()

    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))
    ctx.reply(StringParser.rules(messages.welcome, { user: ctx.from }), keyboard(messages.menu.buttons).oneTime().resize().extra())
})

app.hears(/view_client\s([^+\"]+)/i, async ctx => {
    let user = await User.findById(ctx.from.id)
    if(!user._is_admin) return next()

    let client = await User.findById(ctx.match[1])
    
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))
    ctx.reply(StringParser.rules(messages['clients-info']['body-more-text'], { client }), keyboard(messages.menu.buttons).oneTime().resize().extra())
})
app.hears(/add_black_list\s([^+\"]+)/i, async ctx => {
    let user = await User.findById(ctx.from.id)
    if(!user._is_admin) return next()

    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    let client = await User.findById(ctx.match[1])
    client._is_black_list = true
    client.save()

    ctx.reply(StringParser(messages['clients-info']['success']['black-list-added'], { client }), keyboard(messages.menu.buttons).oneTime().resize().extra())
})
app.hears(/remove_black_list\s([^+\"]+)/i, async ctx => {
    let user = await User.findById(ctx.from.id)
    if(!user._is_admin) return next()

    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))
    
    let client = await User.findById(ctx.match[1])
    client._is_black_list = false
    client.save()

    ctx.reply(StringParser(messages['clients-info']['success']['black_list-remove'], { client }), keyboard(messages.menu.buttons).oneTime().resize().extra())
})
app.hears(/send_message\s([^+\"]+)/i, async ctx => {
    let user = await User.findById(ctx.from.id)
    if(!user._is_admin) return next()
    
    ctx.session.send_message_to_id = ctx.match[1]
    ctx.scene.enter('answer-scene')
})

// Hears
app.hears(/./gm, async (ctx, next) => {
    let user = await User.findById(ctx.from.id)
    if(!user._is_admin) return next()

    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    switch(ctx.message.text){
        case messages.menu.buttons[0][0]:
            let clients = await User.find({})
            let message = messages['clients-info']['header-text'] + '\n'
            
            paginate(clients, 3, 1, clients.length).arr.map(client => {
                message += StringParser.rules(messages['clients-info']['body-text'], { client }) + '\n'
            })

            ctx.reply(message, inlineKeyboard(paginate(clients, 3, 1, (clients.length / 3 > Math.floor(clients.length / 3) ? Math.floor(clients.length / 3) + 1 : clients.length / 3)).keys.map(b => callbackButton(b.text, b.callback))).extra())
        break
        case messages.menu.buttons[0][1]:
            ctx.scene.enter('client-find-scene')
        break
        case messages.menu.buttons[1][0]:
            let client_certificate = await User.find({ get_certificate: true })
            
            let msg = ''
            for(client of client_certificate){
                for(client_get_certificate of client.get_certificate_list){
                    msg += StringParser.rules(messages['get-certificate'].text, { client, get_certificate_list: client_get_certificate }) + '\n'
                }
            }

            ctx.reply(msg, keyboard(messages.menu.buttons).oneTime().resize().extra())
        break
        case messages.menu.buttons[2][0]:
            ctx.scene.enter('news-scene')
        break
        case messages.menu.buttons[3][0]:
            ctx.reply(StringParser.rules(messages.help, { user: ctx.from }), keyboard(messages.menu.buttons).oneTime().resize().extra())
        break
        default: next()
    }
})

// Actions
app.action(/./gm, (ctx, next) => {
    let callback_query_type = ctx.update.callback_query.data.split('-')

    switch(callback_query_type[0]){
        case 'approve_request_id': SaveToDataBase['save-admin'](ctx, callback_query_type[1])
        break
        case 'not_approve_request_id': ctx.telegram.sendMessage(callback_query_type[1], 'Вам отказали доступ к панель администратора!')
        break
        default: next()
    }
})

app.action(/./gm, async (ctx, next) => {
    let user = await User.findById(ctx.from.id)
    if(!user._is_admin) return next()

    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/admin/${ctx.session.lang || 'ru'}.lang.yml`))

    let clients = await User.find({})
    let message = messages['clients-info']['header-text'] + '\n'

    paginate(clients, 3 , parseInt(ctx.callbackQuery.data), (clients.length / 3 > Math.floor(clients.length / 3) ? Math.floor(clients.length / 3) + 1 : clients.length / 3)).arr.map(client => {
        message += StringParser.rules(messages['clients-info']['body-text'], { client }) + '\n'
    })

    ctx.reply(message, inlineKeyboard(paginate(clients, 3, parseInt(ctx.callbackQuery.data), (clients.length / 3 > Math.floor(clients.length / 3) ? Math.floor(clients.length / 3) + 1 : clients.length / 3)).keys.map(b => callbackButton(b.text, b.callback))).extra())
})

module.exports = app