Ext.define('Ext.lib.data.field.RestXmlDate', {
	extend : 'Ext.data.field.Date',

	alias : 'data.field.restXmlDate',

	isDate: true,

	convert : function(v) {
		var parsed = null,
			formats = [
				"d.m.y",
				"d.m.Y",
				"c",
				"Y-m-d",
				"d/m/Y",
				"d-m-y",
				"d-m-Y",
				"d/m",
				"d-m",
				"dm",
				"dmy",
				"dmY",
				"d"];

		if (!v) {
			return null;
		}

		if ( v instanceof Date) {
			return v;
		}

		v = v.toString().trim();

		for(var i=0; i<formats.length; i++){
			parsed = Ext.Date.parse(v, formats[i]);
			if(parsed){
				break;
			}
		}

		return parsed;
	},
	serialize: function(v){
		var result;

		if (v instanceof Date) {
			result = Ext.Date.format(v, (this.isDate ? 'Y-m-d' : 'Y-m-d H:i:s'));
		}
		return result;
	}
});
