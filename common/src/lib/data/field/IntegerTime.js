Ext.define('Ext.lib.data.field.IntegerTime', {
    extend: 'Ext.data.field.Field',
    alias: 'data.field.integertime',

    convert: function(v) {
        return v != null ? (Ext.isDate(v) ? v : new Date(0, 0, 1, parseInt(v / 60), v % 60, 0)) : null;
    },

    serialize: function(v) {
        return v.getHours() * 60 + v.getMinutes();
    }
});
