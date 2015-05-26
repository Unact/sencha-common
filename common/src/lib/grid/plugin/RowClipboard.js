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
	
	enabledActions: ['copy', 'paste', 'cut'],
	
	privates: {
		finishInit: function(comp){
			var me = this,
				toolbar,
				binding,
				i;
			
			if(Ext.browser.is('Safari')){
				toolbar = comp.down('toolbar[dock="' + (comp.buttonsDock ? comp.buttonsDock : 'top') + '"]');
				
				toolbar.add({
					xtype : 'textarea',
					width : 350,
					labelWidth: 290,
					fieldLabel: 'Перед копированием-вставкой нажмите сюда',
					fieldStyle : "min-height:20px; height:20px",
					listeners: {
						afterrender: me.createBufferTextArea,
						scope: me
					}
				});
			} else {
				binding = [];
				if(me.enabledActions.indexOf('cut')!=-1){
					binding.push({
						ctrl : true,
						key : 'x',
						fn : me.onCut,
						scope : me
					});
				}
				if(me.enabledActions.indexOf('copy')!=-1){
					binding.push({
						ctrl : true,
						key : 'c',
						fn : me.onCopy,
						scope : me
					});
				}
				if(me.enabledActions.indexOf('paste')!=-1){
					binding.push({
						ctrl : true,
						key : 'v',
						fn : me.onPaste,
						scope : me
					});
				}
				me.keyMap = new Ext.util.KeyMap({
					target : comp.el,

					binding : binding
				}); ++me.shared.counter;

				comp.on({
					destroy : 'destroy',
					scope : me
				});
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
		if(me.enabledActions.indexOf('copy')!=-1){
			areaEl.oncopy = function(event){
				event.clipboardData.setData('text', me.getRowData('text', false));
				event.preventDefault();
			};
		}
		if(me.enabledActions.indexOf('paste')!=-1){
			areaEl.onpaste = function(event){
				me.doPaste('text', event.clipboardData.getData('text'));
				event.preventDefault();
			};
		}
		if(me.enabledActions.indexOf('cut')!=-1){
			areaEl.oncut = function(event){
				event.clipboardData.setData('text', me.getRowData('text', true));
				event.preventDefault();
			};
		}
	},

	getRowData : function(format, erase) {
		var cmp = this.getCmp(),
			selModel = cmp.getSelectionModel(),
			store = cmp.getStore(),
			selected = selModel.getSelection(),
			copyAll = selModel.getSelectionMode()!=='MULTI' || store.getCount()==selected.length,
			ret = [],
			isRaw = format === 'raw',
			isText = format === 'text',
			viewNode,
			cell, data, record, row,
			view = cmp.getView(),
			columns = view.getVisibleColumnManager().getColumns(),
			i, j;
		
		selected =  copyAll ? store.getData().items : selected;
		
		for(i = 0; i<selected.length; i++){
			record = selected[i];
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
					viewNode = Ext.fly(view.createRowElement(record, copyAll ? i : store.indexOf(record)));
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
			store = cmp.getStore(),
			selected = selModel.getSelection(),
			copyAll = selModel.getSelectionMode()!=='MULTI' || store.getCount()==selected.length,
			dataIndex, record, row,
			i, j;
		
		selected =  copyAll ? store.getData().items : selected;
		
		for(i = 0; i<selected.length; i++){
			record = selected[i];
			
			ret.push( row = {
				model : record.self,
				fields : []
			});
			
			for(j = 0; j<columns.length; j++){
				dataIndex = columns[j].dataIndex;
				
				row.fields.push({
					name : dataIndex,
					value : record.data[dataIndex]
				});
				
				if (erase && dataIndex) {
					record.set(dataIndex, null);
				}
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