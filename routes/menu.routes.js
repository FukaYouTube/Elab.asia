// menu.routes.js

const Composer = require('telegraf/composer')
const app = new Composer()

// Lib
const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { keyboard } = require('telegraf/markup')

// Import modules
const MenuModules = require('../source/module/menu.module')
const SettingsModules = require('../source/module/settings.module')

// base commands
app.help(ctx => {
    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))
    ctx.reply(messages.help.text, keyboard(messages.menu.buttons).oneTime().resize().extra())
})

// headers
app.hears(/./gm, (ctx, next) => {
    // import message in file
    let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

    switch(ctx.message.text){
        case messages.menu.buttons[0][0]: MenuModules['user-info'](ctx) // профиль
        break
        case messages.menu.buttons[0][1]: MenuModules['get-diplom'](ctx) // получить сертификат
        break
        case messages.menu.buttons[1][0]: MenuModules['about'](ctx) // о нас
        break
        case messages.menu.buttons[1][1]: MenuModules['contacts'](ctx) // наши контакты
        break
        case messages.menu.buttons[1][2]: MenuModules['location'](ctx) // местоположение
        break
        case messages.menu.buttons[2][0]: MenuModules['faq'](ctx) // вопросы и ответы
        break
        case messages.menu.buttons[2][1]: ctx.scene.enter('help-scene') // тех.поддержка
        break
        case messages.menu.buttons[3][0]: MenuModules['settings'](ctx) // настройки
        break

        // изменить данные
        case messages['user-info'].menu[0][0]: ctx.scene.enter('edit-user-info-scene') // изменить данные
        break
        case messages['user-info'].menu[1][0]: MenuModules['get-elab-card'](ctx)  // получить карту от Elab.asia
        break

        // настройка
        case messages.settings.menu[0][0]: SettingsModules['edit-lang'](ctx) // изменить язык
        break

        // дополнительные
        case messages.menu.back.button: MenuModules['menu-back'](ctx) // кнопка назад
        break

        default: next()
    }
})

module.exports = app