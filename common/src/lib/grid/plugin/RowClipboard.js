Ext.define('Ext.lib.grid.plugin.RowClipboard', {
	extend : 'Ext.plugin.AbstractClipboard',
	alias : 'plugin.rowclipboard',

	requires : ['Ext.util.Format', 'Ext.util.TSV'],

	formats : {
		cell : {
			get : 'getRows'
		},
		html : {
			get : 'getRowData'
		},
		raw : {
			get : 'getRowData'
		}
	},
	
	privates: {
		finishInit: function(comp){
			var me = this,
				toolbar = comp.down('toolbar[dock="' + (comp.buttonsDock ? comp.buttonsDock : 'top') + '"]');
			
			if(Ext.browser.is('Safari')){
				toolbar.add({
					xtype : 'textarea',
					width : 50,
					fieldStyle : "min-height:20px; height:20px",
					listeners: {
						afterrender: me.createBufferTextArea,
						scope: me
					}
				});
			} else {
				me.callParent(arguments);
			}
		}
	},
	
	createBufferTextArea: function(cmp) {
		var me = this,
			areaEl = document.getElementById(cmp.getInputId());
		
		areaEl.onclick = function(){
			areaEl.value = ' ';
			areaEl.select();
		};
		areaEl.oncopy = function(event){
			event.clipboardData.setData('text', me.getRowData('text', false));
			event.preventDefault();
		};
		areaEl.onpaste = function(event){
			me.doPaste('text', event.clipboardData.getData('text'));
			event.preventDefault();
		};
	},

	getRowData : function(format, erase) {
		var cmp = this.getCmp(),
			selModel = cmp.getSelectionModel(),
			selected = selModel.getSelection(),
			store = cmp.getStore(),
			ret = [],
			isRaw = format === 'raw',
			isText = format === 'text',
			viewNode,
			cell, data, record, row,
			view = cmp.getView(),
			columns = view.getVisibleColumnManager().getColumns(),
			i, j;
		
		for(i = 0; i<selected.length; i++){
			record = selected[i];
			rowIdx = store.indexOf(record);
			row = [];
			if (isRaw) {
				for(j = 0; j<columns.length; j++){
					row.push(record.get(columns[j].dataIndex));
				}
			} else {
				// Try to access the view node.
				viewNode = view.getNodeByRecord(record);
				// If we could not, it's because it's outside of the rendered block - recreate it.
				if (!viewNode) {
					viewNode = Ext.fly(view.createRowElement(record, rowIdx));
				} else {
					viewNode = Ext.fly(viewNode);
				}
				
				for(j = 0; j<columns.length; j++){
					cell = viewNode.down(columns[j].getCellInnerSelector());
					data = cell.dom.innerHTML;
					if (isText) {
						data = Ext.util.Format.stripTags(data);
					}
					if(data && data.length>0 && data.trim()=='&nbsp;'){
						data = "";
					}
					
					row.push(data);
				}
			}

			ret.push(row);
			
			if (erase && dataIndex) {
				record.set(dataIndex, null);
			}
		}
		
		return Ext.util.TSV.encode(ret);
	},

	getRows : function(format, erase) {
		var cmp = this.getCmp(),
			selModel = cmp.getSelectionModel(),
			ret = [],
			selected = selModel.getSelection(),
			view = cmp.getView(),
			columns = view.getVisibleColumnManager().getColumns(),
			dataIndex, lastRecord, record, row,
			i, j;
		
		for(i = 0; i<selected.length; i++){
			record = selected[i];
			
			ret.push( row = {
				model : record.self,
				fields : []
			});
			dataIndex = cellContext.column.dataIndex;

			row.fields.push({
				name : dataIndex,
				value : record.data[dataIndex]
			});

			if (erase && dataIndex) {
				record.set(dataIndex, null);
			}
		}

		return ret;
	},

	getTextData : function(format, erase) {
		return this.getRowData(format, erase);
	},

	putRowData : function(data, format) {
		var values = Ext.util.TSV.decode(data),
			row,
			recCount = values.length,
			colCount = recCount ? values[0].length : 0,
			sourceRowIdx,
			sourceColIdx,
			cmp = this.getCmp(),
			view = this.getCmp().getView(),
			columns = view.getVisibleColumnManager().getColumns(),
			store = cmp.getStore(),
			dataIndex,
			dataObject,
			controller = cmp.getController(),
			vm = cmp.getViewModel(),
			sm = cmp.getSelectionModel(),
			masterRecord,
			dataInitializator;
		
		sm.deselectAll();
		
		if(controller){
			if(controller.masterGrid){
				masterRecord = controller.masterGrid.getViewModel().get('masterRecord');
			}
			if(controller.beforeAdd && (typeof controller.beforeAdd === "function")){
				dataInitializator = controller.beforeAdd;
			}
		}
		for ( sourceRowIdx = recCount-1; sourceRowIdx >= 0; sourceRowIdx--) {
			dataObject = dataInitializator ? dataInitializator.call(controller, masterRecord) : {};
			
			row = values[sourceRowIdx];
			
			// Collect new values in dataObject
			for ( sourceColIdx = 0; sourceColIdx < colCount && sourceColIdx < columns.length; sourceColIdx++) {
				dataIndex = columns[sourceColIdx].dataIndex;
				if (dataIndex) {
					switch (format) {
					// Raw field values
					case 'raw':
						dataObject[dataIndex] = row[sourceColIdx];
						break;

					// Textual data with HTML tags stripped
					case 'text':
						dataObject[dataIndex] = row[sourceColIdx];
						break;

					// innerHTML from the cell inner
					case 'html':
						break;
					}
				}
			}
			records = store.insert(0, dataObject);
			sm.select(records);
		}
	},

	putTextData : function(data, format) {
		this.putRowData(data, format);
	}
});
