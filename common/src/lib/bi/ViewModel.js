Ext.define('Ext.lib.bi.ViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.bi',

    data: {
        recordId: null,
        modelName: null
    },

    stores: {
        bi: {
            proxy: {
                type: 'restjsonlimitless',
                url: '/bi',
                extraParams: {
                    'record_id': '{recordId}',
                    'table_model_name': '{modelName}'
                }
            },
            fields: [
                {name: 'id',            type: 'auto'},
                {name: 'tid',           type: 'int', critical: true},
                {name: 'rid',           type: 'int', critical: true},
                {name: 'bi_group',      type: 'int', critical: true},
                {name: 'spv_id',        type: 'int', critical: true, allowNull: true},
                {name: 'sp_tp',         type: 'int',                 allowNull: true}
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
                {name: 'sp_tp',      type: 'int'},
                {name: 'sortcolumn', type: 'string'},
                {name: 'tlev',       type: 'int'},
            ],
            sorters: [{
                property: 'sortcolumn'
            }]
        },

        spValuesCombo: {
            source: '{spValues}',
        }
    }
});
