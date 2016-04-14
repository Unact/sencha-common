Ext.define('Ext.lib.form.MultiFieldContainer', {
	extend: 'Ext.form.FieldContainer',
	alias: 'widget.multifieldcontainer',

	layout: 'auto',

	constructor: function(config){
		var me = this,
			fieldConfig = {};

		config.fields.forEach(function(el, i, array){
			Ext.applyIf(el, {
				width: '100%'
			});

			if (i != array.length - 1){
				Ext.applyIf(config.fields[i], {
					margin: '0 0 2 0'
				});
			}
		});

		me.items = config.fields;
		
		me.callParent(arguments);
	},
	
	setValue: function(value){
		var me = this,
			field,
			sel = me.ownerCt.grid.getSelection()[0];

		me.items.items.forEach(function(el, i, array){
			el.setValue(sel.get(el.dataIndex));
		});
		return true;
	},

	resetOriginalValue: function(){
		var me = this;

		me.items.items.forEach(function(el, i, array){
			el.resetOriginalValue();
		});
	},

	getValue: function(){
		var me = this,
			value = '';

		me.items.items.forEach(function(el, i, array){
			value += '  ' + el.getValue();
		});
		return value;
	},

	isValid: function(){
		var me = this,
			valid = true;

		me.items.items.forEach(function(el, i, array){
			valid = !valid ? !el.isValid() : valid;
			
		});
		return valid;
	}
});
