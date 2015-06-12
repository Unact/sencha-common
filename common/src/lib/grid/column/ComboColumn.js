Ext.define('Ext.lib.grid.column.ComboColumn', {
	extend : 'Ext.grid.column.Column',
	alias : 'widget.combocolumn',
	
	requires: [
		'Ext.form.field.ComboBox',
		'Ext.data.ChainedStore'
	],
	
	/**
	 * @param {Object} config Config object.
	 * store - хранилище или идентификатор или полное имя класса
	 * field - настройки поля
	 * 
	 * onlyRenderer - не создавать элемент для редактирования
	 * primaryKey - наименование поля первичного ключа. по умолчанию 'id'
	 * primaryValue - наименование поля, хранящего отображаемое значение. по умолчанию 'name'
	 * 
	 * В модель таблицы при ее создании добавляется вычисляемое поле,
	 * хранящее значение, которое надо отобразить.
	 * 
	 * Если для поля не задано хранилище, то будет создано новое связанное
	 * с хранилищем колонки
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
				column: me,
				name: me.dataIndex,
				triggerAction: 'all',
				xtype: 'combobox'
			});
			
			if(!fieldConfig.store) {
				if (fieldConfig.bind && !fieldConfig.bind.store){
					fieldConfig.bind.store = {
						source: me.store
					};
				} else if(!fieldConfig.bind) {
					fieldConfig.store = {
						type: 'chained',
						source: me.store
					};
				}
			}
			
			me.fieldConfig = fieldConfig;
			me.field = Ext.create('Ext.form.ComboBox', fieldConfig);
		}
	},
	
	getStore: function(){
		return this.store;
	},
	
	setStore: function(store){
		var me = this,
			initConfig = me.getInitialConfig();
		
		me.store = store;
		if(me.field &&
			!(
				initConfig.field &&
				(initConfig.field.store || (initConfig.field.bind && initConfig.field.bind.store))
			)){
			me.field.bindStore(Ext.create('Ext.data.ChainedStore', {
				source: store
			}), false, true);
		}
	},
	
	// эта функция вызывается таблицей при привязке основного хранилища
	addPrimaryValueField: function(model){
		var me = this, fields, fieldPresent = false;
		
		if(model==null){
			model = me.up('grid').getStore().getModel();
			if(model==null){
				return;
			}
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
						data = me.getStore().snapshot || me.getStore().data,
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
	}
});