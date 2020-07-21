/*  ©
    Created date: 17.07.2020
    By: Fuka
    For: Elab.asia
*/

require('dotenv').config()

// MongoDB
const mongoose = require('mongoose').connect(process.env.URI_MONGO, { useNewUrlParser: true,  useUnifiedTopology: true })
mongoose.catch(error => console.log(error)).then(() => console.log('Connecting to database'))

// Telegraf
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const stage = require('./stage')

// Application
const app = new Telegraf(process.env.BOT_TOKEN)

// Import modules
const MenuModules = require('./source/module/menu.module')

// Middelware
app.use(session())
app.use(stage)

// Used routers
const main_router = require('./routes/main.routes')
app.use(main_router)

const menu_router = require('./routes/menu.routes')
app.use(menu_router)

const admin_router = require('./routes/admin.routes')
app.use(admin_router)

// Command not found
app.hears(/./gm, ctx => MenuModules['not-found-commands'](ctx))

// Starting telegram bot
app.startPolling()