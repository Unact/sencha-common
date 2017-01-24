Ext.define('Ext.modern.lib.shared.Toolbar', {
    extend: 'Ext.modern.lib.shared.BaseToolbar',
    alias: 'widget.sharedtoolbar',

    additionalEnabledButtons: [
        'add',
        'delete'
    ],

    additionalButtons: function(config) {
        var buttons = [];

        if (config.enabledButtons.indexOf('add') !== -1 && !config.disableAdd) {
            buttons.push({
                reference: 'add' + config.suffix,
                text: 'Добавить',
                handler: 'onAdd',
                ui: 'confirm'
            });
        }
        if (config.enabledButtons.indexOf('delete') !== -1 && !config.disableDelete) {
            buttons.push({
                reference: 'delete' + config.suffix,
                text: 'Удалить',
                handler: 'onDelete',
                ui: 'decline'
            });
        }

        return buttons;
    }
});
