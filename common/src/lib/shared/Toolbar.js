Ext.define('Ext.lib.shared.Toolbar', {
    extend: 'Ext.lib.shared.BaseToolbar',
    alias: 'widget.sharedtoolbar',

    additionEnabledButtons: [
        'add',
        'delete'
    ],

    additionButtons: function() {
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

        return buttons;
    }
});
