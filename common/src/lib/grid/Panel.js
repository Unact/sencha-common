Ext.define('Ext.lib.grid.Panel', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.simpleGrid',

	// @formatter:off
	requires: [
		'Ext.button.Button',
		'Ext.grid.plugin.CellEditing',
		'Ext.grid.plugin.RowEditing'],
	// @formatter:on
	
	config: {
		enabledButtons: [
			'refresh',
			'save',
			'add',
			'delete'
		]
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
		// @formatter:off
		var me = this,
			config = {},
			plugins,
			buttons = [],
			i;
		// @formatter:on

		Ext.apply(config, this.getInitialConfig());
		Ext.apply(config, currentConfig);
		Ext.apply(config, me.cfg);

		plugins = config.plugins || [];

		if (config.beforeButtons != null) {
			for ( i = 0; i < config.beforeButtons.length; i++) {
				buttons.push(config.beforeButtons[i]);
			}
		}
		
		if (config.enabledButtons.indexOf('refresh')!=-1 && !config.disableRefresh) {
			buttons.push({
				reference : 'refresh' + config.suffix,
				icon : '/images/refresh.gif',
				tooltip : 'Обновить',
				handler : 'onRefresh'
			});
		}
		if (config.enabledButtons.indexOf('save')!=-1 && !config.disableSave) {
			buttons.push({
				reference : 'save' + config.suffix,
				icon : '/images/save.png',
				tooltip : 'Сохранить',
				handler : 'onSave'
			});
		}
		if (config.enabledButtons.indexOf('add')!=-1 && !config.disableAdd) {
			buttons.push({
				reference : 'add' + config.suffix,
				icon : '/images/add.gif',
				tooltip : 'Добавить',
				handler : 'onAdd'
			});
		}
		if (config.enabledButtons.indexOf('delete')!=-1 && !config.disableDelete) {
			buttons.push({
				reference : 'delete' + config.suffix,
				icon : '/images/delete.gif',
				disabled : true,
				tooltip : 'Удалить',
				handler : 'onDelete'
			});
		}

		if (config.afterButtons != null) {
			for ( i = 0; i < config.afterButtons.length; i++) {
				buttons.push(config.afterButtons[i]);
			}
		}
		
		if(buttons.length>0){
			config.dockedItems = [{
				xtype : 'toolbar',
				overflowHandler: 'scroller',
				dock : config.buttonsDock || 'top',
				items : buttons
			}];
		}

		config.viewConfig = config.viewConfig || {
			enableTextSelection : true
		};

		if (config.disableEditing !== true) {
			var hasEditingPlugin = false, hasBufferPlugin = false;

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
				plugins[i].pluginId = plugins[i].ptype + config.suffix;
			}
		}

		config.plugins = plugins;

		config.reference = config.suffix + 'Table';

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
	},

	getRecsFromCsv : function(csv) {
		// @formatter:off
        var grid = this,
        	rows = csv.split("\n"),
        	record,
        	records = [],
        	columns = grid.columns,
        	j, cols, l;
        // @formatter:on

		rows.every(function(row) {
			if (row.length > 0) {
				cols = row.split("\t");
				record = {};
				l = Math.min(cols.length, columns.length);

				for ( j = 0; j < l; j++) {
					if (columns[j].config.field.xtype === "numberfield") {
						cols[j] = cols[j].replace(new RegExp(String.fromCharCode(160), "g"), "").replace(/,/g, ".");
					};
					record[columns[j].dataIndex] = cols[j];
				}

				records.push(record);
			}

			return true;
		});

		return records;
	},

	getCsvDataFromRecs : function() {
		// @formatter:off
        var grid = this,
        	store = grid.store,
        	rows = [];
        // @formatter:on

		grid.getSelectionModel().getSelection().every(function(record) {
			var row = [];
			grid.columns.every(function(column) {
				row.push(record.get(column.dataIndex));
				
				return true;
			});
			rows.push(row.join("\t"));
			
			return true;
		});
		return rows.length>0 ? rows.join("\n") : null;
	}
});
