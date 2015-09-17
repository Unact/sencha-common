Ext.define('Ext.overrides.data.proxy.Server', {
	override : 'Ext.data.proxy.Server',

	setExtraParamAndRemoveIfNull : function(extraParam, value) {
		var me = this;
		
		if(value!=null){
			me.setExtraParam(extraParam, value);
		} else {
			delete me.extraParams[extraParam];
		}
	}
}); 