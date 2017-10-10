Ext.form.field.Date.defaultDateFormat = 'd.m.Y';
Ext.form.field.Date.defaultTimeFormat = 'H:i';
Ext.define('Ext.overrides.form.field.Date', {
    override: 'Ext.form.field.Date',

    statics: {
        dateWithTimeFormat: 'd.m.Y H:i'
    },

    startDay: 1,                                  //Начало недели - понедельник
    format: Ext.form.field.Date.defaultDateFormat //Год записывается четырьмя знаками
});
