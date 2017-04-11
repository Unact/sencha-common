Ext.define('Ext.lib.grid.plugin.RowClipboard', {
    extend: 'Ext.plugin.AbstractClipboard',
    alias: 'plugin.rowclipboard',

    requires: ['Ext.util.Format', 'Ext.util.TSV'],

    formats: {
        cell: {
            get: 'getRows'
        },
        html: {
            get: 'getRowData'
        },
        raw: {
            get: 'getRowData'
        }
    },

    config: {
        copyColumnHeaders: false,
        pasteInEditableOnly: false,
        skipTrimValues: false,
        likeSafari: true
    },

    enabledActions: ['copy', 'paste', 'cut'],

    /**
     * @property {Boolean/Object} insertPrimaryValue Производить ли замену в колонке с выпадающим списком
     * вставляемого (текстового) значения на первичный ключ.
     * Если передан объект, то ключ - название колонки, значение - применять ли заменую для конкретной колонки
     * по-умолчанию - fasle
     */
    insertPrimaryValue: false,

    privates: {
        finishInit: function(comp){
            var me = this;
            var toolbar;
            var binding;
            var i;

            if(Ext.browser.is('Safari') || me.getLikeSafari()){
                toolbar = comp.down('toolbar[dock="' + (comp.buttonsDock ? comp.buttonsDock : 'top') + '"]');

                if(!toolbar){
                    toolbar = comp.addDocked({
                        xtype: 'toolbar',
                        overflowHandler: 'scroller',
                        dock: 'top'
                    })[0];
                }

                toolbar.add({
                    xtype: 'textarea',
                    width: 350,
                    labelWidth: 290,
                    fieldLabel: 'Перед копированием-вставкой нажмите сюда',
                    fieldStyle: "min-height:20px; height:20px",
                    listeners: {
                        afterrender: me.createBufferTextArea,
                        scope: me
                    }
                });
            } else {
                binding = [];
                if(me.enabledActions.indexOf('cut')!=-1){
                    binding.push({
                        ctrl: true,
                        key: 'x',
                        fn: me.onCut,
                        scope: me
                    });
                }
                if(me.enabledActions.indexOf('copy')!=-1){
                    binding.push({
                        ctrl: true,
                        key: 'c',
                        fn: me.onCopy,
                        scope: me
                    });
                }
                if(me.enabledActions.indexOf('paste')!=-1){
                    binding.push({
                        ctrl: true,
                        key: 'v',
                        fn: me.onPaste,
                        scope: me
                    });
                }
                me.keyMap = new Ext.util.KeyMap({
                    target: comp.el,

                    binding: binding
                }); ++me.shared.counter;

                comp.on({
                    destroy: 'destroy',
                    scope: me
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

    getRowData: function(format, erase) {
        var me = this;
        var cmp = me.getCmp();
        var selModel = cmp.getSelectionModel();
        var store = cmp.getStore();
        var controller = cmp.getController();
        var selected = selModel.getSelection();
        var copyAll = selModel.getSelectionMode()!=='MULTI' || store.getCount()==selected.length;
        var ret = [];
        var isRaw = format === 'raw';
        var isText = format === 'text';
        var viewNode;
        var cell, data, record, row;
        var view = cmp.getView();
        var columns = view.getVisibleColumnManager().getColumns();
        var afterCellCopy;
        var i, j;

        if(me.copyColumnHeaders){
            row = [];
            for(j = 0; j<columns.length; j++){
                row.push(columns[j].text);
            }
            ret.push(row);
        }

        if (controller.afterCellCopy && (typeof controller.afterCellCopy === "function")) {
            afterCellCopy = controller.afterCellCopy;
        }

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

                    data =  afterCellCopy ? afterCellCopy(data) : data;

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

    afterCellCopy: function(data){
        return data;
    },

    getRows: function(format, erase) {
        var me = this;
        var cmp = me.getCmp();
        var selModel = cmp.getSelectionModel();
        var ret = [];
        var store = cmp.getStore();
        var selected = selModel.getSelection();
        var copyAll = selModel.getSelectionMode()!=='MULTI' || store.getCount()==selected.length;
        var dataIndex, record, row;
        var i, j;

        if(me.copyColumnHeaders){
            row = [];
            for(j = 0; j<columns.length; j++){
                row.push(columns[j].text);
            }
            ret.push(row);
        }

        selected =  copyAll ? store.getData().items : selected;

        for(i = 0; i<selected.length; i++){
            record = selected[i];

            ret.push( row = {
                model: record.self,
                fields: []
            });

            for(j = 0; j<columns.length; j++){
                dataIndex = columns[j].dataIndex;

                row.fields.push({
                    name: dataIndex,
                    value: record.data[dataIndex]
                });

                if (erase && dataIndex) {
                    record.set(dataIndex, null);
                }
            }
        }

        return ret;
    },

    getTextData: function(format, erase) {
        return this.getRowData(format, erase);
    },

    putRowData: function(data, format) {
        var me = this;
        var processedData = data.replace(/\"/g, '""').replace(/([^\t\r\n]*\"+[^\t\r\n]*)/g, '"$1"'); // удвоить кавычки, поместить в кавычки содержимое поля
        var raw_values = Ext.util.TSV.decode(processedData);
        var values = raw_values.filter(function (e) {  return !(e.length === 1 && e[0] === "");}); //по умолчанию пустые строки вставляются, но нам-то они не нужны
        var recCount = values.length;
        var colCount = recCount ? values[0].length : 0;
        var cmp = this.getCmp();
        var columns = cmp.getView().getVisibleColumnManager().getColumns();
        var store = cmp.getStore();
        var controller = cmp.getController();
        var sm = cmp.getSelectionModel();
        var records = [];
        var dataObjects = [];
        var row;
        var rowIdx;
        var sourceRowIdx;
        var sourceColIdx;
        var column;
        var dataIndex;
        var dataObject;
        var masterRecord;
        var dataInitializator;
        var insertInStore;
        var pasteComplete;
        var singleInsertPrimaryValue = Ext.isBoolean(me.insertPrimaryValue)

        sm.deselectAll();

        if(controller){
            if(controller.getMasterRecord && (typeof controller.getMasterRecord === "function")){
                masterRecord = controller.getMasterRecord();
            }
            if(controller.beforeAdd && (typeof controller.beforeAdd === "function")){
                dataInitializator = controller.beforeAdd;
            }

            if(controller.afterPaste && (typeof controller.afterPaste === "function")){
                pasteComplete = controller.afterPaste;
            }

            if (controller.insertValues && (typeof controller.insertValues === "function")) {
                insertInStore = controller.insertValues;
            }
        }
        for ( sourceRowIdx = recCount-1; sourceRowIdx >= 0; sourceRowIdx--) {
            dataObject = dataInitializator ? dataInitializator.call(controller, masterRecord) : {};

            if (!dataObject){
                break;
            }

            row = values[sourceRowIdx];

            // Collect new values in dataObject
            for ( sourceColIdx = 0, rowIdx = 0; sourceColIdx < colCount && sourceColIdx < columns.length; sourceColIdx++, rowIdx++) {
                if (columns[sourceColIdx].xtype == 'rownumberer'){
                    sourceColIdx++;
                    colCount++;
                }
                column = columns[sourceColIdx];

                dataIndex = column.dataIndex;
                if (!me.pasteInEditableOnly || column.editor || column.field) {
                    if(!me.skipTrimValues){
                        row[rowIdx] = row[rowIdx] ? row[rowIdx].trimRight() : null;
                    }


                    var isInsertPrimaryValue =
                        singleInsertPrimaryValue ? me.insertPrimaryValue : me.insertPrimaryValue[dataIndex]
                    if (column.xtype === 'combocolumn'){
                        var valueToFind = isInsertPrimaryValue ? column.primaryValue : (column.insertIndex || null);
                        if (valueToFind) {
                            var comboRecord = column.getStore().findExactRecord(valueToFind, row[rowIdx])
                            row[rowIdx] = comboRecord  ? comboRecord.get(column.primaryKey) : null;
                        }
                    }
                    if (dataIndex) {
                        switch (format) {
                        // Raw field values
                        case 'raw':
                            dataObject[dataIndex] = row[rowIdx];
                            break;

                        // Textual data with HTML tags stripped
                        case 'text':
                            dataObject[dataIndex] = row[rowIdx];
                            break;

                        // innerHTML from the cell inner
                        case 'html':
                            break;
                        }
                    }
                } else {
                    dataObject[dataIndex] = dataObject[dataIndex] || null;
                    rowIdx--;
                    colCount++;
                }
            }
            dataObjects.unshift(dataObject);
        }

        if (insertInStore) {
            insertInStore.call(controller, dataObjects);
        } else {
            records = store.insert(0, dataObjects);
            sm.select(0);
            if (pasteComplete) {
               pasteComplete.call(controller, records);
            }
        }
    },

    putTextData: function(data, format) {
        this.putRowData(data, format);
    }
});
