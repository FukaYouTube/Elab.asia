const { Schema, model } = require('mongoose')

let userSchema = new Schema({
    _id:                    { type: Number, required: true }, // Номер клиента в телеграме
    telegram_username:      String, // Юзер клиента в телеграме
    telegram_first_name:    String, // Ник клиента в телеграме

    client_id:              Number, // Номер клиента
    client_email:           String, // Почта клиента
    client_phone:           String, // Номер телефона клиента
    client_first_name:      String, // Имя клиента
    client_last_name:       String, // Фамилия клиента
    client_app_data:        String, // Дата публикаций клиента
    client_app_number:      String, // Номер заявки клиента
    client_lang:            String, // Язык
    client_app_id:          Number, // ХЗ что это
    
    course:                 [{}], // Массив с курсами
    
    _is_admin:              { type: Boolean, default: false }, // Админ
    _is_black_list:         { type: Boolean, default: false }, // Черный список
    data:                   { type: Date, default: Date.now } // Дата записи в базу данных
})

module.exports = model('User', userSchema)