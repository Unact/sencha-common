Ext.define('Ext.lib.extra.ViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.extra',

    data: {
        recordId: null,
        modelName: null
    },

    stores: {
        extras: {
            proxy: {
                type: 'restjsonlimitless',
                url: '/extra',
                extraParams: {
                    'record_id': '{recordId}',
                    'table_model_name': '{modelName}'
                }
            },
            fields: [
                {name: 'id',            type: 'int'},
                {name: 'etype',         type: 'int'},
                {name: 'record_id',     type: 'int'},
                {name: 'value',         type: 'string', allowNull: true},
                {name: 'value_list',    type: 'int',    allowNull: true, persist: false},
                {name: 'etype_name',    type: 'string',                  persist: false}
            ]
        },

        etypeValueList: {
            proxy: {
                type: 'restjsonlimitless',
                url: '/etype_value_list/list_values'
            },
            fields: [
                {name: 'id',        type: 'int'},
                {name: 'list_id',   type: 'int'},
                {name: 'type',      type: 'int'},
                {name: 'name',      type: 'string', allowNull: true}
            ],
            sorters: [{
                property: 'name'
            }]
        },

        etypeValueListCombo: {
            source: '{etypeValueList}',
            // Фильтр для того чтобы при первом обращении в combobox не отображались левые значения
            filters: [{
                property: 'type',
                value: null
            }]
        }
    }
});
