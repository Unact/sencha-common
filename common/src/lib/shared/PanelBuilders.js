Ext.define('Ext.lib.shared.PanelBuilders', {
    mixinId: 'panelbuilders',
    
    addEditingPlugins: function(config, plugins) {
        var hasEditingPlugin;
        
        if (config.disableEditing !== true) {
            hasEditingPlugin = false;
            
            for (i = 0; i < plugins.length; i++) {
                if (plugins[i].ptype == 'rowediting'
                    || plugins[i].ptype == 'cellediting') {
                    hasEditingPlugin = true;
                    break;
                }
            }
            if (!hasEditingPlugin) {
                plugins.push((config.editing == 'row') ? {
                    ptype: 'rowediting',
                    clicksToEdit: 2
                } : {
                    ptype: 'cellediting',
                    clicksToEdit: 1
                });
            }
        }
    },
    
    formToolbarConfig: function(config) {
        var toolbarConfig = {
            xtype: 'sharedtoolbar',
            
            beforeButtons: config.beforeButtons,
            afterButtons: config.afterButtons,
            
            disableDelete: config.disableDelete,
            disableAdd: config.disableAdd,
            disableSave: config.disableSave,
            disableRefresh: config.disableRefresh,
            
            suffix: config.suffix
        };
        
        if(!config.dockedItems){
            config.dockedItems = [];
        }
        
        if (config.enabledButtons) {
            toolbarConfig['enabledButtons'] = config.enabledButtons;
        }
        
        if (config.buttonsDock) {
            toolbarConfig['buttonsDock'] = config.buttonsDock;
        }
        
        if (config.beforeToolbar) {
            for (i = 0; i < config.beforeToolbar.length; i++) {
                config.dockedItems.push(config.beforeToolbar[i]);
            }
        }
        
        config.dockedItems.push(toolbarConfig);
        
        if (config.afterToolbar) {
            for (i = 0; i < config.afterToolbar.length; i++) {
                config.dockedItems.push(config.afterToolbar[i]);
            }
        }
    }
});
