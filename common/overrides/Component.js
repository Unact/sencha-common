Ext.define('Ext.overrides.Component', {
	override : 'Ext.Component',

	getPluginByPtype : function(ptype) {
		var i,
			plugins = this.plugins,
			ln = plugins && plugins.length;

		for ( i = 0; i < ln; i++) {
			if (plugins[i].ptype === ptype) {
				return plugins[i];
			}
		}
		return null;
	}
});
