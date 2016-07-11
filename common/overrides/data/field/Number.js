Ext.define('Ext.overrides.data.field.Number', {
    override: 'Ext.data.field.Number',

    // Since default JS decimalSeparator is '.', change all ',' to '.'
    // To do: Add decimal and thousand separators
    parse: function(v) {
        return parseFloat(String(v).replace(',', '.').replace(this.stripRe, ''));
    }
}); 
