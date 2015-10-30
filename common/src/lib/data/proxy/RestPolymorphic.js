Ext.define('Ext.lib.data.proxy.RestPolymorphic', {
    extend: 'Ext.data.proxy.Rest',
    alias : 'proxy.restpolymorphic',
    
    buildUrl : function (request) {
        var url = this.getUrl(request);
        var params = request.getParams() || {};

        url = '/' + params.polymorphic_type + '/' + params.polymorphic_id + url;
        
        delete params.polymorphic_type;
        delete params.polymorphic_id;
        
        request.setUrl(url);
        return this.callParent([request]);
    }
});