Ext.define('Ext.overrides.field.Select', {
    override: 'Ext.field.Select',

    config: {
        autoSelect: false
    },
    /**
     * @private
     */
    applyValue: function(value) {
        let record = value;
        let index;
        let store;
        //we call this so that the options configruation gets intiailized, so that a store exists, and we can
        //find the correct value
        this.getOptions();

        store = this.getStore();

        if(!store && (value || value === 0)){
            // the store might be updated later so we need to cache this value and apply it later
            this.cachedValue = value;
        }

        if ((value || value === 0) && !value.isModel && store) {
            index = store.find(this.getValueField(), value, null, null, null, true);

            if (index === -1) {
                index = store.find(this.getDisplayField(), value, null, null, null, true);
            }

            record = store.getAt(index);
        }
        this.value = record.get(this.getValueField());

        return value;
    },

    updateValue: function(value, oldValue) {
        const component = this.getComponent();
        let displayValueRecord;
        let displayValue = '';

        this.value = value;

        if (value) {
            this.settingSelection = true;
            this.setSelection(this.getCurrentStoreRecord());
            this.settingSelection = false;
            if (value) {
                displayValue = this.getValueFieldValue() || '';
            }
        }

        if (component) {
            component.setValue(displayValue);
        }

        if (this.initialized) {
            this.fireEvent('change', this, value, oldValue);
        }
    },

    getValue: function() {
        return this.value
    },

    applySelection: function(selection) {
        return selection || null;
    },

    updateSelection: function(selection) {
        if (!this.settingSelection) {
            this.setValue(selection ? selection.get(this.getCurrentStoreRecord()) : null);
        }
    },

    getCurrentStoreRecord: function(){
        return this.getStore().findExactRecord(this.getValueField(), this.value);
    },

    getValueFieldValue: function(){
        const record = this.getCurrentStoreRecord();
        return record ? record.get(this.getDisplayField()) : null;
    },

    /**
     * @private
     */
    onListSelect: function(item, record) {
        if (record) {
            this.setValue(record.get(this.getValueField()));
        }
    },

    /**
     * @private
     */
    onPickerChange: function(picker, value) {
        const newValue = value[this.getName()];
        const store = this.getStore();
        const index = store.find(this.getValueField(), newValue, null, null, null, true);
        const record = store.getAt(index);

        this.setValue(record.get(this.getValueField()));
    },

    /**
     * Resets the Select field to the value of the first record in the store.
     * @return {Ext.field.Select} this
     * @chainable
     */
    reset: function() {
        let record;
        let store;
        let usePicker;
        let picker;

        if (this.getAutoSelect()) {
            store = this.getStore();

            record = this.originalValue ? this.originalValue : store.getAt(0);
        } else {
            usePicker = this.getUsePicker();
            picker = usePicker ? this.phonePicker : this.tabletPicker;

            if (picker) {
                picker = picker.child(usePicker ? 'pickerslot' : 'dataview');
                picker.deselectAll();
            }
            record = null;
        }

        this.setValue(record.get(this.getValueField()));

        return this;
    }
});
