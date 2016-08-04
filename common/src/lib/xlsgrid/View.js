Ext.define('Ext.lib.xlsgrid.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.xlsgrid',

    requires: [
        'Ext.lib.xlsgrid.ViewController',
        'Ext.lib.grid.plugin.RowClipboard'
    ],

    controller: 'xlsgrid',

    /*
        Окно с полем XLS, в которое вставляется CSV.

        В конфигах колонок (cfg.columns[]), которые будут в XLS, нужно указать:
            1. columnInXls (обязательно) - номер колонки в CSV
            2. identificator (обязательно) - идентификатор - целое число
            3. required - поле является обязательным
        Уникальность идентификатора задается конфигом uniqueByIdentificator; если он false, то уникальность по всей записи.
        В ViewController нужно определить методы getRequestOptions и getSaveOptions.
        Метод должен возвращать объект с полями:
            1. url
            2. method
            3. timeout
            4. params
            5. jsonData (в getSaveOptions)
    */

    listeners: {
        viewready: 'onViewReady',
        validateEdit: 'onValidateEdit',
        scope: 'controller'
    },

    config: {
        uniqueByIdentificator: true,
        autoEditOnAdd: 0,

        extraPlugins: [{
            ptype: 'rowclipboard',
            enabledActions: ['paste'],
            pasteInEditableOnly: true,
            insertPrimaryValue: true
        }],

        afterButtons: [{
            xtype: 'button',
            text: 'Очистить',
            listeners: {
                click: 'onClearButtonClick',
                scope: this.controller
            }
        }]
    }
});
