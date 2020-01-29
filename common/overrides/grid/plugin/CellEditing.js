Ext.define('Ext.overrides.grid.plugin.CellEditing', {
	override: 'Ext.grid.plugin.CellEditing',

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

            if(Ext.getVersion().isLessThan('6')){
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
            } else {
            	// If the editor is new to this grid, then add it to the grid, and ensure it tells us about its life cycle.
	            if (editor.column !== column) {
	                editor.column = column;
	                editor.on({
	                    scope: me,
	                    complete: me.onEditComplete,
	                    canceledit: me.cancelEdit
	                });
	                column.on('removed', me.onColumnRemoved, me);
	            }
            }
            editors.add(editor);
        }

        // Inject an upward link to its owning grid even though it is not an added child.
        editor.ownerCmp = me.grid.ownerGrid;

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
    },

    // FIX
    // https://www.sencha.com/forum/showthread.php?330959-ExtJs-6-2-CellEditing-plugin-editor-el-dom-is-null
    activateCell: function (position, skipBeforeCheck, doFocus) {
        var me = this,
            record = position.record,
            column = position.column,
            context,
            contextGeneration,
            cell,
            editor,
            prevEditor = me.getActiveEditor(),
            p,
            editValue;


        context = me.getEditingContext(record, column);
        if (!context || !column.getEditor(record)) {
            return;
        }


        // Activating a new cell while editing.
        // Complete the edit, and cache the editor in the detached body.
        if (prevEditor && prevEditor.editing) {
            // Silently drop actionPosition in case completion of edit causes
            // and view refreshing which would attempt to restore actionable mode
            me.view.actionPosition = null;


            contextGeneration = context.generation;
            if (prevEditor.completeEdit() === false) {
                return;
            }


            // FIX HERE!!!
            if (!Ext.getDetachedBody().isAncestor(prevEditor.el.dom)) {
                prevEditor.cacheElement();
            }


            // Complete edit could cause a sort or column movement.
            // Reposition context unless user code has modified it for its own purposes.
            if (context.generation === contextGeneration) {
                context.refresh();
            }
        }


        if (!skipBeforeCheck) {
            // Allow vetoing, or setting a new editor *before* we call getEditor
            contextGeneration = context.generation;
            if (me.beforeEdit(context) === false || me.fireEvent('beforeedit', me, context) === false || context.cancel) {
                return;
            }


            // beforeedit edit could cause sort or column movement
            // Reposition context unless user code has modified it for its own purposes.
            if (context.generation === contextGeneration) {
                context.refresh();
            }
        }


        // Recapture the editor. The beforeedit listener is allowed to replace the field.
        editor = me.getEditor(record, column);


        // If the events fired above ('beforeedit' and potentially 'edit') triggered any destructive operations
        // regather the context using the ordinal position.
        if (context.cell !== context.getCell(true)) {
            context = me.getEditingContext(context.rowIdx, context.colIdx);
            position.setPosition(context);
        }


        if (editor) {
            cell = Ext.get(context.cell);


            // Ensure editor is there in the cell.
            // And will then be found in the tabbable children of the activating cell
            if (!editor.rendered) {
                editor.hidden = true;
                editor.render(cell);
            } else {
                p = editor.el.dom.parentNode;
                if (p !== cell.dom) {
                    // This can sometimes throw an error
                    // https://code.google.com/p/chromium/issues/detail?id=432392
                    try {
                        p.removeChild(editor.el.dom);
                    } catch (e) {


                    }
                    editor.container = cell;
                    cell.dom.appendChild(editor.el.dom, cell.dom.firstChild);
                }
            }


            // Refresh the contextual value in case any event handlers (either the 'beforeedit' of this
            // edit, or the 'edit' of any just terminated previous editor) mutated the record
            // https://sencha.jira.com/browse/EXTJS-19899
            editValue = context.record.get(context.column.dataIndex);
            if (editValue !== context.originalValue) {
                context.value = context.originalValue = editValue;
            }


            me.setEditingContext(context);


            // Request that the editor start.
            // Ensure that the focusing defaults to false.
            // It may veto, and return with the editing flag false.
            editor.startEdit(cell, context.value, doFocus || false);


            // Set contextual information if we began editing (can be vetoed by events)
            if (editor.editing) {
                me.setActiveEditor(editor);
                me.setActiveRecord(context.record);
                me.setActiveColumn(context.column);
                me.editing = true;
                me.scroll = position.view.el.getScroll();
            }


            // Return true if the cell is actionable according to us
            return editor.editing;
        }
    }
});
