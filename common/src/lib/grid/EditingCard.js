Ext.define('Ext.lib.grid.EditingCard', {
	extend : 'Ext.window.Window',
	alias: 'widget.cardediting',
	
	requires: [
		'Ext.layout.container.Form'
	],
	
	referenceHolder: true,
	
	modal: true,
	closeAction: 'hide',
	
	layout: {
		type: 'fit'
	},
	
	items: [{
		xtype: 'form',
		reference: 'editingForm',
		padding: 5,
		defaults: {
			width: '100%'
		}
	}],
	
	buttons: [{
		text: 'Сохранить'
	}, {
		text: 'Отмена'
	}],
	
	constructor: function(config) {
		var me = this;
		
		me.buttons[0].handler = function(button){
			me.completeEdit();
		};
		me.buttons[1].handler = function(button){
			me.cancelEdit();
		};
		
		me.items[0].items = me.formItems;
		
		me.callParent(arguments);
	},
		
	startEdit: function(record){
		var me = this,
			form = me.lookupReference('editingForm').getForm();
		
		form.loadRecord(record);
		me.context = me.getEditingContext();
		me.show();
	},
	
	completeEdit: function(){
		var me = this,
			ctx = me.getEditingContext(),
			form = me.lookupReference('editingForm').getForm();
		
		me.hide();
		form.updateRecord(me.context.record);
		me.grid.fireEvent('edit', me, ctx);
	},
	
	cancelEdit: function(){
		var me = this,
			ctx = me.getEditingContext();
		
		me.hide();
		
		Ext.apply(ctx.record.data, ctx.record.modified);
		if(ctx.record.phantom){
			ctx.record.dirty = false;
		}
		me.grid.fireEvent('canceledit', me, ctx);
	},
	
	getEditingContext: function(){
		var me = this,
			ctx = { grid: me.grid },
			form = me.lookupReference('editingForm').getForm();
		
		ctx.record = form.getRecord();	
		return ctx;
	}
});
