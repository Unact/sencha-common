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
        * @param {String} nameProperty - поле с отображаемым значением
        * @return экземпляр класса Ext.data.Model или унаследованного от него класса
        */
        getDummyAll: function(values, nameProperty){
            var model = Ext.create(this.$className);

            values = values || {};
            nameProperty = nameProperty !== undefined ? nameProperty : 'name';
            values[nameProperty] = values[nameProperty] ? values[nameProperty] : 'Все';

            values[this.getIdProperty()] = this.DUMMY_ALL;

            model.set(values);

            return model;
        }
    }
});
