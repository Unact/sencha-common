Ext.define('Ext.lib.grid.column.ComboColumn', {
	extend : 'Ext.grid.column.Column',
	alias : 'widget.combocolumn',
	
	requires: ['Ext.form.field.ComboBox'],
	
	/**
	 * @param {Object} config Config object.
	 * store - хранилище или идентификатор или полное имя класса
	 * queryMode - режим запроса. по умолчанию локальный
	 * displayField - отображаемое поле. по умолчанию 'name'
	 * valueField - отображаемое поле. по умолчанию 'id'
	 * onlyRenderer - не создавать элемент для редактирования
	 * fieldListeners - слушатели событий элемента редактирования
	 */
	constructor: function(config){
		var me=this;
		
		me.callParent(arguments);
		
		if(!config.store.isStore){
			me.store = Ext.data.StoreManager.lookup(config.store);
			if(me.store==null){
				me.store = Ext.create(config.store);
			}
		} else {
			me.store = config.store;
		}
		
		function renderer(value){
			var matching = null,
				data=me.store.snapshot || me.store.data;
			data.each(function(record){
				if(record.get(config.valueField || 'id')==value){
					matching=record.get(config.displayField || 'name');
				}
				return matching==null;
			});
			return matching;
		};
		
		me.renderer = config.renderer || renderer;
		
		if(!config.onlyRenderer){
			me.field = Ext.create('Ext.form.ComboBox', {
				store: me.store,
				listConfig: config.listConfig,
				queryMode: config.queryMode || 'local',
				displayField: config.displayField || 'name',
				valueField: config.valueField || 'id',
				value: "",
				autoSelect: (config.allowNull!==true),
				column: me,
				name: me.dataIndex,
				triggerAction: config.triggerAction || 'all',
				listeners: (config.fieldListeners!==false)?
					(config.fieldListeners || {
						beforequery: function(queryEvent){
							queryEvent.combo.store.clearFilter();
							queryEvent.combo.store.filter(queryEvent.combo.displayField, queryEvent.query);
							return true;
						}
					}) :null
				}
			);
		}
		
		me.doSort = function(state){
			me.up('tablepanel').store.sort({
				property: me.dataIndex,
				transform: renderer,
				direction: state
			});
			return true;
		};
	}
	
});