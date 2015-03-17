Ext.define('Ext.lib.data.field.RestXmlDate', {
	extend : 'Ext.data.field.Date',

	alias : 'data.field.restXmlDate',

	convert : function(v) {
		if (!v) {
			return null;
		}

		if ( v instanceof Date) {
			return v;
		}

		var parsed = null, formats = "d.m.y|d.m.Y|c|d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d".split('|');
		
		for(var i=0; i<formats.length; i++){
			parsed = Ext.Date.parse(v, formats[i]);
			if(parsed){
				break;
			}
		}

		return parsed ? new Date(parsed) : null;
	},
	serialize: function(v){
		var result;
		
		if (v instanceof Date) {
			result = Ext.Date.format(v, 'Y-m-d H:i:s');
		}
		return result;
	}
}); 