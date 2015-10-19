Ext.define('Ext.lib.data.field.NullifiedString', {
	extend : 'Ext.data.field.String',

	alias : 'data.field.nullifiedString',

	convert : function(v) {
		return v && v.toString().trim()!="" ? v : null;
	}
}); 