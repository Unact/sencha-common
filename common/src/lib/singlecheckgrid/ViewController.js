Ext.define('Ext.lib.singlecheckgrid.ViewController', {
    extend: 'Ext.lib.app.ViewController',
    alias : 'controller.singlecheckgrid',

    mixins: ['Ext.lib.shared.Detailable'],

    init: function(view){
        var me = this;

        me.mainView = me.mainView || view;

        view.on('refreshtable', me.sharedRefresh, me);
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

    onRefresh: function() {
        var me = this;
        var view = me.getView();

        view.setAvailableRowsFK(null);
        me.sharedRefresh();
    },

    sharedRefresh: function() {
        var me = this;
        var result = true;
        var resultCheckmark = true;
        var masterRecord;
        var vm = me.getView().getViewModel();
        var sm = me.getView().getSelectionModel();
        var store = me.getView().getStore();
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

        if(me.hasMaster()){
            masterRecord = this.getMasterRecord();
            if(masterRecord && !masterRecord.phantom)
            {
                resultCheckmark = me.beforeRefresh(masterRecord);
                result = me.beforeAvailableRowsRefresh(masterRecord);
            } else {
                if(!checkmarkStore.isEmptyStore) {
                    checkmarkStore.loadData([]);
                }
                resultCheckmark = false;
                result = false;
            }
        } else {
            resultCheckmark = me.beforeRefresh(masterRecord);
            result = me.beforeAvailableRowsRefresh(masterRecord);
        }


        if(vm==null || vm.get('filterReady')!==false) {
            if(resultCheckmark)
                stores.push(checkmarkStore);

            if(result)
                stores.push(store);
        }


        counter = stores.length;
        if(counter == 0) {
            me.afterRefresh();
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
                        me.afterRefresh();

                        if(recordToSelect){
                            me.getView().view.scrollToRecord(recordToSelect);
                        } else {
                            if(oldSelectionIndex && store.getCount()>oldSelectionIndex){
                                me.getView().view.scrollToRecord(oldSelectionIndex);
                            }
                            me.getView().view.scrollToRecord(0);
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
        var masterRecord = me.getMasterRecord();
        var callback;
        var callbackScope;

        if(masterRecord == null) {
            return;
        }

        if (arguments[0] && (typeof arguments[0]==='function')) {
            callback = arguments[0];
            callbackScope = arguments[1] || me;
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
                    if(callback) {
                        callback.call(callbackScope);
                    }
                },

                failure: function(batch, opt){
                    if (batch.exceptions.length > 0) {
                        me.onError(batch.exceptions[0].getError().response);
                    }
                    me.mainView.setLoading(false);
                    if(callback) {
                        callback.call(callbackScope);
                    }
                }
            });
        } else {
            if(callback) {
                callback.call(callbackScope);
            }
        }
    },

    beforeRefresh: function(masterRecord){
        return true;
    },

    //Обновлять ли стор допустимых значений.
    //Предполагается, что этот стор должен загружаться один раз,
    //А при смене мастера должны меняться только галочки.
    //
    //Поэтому, по-умолчанию false.
    beforeAvailableRowsRefresh: function(masterRecord) {
        return false;
    },

    afterRefresh: function() {
        var me = this;
        var ids=[];                                              //Массив внешних ключей на допустимые значения
        var store = me.getView().getStore();                     //Стор допустимых значений
        var checkmarkStore = me.getView().getCheckmarkStore();   //Стор отмеченных значений
        var filters = store.getFilters().clone();                //Фильтр, примененный к допустимым значениям.
                                                                 //В начала метода фиьтр снимается, а в конце - возвращается

        //Для отмеченных значений заполнить массив ids внешними ключами на допустимые значения
        checkmarkStore.each(function(record) {
            ids.push(record.get(me.checkmarkLink));
        });

        store.clearFilter();

        //Приветси галочки в допустимых значениях к состоянию отмеченных значений
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
    },

    cleanTable: function() {
        this.getView().getStore().loadData([]);
        this.getView().getCheckmarkStore().loadData([]);
    }
});
