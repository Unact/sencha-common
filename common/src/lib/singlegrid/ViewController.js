// Контроллер таблицы
Ext.define('Ext.lib.singlegrid.ViewController', {
	extend : 'Ext.lib.app.ViewController',
	alias : 'controller.singlegrid',
	
	config: {
		// массив окон детализации
		detailGrids: [],
		masterGrid: null
	},
	
	setDetailGrids: function(detailGrids){
		var me = this;
		
		me.detailGrids = detailGrids;
		
		me.detailGrids.forEach(function(detail){
			detail.getController().masterGrid = me.grid;
		});
	},
	
	/**
	 * Добавляются обработчики для кнопок обновления, добавления, удаления и сохранения.
	 * Для методов добавления и обновления доступны "предварительные" шаблонные методы (см. ниже)
	 * Также добавляется обработчик события обновления представления (refrehtable)
	 */
	init: function(view){
		var me = this;
		var control = {};
		var query = '[reference="' +view.reference + '"]';
		
		control[query] = {
			refreshtable: 'onRefresh',
			savetable: 'onSave'
		};
		
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
		var me = this;
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
	onAdd : function() {
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
			var editingColumn,
				editingPlugin;

			if(store.isSorted()){
				newRec = store.add(result)[0];
			} else {
				newRec = store.insert(Math.max(index, 0), result)[0];
			}
			me.grid.view.scrollTo(newRec);
			sm.select(newRec);

			editingColumn = me.grid.getConfig('autoEditOnAdd');
			editingPlugin = me.grid.findPlugin('cellediting');
			if (editingColumn !== false && editingPlugin) {
				editingPlugin.startEdit(newRec, editingColumn);
			}
		}
		me.afterAdd(newRec);
	},
	
	onSave: function() {
		var me = this;
		var grid = me.grid;
		var store = grid.getStore();
		var messages;
		var i, j, fieldName, errors = [];
		var callback;
		var callbackScope;
		
		if (arguments[0] && (typeof arguments[0]==='function')) {
			callback = arguments[0];
			callbackScope = arguments[1] || me;
		} else {
			callback = me.onRefresh;
			callbackScope = me;
		}

		if (store.hasChanges()) {
			messages = store.getValidationMessages();
			if(messages.length==0){
				me.mainView.setLoading(true);
				store.sync({
					callback : function(batch) {
						me.grid.getSelectionModel().refresh();
						me.mainView.setLoading(false);
						if (batch.exceptions.length > 0) {
							me.onError(batch.exceptions[0].getError().response);
						} else {
							if(me.detailGrids && grid.saveDetail){
								me.detailGrids.forEach(function(detail){
									detail.fireEvent('savetable', callback, callbackScope);
								});
							} else {
								callback.call(callbackScope);
							}
						}
					}
				});
			} else {
				for(i = 0; i<messages.length; i++){
					for(field in messages[i]){
						fieldName = null;
						for(j = 0; j<grid.columns.length && !fieldName; j++){
							if(grid.columns[j].dataIndex==field){
								fieldName = grid.columns[j].text;
							}
						}
						
						fieldName = fieldName ? fieldName: field;
						errors.push('Поле "' + fieldName + '" ' + messages[i][field]);
					}
				}
				
				Ext.Msg.alert("Некорректные значения", errors.join("<br/>"));
			}
		} else if(me.detailGrids && grid.saveDetail){
			me.detailGrids.forEach(function(detail){
				detail.fireEvent('savetable');
			});
		} else if(arguments.length==2) {
			callback.call(callbackScope);
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
							me.onError(operation.getError().response);
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
			selectedOne = selectionCorrect && selected.length==1,
			vm = me.grid.getViewModel(),
			deleteButton = me.lookupReference('delete' + me.grid.suffix);
		
		if(deleteButton){
			deleteButton.setDisabled(!selectedOne);
		}
		if(vm){
			vm.set('masterRecord', selectedOne ? selected[0] : null);
		}
		
		if(me.detailGrids){
			me.detailGrids.forEach(function(detail){
				detail.setDisabled(!selectedOne || selected[0].phantom);
				detail.fireEvent('refreshtable');
			});
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
					me.onError(operation.getError().response,
					function(){
						editor.startEdit(record);
					});
				}
				me.mainView.setLoading(false);
			}
		});
	}
});
