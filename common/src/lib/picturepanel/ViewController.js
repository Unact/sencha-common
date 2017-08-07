Ext.define('Ext.lib.picturepanel.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.picturepanel',

    init: function(view) {
        this.callParent(arguments);
        this.pictureView = view.lookupReference('pictureView');
        this.addForm = view.lookupReference('addForm').getForm();
    },

    onRefresh: function() {
        var me = this;
        var store = this.pictureView.getStore();
        if (me.masterExists()) {
            store.getProxy().setExtraParamAndRemoveIfNull(
                'master_id',
                me.getMasterId()
            );

            Ext.GlobalEvents.fireEvent('beginserveroperation');
            store.load({
                callback: function(records, operation, success){
                    Ext.GlobalEvents.fireEvent('endserveroperation');
                    if (!success) {
                        me.onError(operation.getError().response);
                    }
                    me.afterRefresh.call(me);
                }
            });
        }
    },

    onSave: function() {
        var me = this;
        var store = me.pictureView.getStore();

        if (store.hasChanges()) {
            Ext.GlobalEvents.fireEvent('beginserveroperation');
            store.sync({
                callback: function(batch) {
                    me.pictureView.getSelectionModel().refresh();
                    Ext.GlobalEvents.fireEvent('endserveroperation');
                    if (batch.exceptions.length > 0) {
                        me.onError(batch.exceptions[0].getError().response);
                    }
                }
            });
        }
    },

    afterRefresh: Ext.emptyFn,

    onDelete: function() {
        this.pictureView.getStore().remove(this.pictureView.getSelectionModel().getSelection());
    },

    onAdd: function() {
        var evt = document.createEvent('MouseEvents');
        var fileInputElId = this.getView().lookupReference('addFormFileField').fileInputEl.id;

        if (this.masterExists()) {
            evt.initEvent('click', true, false);
            document.getElementById(fileInputElId).dispatchEvent(evt);
        }
    },

    masterExists: function() {
        return Ext.isNumeric(this.getMasterId());
    },

    getMasterId: function() {
        var masterRecord = this.getViewModel().get('masterRecord');
        return masterRecord ? masterRecord.get('id') : null;
    },

    onPictureDblClick: function(view, record) {
        window.open(this.getView().pictureUrlPrefix + '/get_full/' + record.get('id'), '_blank');
    },

    onAddWindowClose: function() {
        var me = this;
        var addParams;

        if(me.addForm.isValid()) {
            addParams = this.beforeAdd(this.getViewModel().get('masterRecord'));
            Ext.GlobalEvents.fireEvent('beginserveroperation');
            me.addForm.submit({
                url: me.getView().pictureUrlPrefix + '/upload',
                params: addParams,
                waitMsg: 'Загрузка данных...',
                success: function(fp, o) {
                    Ext.GlobalEvents.fireEvent('endserveroperation');
                    me.onRefresh();
                    me.addForm.reset();
                },
                failure: function(fp, o) {
                    Ext.GlobalEvents.fireEvent('endserveroperation');
                    Ext.Msg.alert('Ошибка обработки файла', o.result.errors);
                }
            });
        }
    },

    beforeAdd: function() {
        return {
            master_id: this.getMasterId()
        };
    }
});
