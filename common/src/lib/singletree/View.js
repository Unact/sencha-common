Ext.define('Ext.lib.singletree.View', {
    extend : 'Ext.tree.Panel',
    alias : 'widget.singletree',

    requires : [
        'Ext.lib.singletree.ViewController',
        'Ext.lib.shared.Toolbar',
        'Ext.lib.shared.PanelBuilders'
    ],
    
    mixins: ['Ext.lib.shared.PanelBuilders'],

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
        autoEditOnAdd: false
    },
    
    onLoadStore: function(treeStore, loadedNode, records, successful, eOpts) {
        console.log('onLoadStore', arguments);
        
        //После загрузки корневого элемента, везде проставить чекбоксы
        loadedNode[0].cascadeBy(function(node) {
            node.set('checked', false);
        });
    },
    
    initComponent: function(config) {
        var me = this;
        var plugins = me.plugins || [];
        
        me.formToolbarConfig(me);
        
        me.addEditingPlugins(me, plugins);
        
        me.plugins = plugins;
        
        me.callParent(arguments);
    }
});
