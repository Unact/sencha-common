Ext.define('Ext.modern.lib.data.proxy.RestJsonLimitless', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.restjsonlimitless',

    limitParam: '',
    pageParam: '',

    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    
    setExtraParams: function(extraParams){
        Ext.merge(extraParams, { limitless: true });
        this.callParent(arguments);
    }
});
