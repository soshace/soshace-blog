'use strict';

/**
 * Вид страницы списка постов
 *
 * @class PostsListView
 */

define([
    'jquery',
    'underscore',
    'backbone',
    './postPreview/postPreviewView'
], function ($, _, Backbone, PostPreviewView) {
    return Backbone.Layout.extend({
        /**
         * Список статей
         *
         * @field
         * @name PostsListView#collection
         * @type {Backbone.Model | null}
         */
        collection: null,

        /**
         * @field
         * @name PostsListView#elements
         * @type {Object}
         */
        elements: {
        },

        /**
         * Путь до шаблона
         *
         * @field
         * @name PostsListView#elements
         * @type {string}
         */
        template: Soshace.hbs['posts/postsList'],

        /**
         * @constructor
         * @name PostsListView#initialize
         * @param {Object} params
         * @returns {undefined}
         */
        initialize: function (params) {
            var $el = params && params.$el;

            if ($el) {
                this.$el = $el;
            }
        },


        /**
         * Метод добавляет вид превью с списку статей
         *
         * @method
         * @name PostsListView#addOneView
         * @param {Backbone.Model} postModel модель статьи
         * @returns {undefined}
         */
        addOneView: function (postModel) {
            var view = new PostPreviewView({
                model: postModel
            });

            this.insertView('.js-posts-list', view);
        },

        /**
         * Метод заполняет список статей
         *
         * @method
         * @name PostsListView#fillPostsList
         * @returns {undefined}
         */
        fillPostsList: function () {
            this.collection.each(_.bind(this.addOneView, this));
        },

        /**
         * @method
         * @name PostsListView#serialize
         * @returns {Object}
         */
        serialize: function(){
            var posts = this.collection.toJSON();

            return {
                posts: posts
            };
        },

        /**
         * @method
         * @name PostsListView#beforeRender
         * @returns {undefined}
         */
        beforeRender: function () {
            this.fillPostsList();
        },

        /**
         * @method
         * @name PostsListView#afterRender
         * @returns {undefined}
         */
        afterRender: function () {
        }
    });
});