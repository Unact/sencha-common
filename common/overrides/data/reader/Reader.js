Ext.define('Ext.overrides.data.reader.Reader', {
    override: 'Ext.data.reader.Reader',

    extractData: function(root, readOptions) {
        var me = this,
            entityType = readOptions && readOptions.model ? Ext.data.schema.Schema.lookupEntity(readOptions.model) : me.getModel(),
            // eslint-disable-line max-len
            schema = entityType.schema,
            includes = readOptions && 'includes' in readOptions ? readOptions.includes : schema.hasAssociations(entityType) && me.getImplicitIncludes(),
            // eslint-disable-line max-len
            fieldExtractorInfo = me.getFieldExtractorInfo(entityType),
            length,
            records,
            typeProperty = me.getTypeProperty(),
            reader, node, nodeType, record, i;

        /// FIX
        /// Previously if the response had a length property data extraction would fail
        if (Ext.isArray(root)) {
            length = root.length;
        } else {
            length = 1;
            root = [root];
        }

        records = new Array(length);

        for (i = 0; i < length; i++) {
            record = root[i];
            if (!record.isModel) {
                // If we're given a model instance in the data, just push it on
                // without doing any conversion. Otherwise, create a record.
                node = record;
                // This Reader may be configured to produce different model types based on
                // a differentiator field in the incoming data:
                // typeProperty name be a string, a function which yields the child type, or an
                // object: {
                //     name: 'mtype',
                //     namespace: 'MyApp'
                // }
                if (typeProperty && (nodeType = me.getChildType(schema, node, typeProperty))) {
                    reader = nodeType.getProxy().getReader();
                    record = reader.extractRecord(node, readOptions, nodeType, schema.hasAssociations(nodeType) && reader.getImplicitIncludes(), reader.getFieldExtractorInfo(nodeType));
                } else {
                    record = me.extractRecord(node, readOptions, entityType, includes, fieldExtractorInfo);
                }
                // Generally we don't want to have references to XML documents
                // or XML nodes to hang around in memory but Trees need to be able
                // to access the raw XML node data in order to process its children.
                // See https://sencha.jira.com/browse/EXTJS-15785 and
                // https://sencha.jira.com/browse/EXTJS-14286
                if (record.isModel && record.isNode) {
                    record.raw = node;
                }
            }
            if (record.onLoad) {
                record.onLoad();
            }
            records[i] = record;
        }
        return records;
    },
});
