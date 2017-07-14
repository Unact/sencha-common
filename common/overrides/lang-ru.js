/* ***********************************************************
 * Доопределяем руссификацию из /ext/locale/ext-lang-ru.js
 *
 * Причина:
 * в ext-lang-ru.js кривая руссификация. календарь по-прежнему начинается с воскресенья.
 * ext-lang-ru.js менять не будем, может, в будущих версиях они исправят эту багу.
 *
 ************************************************************/

Ext.override(
    Ext.form.field.Date,
    {
        startDay : 1,        //Начало недели - понедельник
        format : 'd.m.Y',    //Год записывается четырьмя знаками

        statics: {
            dateWithTimeFormat: 'd.m.Y H:i'
        }
    }
);

Ext.define("app.locale.ru.form.field.Time", {                 //в ext-lang-ru.js вообще отсутствует время
    override: "Ext.form.field.Time",
    format: "H:i",
    minText: "Время в этом поле должно быть позже {0}",
    maxText: "Время в этом поле должно быть раньше {0}",
    invalidText: "{0} не является правильным временем"
});

Ext.define("Ext.locale.ru.form.field.Number", {
    override: "Ext.form.field.Number",
    decimalSeparator: ","
});

Ext.override(Ext.Date, {
    defaultFormat: 'd.m.Y'
});
