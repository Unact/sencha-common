Ext.define('Ext.overrides.form.field.Date', {
	override : 'Ext.form.field.Date',

	startDay : 1,		//Начало недели - понедельник
	format : Ext.form.field.Date.defaultDateFormat,	//Год записывается четырьмя знаками
	
	statics: {
	    defaultDateFormat: 'd.m.Y',
		dateWithTimeFormat: 'd.m.Y H:i'
	}
});
