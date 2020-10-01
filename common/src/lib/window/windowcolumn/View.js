Ext.define('Ext.lib.window.windowcolumn.View', {
    extend: 'Ext.window.Window',
    alias: 'widget.windowwindowcolumn',

    height: 350,
    width: 1000,

    layout: 'border',

    modal: true,

    constructor: function(config) {
        this.parentColumn = config.parentColumn;
        this.parentRecord = config.parentRecord;

        this.title = this.parentColumn.text;
        this.items = [{
            region: 'center',
            xtype: this.parentColumn.gridXtype,
            viewConfig: {
                loadMask: true
            }
        }];
        this.buttons = [{
            text: 'Выбрать',
            handler: 'select',
            scope: this
        }, {
            text: 'Отмена',
            handler: 'close',
            scope: this
        }, {
            text: 'Удалить',
            handler: 'deselect',
            scope: this
        }];

        this.callParent(arguments);
    },

    select: function() {
        const parentColumn = this.parentColumn;
        const masterView = this.down(this.parentColumn.gridXtype);
        const masterController = masterView.getController();
        const masterRecord = masterView.getSelectionModel().getSelection()[0];

        if (masterRecord == null) {
            Ext.Msg.alert('Ошибка', 'Не выбрана запись');
            return;
        }

        if (masterController.beforeSelect && (typeof masterController.beforeSelect === 'function')) {
            if (masterController.beforeSelect(masterRecord) === false) {
                return;
            }
        }

        this.parentRecord.set(parentColumn.dataIndex, masterRecord.get(parentColumn.primaryKey));
        this.parentRecord.set(parentColumn.fieldName, masterRecord.get(parentColumn.primaryValue));

        if (masterController.afterSelect && (typeof masterController.afterSelect === 'function')) {
            masterController.afterSelect(masterRecord);
        }

        this.close();
    },

    deselect: function() {
        const parentColumn = this.parentColumn;

        this.parentRecord.set(parentColumn.dataIndex, null);
        this.parentRecord.set(parentColumn.fieldName, null);
        this.close();
    },

    close: function() {
        this.parentColumn.up('grid').getView().refresh();
        this.callParent();
    },

    onDestroy: function() {
        Ext.GlobalEvents.fireEvent('endserveroperation', true, null, true);
    }
});
