// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { keyboard } = require('telegraf/markup')

// DataBase User models
const User = require('../../models/user.model')

// Import modules
const SaveToDataBase = require('./save.module')

module.exports = {
    // Errors
    'not-found-commands': ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
        ctx.reply(StringParser.rules(messages['not-found-command'], { text: ctx.message.text }), keyboard(messages.menu.buttons).oneTime().resize().extra())
    },
    // Back to main menu
    'menu-back': ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
        ctx.reply(messages.menu.back.text, keyboard(messages.menu.buttons).oneTime().resize().extra())
    },

    // User information
    'user-info': async ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
        User.findById(ctx.from.id).then(user => ctx.replyWithMarkdown(StringParser.rules(messages['user-info'].text, { user: ctx.from, client: user }), keyboard(messages['user-info'].menu).oneTime().resize().extra()))
    },

    // Course information
    'course-info': async ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

        let user = await User.findById(ctx.from.id)
        
        let message = ''
        for(course of user.course){
            message += StringParser.rules(messages.course.info, { course }) + '\n'
        }

        if(user._is_admin) return ctx.replyWithMarkdown(messages['course']['not-found'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        ctx.replyWithMarkdown(message || messages['course']['not-found'], keyboard(messages.course.menu).oneTime().resize().extra())
    },

    // Get diplom
    'get-diplom': async ctx => {
        ctx.scene.enter('certificate-scene')
    },

    // Get elab card
    'get-elab-card': async ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

        let client = await User.findById(ctx.from.id)

        if(client.elab_card && client.elab_card == 'Да') return ctx.replyWithMarkdown(messages['again-request-elab-card'], keyboard(messages.menu.buttons).oneTime().resize().extra())
        client.elab_card = 'Да'
        client.save()

        let admins = await User.find({ _is_admin: true })
        for(admin of admins){
            ctx.telegram.sendMessage(admin._id, `Новый запрос от ${ctx.from.id} | Клиент желает получить дисконтную карту Elab.asia`)
        }
    },

    // Update data course informations
    'update-data-course': async (ctx, next) => {        
        let user = await User.findById(ctx.from.id)
        if(user._is_admin) return next()

        user.course = []
        user.save()

        SaveToDataBase['update-course'](ctx)
    },

    // Menu
    'location': async ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

        await ctx.telegram.sendLocation(ctx.chat.id, 43.231863, 76.832276)
        ctx.replyWithMarkdown(messages.location, keyboard(messages.menu.buttons).oneTime().resize().extra())
    },
    'contacts': ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
        ctx.replyWithMarkdown(messages.contacts, keyboard(messages.menu.buttons).oneTime().resize().extra())
    },
    'about': ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
        ctx.replyWithMarkdown(messages.about, keyboard(messages.menu.buttons).oneTime().resize().extra())
    },
    'faq': ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
        ctx.replyWithMarkdown(messages['faq-text'], keyboard(messages.menu.buttons).oneTime().resize().extra())
    },

    // Settings
    'settings': ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
        ctx.reply(messages.settings.text, keyboard(messages.settings.menu).oneTime().resize().extra())  
    }
}