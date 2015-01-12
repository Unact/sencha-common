Ext.define('Ext.lib.app.ControllerWithTabs', {
	extend : 'Ext.app.Controller',
	
	/*
	 * Новый параметр конфигурации - массив контроллеров вкладок tabsControllers
	 */
	
	onLaunch: function(){
		var controller = this, app = controller.getApplication();
		
		if(controller.tabsControllers && controller.tabsControllers.length>0){
			Ext.require(
				controller.tabsControllers,
				function(){
					controller.tabsControllers.every(
						function(tabController){
							var currentController = app.getController(tabController);
							currentController.onLaunch();
							return true;
						}
					);
				}
			);
		}
	}
});