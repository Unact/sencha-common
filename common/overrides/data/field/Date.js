Ext.define('Ext.overrides.data.field.Date', {
	override : 'Ext.data.field.Date',

	dateFormat: 'c',
	dateReadFormat: 'c',
	dateWriteFormat: 'Y-m-d\\TH:i:s',
	
	statics: {
	    secondsConverter: function(v){
            return new Date(parseInt(v)*1000);
        }
	}
}); 
