Ext.define('Ext.lib.singletable.ViewController', {
    extend: 'Ext.lib.app.ViewController',

    mixins: ['Ext.lib.shared.Detailable'],

    config: {
        // массив окон детализации
        detailGrids: [],
        masterGrid: null
    },
    
    setDetailGrids: function(detailGrids){
        var me = this;
        
        me.detailGrids = detailGrids;
        
        me.detailGrids.forEach(function(detail){
            detail.getController().masterGrid = me.getView();
        });
    },

    findDetail: function(detailName){
        var me = this;
        
        if (me.detailGrids.length > 0){
            return me.detailGrids.find(function(detail){
                        return detail.xtype === detailName;
                    });
        } else {
            if (me.masterGrid){
                return me.masterGrid.getController().findDetail(detailName);
            }
        }
    },

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
        var master = selectedOne ? selected[0] : null;
    
        if(deleteButton){
            deleteButton.setDisabled(me.isDisabledDeleteButton(selected));
        }
        if(vm){
            vm.set('masterRecord', master);
        }
        
        me.beforeChangeSelect(sm, selected, eOpts);
        
        if(me.detailGrids){
            me.detailGrids.forEach(function(detail){
                detail.setDisabled(detail.getController().isDisabledView(master));
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
                if(!store.isEmptyStore) {
                    store.loadData([]);
                }
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
    
            view.view.scrollToRecord(newRec);
            sm.select(newRec);

            if (editingColumn !== false && editingPlugin) {
                editingPlugin.startEdit(newRec, editingColumn);
            }
        }
        me.afterAdd(newRec);
    },

    afterSave: function(batch){
    },
    
    onSave: function() {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var messages;
        var i, j, fieldName, errors = [];
        var callback;
        var callbackScope;
        var detailsToProcess = 0;
        
        if (arguments[0] && (typeof arguments[0]==='function')) {
            callback = arguments[0];
            callbackScope = arguments[1] || me;
        } else {
            callback = function(){
            	if(--detailsToProcess<=0){
            		me.onRefresh();
            	}
            };
            callbackScope = me;
        }
        
        function saveDetails(makeCallback, refreshSelf){
        	if(me.detailGrids && view.saveDetail){
            	detailsToProcess = me.detailGrids.length;
                me.detailGrids.forEach(function(detail){
                	if(refreshSelf){
                		detail.fireEvent('savetable', callback, callbackScope);
                	} else {
                		detail.fireEvent('savetable');
                	}
                });
            } else if (makeCallback){
                callback.call(callbackScope);
            }
        }

        if (store.hasChanges()) {
            messages = store.getValidationMessages();
            if(messages.length==0){
                me.mainView.setLoading(true);
                store.sync({
                    callback : function(batch) {
                        view.getSelectionModel().refresh();
                        me.mainView.setLoading(false);
                        me.afterSave(batch);
                        if (batch.exceptions.length > 0) {
                            me.onError(batch.exceptions[0].getError().response);
                        } else {
                        	saveDetails(true, callback, callbackScope);
                        }
                    }
                });
            } else {
                messages.forEach(function(message){
                    if (message.base){
                        errors.push(message.base);
                    }
                    for(field in message.fields){
                        fieldName = null;
                        view.columns.forEach(function(column){
                            if(column.dataIndex==field){
                                fieldName = column.text;
                            }
                        });
                        
                        fieldName = fieldName ? fieldName: field;
                        errors.push('Поле "' + fieldName + '" ' + message[field]);
                    }
                });
                
                Ext.Msg.alert("Некорректные значения", errors.join("<br/>"));
            }
        } else {
        	saveDetails(arguments.length==2, callback, callbackScope);
        }
    },

    deleteRecords: Ext.emptyFn,
    addRecord: Ext.emptyFn,
    

    /**
     * Возвращает true, если надо задизейблить кнопку "Удалить".
     * @abstract
     * @param {Ext.data.Model} record - Выбранный строка, если никакая строка не выбрана, то null
     * @return {Boolean}
     */    
    isDisabledDeleteButton: Ext.emptyFn
});
