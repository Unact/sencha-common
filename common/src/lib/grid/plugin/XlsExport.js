Ext.define('Ext.lib.grid.plugin.XlsExport', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.xlsexport',

    button: null,
    showButton: true,

    init: function(cmp) {
        const toolbar = cmp.query('toolbar[dock="top"]').slice(-1)[0];

        if (this.showButton) {
            this.button = toolbar.add({
                xtype: 'button',
                icon: '/images/excel.gif',
                tooltip: 'Экспорт в xls',
                handler: 'onExportXls',
                scope: this
            });
        }

        cmp.on({
            destroy: 'destroy',
            scope: this
        });
        this.setCmp(cmp);
    },

    destroy: function() {
        const toolbar = this.getCmp().query('toolbar[dock="top"]').slice(-1)[0];

        if (this.showButton) {
            toolbar.remove(this.button);
        }

        this.callParent();
    },

    onExportXls: function() {
        const view = this.getCmp();
        const controller = view.getController();
        const defaultColumns = view.getColumns().filter(col => !col.hidden && col.xtype !== 'rownumberer');
        const propColumns = view.getColumns().filter(col => col.hasOwnProperty('exportToXls'));
        const exportColumns = propColumns.length > 0 ? propColumns : defaultColumns;
        const title = document.title;
        const headers = controller.headersForXls ?
            controller.headersForXls(propColumns) :
            exportColumns.reduce((obj, col) => {
                const prop = col.fieldName || col.dataIndex;
                obj[prop] = col.text;
                return obj;
            }, {});
        const data = controller.dataForXls ?
            controller.dataForXls(headers) :
            view.getStore().getData().items.map((rec) => {
                return Object.keys(headers).reduce((obj, prop) => {
                    obj[prop] = rec.get(prop);
                    return obj;
                }, {});
            });
        const footers = controller.footersForXls ?
            controller.footersForXls(propColumns) :
            {};

        if (data.length === 0) {
            Ext.Msg.alert('Ошибка', 'Нет данных для выгрузки');
            return;
        }

        Ext.GlobalEvents.fireEvent('beginserveroperation');
        Ext.Ajax.request({
            binary: true,
            method: 'POST',
            jsonData: JSON.stringify({
                title: title,
                headers: headers,
                footers: footers,
                data: data
            }),
            url: '/xls',
            timeout: 30000
        }).then((response) => {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(new Blob([response.responseBytes]));
            link.download = title + '.xls';
            link.click();

            Ext.GlobalEvents.fireEvent('endserveroperation');
        }, (response) => {
            Ext.GlobalEvents.fireEvent('endserveroperation');
            this.onError(response);
        });
    }
});
