Ext.define('Ext.overrides.data.AbstractStore', {
    override: 'Ext.data.AbstractStore',

    hasChanges: function() {
        return this.filterDataSource(this.filterHasChanges).length > 0 || this.getRemovedRecords().length > 0;
    },

    filterHasChanges: function(item) {
        return item.phantom === true || item.dirty === true;
    },

    getValidations: function(){
        var me = this;
        var validations = [];
        var differentValidations = [];

        me.each(function(record){
            var validation = record.getValidation();
            if((record.dirty || record.phantom)) {
                validations.push({ fields: validation.data, base: record.getRecordValidation() });
            }
        });

        for(i = 0; i<validations.length; i++){
            different = true;
            for(j = 0; j<differentValidations.length && different; j++){
                if(Ext.Object.equals(validations[i].fields, differentValidations[j].fields) &&
                    validations[i].base==differentValidations[j].base){
                    different = false;
                }
            }
            if(different){
                differentValidations.push(validations[i]);
            }
        }

        return differentValidations;
    },

    getValidationMessages: function(){
        var me = this,
            validations = me.getValidations(),
            messages = [];

        validations.forEach(function(validation){
            var fields = {};
            for(field in validation.fields){
                if(validation.fields[field]!==true){
                    fields[field] = validation.fields[field];
                }
            }
            if(Object.keys(fields).length>0 || validation.base!==true){
                messages.push({ base: validation.base!==true ? validation.base : null, fields: fields });
            }
        });

        return messages;
    },

    findExactRecord: function(property, value, startIndex) {
        return this.findRecord(property, value, startIndex, false, true, true);
    }
});
