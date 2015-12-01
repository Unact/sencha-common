Ext.define('Ext.lib.singlecheckgrid.ViewController', {
    extend: 'Ext.lib.app.ViewController',
    alias : 'controller.singlecheckgrid',

    init: function(view){
        var me = this;
        
        me.mainView = me.mainView || view;      
        
        view.on('refreshtable', me.onCheckmarkRefresh, me);
        view.on('refreshavailablerows', me.onAvailableRowsRefresh, me);        
        view.on('savetable', me.onSave, me);
        
        //Добавить в экземпляр панели метод
        view.getChecked = function() {
            var checked = [];
            this.getStore().each(function(rec){
                if (rec.get('checked')) {
                    checked.push(rec);
                }
            });
            return checked;
        };
    },
    
    //Обновить только галочки
    //Выполняется, например, при срабатывании события refreshtable
    //refreshtable срабатывает, например, при смене строки в мастере
    onCheckmarkRefresh: function() {
        this.sharedRefresh(false, true);
    },
    
    //Обновить оба стора.
    //Выполняется, например, при нажатии кнопки обновить
    onRefresh: function() {
        this.sharedRefresh(true, true);
    },
    
    //Обносить доступные строки
    //Предполагается, что этот строр обнавляется реже, чем стор с галочками
    onAvailableRowsRefresh: function(masterRecord) {
        this.beforeAvailableRowsRefresh(masterRecord);
        this.sharedRefresh(true, false);
    },

    sharedRefresh: function(isRefreshAvailableRows, isRefreshCheckmark) {
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
        
        if(isRefreshAvailableRows) {
            stores.push(store);
        }
        
        if(isRefreshCheckmark) {
            if(result && (vm==null || vm.get('filterReady')!==false)) {
                stores.push(checkmarkStore);
            }    
        }
        
        counter = stores.length;

        if(counter == 0) {
            return;
        }

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
                            if(oldSelectionIndex && store.getCount()>oldSelectionIndex){
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
        var me = this;
        var recordsChecked = me.getView().getChecked();
        var store = me.getView().getCheckmarkStore();
        var records = [];
        var recordsDel = [];
        var recordsAdd = [];
        var masterRecord = me.masterGrid.getViewModel().get('masterRecord');

        if(masterRecord == null) {
            return;
        }

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

    beforeRefresh: function(masterRecord){
        return true;
    },

    afterRefresh: function() {
        var me = this;
        var ids=[];
        var store = me.getView().getStore();
        var checkmarkStore = me.getView().getCheckmarkStore();
        var filters = store.getFilters().clone();

        checkmarkStore.each(function(record) {
            ids.push(record.get(me.checkmarkLink));
        });

        store.clearFilter();
        store.each(function(record) {
            var index;
            if((index = ids.indexOf(record.get('id'))) >= 0) {
                record.set('checked', true);
                ids.splice(index, 1);
            } else {
                record.set('checked', false);
            }
        });
        
        store.filter(filters.getRange());
        
        //костыль!
        //Наблюдались случаи, когда панель оставалась задизейбленной.
        me.getView().setDisabled(false); 
    },
    
    onFilterCheck: function(btn) {
        var me = this;
        var store = me.getView().getStore();
        
        if(btn.pressed) {
            store.filterBy(function(record) {
                return record.get('checked');
            });
        } else {
            store.clearFilter();
        }
    }
});