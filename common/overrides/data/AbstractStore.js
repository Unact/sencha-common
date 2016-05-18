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
        var validations = {
            base: [],
            fields: []
        };
        var  differentValidations = {
            base: [],
            fields: []
        };

        me.each(function(record){
            var validation = record.getValidation();
            if((record.dirty || record.phantom)) {
                validations.fields.push(validation.data);
                validations.base.push(record.getRecordValidation());
            }
        });

        differentValidations.base = me.getDifferentValidations(validations.base);
        differentValidations.fields = me.getDifferentValidations(validations.fields);

        return differentValidations;
    },

    getDifferentValidations: function(validations){
        var differentValidations = [];
        var differentField;

        validations.forEach(function(elI){
            differentField = true;
            differentValidations.forEach(function(elJ){
                if(Ext.Object.equals(elI, elJ)){
                    differentField = false;
                }
            });
            if(differentField){
                differentValidations.push(elI);
            }
        });

        return differentValidations;
    },

    getValidationMessages: function(){
        var me = this,
            validations = me.getValidations(),
            messages = {
                fields: [],
                base: []
            },
            message;

        validations.fields.forEach(function(el){
            message = {};
            for(field in el){
                if(el[field]!==true){
                    message[field] = el[field];
                }
            }
            messages.fields.push(message);
        });

        validations.base.forEach(function(el){
            if (el!==true){
                messages.base.push(el);
            }
        });

        return messages;
    },

    findExactRecord: function(property, value, startIndex) {
        return this.findRecord(property, value, startIndex, false, true, true);
    }
});
