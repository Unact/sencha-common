// Взято https://github.com/chrismiddle10/tricheckbox
Ext.define('Ext.lib.form.field.TriCheckbox', {
    extend: "Ext.form.field.Checkbox",
    alias: 'widget.tristatecheckbox',

    triCls: 'x-form-tricheckbox',
    nullCls: 'x-form-cb-null',
    nullValue: null,
    checked: null,
    isTriState: true,

    uncheckedValue: false,
    inputValue: true,

    initValue: function() {
        var me = this;

        if (me.isTriState === true) {
            me.originalValue = me.lastValue = me.checked = me.value;
            return;
        }

        me.callParent(arguments);
    },

    onRender: function() {

        var me = this;
        me.callParent(arguments);

        if (me.isTriState === true) {
            me.inputEl.addCls(me.triCls);
            if (me.displayEl) {
              me.displayEl.addCls(me.triCls);
            }
            me.applyStateCls();
        }
    },

    updateValueFromDom: function(e) {
        var me = this;

        if (me.isTriState !== true) {
            me.callParent(arguments);
            return;
        } else if (me.disabled || me.readOnly) {
            return;
        }

        // Increment the checked value.
        var newVal = me.nullValue;
        if (this.value === me.nullValue) {
            newVal = false;
        } else if (this.value === false) {
            newVal = true;
        }

            // Apply the value.
            me.setValue(newVal);

    },

    isChecked: function(rawValue, inputValue) {
        var me = this;
        if (me.isTriState === true && rawValue === me.nullValue) {
            return me.nullValue;
        }

        return this.callParent(arguments);
    },

    setRawValue: function(value) {
        var me = this;
        if (me.isTriState === true) {
            me.checked = me.rawValue = me.value;

            if (me.inputEl) {
                me.applyStateCls();
            }

            return me.value;
        }

        return me.callParent(arguments);
    },

    applyStateCls: function() {
        var me = this;

        if (me.isTriState !== true) {
            // Do nothing.
        } else if (me.value === me.nullValue) {
            me.removeCls(me.checkedCls);
            me.addCls(me.nullCls);
            if (me.displayEl) {
                me.displayEl.removeCls(me.checkedCls);
                me.displayEl.addCls(me.nullCls);
            }
        } else if (me.value === true) {
            me.removeCls(me.nullCls);
            me.addCls(me.checkedCls);
        } else {
            me.removeCls(me.checkedCls);
            me.removeCls(me.nullCls);
        }
    },
    //хорошо бы получить сразу число
    getIntValue: function(e) {
        var me = this;

        if (me.isTriState !== true) {
            return null;
        }
        if (me.value === me.nullValue) {
            return -1;
        } else if (me.value === true) {
            return 1;
        }
        return 0;
    },

    getValue: function() {
        return this.value;
    },

    getRawValue: function() {
        return this.rawValue;
    },

    setValue: function(value){
        this.checked = this.rawValue = value;
        this.mixins.field.setValue.call(this, value);
        this.applyStateCls();
    }
});
