Ext.onReady(function() {
    Ext.override(
    	Ext.form.field.Date,
    	{
			startDay : 1,		//Начало недели - понедельник
			format : 'd.m.Y',	//Год записывается четырьмя знаками
			
			statics: {
				dateWithTimeFormat: 'd.m.Y H:i'
			}
		}
	);
});
