Ext.define('Ext.overrides.data.AbstractStore', {
    override: 'Ext.data.AbstractStore',

    hasChanges : function() {
        var me = this;
        var changed = (Ext.getVersion().isLessThan('6')) ?
            me.getUnfiltered().createFiltered(me.filterHasChanges).getRange().length>0 :
            me.filterDataSource(me.filterHasChanges).length>0;

        return changed || me.getRemovedRecords().length > 0;
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
            messages = [],
            message;

        validations.forEach(function(validation){
            message = { fields: {} };
            for(field in validation.fields){
                if(validation.fields[field]!==true){
                    message.fields[field] = validation.fields[field];
                }
            }
            if(validation.base!==true){
                message.base = validation.base;
            }
            messages.push(message);
        });

        return messages;
    },

    findExactRecord: function(property, value, startIndex) {
        return this.findRecord(property, value, startIndex, false, true, true);
    }
});
