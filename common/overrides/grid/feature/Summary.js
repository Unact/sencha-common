Ext.define('Ext.overrides.grid.feature.Summary', {
    override: 'Ext.grid.feature.Summary',

    refresh: function(view) {
        var me = this, record, row;

        if (!me.disabled && me.showSummaryRow) {
            record = me.createSummaryRecord(view);
            row = me.getSummaryRowPlaceholder(view);
            row.replaceWith(view.createRowElement(record, -1).querySelector(me.summaryRowSelector))
        }
    }
});
