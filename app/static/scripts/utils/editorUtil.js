'use strict';

/**
 * TODO: доработать модуль под нужды проекта,
 * выпилить все ненужное
 *
 * Модуль текстового редактора
 *
 * За основу брался редактор https://github.com/mindmup/bootstrap-wysiwyg
 *
 * @module EditorUtil
 */

define([
    'jquery',
    'underscore',
    'simpleClass',
    'utils/widgets',
    'bootstrap',
    'prettify',
    'jquery.hotkeys',
    'jquery.fileupload'
], function ($, _, Class, Widgets) {
    return Class.extend({

        /**
         * Свойство, указывающие, что созданный объект - это редактор
         *
         * @public
         * @field
         * @name  EditorUtil#isEditor
         * @type {boolean}
         */
        isEditor: true,

        /**
         * Дефолтные настройки редактора
         *
         * @private
         * @field
         * @name EditorUtil#_defaults
         * @type {Object}
         */
        _defaults: {
            hotKeys: {
                'ctrl+b meta+b': 'bold',
                'ctrl+i meta+i': 'italic',
                'ctrl+u meta+u': 'underline',
                'ctrl+z meta+z': 'undo',
                'ctrl+y meta+y meta+shift+z': 'redo',
                'ctrl+l meta+l': 'justifyleft',
                'ctrl+r meta+r': 'justifyright',
                'ctrl+e meta+e': 'justifycenter',
                'ctrl+j meta+j': 'justifyfull',
                'shift+tab': 'outdent',
                'tab': 'indent'
            },
            toolbarSelector: '[data-role=editor-toolbar]',
            commandRole: 'edit',
            activeToolbarClass: 'btn-info',
            selectionMarker: 'edit-focus-marker',
            selectionColor: 'darkgrey'
        },

        /**
         * Селектор кнопок редактора
         *
         * @method
         * @name EditorUtil#_toolbarBtnSelector
         * @type {String|null}
         */
        _toolbarBtnSelector: null,

        /**
         * Ссылка на элемент редактора
         *
         * @field
         * @name EditorUtil#editorElement
         * @type {jQuery|null}
         */
        editorElement: null,

        /**
         * Ссылка на элемент панели управления редактором
         *
         * @private
         * @field
         * @name EditorUtil#_toolbarElement
         * @type {jQuery|null}
         */
        _toolbarElement: null,


        /**
         * Настройки редактора
         *
         * @field
         * @name EditorUtil#options
         * @type {Object|null}
         */
        options: null,

        /**
         *
         * @private
         * @field
         * @name EditorUtil#options
         * @type {}
         */
        _selectedRange: null,

        /**
         * @constructor
         * @name EditorUtil#initialize
         * @param {jQuery} editor ссылка на элемент редактора
         * @param {jQuery} toolbar сслыка на элемент панели управления
         * @param {Object} options параметры редактора
         * @returns {undefined}
         */
        initialize: function (editor, toolbar, options) {
            this.editorElement = editor;
            this._toolbarElement = toolbar;
            this.options = _.extend(this._defaults, options);
            this._toolbarBtnSelector = 'a[data-' +
                this.options.commandRole +
                '],button[data-' +
                this.options.commandRole +
                '],input[type=button][data-' +
                this.options.commandRole + ']';

            this.bindHotKeys(this.options.hotKeys);
            this.bindToolbar();

            editor.attr('contenteditable', true)
                .on('mouseup keyup mouseout', _.bind(function () {
                    this.saveSelection();
                    this.updateToolbar();
                }, this));

            $(window).bind('touchend', _.bind(function (event) {
                var isInside = (editor.is(event.target) || editor.has(event.target).length > 0),
                    currentRange = this.getCurrentRange(),
                    clear = currentRange && (currentRange.startContainer === currentRange.endContainer &&
                        currentRange.startOffset === currentRange.endOffset);

                if (!clear || isInside) {
                    this.saveSelection();
                    this.updateToolbar();
                }
            }, this));
        },

        /**
         * Метод возвращает очищенное тело редактора
         *
         * @method
         * @name EditorUtil#cleanHtml
         * @returns {string}
         */
        cleanHtml: function () {
            var html = this.editorElement.html();
            return html && html.replace(/(<br>|\s|<div>(<br>|\s|&nbsp;)*<\/div>|&nbsp;)*$/, '');
        },

        /**
         * TODO: доработать комментарий
         *
         * Метод делает активной или неактивной панель
         *
         * @method
         * @name EditorUtil#updateToolbar
         * @returns {undefined}
         */
        updateToolbar: function () {
            if (this.options.activeToolbarClass) {
                this._toolbarElement.find(this._toolbarBtnSelector).each(_.bind(function () {
                    var command = this.editorElement.data(this.options.commandRole);
                    if (document.queryCommandState(command)) {
                        this.editorElement.addClass(this.options.activeToolbarClass);
                    } else {
                        this.editorElement.removeClass(this.options.activeToolbarClass);
                    }
                }, this));
            }
        },

        /**
         * TODO: доработать описание параметров
         *
         * Метод для работы с выделенным текстом
         *
         * @method
         * @name EditorUtil#execCommand
         * @param {string} commandWithArgs
         * @param {string} valueArg
         * @returns {undefined}
         */
        execCommand: function (commandWithArgs, valueArg) {
            var commandArr = commandWithArgs.split(' '),
                command = commandArr.shift(),
                args = commandArr.join(' ') + (valueArg || '');

            if(commandWithArgs === 'addLink'){
                $('.js-add-link').modal({show: true});
            } else {
                document.execCommand(command, 0, args);
            }
            this.updateToolbar();
        },

        /**
         * TODO: доработать описание
         *
         * Метод навешивает слушатель на тело редактора
         * Слушает нажатие горячих клавиш
         *
         * @method
         * @name EditorUtil#execCommand
         * @param {Object} hotKeys список горячих клавиш
         * @returns {undefined}
         */
        bindHotKeys: function (hotKeys) {
            $.each(hotKeys, _.bind(function (hotKey, command) {
                this.editorElement.keydown(hotKey, _.bind(function (event) {
                        if (this.editorElement.attr('contenteditable') && this.editorElement.is(':visible')) {
                            event.preventDefault();
                            event.stopPropagation();
                            this.execCommand(command);
                        }
                    }, this)).keyup(hotKey, _.bind(function (event) {
                        if (this.editorElement.attr('contenteditable') && this.editorElement.is(':visible')) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }, this));
            }, this));
        },


        /**
         * TODO: доработать описание
         *
         * @method
         * @name EditorUtil#execCommand
         * @returns {Range|null}
         */
        getCurrentRange: function () {
            var sel = window.getSelection();

            if (sel.getRangeAt && sel.rangeCount) {
                return sel.getRangeAt(0);
            }

            return null;
        },

        /**
         * TODO: доработать описание
         *
         * Сохраняет информацию о выделленой области
         *
         * @method
         * @name EditorUtil#saveSelection
         * @returns {undefined}
         */
        saveSelection: function () {
            this._selectedRange = this.getCurrentRange();
        },

        /**
         * TODO: доработать описание
         *
         * @method
         * @name EditorUtil#restoreSelection
         * @returns {undefined}
         */
        restoreSelection: function () {
            var selection = window.getSelection();
            if (this._selectedRange) {
                try {
                    selection.removeAllRanges();
                } catch (ex) {
                    document.body.createTextRange().select();
                    document.selection.empty();
                }

                selection.addRange(this._selectedRange);
            }
        },

        /**
         * TODO: доработать описание
         *
         * @method
         * @name EditorUtil#markSelection
         * @param {jQuery} input
         * @param {string} color
         * @returns {undefined}
         */
        markSelection: function (input, color) {
            this.restoreSelection();
            if (document.queryCommandSupported('hiliteColor')) {
                document.execCommand('hiliteColor', 0, color || 'transparent');
            }

            this.saveSelection();
            input.data(this.options.selectionMarker, color);
        },

        /**
         * TODO: доработать описание
         *
         * Навишивает слушатели на панель управления
         *
         * @method
         * @name EditorUtil#bindToolbar
         * @returns {undefined}
         */
        bindToolbar: function () {
            var _this = this,
                preloader = $('<img>', {
                    src: '/static/images/preloader.gif',
                    class: 'img-responsive center'
                });

            this._toolbarElement.find(this._toolbarBtnSelector).click(function () {
                var button = $(this);

                _this.restoreSelection();
                _this.editorElement.focus();
                _this.execCommand(button.data(_this.options.commandRole));
                _this.saveSelection();
            });

            this._toolbarElement.find('input[type=text][data-' + this.options.commandRole + ']').
                on('focus',function () {
                    var input = $(this);

                    if (!input.data(_this.options.selectionMarker)) {
                        _this.markSelection(input, _this.options.selectionColor);
                        input.focus();
                    }
                }).
                on('blur', function () {
                    var input = $(this);

                    if (input.data(_this.options.selectionMarker)) {
                        _this.markSelection(input, false);
                    }
                });

            //TODO: блокировать панель до загрузки первого изображения
            //Загруженные картинки не удалять!!!
            this._toolbarElement.find('input[type=file][data-' + _this.options.commandRole + ']').
                fileupload({
                    dataType: 'json',
                    done: function (event, data) {
                        var result = data.result;

                        preloader.remove();

                        if (result.error) {
                            Widgets.showMessages(result.error, 'alert-danger');
                            return;
                        }

                        _this.editorElement.append($('<img>', {
                            src: result.path,
                            class: 'img-responsive'
                        }));
                    }
                }).
                on('change', function () {
                    _this.editorElement.append(preloader);
                });
        }
    });
});