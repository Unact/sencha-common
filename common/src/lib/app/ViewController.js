Ext.define('Ext.lib.app.ViewController', {
	extend : 'Ext.app.ViewController',
	
	mixins: ['Ext.lib.app.ControllerMixin'],
	
	onAppStoresLoaded: function(){
		var me = this;
		
		me.onStoresLoaded();
	},
	
	onOwnStoresLoaded: function(){
		var me = this;
		var vm = me.getView().getViewModel();
		
		vm.set('ownStoresLoaded', true);
		me.onStoresLoaded();
	},
	
	onStoresLoaded: Ext.emptyFn,
    
    onError : function(msg, callback) {
        var parser = new DOMParser(),
        	xmlDoc = parser.parseFromString(Ext.util.Format.htmlDecode(msg), "text/xml"),
        	errorTags = xmlDoc.getElementsByTagName("error"),
        	error = (errorTags && errorTags.length>0) ?
        		errorTags[0].childNodes[0].nodeValue :
        		"Сервер не отвечает";
        Ext.Msg.alert("Ошибка", error, callback);
    }
});
