Ext.define('Ext.modern.lib.field.CustomDisplay', {
    extend: 'Ext.field.Text',
    xtype: 'customdisplayfield',
    alternateClassName: 'Ext.form.CustomDisplay',

    readOnly: true,
    clearIcon: false,

    updateInputValue: function(value, oldValue) {
        var me = this,
            inputMask = me.getInputMask();

        me.callParent([this.formattedValue(value), oldValue]);

        me.syncEmptyState();
        me.syncLabelPlaceholder(false);

        if (inputMask) {
            inputMask.onChange(this, value, oldValue);
        }
    },


    formattedValue: function(value){
        return value;
    }
});
