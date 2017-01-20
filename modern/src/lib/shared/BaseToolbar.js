Ext.define('Ext.modern.lib.shared.BaseToolbar', {
    extend: 'Ext.Toolbar',
    alias: 'widget.sharedbasetoolbar',

    defaultEnabledButtons: [
        'refresh',
        'save'
    ],

    constructor: function(config) {
        let items = [];

        if (!config.enabledButtons) {
            config.enabledButtons = this.getDefaultEnabledButtons();
        }

        if (config.beforeButtons) {
            items = items.concat(config.beforeButtons);
        }

        if (config.enabledButtons.indexOf('refresh') !== -1 && !config.disableRefresh) {
            items.push({
                reference: 'refresh' + config.suffix,
                text: 'Обновить',
                handler: 'onRefresh'
            });
        }
        if (config.enabledButtons.indexOf('save') !== -1 && !config.disableSave) {
            items.push({
                reference: 'save' + config.suffix,
                text: 'Сохранить',
                handler: 'onSave'
            });
        }

        items = items.concat(this.additionalButtons(config));

        if (config.afterButtons) {
            items = items.concat(config.afterButtons);
        }

        config.items = items;
        this.callParent(arguments);
    },


    getDefaultEnabledButtons: function() {
        return this.defaultEnabledButtons.concat(this.additionalEnabledButtons);
    },

    /**
     * @template
     */
    additionalButtons: function(config) {
        return [];
    }
});
