Ext.define('Ext.overrides.grid.CellContext', {
    override: 'Ext.grid.CellContext',

    /// FIX
    /// https://www.sencha.com/forum/showthread.php?469449-EXTJS-6-5-3-Focus-bug-in-spreadsheet-selection-model
    setRow: function (row) {
        if (row === null)
            row = undefined;
        return this.callParent(arguments);
    },

    /// FIX
    /// https://www.sencha.com/forum/showthread.php?469449-EXTJS-6-5-3-Focus-bug-in-spreadsheet-selection-model
    setColumn: function(col) {
        if (col === null)
            col = undefined;
        return this.callParent(arguments);
    }
});
