Ext.define('Ext.overrides.panel.Table', {
	override : 'Ext.panel.Table',

	initComponent: function(){
		var me = this;
		
		me.callParent(arguments);
		
		me.initComboColumns();
	},
	
	setStore: function(store){
		var me = this;
		
		me.callParent(arguments);
		
		me.initComboColumns();
	},
	
	initComboColumns: function(model){
		var me = this;
		
		model = me.store.getModel();
		if(model){
			me.columns.every(function(column){
				if(column.xtype=='combocolumn'){
					column.addPrimaryValueField(model);
				}
				return true;
			});
		}
	}
});