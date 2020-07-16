Ext.define('Ext.overrides.form.field.VTypes', {
    override: 'Ext.form.field.VTypes',

    phone: function(value) {
        return this.phoneRe.test(value);
    },

    phoneRe: /^\+\d\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/,

    phoneText: 'Не корректный телефон. Должен быть в формате +7 (999) 999-99-99',

    phneMask: /[\d\s\+\(\)-]/i
});
