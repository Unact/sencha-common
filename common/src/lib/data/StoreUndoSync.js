Ext.define('Ext.lib.data.StoreUndoSync', {
    rememberChange: function() {
        this.storeChanges = {
            updated: this.getUpdatedRecords().map(function(model) {
                return {id: model.getId(), data: model.modified};
            }),
            inserted: this.getNewRecords().slice(),
            deleted: this.getRemovedRecords().map(function(model) {
                model.reject(true);
                var data = Ext.merge({}, model[model.persistenceProperty]);
                delete data[model.idProperty];
                return data;
            })
        };
    },

    undoSync: function() {
        this.storeChanges.updated.forEach(function(model) {
            this.getById(model.id).set(model.data);
        }, this);

        this.storeChanges.inserted.forEach(function(model) {
            this.remove(model);
        }, this);

        this.storeChanges.deleted.forEach(function(model) {
            this.insert(0, model);
        }, this);
    }
});
