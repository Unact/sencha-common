/**
 * A Picker field that contains a tree panel on its popup, enabling selection of tree nodes.
 */
Ext.define('Ext.lib.form.field.TreePicker', {
    extend: 'Ext.form.field.Picker',
    xtype: 'treepicker',

    uses: [
        'Ext.tree.Panel'
    ],

    mixins: [
        'Ext.util.StoreHolder'
    ],

    triggerCls: Ext.baseCSSPrefix + 'form-arrow-trigger',

    config: {
        store: null,
        displayField: null,
        columns: null,
        selectOnTab: true,
        minPickerHeight: 100,
        readOnly: false,
        editable: true,
        pickerAlign: 'tl-bl',
        maxPickerHeight: 400,
        anyMatch: true,
        caseSensitive: false,
        enableRegEx: false,
        queryFilter: null,
        expandChildrenOnFilter: true
    },


    initComponent: function() {
        var me = this;

        me.bindStore(me.store || 'ext-empty-store', true);

        me.callParent(arguments);

        me.mon(me.store, {
            scope: me,
            load: me.onLoad,
            update: me.onUpdate
        });
    },

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
                animate: false,
                store: me.store,
                doFocus: true,
                floating: true,
                displayField: me.displayField,
                columns: me.columns,
                maxHeight: me.maxPickerHeight,
                rootVisible: me.rootVisible || false,
                shadow: false,
                listeners: {
                    scope: me,
                    itemclick: me.onItemClick
                },
                viewConfig: {
                    listeners: {
                        scope: me,
                        render: me.onViewRender
                    }
                }
            });

        return picker;
    },

    onBindStore: function(store, initial) {
        var me = this;
        var picker = me.picker;

        if (store && picker && picker.getStore() !== store) {
            picker.bindStore(store);
        }
    },

    onUnbindStore: function() {
        var me = this;
        var picker = me.picker;

        if (picker) {
            picker.bindStore(null);
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

        node.bubble(function(innerNode) {
            if (!innerNode.isRoot()) {
                innerNode.expand();
            }
        });
        me.picker.selModel.select(node);
        view.scrollToRecord(node);
    },

    /**
     * Sets the specified value into the field
     * @param {Mixed} value
     * @return {Ext.lib.form.field.TreePicker} this
     */
    setValue: function(value) {
        var me = this;
        var store = me.getStore();
        var isLoaded = store.getCount() > 0 || store.isLoaded();
        var pendingLoad = store.hasPendingLoad();
        var unloaded = !isLoaded && !pendingLoad;
        var isEmptyStore = store.isEmptyStore;
        var bind = me.getBind();
        var record;


       if (pendingLoad || unloaded || !isLoaded || isEmptyStore) {
            if (value == null || !value.isModel) {
                me.value = value;
            }

            if (unloaded && !isEmptyStore) {
                store.load();
                return me;
            }

            if (value == null || !value.isModel || isEmptyStore) {
                return me;
            }
        }

        // try to find a record in the store that matches the value
        if (value != null) {
            record = store.getNodeById(value);
            me.value = value;
        } else {
            record = null;
            me.value = null;
        }

        // set the raw value to the record's display field if a record was found
        me.setRawValue(record ? record.get(me.displayField) : '');

        if (bind && bind.value) {
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
                    node.expandChildren(me.expandChildrenOnFilter);
                    me.expand();
                }
                me.focus();
            } else {
                // We have *erased* back to empty if key is a delete, or it is a non-key event (cut/copy)
                if (!len && (!key || isDelete)) {
                    me.setValue(null);
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



    onViewRender: function(view){
        view.getEl().on('keypress', this.onPickerKeypress, this);
    },

    /**
     * repaints the tree view
     */
    repaintPickerView: function() {
        var style = this.picker.getView().getEl().dom.style;

        // can't use Element.repaint because it contains a setTimeout, which results in a flicker effect
        style.display = style.display;
    },

    /**
     * Handles a click even on a tree node
     * @private
     * @param {Ext.tree.View} view
     * @param {Ext.data.Model} record
     * @param {HTMLElement} node
     * @param {Number} rowIndex
     * @param {Ext.event.Event} e
     */
    onItemClick: function(view, record, node, rowIndex, e) {
        this.selectItem(record);
    },

    /**
     * Handles a keypress event on the picker element
     * @private
     * @param {Ext.event.Event} e
     * @param {HTMLElement} el
     */
    onPickerKeypress: function(e, el) {
        var key = e.getKey();

        if(key === e.ENTER || (key === e.TAB && this.selectOnTab)) {
            this.selectItem(this.picker.getSelectionModel().getSelection()[0]);
        }
    },

    /**
     * Changes the selection to a given record and closes the picker
     * @private
     * @param {Ext.data.Model} record
     */
    selectItem: function(record) {
        var me = this;
        me.setValue(record.getId());
        me.fireEvent('select', me, record);
        me.collapse();
    },

    getSubmitValue: function(){
        return this.value;
    },

    /**
     * Returns the current data value of the field (the idProperty of the record)
     * @return {Number}
     */
    getValue: function() {
        return this.value;
    },

    /**
     * Handles the store's load event.
     * @private
     */
    onLoad: function() {
        var value = this.value;

        if (value) {
            this.setValue(value);
        }
    },

    onUpdate: function(store, rec, type, modifiedFieldNames){
        var display = this.displayField;

        if (type === 'edit' && modifiedFieldNames && Ext.Array.contains(modifiedFieldNames, display) && this.value === rec.getId()) {
            this.setRawValue(rec.get(display));
        }
    }
});
