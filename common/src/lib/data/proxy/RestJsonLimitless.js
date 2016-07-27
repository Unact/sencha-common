Ext.define('Ext.lib.data.proxy.RestJsonLimitless', {
    extend: 'Ext.lib.data.proxy.RestJson',
    alias: 'proxy.restjsonlimitless',

    constructor: function(config){
        var me = this;
        if(!config.extraParams){
            config.extraParams = {};
        };
        config.extraParams.limitless = true;
        
        me.callParent(arguments);
    }
}); 
