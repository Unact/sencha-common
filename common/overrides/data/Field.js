Ext.onReady(function() {
	Ext.override(Ext.data.Field, {
		dateFormat: 'c',
		dateReadFormat: 'c',
		dateWriteFormat: 'Y-m-d\\TH:i:s',
		
		statics: {
			convertDate: function(v, record){
				//дата передается датой, если ее пытаться парсить как строку,
	            //то это приводит к пустому полю при редактировании в гриде
				if(Ext.isDate(v)){
					return v;
				} else {
	                var val;
	                var formats = ['c', 'd.m.Y H:i:s'];
	                
	                if(this.dateFormat){
	                	formats.unshift(this.dateFormat);
	                }
	                
	                if(this.dateReadFormat){
	                	formats.unshift(this.dateReadFormat);
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