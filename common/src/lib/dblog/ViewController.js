Ext.define('Ext.lib.dblog.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.dblog',

    init: function(view) {
        if (view.allowXidEdit) {
            vm.set('editableXid', true);
        }

        this.initialColumns = view.columns.map((column) => column.initialConfig);
        this.initialFields = view.getStore().getModel().getFields().slice();
        this.callParent(arguments);
    },

    afterRefresh: function() {
        var view = this.getView();
        var metaData = view.getStore().getProxy().getReader().metaData;

        if (metaData == null) {
            return;
        }

        var newColumns = metaData.columns || [];
        var recordData = metaData.recordData || {};
        var newFields = newColumns.map((column) => {
            return {
                name: column.dataIndex,
                type: 'string'
            };
        });

        this.getViewModel().set(recordData);
        view.getStore().getModel().replaceFields(this.initialFields.concat(newFields), true);
        view.reconfigure(null, this.initialColumns.concat(newColumns));
    }
});
