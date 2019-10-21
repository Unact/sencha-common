Ext.define('Ext.overrides.grid.header.Container', {
    override: 'Ext.grid.header.Container',

    getColumnBy: function(propertyName, propertyValue){
        var columns = this.getGridColumns();

        return columns.filter(function(column){
            return column[propertyName]==propertyValue;
        })[0];
    },

    applyColumnsState: function(columnsState, storeState) {
        if (!columnsState) {
            return;
        }

        var me     = this;
        var items  = me.items.items;
        var count  = items.length;
        var i      = 0;
        var length;
        var col;
        var columnState;
        var index;
        var moved = false;
        var newOrder = [];
        var newCols = [];

        for (i = 0; i < count; i++) {
            col = items[i];
            columnState = columnsState[col.getStateId()];

            // There's a column state for this column.
            // Add it to the newOrder array at the specified index
            if (columnState) {
                index = columnState.index;

                // FIX
                // Fixes restoring column width from state
                if (columnState.width != null) {
                    col.width = columnState.width;
                }

                // FIX
                // Fixes restoring column visibility from state
                if (columnState.hidden != null) {
                    col.hidden = columnState.hidden;
                }

                newOrder[index] = col;
                if (i !== index) {
                    moved = true;
                }

            }
            // A new column.
            // It must be inserted at this index after state restoration,
            else {
                newCols.push({
                    index: i,
                    column: col
                });
            }
        }

        // If any saved columns were missing, close the gaps where they were
        newOrder = Ext.Array.clean(newOrder);

        // New column encountered.
        // Insert them into the newOrder at their configured position
        length = newCols.length;
        if (length) {
            for (i = 0; i < length; i++) {
                columnState = newCols[i];
                index = columnState.index;
                if (index < newOrder.length) {
                    moved = true;
                    Ext.Array.splice(newOrder, index, 0, columnState.column);
                } else {
                    newOrder.push(columnState.column);
                }
            }
        }
        // FIX
        // Fixes view model not firing binds after restoring column positions
        if (moved) {
            me.add(newOrder);
            me.purgeCache();
        }
    }
});
