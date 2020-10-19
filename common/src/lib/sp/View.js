Ext.define('Ext.lib.sp.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.sp',

    inheritableStatics: {
        STRING_TYPE: 1
    },

    config: {
        enabledButtons: ['save', 'refresh'],
    },

    columns: [{
        text: 'Название',
        dataIndex: 'name',
        width: 150
    }, {
        text: 'Значение',
        dataIndex: 'value',
        width: 250,
        renderer: function(v, metaData, rec) {
            return rec.get('value') ? rec.get('value_name') : null;
        },
        getEditor: function(record) {
            if (record.get('type') === Ext.lib.sp.View.STRING_TYPE) {
                return Ext.create('Ext.grid.CellEditor', {
                    field: Ext.create('Ext.form.field.Text', {
                        listeners: {
                            change: function(field, newVal) {
                                record.set('value_name', newVal);
                            }
                        }
                    })
                });
            }

            return Ext.create('Ext.grid.CellEditor', {
                field: Ext.create('Ext.form.field.ComboBox', {
                    displayField: 'name',
                    valueField: 'id',
                    forceSelection: true,
                    queryCaching: false,
                    minChars: 1,
                    queryParam: 'q[name_cont]',
                    listeners: {
                        beforequery: function(queryPlan) {
                            queryPlan.combo.getStore().getProxy().setExtraParam('q[sp_tp_eq]', record.get('id'));
                        },
                        select: function(combo, selectedRec) {
                            record.set('value_name', selectedRec.get('name'));
                        }
                    },
                    bind: {
                        store: '{spValues}'
                    }
                })
            });
        }
    }]
});
