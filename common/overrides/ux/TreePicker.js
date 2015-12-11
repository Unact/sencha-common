/**
 * A Picker field that contains a tree panel on its popup, enabling selection of tree nodes.
 */
Ext.define('Ext.overrides.ux.TreePicker', {
	override : 'Ext.ux.TreePicker',

    mixins: [
        'Ext.util.StoreHolder'
    ],

    editable: true,

    getStoreListeners: function(){
    	var me = this;

    	return {
    		scope: me,
	    	load: me.onLoad,
	        update: me.onUpdate
	    };
    },

    /**
     * Creates and returns the tree panel to be used as this field's picker.
     */
    createPicker: function() {
        var me = this,
            picker = new Ext.tree.Panel({
                shrinkWrapDock: 2,
                store: me.store,
                doFocus: true,
                floating: true,
                displayField: me.displayField,
                columns: me.columns,
                maxHeight: me.maxPickerHeight,
                manageHeight: true,
                shadow: false,
                listeners: {
                    scope: me,
                    itemclick: me.onItemClick,
                    afteritemexpand: me.onAfterItemExpand,
                    afteritemcollapse: me.onAfterItemCollapse
                },
                viewConfig: {
                    listeners: {
                        scope: me,
                        render: me.onViewRender
                    }
                }
            }),
            view = picker.getView();

        return picker;
    },
    /**
     * @event select
     * Fires when a tree node is selected
     * @param {Ext.ux.TreePicker} picker        This tree picker
     * @param {Ext.data.Model} record           The selected record
     */

    initComponent: function() {
        var me = this;

        me.bindStore(me.store || 'ext-empty-store', true);

        me.callParent(arguments);
    },

    onBindStore: function(store, initial, propertyName, oldStore){
    	var me = this;

    	if(me.picker){
    		me.picker.setStore(store);
    	}
    },

    onAfterItemCollapse: function(node, eOpts) {
        // Since onItemCollapse scrolls to top, we have to scroll back to
        // the node which we collapsed.
        // Ugly but works!
        var me = this,
            view = me.picker.getView();
        view.scrollToRecord(node);
    },

    onAfterItemExpand: function(node, eOpts) {
        // Since onItemExpand scrolls to top, we have to scroll back to
        // the node which we expanded.
        // Ugly but works!
        var me = this,
            view = me.picker.getView();
        view.scrollToRecord(node);
    },

    /**
     * Runs when the picker is expanded.  Selects the appropriate tree node based on the value of the input element,
     * and focuses the picker so that keyboard navigation will work.
     * @private
     */
    onExpand: function() {
        var me = this;
        var picker = me.picker;
        var store = picker.getStore();
        var value = me.value;
        var node;
		var view = picker.getView();

        if (value) {
            node = store.getNodeById(value);
        }

        if (!node) {
            node = store.getRoot();
        }

        picker.selectPath(node.getPath());
		view.scrollToRecord(node);
    },

    /**
     * Sets the specified value into the field
     * @param {Mixed} value
     * @return {Ext.ux.TreePicker} this
     */
    setValue: function(value) {
        var me = this;
        var store = me.getStore();
        var record;
        var bind;

        me.value = value;

        if (store.loading || !store.isTreeStore) {
            // Called while the Store is loading. Ensure it is processed by the onLoad method.
            return me;
        }

        // try to find a record in the store that matches the value
        if (value) {
            record = store.getNodeById(value);
        } else {
            record = store.getRoot();
            me.value = record.getId();
        }

        // set the raw value to the record's display field if a record was found
        me.setRawValue(record ? record.get(me.displayField) : '');

        bind = me.getBind();
        if(bind.value){
        	bind.value.setValue(value);
        }

        return me;
    }
});
