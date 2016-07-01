Ext.define('Ext.lib.xlsgrid.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.xlsgrid',

    requires: ['Ext.lib.xlsgrid.ViewController'],

    controller: 'xlsgrid',

    init: function(currentConfig) {
        this.callParent(arguments);
    },

    config: {
        autoEditOnAdd: 0,
        disableDeleteColumn: true,
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
