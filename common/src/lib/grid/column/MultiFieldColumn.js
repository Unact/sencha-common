Ext.define('Ext.lib.grid.column.MultiFieldColumn', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.multifieldcolumn',

	requires: ['Ext.lib.form.MultiFieldContainer'],

	listeners: {
		boxready: 'onBoxReady'
	},

	constructor: function(config){
		var me = this,
			fieldConfig = {},
			tpl = '';

		this.callParent(arguments);

		config.fields.forEach(function(el, i, array){
			if (!el.tpl) {
				tpl += '{';	
				if (el.xtype == 'combobox') {
					tpl += el.dataIndex + '_' + el.displayField;
				} else {
					tpl += el.dataIndex;
				}
				tpl += '}';
			} else {
				tpl += el.tpl;
			}
			
			if (i != array.length - 1) {
					tpl += '</br>';
			}
			tpl += '</br>';	
		});

        fieldConfig.fields = config.fields;
        me.field = Ext.create('Ext.lib.form.MultiFieldContainer', fieldConfig);
        me.tpl = tpl;
	},

	defaultRenderer: function(value, meta, record) {
        var me = this,
        	data = Ext.apply({}, record.data, record.getAssociatedData()),
        	modified = false;
      
        me.field.items.items.forEach(function(el, i, array){
        	modified =  modified ? modified : record.isModified(el.dataIndex)
        });

        if (modified) {
        	meta.tdCls += 'x-grid-dirty-cell';
        }
        return this.tpl.apply(data);
    },

    onBoxReady: function(){
    	this.ownerCt.ownerCt.on('edit', this.updateFieldValues);
    },

    updateFieldValues: function(editor, ctx, eOpts){
		var me = this,
			record = ctx.record,
			column = ctx.column;

		if (column.xtype == 'multifieldcolumn'){
			column.field.items.items.forEach(function(el, i, array){
				if (el.value != record.get(el.dataIndex)){
					record.set(el.dataIndex, el.value);	
				}
			});
		}
		ctx.grid.getView().refresh();
	},

	addPrimaryValueField: function(model){
		var me = this,
			field,
			fieldsToAdd = [],
			viewModel = me.ownerCt.ownerCt.getViewModel();

		me.field.items.items.forEach(function(el, i, array){
			if (el.xtype == 'combobox'){
				el.viewModel = viewModel;
				el.getBind(); // Требуется, чтобы стор привязался к комбо, иначе пустой

				fieldsToAdd.push({	
					name: el.dataIndex + '_' + el.displayField,
					convert: function(v, rec) {
						var matching = null,
							field,
							convertField,
							data,
							foreignKey,
							modelField = this;

						me.field.items.items.forEach(function(element, i, array){
							if (modelField.depends[0] == element.dataIndex){
								convertField = element;
							}
						});

						data = convertField.store.snapshot || convertField.store.data,
						foreignKey = rec.get(convertField.dataIndex);

						data.each(function(record) {
							if (record.get(convertField.valueField) == foreignKey) {
								matching = record.get(convertField.displayField);
							}
							return matching == null;
						});
						return matching || "";
					},
					depends: [el.dataIndex],
					persist: false
				});
			}
		});

		model.addFields(fieldsToAdd);
	}
});