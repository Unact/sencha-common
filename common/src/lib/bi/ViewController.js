Ext.define('Ext.lib.bi.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.bi',

    onRefresh: function() {
        const etypeValueListStore = this.getStore('spValues');
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
            if (rec.dirty && rec.previousValues && rec.previousValues.spv_id === null) {
                rec.phantom = true;
            }
        });

        this.callParent(arguments);
    }
});
