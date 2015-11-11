Ext.define('Ext.lib.singletree.View', {
    extend : 'Ext.tree.Panel',
    alias : 'widget.singlegrid',

    requires : [
        'Ext.lib.singletree.ViewController',
        'Ext.lib.shared.Toolbar'
    ],

    controller : 'singletree',

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
    
    initComponent: function() {
        var me = this;
        var toolbarConfig = {
            xtype: 'sharedtoolbar',
            
            beforeButtons: me.beforeButtons,
            afterButtons: me.afterButtons,
            
            disableDelete: me.disableDelete,
            disableAdd: me.disableAdd,
            disableSave: me.disableSave,
            disableRefresh: me.disableRefresh,
            
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

            for ( i = 0; i < plugins.length; i++) {
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
        
        me.callParent();

    }
});
