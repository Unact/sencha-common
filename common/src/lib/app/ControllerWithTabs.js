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
					for(var i=0; i<controller.tabsControllers.length; i++) {
						var currentController = app.getController(controller.tabsControllers[i]);
						currentController.onLaunch();
					}
				}
			);
		}
	}
});
