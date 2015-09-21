# jQuery.mcInputEvent
[![GitHub release](https://img.shields.io/badge/release-v0.2.0-blue.svg?style=flat)](https://github.com/hrdaya/jQuery.mcInputEvent/releases)
[![GitHub licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/hrdaya/jQuery.mcInputEvent/blob/master/LICENSE)
[![devDependency Status](https://david-dm.org/hrdaya/jQuery.mcInputEvent/dev-status.svg)](https://david-dm.org/hrdaya/jQuery.mcInputEvent#info=devDependencies)

jQuery.mcInputEventはIME入力中にinputイベントを発火させたくない時に使用するプラグインです。

## 特徴

 - 「input」の代わりに「mcinput」というイベントが発火します。
 - IME入力中にイベントは発火しません。
 - IEでは `contenteditable="true"` を設定したエレメントではinputイベントが発火しませんが、mcinputは発火します。
 - IE9ではバックスペースで文字を削除した時等にinputイベントが発火しないバグがありますが、mcinputでは発火します。

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