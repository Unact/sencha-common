Ext.onReady(function() {
	Ext.override(Ext.data.proxy.Server, {
		/**
	     * Sets up an exception on the operation
	     * @private
	     * @param {Ext.data.Operation} operation The operation
	     * @param {Object} response The response
	     */
	    setException: function(operation, response) {
	        operation.setException({
	            status: response.status,
	            statusText: response.statusText,
	            responseText: response.responseText
	        });
	    },

	    setExtraParamAndRemoveIfNull : function(extraParam, value) {
			var me = this;

			if(value!=null){
				me.setExtraParam(extraParam, value);
			} else {
				delete me.extraParams[extraParam];
			}
		}
    });
});
