/*!
 * <pkg.name> v<pkg.version> (<pkg.homepage>)
 *
 * Copyright 2015 <pkg.author.name> (<pkg.author.url>)
 * Licensed under <pkg.license.type> (<pkg.license.url>)
 */

(function ($) {
    'use strict';
    // プラグイン名
    var pluginName = 'imeEnter';

    // プラグイン本体
    var Plugin = function (elm) {
        this.$elm = elm;
        this.on();
    };

    // プラグインのプロトタイプ
    Plugin.prototype = {
        // プラグインのイベント捕捉有効化
        on: function () {
            var _this = this;

            // タイマー用
            var timer;

            // keyupのエンターキー発行用
            var evt = $.Event('keyup');
            evt.keyCode = 13;

            // IME入力中かどうかを判断するフラグ
            var imeFlag = false;

            // キーアップイベントが発火したかどうかを判断するフラグ
            var keyUpFlag = false;

            // 捕捉するキーイベント
            var keyEvents = [
                'keydown.' + pluginName,
                'keypress.' + pluginName,
                'keyup.' + pluginName
            ];

            // カット・ペーストのイベント
            var otherEvents = [
                'cut.' + pluginName,
                'paste.' + pluginName
            ];
            // 一旦イベントのoff
            this.off();

            // カット・ペースト時
            _this.$elm.on(otherEvents.join(' '), function (event) {
                var $elm = $(this);
                // 右クリックでのカット・ペーストのイベント捕捉
                // キーボードショートカットではこのコードと別に「keyup（13）」が発火する模様
                setTimeout(function () {
                    // Keyupイベントの発行
                    $elm.trigger(evt);
                }, 0);
            });

            // キーイベント
            _this.$elm.on(keyEvents.join(' '), function (event) {
                var $elm = $(this);

                // イベント発火時のキーコード
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

                // イベントのタイプごとに処理
                //　通常は「keydown」→「keypress」→「keyup」の順にイベントが発火する
                switch (event.type) {
                    case 'keydown':
                        // 一旦IME入力中フラグのリセット
                        imeFlag = false;

                        if (keyCode === 229) {
                            // キーコードが229の場合はIME入力中とみなす（Chrome・IE用）
                            // IME入力中フラグのセット
                            imeFlag = true;

                            // 設定していたタイマーのリセット
                            clearTimeout(timer);

                            // Chrome対策
                            // キー入力から300ミリ秒後にkeyupイベントの
                            // 無い場合は入力確定とする（調整必要）
                            timer = setTimeout(function () {
                                if (!keyUpFlag) {
                                    // Keyupイベントの発行
                                    $elm.trigger(evt);
                                }
                            }, 300);

                            // キーアップフラグのリセット
                            keyUpFlag = false;
                        } else if (keyCode === 0) {
                            // キーコードが0の場合はIME入力開始とみなす（FF用）
                            // エンターキーを押すまでキーイベントが一切起きない
                            // IME入力中フラグのセット
                            imeFlag = true;
                        }
                        break;
                    case 'keypress':
                        // IME入力中はキープレスイベントは発火しないので
                        // このイベントが発火した場合はIME入力中以外とみなす
                        imeFlag = false;
                        break;
                    case 'keyup':
                        // キーアップフラグのセット
                        keyUpFlag = true;

                        // 文字入力以外のキー入力は除外
                        if (exceptKeys.indexOf(keyCode) === -1) {
                            // IME入力中でない
                            // IME入力中でキーコード13が発行された
                            if (!imeFlag ||
                                    (imeFlag && keyCode === evt.keyCode)) {
                                // イベントの発行
                                _this._trigger($elm);
                            }
                        }
                        break;
                }
            });
        },
        // プラグインのイベント捕捉無効化
        off: function () {
            this.$elm.off('.' + pluginName);
        },
        // プラグインの破棄
        destroy: function () {
            this.off();
            this.$elm.removeData(pluginName);
        },
        // イベントの発行
        _trigger: function ($elm) {
            var e = $.Event('enter.' + pluginName);
            $elm.trigger(e);
        }
    };

    // プラグインの実行
    $.fn[pluginName] = function (method) {
        this.each(function (index, elm) {
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
                    data[method]();
                    break;
            }
        });
    };
}(jQuery));
