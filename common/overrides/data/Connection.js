Ext.onReady(function() {
	Ext.override(Ext.data.Connection, {
		/**
		 * Sets various options such as the url, params for the request
		 * @param {Object} options The initial options
		 * @param {Object} scope The scope to execute in
		 * @return {Object} The params for the request
		 */
		setOptions : function(options, scope) {
			var me = this;
			var res = me.callParent(arguments);
			
			res.url = Ext.urlAppend(url, Ext.Object.toQueryString({authenticity_token: window._token}));

			return res;
		}
	});
}); 