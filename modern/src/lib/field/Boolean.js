Ext.define('Ext.modern.lib.field.Boolean', {
    extend: 'Ext.modern.lib.field.Display',
    xtype: 'booleanfield',
    alternateClassName: 'Ext.form.Boolean',

    falseText: 'Нет',
    trueText: 'Да',

    updateValue: function(value, oldValue) {
        var component  = this.getComponent(),
        // allows value to be zero but not undefined or null (other falsey values)
        valueValid = value !== undefined && value !== null && value !== '';

        if (component) {
            component.setValue(value ? this.trueText : this.falseText);
        }

        this.toggleClearTrigger(valueValid && this.isDirty());

        this.syncEmptyCls();

        if (this.initialized) {
            this.fireEvent('change', this, value, oldValue);
        }
    }
});
