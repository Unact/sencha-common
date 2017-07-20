Ext.define('Ext.locale.ru.Date', {
    override: 'Ext.Date',
    defaultFormat: 'd.m.Y'
});

Ext.define('Ext.overrides.data.Model', {
    override: 'Ext.data.Model',

    defaultErrorMessage: 'Установлены некорректные значения',
});

Ext.define('Ext.locale.ru.grid.RowEditor', {
    override: 'Ext.grid.RowEditor',

    saveBtnText: 'Сохранить',
    cancelBtnText: 'Отмена',
    errorsText: 'Ошибки',
    dirtyText: 'Вам необходимо сохранить изменения'
});

Ext.define('Ext.overrides.data.field.Field', {
    override: 'Ext.data.field.Field',

    defaultInvalidMessage: 'Поле заполнено некорректно'
});


Ext.define('Ext.locale.ru.window.MessageBox', {
    override: 'Ext.window.MessageBox',

    buttonText: {
        ok: 'ОК',
        yes: 'Да',
        no: 'Нет',
        cancel: 'Отмена'
    }
});

if (Ext.util && Ext.util.Format) {
    Ext.apply(Ext.util.Format, {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        currencySign: '\u0440\u0443\u0431',
        dateFormat: 'd.m.Y',

        ruMoney: function(v){
            return Ext.util.Format.currency(v, null, 2, true);
        },

        withoutDecimal: function(value){
            return Ext.util.Format.number(value, '0,000');
        }
    });
}
