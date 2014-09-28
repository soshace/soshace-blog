'use strict';

(function (Soshace) {
    var _ = Soshace._;

    /**
     * Модель статьи
     *
     * @class Soshace.models.PostModel
     */
    Soshace.models.PostModel = Soshace.core.Model.extend({
        /**
         * @field
         * @name Soshace.models.PostModel#idAttribute
         * @type {string}
         */
        idAttribute: '_id',

        /**
         * @field
         * @name Soshace.models.PostModel#default
         * @type {string | null}
         */
        default: {
            _id: null,
            locale: null,
            //Загловок поста
            title: null,
            //Отправлена, опубликована
            status: null,
            //Категория, используется в урлах
            category: null,
            //Тело поста
            body: null
        },

        /**
         * Список статусов статьи
         *
         * @field
         * @name Soshace.models.PostModel#statuses
         * @type {Object}
         */
        statuses: {
            saved: {
                title: 'Post saved',
                class: 'label-default',
                editorEnable: true
            },
            //Данный статус есть только на клиенте
            editing: {
                title: 'Post is editing...',
                class: 'label-default',
                editorEnable: true
            },
            sent: {
                title: 'Post sent',
                class: 'label-primary',
                //Статья недоступня для редактирования
                editorEnable: false,
                //Причина недоступности статьи
                editorMessage: 'While our editors are checking the article you can&#39;t to edit it.',
                statusMessage: 'messages/postSent'
            },
            published: {
                title: 'Post published',
                class: 'label-success',
                editorEnable: false,
                //Причина недоступности статьи
                editorMessage: 'After publication you can&#39;t to edit or delete the article.',
                statusMessage: 'messages/postPublished'
            },
            denied: {
                title: 'Publication denied',
                class: 'label-danger',
                editorEnable: true,
                statusMessage: 'messages/postDenied'
            },
            comments: {
                title: 'Some comments',
                class: 'label-warning',
                editorEnable: true,
                statusMessage: 'messages/postHasComments'
            }
        },

        /**
         * @method
         * @name Soshace.models.PostModel#url
         * @returns {string}
         */
        url: function () {
            var url = Soshace.urls.api.post,
                _id = this.get('_id');

            if (_id) {
                return url.replace('0', _id);
            }

            return url.replace('0', '');
        },

        /**
         * @constructor
         * @name Soshace.models.PostModel#initialize
         * @returns {undefined}
         */
        initialize: function () {
            this.set('locale', Soshace.helpers.getLocale(), {silent: true});
        },

        /**
         * Метод патчит модель, если модель уже создана.
         * Содает новую, если модели нет.
         * Удаляет модель, если приходят пустые значения на запись
         *
         * @method
         * @name Soshace.models.PostModel#patchModel
         * @returns {undefined}
         */
        patchModel: function () {
            var _this = this,
                data = this.changed,
                options = {
                    silent: true,
                    success: _.bind(_this.modelSaveSuccess, _this),
                    error: _.bind(_this.modelSaveFail, _this)
                };

            if (this.isNew()) {
                data.status = 'saved';
            } else {
                options.patch = true;
            }

            this.save(data, options);
        },

        /**
         * Метод обработчик успешного сохранения модели в базе
         *
         * @method
         * @name Soshace.models.PostModel#modelSaveSuccess
         * @param {Backbone.Model} model текущая модель
         * @param {Object} response ответ сервера
         * @returns {undefined}
         */
        modelSaveSuccess: function (model, response) {
            var created = response.created,
                post,
                postId,
                locale = this.get('locale'),
                postUrl;

            if (created) {
                post = response.post;
                postId = post._id;
                this.set(post, {silent: true});
                postUrl = '/' + locale + '/posts/' + postId + '/edit';
                Soshace.app.history.navigate(postUrl);
                this.trigger('postCreated');
                return;
            }

            this.trigger('postPatched');
        },

        /**
         * Метод неудачного сохранения модели в базе
         *
         * @method
         * @name Soshace.models.PostModel#modelSaveFail
         * @returns {undefined}
         */
        modelSaveFail: function () {

        },

        /**
         * Метод устанавливает значение в модели по умолчанию
         *
         * @method
         * @name Soshace.models.PostModel#setToDefault
         * @returns {undefined}
         */
        setToDefault: function () {
            this.set(this.default, {silent: true});
            this.set('locale', Soshace.helpers.getLocale(), {silent: true});
        },

        /**
         * Метод получает статью
         *
         * @method
         * @name Soshace.models.PostModel#initialize
         * @param {string} [postId] id поста
         * @returns {Soshace.core.Deferred}
         */
        getPost: function (postId) {
            if (typeof postId === 'string') {
                this.set('_id', postId, {silent: true});
                return this.fetch({silent: true});
            }

            this.setToDefault();
            return Soshace.core.deferred().resolve();
        }
    });
})(window.Soshace);