Ext.define('Ext.overrides.form.field.Field', {
	override : 'Ext.form.field.Field',

	checkChange : function() {
		var me = this, newVal, oldVal;

		if (!me.suspendCheckChange) {
			newVal = me.getValue();
			oldVal = me.lastValue;

			if (!me.isDestroyed && me.didValueChange(newVal, oldVal)) {
				me.lastValue = newVal;
				me.onChange(newVal, oldVal);
				me.fireEvent('change', me, newVal, oldVal);
			}
		}
	}
});
