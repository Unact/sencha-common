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

        getDummyAll: function(values){
            var model = Ext.create(this.$className);
            var fieldNames = model.getFields().map(
                function(field) {
                    return field.getName();
                }
            );

            model.set('id', this.DUMMY_ALL);

            if (fieldNames.indexOf('name') !== -1) {
                model.set('name', 'Все');
            }

            if (Ext.isObject(values)) {
                Object.keys(values).forEach(function(key) {
                    if (fieldNames.indexOf(key) !== -1) {
                        model.set(key, values[key]);
                    }
                });
            }

            return model;
        }
    }
});
