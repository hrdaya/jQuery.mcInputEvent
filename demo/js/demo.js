$(function () {
    'use strict';
    var $elm = $('.ime-enter').first();
    var $pre = $('#pre');
    var $switch = $('#boot-switch');
    $elm.imeEnter();
    $switch.bootstrapSwitch({
        offColor: 'danger',
        onSwitchChange: function (event, state) {
            state ? $elm.imeEnter('on') : $elm.imeEnter('off');
        }
    });

    $(document).on('enter.imeEnter', '.ime-enter', function () {
        var inputStr = $(this).val();
        var preStr = $pre.text();
        $pre.text(preStr !== '' ? preStr + '\n' + inputStr : inputStr);
    });

    $('#btn-clear').on('click', function () {
        $pre.text('');
        $elm.val('');
    });
});