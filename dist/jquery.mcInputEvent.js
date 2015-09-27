/*!
 * jQuery.mcInputEvent v0.3.0 (http://hrdaya.github.io/jQuery.mcInputEvent/)
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
    // IME入力中以外のイベント名
    var notImeEvent = 'mcinput';
    // inputに変わるイベント名
    var inputEvent = 'input2';
    // Microsoftのブラウザかどうか
    var isMsBrowser = false;
    // IE9かどうか
    var isIE9 = false;
    // ブラウザ判定
    // EdgeをMicrosoft系のブラウザとして入れているが、
    // WebKitと動作が異なる部分は修正すべきバグと
    // http://blogs.windows.com/msedgedev/2015/06/17/building-a-more-interoperable-web-with-microsoft-edge/
    // でも述べている為、将来的には削除する必要があるかも
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('msie') > -1 ||
            ua.indexOf('trident') > -1 ||
            ua.indexOf('edge') > -1) {
        isMsBrowser = true;
        if (ua.indexOf('msie 9.0') > -1) {
            isIE9 = true;
        }
    }

    // プラグイン本体
    var Plugin = function (elm) {
        this.$elm = $(elm);
        // IME入力中かどうか
        this.isComposition = false;
        // タイマー用
        this.timer;
        // イベント発火時にFunctionに渡す値
        // contenteditableに対応する為にタグのタイプをとりあえずhtmlにする
        this.obj = {
            lastVal: '',
            tagType: 'html'
        };
        // イベントの種類
        this.checkEvents = [
            'input.' + pluginName,
            'compositionstart.' + pluginName,
            'compositionend.' + pluginName
        ];
        // 初期化処理
        this.init();
    };
    // プラグインのプロトタイプ
    Plugin.prototype = {
        // プラグインのイベント有効化
        on: function () {
            // イベントの重複登録を避けるため一旦off
            this.off();
            // inputとIME入力判定用のイベントを有効にする
            this.$elm.on(this.checkEvents.join(' '), this.setEvents.bind(this));
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
        // イベントの強制発火
        triggerEvent: function () {
            // inputを発火させることでinput2,mcinputも発火させる
            // 合わせてエレメント内の最終値を更新させる
            this.$elm.trigger('input');
        },
        // 初期化処理
        init: function () {
            // input、textareaの時はタグのタイプをinputに変更
            var tagName = this.$elm.prop('tagName').toLowerCase();
            if (tagName === 'input' || tagName === 'textarea') {
                this.obj.tagType = 'input';
                // IE9のバグ対策の為、selectionchangeをベースに入力の変更を監視する
                if (isIE9) {
                    this.checkEvents.push('focus.' + pluginName);
                    this.checkEvents.push('blur.' + pluginName);
                }
            } else {
                // input、textarea以外の時にMicrosoft系ブラウザの場合はinputイベントが発火しない為
                // selectionchangeをベースに入力の変更を監視する
                if (isMsBrowser) {
                    this.checkEvents.push('focus.' + pluginName);
                    this.checkEvents.push('blur.' + pluginName);
                }
            }
            // keyup → ESCでの文字削除対策、input、textarea以外での入力対策
            // drop → 値がドロップされた時の対策
            if (isMsBrowser) {
                this.checkEvents.push('keyup.' + pluginName);
                this.checkEvents.push('drop.' + pluginName);
            }
            // 現在の値を最終値としてセット
            this.setLastVal();
        },
        // onにした時に各イベントをセットする
        setEvents: function (e) {
            // イベントのタイプごとに処理
            switch (e.type) {
                case 'input':
                    // 最終入力値をセットする
                    this.setLastVal();
                    // inputの代わりのイベントを発火
                    this.triggerInput2();
                    // IME入力時以外にプラグインイベントを発火
                    if (!this.isComposition) {
                        this.triggerMcInput();
                    }
                    break;
                case 'compositionstart':
                    // IME入力中フラグのセット
                    this.isComposition = true;
                    break;
                case 'compositionend':
                    // IME入力中フラグのリセット
                    this.isComposition = false;
                    // MS系ブラウザでIME入力後にイベントが発火しない事への対策
                    // 他ブラウザと合わせるために値が同じでも発火させる
                    if (isMsBrowser) {
                        this.triggerEvent();
                    }
                    break;
                case 'focus':
                    // フォーカスを受けた時にselectionchangeイベントを有効にする
                    $(document).on('selectionchange.' + pluginName, this.triggerInput.bind(this));
                    break;
                case 'blur':
                    // フォーカスが外れた時にselectionchangeイベントを無効にする
                    $(document).off('selectionchange.' + pluginName);
                    // 選択範囲を別のエレメントに移動する時の対策
                    this.setDelayInputEvent();
                    break;
                case 'keyup':
                    // 擬似的にinputイベントを発火する
                    this.triggerInput();
                    break;
                case 'drop':
                    // 擬似的にinputイベントを発火する
                    this.setDelayInputEvent();
                    break;
            }
        },
        // mcinputイベントを発火する
        triggerMcInput: function () {
            // イベントオブジェクトと共にプラグインイベントを発火する
            this.$elm.trigger($.Event(notImeEvent, this.obj));
        },
        // input2イベントを発火する
        triggerInput2: function () {
            // イベントオブジェクトと共にプラグインイベントを発火する
            this.$elm.trigger($.Event(inputEvent, this.obj));
        },
        // 最終入力値と同じかどうかを判定してinputイベントを発火する
        triggerInput: function () {
            if (!this.isSameVal()) {
                this.$elm.trigger('input');
            }
        },
        // 遅れてイベントを発火する
        setDelayInputEvent: function () {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.triggerInput.bind(this), 50);
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
        if (window.hasOwnProperty('CompositionEvent')) {
            // デフォルトのメソッドをonにする
            method = method || 'on';
            // エレメントごとにループする
            this.each(function () {
                // データ属性の取得
                var data = $.data(this, pluginName) ||
                        $.data(this, pluginName, new Plugin(this));
                // プロトタイプの関数に引数が存在する場合は関数の実行
                switch (method) {
                    // 有効化(on)、無効化(off)、破棄(destroy)、強制発火(triggerEvent)
                    case 'on':
                    case 'off':
                    case 'destroy':
                    case 'triggerEvent':
                        data[method]();
                        break;
                }
            });
        }
        return this;
    };
}));
