Ext.define('Ext.lib.grid.Panel', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.simpleGrid',

	// @formatter:off
	requires: [
		'Ext.button.Button',
		'Ext.grid.plugin.CellEditing',
		'Ext.grid.plugin.RowEditing',
		'Ext.lib.shared.Toolbar'],
	// @formatter:on
	
	config: {
		selModel: {
			type: 'rowmodel',
			mode: 'MULTI'
		},
		
		saveDetail: false,
		stateful: true,
		autoEditOnAdd: false
	},

	/**
	 * @param {Object} config Config object.
	 * suffix - специальное имя для компонента. используется при построении идентификатора объектов и плагинов
	 * disable* - не использовать данную кнопку или функцию
	 * beforeButtons - дополнительные элементы для панели, располагающиеся перед основными кнопками
	 * afterButtons - дополнительные элементы для панели, располагающиеся после основных кнопок
	 * disableEditing - таблица нередактируемая. По умолчанию используется редактирование ячеек
	 * disableDeleteColumn - не добавлять колонку удаления позиций. По умолчанию добавляется
	 * enableBuffering - использовать плагин для буферизованного вывода записей. когда записей больше 1000, это полезно.
	 * extraPlugins - дополнительные плагины помимо плагинов редактирования и буферизованного вывода.
	 */
	constructor : function(currentConfig) {
		var me = this;
		var config = {};
		var plugins;
		var i;
		var suffix;
		
		suffix = config.suffix || me.xtype;
		config.suffix = suffix;
		config.viewConfig = {};
		config.dockedItems = [];

		Ext.apply(config, me.getInitialConfig());
		Ext.apply(config, currentConfig);
		Ext.apply(config, me.cfg);
		
		
		plugins = config.plugins || [];
		

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
        
        if(config.enabledButtons) {
            toolbarConfig['enabledButtons'] = config.enabledButtons;
        };
        if(config.buttonsDock) {
            toolbarConfig['buttonsDock'] = config.buttonsDock;
        }
                
        if(config.beforeToolbar){
        	for (i = 0; i < config.beforeToolbar.length; i++) {
                config.dockedItems.push(config.beforeToolbar[i]);
            }
        }
                
        config.dockedItems.push(toolbarConfig);

        if(config.afterToolbar){
        	for (i = 0; i < config.afterToolbar.length; i++) {
                config.dockedItems.push(config.afterToolbar[i]);
            }
        }

		Ext.applyIf(config.viewConfig, {
			enableTextSelection : true,
			loadMask: false
		});

		if (config.disableEditing !== true) {
			var hasEditingPlugin = false;

			for ( i = 0; i < plugins.length; i++) {
				if (plugins[i].ptype == 'rowediting' || plugins[i].ptype == 'cellediting') {
					hasEditingPlugin = true;
					break;
				}
			}
			if (!hasEditingPlugin) {
				plugins.push((config.editing == 'row') ? {
					ptype : 'rowediting',
					clicksToEdit : 2
				} : {
					ptype : 'cellediting',
					clicksToEdit : 1
				});
			}
		}

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

		if (config.disableDeleteColumn !== true) {
			config.columns.push(Ext.apply({
				xtype : 'actioncolumn',
				width : 20,
				icon : '/images/cross.gif',
				tooltip : 'Удалить',
				handler : 'onDeleteByColumn'
			}, config.deleteColumnConfig));
		}
		
		Ext.apply(this, config);

		this.callParent(arguments);
	}
});
