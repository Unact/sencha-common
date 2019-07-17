Ext.define('Ext.lib.grid.column.WindowColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.windowcolumn',

    requires: [
        'Ext.lib.window.windowcolumn.View'
    ],

    defineFieldName: function(newTail) {
        var oldTail = '_id';
        var len = oldTail.length;
        if (this.dataIndex.substr(this.dataIndex.length - len, len) === oldTail) {
            return this.dataIndex.substr(0, this.dataIndex.length - len) + '_' + newTail;
        } else {
            return this.dataIndex + '_' + newTail;
        }
    },

    onFocus: function() {
        var grid = this.up('grid');
        this.windowView = Ext.create('Ext.lib.window.windowcolumn.View', {
            parentColumn: this,
            parentRecord: grid.getSelection()[0]
        });
        this.windowView.show();
        grid.getView().refresh();
    },

    constructor: function(config) {
        var me = this;

        me.renderer = function(value, metaData, record) {
            return record.get(me.fieldName);
        };
        me.editor = {
            xtype: 'textfield',
            listeners: {
                focus: 'onFocus',
                scope: me
            }
        };

        me.gridXtype = config.gridXtype;
        me.primaryKey = config.primaryKey || 'id';
        me.primaryValue = config.primaryValue || 'name';

        me.callParent(arguments);

        me.fieldName = me.defineFieldName(me.primaryValue);
    },

    addPrimaryValueField: function(model){
        var me = this;
        var field = null;

        model.getFields().forEach(function(fieldFromGrid) {
            if (fieldFromGrid.name === me.fieldName) {
                field = fieldFromGrid;
            }
            return field;
        });

        if (!field) {
            model.addFields([{
                name: me.fieldName,
                persist: false
            }]);
        }
    }
});
