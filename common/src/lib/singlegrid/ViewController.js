// Контроллер таблицы
Ext.define('Ext.lib.singlegrid.ViewController', {
    extend: 'Ext.lib.singletable.ViewController',
    alias: 'controller.singlegrid',

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

        if(store.isSorted()){
            newRec = store.add(result)[0];
        } else {
            newRec = store.insert(Math.max(index, 0), result)[0];
        }

        return newRec;
    },

    isDisabledDeleteButton: function(records){
        return !(records && records.length>0);
    },

    isDisabledAddButton: function(records){
        return false;
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

    /*
     * По идентификатору находится модель
     * Если модель найдена, то поставить фокус на нее
     * иначе поставить фокус на строку тем же порядковым номером, что и был ранее
     */
    callbackRefresh: function (grid, store, oldSelectionId, oldSelectionIndex) {
        var me = this;
        var recordToSelect = store.getById(oldSelectionId);
        var storeCount = store.getCount();

        if (recordToSelect) {
            grid.view.scrollToRecord(recordToSelect);
        } else if (oldSelectionIndex && storeCount > oldSelectionIndex) {
            grid.view.scrollToRecord(oldSelectionIndex);
        } else if (storeCount > 0) {
            grid.view.scrollToRecord(0);
        } else {
            // Когда не отобралось ни одной строчки - послать фейковый selectionchange
            // Это позволит решить проблему:
            // когда в гриде ДО рефреша не было данных и ПОСЛЕ рефреша данные не появились - этом случае
            // selectionchange не отправляется. Хотя в обработчике события ожидается, что после каждого
            // refresh-a надо вызвать selectionchange
            // Пример решаемой ошибки см тут: DEV-32192
            grid.fireEvent('selectionchange', grid, []);
        }
    }
});
