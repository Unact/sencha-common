Ext.define('Ext.lib.extra.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.extra',

    requires: [
        'Ext.lib.extra.ViewController',
        'Ext.lib.extra.ViewModel'
    ],

    controller: 'extra',

    viewModel: 'extra',

    bind: {
        store: '{extras}'
    },

    cfg: {
        enabledButtons: ['refresh', 'save'],
        enableColumnHide: false,
        columns: [{
            width: 250,
            text: 'Признак',
            dataIndex: 'etype_name'
        }, {
            text: 'Значение',
            dataIndex: 'value',
            width: 150,
            renderer: function(value, metaData, rec) {
                var etypeValueListStore = this.getController().getStore('etypeValueList');

                if (rec.get('value_list') !== null && value !== null) {
                    const valueRec = etypeValueListStore.getData().items.find(function(valRec) {
                        return valRec.get('type') === rec.get('value_list') && valRec.get('list_id') == value;
                    });

                    return valueRec.get('name');
                }
                return value;
            },
            getEditor: function(record) {
                if (record.get('value_list') === null) {
                    return Ext.create('Ext.grid.CellEditor', {
                        field: 'textfield'
                    });
                }

                return Ext.create('Ext.grid.CellEditor', {
                    field: {
                        xtype: 'combobox',
                        displayField: 'name',
                        valueField: 'list_id',
                        forceSelection: true,
                        queryMode: 'local',
                        listeners: {
                            beforequery: function(queryPlan) {
                                var store = queryPlan.combo.getStore();
                                store.clearFilter();
                                store.filter({
                                    property: 'type',
                                    value: record.get('value_list')
                                });
                            }
                        },
                        bind: {
                            store: '{etypeValueListCombo}'
                        }
                    }
                });
            }
        }]
    }
});
