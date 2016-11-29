Ext.define('Ext.lib.data.proxy.RestJsonLimitless', {
    extend: 'Ext.lib.data.proxy.RestJson',
    alias: 'proxy.restjsonlimitless',

    setExtraParams: function(extraParams){
        Ext.merge(extraParams, { limitless: true });
        this.callParent(arguments);
    }
});
