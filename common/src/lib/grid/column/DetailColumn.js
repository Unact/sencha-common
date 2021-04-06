Ext.define('Ext.lib.grid.column.DetailColumn', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.detailcolumn',

    requires: [
        'Ext.lib.window.detailcolumn.Window'
    ],

    icon: '/images/application_view_detail.png',

    align: 'center',

    tooltip: 'Открыть таблицу с данными',

    /// Доп. данные для передачи в создаваемую деталь
    gridData: {},

    isActionDisabled: function(view, rowIdx, colIdx, item, rec) {
        return rec.phantom;
    },

    handler: function(view, rowIdx, colIdx, item,  e, rec) {
        Ext.create('Ext.lib.window.detailcolumn.Window', {
            parentRecord: rec,
            gridXtype: this.gridXtype,
            title: this.text,
            gridData: this.gridData
        }).show();
    }
});
