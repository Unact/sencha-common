Ext.define('Ext.lib.shared.Toolbar', {
    extend: 'Ext.lib.shared.BaseToolbar',
    alias: 'widget.sharedtoolbar',

    additionalEnabledButtons: [
        'add',
        'delete'
    ],

    additionalButtons: function() {
        var buttons = [];

        if (this.enabledButtons.indexOf('add') !== -1 && !this.disableAdd) {
            buttons.push({
                reference: 'add' + this.suffix,
                icon: '/images/add.gif',
                tooltip: 'Добавить',
                handler: 'onAdd',
                margin: this.sharedToolbarButtonMargins
            });
        }
        if (this.enabledButtons.indexOf('delete') !== -1 && !this.disableDelete) {
            buttons.push({
                reference: 'delete' + this.suffix,
                icon: '/images/delete.gif',
                disabled: true,
                tooltip: 'Удалить',
                handler: 'onDelete',
                margin: this.sharedToolbarButtonMargins
            });
        }
        if (this.enabledButtons.indexOf('history') !== -1 && !this.disableНistory) {
            buttons.push({
                reference: 'history' + this.suffix,
                icon: '/images/history.png',
                disabled: true,
                tooltip: 'История изменения записи',
                handler: 'onHistory',
                margin: this.sharedToolbarButtonMargins
            });
        }
        if (this.enabledButtons.indexOf('extra') !== -1 && !this.disableExtra) {
            buttons.push({
                reference: 'extra' + this.suffix,
                icon: '/images/extra.gif',
                disabled: true,
                tooltip: 'Дополнительно',
                handler: 'onExtra',
                margin: this.sharedToolbarButtonMargins
            });
        }
        if (this.enabledButtons.indexOf('bi') !== -1 && !this.disableBi) {
            buttons.push({
                reference: 'bi' + this.suffix,
                icon: '/images/bi.png',
                disabled: true,
                tooltip: 'Признаки',
                handler: 'onBi',
                margin: this.sharedToolbarButtonMargins
            });
        }
        if (this.enabledButtons.indexOf('changemaster') !== -1 && !this.disableChangemaster) {
            buttons.push({
                reference: 'changemaster' + this.suffix,
                disabled: true,
                handler: 'onChangeMaster',
                margin: this.sharedToolbarButtonMargins,
                bind: {
                    icon: `{copiedRecords == null ? '/images/table_go.png' : '/images/table_copy.png'}`,
                    tooltip: `{copiedRecords == null ? 'Перенести в буфер' : 'Вставить из буфера'}`
                },
            });
        }

        return buttons;
    }
});
