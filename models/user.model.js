const { Schema, model } = require('mongoose')

let userSchema = new Schema({
    _id:                    { type: Number, required: true }, // Номер клиента в телеграме
    telegram_username:      String, // Юзер клиента в телеграме
    telegram_first_name:    String, // Ник клиента в телеграме

    client_first_name:      String, // Имя клиента
    client_last_name:       String, // Фамилия клиента
    client_iin:             String, // ИИН клиента
    client_phone:           String, // Номер телефона клиента
    client_email:           String, // Почта клиента
    elab_card:              String, // Хочет ли клиент получить карту
    get_certificate:        Boolean, // Хочет ли клиент получить сертификат
    get_certificate_list:   [{}], // Список сертификатов
    
    _is_admin:              { type: Boolean, default: false }, // Админ
    _is_black_list:         { type: Boolean, default: false }, // Черный список
    date:                   { type: Date, default: Date.now } // Дата записи в базу данных
})

module.exports = model('User', userSchema)