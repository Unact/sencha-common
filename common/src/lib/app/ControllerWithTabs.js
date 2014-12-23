Ext.define('Ext.lib.app.ControllerWithTabs', {
	extend : 'Ext.app.Controller',
	
	/*
	 * Новый параметр конфигурации - массив контроллеров вкладок tabsControllers
	 */
	
	onLaunch: function(){
		var controller = this, app = controller.getApplication();
		
		if(tabsControllers && tabsControllers.length>0){
			tabsControllers.every(
				function(tabController){
					app.getController(tabController);
					return true;
				}
			);
		}
	}
});