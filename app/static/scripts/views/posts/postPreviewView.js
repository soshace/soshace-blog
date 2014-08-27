'use strict';

/**
 * Вид предпросмотра статьи
 *
 * @class PostPreviewView
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.layoutmanager',
    'templates'
], function ($, _, Backbone) {
    return Backbone.Layout.extend({

        /**
         * @field
         * @name PostPreviewView#el
         * @type {Boolean}
         */
        el: false,

        /**
         * Модель деталей статьи
         *
         * @field
         * @name PostPreviewView#model
         * @type {Backbone.Model | null}
         */
        model: null,

        /**
         * @field
         * @name PostPreviewView#elements
         * @type {Object}
         */
        elements: {
            toolbar: null
        },

        /**
         * Путь до шаблона
         *
         * @field
         * @name PostPreviewView#elements
         * @type {string}
         */
        template: Soshace.hbs['partials/postPreview'],

        /**
         * @constructor
         * @name PostPreviewView#initialize
         * @params {Object} params
         * @returns {undefined}
         */
        initialize: function (params) {
            var model = params && params.model;

            if (model) {
                this.model = model;
            }
        },

        /**
         * Метод используется в тех случаях, когда шаблон уже отрендерен
         * Но надо навесить слушатели и выполнить afterRender и т.д.
         *
         * @method
         * @name PostPreviewView#withoutRender
         * @returns {undefined}
         */
        withoutRender: function () {
            this.delegateEvents();
            this.afterRender();
        },

        /**
         * Метод добавляет тулбар к превью статьи,
         * если статья принадлежит пользователю
         *
         * @method
         * @name PostPreviewView#addPostToolBar
         * @returns {undefined}
         */
        addPostToolBar: function () {
            var ownerId = this.model.get('ownerId'),
                app = Soshace.app,
                profile,
                profileId,
                toolbar;

            if (!app.isAuthenticated()) {
                return;
            }

            profile = Soshace.profile;
            profileId = profile._id;

            if (profileId !== ownerId) {
                return;
            }

            toolbar = this.getToolBar();
            this.elements.toolbar.html(toolbar);
        },

        /**
         * Метод возвращает отрендеренный тулбар для превью статьи
         *
         * @method
         * @name PostPreviewView#getToolBar
         * @returns {undefined}
         */
        getToolBar: function () {
            var model = this.model.toJSON(),
                status = this.model.get('status'),
                statusClass = this.model.statuses[status].class,
                cantEdit = status === 'sent' || status === 'published';

            return Soshace.hbs['posts/edit/postPreviewToolbar'](_.extend(model, {
                canEdit: !cantEdit,
                statusClass: statusClass
            }));
        },

        /**
         * Метод сохраняет ссылки на элементы DOM
         *
         * @method
         * @name PostPreviewView#setElements
         * @returns {undefined}
         */
        setElements: function () {
            this.elements.toolbar = this.$('.js-post-preview-toolbar');
        },

        /**
         * @method
         * @name PostPreviewView#afterRender
         * @returns {undefined}
         */
        afterRender: function () {
            this.setElements();
            this.addPostToolBar();
        }
    });
});