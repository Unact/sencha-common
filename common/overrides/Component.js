Ext.onReady(function() {
	Ext.require('Ext.lib.LoadingCounter', function() {
		Ext.override(Ext.Component, {
			constructor: function(config){
				this.self.mixin('loadingCounter', Ext.lib.LoadingCounter);
				this.callParent(arguments);
			}
		});
	});
});

