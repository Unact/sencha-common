Ext.define('Ext.overrides.data.field.Number', {
    override: 'Ext.data.field.Number',

    stripRe: /[^\d.-]/g,

    // Since default JS decimalSeparator is '.', change all ',' to '.'
    // To do: Add decimal and thousand separators
    parse: function(v) {
        return parseFloat(String(v).replace(',', '.').replace(this.stripRe, ''));
    }
});
