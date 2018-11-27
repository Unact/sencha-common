Ext.define('Ext.overrides.tree.Panel', {
    override: 'Ext.tree.Panel',

    setStore: function() {
        this.callParent(arguments);
        this.initSpecialColumns();
    }
});
