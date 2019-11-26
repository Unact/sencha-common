Ext.define('Ext.lib.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.simpleGrid',

    requires: [
        'Ext.button.Button',
        'Ext.grid.plugin.CellEditing',
        'Ext.grid.plugin.RowEditing',
        'Ext.lib.shared.Toolbar',
        'Ext.lib.shared.PanelBuilders'
    ],

    mixins: ['Ext.lib.shared.PanelBuilders'],

    config: {
        stateful: true,
        saveDetail: false,
        autoEditOnAdd: false
    },

    /**
     * @param {Object} config Config object.
     * suffix - специальное имя для компонента. используется при построении идентификатора объектов и плагинов
     * disable* - не использовать данную кнопку или функцию
     * beforeButtons - дополнительные элементы для панели, располагающиеся перед основными кнопками
     * afterButtons - дополнительные элементы для панели, располагающиеся после основных кнопок
     * disableEditing - таблица нередактируемая. По умолчанию используется редактирование ячеек
     * enableDeleteColumn - добавлять колонку удаления позиций. По умолчанию не добавляется
     * enableBuffering - использовать плагин для буферизованного вывода записей. когда записей больше 1000, это полезно.
     * extraPlugins - дополнительные плагины помимо плагинов редактирования и буферизованного вывода.
     */
    constructor : function(currentConfig) {
        var me = this;
        var config = {};
        var plugins;
        var i;
        var suffix;

        suffix = currentConfig.suffix || me.xtype;
        config.suffix = suffix;
        config.viewConfig = {};
        config.selModel = {};

        Ext.apply(config, this.superclass.defaultConfig);
        Ext.apply(config, Ext.clone(currentConfig));
        Ext.apply(config, Ext.clone(me.cfg));
        Ext.applyIf(config.viewConfig, {
            loadMask: false
        });
        Ext.applyIf(config.selModel, {
            type: 'rowmodel',
            mode: 'MULTI'
        });

        me.formToolbarConfig(config);

        plugins = config.plugins || [];

        me.addEditingPlugins(config, plugins);

        if (config.enableBuffering === true) {
            var hasBufferPlugin = false;

            for ( i = 0; i < plugins.length; i++) {
                if (plugins[i].ptype == 'bufferedrenderer') {
                    hasBufferPlugin = true;
                    break;
                }
            }
            if (!hasBufferPlugin) {
                plugins.push({
                    ptype : 'bufferedrenderer',
                    trailingBufferZone : 20,
                    leadingBufferZone : 50
                });
            }
        }

        if (config.extraPlugins != null) {
            for ( i = 0; i < config.extraPlugins.length; i++) {
                if (config.extraPlugins[i].ptype != 'rowediting' && config.extraPlugins[i].ptype != 'cellediting' && config.extraPlugins[i].ptype != 'bufferedrenderer') {
                    plugins.push(config.extraPlugins[i]);
                }
            }
        }

        for ( i = 0; i < plugins.length; i++) {
            if (plugins[i].pluginId == null) {
                plugins[i].pluginId = plugins[i].ptype + suffix;
            }
        }

        config.plugins = plugins;

        config.reference = suffix + 'Table';
        config.stateId = suffix + 'StateId';

        if (config.enableDeleteColumn === true) {
            config.columns.push(Ext.apply({
                xtype: 'actioncolumn',
                width: 20,
                icon: '/images/cross.gif',
                tooltip: 'Удалить',
                handler: 'onDeleteByColumn'
            }, config.deleteColumnConfig));
        }

        Ext.apply(me, config);

        me.callParent(arguments);
    }
});
