Ext.define('Ext.lib.grid.column.TreepickerColumn', {
    extend: 'Ext.lib.grid.column.ChoiceColumn',
    alias: 'widget.treepickercolumn',

    requires: [
        'Ext.lib.grid.column.ChoiceColumn',
        'Ext.lib.form.field.TreePicker'
    ],

    defaultFieldConfig: function() {
        var me = this;

        return {
            displayField: me.primaryValue,
            xtype: 'treepicker',
            rootVisible: true,
            column: me,
            name: me.dataIndex,
            selectOnFocus: true
        };
    }
});
