Ext.onReady(function() {
    Ext.override(Ext.data.AbstractStore, {
        hasChanges: function() {
            var me = this;

            return (me.getNewRecords().length > 0) ||
                   (me.getUpdatedRecords().length > 0) ||
                   (me.getRemovedRecords().length > 0);
        },

        findExactRecord: function(property, value, startIndex) {
            return this.findRecord(property, value, startIndex, false, true, true);
        }
    });
});
