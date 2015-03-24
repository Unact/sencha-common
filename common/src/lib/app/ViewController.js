Ext.define('Ext.lib.app.ViewController', {
	extend : 'Ext.app.ViewController',
	
	/*
	 * Загрузчик словарей.
	 * dictionaries - массив. Элементом может являться строка или объект.
	 * Строка трактуется как идентификатор хранилища 
	 * Объект должен быть объектом хранилища или
	 * содержать идентификатор хранилища в качестве ключа и
	 * функцию обратного вызова или массив в качестве значения.
	 * callback - функция обратного вызова после загрузки всех словарей
	 */
	loadDictionaries : function(dictionaries, callback) {
		var controller = this, i, properties, loader;
		
		function getStore(obj){
			var store;
			if (( typeof obj) === "string") {
				store = Ext.data.StoreManager.lookup(obj);
			} else if (obj.isStore) {
				store = obj;
			}
			return store;
		}
		
		loader = {
			dictionaryCount : 0,
			mainContainer: controller.getView(),
			callback: callback,
			updateDictionariesLoadingCount: function(){
				var me = this;
				
				me.checkDictionariesLoading(--me.dictionaryCount);
			},
			checkDictionariesLoading : function(val) {
				var me = this;
				
				if (val == 0) {
					if(me.callback && ( typeof me.callback)=="function"){
						me.callback.call(controller);
					}
					me.mainContainer.setLoading(false);
				}
			},
			load: function(dictionaries){
				var me = this,
					store;
				if (Array.isArray(dictionaries)) {
					me.dictionaryCount += dictionaries.length;
		
					me.mainContainer.setLoading(true);
		
					for ( i = 0; i < dictionaries.length; i++) {
						store = getStore(dictionaries[i]);
						if(store) {
							store.load(function(records, operation, success) {
								if(success!==true && me.skipDictionaryAlert){
									Ext.Msg.alert("Ошибка", "Ошибка при загрузке " + dictionaries[i]);
								}
								me.updateDictionariesLoadingCount();
							});
						} else {
							me.load(dictionaries[i]);
						}
					}
				} else {
					properties = Object.getOwnPropertyNames(dictionaries);
					if (properties.length >= 1) {
						store = getStore(properties[0]);
						store.load(function(records, operation, success) {
							if(success!==true && me.skipDictionaryAlert){
								Ext.Msg.alert("Ошибка", "Ошибка при загрузке " + properties[0]);
							}
							if (( typeof dictionaries[properties[0]]) === "function") {
								dictionaries[properties[0]](records, operation, success);
							} else if (Array.isArray(dictionaries[properties[0]])) {
								me.load(dictionaries[properties[0]]);
							}
							
							me.updateDictionariesLoadingCount();
						});
					}
				}
			}
		};
		
		loader.load(dictionaries);
	},
    
    onError : function(msg) {
        var parser = new DOMParser(), xmlDoc = parser.parseFromString(Ext.util.Format.htmlDecode(msg), "text/xml");
        Ext.Msg.alert("Ошибка", xmlDoc.getElementsByTagName("error")[0].childNodes[0].nodeValue);
    }
});
