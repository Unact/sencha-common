Ext.define('Ext.overrides.form.field.Number', {
    override: 'Ext.form.field.Number',
    decimalSeparators: [',', '.'],

    initComponent: function() {
        var me = this;
        if (me.decimalSeparators === null) {
            me.decimalSeparators[0] = Ext.util.Format.decimalSeparator;
        }

        me.decimalSeparatorsReg = new RegExp('[' + Ext.String.escapeRegex(this.decimalSeparators.join('')) + ']', 'g');
        me.callParent();

        me.setMinValue(me.minValue);
        me.setMaxValue(me.maxValue);
    },
    /**
     * Runs all of Number's validations and returns an array of any errors. Note that this first runs Text's
     * validations, so the returned array is an amalgamation of all field errors. The additional validations run test
     * that the value is a number, and that it is within the configured min and max values.
     * @param {Object} [value] The value to get errors for (defaults to the current field value)
     * @return {String[]} All validation errors for this field
     */
    getErrors: function(value) {
        var me = this;

        value = arguments.length > 0 ? value : this.processRawValue(this.getRawValue());
        value = String(value).replace(me.decimalSeparatorsReg, '.');

        var errors = me.callParent([value]);
        var format = Ext.String.format;
        var num;

        if (value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
             return errors;
        }

        if(isNaN(value)){
            errors.push(format(me.nanText, value));
        }

        num = me.parseValue(value);

        if (me.minValue === 0 && num < 0) {
            errors.push(this.negativeText);
        }
        else if (num < me.minValue) {
            errors.push(format(me.minText, me.minValue));
        }

        if (num > me.maxValue) {
            errors.push(format(me.maxText, me.maxValue));
        }


        return errors;
    },

    valueToRaw: function(value) {
        var me = this;
        value = me.parseValue(value);
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(String(value).replace(me.decimalSeparatorsReg, '.'));
        value = isNaN(value) ? '' : String(value).replace('.', me.decimalSeparators[0]);
        return value;
    },

    getSubmitValue: function() {
        var me = this,
            value = me.callParent();

        if (!me.submitLocaleSeparator) {
            value = value.replace(me.decimalSeparatorsReg, '.');
        }
        return value;
    },

    /**
     * Replaces any existing {@link #minValue} with the new value.
     * @param {Number} value The minimum value
     */
    setMinValue: function(value) {
        var me = this,
            ariaDom = me.ariaEl.dom,
            minValue, allowed, ariaDom;

        me.minValue = minValue = Ext.Number.from(value, Number.NEGATIVE_INFINITY);
        me.toggleSpinners();

        // May not be rendered yet
        if (ariaDom) {
            if (minValue > Number.NEGATIVE_INFINITY) {
                ariaDom.setAttribute('aria-valuemin', minValue);
            }
            else {
                ariaDom.removeAttribute('aria-valuemin');
            }
        }

        // Build regexes for masking and stripping based on the configured options
        if (me.disableKeyFilter !== true) {
            allowed = me.baseChars + '';

            if (me.allowExponential) {
                allowed += me.decimalSeparatorsReg + 'e+-';
            }
            else {
                if (me.allowDecimals) {
                    allowed += me.decimalSeparatorsReg;
                }
                if (me.minValue < 0) {
                    allowed += '-';
                }
            }

            allowed = Ext.String.escapeRegex(allowed);
            me.maskRe = new RegExp('[' + allowed + ']');
            if (me.autoStripChars) {
                me.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
            }
        }
    },

    /**
     * @private
     */
    parseValue: function(value) {
        value = parseFloat(String(value).replace(this.decimalSeparatorsReg, '.').replace(/[^\d.-]/g, ''));
        return isNaN(value) ? null : value;
    }
});
