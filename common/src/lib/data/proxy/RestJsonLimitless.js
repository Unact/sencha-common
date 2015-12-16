Ext.define('Ext.lib.data.proxy.RestJsonLimitless', {
	extend : 'Ext.data.proxy.Rest',
	alias : 'proxy.restjsonlimitless',

	limitParam : '',
	pageParam : '',
	
	headers : {
		'Accept': 'application/json',
		'Content-Type' : 'application/json'
	}
}); 