Ext.define('Ext.lib.app.ControllerMixin', {
    /*
     * Загрузчик словарей.
     * dictionaries - массив. Элементом может являться строка или объект.
     * Строка трактуется как идентификатор хранилища
     * Объект должен быть объектом хранилища или
     * содержать идентификатор хранилища в качестве ключа и
     * функцию обратного вызова или массив в качестве значения.
     * callback - функция обратного вызова после загрузки всех словарей
     */
    loadDictionaries : function(dictionaries, callback, showMask) {
        var controller = this;
        var loader;
        var view = controller.getView();
        var errors = [];

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
            dictionaryCount: 0,
            callback: callback,
            updateDictionariesLoadingCount: function(){
                var me = this;
                var errorsTxt;
                var i;

                if (--me.dictionaryCount == 0) {
                    if(errors.length>0 && !controller.skipDictionaryAlert){
                        errorsTxt = [];

                        for(i = 0; i<errors.length; i++){
                            errorsTxt.push("Хранилище: " + errors[i].storeName + "<br/>" +
                            "Ресурс: " + errors[i].url + "<br/>" +
                            "Ошибка: " + errors[i].error);
                        }
                        Ext.Msg.alert("Ошибки при загрузке", errorsTxt.join('<br/><br/>'), function(){
                            if(me.callback && ( typeof me.callback)=="function"){
                                me.callback.call(controller, errors);
                            }
                        });
                    } else {
                        if(me.callback && ( typeof me.callback)=="function"){
                            me.callback.call(controller, errors);
                        }
                    }
                }
            },
            loadStore: function(store, dictionaryData){
                var me = this;
                Ext.GlobalEvents.fireEvent('beginserveroperation', showMask);

                store.load({
                    callback: function(records, operation, success) {
                        if(success!==true){
                            errors.push({
                                storeName: store.self.getName(),
                                url: this.getProxy().getUrl(),
                                error: controller.getError(operation.getError().response)
                            });
                        }
                        if (( typeof dictionaryData) === "function") {
                            dictionaryData.call(store, records, operation, success);
                        } else if (Array.isArray(dictionaryData)) {
                            me.load(dictionaryData);
                        }

                        me.updateDictionariesLoadingCount();
                        Ext.GlobalEvents.fireEvent('endserveroperation', showMask);
                    }
                });
            },
            load: function(dictionaries){
                var me = this;
                var store;
                var dictionary;
                var properties;
                var i;
                var simpleStoreConf;

                if (Array.isArray(dictionaries)) {
                    me.dictionaryCount += dictionaries.length;

                    for ( i = 0; i < dictionaries.length; i++) {

                        dictionary = dictionaries[i];
                        store = getStore(dictionary);
                        if(store) {
                            me.loadStore(getStore(dictionary));
                        } else {
                            me.load(dictionary);
                        }
                    }
                } else {
                    properties = Object.getOwnPropertyNames(dictionaries);
                    if (properties.length>=1) {
                        simpleStoreConf = properties.length==1;

                        dictionary = simpleStoreConf ? properties[0] : dictionaries.store;
                        store = getStore(dictionary);

                        if(store) {
                            me.loadStore(store, simpleStoreConf ? dictionaries[dictionary] : dictionaries.data);
                        }
                    }
                }
            }
        };

        loader.load(dictionaries);
    },

    getError: function(response) {
        var me = this;
        var responseContentType = response && response.getResponseHeader ?
            response.getResponseHeader("Content-Type") :
            response ? (Ext.JSON.decode(response.responseText, true) != null ? 'json' : null) : null;
        var error = null;
        var parser, xmlDoc, errorTags;
        var data;

        if(responseContentType==null){
            error = response.responseText && response.responseText!="" ?
                response.responseText :
                "Сервер не отвечает";
        }
        if(error==null && responseContentType.indexOf('xml') >= 0){
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(Ext.util.Format.htmlDecode(response.responseText), "text/xml");
            errorTags = xmlDoc.getElementsByTagName(me.defaultErrorTag ? me.defaultErrorTag : "error");
            error = (errorTags && errorTags.length>0) ?
                    errorTags[0].childNodes[0].nodeValue :
                    response.responseText;
        }
        if(error==null && responseContentType.indexOf('json') >= 0){
            data = Ext.JSON.decode(response.responseText, true);
            error = data ? (data[me.defaultErrorTag ? me.defaultErrorTag : "error"]) : null;
        }
        if(error==null){
            error = response.responseText;
        }

        return error;
    },

    onError : function(response, callback) {
        var me = this;
        var error = me.getError(response);

        Ext.Msg.alert("Ошибка", error, callback);
    },

    initVmFromUrlParams: function() {
        var me = this;
        var vm = me.getViewModel();
        var urlParams = Ext.Object.fromQueryString(location.search.substring(1));

        for(key in urlParams) {
            if((urlParams[key] !== '') && (key in vm.getData())) {
                vm.set(key, urlParams[key]);
            }
        };
    }
});
