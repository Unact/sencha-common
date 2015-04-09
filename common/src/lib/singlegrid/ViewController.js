Ext.define('Ext.lib.singlegrid.ViewController', {
	extend : 'Ext.lib.app.ViewController',
	alias : 'controller.singlegrid',
	
	init: function(){
		var me = this,
			grid = me.getView(),
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
        	store = me.grid.store,
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
	
	onSave: function() {
        var me = this,
        	store = me.grid.store;
        
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
	
	onRefresh: function(){
		var me = this,
			result = true,
			vm = me.getView().getViewModel(),
			sm = me.grid.getSelectionModel(),
			store = me.grid.store,
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
