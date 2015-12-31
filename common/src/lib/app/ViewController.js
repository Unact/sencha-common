Ext.define('Ext.lib.app.ViewController', {
	extend : 'Ext.app.Controller',
	
	mixins: ['Ext.lib.app.ControllerMixin'],
	
	onAppStoresLoaded: function(){
		var me = this;
		
		me.onStoresLoaded();
	},
	
	onOwnStoresLoaded: function(){
		var me = this;
		var vm = me.getView().getViewModel();
		
		vm.set('ownStoresLoaded', true);
		me.onStoresLoaded();
	},
	
	onStoresLoaded: Ext.emptyFn
});
