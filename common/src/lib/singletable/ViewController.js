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
        var view = me.getView();
        var sm = view.getSelectionModel();
        var oldSelection = sm.getSelection();
        var store = view.getStore();
        var oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
                store.indexOf(oldSelection[0]) :
                null;
        
        if(view.enableDeleteDialog===true){
            Ext.Msg.show({
                title : 'Внимание',
                message : 'Вы действительно хотите удалить запись?',
                buttons : Ext.Msg.YESNOCANCEL,
                icon : Ext.Msg.QUESTION,
                fn : function(btn) {
                    if (btn === 'yes') {
                        me.deleteRecords(store, oldSelection, oldSelectionIndex, sm);
                    }
                }
            });
        } else {
            me.deleteRecords(store, oldSelection, oldSelectionIndex, sm);
        }
    },

    onChangeSelect: function(sm, selected, eOpts){
        var me = this;
        var selectedOne = selected && selected.length==1;
        var view = me.getView();
        var vm = view.getViewModel();
        var deleteButton = me.lookupReference('delete' + view.suffix);
    
        if(deleteButton){
            deleteButton.setDisabled(me.isDisableDeleteButton(selected));
        }
        if(vm){
            vm.set('masterRecord', selectedOne ? selected[0] : null);
        }
        
        me.beforeChangeSelect(sm, selected, eOpts);
        
        if(me.detailGrids){
            me.detailGrids.forEach(function(detail){
                detail.setDisabled(!selectedOne || selected[0].phantom);
                detail.fireEvent('refreshtable');
            });
        }
    },
    
    beforeChangeSelect: Ext.emptyFn,
    
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
        var view = me.getView();
        var vm = view.getViewModel();
        var sm = view.getSelectionModel();
        var store = view.getStore();
        var oldSelection = sm.getSelection();
        
        var oldSelectionIndex = null;
        var oldSelectionId = null;
        if(oldSelection && oldSelection.length==1) {
            var r = oldSelection[0];
            oldSelectionIndex = store.indexOf(r);
            oldSelectionId = r.get('id');
        }

        sm.deselectAll();
        
        if(me.masterGrid){
            masterRecord = me.masterGrid.getViewModel().get('masterRecord');
            if(masterRecord && !masterRecord.phantom) {
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
                        if (!success) {
                            me.onError(operation.getError().response);
                        }
                        
                        me.callbackRefresh(view, store, oldSelectionId, oldSelectionIndex);

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
        var view = me.getView();
        var sm = view.getSelectionModel();
        var store = view.getStore();
        var masterRecord;
        var editingColumn;
        var editingPlugin;
        var newRec;

        if(me.masterGrid){
            masterRecord = me.masterGrid.getViewModel().get('masterRecord');
        }

        result = me.beforeAdd(masterRecord);
                
        if(result){
            editingColumn = view.getAutoEditOnAdd();
            editingPlugin = view.findPlugin('cellediting');
            newRec = me.addRecord(store, sm, result); 
    
            view.view.scrollTo(newRec);
            sm.select(newRec);

            if (editingColumn !== false && editingPlugin) {
                editingPlugin.startEdit(newRec, editingColumn);
            }
        }
        me.afterAdd(newRec);
    },
    
    onSave: function() {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
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
                        view.getSelectionModel().refresh();
                        me.mainView.setLoading(false);
                        if (batch.exceptions.length > 0) {
                            me.onError(batch.exceptions[0].getError().response);
                        } else {
                            if(me.detailGrids && view.saveDetail){
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
                        for(j = 0; j<view.columns.length && !fieldName; j++){
                            if(view.columns[j].dataIndex==field){
                                fieldName = view.columns[j].text;
                            }
                        }
                        
                        fieldName = fieldName ? fieldName: field;
                        errors.push('Поле "' + fieldName + '" ' + messages[i][field]);
                    }
                }
                
                Ext.Msg.alert("Некорректные значения", errors.join("<br/>"));
            }
        } else if(me.detailGrids && view.saveDetail){
            me.detailGrids.forEach(function(detail){
                detail.fireEvent('savetable');
            });
        } else if(arguments.length==2) {
            callback.call(callbackScope);
        }
    },

    deleteRecords: Ext.emptyFn,
    addRecord: Ext.emptyFn,
    isDisableDeleteButton: Ext.emptyFn
});