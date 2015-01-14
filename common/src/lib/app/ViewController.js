Ext.define('Ext.lib.app.ViewController', {
	extend : 'Ext.app.ViewController',
	
	loadDictionaries : function(dictionaries) {
        var controller = this,
            count = dictionaries.length,
            mainView = controller.getView();

        mainView.setLoading(true);

        function checkLoading(val) {
            if (val == 0) {
                mainView.setLoading(false);
            }
        };

        for (var i = 0; i < dictionaries.length; i++) {
            Ext.data.StoreManager.lookup(dictionaries[i]).load(function(success) {
                count--;
                checkLoading(count);
            });
        }
    },
    
    onError : function(msg) {
        var parser = new DOMParser(), xmlDoc = parser.parseFromString(Ext.util.Format.htmlDecode(msg), "text/xml");
        Ext.Msg.alert("Ошибка", xmlDoc.getElementsByTagName("error")[0].childNodes[0].nodeValue);
    }
});
