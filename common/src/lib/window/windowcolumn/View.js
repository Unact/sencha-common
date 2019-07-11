Ext.define('Ext.lib.window.windowcolumn.View', {
    extend: 'Ext.window.Window',
    alias: 'widget.windowwindowcolumn',

    height: 300,
    width: 600,

    layout: 'border',

    constructor: function(config) {
        this.parentColumn = config.parentColumn;
        this.parentRecord = config.parentRecord;

        this.title = this.parentColumn.text;
        this.items = [{
            region: 'center',
            xtype: this.parentColumn.gridXtype
        }];
        this.buttons = [{
            text: 'Выбрать',
            handler: 'select',
            scope: this
        }, {
            text: 'Отмена',
            handler: 'close',
            scope: this
        }],

        this.callParent(arguments);
    },

    select: function() {
        const parentColumn = this.parentColumn;
        const masterRecord = this.down(this.parentColumn.gridXtype).getSelectionModel().getSelection()[0];

        this.parentRecord.set(parentColumn.dataIndex, masterRecord.get(parentColumn.primaryKey));
        this.parentRecord.set(parentColumn.fieldName, masterRecord.get(parentColumn.primaryValue));
        this.close();
    }
});