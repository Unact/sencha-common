Ext.define('Ext.overrides.String', {
    override: 'Ext.String',

    snakeCaseToCamelCase: function(str) {
        return str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('_', ''));
    }
});
