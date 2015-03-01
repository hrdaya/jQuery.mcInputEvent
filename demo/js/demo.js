$(function () {
    'use strict';
    $('.ime-enter').imeEnter();

    $('.ime-enter').on('enter.imeEnter', function () {
        var inputStr = $(this).val();
        var preStr = $('#pre').text();
        $('#pre').text(preStr !== '' ? preStr + '\n' + inputStr : inputStr);
    });
});