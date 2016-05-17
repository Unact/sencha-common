Ext.onReady(function() {
	Ext.override(Ext.util.Format,
	{
		thousandSeparator: ' ',
		originalNumberFormatter : Ext.util.Format.number,
		number : function(v, formatString) {
			if (v < 0) {
				//negative number: flip the sign, format then prepend '-' onto output
				return '-' + this.originalNumberFormatter(v * -1, formatString);
			} else {
				//positive number: as you were
				return this.originalNumberFormatter(v, formatString);
			}
		},
		percent : function(v, formatString) {
			return Ext.util.Format.number(v * 100, '0,0.0 %');
		}
	});
});
