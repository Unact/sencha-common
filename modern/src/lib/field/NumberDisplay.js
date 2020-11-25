Ext.define('Ext.modern.lib.field.NumberDisplay', {
    extend: 'Ext.modern.lib.field.CustomDisplay',
    xtype: 'numberdisplayfield',

    format: '0,000.00',

    formattedValue: function(value){
        return Ext.util.Format.number(value, this.format);
    }
});
