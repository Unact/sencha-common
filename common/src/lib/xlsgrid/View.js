Ext.define('Ext.lib.xlsgrid.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.xlsgrid',

    requires: ['Ext.lib.xlsgrid.ViewController'],

    controller: 'xlsgrid',

    /*
        Окно с полем XLS, в которое вставляется CSV.
        В конфигах колонок (cfg.columns[]), которые будут в XLS, нужно указать:
            1. columnInXls (обязательно) - номер колонки в CSV
            2. identificator - поле является идентификатором
            3. required - поле является обязательным
        Должен быть один идентификатор - целое число, уникальность значений не обязательна.
        В ViewController нужно определить метод getRequestOptions, нужен для загрузки данных из БД о вставленных строках.
        Метод возвращает объект с полями:
            1. url
            2. method
            3. timeout
            4. params
    */

    init: function(currentConfig) {
        this.callParent(arguments);
    },

    config: {
        autoEditOnAdd: 0,
        
        afterButtons: [{
            xtype: 'button',
            text: 'Очистить',
            listeners: {
                click: 'onClearButtonClick',
                scope: this.controller
            }
        }, {
            xtype: 'textareafield',
            fieldLabel: 'XLS',
            width: 100,
            grow: true,
            growMax: 1,
            minHeight: 20,
            labelWidth: 25,
            style: {
                marginLeft: '15px'
            },
            listeners: {
                change: 'onXlsChanged',
                scope: this.controller
            }
        }]
    }
});
