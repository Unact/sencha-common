Ext.define('Ext.lib.xlsgrid.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.xlsgrid',

    idColumn: null,

    getRequestOptions: Ext.emptyFn,

    repeated: [],
    invalid: [],

    init: function() {
        var me = this;

        me.getView().getColumns().forEach(function(column) {
            if (column.identificator) {
                me.idColumn = column.dataIndex;
            }
        });

        me.callParent(arguments);
    },

    onClearButtonClick: function() {
        this.getView().getStore().loadData([]);
    },

    onRefresh: function() {
        Ext.Msg.alert('Ok', 'Refreshed');
    },

    onSave: function() {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var messageLines = [];

        store.each(function(r) {
            var validation = r.getValidation();
            var messages = [];
            r.getFields().forEach(function(field) {
                var validationMessage = validation.get(field.getName());
                if (validationMessage.length) {
                    messages.push(validationMessage);
                }
            });
            if (messages.length) {
                var id = r.get(me.idColumn);
                messageLines.push((id ? String(id) + ': ' : '') + messages.join(', '));
            }
        });
        if (messageLines.length) {
            Ext.Msg.alert('Ошибка!', messageLines.join('<br/>'));
        }
    },

    showMessage: function() {
        var me = this;
        var msg = [];
        var idColumnText = Ext.Array.findBy(me.getView().getColumns(), function(item) {
            return item.dataIndex === me.idColumn;
        }).text;

        if (me.invalid && me.invalid.length) {
            msg.push('Несуществующие значения поля "' + idColumnText + '": ' +
                Ext.Array.unique(me.invalid).join(', '));
        }
        if (me.repeated && me.repeated.length) {
            msg.push('Повторяющиеся значения поля "' + idColumnText + '": ' +
                Ext.Array.unique(me.repeated).join(', '));
        }

        me.repeated = [];
        me.invalid = [];

        if (msg.length) {
            Ext.Msg.alert('Сообщение', msg.join('<br/>'));
        }
    },

    mergeObjectArrays: function(arr1, arr2) {
        var me = this;
        var fields = me.getView().getColumns().map(function(column) {return column.dataIndex;});
        var result = [];

        arr1.forEach(function(r1) {
            arr2.forEach(function(r2) {
                if (r1[me.idColumn] == r2[me.idColumn]) {
                    var resultRecord = {};
                    fields.forEach(function(field) {
                        resultRecord[field] = r1[field] || r2[field];
                    });
                    result.push(resultRecord);
                }
            });
        });

        return result;
    },

    loadRemoteData: function(records) {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var ids = records.map(function(r) { return Number(r[me.idColumn]); });
        var requestOptions = me.getRequestOptions(ids);

        view.setLoading(true);

        requestOptions.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        requestOptions.success = function(response) {
            var receivedRecords = Ext.JSON.decode(response.responseText, true);
            var receivedIds = receivedRecords.map(function(r) { return Number(r[me.idColumn]); });
            me.invalid = me.invalid.concat(Ext.Array.difference(ids, receivedIds));
            store.add(me.mergeObjectArrays(records, receivedRecords));
            view.setLoading(false);
            me.showMessage();
        };

        Ext.Ajax.request(requestOptions);
    },

    isDublicate: function(records, record) {
        var store = this.getView().getStore();
        var found = Ext.Array.findBy(records, function(r) {
            return Ext.Array.equals(Ext.Object.getValues(record), Ext.Object.getValues(r));
        });

        if (found !== null) {
            return true;
        }

        found = store.findBy(function(r) {
            for (var i in record) {
                var storeValue = r.get(i);
                if (storeValue instanceof Date) {
                    storeValue = Ext.Date.format(storeValue, 'd.m.Y');
                }
                if (storeValue != record[i]) {
                    return false;
                }
            }
            return true;
        });

        return found > -1;
    },

    extractRecordsFromXls: function(xls) {
        var me = this;
        var view = me.getView();
        var columns = view.getColumns();
        var rows = xls.split('\n');
        var records = [];
        var colSpecs = [];

        columns.forEach(function(column) {
            var columnIx = column.columnInXls;
            if (columnIx !== undefined) {
                colSpecs[columnIx] = {
                    dataIndex: column.dataIndex,
                    identificator: column.identificator ? true : false,
                    required: column.required ? true : false,
                    columnStore: column.xtype === 'combocolumn' ? column.store : null
                };
            }
        });

        rows.forEach(function(row) {
            var row = row.split('\t');
            var record = {};
            if (row.length) {
                for (var i in colSpecs) {
                    var item = row[i] && row[i].length ? row[i] : null;
                    var columnStore = colSpecs[i].columnStore;

                    if (columnStore) {
                        var recordFromCombo = columnStore.getAt(columnStore.findExact('name', item));
                        item = recordFromCombo ? recordFromCombo.get('id') : null;
                    }

                    if ((colSpecs[i].required || colSpecs[i].identificator) && !item) {
                        return;
                    }

                    record[colSpecs[i].dataIndex] = item;
                }
                if (me.isDublicate(records, record)) {
                    me.repeated.push(record[me.idColumn]);
                } else {
                    records.push(record);
                }
            }
        });

        return records;
    },

    onXlsChanged: function(field, xls, oldValue) {
        var me = this;
        var records;

        if (!xls || xls.length === 0) {
            return;
        }

        field.reset();

        records = me.extractRecordsFromXls(xls);

        me.loadRemoteData(records);
    }
});
