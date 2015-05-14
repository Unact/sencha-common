Ext.define('Ext.overrides.form.field.Date', {
	override : 'Ext.form.field.Date',

	startDay : 1,		//Начало недели - понедельник
	format : 'd.m.Y'	//Год записывается четырьмя знаками
});
