Ext.define('Ext.overrides.grid.plugin.CellEditing', {
	override : 'Ext.grid.plugin.CellEditing',
	
	//добавляем к конфигурации редактора опции из column.editorConfig
	getEditor: function(record, column) {
        var me = this,
            editors = me.editors,
            editorId = column.getItemId(),
            editor = editors.getByKey(editorId),
            // Add to top level grid if we are editing one side of a locking system
            editorOwner = me.grid.ownerLockable || me.grid;

        if (!editor) {
            editor = column.getEditor(record);
            if (!editor) {
                return false;
            }

            // Allow them to specify a CellEditor in the Column
            if (editor instanceof Ext.grid.CellEditor) {
                editor.floating = true;
            }
            // But if it's just a Field, wrap it.
            else {
                editor = new Ext.grid.CellEditor(Ext.apply({
                    floating: true,
                    editorId: editorId,
                    field: editor
                }, column.editorConfig));
            }
            // Add the Editor as a floating child of the grid
            // Prevent this field from being included in an Ext.form.Basic
            // collection, if the grid happens to be used inside a form
            editor.field.excludeForm = true;
            
            editor.field.validationField = record.self.getField(column.dataIndex);

            // If the editor is new to this grid, then add it to the grid, and ensure it tells us about its lifecycle.
            if (editor.ownerCt !== editorOwner) {
                editorOwner.add(editor);
                editor.on({
                    scope: me,
                    specialkey: me.onSpecialKey,
                    complete: me.onEditComplete,
                    canceledit: me.cancelEdit
                });
                column.on('removed', me.onColumnRemoved, me);
            }
            editors.add(editor);
        }

        if (column.isTreeColumn) {
            editor.isForTree = column.isTreeColumn;
            editor.addCls(Ext.baseCSSPrefix + 'tree-cell-editor');
        }

        // Set the owning grid.
        // This needs to be kept up to date because in a Lockable assembly, an editor
        // needs to swap sides if the column is moved across.
        editor.setGrid(me.grid);

        // Keep upward pointer correct for each use - editors are shared between locking sides
        editor.editingPlugin = me;
        return editor;
    }
});