Ext.define('Ext.modern.lib.field.Boolean', {
    extend: 'Ext.modern.lib.field.Display',
    xtype: 'booleanfield',
    alternateClassName: 'Ext.form.Boolean',

    falseText: 'Нет',
    trueText: 'Да',

    formattedValue: function(value){
        return value ? this.trueText : this.falseText
    }
});
