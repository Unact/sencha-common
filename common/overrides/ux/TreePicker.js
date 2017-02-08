/**
 * A Picker field that contains a tree panel on its popup, enabling selection of tree nodes.
 */
Ext.define('Ext.overrides.ux.TreePicker', {
	override: 'Ext.ux.TreePicker',

    mixins: [
        'Ext.util.StoreHolder'
    ],

    editable: true,

    pickerAlign: 'tl-bl',

    maxPickerHeight: 400,

    anyMatch: true,

    caseSensitive: false,

    enableRegEx: false,

    queryFilter: null,

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
                manageHeight: false,
                shadow: false,
                listeners: {
                    scope: me,
                    itemclick: me.onItemClick
                },
                viewConfig: {
                    listeners: {
                        scope: me,
                        render: me.onViewRender,
                        afteritemexpand: me.refreshPickerView,
                        afteritemcollapse: me.refreshPickerView,
                        beforeitemclick: function(){
                            var view = picker.getView();
                            picker._scrollY = view.getEl().getScroll().top;
                        }
                    }
                },
                layout: {
                    // Set the scroll after the layout.
                    finishedLayout: function(){
                        var layoutFns = Ext.layout.container.Fit.prototype;
                        layoutFns.finishedLayout.apply(this, arguments);

                        if (picker._scrollY) {
                           picker.getView().getEl().dom.scrollTop = picker._scrollY;
                        }
                    }
                }
            });

        return picker;
    },

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

    refreshPickerView: function(){
        var me = this;
        var picker = me.getPicker();

        picker.getView().refresh();
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

        node.expand();

        picker.ensureVisible(node, {
            select: true,
            focus: true
        });
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
    },

    onFieldMutation: function(e) {
        var me = this,
            key = e.getKey(),
            isDelete = key === e.BACKSPACE || key === e.DELETE,
            rawValue = me.inputEl.dom.value,
            len = rawValue.length,
            store = me.getStore(),
            node = store.getRoot();

        // Do not process two events for the same mutation.
        // For example an input event followed by the keyup that caused it.
        // We must process delete keyups.
        // Also, do not process TAB event which fires on arrival.
        if (!me.readOnly && (rawValue !== me.lastMutatedValue || isDelete) && key !== e.TAB) {
            me.lastMutatedValue = rawValue;
            me.lastKey = key;
            if (len && (e.type !== 'keyup' || (!e.isSpecialKey() || isDelete))) {

                store.removeFilter(me.queryFilter, true);
                filter = me.queryFilter = new Ext.util.Filter({
                    id: me.id + '-filter',
                    anyMatch: me.anyMatch,
                    caseSensitive: me.caseSensitive,
                    root: 'data',
                    property: me.displayField,
                    value: me.enableRegEx ? new RegExp(rawValue) : rawValue
                });
                store.addFilter(filter, true);

                me.collapse();

                if (me.store.getCount() || me.getPicker().emptyText) {
                    // The filter changing was done with events suppressed, so
                    // refresh the picker DOM while hidden and it will layout on show.
                    node.expandChildren(true);
                    me.expand();
                }
                me.focus();
            } else {
                // We have *erased* back to empty if key is a delete, or it is a non-key event (cut/copy)
                if (!len && (!key || isDelete)) {
                    // This portion of code may end up calling setValue will check for change. But since
                    // it's come from field mutations, we need to respect the checkChangeBuffer, so
                    // we suspend checks here, it will be handled by callParent
                    // Essentially a silent setValue.
                    // Clear our value
                    me.value = null;
                    // Just erased back to empty. Hide the dropdown.
                    me.collapse();

                    // There may have been a local filter if we were querying locally.
                    // Clear the query filter and suppress the consequences (we do not want a list refresh).
                    if (me.queryFilter) {
                        // Must set changingFilters flag for this.checkValueOnChange.
                        // the suppressEvents flag does not affect the filterchange event
                        me.changingFilters = true;
                        me.store.removeFilter(me.queryFilter, true);
                        me.changingFilters = false;
                    }
                    node.collapse(true);
                }
                me.callParent([e]);
            }
            me.refreshPickerView();
        }
    },

});
