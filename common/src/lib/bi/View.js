Ext.define('Ext.lib.bi.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.bi',

    requires: [
        'Ext.lib.bi.ViewController',
        'Ext.lib.bi.ViewModel',
        'Ext.lib.grid.column.ComboColumn'
    ],

    controller: 'bi',

    viewModel: 'bi',

    bind: {
        store: '{bi}'
    },

    cfg: {
        enabledButtons: ['refresh', 'save'],
        enableColumnHide: false,
        columns: [{
            width: 200,
            text: 'Признак',
            dataIndex: 'bi_group_name'
        }, {
            text: 'Значение',
            dataIndex: 'spv_id',
            width: 350,
            xtype: 'combocolumn',
            field: {
                forceSelection: true,
                listConfig: {
                    getInnerTpl: function(displayField){
                        return '{["&nbsp;".repeat(2*values.tlev)]}{' + displayField + '}';
                    },
                },
                listeners: {
                    beforequery: function(queryPlan) {
                        var store = queryPlan.combo.getStore();
                        var record = this.up('bi').getViewModel().get('masterRecord');

                        store.clearFilter();
                        store.filter({
                            property: 'bi_group',
                            value: record.get('bi_group')
                        });
                    },
                    select: function(combo, rec) {
                        var record = this.up('bi').getViewModel().get('masterRecord');

                        record.set('sp_tp', rec.get('sp_tp'));
                    }
                },
                bind: {
                    store: '{spValuesCombo}'
                }
            },
            bind: {
                store: '{spValues}'
            }
        }]
    }
});
