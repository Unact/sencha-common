Ext.define('Ext.overrides.panel.Table', {
    override : 'Ext.panel.Table',

    initComponent: function(){
        var me = this;

        me.callParent(arguments);

        me.initSpecialColumns();
    },

    setStore: function(){
        var me = this;
        var store = arguments[0];

        if(arguments.length>1){
            me.reconfigure(arguments[0], arguments[1]);
        } else {
            me.reconfigure(store);
        }

        if (me.autoLoad && !(store.loading || store.isLoaded())) {
            store.load();
        }

        me.initSpecialColumns();
    },

    initSpecialColumns: function(){
        var me = this;

        model = me.store.getModel();

        if(model){
            me.columns.every(function(column){
                if(column.xtype=='combocolumn' || column.xtype=='multifieldcolumn'){
                    column.addPrimaryValueField(model);
                }
                return true;
            });
        }
    },

    /**
     * Reconfigures the grid or tree with a new store and/or columns. Stores and columns
     * may also be passed as params.
     *
     *     grid.reconfigure(store, columns);
     *
     * Additionally, you can pass just a store or columns.
     *
     *     tree.reconfigure(store);
     *     // or
     *     grid.reconfigure(columns);
     *     // or
     *     tree.reconfigure(null, columns);
     *
     * If you're using locked columns, the {@link #enableLocking} config should be set
     * to `true` before the reconfigure method is executed.
     *
     * @param {Ext.data.Store/Object} [store] The new store instance or store config. You can
     * pass `null` if no new store.
     * @param {Object[]} [columns] An array of column configs
     * @param {Object} [binding] Used for detect binding initialization
     */
    reconfigure: function() {
        var me = this,
            oldStore = me.store,
            headerCt = me.headerCt,
            lockable = me.lockable,
            oldColumns = headerCt ? headerCt.items.getRange() : me.columns,
            view = me.getView(),
            block, refreshCounter,
            store, columns, binding;

        switch(arguments.length){
            case 1:
                if(Ext.isArray(arguments[0])){
                    columns = arguments[0];
                } else {
                    store = arguments[0];
                }
            break;
            case 2:
                if(Ext.isArray(arguments[0])){
                    columns = arguments[0];
                    binding = arguments[1];
                } else {
                    store = arguments[0];

                    if(Ext.isArray(arguments[1])){
                        columns = arguments[1];
                    } else {
                        binding = arguments[1];
                    }
                }
            break;
            case 3:
                store = arguments[0];
                columns = arguments[1];
                binding = arguments[2];
            break;
        }

        // Make copy in case the beforereconfigure listener mutates it.
        if (columns) {
            columns = Ext.Array.slice(columns);
        }

        me.reconfiguring = true;
        if (store) {
            store = Ext.StoreManager.lookup(store);
        }
        me.fireEvent('beforereconfigure', me, store, columns, oldStore, oldColumns);

        Ext.suspendLayouts();

        if (lockable) {
            me.reconfigureLockable(store, columns);
        } else {
            // Prevent the view from refreshing until we have resumed layouts and any columns are rendered
            block = view.blockRefresh;
            view.blockRefresh = true;

            // The following test compares the result of an assignment of the store var with the oldStore var.
            // This saves a large amount of code.
            //
            // Note that we need to process the store first in case one or more passed columns (if there are any)
            // have active gridfilters with values which would filter the currently-bound store.
            if (store && store !== oldStore) {
                if(binding && binding.calls===1){
                    store.setSorters(oldStore.getSorters().items);
                }
                me.unbindStore();
                me.bindStore(store);
            }

            if (columns) {
                // new columns, delete scroll pos
                delete me.scrollXPos;
                headerCt.removeAll();
                headerCt.add(columns);
            }

            view.blockRefresh = block;
            refreshCounter = view.refreshCounter;
        }

        Ext.resumeLayouts(true);
        if (lockable) {
            me.afterReconfigureLockable();
        } else if (view.refreshCounter === refreshCounter) {
            // If the layout resumption didn't trigger the view to refresh, do it here
            view.refreshView();
        }

        me.fireEvent('reconfigure', me, store, columns, oldStore, oldColumns);
        delete me.reconfiguring;
    },

    applyState: function(state) {
        if (state) {
            this.headerCt.applyColumnsState(this.buildColumnHash(state.columns), null);
        }
    }
});
