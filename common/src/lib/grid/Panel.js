Ext.define('Ext.lib.grid.Panel', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.simpleGrid',

	/**
	 * @param {Object} config Config object.
	 * suffix - специальное имя для компонента. используется при построении идентификатора объектов и плагинов
	 * disable* - не использовать данную кнопку или функцию
	 * defaultAddClickEvent - использовать ли событие по-умолчанию для кнопки Добавить,
	 * defaultDeleteClickEvent - использовать ли событие по-умолчанию для кнопки Удалить,
	 * beforeButtons - дополнительные элементы для панели, располагающиеся перед основными кнопками
	 * afterButtons - дополнительные элементы для панели, располагающиеся после основных кнопок
	 * disableEditing - таблица нередактируемая. По умолчанию используется редактирование ячеек
	 * disableDeleteColumn - не добавлять колонку удаления позиций. По умолчанию добавляется
	 * enableBuffering - использовать плагин для буферизованного вывода записей. когда записей больше 1000, это полезно.
	 * extraPlugins - дополнительные плагины помимо плагинов редактирования и буферизованного вывода.
	 * функция loadComboColumn - загружает сторки у всех combocolumn данной панели. Параметр - функция обратного вызова
	 * функция syncStore- синхронизация сторки данной панели. 1 параметр - extraParams. 2 параметр - функция обратного вызова
	 * функция getSelected- возвращает значение поля в выделенной строке. Параметр - название поля
	 */
	constructor : function(currentConfig) {
		var me = this, initConfig = me.getInitialConfig() || {}, plugins, buttons = [], i,
			toolbar;

		currentConfig = currentConfig || {};
		config = {};

		for (i in initConfig) {
			config[i] = initConfig[i];
		}

		for (i in currentConfig) {
			if (i != 'config')
				config[i] = currentConfig[i];
			else
				for (j in currentConfig[i]) {
					config[j] = currentConfig[i][j];
				}
		}

		plugins = config.plugins || [];

		if (config.beforeButtons != null) {
			for ( i = 0; i < config.beforeButtons.length; i++) {
				buttons.push(config.beforeButtons[i]);
			}
		}

		me.createDefaultButtons(buttons, config);
		
		if (config.afterButtons != null) {
			for ( i = 0; i < config.afterButtons.length; i++) {
				buttons.push(config.afterButtons[i]);
			}
		};
		
		toolbar = {
			xtype : 'toolbar',
			dock : config.buttonsDock || 'top',
			items : buttons
		};

		//Если тулбар причален к верху, то сделать выравниваение по верху.
		//Это сделано для того, что бы многострочные фильтры выглядели прилично.
		//Иначе, например, фильтры занимают две строки, а стандартные кнопки выравнены по-середине. Это не красива.
		//При выравнивании тулбара по верху tbseparator выглядит некрасиво, но мы им и не пользуемся. 
		if(toolbar.dock == 'top')
			toolbar.layout = {
				type: 'hbox',
				align: 'top'
			}; 

		config.dockedItems = [toolbar];

		config.viewConfig = config.viewConfig || {
			enableTextSelection : true
		};

		if (config.disableEditing !== true) {
			var hasEditingPlugin = false, hasBufferPlugin = false;

			//Это лажа, потому что по спецификации может быть много вариантов, а мы завязались только на конфигу
			//http://docs.sencha.com/extjs/4.2.2/#!/api/Ext.AbstractComponent-cfg-plugins
			for ( i = 0; i < plugins.length; i++) {
				var plugin = Ext.PluginManager.create(plugins[i], null, me);
				var pluginParent = plugin.superclass;

				while(pluginParent !== undefined) {
					if(pluginParent.self.getName() =='Ext.grid.plugin.Editing') {
						hasEditingPlugin = true;
						break;
					}
					
					pluginParent = pluginParent.superclass;	
				};
				
				if(hasEditingPlugin)
					break;
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

		config.id = config.suffix + 'Table';

		if (config.disableDeleteColumn !== true) {
			config.columns.push({
				xtype : 'actioncolumn',
				width : 20,
				icon : '/ext/examples/shared/icons/fam/cross.gif',
				tooltip : 'Удалить',
				handler : function(grid, rowIndex) {
					grid.store.removeAt(rowIndex);
				}
			});
		}

		Ext.apply(this, config);

		this.callParent(arguments);
	},

	getSelected : function(f) {
		var selected = this.getSelectionModel().getSelection()[0];
		return ((selected != null) ? selected.get(f) : null);
	},

	syncStore : function(extraParams, callback) {
		if (this.store.hasChanges()) {
			if (extraParams) {
				this.store.proxy.extraParams = extraParams;
			}

			this.store.sync({
				callback : function(batch) {
					var errorsPresent = batch.exceptions.length > 0;
					if (errorsPresent) {
						Ext.Msg.alert("Ошибка", batch.exceptions[0].getError().responseText);
					}
					if (callback && typeof (callback) === "function") {
						callback(!errorsPresent);
					}
				}
			});
		} else {
			callback(true);
		}
	},


	loadComboColumns : function(callback) {
		var count = 0,
			grid = this,
			comboColumns = [],
			errors = [];
		
		grid.columns.forEach(function(column) {
			if(column.xtype == 'combocolumn') {
				var store = column.store;
				
				if(!comboColumns.some(function(col) {return col.store == store;}))
					comboColumns.push(column);
			}
		});
		count = comboColumns.length;

		comboColumns.forEach(function(column) {
			column.store.load({
				callback : function(records, operation, success) {
					count--;

					if (success!==true){
						errors.push('Ошибка загрузки справочника для поля: ' + column.text + ', окно: ' + grid.title);
					}
			
					if (count == 0) {
						if (errors.length > 0) {
							Ext.Msg.alert('Ошибка', errors.join("<br/>"));
						}
						if (callback && typeof (callback) === "function") {
							callback((errors.length > 0) ? errors : true);
						}
					}
				},
				scope : column
			});
		});
	},


	makeComboColumn : function(column, storeCombo, allowNull, onlyRenderer) {
		function renderer(value) {
			var matching = null, data = storeCombo.snapshot || storeCombo.data;
			data.each(function(record) {
				if (record.get('id') == value) {
					matching = record.get('name');
				}
				return matching == null;
			});
			return matching;
		};

		if (!onlyRenderer) {
			column.field = Ext.create('Ext.form.ComboBox', {
				store : storeCombo,
				queryMode : 'local',
				displayField : 'name',
				valueField : 'id',
				value : "",
				autoSelect : (allowNull !== true)
			});
		}
		column.renderer = renderer;

		column.doSort = function(state) {
			this.store.sort({
				property : column.dataIndex,
				transform : renderer,
				direction : state
			});
			return true;
		};
	},
	
	createDefaultButtons: function(buttons, config) {
		me = this;
		
		if(config.disableRefresh !== true) {
			me.refreshBtn = Ext.create('Ext.Button', {
				id : 'refresh'+config.suffix,
				icon : '/ext/resources/themes/images/default/grid/refresh.gif',
				tooltip: 'Обновить'
			});
			
			if(config.defaultRefreshClickEvent == true)
				me.refreshBtn.addListener("click", me.onRefreshClick);
			
			buttons.push(me.refreshBtn);
		}

		if(config.disableSave !== true) {
			me.saveBtn = Ext.create('Ext.Button', {
				id : 'save'+config.suffix,
				icon : '/images/save.png',
				tooltip: 'Сохранить'
			});
			
			if(config.defaultSaveClickEvent == true)
				me.saveBtn.addListener("click", me.onSaveClick);
			
			buttons.push(me.saveBtn);
		}

		if(config.disableAdd !== true) {
			me.addBtn = Ext.create('Ext.Button', {
				id : 'add'+config.suffix,
				icon : '/ext/examples/shared/icons/fam/add.gif',
				tooltip: 'Добавить'
			});

			if(config.defaultAddClickEvent == true)
				me.addBtn.addListener("click", function(btn) {me.onAddClick(btn);});
				
			buttons.push(me.addBtn);
		}
		
		if (config.disableDelete !== true) {
			me.deleteBtn = Ext.create('Ext.Button', {
				id : 'delete'+config.suffix,
				icon : '/ext/examples/shared/icons/fam/delete.gif',
				disabled : true,
				tooltip: 'Удалить'
			});
			
			if(config.defaultDeleteClickEvent == true)
				me.deleteBtn.addListener("click", me.onDeleteClick);
			
			buttons.push(me.deleteBtn);
		}
	},
	
	onSaveClick: function(btn) {
		var grid  = btn.up("grid"),
		    store = grid.getStore();

		if(store.hasChanges()) {
			grid.setLoading(true);
		
			store.sync({
				success: function(batch, opt){
					grid.setLoading(false);
				},
				
				failure: function(batch, opt){
					if(batch.exceptions.length>0){
						Ext.lib.ErrorMsg.show('Ошибка сохранения', batch.exceptions);
					};
					grid.setLoading(false);
				}
			});
		}
	},
	
	onAddClick: function(btn, fields) {
		var grid   = btn.up("grid"),
		    editingPlugin = grid.findPlugin('cellediting') || grid.findPlugin('rowediting') || grid.findPlugin('arrowablecellediting'),
		    store  = grid.getStore(),
		    sm     = grid.getSelectionModel(),
		    index  = store.indexOf(sm.getLastSelected()),
		    fields = fields || {},
		    model  = Ext.ModelManager.create(fields, store.model);

		editingPlugin.cancelEdit();
		store.insert(Math.max(index, 0), model);
		sm.select(model);
		editingPlugin.startEdit(model, 0);
		
		return model;
	},
	
	onDeleteClick: function(btn) {
		var grid  = btn.up("grid"),
		    editingPlugin = grid.findPlugin('cellediting') || grid.findPlugin('rowediting') || grid.findPlugin('arrowablecellediting'),
		    store = grid.getStore(),
		    sm    = grid.getSelectionModel(),
		    index = store.indexOf(sm.getLastSelected());

		if (index>=0) {
			editingPlugin.cancelEdit();

			store.remove(sm.getSelection());

			if (store.getCount() > 0) {
				sm.select(Math.min(index, store.getCount() - 1));
			}
		}
	},
	
	onRefreshClick: function(btn) {
		var grid  = btn.up("grid"),
		    store = grid.getStore(),
		    sm    = grid.getSelectionModel(),
		    model = sm.getLastSelected();

		//model - активная модель до обновления. снять с нее выделение
		if(model)
			sm.deselect(model);

		grid.setLoading(true);

		store.load({
			callback: function(records, operation, success){
				if(success) {
					//model - та же модель, которая должна стать активной после обновления. Выделить ее
					if(model && (model = store.getById(model.getId())))
						sm.select(model);
				} else
					Ext.lib.ErrorMsg.show('Ошибка получения данных', operation);

				grid.setLoading(false);		
			}
		});
	}
});