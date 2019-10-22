Ext.define('Ext.overrides.grid.column.Column', {
    override: 'Ext.grid.column.Column',

    clearSort: function() {
        var me = this,
            grid = me.up('tablepanel'),
            store = grid.store,
            sorter = me.getSorter();

        if (sorter) {
            store.sorters.remove(sorter);
        } else {
            store.sorters.remove(me.getSortParam());
        }

        grid.view.refresh();
    }
});
