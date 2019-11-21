
Ext.define('Ext.lib.form.field.ComboColumnField', {
    extend:'Ext.form.field.ComboBox',
    alias: 'widget.combocolumnfield',

    /**
     * @private
     * Sets or adds a value/values
     */
    doSetValue: function(value /* private for use by addValue */, add) {
        var me = this,
            store = me.getStore(),
            Model = store.getModel(),
            matchedRecords = [],
            valueArray = [],
            autoLoadOnValue = me.autoLoadOnValue,
            isLoaded = store.getCount() > 0 || store.isLoaded(),
            pendingLoad = store.hasPendingLoad(),
            unloaded = autoLoadOnValue && !isLoaded && !pendingLoad,
            forceSelection = me.forceSelection,
            selModel = me.pickerSelectionModel,
            displayIsValue = me.displayField === me.valueField,
            isEmptyStore = store.isEmptyStore,
            lastSelection = me.lastSelection,
            i, len, record, dataObj,
            valueChanged, key;
        var grid = this.column.getView().grid;
        var displayFieldValue = grid.findPlugin('cellediting').context.record.get(this.column.fieldName);

        //<debug>
        if (add && !me.multiSelect) {
            Ext.raise('Cannot add values to non multiSelect ComboBox');
        }
        //</debug>

        // Called while the Store is loading or we don't have the real store bound yet.
        // Ensure it is processed by the onLoad/bindStore.
        // Even if displayField === valueField, we still MUST kick off a load because even though
        // the value may be correct as the raw value, we must still load the store, and
        // upon load, match the value and select a record sop we can publish the *selection* to
        // a ViewModel.
        if (pendingLoad || unloaded || !isLoaded || isEmptyStore) {

            // If they are setting the value to a record instance, we can
            // just add it to the valueCollection and continue with the setValue.
            // We MUST do this before kicking off the load in case the load is synchronous;
            // this.value must be available to the onLoad handler.
            if (!value.isModel) {
                if (add) {
                    me.value = Ext.Array.from(me.value).concat(value);
                } else {
                    me.value = value;
                }

                me.setHiddenValue(me.value);

                if (this.queryMode === 'remote' && value != null && store.isEmptyStore) {
                    me.setRawValue(displayFieldValue);
                } else {
                    // If we know that the display value is the same as the value, then show it.
                    // A store load is still scheduled so that the matching record can be published.
                    me.setRawValue(displayIsValue ? value : '');
                }

                // if display is value, let's remove the empty text since the store might not be loaded yet
                if (displayIsValue && !Ext.isEmpty(value) && me.inputEl && me.emptyText) {
                    me.inputEl.removeCls(me.emptyUICls);
                }
            }

            // Kick off a load. Doesn't matter whether proxy is remote - it needs loading
            // so we can select the correct record for the value.
            //
            // Must do this *after* setting the value above in case the store loads synchronously
            // and fires the load event, and therefore calls onLoad inline.
            //
            // If it is still the default empty store, then the real store must be arriving
            // in a tick through binding. bindStore will call setValueOnData.
            if (unloaded && !isEmptyStore) {
                store.load();
            }

            // If they had set a string value, another setValue call is scheduled in the onLoad handler.
            // If the store is the defauilt empty one, the setValueOnData call will be made in bindStore
            // when the real store arrives.
            if (isEmptyStore) {
                return me;
            }
        }

        if (
            this.queryMode === 'remote' &&
            value != null &&
            !value.isModel &&
            !store.findExactRecord(this.valueField, value)
        ) {
            var comboRecord = {};

            comboRecord[this.valueField] = value;
            comboRecord[this.displayField] = displayFieldValue;

            this.setRawValue(displayFieldValue);
            record = store.loadData([comboRecord]);

            me.lastSelection = [record];
            me.lastSelectedRecords = me.lastSelection;
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
                // Or it could be a setValue(record) passed to an empty store with autoLoadOnValue and aded above.
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

                    // We are allowing added values to create their own records.
                    // Only if the value is not empty.
                    if (!record && value[i]) {
                        dataObj = {};
                        dataObj[me.displayField] = value[i];
                        if (me.valueField && me.displayField !== me.valueField) {
                            dataObj[me.valueField] = value[i];
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

        // If the same set of records are selected, this setValue has been a no-op
        if (lastSelection) {
            len = lastSelection.length;
            if (len === matchedRecords.length) {
                for (i = 0; !valueChanged && i < len; i++) {
                    if (Ext.Array.indexOf(me.lastSelection, matchedRecords[i]) === -1) {
                        valueChanged = true;
                    }
                }
            } else {
                valueChanged = true;
            }
        } else {
            valueChanged = matchedRecords.length;
        }

        // FIX Always update value
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

    assertValue: function() {
        var me = this,
            rawValue = me.getRawValue(),
            displayValue = me.getDisplayValue(),
            lastRecords = me.lastSelectedRecords,
            preventChange = false,
            value, rec;

        if (me.forceSelection) {
            if (me.multiSelect) {
                // For multiselect, check that the current displayed value matches the current
                // selection, if it does not then revert to the most recent selection.
                if (rawValue !== displayValue) {
                    me.setRawValue(displayValue);
                }
            } else {
                // For single-select, match the displayed value to a record and select it,
                // if it does not match a record then revert to the most recent selection.
                rec = me.findRecordByDisplay(rawValue);
                if (!rec) {
                    if (lastRecords && (!me.allowBlank || me.rawValue)) {
                        rec = lastRecords[0];
                    }
                    // if we have a custom displayTpl it's likely that findRecordByDisplay won't
                    // find the value based on RawValue, so we give it another try using the data
                    // stored in displayTplData if there is any.
                    else if (me.displayTplData && me.displayTplData.length) {
                        rec = me.findRecordByValue(me.displayTplData[0][me.valueField]);
                    }
                }
                // Prevent an issue where we have duplicate display values with
                // different underlying values.
                else if (me.getDisplayValue([me.getRecordDisplayData(rec)]) === displayValue) {
                    rec = null;
                    preventChange = true;
                }

                if (rec) {
                    me.select(rec, true);
                    me.fireEvent('select', me, rec);
                } else if (!preventChange) {
                    if (lastRecords) {
                        delete me.lastSelectedRecords;
                    }
                    // We need to reset any value that could have been set in the dom before or during a store load
                    // for remote combos.  If we don't reset this, then ComboBox#getValue() will think that the value
                    // has changed and will then set `undefined` as the .value for forceSelection combos.  This then
                    // gets changed AGAIN to `null`, which will get set into the model field for editors. This is BAD.
                    me.setRawValue('');
                }
            }
        }
        // we can only call getValue() in this process if forceSelection is false
        // otherwise it will break the grid edit on tab
        else if ((value = me.getValue())) {
            rec = me.findRecordByDisplay(value);

            // FIX remove unneccessary check
            if (rec && (rec !== (lastRecords && lastRecords[0]))) {
                me.select(rec, true);
                me.fireEvent('select', me, rec);
            }
        }
        me.collapse();
    }
});
