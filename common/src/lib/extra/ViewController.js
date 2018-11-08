Ext.define('Ext.lib.extra.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.extra',

    boxReady: function() {
        this.loadDictionaries([this.getStore('etypeValueList')]);
    },

    onSave: function() {
        this.getView().getStore().each(function(rec) {
            if (rec.dirty && !Ext.isNumeric(rec.get('id'))) {
                rec.phantom = true;
            }
        });

        this.callParent(arguments);
    }
});
