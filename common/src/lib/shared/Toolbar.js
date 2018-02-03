Ext.define('Ext.lib.shared.Toolbar', {
    extend: 'Ext.lib.shared.BaseToolbar',
    alias: 'widget.sharedtoolbar',

    additionalEnabledButtons: [
        'add',
        'delete'
    ],

    requires: ['Ext.lib.dblog.Window'],

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

        return buttons;
    }
});
