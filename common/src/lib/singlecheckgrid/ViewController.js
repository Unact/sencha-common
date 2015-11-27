Ext.define('Ext.lib.singlecheckgrid.ViewController', {
    extend: 'Ext.lib.app.ViewController',
    alias : 'controller.singlecheckgrid',

    init: function(view){
        var me = this;
        
        me.mainView = me.mainView || view;      
        
        view.on('refreshtable', me.onCheckmarkRefresh, me);
        view.on('refreshgrid', me.onGridRefresh, me);        
        view.on('savetable', me.onSave, me);
    },
    
    onCheckmarkRefresh: function() {
        this.sharedRefresh(false, true);
    },
    
    onRefresh: function() {
        this.sharedRefresh(true, true);
    },
    
    onGridRefresh: function(masterRecord) {
        this.beforeGridRefresh(masterRecord);
        this.sharedRefresh(true, false);
    },

    sharedRefresh: function(isRefreshTree, isRefreshCheckmark) {
        var me = this;
        var result = true;
        var masterRecord;
        var vm = me.getView().getViewModel();
        var sm = me.getView().getSelectionModel();
        var store = me.getView().getStore();  //?
        var checkmarkStore = me.getView().getCheckmarkStore(); 
        var oldSelection = sm.getSelection();
        var oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
                store.indexOf(oldSelection[0]) :
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
            stores.push(store);
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
                        var recordToSelect = store.getById(oldSelectionId);
        
                        //afterRefresh изменяет выделенную строку, поэтому
                        //вызовим его до установки фокуса на строку 
                        me.afterRefresh.call(me, records, operation, success);
            
                        if(recordToSelect){
                            me.getView().view.scrollTo(recordToSelect);
                        } else {
                            if(oldSelectionIndex && treeStore.getCount()>oldSelectionIndex){
                                me.getView().view.scrollTo(oldSelectionIndex);
                            }
                            me.getView().view.scrollTo(0);
                        }
                        
                        me.mainView.setLoading(false);
                    }
                }
            });
        });
    },
    
   onSave: function() {
/*
        var me = this;
        var recordsChecked = me.getView().getChecked();
        var store = me.getView().getCheckmarkStore();
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
*/
    },
    
    beforeRefresh: function(masterRecord){
        return true;
    },
    afterRefresh: Ext.emptyFn,
});