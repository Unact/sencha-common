Ext.define('Ext.overrides.form.field.ComboBox', {
    override: 'Ext.form.field.ComboBox',

    minChars: 3,

    // private implementation to set or add a value/values
    doSetValue: function(value /* private for use by addValue */, add) {
        var me = this,
            store = me.getStore(),
            Model = store.getModel(),
            matchedRecords = [],
            valueArray = [],
            key,
            autoLoadOnValue = me.autoLoadOnValue,
            isLoaded = store.getCount() > 0 || store.isLoaded(),
            pendingLoad = store.hasPendingLoad(),
            unloaded = autoLoadOnValue && !isLoaded && !pendingLoad,
            forceSelection = me.forceSelection,
            selModel = me.pickerSelectionModel,
            displayTplData = me.displayTplData || (me.displayTplData = []),
            displayIsValue = me.displayField === me.valueField,
            i, len, record, dataObj, raw;

        //<debug>
        if (add && !me.multiSelect) {
            Ext.Error.raise('Cannot add values to non muiltiSelect ComboBox');
        }
        //</debug>

        // Called while the Store is loading or we don't have the real store bound yet.
        // Ensure it is processed by the onLoad/bindStore. If displayField === valueField, then
        // there is no point entering this branch because whatever we're setting will be "correct" when
        // the store loads.
        if (value != null && !displayIsValue && (pendingLoad || unloaded || !isLoaded || store.isEmptyStore)) {
            if (value.isModel) {
                displayTplData.length = 0;
                displayTplData.push(value.data);
                raw = me.getDisplayValue();
            }

            if (add) {
                me.value = Ext.Array.from(me.value).concat(value);
            } else {
                if (value.isModel) {
                    value = value.get(me.valueField);
                }
                me.value = value;
            }

            me.setHiddenValue(me.value);
            // If we have a model, show the display value from that, otherwise we can't
            // know what it will be, so empty it out
            me.setRawValue(raw || '');

            if (unloaded && store.getProxy().isRemote) {
                store.load();
            }

            return me;
        }

        // This method processes multi-values, so ensure value is an array.
        value = add ? Ext.Array.from(me.value).concat(value) : Ext.Array.from(value);

        // Loop through values, matching each from the Store, and collecting matched records
        for (i = 0, len = value.length; i < len; i++) {
            record = value[i];

            // Set value was a key, look up in the store by that key
            if (!record || !record.isModel) {
                record = me.findRecordByValue(key = record);

                // The value might be in a new record created from an unknown value (if !me.forceSelection).
                // Or it could be a picked record which is filtered out of the main store.
                if (!record) {
                    record = me.valueCollection.find(me.valueField, key);
                }
            }
            // record was not found, this could happen because
            // store is not loaded or they set a value not in the store
            if (!record) {
                // If we are allowing insertion of values not represented in the Store, then push the value and
                // create a new record to push as a display value for use by the displayTpl
                if (!forceSelection) {
                    if (!record) {
                        dataObj = {};
                        dataObj[me.displayField] = value[i];
                        if (me.valueField && me.displayField !== me.valueField) {
                            dataObj[me.valueField] = 0;
                        }
                        record = new Model(dataObj);
                    }
                }
                // Else, if valueNotFoundText is defined, display it, otherwise display nothing for this value
                else if (me.valueNotFoundRecord) {
                    record = me.valueNotFoundRecord;
                }
            }
            // record found, select it.
            if (record) {
                matchedRecords.push(record);
                valueArray.push(record.get(me.valueField));
            }
        }

        me.lastSelection = matchedRecords;

        // beginUpdate which means we only want to notify this.onValueCollectionEndUpdate after it's all changed.
        me.suspendEvent('select');
        me.valueCollection.beginUpdate();
        if (matchedRecords.length) {
            selModel.select(matchedRecords, false);
        } else {
            selModel.deselectAll();
        }
        me.valueCollection.endUpdate();
        me.resumeEvent('select');

        return me;
    },


    // Метод практически полностью скорирован из LoadMask#bindStore
    // https://docs.sencha.com/extjs/6.2.1/classic/src/LoadMask.js.html#Ext.LoadMask-method-bindStore
    // Потому что LoadMask так же отслеживает падения Proxy
    bindStore: function(store, initial) {
        var me = this;

        me.callParent(arguments);

        // If the server returns a failure, and the proxy fires an exception instead of
        // loading the store, the message box must appear.
        Ext.destroy(me.proxyListeners);
        store = me.store;

        if (store) {
            // Skip ChainedStores to the store that does the loading
            while (store.getSource) {
                store = store.getSource();
            }

            // В store может быть и не Store, потому что
            // в конструкторе ComboColumn создается именно такой объект.
            if (store.loadsSynchronously && !store.loadsSynchronously()) {
                me.proxyListeners = store.getProxy().on({
                    exception: me.onException,
                    scope: me,
                    destroyable: true
                });
            }
        }
    },

    onException: function(component, response) {
        var cmp = this.up('singletree, singlegrid');
        if (cmp) {
            cmp.getController().onError(response);
        }
    }
});
