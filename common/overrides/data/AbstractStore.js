Ext.define('Ext.overrides.data.AbstractStore', {
	override : 'Ext.data.AbstractStore',

	hasChanges: function() {
        var me = this;

        return (me.getNewRecords().length > 0) ||
               (me.getUpdatedRecords().length > 0) ||
               (me.getRemovedRecords().length > 0);
    }
}); 