Ext.define('Ext.overrides.view.Table', {
	override : 'Ext.view.Table',

	// handleUpdate : function(store, record, operation, changedFieldNames) {
	// var me = this;
	//
	// me.callParent(arguments);
	//
	// if (me.viewReady) {
	// if (me.selModel.isRowModel) {
	// me.scrollTo(record, true);
	// }
	// }
	// },

	onUpdate : function(store, record, operation, modifiedFieldNames, details) {
		var me = this,
			isFiltered = details && details.filtered;

		// If, due to filtering or buffered rendering, or node collapse, the updated record is not
		// represented in the rendered structure, this is a no-op.
		// The correct, new values will be rendered the next time the record becomes visible and is rendered.
		if (!isFiltered && me.getNode(record)) {

			// If we are throttling UI updates (See the updateDelay global config), ensure there's a change entry
			// queued for the record in the global queue.
			if (me.throttledUpdate) {
				me.statics().queueRecordChange(me, store, record, operation, modifiedFieldNames);
			} else {
				me.handleUpdate.apply(me, arguments);
			}
		}
		if(me.isVisible() && me.getNode(record)){
			me.scrollTo(record);
		}
	},

	/**
	 * Переход и фокусировка к строке по индексу или записи
	 * @param {Number/Ext.data.Model} nodeInfo индекс или запись.
	 */
	scrollTo : function(nodeInfo, silentSelect) {
		var me = this,
			record;
		if (me.bufferedRenderer) {
			me.bufferedRenderer.scrollTo(nodeInfo, {
				select : true
			});
		} else {
			me.selModel.select(nodeInfo, false, silentSelect);
			me.getRow(nodeInfo).scrollIntoView(me.getEl());
		}
	}
});
