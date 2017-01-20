Ext.define('Ext.overrides.MessageBox', {
    override: 'Ext.MessageBox',

    statics: {
        OK    : {text: 'ОК',        itemId: 'ok'},
        YES   : {text: 'Да',        itemId: 'yes'},
        NO    : {text: 'Нет',       itemId: 'no'},
        CANCEL: {text: 'Отмена',    itemId: 'cancel'},

        OKCANCEL: [
            {text: 'Отмена', itemId: 'cancel'},
            {text: 'ОК',     itemId: 'ok'}
        ],
        YESNOCANCEL: [
            {text: 'Отмена', itemId: 'cancel'},
            {text: 'Нет',    itemId: 'no'},
            {text: 'Да',     itemId: 'yes'}
        ],
        YESNO: [
            {text: 'Нет',   itemId: 'no'},
            {text: 'Да',    itemId: 'yes'}
        ]
    }
});
