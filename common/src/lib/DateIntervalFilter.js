Ext.define('Ext.lib.DateIntervalFilter', {
    extend: 'Ext.container.Container',
    alias: 'widget.dateintervalfilter',

    layout: {
        type: 'hbox'
    },

    items: [{
        allowBlank: false,
        xtype: 'datefield',
        fieldLabel: 'С',
        format: 'd.m.Y',
        altFormat: 'd/m/Y|d m Y',
        startDay: 1,
        width: 110,
        labelWidth: 15,
        bind: {
            value: '{dateFrom}'
        }
    }, {
        allowBlank: false,
        xtype: 'datefield',
        fieldLabel: 'По',
        format: 'd.m.Y',
        altFormat: 'd/m/Y|d m Y',
        startDay: 1,
        width: 110,
        labelWidth: 15,
        bind: {
            value: '{dateTo}'
        }
    }]
});
