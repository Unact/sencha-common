Ext.define("Ext.overrides.form.field.Number", {
	override : "Ext.form.field.Number",
	decimalSeparator : ","
});

if (Ext.util && Ext.util.Format) {
	Ext.apply(Ext.util.Format, {
		thousandSeparator : ' '
	});
}