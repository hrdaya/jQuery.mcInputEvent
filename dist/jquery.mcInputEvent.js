/*!
 * jQuery.mcInputEvent v0.2.0 (http://hrdaya.github.io/jQuery.mcInputEvent/)
 *
 * Copyright 2015 yu-ki higa (https://github.com/hrdaya)
 * Licensed under MIT (https://github.com/hrdaya/jQuery.mcInputEvent/blob/master/LICENSE)
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    // プラグイン名
    var pluginName = 'mcInputEvent';

    // イベント名
    var eventName = 'mcinput';

    // フォーカス時にonにするイベント
    var focusEvents = [
        'blur.' + pluginName,
        'keyup.' + pluginName,
        'compositionstart.' + pluginName,
        'compositionend.' + pluginName
    ];

    // プラグイン本体
    var Plugin = function (elm) {
        this.$elm = $(elm);
        // IME入力中かどうか
        this.isComposition = false;
        // イベント発火時にFunctionに渡す値
        // contenteditableに対応する為にタグのタイプをとりあえずhtmlにする
        this.obj = {
            lastVal: '',
            tagType: 'html'
        };
        // input、textareaの時はタグのタイプをinputに変更
        var tagName = this.$elm.prop('tagName').toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') {
            this.obj.tagType = 'input';
        }
        // 現在の値を最終値としてセット
        this.setLastVal();
    };

    // プラグインのプロトタイプ
    Plugin.prototype = {
        // プラグインのイベント有効化
        on: function () {
            var _this = this;
            // イベントの重複登録を避けるため一旦off
            _this.off();
            // フォーカスを受け取った時に値変更検知のイベントを有効にする
            _this.$elm.on('focus.' + pluginName, function () {
                _this.setFocusEvents();
            });
        },
        // プラグインのイベント無効化
        off: function () {
            // このプラグインのイベントとプラグイン名クラスを持ったイベントを無効化
            this.$elm.off('.' + pluginName);
            $(document).off('.' + pluginName);
        },
        // プラグインの破棄
        destroy: function () {
            // プラグインのイベント無効化
            this.off();
            // エレメントからプラグイン用のデータを削除
            this.$elm.removeData(pluginName);
        },
        // フォーカスを受け取った時に値変更検知のイベントを有効にする
        setFocusEvents: function () {
            var _this = this;
            // コンテキストメニュー等からの値の変更を検知するために
            // documentのselectionchangeイベントを有効にする
            $(document).on('selectionchange.' + pluginName, function () {
                // 擬似的にkeyupイベントを発火する
                _this.$elm.trigger('keyup');
            });
            // keyupとIME入力判定用のイベントを有効にする
            _this.$elm.on(focusEvents.join(' '), function (e) {
                // イベントのタイプごとに処理
                switch (e.type) {
                    case 'blur':
                        // フォーカスが外れた時に値変更検知の為のイベントを無効にする
                        _this.removeFocusEvents();
                        break;
                    case 'keyup':
                        // IME入力時以外で入力前の値と異なる場合
                        if (!_this.isComposition && !_this.isSameVal()) {
                            // プラグインイベントを発火
                            _this.fireEvent();
                        }
                        break;
                    case 'compositionstart':
                        // IME入力中フラグのセット
                        _this.isComposition = true;
                        break;
                    case 'compositionend':
                        // IME入力中フラグのリセット
                        _this.isComposition = false;
                        // IME入力入力終了時に擬似的にkeyupイベントを発火する
                        _this.$elm.trigger('keyup');
                        break;
                }
            });
            // 値のドロップに対する対策の為、擬似的にkeyupイベントを発火する
            _this.$elm.trigger('keyup');
        },
        // フォーカスが外れた時に値変更検知の為のイベントを無効にする
        removeFocusEvents: function () {
            $(document).off('selectionchange.' + pluginName);
            this.$elm.off(focusEvents.join(' '));
            // 選択範囲を別のエレメントに移動する時の対策
            if (this.obj.tagType === 'html') {
                var _this = this;
                setTimeout(function () {
                    _this.fireEvent();
                }, 100);
            }
        },
        // イベントの発行
        fireEvent: function () {
            // 最終入力値をセットする
            this.setLastVal();
            // イベントオブジェクトと共にプラグインイベントを発火する
            this.$elm.trigger($.Event(eventName, this.obj));
        },
        // 入力前の値と現在の値が同じか確認する
        isSameVal: function () {
            return this.obj.tagType === 'input' ?
                    this.obj.lastVal === this.$elm.val() :
                    this.obj.lastVal === this.$elm.html();
        },
        // 最終入力値をセットする
        setLastVal: function () {
            this.obj.lastVal = this.obj.tagType === 'input' ?
                    this.$elm.val() :
                    this.$elm.html();
        }
    };

    // プラグインの実行
    $.fn[pluginName] = function (method) {
        // CompositionEventをサポートする時のみ実行
        if ('CompositionEvent' in window) {
            // デフォルトのメソッドをonにする
            method = method || 'on';
            // エレメントごとにループする
            this.each(function () {
                // データ属性の取得
                var data = $.data(this, pluginName) ||
                        $.data(this, pluginName, new Plugin(this));
                // プロトタイプの関数に引数が存在する場合は関数の実行
                switch (method) {
                    // 有効化(on)、無効化(off)、破棄(destroy)、強制発火(fireEvent)
                    case 'on':
                    case 'off':
                    case 'destroy':
                    case 'fireEvent':
                        data[method]();
                        break;
                }
            });
        }
        return this;
    };
}));
