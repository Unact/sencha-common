Ext.define('Ext.lib.singlecheckgrid.View', {
    extend : 'Ext.grid.Panel',
    alias : 'widget.singlecheckgrid',

    requires : [
        'Ext.lib.singlecheckgrid.ViewController',
        'Ext.lib.shared.CheckmarkToolbar'
    ],

    controller : 'singlecheckgrid',

    // Для методов добавления и обновления доступны "предварительные" шаблонные методы

    /**
     * @cfg {function} beforeAdd
     * beforeAdd - должен вернуть объект для вставки в хранилище
     * /

    /**
     * @cfg {function} beforeRefresh
     * beforeRefresh - должен вернуть истину
     */

    // если "предварительные" методы возвращают другие значения, то основной метод далее не выполняется

    /**
     * @cfg {boolean} enableDeleteDialog
     * Показывать диалог подтверждения удаления или нет
     */


    config: {
        checkmarkStore: null,
        availableRowsFK: null
    },

    initComponent: function() {
        var me = this;
        var toolbarConfig = {
            xtype: 'sharedcheckmarktoolbar',

            beforeButtons: me.beforeButtons,
            afterButtons: me.afterButtons,

            disableRefresh: me.disableRefresh,
            disableSave: me.disableSave,
            disableFilterCheck: me.disableFilterCheck,
            disableBranch: true,

            sharedToolbarButtonMargins: me.sharedToolbarButtonMargins,
            suffix: me.suffix
        };

        if(me.enabledButtons) {
            toolbarConfig['enabledButtons'] = me.enabledButtons;
        };
        if(me.buttonsDock) {
            toolbarConfig['buttonsDock'] = me.buttonsDock;
        }

        me.dockedItems = [toolbarConfig];


        var plugins = me.plugins || [];
        if (me.disableEditing !== true) {
            var hasEditingPlugin = false;

            for (i = 0; i < plugins.length; i++) {
                if (plugins[i].ptype == 'rowediting' || plugins[i].ptype == 'cellediting') {
                    hasEditingPlugin = true;
                    break;
                }
            }
            if (!hasEditingPlugin) {
                plugins.push((me.editing == 'row') ? {
                    ptype : 'rowediting',
                    clicksToEdit : 2
                } : {
                    ptype : 'cellediting',
                    clicksToEdit : 1
                });
            }
        }
        me.plugins = plugins;

        var suffix = me.suffix || me.xtype;
        me.reference = me.reference || suffix + 'Table';

        me.callParent();
    }
});
