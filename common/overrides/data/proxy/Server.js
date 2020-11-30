Ext.define('Ext.overrides.data.proxy.Server', {
    override: 'Ext.data.proxy.Server',

    mergeExtraParams: function(extraParams) {
        var me = this;

        me.extraParams = Ext.apply(me.extraParams, extraParams);
    },

    setExtraParamAndRemoveIfNull: function(extraParam, value) {
        var me = this;

        if(value!=null){
            me.setExtraParam(extraParam, value);
        } else {
            delete me.extraParams[extraParam];
        }
    },

    setExtraParamsAndRemoveIfNull: function(extraParams) {
        for(var extraParam in extraParams){
            this.setExtraParamAndRemoveIfNull(extraParam, extraParams[extraParam]);
        }
    },

    processResponse: function(success, operation, request, response) {
        var me = this,
            exception, reader, resultSet, meta, destroyOp;
        // Async callback could have landed at any time, including during and after
        // destruction. We don't want to unravel the whole response chain in such case.
        if (me.destroying || me.destroyed) {
            return;
        }
        // Processing a response may involve updating or committing many records
        // each of which will inform the owning stores, which will ultimately
        // inform interested views which will most likely have to do a layout
        // assuming that the data shape has changed.
        // Bracketing the processing with this event gives owning stores the ability
        // to fire their own beginupdate/endupdate events which can be used by interested
        // views to suspend layouts.
        me.fireEvent('beginprocessresponse', me, response, operation);
        if (success === true) {
            reader = me.getReader();
            if (response.status === 204) {
                resultSet = reader.getNullResultSet();
            } else {
                resultSet = reader.read(me.extractResponseData(response), {
                    // If we're doing an update, we want to construct the models ourselves.
                    recordCreator: operation.getRecordCreator() || reader.defaultRecordCreatorFromServer
                });
            }
            /// FIX
            /// If operation is in a batch we don't destroy it
            if (!operation.$destroyOwner && operation.getBatch() == null) {
                operation.$destroyOwner = me;
                destroyOp = true;
            }

            operation.process(resultSet, request, response);
            exception = !operation.wasSuccessful();
        } else {
            me.setException(operation, response);
            exception = true;
        }
        // It is possible that exception callback destroyed the store and owning proxy,
        // in which case we can't do nothing except punt.
        if (me.destroyed) {
            if (!operation.destroyed && destroyOp && operation.$destroyOwner === me) {
                operation.destroy();
            }
            return;
        }
        if (exception) {
            me.fireEvent('exception', me, response, operation);
        } else // If a JsonReader detected metadata, process it now.
        // This will fire the 'metachange' event which the Store processes to fire its own
        // 'metachange'
        {
            meta = resultSet.getMetadata();
            if (meta) {
                me.onMetaChange(meta);
            }
        }
        // Ditto
        if (me.destroyed) {
            if (!operation.destroyed && destroyOp && operation.$destroyOwner === me) {
                operation.destroy();
            }
            return;
        }
        me.afterRequest(request, success);
        // Tell owning store processing has finished.
        // It will fire its endupdate event which will cause interested views to
        // resume layouts.
        me.fireEvent('endprocessresponse', me, response, operation);
        if (!operation.destroyed && destroyOp && operation.$destroyOwner === me) {
            operation.destroy();
        }
    },
});
