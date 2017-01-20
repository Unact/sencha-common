Ext.define('Ext.modern.lib.app.base.ViewController', {
    extend: 'Ext.app.ViewController',

    config: {
        detailGrids: [],
        masterGrid: null
    },

    init: function(view) {

        this.mainView = view;

        view.on('refreshtable', this.onRefresh, this);
        view.on('savetable', this.onSave, this);

        if(view.disableSelectionChangeHandler!==true){
            view.on('selectionchange', this.onChangeSelect, this);
        }

        this.refreshDetailOnSelect = view.refreshDetailOnSelect === false ? false : true;
        this.autoRefreshingTable = false || view.autoRefreshingTable;
    },

    changeDisabledButtons: function() {
        this.getView().down('sharedtoolbar').enabledButtons.forEach(function(prefix) {
            const button = this.lookupReference(prefix + this.getView().suffix);
            const functionName = 'isDisabled' + prefix.charAt(0).toUpperCase() + prefix.slice(1) + 'Button';

            if (button) {
                button.setDisabled(this[functionName]());
            }
        }, this);
    },

    changeDisabledDetails: function(master) {
        if (this.detailGrids) {
            this.detailGrids.forEach(function(detail){
                detail.setDisabled(detail.getController().isDisabledView(master));
            }, this);
        }
    },

    refreshDetails: function() {
        if (!this.refreshDetailOnSelect) {
            return;
        }

        if (this.detailGrids) {
            this.detailGrids.forEach(function(detail){
                detail.fireEvent('refreshtable');
            }, this);
        }
    },

    extractMasterRecord: function() {
        const selected = this.getView().getSelection();
        return (selected && selected.length === 1) ? selected[0] : selected;
    },

    setMasterRecord: function(master) {
        const vm = this.getView().getViewModel();

        if(vm){
            vm.set('masterRecord', master);
        }
    },

    extractAndSetMasterRecord: function() {
        const master = this.extractMasterRecord();
        this.setMasterRecord(master);

        return master;
    },

    onChangeSelect: function(sm, selected, eOpts) {
        const master = this.extractAndSetMasterRecord();
        this.beforeChangeSelect(sm, selected, eOpts);
        this.changeDisabledButtons();
        this.changeDisabledDetails(master);
        this.refreshDetails();
    },

    isDisabledView: function(master) {
        if(master == null) {
            return true;
        }
        return master.phantom;
    },

    applyDetailGrids: function(detailGrids){
        const me = this;

        me.detailGrids = detailGrids;

        me.detailGrids.forEach(function(detail){
            detail.getController().masterGrid = me.getView();
        });
    },

    findDetail: function(xtype){
        const me = this;

        if (me.detailGrids.length > 0){
            return me.detailGrids.find(function(detail){
                return detail.xtype === xtype;
            });
        }
    },

    beforeChangeSelect: Ext.emptyFn,


    afterRefresh: Ext.emptyFn,

    beforeRefresh: function() {
        return true;
    },

    /**
     * вызывает при наличии функцию beforeRefresh.
     * Функция должна возвратить "истину" для продолжения обновления
     */
    onRefresh: function() {
        const me = this;
        const view = me.getView();
        const vm = view.getViewModel();
        const store = view.getStore();
        const oldSelection = view.getSelection();
        let oldSelectionIndex = null;
        let oldSelectionId = null;
        let result = true;
        let masterRecord;

        if(oldSelection) {
            let r = oldSelection;
            oldSelectionIndex = store.indexOf(r);
            oldSelectionId = r.id;
        }

        view.deselectAll();
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
                Ext.GlobalEvents.fireEvent('beginserveroperation');
                store.load({
                    callback: function(records, operation, success){
                        if (!success) {
                            Ext.Msg.alert("Ошибка", operation.getError().response.responseText);
                        }

                        me.callbackRefresh(oldSelectionId, oldSelectionIndex);
                        Ext.GlobalEvents.fireEvent('endserveroperation');
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
    beforeAdd: function(masterRecord) {
        return {};
    },

    /**
     * Функция должна возвратить объект для вставки в хранилище.
     * Если объект не будет возвращен, то в хранилище ничего не вставится.
     */
    afterAdd: function(record) {
    },

    /**
     *
     * вызывает функцию beforeAdd.
     * Функция должна возвратить объект для вставки в хранилище.
     * Если объект не будет возвращен, то в хранилище ничего не вставится.
     */
    onAdd: function() {
        let result = {};
        const view = this.getView();
        let masterRecord;
        let newRec;

        if(this.masterGrid){
            masterRecord = this.masterGrid.getViewModel().get('masterRecord');
        }

        result = this.beforeAdd(masterRecord);

        if(result){
            newRec = this.addRecord(result);

            view.scrollToRecord(newRec);
            view.select(newRec);
        }
        this.afterAdd(newRec);
    },

    onDelete: function() {
        const me = this;
        const view = me.getView();
        const oldSelection = view.getSelection();
        const oldSelectionIndex = oldSelection ? view.getStore().indexOf(oldSelection) : null;

        if (view.config.enableDeleteDialog === true){
            Ext.Msg.confirm(
                'Внимание',
                'Вы действительно хотите удалить запись?',
                function(btn) {
                    if (btn === 'yes') {
                        me.deleteRecords(oldSelection, oldSelectionIndex);
                    }
                }
            );
        } else {
            me.deleteRecords(oldSelection, oldSelectionIndex);
        }
    },

    /**
     * @param {Ext.data.Batch}
     */
    afterSave: Ext.emptyFn,

    onSave: function() {
        const me = this;
        let detailsToProcess = 0;
        const view = me.getView();
        const store = view.getStore();
        const callback = function(){
            if(--detailsToProcess <= 0){
                me.syncing = false;
                if(!me.autoRefreshingTable) {
                    me.onRefresh();
                }
            }
        };
        const callbackScope = me;
        const saveDetails = function(makeCallback, refreshSelf){
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
        };

        me.syncing = true;

        if (store.hasChanges()) {
            Ext.GlobalEvents.fireEvent('beginserveroperation');
            store.sync({
                callback: function(batch) {
                    view.refresh();
                    Ext.GlobalEvents.fireEvent('endserveroperation');
                    me.afterSave(batch);
                    if (batch.exceptions.length > 0) {
                        Ext.Msg.alert("Ошибка", batch.exceptions[0].getError().response.responseText);
                    } else {
                        saveDetails(true, callback, callbackScope);
                    }
                }
            });
        } else {
            saveDetails(true, callback, callbackScope);
        }
    },
    /*
     * По идентификатору находится модель
     * Если модель найдена, то поставить фокус на нее
     * иначе поставить фокус на строку тем же порядковым номером, что и был ранее
     */
    callbackRefresh: function (oldSelectionId, oldSelectionIndex) {
        const view = this.getView();
        const store = view.getStore();
        const recordToSelect = store.getById(oldSelectionId);
        const storeCount = store.getCount();

        if (recordToSelect) {
            view.scrollToRecord(recordToSelect);
        } else if (oldSelectionIndex && storeCount > oldSelectionIndex) {
            view.scrollToRecord(oldSelectionIndex);
        } else if (storeCount > 0) {
            view.scrollToRecord(0);
        } else {
            view.fireEvent('selectionchange', view, []);
        }
    },

    deleteRecords: function(records, index){
        const store = this.getView().getStore();
        let recordsCount;

        store.remove(records);
        recordsCount = store.getCount();
        if (recordsCount > 0) {
            this.getView().select(recordsCount > index ? index : index - 1);
        }
    },

    addRecord: function(result) {
        const store = this.getView().getStore();
        const index = store.indexOf(this.getView().getLastSelected());
        let newRec;

        if(store.isSorted()){
            newRec = store.add(result)[0];
        } else {
            newRec = store.insert(Math.max(index, 0), result)[0];
        }

        return newRec;
    },

    isDisabledDeleteButton: function(){
        const selected = this.getView().getSelection();

        return (selected && selected.length > 0);
    },

    isDisabledAddButton: Ext.emptyFn,

    isDisabledRefreshButton: Ext.emptyFn,

    isDisabledSaveButton: Ext.emptyFn
});
