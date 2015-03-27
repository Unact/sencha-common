Ext.define('Ext.overrides.panel.Table', {
	override : 'Ext.panel.Table',

	initComponent: function(){
		var me = this,
			model;
		me.callParent(arguments);
		
		model = me.store.getModel();
		me.columns.every(function(column){
			if(column.xtype=='combocolumn'){
				column.addPrimaryValueField(model);
			}
			return true;
		});
	}
});