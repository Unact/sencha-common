Ext.define('Ext.lib.dblog.ViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.dblog',

    data: {
        xid: null,
        id: null,
        url: null,
        editableXid: false
    },

    stores: {
        dblog: {
            proxy: {
                type: 'restjsonlimitless',
                url: '/dblog/ask_dw_dblog',
                extraParams: {
                    xid: '{xid}',
                    id: '{id}',
                    url: '{url}'
                },
                reader: {
                    rootProperty: 'data'
                }
            },
            fields: [
                {name: 'id',      type: 'string'},
                {name: 'creator', type: 'string'},
                {name: 'ts',      type: 'date'},
                {name: 'row_num', type: 'int'}
            ]
        },

        recordInfo: {
            proxy: {
                type: 'restjsonlimitless',
                url: '/dblog/record_info',
                extraParams: {
                    xid: '{xid}',
                    id: '{id}',
                    url: '{url}'
                }
            },
            fields: [
                {name: 'record_id', type: 'string', allowNull: true},
                {name: 'xid',       type: 'string', allowNull: true},
                {name: 'table_name',type: 'string', allowNull: true}
            ]
        }
    }
});
