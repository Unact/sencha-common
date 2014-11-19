Ext.define('Ext.lib.BuyerSpSets', {
	extend : 'Ext.container.Container',
	alias : 'widget.buyerSpSets',
	
	/**
     * @cfg {Int[]} spIds
     * Массив идентификаторов спецификаций покупателя
     */
    
	/**
     * @cfg {Object} itemsCfg
     * Общие настройки полей (доступные настройки см. Ext.form.field.Text)
     */
    
    /**
     * Загрузить сведения о полях и создать их
     */
	loadFields: function(arg) {
		var me = this;
		arg = me.prepareArg(arg);

		Ext.Ajax.request({
		    url: '/buyers_sp/buyers_sp',
		    params: Ext.Object.merge(me.getParams(), {authenticity_token: window._token}),

		    success: function(xhr) {
		        var res = Ext.JSON.decode(xhr.responseText);

				res.forEach(
		        	function(sp_type) {
		        		var el;

						switch (sp_type.type) {
		        			case 0:
								el = me.cretaComboBoxField(sp_type.id, sp_type.name, sp_type.sp_values, me.itemsCfg);
		        				break;
		        			case 1:
								el = me.createTextField(sp_type.id, sp_type.name, me.itemsCfg);
		        				break;
		        		};
		        		me.add(el);
		        	}
		        );
		        arg.success();
		    },
		    failure: arg.failure
		});
	},
	
	/**
	 * Загрузить значения в поля
	 */
	load: function(client, arg) {
		me = this;
		arg = me.prepareArg(arg);
		
		me.clear();
		
		Ext.Ajax.request({
		    url: '/buyers_sp/index',
		    params: Ext.Object.merge(me.getParams(), {client: client, authenticity_token: window._token}),

		    success: function(xhr) {
		        var res = Ext.JSON.decode(xhr.responseText);
		        
		        res.forEach(
		        	function(spv){
		        		if(spv !== null) {
		        			cmp=Ext.getCmp('sp_'+spv.sp_tp);
		        			cmp.setValue(spv.value);
		        		}
		        	}
		        );
		        arg.success();
		    },
		    failure: arg.failure
		});
	},

	/**
	 * Очистить поля
	 */
	clear: function() {
		me = this;
		
		me.spIds.forEach(function(id){
			if(el = Ext.getCmp('sp_'+id))
				el.setValue(null);
		});
	},
	
	/**
	 * Сохранить значения
	 */
	save: function(client, arg) {
		me = this;
		arg = me.prepareArg(arg);
		
		buyer_spv=[];
		me.spIds.forEach(function(id){
			if(el = Ext.getCmp('sp_'+id))
				buyer_spv.push({sp_tp: id, value: el.getValue()});
		});
		
		data={
			client: client,
			buyer_spv: buyer_spv
		};

		Ext.Ajax.request({
		    url: '/buyers_sp/create',
		    params: {authenticity_token: window._token},
			jsonData: data,
		    success: arg.success,
		    failure: arg.failure
		});
		
	},

	/**
     * @private
     */
    prepareArg: function(arg) {
    	arg.success = arg.success || Ext.emptyFn;
		arg.failure = arg.failure || Ext.emptyFn;
		return arg;
    },

	/**
     * @private
     * Представить массив spIds в виде понятном для rails
     */
    getParams: function() {
    	var me = this;		
		return typeof me.spIds !== 'undefined' ? {'sp_ids[]': me.spIds} : {};
    },

	/**
     * @private
     */
    createTextField: function(id, name, itemsCfg) {
    	return Ext.create('Ext.form.field.Text',
				Ext.Object.merge({
					id: 'sp_' + id,
					fieldLabel: name
				}, itemsCfg
				)
			);
	},

	/**
     * @private
     */ 
	cretaComboBoxField: function(id, name, sp_values, itemsCfg) {
		var store = Ext.create('Ext.data.Store', {
			model: 'app.model.valueModel',
			data: sp_values
		});
		
		return Ext.create('Ext.form.field.ComboBox',
				Ext.Object.merge({
					id: 'sp_'+id,
					fieldLabel: name,
					store: store,
					queryMode: 'local',
					displayField: 'name',
					valueField: 'id'
				}, itemsCfg        		
				)
			);
	}
});