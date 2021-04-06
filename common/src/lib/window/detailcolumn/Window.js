Ext.define('Ext.lib.window.detailcolumn.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.windowdetailcolumnwindow',

    height: 350,
    width: 1000,

    layout: 'border',

    modal: true,

    constructor: function(config) {
        this.parentRecord = config.parentRecord;
        this.items = [{
            region: 'center',
            xtype: config.gridXtype
        }];
        this.callParent(arguments);
    },

    onDestroy: function() {
        Ext.GlobalEvents.fireEvent('endserveroperation', true, null, true);
    }
});
