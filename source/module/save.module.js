// Lib
const got = require('got')

const fs = require('fs')
const yaml = require('js-yaml')
const { StringParser } = require('string-compiler')

// Telegraf lib
const { inlineKeyboard, callbackButton, keyboard } = require('telegraf/markup')

// DataBase User models
const User = require('../../models/user.model')

// Admin data
let admin_data = []

module.exports = {
    'save-client-to-database': async (ctx, secret_code) => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

        if(ctx.session.email && ctx.session.email.code === secret_code.split('-')[1]){
            await ctx.reply(messages['import-data-users']['info']['loading-text'])

            try {
                const response = await got(process.env.API_URL)
                ctx.session.userDate = []

                for(clients of JSON.parse(response.body))
                    if(clients.email === ctx.session.email.mail)
                        ctx.session.userDate.push(clients)
            }catch(error){
                console.log(error)
            }

            let user = new User({
                _id: ctx.from.id,
                telegram_username: ctx.from.username,
                telegram_first_name: ctx.from.first_name,

                client_id: +ctx.session.userDate[0].client_id,
                client_email: ctx.session.userDate[0].email,
                client_phone: ctx.session.userDate[0].phone,
                client_first_name: ctx.session.userDate[0].firstname,
                client_last_name: ctx.session.userDate[0].lastname,
                client_app_data: ctx.session.userDate[0].app_date,
                client_app_number: ctx.session.userDate[0].token,
                client_lang: ctx.session.userDate[0].lang,
                client_app_id: +ctx.session.userDate[0].appid
            })
            
            for(course of ctx.session.userDate){
                user.course.push({
                    course_id: course.course_id,
                    course_name: course.course_name,
                    course_amount: course.amount,
                    course_is_paid: course.ispaid,
                    course_is_deleted: course.isdeleted
                })
            }

            user.save()
            ctx.replyWithMarkdown(StringParser.rules(messages['import-data-users']['success']['load-data-users'], { client: user }), keyboard(messages.menu.buttons).oneTime().resize().extra())
            ctx.session.userDate = []
        }
    },
    'update-course': async ctx => {
        // import message in file
        let messages = yaml.safeLoad(fs.readFileSync(`source/languages/${ctx.session.lang || 'ru'}.lang.yml`))

        let user = await User.findById(ctx.from.id)

        try {
            const response = await got(process.env.API_URL)
            ctx.session.userDate = []

            for(clients of JSON.parse(response.body))
                if(clients.email === user.client_email)
                    ctx.session.userDate.push(clients)
        }catch(error){
            console.log(error)
        }

        for(course of ctx.session.userDate){
            user.course.push({
                course_id: course.course_id,
                course_name: course.course_name,
                course_amount: course.amount,
                course_is_paid: course.ispaid,
                course_is_deleted: course.isdeleted
            })
        }

        user.save()
        ctx.replyWithMarkdown(StringParser.rules(messages['import-data-users']['success']['upload-data-users']), keyboard(messages.menu.buttons).oneTime().resize().extra())
        ctx.session.userDate = []
    },
    'access-to-admin-panels': (ctx, secret_code) => {
        if(secret_code.split('-')[1] == 12345678){
            admin_data.push(ctx.from)

            ctx.telegram.sendMessage(process.env.DEVELOPER_ID_TELEGRAM, `Данный пользователь ${ctx.from.first_name} отправил/а запрос на доступ к панели администратора`, inlineKeyboard([
                callbackButton('Одобрить запрос', `approve_request_id-${ctx.from.id}`),
                callbackButton('Отклонить запрос', `not_approve_request_id-${ctx.from.id}`)
            ]).extra())
            ctx.reply('Ваш запрос был отправлен администратору, ожидайте ответа... (это займет некоторое время)')
        }
    },
    'save-admin': async (ctx, user_id) => {
        let user = await User.findById(user_id)

        for(users of admin_data){
            if(users.id == user_id){
                if(!user){
                    user = new User({
                        _id: users.id,
                        telegram_username: users.username,
                        telegram_first_name: users.first_name,
                        _is_admin: true
                    })
                    user.save()
                }else{
                    user._is_admin = true
                    user.save()
                }
        
                ctx.telegram.sendMessage(user._id, 'Вы теперь являетесь администратором, отправьте команду /panels для перехода к панелю администратора')
                
                let index = admin_data.findIndex(n => n.id === users.id)
                admin_data.splice(index, 1)
            }
        }
    }
}