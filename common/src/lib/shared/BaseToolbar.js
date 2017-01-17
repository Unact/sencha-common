Ext.define('Ext.lib.shared.BaseToolbar', {
    extend: 'Ext.Toolbar',
    alias: 'widget.sharedbasetoolbar',

    mixins: ['Ext.lib.shared.Refresher'],

    defaultEnabledButtons: [
        'refresh',
        'save'
    ],

    overflowHandler: 'scroller',

    initComponent: function() {
        var items = [];

        if (!this.enabledButtons) {
            this.enabledButtons = this.getDefaultEnabledButtons();
        }

        if (this.beforeButtons) {
            items = items.concat(this.beforeButtons);
        }

        if (this.enabledButtons.indexOf('refresh') !== -1 && !this.disableRefresh) {
            items.push({
                reference: 'refresh' + this.suffix,
                icon: '/images/refresh.gif',
                tooltip: 'Обновить',
                handler: 'onRefresh',
                margin: this.sharedToolbarButtonMargins
            });
        }
        if (this.enabledButtons.indexOf('save') !== -1 && !this.disableSave) {
            items.push({
                reference: 'save' + this.suffix,
                icon: '/images/save.png',
                tooltip: 'Сохранить',
                handler: 'onSave',
                margin: this.sharedToolbarButtonMargins
            });
        }

        items = items.concat(this.additionalButtons());

        if (this.afterButtons) {
            items = items.concat(this.afterButtons);
        }

        this.items = items;
        this.callParent();
    },

    onBoxReady: function() {
        this.refreshBtn = this.ownerCt.lookupReference('refresh' + this.suffix);
        this.initEnterHandlers();
        this.callParent();
    },

    beforeDestroy: function() {
        this.destroyEnterHandlers();
        this.callParent();
    },

    getDefaultEnabledButtons: function() {
        return this.defaultEnabledButtons.concat(this.additionalEnabledButtons);
    },

    /**
     * @template
     */
    additionalButtons: function() {
        return [];
    }
});
