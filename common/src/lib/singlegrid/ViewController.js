// Контроллер таблицы
Ext.define('Ext.lib.singlegrid.ViewController', {
    extend: 'Ext.lib.singletable.ViewController',
    alias: 'controller.singlegrid',

    processableKeys: [
        Ext.event.Event.UP,
        Ext.event.Event.DOWN,
        Ext.event.Event.ENTER,
        Ext.event.Event.PAGE_DOWN,
        Ext.event.Event.PAGE_UP
    ],

    init: function(view){
        var me = this;

        //От этого надо аккуратно изавиться
        me.grid = view;

        me.callParent(arguments);
    },

    deleteRecords: function(store, records, index, sm){
        var recordsCount;

        store.remove(records);
        recordsCount = store.getCount();
        if (recordsCount > 0) {
            sm.select(recordsCount > index ? index : index - 1);
        }
    },

    addRecord: function(store, sm, result) {
        var index = store.indexOf(sm.getLastSelected());
        var newRec;

        store.getSorters().clear();
        this.grid.getView().refresh();

        newRec = store.insert(Math.max(index + 1, 0), result)[0];

        return newRec;
    },

    isDisabledDeleteButton: function(records){
        return !(records && records.length>0);
    },

    isDisabledAddButton: function(records){
        return false;
    },

    isDisabledHistoryButton: function(records) {
        return this.phantomRecord(records);
    },

    isDisabledExtraButton: function(records) {
        return this.phantomRecord(records);
    },

    isDisabledBiButton: function(records) {
        return this.phantomRecord(records);
    },

    isDisabledChangemasterButton: function(records) {
        return (records.length === 0 && this.getViewModel().get('copiedRecords') == null);
    },

    // Проверим создана ли запись в бд
    phantomRecord: function(records) {
        var record = (records && records.length === 1) ? records[0] : null

        if (record === null) {
            return true;
        }

        return record.phantom;
    },

    onDeleteByColumn: function(grid, rowIndex, colIndex, item, e, record, row) {
        var me = this;
        if(me.grid.enableDeleteDialog===true){
            Ext.Msg.show({
                title : 'Внимание',
                message : 'Вы действительно хотите удалить запись?',
                buttons : Ext.Msg.YESNOCANCEL,
                icon : Ext.Msg.QUESTION,
                fn : function(btn) {
                    if (btn === 'yes') {
                        grid.store.remove(record);
                    }
                }
            });
        } else {
            grid.store.remove(record);
        }
    },

    onCancelEdit: function(editor, ctx, eOpts) {
        var me = this;

        if(ctx.record.phantom && !ctx.record.dirty){
            ctx.grid.store.remove(ctx.record);
        }
    },

    onCompleteEdit: function(editor, ctx, eOpts){
        var me = this;
        var grid = ctx.grid;
        var record = ctx.record;
        var sm = grid.getSelectionModel();

        me.mainView.setLoading(true);
        sm.deselectAll();
        record.self.setProxy(grid.getStore().getProxy());
        record.save({
            callback: function(records, operation, success){
                sm.select(record);
                if (!success) {
                    me.onError(operation.getError().response,
                    function(){
                        editor.startEdit(record);
                    });
                }
                me.mainView.setLoading(false);
            }
        });
    },

    onSpecialKey: function(field, e) {
        const key = e.getKey();
        const view = this.getView();
        const store = view.getStore();
        const idx = store.indexOf(this.getView().getSelectionModel().getSelection()[0]);
        const moveBy = (key === e.PAGE_UP || key === e.PAGE_DOWN) ? view.bufferedRenderer.viewSize : 1;
        const newDownIdx = idx + moveBy < store.getCount() ? idx + moveBy : store.getCount() - 1;
        const newUpIdx = idx - moveBy < 0 ? 0 : idx - moveBy;
        const newIdx = key === e.UP || (key === e.ENTER && e.shiftKey) || key === e.PAGE_UP ? newUpIdx : newDownIdx;
        const newRec = store.getAt(newIdx);

        if (this.processableKeys.indexOf(key) !== -1) {
            new Ext.util.DelayedTask(() => {
                this.onSpecialKeyCallback(field, newIdx, newRec);
            }).delay(0);
        }
    },

    onSpecialKeyCallback: function(field, newIdx, newRecord) {
        const view = this.getView();
        const cellEditor = view.findPlugin('cellediting');

        view.getView().scrollToRecord(newRecord);
        cellEditor.completeEdit();

        // Подождем чтобы другие события после select и completeEdit обработались
        new Ext.util.DelayedTask(() => {
            cellEditor.startEditByPosition({row: newIdx, column: field.column.fullColumnIndex});
            cellEditor.activateCell(cellEditor.activeEditor.context, false, true);
        }).delay(0);
    },

    /*
     * По идентификатору находится модель
     * Если модель найдена, то поставить фокус на нее
     * иначе поставить фокус на строку тем же порядковым номером, что и был ранее
     */
    callbackRefresh: function (grid, store, oldSelectionId, oldSelectionIndex) {
        var recordToSelect = store.getById(oldSelectionId);
        var storeCount = store.getCount();
        var isLockedGrid = (Ext.getClassName(grid.view) === 'Ext.grid.locking.View');

        // У залочeнных гридов не метода scrollToRecord
        if (!isLockedGrid) {
            if (recordToSelect && store.contains(recordToSelect)) {
                grid.view.scrollToRecord(recordToSelect);
                return;
            } else if (oldSelectionIndex && storeCount > oldSelectionIndex) {
                grid.view.scrollToRecord(oldSelectionIndex);
                return;
            } else if (storeCount > 0) {
                grid.view.scrollToRecord(0);
                return
            }
        }

        // Когда не отобралось ни одной строчки - послать фейковый selectionchange
        // Это позволит решить проблему:
        // когда в гриде ДО рефреша не было данных и ПОСЛЕ рефреша данные не появились - этом случае
        // selectionchange не отправляется. Хотя в обработчике события ожидается, что после каждого
        // refresh-a надо вызвать selectionchange
        // Пример решаемой ошибки см тут: DEV-32192
        grid.fireEvent('selectionchange', grid, []);
    }
});
