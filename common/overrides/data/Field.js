Ext.onReady(function() {
	Ext.override(Ext.data.Field, {
		dateFormat: 'c',
		dateReadFormat: 'c',
		
		statics: {
			convertDate: function(v, record){
				//дата передается датой, если ее пытаться парсить как строку,
	            //то это приводит к пустому полю при редактировании в гриде
				if(Ext.isDate(v)){
					return v;
				} else {
	                var val;
	                var formats = ['c', 'd.m.Y H:i:s'];
	                
	                if(record.dateFormat){
	                	formats.splice(0, 1, record.dateFormat);
	                }
	                
	                if(record.dateReadFormat){
	                	formats.shift(0, 1, record.dateReadFormat);
	                }
	                
	                for(var i=0; i<formats.length && (val==null || val==undefined); i++){
	                	val = Ext.Date.parse(v, formats[i]);
	                }
	                return val;
	            }
			}
		}
	});
});