Ext.define('Ext.lib.bigrid.ViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.bigrid',

    data: {
        recordId: null,
        modelName: null
    },

    stores: {
        recordSpSets: {
            proxy: {
                type: 'restjsonlimitless',
                url: '/record_sp_sets'
            },
            fields: [
                {name: 'id',            type: 'auto'},
                {name: 'record_id',     type: 'int'},
                {name: 'bi_group',      type: 'int'},
                {name: 'spv_id',        type: 'int', allowNull: true},
                {name: 'sp_tp',         type: 'int', allowNull: true}
            ]
        },

        bi: {
            proxy: {
                type: 'restjsonlimitless',
                api: {
                    create: '/record_sp_sets/create_records'
                }
            },
            fields: [
                {name: 'record_id',      type: 'int'},
                {name: 'sp_sets_data',   type: 'auto'},
                {name: 'model_name',     type: 'string'},
                {name: 'only_delete',    type: 'boolean'}
            ]
        },

        spValues: {
            proxy: {
                type: 'restjsonlimitless',
                url: '/universal_api/SpValue',
                extraParams: {
                    'q[for_bi_groups]': true
                }
            },
            fields: [
                {name: 'id',         type: 'int'},
                {name: 'name',       type: 'string', allowNull: true},
                {name: 'bi_group',   type: 'int'},
                {name: 'bi_name',    type: 'string'},
                {name: 'sp_tp',      type: 'int'},
                {name: 'sortcolumn', type: 'string'},
                {name: 'tlev',       type: 'int'},
            ],
            sorters: [{
                property: 'sortcolumn'
            }]
        }
    }
});
