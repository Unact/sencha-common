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

        this.showSaveError = view.showSaveError === false ? false : true;
        this.autoRefreshingTable = false || view.autoRefreshingTable;
    },

    needRefreshDetailOnSelect: function() {
        return true;
    },

    changeDisabledButtons: function() {
        this.getView().down('sharedtoolbar').enabledButtons.forEach(function(prefix) {
            var button = this.lookupReference(prefix + this.getView().suffix);
            var functionName = 'isDisabled' + prefix.charAt(0).toUpperCase() + prefix.slice(1) + 'Button';

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
        if (this.detailGrids) {
            this.detailGrids.forEach(function(detail){
                detail.getController().getViewModel().set(
                    'selectedMaster',
                    this.getViewModel().get('masterRecord')
                );
                if (this.needRefreshDetailOnSelect()) {
                    detail.fireEvent('refreshtable');
                }
            }, this);
        }
    },

    extractMasterRecord: function() {
        var selected = this.getView().getSelection();
        return (selected && selected.length === 1) ? selected[0] : selected;
    },

    setMasterRecord: function(master) {
        var vm = this.getView().getViewModel();

        if(vm){
            vm.set('masterRecord', master);
        }
    },

    extractAndSetMasterRecord: function() {
        var master = this.extractMasterRecord();
        this.setMasterRecord(master);

        return master;
    },

    onChangeSelect: function(sm, selected, isSelected, selection, eOpts) {
        var master = this.extractAndSetMasterRecord();
        this.beforeChangeSelect(sm, selected, isSelected, selection, eOpts);
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
        var me = this;

        me.detailGrids = detailGrids;

        me.detailGrids.forEach(function(detail){
            detail.getController().masterGrid = me.getView();
        });
    },

    findDetail: function(xtype){
        var me = this;

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

    rememberOldSelections: function () {
        var oldSelection = this.getView().getSelection();

        if (oldSelection) {
            this.oldSelectionIndex = this.getView().getStore().indexOf(oldSelection);
            this.oldSelectionId = oldSelection.id;
        } else {
            this.oldSelectionIndex = null;
            this.oldSelectionId = null;
        }
    },

    /**
     * вызывает при наличии функцию beforeRefresh.
     * Функция должна возвратить "истину" для продолжения обновления
     */
    onRefresh: function() {
        var store = this.getView().getStore();
        var result = true;

        this.rememberOldSelections();
        this.getView().deselectAll();
        if(this.masterGrid){
            var masterRecord = this.masterGrid.getViewModel().get('masterRecord');
            if(masterRecord && !masterRecord.phantom) {
                result = this.beforeRefresh(masterRecord);
            } else {
                if(!store.isEmptyStore) {
                    store.loadData([]);
                }
                result = false;
            }
        } else {
            result = this.beforeRefresh();
        }

        if (result && this.isFilterReady()) {
            Ext.GlobalEvents.fireEvent('beginserveroperation');
            store.load({
                callback: function(records, operation, success){
                    if (!success) {
                        Ext.Msg.alert("Ошибка", operation.getError().response.responseText);
                    }
                    this.getView().refresh();
                    this.callbackRefresh(this.oldSelectionId, this.oldSelectionIndex);
                    Ext.GlobalEvents.fireEvent('endserveroperation');
                    this.afterRefresh.call();
                },
                scope: this
            });
        }
    },

    reselectModel: function() {
        this.rememberOldSelections();
        this.getView().deselectAll();
        this.callbackRefresh(this.oldSelectionId, this.oldSelectionIndex);
    },

    isFilterReady: function() {
        var vm = this.getView().getViewModel();
        return !vm || vm.get('filterReady') !== false;
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
        var result;
        var view = this.getView();
        var masterRecord;
        var newRec;

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
        var me = this;
        var view = me.getView();
        var oldSelection = view.getSelection();
        var oldSelectionIndex = oldSelection ? view.getStore().indexOf(oldSelection) : null;

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
        var me = this;
        var detailsToProcess = 0;
        var view = me.getView();
        var store = view.getStore();
        var callback = function(){
            if(--detailsToProcess <= 0){
                me.syncing = false;
                if(!me.autoRefreshingTable) {
                    me.onRefresh();
                } else {
                    me.reselectModel();
                }
            }
        };
        var callbackScope = me;
        var saveDetails = function(makeCallback, refreshSelf){
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
                        if (showSaveError) {
                            Ext.Msg.alert("Ошибка", batch.exceptions[0].getError().response.responseText);
                        }
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
        var view = this.getView();
        var store = view.getStore();
        var recordToSelect = store.getById(oldSelectionId);
        var storeCount = store.getCount();

        if (recordToSelect) {
            view.scrollToRecord(recordToSelect);
        } else if (oldSelectionIndex && storeCount > oldSelectionIndex) {
            view.scrollToRecord(store.getAt(oldSelectionIndex));
        } else if (storeCount > 0) {
            view.scrollToRecord(store.first());
        } else {
            view.fireEvent('selectionchange', view, []);
        }
    },

    deleteRecords: function(records, index){
        var store = this.getView().getStore();
        var recordsCount;

        store.remove(records);
        recordsCount = store.getCount();
        if (recordsCount > 0) {
            this.getView().select(recordsCount > index ? index : index - 1);
        }
    },

    addRecord: function(result) {
        var store = this.getView().getStore();
        var index = store.indexOf(this.getView().getLastSelected());
        var newRec;

        if(store.isSorted()){
            newRec = store.add(result)[0];
        } else {
            newRec = store.insert(Math.max(index, 0), result)[0];
        }

        return newRec;
    },

    isDisabledDeleteButton: function(){
        var selected = this.getView().getSelection();

        return (selected && selected.length > 0);
    },

    isDisabledAddButton: Ext.emptyFn,

    isDisabledRefreshButton: Ext.emptyFn,

    isDisabledSaveButton: Ext.emptyFn
});
