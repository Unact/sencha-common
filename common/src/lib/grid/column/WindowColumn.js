Ext.define('Ext.lib.grid.column.WindowColumn', {
    extend: 'Ext.lib.grid.column.ChoiceColumn',
    alias: 'widget.windowcolumn',

    requires: [
        'Ext.lib.grid.column.ChoiceColumn',
        'Ext.lib.window.windowcolumn.View'
    ],

    defaultFieldConfig: function() {
        var me = this;

        return {
            xtype: 'textfield',
            listeners: {
                focus: 'onFieldFocus',
                scope: me
            }
        };
    },

    onFieldFocus: function() {
        var grid = this.up('grid');

        if (this.windowView == null || this.windowView.destroyed) {
            this.windowView = Ext.create('Ext.lib.window.windowcolumn.View', {
                parentColumn: this,
                parentRecord: grid.getSelection()[0]
            });
            this.windowView.show();
        }

        new Ext.util.DelayedTask(function() {
            grid.findPlugin('cellediting').cancelEdit();
        }).delay(0);
    }
});
