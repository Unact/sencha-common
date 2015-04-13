// Контроллер таблицы
Ext.define('Ext.lib.singlegrid.ViewController', {
	extend : 'Ext.lib.app.ViewController',
	alias : 'controller.singlegrid',
	
	/**
	 * Добавляются обработчики для кнопок обновления, добавления, удаления и сохранения.
	 * Для методов добавления и обновления доступны "предварительные" шаблонные методы (см. ниже)
	 * Также добавляется обработчик события обновления представления (refrehtable)
	 */
	init: function(){
		var me = this,
			grid = me.getView(),
			addHandler = "on" + grid.suffix + "Add",
			deleteHandler = "on" + grid.suffix + "Delete",
			saveHandler = "on" + grid.suffix + "Save",
			refreshHandler = 'on' + grid.suffix + 'Refresh';
		
		me.grid = grid;
		if(me.mainView==null){
			me.mainView = grid;
		}
		
		if(grid.disableDelete !== true && me[deleteHandler]==null){
			me[deleteHandler] = me.onDelete;
		}
		
		if(grid.disableAdd !== true && me[addHandler]==null){
			me[addHandler] = me.onAdd;
		}
		
		if(grid.disableSave !== true && me[saveHandler]==null){
			me[saveHandler] = me.onSave;
		}
		
		if(grid.disableRefresh !== true && me[refreshHandler]==null){
			me[refreshHandler] = me.onRefresh;
		}
		
		me.control({
			'#': {
				refreshtable: 'onRefresh'
			}
	   });
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
	
	/**
	 * 
	 * вызывает при наличии функцию beforeAdd.
	 * Функция должна возвратить объект для вставки в хранилище.
	 * Если объект не будет возвращен, то в хранилище ничего не вставится.
	 */
	onAdd : function(button) {
		var me = this,
			result = {},
			sm = me.grid.getSelectionModel(),
			store = me.grid.getStore(),
			index = store.indexOf(sm.getLastSelected()),
			newRec;
		
		if(me.beforeAdd!=null && (typeof me.beforeAdd == 'function')){
			result = me.beforeAdd();
		}
		if(result){
			newRec = store.insert(Math.max(index, 0), result);
			
			sm.select(newRec);
		}
	},
	
	onSave: function() {
        var me = this,
        	store = me.grid.getStore();
        
		if (store.hasChanges()) {
			me.grid.getSelectionModel().deselectAll();
			me.mainView.setLoading(true);
			store.sync({
				callback : function(batch) {
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
	
	// вызывает при наличии функцию beforeRefresh.
	// Функция должна возвратить "истину" для продолжения обновления
	onRefresh: function(){
		var me = this,
			result = true,
			vm = me.getView().getViewModel(),
			sm = me.grid.getSelectionModel(),
			store = me.grid.getStore(),
        	oldSelection = sm.getSelection(),
        	oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
				store.indexOf(oldSelection[0]) :
				null;
		
		sm.deselectAll();
		if(me.beforeRefresh!=null && (typeof me.beforeRefresh == 'function')){
			result = me.beforeRefresh();
		}
		if(result){
			if (vm==null || vm.get('filterReady')!==false) {
				me.mainView.setLoading(true);
				store.load(
					function(records, operation, success){
						if (!success) {
							me.onError(operation.getError().response.responseText);
						}
						if(oldSelectionIndex && store.getCount()>oldSelectionIndex){
							sm.select(oldSelectionIndex);
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
			vm = me.getView().getViewModel(),
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
	}
});
