Ext.define('Ext.lib.dblog.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.dblog',

    requires: [
        'Ext.lib.dblog.ViewController',
        'Ext.lib.dblog.ViewModel'
    ],

    controller: 'dblog',

    viewModel: 'dblog',

    bind: {
        store: '{dblog}'
    },

    cfg: {
        viewConfig: {
            getRowClass: function(record, rowIndex) {
                return Math.floor((rowIndex % 4)/2) === 0 ? 'x-dblog-row-alt' : 'x-dblog-row';
            }
        },
        title: 'История изменения записи',
        enabledButtons: ['refresh'],
        beforeButtons: [{
            xtype: 'textfield',
            labelWidth: 50,
            width: 150,
            fieldLabel: 'Таблица',
            bind: {
                value: '{tableName}'
            },
            editable: false
        }, {
            xtype: 'textfield',
            labelWidth: 15,
            width: 150,
            fieldLabel: 'id',
            bind: {
                value: '{id}'
            },
            editable: false
        }, {
            xtype: 'textfield',
            labelWidth: 15,
            width: 270,
            fieldLabel: 'xid',
            bind: {
                value: '{xid}',
                editable: '{editableXid}'
            }
        }],
        allowXidEdit: true,
        sortableColumns: false,
        enableColumnHide: false,
        columns: [{
            width: 140,
            text: 'Дата и время',
            dataIndex: 'ts',
            xtype: 'datecolumn',
            format: 'd.m.Y H:i:s.u'
        }, {
            width: 120,
            text: 'Пользователь',
            dataIndex: 'creator'
        }, {
            width: 120,
            text: 'Старое/новое зн.',
            dataIndex: 'row_num',
            renderer: function(value) {
                return value === 1 ? "Старое значение" : "Новое значение";
            }
        }]
    }
});
