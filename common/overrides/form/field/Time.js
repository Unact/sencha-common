Ext.form.field.Time.defaultTimeFormat = 'H:i';
Ext.define('Ext.overrides.form.field.Time', {
    override: 'Ext.form.field.Time',

    format: Ext.form.field.Time.defaultTimeFormat
});
