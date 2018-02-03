Ext.define('Ext.lib.dblog.View', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.dblog',

    requires: [
        'Ext.lib.dblog.ViewController',
        'Ext.lib.dblog.ViewModel',
        'Ext.lib.shared.BaseToolbar'
    ],

    controller: 'dblog',
    viewModel: 'dblog',

    bind: {
        store: '{dblog}'
    },

    viewConfig: {
        getRowClass: function(record, rowIndex) {
            return Math.floor((rowIndex % 4)/2) === 0 ? 'x-dblog-row-alt' : 'x-dblog-row';
        },
    },

    title: 'История изменения записи',

    tbar: [{
        xtype: 'sharedbasetoolbar',
        enabledButtons: ['refresh'],
        beforeButtons: [{
            xtype: 'textfield',
            labelWidth: 15,
            width: 270,
            fieldLabel: 'xid',
            bind: {
                value: '{xid}',
            }
        }]
    }],

    sortableColumns: false,
    enableColumnHide: false,

    columns: [
    {
        width: 140,
        text: 'Дата и время',
        dataIndex: 'ts',
        xtype: 'datecolumn',
        format: 'd.m.Y H:i:s.u',
        locked: true,
    }, {
        width: 120,
        text: 'Пользователь',
        dataIndex: 'creator',
        locked: true,
    }, {
        width: 120,
        text: 'Старое/новое зн.',
        dataIndex: 'row_num',
        renderer: function(value) {
            return value === 1 ? "Старое значение" : "Новое значение";
        },
        locked: true,
    }, {
        // Костыль. см. коммент в контроллере
        width: 0,
        text: ' ',
    }]
});
