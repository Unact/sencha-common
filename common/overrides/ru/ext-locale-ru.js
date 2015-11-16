Ext.define("Ext.locale.ru.Date", {
	override: "Ext.Date",
	defaultFormat: 'd.m.Y'
});

Ext.define("Ext.locale.ru.grid.RowEditor", {
	override : "Ext.grid.RowEditor",
	saveBtnText : 'Сохранить',
	cancelBtnText : 'Отмена',
	errorsText : 'Ошибки',
	dirtyText: 'Вам необходимо сохранить изменения'
});

Ext.define("Ext.locale.ru.window.MessageBox", {
	override: "Ext.window.MessageBox",
	
	buttonText : {
		ok : 'ОК',
		yes : 'Да',
		no : 'Нет',
		cancel : 'Отмена'
	}
});

if (Ext.util && Ext.util.Format) {
	Ext.apply(Ext.util.Format, {
		thousandSeparator : ' ',
		decimalSeparator: '.',
		
		ruMoney: function(value){
			return Ext.util.Format.number(value, '0,000.00').replace(/\./g, ' ');
		},

		withoutDecimal: function(value){
			return Ext.util.Format.number(value, '0,000').replace(/\./g, ' ');
		}
	});
}