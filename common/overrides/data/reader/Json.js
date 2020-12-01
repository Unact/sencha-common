Ext.define('Ext.overrides.data.reader.Json', {
    override: 'Ext.data.reader.Json',

    extractData: function(root, readOptions) {
        var recordName = this.getRecord(),
            data = [],
            length, i;

        if (recordName) {
            /// FIX
            /// Previously if the response had a length property data extraction would fail
            if (Ext.isArray(root)) {
                length = root.length;
            } else {
                length = 1;
                root = [root];
            }

            for (i = 0; i < length; i++) {
                data[i] = root[i][recordName];
            }
        } else {
            data = root;
        }
        return this.callParent([data, readOptions]);
    }
});
