Ext.define('Ext.lib.grid.column.ComboColumn', {
	extend : 'Ext.grid.column.Column',
	alias : 'widget.combocolumn',
	
	requires: ['Ext.form.field.ComboBox'],
	
	/**
	 * @param {Object} config Config object.
	 * store - хранилище или идентификатор или полное имя класса
	 * fieldConfig - объект конфигурации combobox-а. Значения по-умолчанию:
	 * 	queryMode - режим запроса. по умолчанию локальный
	 *  displayField и valueField заполняются на основе primaryKey, foreignKey (см. ниже)
	 * 
	 * onlyRenderer - не создавать элемент для редактирования
	 * skipBeforeQuery - пропустить встроенный обработчик события начала запроса
	 * primaryKey - наименование поля первичного ключа. по умолчанию 'id'
	 * primaryValue - наименование поля, хранящего отображаемое значение. по умолчанию 'name'
	 * comboStore - 
	 * 
	 * В модель добавляется вычисляемое поле, хранящее значение, которое надо отобразить.
	 */
	constructor: function(config){
		var me = this,
			fieldConfig = {},
			model, modelFields, fieldName,
			renderer;
		
		me.callParent(arguments);
		
		me.primaryKey = config.primaryKey || 'id';
		me.primaryValue = config.primaryValue || 'name';
		
		me.fieldName = me.dataIndex + '_' + me.primaryValue;
		
		if(config.store){
			if(!config.store.isStore){
				me.store = Ext.data.StoreManager.lookup(config.store);
				if(me.store==null){
					me.store = Ext.create(config.store);
				}
			} else {
				me.store = config.store;
			}
		} else {
			me.store = Ext.create('Ext.data.Store', {
				fields: [me.primaryKey, me.primaryValue],
				proxy: { type: 'memory' }
			});
		}
		
		function renderer(v, metaData, rec){
			return rec.get(me.fieldName) || "";
		};
		
		me.renderer = config.renderer || renderer;
		
		me.getSortParam = function(){
			return me.fieldName;
		};
		
		if(!config.onlyRenderer){
			if(me.width){
				fieldConfig.width = me.width - 4;
			}
			Ext.applyIf(fieldConfig, config.field);
			Ext.applyIf(fieldConfig, {
				queryMode: 'local',
				displayField: me.primaryValue,
				valueField: me.primaryKey,
				store: me.store,
				value: "",
				column: me,
				name: me.dataIndex,
				triggerAction: 'all'
			});
			
			if(config.skipBeforeQuery!==true){
				if(!fieldConfig.listeners) {
					fieldConfig.listeners = {};
				}
				Ext.applyIf(fieldConfig.listeners, {
					beforequery: function(queryEvent){
						queryEvent.combo.store.clearFilter();
						queryEvent.combo.store.filter(queryEvent.combo.displayField, queryEvent.query);
						return true;
					}
				});
			}
			me.field = Ext.create('Ext.form.ComboBox', fieldConfig);
		}
	},
	
	setStore: function(store){
		var me = this,
			initConfig = me.getInitialConfig();
		
		me.store = store;
		if(me.field &&
			!(
				initConfig.field &&
				(initConfig.field.store || (initConfig.field.bind && initConfig.field.bind.store))
			)
		){
			me.field.bindStore(store);
		}
	},
	
	addPrimaryValueField: function(model){
		var me = this, fields, fieldPresent = false;
		
		if(model==null){
			model = me.up('grid').store.getModel();
		}
		fields = model.getFields();
		fields.forEach(function(field){
			if(field.name==me.fieldName){
				fieldPresent = true;
			}
			return !fieldPresent;
		});
		if(!fieldPresent){
			model.addFields([{	
				name: me.fieldName,
				convert: function(v, rec) {
					var matching = null,
						data = me.store.snapshot || me.store.data,
						foreignKey = rec.get(me.dataIndex);
					
					data.each(function(record) {
						if (record.get(me.primaryKey) == foreignKey) {
							matching = record.get(me.primaryValue);
						}
						return matching == null;
					});
					return matching || "";
				},
				depends: [me.dataIndex],
				persist: false
			}]);
		}
	},
	
	/*
	 * Для добавления поля в модель, связанную с таблицей, необходимо иметь доступ к таблице
	 * Это возможно только после создания таблицы. Например, при отображении колонки
	 * таблица уже существует. Поэтому добавлять поле будем в этом обработчике
	 */
	onRender: function(){
		var me = this;
		
		me.callParent();
		
		me.addPrimaryValueField();
	}
});