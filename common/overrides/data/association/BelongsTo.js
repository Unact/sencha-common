//http://docs.sencha.com/extjs/4.2.3/source/BelongsTo.html#Ext-data-association-BelongsTo
//Взят метод из версии 4.2.3, потому что там есть проверка 
//if (Ext.isEmpty(foreignKeyId)) {
//	return null;
//}
Ext.onReady(function() {
	Ext.override(Ext.data.association.BelongsTo, {
	    /**
	     * @private
	     * Returns a getter function to be placed on the owner model's prototype. We cache the loaded instance
	     * the first time it is loaded so that subsequent calls to the getter always receive the same reference.
	     * @return {Function} The getter function
	     */
	    createGetter: function() {
	        var me              = this,
	            associatedName  = me.associatedName,
	            associatedModel = me.associatedModel,
	            foreignKey      = me.foreignKey,
	            primaryKey      = me.primaryKey,
	            instanceName    = me.instanceName;
	
	        //'this' refers to the Model instance inside this function
	        return function(options, scope) {
	            options = options || {};
	
	            var model = this,
	                foreignKeyId = model.get(foreignKey),
	                success,
	                instance,
	                args;
	
	            if (options.reload === true || model[instanceName] === undefined) {
	                // No foreign key, jump out
	                if (Ext.isEmpty(foreignKeyId)) {
	                    return null;
	                }
	                instance = Ext.ModelManager.create({}, associatedName);
	                instance.set(primaryKey, foreignKeyId);
	
	                if (typeof options == 'function') {
	                    options = {
	                        callback: options,
	                        scope: scope || model
	                    };
	                }
	                
	                // Overwrite the success handler so we can assign the current instance
	                success = options.success;
	                options.success = function(rec){
	                    model[instanceName] = rec;
	                    if (success) {
	                        success.apply(this, arguments);
	                    }
	                };
	
	                associatedModel.load(foreignKeyId, options);
	                // assign temporarily while we wait for data to return
	                model[instanceName] = instance;
	                return instance;
	            } else {
	                instance = model[instanceName];
	                args = [instance];
	                scope = scope || options.scope || model;
	
	                //TODO: We're duplicating the callback invokation code that the instance.load() call above
	                //makes here - ought to be able to normalize this - perhaps by caching at the Model.load layer
	                //instead of the association layer.
	                if (options) {
	                    Ext.callback(options, scope, args);
	                    Ext.callback(options.success, scope, args);
	                    Ext.callback(options.callback, scope, args);
	                }
	
	                return instance;
	            }
	        };
	    },
	});
});
