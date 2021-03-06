Ext.define('Ext.lib.grid.column.ComboColumn', {
    extend: 'Ext.lib.grid.column.ChoiceColumn',
    alias: 'widget.combocolumn',

    requires: [
        'Ext.lib.grid.column.ChoiceColumn',
        'Ext.lib.form.field.ComboColumnField'
    ],

    defaultFieldConfig: function() {
        var me = this;

        return {
            queryMode: 'local',
            displayField: me.primaryValue,
            valueField: me.primaryKey,
            column: me,
            name: me.dataIndex,
            triggerAction: 'all',
            xtype: 'combocolumnfield',
            selectOnFocus: true
        };
    },
});
