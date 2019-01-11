Ext.define('Ext.lib.extra.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.extra',

    onRefresh: function(){
        const etypeValueListStore = this.getStore('etypeValueList');
        if (!etypeValueListStore.isLoaded()) {
            this.loadDictionaries([etypeValueListStore], () => {
                this.self.superclass.onRefresh.call(this);
            });
        } else {
            this.callParent();
        }
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
