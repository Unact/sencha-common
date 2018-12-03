Ext.define('Ext.overrides.data.proxy.Rest', {
    override: 'Ext.data.proxy.Rest',

    appendIdOnRead: true,

    buildUrl: function(request) {
        var me        = this,
            operation = request.getOperation(),
            records   = operation.getRecords(),
            record    = records ? records[0] : null,
            format    = me.getFormat(),
            url       = me.getUrl(request),
            id, params;

        if (record && !record.phantom) {
            id = record.getId();
        } else {
            id = operation.getId();
        }

        // Добавлена возможность не добавлять idParam при read операции
        if ((me.getAppendId() && (me.appendIdOnRead || !(operation.getAction() === 'read'))) && me.isValidId(id)) {
            if (!url.match(me.slashRe)) {
                url += '/';
            }

            url += encodeURIComponent(id);
            params = request.getParams();
            if (params) {
                delete params[me.getIdParam()];
            }
        }

        if (format) {
            if (!url.match(me.periodRe)) {
                url += '.';
            }

            url += format;
        }

        request.setUrl(url);
        return Ext.data.proxy.Rest.superclass.buildUrl.apply(this, arguments);
    },
});
