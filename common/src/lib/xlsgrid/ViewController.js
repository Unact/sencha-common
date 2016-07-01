Ext.define('Ext.lib.xlsgrid.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.xlsgrid',

    idColumn: null,

    getRequestUrl: Ext.emptyFn,
    getRequestParams: Ext.emptyFn,

    init: function() {
        var me = this;
        var vm = me.getViewModel();

        me.callParent(arguments);
    },

    onClearButtonClick: function() {
        this.getView().getStore().loadData([]);
    },

    mergeObjectArrays: function(arr1, arr2) {
        var me = this;
        var result = [];

        arr1.forEach(function(r1) {
            var r2 = Ext.Array.findBy(arr2, function(item) {
                return Number(r1[me.idColumn]) === Number(item[me.idColumn]);
            });

            if (r2) {
                result.push(Ext.Object.merge(r1, r2));
            }
        });

        return result;
    },

    loadRemoteData: function(records) {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var ids = records.map(function(r) { return (r[me.idColumn]); });

        // view.setLoading(true);

        Ext.Ajax.request({
            timeout: 60000,
            url: me.getRequestUrl(),
            params: me.getRequestParams(ids),
            method: 'GET',
            success: function(response) {
                var receivedRecords = Ext.JSON.decode(response.responseText, true);
                var receivedIds = receivedRecords.map(function(r) { return Number(r[me.idColumn]); });
                Ext.Array.difference(ids, receivedIds); // TODO
                store.add(me.mergeObjectArrays(records, receivedRecords));
            }
        });
    },

    isDublicate: function(records, record) {
        var found;
        var store = this.getView().getStore();

        found = Ext.Array.findBy(records, function(r) {
            return Ext.Array.equals(Ext.Object.getValues(record), Ext.Object.getValues(r));
        });

        if (found !== null) {
            return true;
        }

        found = store.findBy(function(r) {
            for (var i in record) {
                if (r.get(i) != record[i]) {
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
        var idCol;

        columns.forEach(function(column) {
            var columnIx = column.columnInXls;
            if (column.identificator) {
                me.idColumn = column.dataIndex;
            }
            if (columnIx !== undefined) {
                colSpecs[columnIx] = {
                    dataIndex: column.dataIndex,
                    identificator: column.identificator ? true : false,
                    required: column.required ? true : false
                };
            }
        });

        rows.forEach(function(row) {
            var row = row.split('\t');
            var record = {};
            if (row.length) {
                for (var i in colSpecs) {
                    var item = row[i];
                    if (colSpecs[i].required && item.length === 0) {
                        return;
                    }
                    record[colSpecs[i].dataIndex] = item && item.length ? item : null;
                }
                if (me.isDublicate(records, record)) {
                    // TODO
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
