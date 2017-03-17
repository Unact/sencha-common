Ext.define('Ext.overrides.data.Model', {
    override: 'Ext.data.Model',

    getRecordValidation: function(){
        var me = this;
        var msg;

        msg = me.validateRecord();

        if (msg!==true){
            return msg || me.defaultErrorMessage;
        }
        return true;
    },

    validateRecord: function(){
        return true;
    },

    // Первая попавшаяся уникальная запись в сторе является оригиналом
    // Все последующие такие же считаются клонами
    // Поэтому из двух одинаковых записей, та которая встречается в сторе раньше
    // будет оригиналом, а которая встречается позже клоном
    isCloneInStore: function(store){
        var me = this;
        var fieldNames = [];
        var firstClonePos = -1;
        var firstClone = me;
        var selfValues = {};
        var idProperty = me.getIdProperty();


        me.getFields().forEach(function(el, i){
            var fieldName = el.getName();
            var currentValue = me.get(fieldName);
            if (fieldName!==idProperty){
                fieldNames.push(el.getName());
                selfValues[fieldName] = currentValue!==null ? currentValue.valueOf() : null;
            }
        });

        store.each(function(rec){
            var same =
                fieldNames.every(
                    function(fieldName){
                        var recValue = rec.get(fieldName);
                        var res;
                        // Если массив, то нужна другая проверка,
                        // вместе с этим проверяем что они не null
                        if (recValue instanceof Array && selfValues[fieldName]!==null) {
                            if (recValue.length===selfValues[fieldName].length){
                                return recValue.every(function(el,i){
                                    // В объекте только один ключ, он и выбирается
                                    var key = Object.keys(el)[0];
                                    return el[key]===selfValues[fieldName][i][key];
                                });
                            } else {
                                return false;
                            }
                        }
                        return recValue!==null ? recValue.valueOf()===selfValues[fieldName] : recValue===selfValues[fieldName];
                });
            if (same && firstClonePos === -1){
                firstClone = rec;
                firstClonePos = store.indexOf(rec);
            }
        });

        if (me.get(idProperty)!==firstClone.get(idProperty) && store.indexOf(me) > firstClonePos){
            return true;
        }

        return false;
    },

    inheritableStatics: {
        DUMMY_ALL: -1,

        /**
        * Возвращает экземпляр модели с фиктивным id, который может быть
        * использован в качестве выбора "всех значений"
        * @param {Object} values - поля и значения возвращаемого экземпляра
        * @param {String} nameProperty - поле с отображаемым значением
        * @return экземпляр класса Ext.data.Model или унаследованного от него класса
        */
        getDummyAll: function(values, nameProperty){
            var me = this;
            var model = me.create();

            values = values || {};
            nameProperty = nameProperty || 'name';
            values[nameProperty] = values[nameProperty] || 'Все';

            model.setId(me.DUMMY_ALL);
            model.set(values);

            return model;
        }
    }
});
