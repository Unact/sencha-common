// Контроллер таблицы
Ext.define('Ext.lib.singlegrid.ViewController', {
	extend : 'Ext.lib.app.ViewController',
	alias : 'controller.singlegrid',
	
	/**
	 * Добавляются обработчики для кнопок обновления, добавления, удаления и сохранения.
	 * Для методов добавления и обновления доступны "предварительные" шаблонные методы (см. ниже)
	 * Также добавляется обработчик события обновления представления (refrehtable)
	 */
	init: function(view){
		var me = this,
			control = {},
			query = '[reference="' +view.reference + '"]';
		
		control[query] = {};
		control[query]['refreshtable'] = 'onRefresh';
		
		me.grid = view;
		me.mainView = me.mainView || me.grid;
		
		if(view.disableSelectionChangeHandler!==true){
			control[query]['selectionchange'] = 'onChangeSelect';
		}
		me.control(control);
	},
	
	onDelete: function(){
		var me = this,
			sm = me.grid.getSelectionModel(),
			oldSelection = sm.getSelection(),
			store = me.grid.getStore(),
			oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
				store.indexOf(oldSelection[0]) :
				null;
		
		function removeRow(){
			var recordsCount;
			store.remove(oldSelection);
			recordsCount = store.getCount();
			if (recordsCount > 0) {
				sm.select(recordsCount > oldSelectionIndex ? oldSelectionIndex : oldSelectionIndex - 1);
			}
		};
		
		if(me.grid.enableDeleteDialog===true){
			Ext.Msg.show({
				title : 'Внимание',
				message : 'Вы действительно хотите удалить запись?',
				buttons : Ext.Msg.YESNOCANCEL,
				icon : Ext.Msg.QUESTION,
				fn : function(btn) {
					if (btn === 'yes') {
						removeRow();
					}
				}
			});
		} else {
			removeRow();
		}
	},
	
	onDeleteByColumn: function(grid, rowIndex, colIndex, item, e, record, row) {
		if(me.grid.enableDeleteDialog===true){
			Ext.Msg.show({
				title : 'Внимание',
				message : 'Вы действительно хотите удалить запись?',
				buttons : Ext.Msg.YESNOCANCEL,
				icon : Ext.Msg.QUESTION,
				fn : function(btn) {
					if (btn === 'yes') {
						grid.store.remove(record);
					}
				}
			});
		} else {
			grid.store.remove(record);
		}
	},
	
	/**
	 * Функция должна возвратить объект для вставки в хранилище.
	 * Если объект не будет возвращен, то в хранилище ничего не вставится.
	 */
	beforeAdd: function(masterRecord){
		return {};
	},
	
	/**
	 * Функция должна возвратить объект для вставки в хранилище.
	 * Если объект не будет возвращен, то в хранилище ничего не вставится.
	 */
	afterAdd: function(record){
	},
	
	/**
	 * 
	 * вызывает функцию beforeAdd.
	 * Функция должна возвратить объект для вставки в хранилище.
	 * Если объект не будет возвращен, то в хранилище ничего не вставится.
	 */
	onAdd : function(button) {
		var me = this,
			result = {},
			sm = me.grid.getSelectionModel(),
			store = me.grid.getStore(),
			index = store.indexOf(sm.getLastSelected()),
			storeInsertionIndex,
			newRec,
			masterRecord;
		
		if(me.masterGrid){
			masterRecord = me.masterGrid.getViewModel().get('masterRecord');
		}
		
		result = me.beforeAdd(masterRecord);
		
		if(result){
			if(store.isSorted()){
				newRec = store.add(result)[0];
			} else {
				newRec = store.insert(Math.max(index, 0), result)[0];
			}
			me.grid.view.scrollTo(newRec);
			sm.select(newRec);
		}
		me.afterAdd(newRec[0]);
	},
	
	onSave: function() {
		var me = this,
			store = me.grid.getStore();

		if (store.hasChanges()) {
			me.mainView.setLoading(true);
			store.sync({
				callback : function(batch) {
					me.grid.getSelectionModel().refresh();
					if (batch.exceptions.length > 0) {
						me.onError(batch.exceptions[0].getError().response.responseText);
						me.mainView.setLoading(false);
					} else {
						me.onRefresh();
					}
				}
			});
		}
	},
	
	/**
	 * Функция должна возвратить "истину" для продолжения обновления
	 */
	beforeRefresh: function(masterRecord){
		return true;
	},
	
	/**
	 * вызывает при наличии функцию beforeRefresh.
	 * Функция должна возвратить "истину" для продолжения обновления
	 */
	onRefresh: function(){
		var me = this,
			result = true,
			masterRecord,
			vm = me.grid.getViewModel(),
			sm = me.grid.getSelectionModel(),
			store = me.grid.getStore(),
			oldSelection = sm.getSelection(),
			oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
				store.indexOf(oldSelection[0]) :
				null,
			oldSelectionId = (oldSelection && oldSelection.length==1) ?
				oldSelection[0].get('id') :
				null;
		sm.deselectAll();
		
		if(me.masterGrid){
			masterRecord = me.masterGrid.getViewModel().get('masterRecord');
			if(masterRecord && !masterRecord.phantom)
			{
				result = me.beforeRefresh(masterRecord);
			} else {
				store.loadData([]);
				result = false;
			}
		} else {
			result = me.beforeRefresh(masterRecord);
		}
		
		if(result){
			if (vm==null || vm.get('filterReady')!==false) {
				me.mainView.setLoading(true);
				store.load(
					function(records, operation, success){
						var recordToSelect = store.getById(oldSelectionId);
						if (!success) {
							me.onError(operation.getError().response.responseText);
						}
						if(recordToSelect){
							me.grid.view.scrollTo(recordToSelect);
						} else {
							if(oldSelectionIndex && store.getCount()>oldSelectionIndex){
								me.grid.view.scrollTo(oldSelectionIndex);
							}
						}
						me.mainView.setLoading(false);
					}
				);
			}
		}
	},
	
	onChangeSelect: function(grid, selected, eOpts){
		var me = this,
			selectionCorrect = selected && selected.length > 0,
			vm = me.grid.getViewModel(),
			deleteButton = me.lookupReference('delete' + me.grid.suffix);
		
		if(deleteButton){
			deleteButton.setDisabled(!selectionCorrect);
		}
		if(vm){
			vm.set('masterRecord', selectionCorrect ? selected[0] : null);
		}
		
		if(me.detailGrid){
			me.detailGrid.setDisabled(!selectionCorrect || selected[0].phantom);
			me.detailGrid.fireEvent('refreshtable');
		}
	},
	
	onCancelEdit: function(editor, ctx, eOpts) {
		var me = this;
		
		if(ctx.record.phantom && !ctx.record.dirty){
			ctx.grid.store.remove(ctx.record);
		}
	},
	
	onCompleteEdit: function(editor, ctx, eOpts){
		var me = this,
			grid = ctx.grid,
			record = ctx.record,
			sm = grid.getSelectionModel();
		
		me.mainView.setLoading(true);
		sm.deselectAll();
		record.self.setProxy(grid.getStore().getProxy());
		record.save({
			callback: function(records, operation, success){
				sm.select(record);
				if (!success) {
					me.onError(operation.getError().response.responseText,
					function(){
						editor.startEdit(record);
					});
				}
				me.mainView.setLoading(false);
			}
		});
	}
});
