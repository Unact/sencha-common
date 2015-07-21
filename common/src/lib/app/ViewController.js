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
    
    onError : function(response, callback) {
    	var me = this;
    	var responseContentType = response.getResponseHeader("Content-Type");
    	var error = null;
    	
    	if(responseContentType.indexOf('text/xml') >= 0){
			var parser = new DOMParser();
	        var xmlDoc = parser.parseFromString(Ext.util.Format.htmlDecode(response.responseText), "text/xml");
	        var errorTags = xmlDoc.getElementsByTagName(me.defaultErrorTag ? me.defaultErrorTag : "error");
	        error = (errorTags && errorTags.length>0) ?
	        		errorTags[0].childNodes[0].nodeValue :
	        		response.responseText;
    	}
    	if(error==null && responseContentType.indexOf('text/json') >= 0){
			var data = Ext.JSON.decode(response.responseText);
			error = data[me.defaultErrorTag ? me.defaultErrorTag : "error"];
    	}
    	if(error==null){
    		error = response.responseText;
    	}
        
        Ext.Msg.alert("Ошибка", error, callback);
    }
});
