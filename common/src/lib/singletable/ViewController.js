Ext.define('Ext.lib.singletable.ViewController', {
    extend: 'Ext.lib.app.ViewController',

    requires: ['Ext.lib.shared.Detailable'],

    mixins: ['Ext.lib.shared.Detailable'],

    config: {
        // массив окон детализации
        detailGrids: [],
        masterGrid: null
    },

    STORE_WARNING_COUNT: 1000,

    init: function(view){
        var me = this;

        me.mainView = view;

        view.on('refreshtable', me.onRefresh, me);
        view.on('savetable', me.onSave, me);

        if(view.disableSelectionChangeHandler!==true){
            view.on('selectionchange', me.onChangeSelect, me);
        }
        if (view.masterProperty) {
            me.masterProperty = view.masterProperty;
            this.getViewModel().set('copiedRecords', null);
        }

        me.showSaveError = view.showSaveError === false ? false : true;
        me.autoRefreshingTable = false || view.autoRefreshingTable;
        me.storeInitialized = false;
        me.showStoreCountWarning = false || view.showStoreCountWarning;
    },

    needRefreshDetailOnSelect: function() {
        return true;
    },

    initStore: function() {
        this.getView().getStore().on({
            beforesync: function() {
                Ext.GlobalEvents.fireEvent('beginserveroperation');
            },
            beforeload: function() {
                Ext.GlobalEvents.fireEvent('beginserveroperation');
            }
        });

        this.storeInitialized = true;
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

    onHistory: function() {
        this.openRecordWindow('Ext.lib.dblog.Window');
    },

    onExtra: function() {
        this.openRecordWindow('Ext.lib.extra.Window');
    },

    onBi: function() {
        this.openRecordWindow('Ext.lib.bi.Window');
    },

    changeDisabledButtons: function(selected, options) {
        var toolbar = this.getView().down('sharedtoolbar');

        if (!toolbar) {
            return;
        }

        toolbar.enabledButtons.forEach(function(prefix) {
            var button = this.lookupReference(prefix + this.getView().suffix);
            var functionName = 'isDisabled' + prefix.charAt(0).toUpperCase() + prefix.slice(1) + 'Button';

            if (button) {
                button.setDisabled(this[functionName](selected, options));
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
                var vm = detail.getController().getViewModel();
                if (vm) {
                    vm.set(
                        'selectedMaster',
                        this.getViewModel().get('masterRecord')
                    );
                }
                if (this.needRefreshDetailOnSelect()) {
                    detail.fireEvent('refreshtable');
                }
            }, this);
        }
    },

    extractMasterRecord: function(selected) {
        return (selected && selected.length === 1) ? selected[0] : null;
    },

    setMasterRecord: function(master) {
        var vm = this.getView().getViewModel();

        if(vm){
            vm.set('masterRecord', master);
        }
    },

    extractAndSetMasterRecord: function(selected) {
        var master = this.extractMasterRecord(selected);
        this.setMasterRecord(master);

        return master;
    },

    onChangeSelect: function(sm, selected, eOpts){
        var master = this.extractAndSetMasterRecord(selected);

        this.beforeChangeSelect(sm, selected, eOpts);
        this.changeDisabledButtons(selected);
        this.changeDisabledDetails(master);
        this.refreshDetails();
    },

    beforeChangeSelect: Ext.emptyFn,

    /**
     * Функция должна возвратить "истину" для продолжения обновления
     * @param {Ext.data.Model} masterRecord
     */
    beforeRefresh: function(){
        return true;
    },

    afterRefresh: Ext.emptyFn,

    rememberOldSelections: function () {
        var oldSelection = this.getView().getSelectionModel().getSelection();

        if (oldSelection && oldSelection.length==1) {
            var r = oldSelection[0];
            this.oldSelectionIndex = this.getView().getStore().indexOf(r);
            this.oldSelectionId = r.get('id');
        } else {
            this.oldSelectionIndex = null;
            this.oldSelectionId = null;
        }
    },

    /**
     * вызывает при наличии функцию beforeRefresh.
     * Функция должна возвратить "истину" для продолжения обновления
     */
    onRefresh: function(){
        var result = true;
        var store = this.getView().getStore();

        this.rememberOldSelections();
        this.getView().getSelectionModel().deselectAll();

        if(this.hasMaster()){
            var masterRecord = this.getMasterRecord();

            if (masterRecord && !masterRecord.phantom) {
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
            if (!this.storeInitialized) this.initStore();

            store.load({
                callback: function(records, operation, success) {
                    if (!success) {
                        this.onError(operation.getError().response);
                    }

                    this.callbackRefresh(this.getView(), store, this.oldSelectionId, this.oldSelectionIndex);
                    Ext.GlobalEvents.fireEvent('endserveroperation');

                    if (this.showStoreCountWarning && store.count() >= this.STORE_WARNING_COUNT) {
                        Ext.toast('Показаны не все записи. Необходимо уточнить запрос', 'Предупреждение');
                    }

                    this.afterRefresh();
                },
                scope: this
            });
        }
    },

    reselectModel: function() {
        this.rememberOldSelections();
        this.getView().getSelectionModel().deselectAll();
        this.callbackRefresh(this.getView(), this.getView().getStore(), this.oldSelectionId, this.oldSelectionIndex);
    },

    isFilterReady: function() {
        var vm = this.getView().getViewModel();
        return !vm || vm.get('filterReady') !== false;
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
        var masterRecord = this.getMasterRecord();
        var editingColumn;
        var editingPlugin;
        var newRec;

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

    /**
     * @param {Ext.data.Batch}
     */
    afterSave: Ext.emptyFn,
    afterDetailsSave: Ext.emptyFn,

    onSave: function() {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var messages;
        var fieldName, errors = [];
        var callback;
        var callbackScope;
        var detailsToProcess = 0;

        me.syncing = true;

        if (arguments[0] && (typeof arguments[0]==='function')) {
            callback = arguments[0];
            callbackScope = arguments[1] || me;
        } else {
            callback = function(){
                if(--detailsToProcess<=0){
                    me.syncing = false;
                    me.afterDetailsSave();
                    if(!me.autoRefreshingTable) {
                        me.onRefresh();
                    } else {
                        me.reselectModel();
                    }
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
            if (messages.length === 0){
                if (!me.storeInitialized) me.initStore();

                store.sync({
                    callback : function(batch) {
                        view.getSelectionModel().refresh();
                        Ext.GlobalEvents.fireEvent('endserveroperation');
                        me.afterSave(batch);
                        if (batch.exceptions.length > 0) {
                            if (me.showSaveError) {
                                me.onError(batch.exceptions[0].getError().response);
                            }
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
                    for(var field in message.fields){
                        fieldName = null;
                        view.columns.forEach(function(column){
                            if(column.dataIndex==field){
                                fieldName = column.text;
                            }
                        });

                        fieldName = fieldName ? fieldName : field;
                        errors.push('Поле "' + fieldName + '" ' + message.fields[field]);
                    }
                });

                Ext.Msg.alert("Некорректные значения", errors.join("<br/>"));
            }
        } else {
            saveDetails(arguments.length==2, callback, callbackScope);
        }
    },

    openRecordWindow: function(windowClass) {
        var view = this.getView();
        var selectedModels = view.getSelectionModel().getSelection();
        var selectedModel = (selectedModels && selectedModels.length === 1) ? selectedModels[0] : null;

        if (selectedModel) {
            var id = view.modelIdFieldName ? selectedModel.get(view.modelIdFieldName) : selectedModel.getId();
            Ext.create(windowClass).show().refresh(id, view.modelName);
        } else {
            Ext.Msg.alert('Ошибка', 'Запись не определена');
        }
    },

    deleteRecords: Ext.emptyFn,
    addRecord: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "История".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledChangemasterButton: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "Удалить".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledDeleteButton: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "История".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledHistoryButton: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "Дополнительно".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledExtraButton: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "Дополнительно".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledBiButton: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "Добавить".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledAddButton: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "Обновить".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledRefreshButton: Ext.emptyFn,

    /**
     * Возвращает true, если надо задизейблить кнопку "Сохранить".
     * @abstract
     * @param {Ext.data.Model[]} selected - Выбранные строки, если никакая строка не выбрана, то null
     * @return {Boolean}
     */
    isDisabledSaveButton: Ext.emptyFn
});
