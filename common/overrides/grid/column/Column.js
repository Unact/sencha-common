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
    },

    applyColumnState: function(state, storeState) {
        var me = this,
            sorter = me.getSorter(),
            stateSorters = storeState && storeState.sorters,
            len, i, savedSorter, mySorterId;
        // If we have been configured with a sorter, then there SHOULD be a sorter config
        // in the storeState with a corresponding ID from which we must restore our sorter's state.
        // (The only state we can restore is direction).
        // Then we replace the state entry with the real sorter. We MUST do this because the sorter
        // is likely to have a custom sortFn.
        if (sorter && stateSorters && (len = stateSorters.length)) {
            mySorterId = sorter.getId();
            for (i = 0; !savedSorter && i < len; i++) {
                if (stateSorters[i].id === mySorterId) {
                    sorter.setDirection(stateSorters[i].direction);
                    stateSorters[i] = sorter;
                    break;
                }
            }
        }
        // apply any columns
        me.applyColumnsState(state.columns);
        // Only state properties which were saved should be restored.
        // (Only user-changed properties were saved by getState)
        if (state.hidden != null) {
            me.hidden = state.hidden;
        }
        if (state.locked != null) {
            me.locked = state.locked;
        }
        if (state.sortable != null) {
            me.sortable = state.sortable;
        }

        /// FIX
        /// If a column has child columns its width cannot be restored from state
        /// since its width is calculated from child widths
        if (!this.columnManager) {
            if (state.width != null) {
                me.flex = null;
                me.width = state.width;
            } else if (state.flex != null) {
                me.width = null;
                me.flex = state.flex;
            }
        }
    },
});
