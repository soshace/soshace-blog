'use strict';

var Mongoose = require('mongoose'),
    Bcrypt = require('bcrypt');

/**
 * Класс для работы с моделью пользователей
 *
 * @class
 * @name UsersShema
 * @type {Schema}
 */
var UsersShema = Mongoose.Schema({
    fullName: String,
    email: String,
    isMale: Boolean,
    password: String,
    emailConfirmed: Boolean
});


/**
 * Метод сравнения паролей
 *
 * @method
 * @name UsersShema#comparePassword
 * @param {String} candidatePassword проверяемый пароль
 * @param {Function} callback
 * @returns {undefined}
 */
UsersShema.methods.comparePassword = function (candidatePassword, callback) {
    var currentPassword;
    Bcrypt.compare(candidatePassword, currentPassword, function (error, isMatch) {
        if (error) {
            callback(error);
            return;
        }

        callback(null, isMatch);
    });
};

/**
 * Метод добавления пользователя
 *
 * @method
 * @name UsersShema.addUser
 * @param {Object} userData данные пользователя для записи в базу
 * @param {Function} callback
 * @return {undefined}
 */
UsersShema.statics.addUser = function (userData, callback) {
    if (userData && typeof callback === 'function') {
        this.create(userData, function (error) {
            callback(error);
        });
    }
};

module.exports = mongoose.model('Posts', UsersShema);