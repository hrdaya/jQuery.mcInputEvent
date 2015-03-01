/*!
 * <pkg.name> v<pkg.version> (<pkg.homepage>)
 *
 * Copyright 2015 <pkg.author.name> (<pkg.author.url>)
 * Licensed under <pkg.license.type> (<pkg.license.url>)
 */

(function ($) {
    'use strict';
    var pluginName = 'imeEnter';
    var Plugin = function (elm) {
        this.$elm = elm;
        this.on();
    };

    Plugin.prototype = {
        on: function () {
            var _this = this;
            var timer;
            var evt = $.Event('keyup');
            evt.keyCode = 13;
            var imeEvent = false;
            var upEvent = false;
            var keyEvents = [
                'keydown.' + pluginName,
                'keypress.' + pluginName,
                'keyup.' + pluginName
            ];
            var otherEvents = [
                'cut.' + pluginName,
                'paste.' + pluginName
            ];
            // 一旦イベントの削除
            this.off();
            // 変更、ペースト、カット時
            _this.$elm.on(otherEvents.join(' '), function (event) {
                var $elm = $(this);
                setTimeout(function () {
                    // IME入力中の解除
                    imeEvent = false;
                    // Keyupイベントの発行
                    $elm.trigger(evt);
                }, 0);
            });
            // キー入力時のフィルタリング
            _this.$elm.on(keyEvents.join(' '), function (event) {
                var $elm = $(this);
                var type = event.type;
                var keyCode = event.keyCode;
                // イベントを実行しないKeyupキーコード
                var exceptKeys = [
                    9, // TAB
                    15, // Command
                    16, // Shift
                    17, // Ctrl
                    18, // Alt
                    19, // Pause Break
                    20, // Shift+Caps Lock
                    27, // Esc
                    28, // 「前候補・変換」
                    29, // 「無変換」
                    33, // Page Up
                    34, // Page Down
                    35, // End
                    36, // Home
                    37, 38, 39, 40, // 矢印
                    45, // Ins
                    91, // 左Windowsキー
                    92, // 右Windowsキー
                    93, // 右クリックキー
                    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, // ファンクションキー
                    144, // Num Lock
                    145, // Scroll Lock
                    240, 241, // Caps Lock
                    242, // 「カタカナ・ひらがな」
                    243, 244  // 「半角・全角」
                ];
                switch (type) {
                    case 'keydown':
                        imeEvent = false;
                        if (keyCode === 229) {
                            // キーコードが229の場合はIME入力中とみなす
                            imeEvent = true;
                            // Chrome対策
                            // 最後のキー入力から一定時間後にkeyupイベントの
                            // 無い場合は入力確定とする
                            // フィルタリング処理を行う
                            clearTimeout(timer);
                            timer = setTimeout(function () {
                                if (!upEvent) {
                                    // IME入力中の解除
                                    imeEvent = false;
                                    // Keyupイベントの発行
                                    $elm.trigger(evt);
                                }
                            }, 300);
                            upEvent = false;
                        } else if (keyCode === 0) {
                            // FireFoxは最初のキー入力でキーコード0を発行したあと
                            // エンターキーを押すまでキーイベントが起きない
                            imeEvent = true;
                        }
                        break;
                    case 'keypress':
                        // IME入力中はキープレスイベントが発行されないので
                        // このイベントが発行された場合はIME入力中以外とみなす
                        imeEvent = false;
                        break;
                    case 'keyup':
                        upEvent = true;
                        if (exceptKeys.indexOf(keyCode) === -1) {
                            if (imeEvent) {
                                if (keyCode === evt.keyCode) {
                                    // IME入力中の解除
                                    imeEvent = false;
                                    $elm.trigger(evt);
                                }
                            } else {
                                // IME入力中以外
                                var e = $.Event('enter.' + pluginName);
                                $elm.trigger(e);
                            }
                        }
                        break;
                }
            });
        },
        // フォームのイベントをリセット
        off: function () {
            this.$elm.off('.' + pluginName);
        },
        // プラグインの無効化
        destroy: function ( ) {
            this.off();
            this.$elm.removeData(pluginName);
        }
    };

    // プラグインの実行
    $.fn[pluginName] = function (method) {
        var _this = this;
        // 引数を取得
        var args = Array.prototype.slice.call(arguments, 1);
        _this.each(function (index, elm) {
            var $elm = $(elm);
            // テキスト入力エリア以外には適用しない
            var tag = $elm.prop('tagName').toLowerCase();
            switch (tag) {
                case 'input':
                    var type = $elm.prop('type').toLowerCase();
                    switch (type) {
                        case 'password':
                        case 'radio':
                        case 'checkbox':
                        case 'file':
                        case 'hidden':
                        case 'submit':
                        case 'image':
                        case 'reset':
                        case 'button':
                        case 'range':
                            return false;
                    }
                case 'textarea':
                    break;
                default:
                    return false;
            }
            // 初期化されたデータがあるか確認
            var data = $elm.data(pluginName);
            // オブジェクトが作成されていない場合は新規作成
            if (!data) {
                $elm.data(pluginName, new Plugin($elm));
                data = $elm.data(pluginName);
            }
            // プロトタイプの関数に引数が存在する場合は関数の実行
            switch (method) {
                case 'on':
                case 'off':
                case 'destroy':
                    Plugin[method].apply(_this, args);
                    break;
            }
        });
    };
}(jQuery));
