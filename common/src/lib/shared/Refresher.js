Ext.define('Ext.lib.shared.Refresher', {
    mixinId: 'refresher',

    /*
     * Обновляющие xtype-ы
     * xtype элементов вводa, для которых нажатие Enter будет приводить к нажатию кнопки "Обновить"
     * @private
     */
    refreshingXtypes: ['textfield', 'combobox', 'timefield', 'datefield', 'numberfield', 'treepicker'],

    /**
     * @private
     */
    config: {
        enterHandlers: []
    },

    addEnterHandler: function(component) {
        if (!this.refreshBtn) {
            return;
        }

        this.enterHandlers.push(new Ext.util.KeyNav({
            target: component.el,
            scope: this,
            enter: this.enterHandler
        }));
    },

    initEnterHandlers: function() {
        this.up().query(this.getRefreshingSelector()).forEach(function(component) {
            this.addEnterHandler(component);
        }, this);
    },

    destroyEnterHandlers: function() {
        Ext.destroy(this.enterHandlers);
    },

    /**
     * Упращенная версия этого:
     * http://docs.sencha.com/extjs/6.0.1/classic/Ext.panel.Panel.html#method-fireDefaultButton
     * @private
     */
    enterHandler: function(event) {
        this.refreshBtn.click(event);
        event.stopEvent();
        return false;
    },

    /**
     * Вернуть селектор, который позволяет отобрать подходящие компопенты
     * @private
     */
    getRefreshingSelector: function() {
        // Используем '(true)', что бы не отбирать подклассы. Опасность представляет textarea, где enter - переход на
        // следующую строку
        return this.refreshingXtypes.map(function(xtype) {
            return xtype + '(true)';
        }).join(',');
    }
});
