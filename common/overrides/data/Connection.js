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
	}
}); 