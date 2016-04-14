Ext.define('Ext.lib.shared.Csv', {
    mixinId: 'csv',
    
    getRecsFromCsv : function(csv) {
        var grid = this;
        var rows = csv.split("\n");
        var records = [];
        var columns = grid.columns;

        rows.every(function(row) {
            if (row.length > 0) {
                var cols = row.split("\t");
                var record = {};
                var l = Math.min(cols.length, columns.length);

                for (var j = 0; j < l; j++) {
                    if (columns[j].xtype === "numbercolumn") {
                        cols[j] = cols[j].replace(new RegExp(String.fromCharCode(160), "g"), "").replace(/,/g, ".").replace(" ", "");
                    };
                    record[columns[j].dataIndex] = cols[j];
                }

                records.push(record);
            }

            return true;
        });

        return records;
    },

    getCsvDataFromRecs : function() {
        var grid = this;
        var store = grid.store;
        var rows = [];

        grid.getSelectionModel().getSelection().every(function(record) {
            var row = [];
            grid.columns.every(function(column) {
                row.push(record.get(column.dataIndex));
                
                return true;
            });
            rows.push(row.join("\t"));
            
            return true;
        });
        return rows.length>0 ? rows.join("\n") : null;
    }
});
