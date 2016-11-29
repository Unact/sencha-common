Ext.define('Ext.lib.data.proxy.RestJson', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.restjson',

    limitParam: '',
    pageParam: '',

    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});
