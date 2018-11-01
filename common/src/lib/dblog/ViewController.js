Ext.define('Ext.lib.dblog.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.dblog',

    boxReady: function() {
        var vm = this.getViewModel();
        var view = this.getView();

        if (view.allowXidEdit) {
            vm.set('editableXid', true);
        }
        vm.notify();
        this.initialColumns = view.columns.map((column) => column.initialConfig);
        this.initialFields = view.getStore().getModel().getFields().slice();
    },

    onRefresh: function() {
        var vm = this.getViewModel();
        var recordInfoStore = this.getStore('recordInfo');

        this.loadDictionaries([recordInfoStore], () => {
            var info = recordInfoStore.first();
            var tableName = info.get('table_name');

            if (tableName !== null) {
                vm.set({
                    xid: info.get('xid'),
                    tableName: tableName,
                    id: info.get('record_id')
                });
                this.self.superclass.onRefresh.apply(this);
            } else {
                Ext.Msg.alert('Ошибка', 'По данному идентификатору ничего не найдено!');
            }
        });
    },

    afterRefresh: function() {
        var newColumns = this.getView().getStore().getProxy().getReader().metaData || [];
        var newFields = newColumns.map((column) => {
            return {
                name: column.dataIndex,
                type: 'string'
            };
        });

        this.getView().getStore().getModel().replaceFields(this.initialFields.concat(newFields), true);
        this.getView().reconfigure(null, this.initialColumns.concat(newColumns));
    }
});
