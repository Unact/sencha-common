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

    inheritableStatics: {
        DUMMY_ALL: -1,

        /**
        * Возвращает экземпляр модели с фиктивным id, который может быть
        * использован в качестве выбора "всех значений"
        * @param {Object} values - поля и значения возвращаемого экземпляра
        * @param {Object} options - опции с полями idProperty и nameProperty
        * @return экземпляр класса Ext.data.Model или унаследованного от него класса
        */
        getDummyAll: function(values, options){
            var model = Ext.create(this.$className);
            var options = Ext.isObject(options) ? options : null;
            var idProperty = options && options.idProperty ? options.idProperty : 'id';
            var nameProperty = options && options.nameProperty ? options.nameProperty : 'name';
            var fieldNames = model.getFields().map(
                function(field) {
                    return field.getName();
                }
            );

            values = values || {};

            values[idProperty] = this.DUMMY_ALL;
            if (values.indexOf(nameProperty) === -1) {
                values[nameProperty] = 'Все';
            }

            Object.keys(values).forEach(function(key) {
                if (fieldNames.indexOf(key) !== -1) {
                    model.set(key, values[key]);
                }
            });

            return model;
        }
    }
});
