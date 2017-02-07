Ext.onReady(function() {
	Ext.override(Ext.selection.CellModel, {
		onEditorDown: function(editingPlugin, e) {
			var me = this;

			me.onEditorArrowBtn(editingPlugin, e, 'down');
		},

		onEditorUp: function(editingPlugin, e) {
			var me = this;

			me.onEditorArrowBtn(editingPlugin, e, 'up');
		},

		/**
		 * @private
		 * Клон onEditorTab, только direction передается как параметр
		 */
		onEditorArrowBtn: function(editingPlugin, e, direction) {
			var me = this,

			    position  = me.move(direction, e);

			// Navigation had somewhere to go.... not hit the buffers.
			if (position) {
				// If we were able to begin editing clear the wasEditing flag. It gets set during navigation off an active edit.
				if (editingPlugin.startEdit(position.record, position.columnHeader)) {
					me.wasEditing = false;
				}
				// If we could not continue editing...
				// bring the cell into view.
				// Set a flag that we should go back into editing mode upon next onKeyTab call
				else {
					position.view.scrollCellIntoView(position);
					me.wasEditing = true;
				}
			}
		},
	});
});
