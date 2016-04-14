Ext.define('Ext.lib.data.proxy.RestJsonLimitless', {
	extend : 'Ext.data.proxy.Rest',
	alias : 'proxy.restjsonlimitless',

	limitParam : '',
	pageParam : '',
	
	extraParams: {
		limitless: true
	},

	headers : {
		'Accept': 'application/json',
		'Content-Type' : 'application/json'
	},
	
	constructor: function(config){
		var me = this;
		if(!config.extraParams){
			config.extraParams = {};
		};
		config.extraParams.limitless = true;
		
		me.callParent(arguments);
	}
}); 
