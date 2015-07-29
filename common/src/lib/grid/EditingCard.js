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
		autoScroll: true,
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
		var me = this,
			formItems = [],
			formItem;
		
		me.buttons[0].handler = function(button){
			me.completeEdit();
		};
		me.buttons[1].handler = function(button){
			me.cancelEdit();
		};
		
		Ext.apply(me, config);
		
		if(me.skipAutoGenerateFields!==false){
			me.grid.columns.forEach(function(column){
				var initConfig;
				if(column.xtype!='actioncolumn'){
					formItem = {
						name: column.dataIndex,
						fieldLabel: column.text
					};
					
					if(column.xtype=='combocolumn'){
						Ext.apply(formItem, column.fieldConfig);
						if(!formItem.bind){
							formItem.bind = {};
						}
						
						initConfig = column.getInitialConfig();
						if(initConfig.field && initConfig.field.store) {
							formItem.store = {
								type: 'chained',
								source: initConfig.field.store
							};
						} else if(initConfig.field && initConfig.field.bind && initConfig.field.bind.store){
							formItem.bind = {
								store: {
									type: 'chained',
									source: initConfig.field.bind.store
								}
							};
						} else if (initConfig.bind && initConfig.bind.store){
							formItem.bind = {
								store: {
									type: 'chained',
									source: initConfig.bind.store
								}
							};
						} else {
							formItem.store = {
								type: 'chained',
								source: initConfig.store
							};
						}
					} else {
						Ext.apply(formItem, column.field);
					}
					delete formItem.width;
					
					formItems.push(formItem);
				}
			});
		}
		me.items[0].items = formItems;
		
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
		
		if(form.isValid()){
			me.hide();
			form.updateRecord(me.context.record);
			me.grid.fireEvent('edit', me, ctx);
		}
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
	},
	
	show: function(){
		var me = this;
		
		me.setHeight(Ext.getBody().getHeight()-50);
		
		me.callParent();
	}
});
