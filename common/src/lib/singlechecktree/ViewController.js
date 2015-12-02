Ext.define('Ext.lib.singlechecktree.ViewController', {
    extend: 'Ext.lib.app.ViewController',
    
    isProcessBranch: false,

    init: function(view){
        var me = this;
        
        me.mainView = me.mainView || view;      
        
        view.on('refreshtable', me.onCheckmarkRefresh, me);
        view.on('savetable', me.onSave, me);
        view.on('checkchange', me.onCheckchange, me);
    },

    onCheckmarkRefresh: function() {
        this.sharedRefresh(false, true);
    },
    
    onRefresh: function() {
        this.sharedRefresh(true, true);
    },

    sharedRefresh: function(isRefreshTree, isRefreshCheckmark) {
        var me = this;
        var result = true;
        var masterRecord;
        var view = me.getView();
        var vm = view.getViewModel();
        var sm = view.getSelectionModel();
        var treeStore = view.getStore();  //?
        var checkmarkStore = view.getCheckmarkStore(); 
        var oldSelection = sm.getSelection();
        var oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
                treeStore.indexOf(oldSelection[0]) :
                null;
        var oldSelectionId = (oldSelection && oldSelection.length==1) ?
                oldSelection[0].get('id') :
                null;
        var stores = [];
        var counter = 0;
                
        if(me.masterGrid){
            masterRecord = me.masterGrid.getViewModel().get('masterRecord');
            if(masterRecord && !masterRecord.phantom)
            {
                result = me.beforeRefresh(masterRecord);
            } else {
                checkmarkStore.loadData([]);
                result = false;
            }
        } else {
            result = me.beforeRefresh(masterRecord);
        }
        
        if(isRefreshTree) {
            stores.push(treeStore);
        }
        
        if(isRefreshCheckmark) {
            if(result && (vm==null || vm.get('filterReady')!==false)) {
                stores.push(checkmarkStore);
            }    
        }
        
        counter = stores.length;
        me.mainView.setLoading(true);
        
        Ext.Array.each(stores, function(store) {
            store.load({
                callback: function(records, operation, success) {
                    if (!success) {
                        me.onError(operation.getError().response);
                    }
                    
                    counter--;
                    if(counter == 0) {
                        var recordToSelect = treeStore.getById(oldSelectionId);
        
                        //afterRefresh изменяет выделенную строку, поэтому
                        //вызовим его до установки фокуса на строку 
                        me.afterRefresh.call(me, records, operation, success);
            
                        if(recordToSelect){
                            view.view.scrollTo(recordToSelect);
                        } else {
                            if(oldSelectionIndex && treeStore.getCount()>oldSelectionIndex){
                                view.view.scrollTo(oldSelectionIndex);
                            }
                            view.view.scrollTo(0);
                        }
                        
                        me.mainView.setLoading(false);
                    }
                }
            });
        });
    },
    
    onSave: function() {
        var me = this;
        var view = me.getView();
        var recordsChecked = view.getChecked();
        var store = view.getCheckmarkStore();
        var records = [];
        var recordsDel = [];
        var recordsAdd = [];
        var masterRecord = me.masterGrid.getViewModel().get('masterRecord');

        //найти где сняли галочки. (нет recordsChecked)
        store.each(function(record) {
            var isExists = false;
            Ext.Array.each(recordsChecked, function(recordChecked) {
                if(record.get(me.checkmarkLink) == recordChecked.get('id')) {
                    isExists = true;
                    return false; //выход из итератора
                }
            });

            //Если галочка не стоит
            if(!isExists)
                recordsDel.push(record);
        });
        store.remove(recordsDel);

        Ext.Array.each(recordsChecked, function(recordChecked) {
            var isExists = false;

            store.each(function(record) {
                if(record.get(me.checkmarkLink) == recordChecked.get('id')) {
                    isExists = true;
                    return false; //выход из итератора
                }
            });

            //Если в сторе нет записи
            if(!isExists)
                recordsAdd.push(
                    me.createCheckmarkRecord(recordChecked, masterRecord)
                );
        });
        store.add(recordsAdd);

        if(store.hasChanges()) {
            me.mainView.setLoading(true);

            store.sync({
                success: function(batch, opt){
                    me.mainView.setLoading(false);
                },

                failure: function(batch, opt){
                    if (batch.exceptions.length > 0) {
                        me.onError(batch.exceptions[0].getError().response);
                    }
                    me.mainView.setLoading(false);
                }
            });
        }
    },

    onFilterCheck: function(btn) {
        var me = this;
        var store = me.getView().getStore();
        
        if(btn.pressed) {
            store.filterBy(function(node) {
                var isVisible = false;

                node.cascadeBy({
                    before: function(n) {
                        if(n.get('checked')) {
                            isVisible = true;
                        }
                        
                        return !isVisible; //Это немножко сократит кол-во итераций  
                    }
                });
                              
                return isVisible;
            });
        } else {
            store.clearFilter();
        }
    },
    
    onBranch: function(btn) {
        this.isProcessBranch = btn.pressed;
    },

    /**
     * Функция должна возвратить "истину" для продолжения обновления
     */
    beforeRefresh: function(masterRecord){
        return true;
    },
    
    afterRefresh: function() {
        var me = this;
        var ids=[];
        var view = me.getView();
        var rootNode = view.getRootNode();
        var store = view.getCheckmarkStore();

        store.each(function(record) {
            ids.push(record.get(me.checkmarkLink));
        });

        rootNode.cascadeBy(function(node) {
            var index;
            if((index = ids.indexOf(node.get('id'))) >= 0) {
                node.set('checked', true);
                ids.splice(index, 1);
            } else {
                node.set('checked', false);
            }
        });
    },
    
    onCheckchange: function(node, checked, eOpts) {
        var me = this;

        node.cascadeBy(function(n) {
            if(me.isProcessBranch)
                n.set('checked', checked);
        });    
    }
});