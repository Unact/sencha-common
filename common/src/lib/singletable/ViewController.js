Ext.define('Ext.lib.singletable.ViewController', {
    extend: 'Ext.lib.app.ViewController',


    init: function(view){
        var me = this;
        
        me.mainView = me.mainView || view;      
        
        view.on('refreshtable', me.onRefresh, me);
        view.on('savetable', me.onSave, me);

        if(view.disableSelectionChangeHandler!==true){
            view.on('selectionchange', me.onChangeSelect, me);
        }
    },

    onDelete: function(){
        var me = this;
        var sm = me.getView().getSelectionModel();
        var oldSelection = sm.getSelection();
        var store = me.getView().getStore();
        var oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
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
        
        if(me.getView().enableDeleteDialog===true){
            Ext.Msg.show({
                title : 'Внимание',
                message : 'Вы действительно хотите удалить запись?',
                buttons : Ext.Msg.YESNOCANCEL,
                icon : Ext.Msg.QUESTION,
                fn : function(btn) {
                    if (btn === 'yes') {
                        me.deleteModel(store, oldSelection, oldSelectionIndex, sm);
                    }
                }
            });
        } else {
            me.deleteModel(store, oldSelection, oldSelectionIndex, sm);
        }
    },


    onChangeSelect: function(sm, selected, eOpts){
        var me = this;
        var selectedOne = selected && selected.length==1;
        var vm = me.getView().getViewModel();
        var deleteButton = me.lookupReference('delete' + me.getView().suffix);
    
        if(deleteButton){
            deleteButton.setDisabled(me.isDisableDeleteButton(selected));
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
    
    /**
     * Функция должна возвратить "истину" для продолжения обновления
     */
    beforeRefresh: function(masterRecord){
        return true;
    },
    
    afterRefresh: Ext.emptyFn,
    
    /**
     * вызывает при наличии функцию beforeRefresh.
     * Функция должна возвратить "истину" для продолжения обновления
     */
    onRefresh: function(){
        var me = this;
        var result = true;
        var masterRecord;
        var vm = me.getView().getViewModel();
        var sm = me.getView().getSelectionModel();
        var store = me.getView().getStore();
        var oldSelection = sm.getSelection();
        var oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
                store.indexOf(oldSelection[0]) :
                null;
        var oldSelectionId = (oldSelection && oldSelection.length==1) ?
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
                store.load({
                    callback: function(records, operation, success){
                        var recordToSelect = store.getById(oldSelectionId);
                        if (!success) {
                            me.onError(operation.getError().response);
                        }
                        if(recordToSelect){
                            me.getView().view.scrollTo(recordToSelect);
                        } else {
                            if(oldSelectionIndex && store.getCount()>oldSelectionIndex){
                                me.getView().view.scrollTo(oldSelectionIndex);
                            }
                        }
                        me.mainView.setLoading(false);
                        me.afterRefresh.call(me);
                    }
                });
            }
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
        var me = this;
        var result = {};
        var sm = me.getView().getSelectionModel();
        var store = me.getView().getStore();
        var masterRecord;

        if(me.masterGrid){
            masterRecord = me.masterGrid.getViewModel().get('masterRecord');
        }

        result = me.beforeAdd(masterRecord);
        

        
        if(result){
            var editingColumn = me.getView().getAutoEditOnAdd();
            var editingPlugin = me.getView().findPlugin('cellediting');
            var newRec = me.addModel(store, sm, result); 
    
            me.getView().view.scrollTo(newRec);
            sm.select(newRec);

            if (editingColumn !== false && editingPlugin) {
                editingPlugin.startEdit(newRec, editingColumn);
            }
        }
        me.afterAdd(newRec);
    },
    
    onSave: function() {
        var me = this;
        var table = me.getView();
        var store = table.getStore();
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
                        table.getSelectionModel().refresh();
                        me.mainView.setLoading(false);
                        if (batch.exceptions.length > 0) {
                            me.onError(batch.exceptions[0].getError().response);
                        } else {
                            if(me.detailGrids && table.saveDetail){
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
                        for(j = 0; j<table.columns.length && !fieldName; j++){
                            if(table.columns[j].dataIndex==field){
                                fieldName = table.columns[j].text;
                            }
                        }
                        
                        fieldName = fieldName ? fieldName: field;
                        errors.push('Поле "' + fieldName + '" ' + messages[i][field]);
                    }
                }
                
                Ext.Msg.alert("Некорректные значения", errors.join("<br/>"));
            }
        } else if(me.detailGrids && table.saveDetail){
            me.detailGrids.forEach(function(detail){
                detail.fireEvent('savetable');
            });
        } else if(arguments.length==2) {
            callback.call(callbackScope);
        }
    },


    deleteModel: Ext.emptyFn,
    addModel: Ext.emptyFn,
    isDisableDeleteButton: Ext.emptyFn
});