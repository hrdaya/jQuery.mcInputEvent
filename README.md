# jQuery.mcInputEvent
[![GitHub release](https://img.shields.io/badge/release-v0.3.0-blue.svg?style=flat)](https://github.com/hrdaya/jQuery.mcInputEvent/releases)
[![GitHub licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/hrdaya/jQuery.mcInputEvent/blob/master/LICENSE)
[![devDependency Status](https://david-dm.org/hrdaya/jQuery.mcInputEvent/dev-status.svg)](https://david-dm.org/hrdaya/jQuery.mcInputEvent#info=devDependencies)

jQuery.mcInputEventはInternet Explorer9で実装されたinputイベントがうまく発火しないものの修正と、各ブラウザでIME入力中に発火しないイベントを提供します。

## 特徴

 - Internet Explorer系においてのinputイベントをChromeや、Firefoxと同じようなタイミングで発火するようにします。
 - IME入力中に発火しない独自イベントを備えます。
 - input、textareaからの発火か、`contenteditable="true"` を設定したエレメントからの発火からを判定することができます。
 - input、textareaからの発火か、`contenteditable="true"` を設定したエレメントからの発火からに関わらずエレメントの最終値を簡単に取得できます。

## IE系でinputイベントが発火しないタイミング(jQuery.mcInputEventで修正されるもの)

### IE9

1. BackSpace、Deleteキーでの文字の削除
2. 「切り取り」「Ctrl+x」
3. 「元に戻す」「Ctrl+z」
4. 選択した範囲を別のエレメントにドロップして内容が変わったとき

### IE全般

1. contenteditable="true"を設定したエレメント
2. ESCキーで入力文字列が取り消されたとき
3. IME入力終了時

バグや改善項目がありましたら[issue](https://github.com/hrdaya/jQuery.mcInputEvent/issues)を上げていただけると助かります :smiley:

## 使用方法

[ドキュメント](http://hrdaya.github.io/jQuery.mcInputEvent/)をご参照ください

## 確認済みのブラウザ

「windows7 64bit」で下記のブラウザを使用して確認しています

 - Chrome
 - Firefox
 - Internet Explorer11
 - Internet Explorer9(Internet Explorer11でエミュレート)

## ライセンス

[MIT License](https://github.com/hrdaya/jQuery.mcInputEvent/blob/master/LICENSE)