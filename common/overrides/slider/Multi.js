Ext.define('Ext.overrides.slider.Multi', {
    override: 'Ext.slider.Multi',

    setValues: function(values) {
        this.setValue(values);
    },

    initValue: function() {
        var extValueFrom = Ext.valueFrom;
        // Fallback for initial values: values config -> value config -> minValue config -> 0
        var values = extValueFrom(this.values, [extValueFrom(this.value, extValueFrom(this.minValue, 0))]);
        var len = this.numberOfThumbs || values.length;

        // Store for use in dirty check
        this.originalValue = values;

        // Add a thumb for each value, enforcing configured constraints
        for (var i = 0; i < len; i++) {
            this.addThumb(this.normalizeValue(values[i] || null));
        }
    },

    setValue: function(index, value, animate, changeComplete) {
        var me = this;
        var thumbs = me.thumbs;
        var ariaDom = me.ariaEl.dom;
        var thumb;
        var len;
        var i;
        var values;

        if (Ext.isArray(index)) {
            values = index;
            animate = value;

            for (i = 0, len = values.length; i < len; ++i) {
                thumb = thumbs[i];
                if (thumb) {
                    me.setValue(i, values[i], animate);
                }
            }
            return me;
        }

        thumb = me.thumbs[index];
        // ensures value is contstrained and snapped
        value = me.normalizeValue(value);

        thumb.value = value;

        if (me.rendered) {
            if (Ext.isDefined(animate)) {
                animate = animate === false ? false : animate;
            } else {
                animate = me.animate;
            }
            thumb.move(me.calculateThumbPosition(value), animate);

            // At this moment we can only handle one thumb wrt ARIA
            if (index === 0 && ariaDom) {
                ariaDom.setAttribute('aria-valuenow', value);
            }

            me.fireEvent('change', me, value, thumb);
            me.checkDirty();

            if (changeComplete) {
                me.fireEvent('changecomplete', me, value, thumb);
            }
        }
        return me;
    }
});
