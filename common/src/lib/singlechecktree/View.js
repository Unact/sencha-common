Ext.define('Ext.lib.singlechecktree.View', {
    extend : 'Ext.tree.Panel',
    alias : 'widget.singlechecktree',

    requires : [
        'Ext.lib.singlechecktree.ViewController',
        'Ext.lib.shared.CheckmarkToolbar'
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
    
    
    config: {
        checkableStore: null,
        autoEditOnAdd: false,
        checkmarkStore: null
    },
    
    applyCheckmarkStore: function(store) {
        var me = this;
        
        //Если панель имеет checkableStore то надо всем узлам дерева
        //после его загрузки добавить checkbox-ы
        me.getStore().on("load", me.onLoadStore, me);

        return store;
    },
    
    onLoadStore: function(treeStore, loadedNode, records, successful, eOpts) {
/*
        //После загрузки корневого элемента, везде проставить чекбоксы
        loadedNode[0].cascadeBy(function(node) {
            node.set('checked', false);
        });
*/
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
            disableBranch: me.disableBranch,
            
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
