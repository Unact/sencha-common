Ext.define('Ext.overrides.data.AbstractStore', {
	override : 'Ext.data.AbstractStore',

	hasChanges : function() {
		var me = this;
		
		return me.getUnfiltered().createFiltered(me.filterHasChanges).getRange().length>0 ||
			me.getRemovedRecords().length > 0;
	},
	
	filterHasChanges: function(item) {
		return item.phantom === true || item.dirty === true;
	},
	
	getValidations: function(){
		var me = this,
			validations = [],
			differentValidations = [],
			i, j, different;
		
		me.each(function(record){
			var validation = record.getValidation();
			if(validation.dirty && (record.dirty || record.phantom)) {
				validations.push(validation.data);
			}
		});
		
		for(i = 0; i<validations.length; i++){
			different = true;
			for(j = 0; j<differentValidations.length && different; j++){
				if(Ext.Object.equals(validations[i], differentValidations[j])){
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
			message,
			i, field;
		
		for(i = 0; i<validations.length; i++){
			message = {};
			for(field in validations[i]){
				if(validations[i][field]!==true){
					message[field] = validations[i][field];
				}
			}
			messages.push(message);
		}
		
		return messages;
	}
}); 