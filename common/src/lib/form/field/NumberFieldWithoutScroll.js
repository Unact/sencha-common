/**
 * Класс поля без колесика прокрутки
 */
Ext.define('Ext.lib.form.field.NumberFieldWithoutScroll', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.numberfieldwithoutscroll',

    fieldStyle: 'text-align: right;',

    hideTrigger: true,

    keyNavEnabled: false,

    mouseWheelEnabled: false,

    selectOnFocus: true

});
