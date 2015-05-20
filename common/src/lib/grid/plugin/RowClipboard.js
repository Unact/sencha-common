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
					data = record.get(columns[j].dataIndex);
				}
			} else {
				// Try to access the view node.
				viewNode = view.getNodeByRecord(record);
				// If we could not, it's because it's outside of the rendered block - recreate it.
				if (!viewNode) {
					viewNode = Ext.fly(view.createRowElement(record, rowIdx));
				}
				
				for(j = 0; j<columns.length; j++){
					cell = viewNode.down(cellContext.column.getCellInnerSelector());
					data = cell.dom.innerHTML;
					if (isText) {
						data = Ext.util.Format.stripTags(data);
					}
				}
			}

			row.push(data);
			
			if (erase && dataIndex) {
				record.set(dataIndex, null);
			}
		}
		
		return Ext.util.TSV.encode(ret);
	},

	getRows : function(format, erase) {
		var cmp = this.getCmp(), selModel = cmp.getSelectionModel(), ret = [], dataIndex, lastRecord, record, row;

		selModel.getSelected().eachCell(function(cellContext) {
			record = cellContext.record;
			if (lastRecord !== record) {
				lastRecord = record;
				ret.push( row = {
					model : record.self,
					fields : []
				});
			}

			dataIndex = cellContext.column.dataIndex;

			row.fields.push({
				name : dataIndex,
				value : record.data[dataIndex]
			});

			if (erase && dataIndex) {
				record.set(dataIndex, null);
			}
		});

		return ret;
	},

	getTextData : function(format, erase) {
		return this.getCellData(format, erase);
	},

	putRowData : function(data, format) {
		var values = Ext.util.TSV.decode(data),
			row,
			recCount = values.length,
			colCount = recCount ? values[0].length : 0,
			sourceRowIdx,
			sourceColIdx,
			view = this.getCmp().getView(),
			maxRowIdx = view.dataSource.getCount() - 1,
			maxColIdx = view.getVisibleColumnManager().getColumns().length - 1,
			navModel = view.getNavigationModel(),
			destination = new Ext.grid.CellContext(view).setPosition(0, 0),
			dataIndex,
			destinationStartColumn = destination.colIdx,
			dataObject = {};
		
		for ( sourceRowIdx = 0; sourceRowIdx < recCount; sourceRowIdx++) {
			row = values[sourceRowIdx];
			
			// Collect new values in dataObject
			for ( sourceColIdx = 0; sourceColIdx < colCount; sourceColIdx++) {
				dataIndex = destination.column.dataIndex;
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
				// If we are at the end of the destination row, break the column loop.
				if (destination.colIdx === maxColIdx) {
					break;
				}
				destination.setColumn(destination.colIdx + 1);
			}
		
			// Update the record in one go.
			destination.record.set(dataObject);
			
			if(destination.rowIdx != recCount-1){
				if (destination.rowIdx > maxRowIdx) {
					store.insert(rowIdx, {});
				}
				// Jump to next row in destination
				destination.setPosition(destination.rowIdx + 1, destinationStartColumn);
			}
		}
	},

	putTextData : function(data, format) {
		this.putRowData(data, format);
	}
});
