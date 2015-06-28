Ext.define('Ext.overrides.data.Connection', {
	override : 'Ext.data.Connection',

	constructor : function() {
		var me = this;

		me.callParent(arguments);
		
		me.on('requestexception', function(conn, response, options, eOpts){
			if(response.status==401){
				window.location.replace('/');
			}
		});
	},
	
	/**
	 * Sets various options such as the url, params for the request
	 * @param {Object} options The initial options
	 * @param {Object} scope The scope to execute in
	 * @return {Object} The params for the request
	 */
	setOptions : function(options, scope) {
		var me = this;
		var res = me.callParent(arguments);
		
		res.url = Ext.urlAppend(res.url, Ext.Object.toQueryString({authenticity_token: window._token}));

		return res;
	}
});