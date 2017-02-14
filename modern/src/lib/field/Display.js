Ext.define('Ext.modern.lib.field.Display', {
    extend: 'Ext.field.Text',
    xtype: 'displayfield',
    alternateClassName: 'Ext.form.Display',

    readOnly: true,
    clearIcon: false,

    updateValue: function(value, oldValue) {
        var component  = this.getComponent(),
        // allows value to be zero but not undefined or null (other falsey values)
        valueValid = value !== undefined && value !== null && value !== '';

        if (component) {
            component.setValue(this.formattedValue(value));
        }

        this.toggleClearTrigger(valueValid && this.isDirty());

        this.syncEmptyCls();

        if (this.initialized) {
            this.fireEvent('change', this, value, oldValue);
        }
    },

    formattedValue: function(value){
        return value;
    }
});
