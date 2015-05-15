Ext.define('Ext.overrides.view.Table', {
	override : 'Ext.view.Table',

	handleUpdate : function(store, record, operation, changedFieldNames) {
		var me = this;

		me.callParent(arguments);

		if (me.viewReady) {
			if (me.selModel.isRowModel) {
				me.scrollTo(record, true);
			}
		}
	},

	/**
	 * Переход и фокусировка к строке по индексу или записи
	 * @param {Number/Ext.data.Model} nodeInfo индекс или запись.
	 */
	scrollTo : function(nodeInfo, silentSelect) {
		var me = this, record;
		
		if (me.bufferedRenderer) {
			me.bufferedRenderer.scrollTo(nodeInfo, { select: true });
		} else {
			me.selModel.select(nodeInfo, false, silentSelect);
			me.getRow(nodeInfo).scrollIntoView(me.getEl());
		}
	}
});
