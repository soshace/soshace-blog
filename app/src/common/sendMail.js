'use strict';

var Ejs = require('ejs'),
    Fs = require('fs');

/**
 * Модуль отправки сообщений
 * noreply@soshace.com
 */
var NodeMailer = require('nodemailer'),
    transport = NodeMailer.createTransport('SMTP', {
        service: Soshace.MAIL_SERVICE,
        auth: {
            user: Soshace.MAIL_NO_REPLY,
            pass: Soshace.MAIL_NO_REPLY_PASSWORD
        }
    });

var sendMail = {
    /**
     * Отправляем письмо подтверждения аккаунта
     *
     * @private
     * @function
     * @name sendMail.sendConfirmMail
     * @param {String} mail
     * @param {Object} user
     * @param {Object} i18n объект, содержащий методы для работы с переводами
     * @return {undefined}
     */
    sendConfirmMail: function (mail, user, i18n) {
        var mailTemplatePath = Soshace.DIR_NAME + '/app/views/mail/confirmMailView.ejs',
            mailTemplate = Fs.readFileSync(mailTemplatePath, 'utf8'),
            mailOptions = {
                from: Soshace.MAIL_NO_REPLY,
                to: mail,
                subject: 'Confirm email',
                html: Ejs.render(mailTemplate, {user: user, i18n: i18n})
            };

        transport.sendMail(mailOptions);
    }
};

//Экспортируем методы и переменные
exports.sendConfirmMail = function () {
    sendMail.sendConfirmMail.apply(sendMail, arguments);
};