Ext.define('Ext.lib.xlsgrid.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.xlsgrid',

    idColumn: null,

    getRequestOptions: Ext.emptyFn,

    repeated: [],
    invalid: [],

    onViewReady: function() {
        var me = this;
        var view = me.getView();

        view.getColumns().forEach(function(column) {
            if (column.identificator) {
                me.idColumn = column.dataIndex;
            }
        });

        view.findPlugin('cellediting').on({
            validateedit: 'onValidateEdit',
            scope: me
        });
    },

    getEditableColumns: function() {
        return this.getView().getColumns().filter(function(column) {
            return (column.editor || column.field);
        }).map(function(column) {
            return column.dataIndex;
        });
    },

    onSave: function() {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var gridData = [];
        var errorText = me.getValidationText();
        var saveOptions;
        var columns = me.getEditableColumns();

        if (store.count() === 0) {
            return;
        }

        view.setLoading(true);

        if (errorText.length) {
            Ext.Msg.alert('Ошибка!', errorText);
        } else {
            if (me.beforeSave && !me.beforeSave()) {
                return;
            }
            store.each(function(r) {
                var dataObject = {};
                columns.forEach(function(c) {
                    dataObject[c] = r.get(c);
                });
                gridData.push(dataObject);
            });

            saveOptions = me.getSaveOptions(gridData);
            saveOptions.callback = function(options, success, response) {
                view.setLoading(false);
                if (success) {
                    Ext.Msg.alert('Сообщение', 'Данные успешно сохранены')
                    store.commitChanges();
                }
            };
            Ext.Ajax.request(saveOptions);
        }
    },

    onClearButtonClick: function() {
        this.getView().getStore().loadData([]);
    },

    onRefresh: function() {
        var me = this;
        var store = me.getView().getStore();
        var ids = [];
        var storeRecords = [];

        if (store.count() === 0) {
            return;
        }

        store.each(function(r) {
            ids.push(r.get(me.idColumn));
            storeRecords.push(r.getData());
        });

        me.loadRemoteData(ids, function(receivedRecords) {
            me.mergeRecordArrays(receivedRecords, storeRecords).forEach(function(r) {
                store.each(function(model) {
                    if (r[me.idColumn] == model.get(me.idColumn)) {
                        Object.keys(r).forEach(function(key) {
                            model.set(key, r[key]);
                        });
                    }
                });
            });
        });
    },

    onValidateEdit: function(editor, context) {
        var me = this;
        var value = Number(context.value);

        if (context.field === me.idColumn) {
            if (context.value === '' || value === context.originalValue) {
                return false;
            } else {
                me.loadRemoteData([value], function(receivedRecords, receivedIds) {
                    var store = me.getView().getStore();
                    store.each(function(r) {
                        if (r.isModified(me.idColumn)) {
                            var model = store.findExactRecord(me.idColumn, value);
                            var record = me.mergeRecordArrays(receivedRecords, [model.getData()])[0];
                            if (receivedIds.length) {
                                Object.keys(record).forEach(function(key) {
                                    model.set(key, record[key]);
                                });
                                model.commit();
                            } else {
                                store.remove(model);
                            }
                            return false;
                        }
                    });
                });
            }
        }

        return true;
    },

    getValidationText: function() {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var messageLines = [];
        var repeated = [];

        store.each(function(r) {
            var validation = r.getValidation();
            var messages = [];
            r.getFields().forEach(function(field) {
                var validationMessage = validation.get(field.getName());
                if (validationMessage.length) {
                    messages.push(validationMessage);
                }
            });
            if (messages.length) {
                var id = r.get(me.idColumn);
                messageLines.push((id ? String(id) + ': ' : '') + messages.join(', '));
            }
        });

        store.each(function(outer) {
            var _values = function(model) {
                var columns = me.getEditableColumns();
                return columns.map(function(key) {return model.get(key); });
            };
            var outerValues = _values(outer);
            var found = store.findBy(function(inner) {
                var innerValues = _values(inner);
                return (outer.getId() !== inner.getId() &&
                    ((Ext.Array.equals(outerValues, innerValues) && !view.uniqueByIdentificator) ||
                    (outer.get(me.idColumn) === inner.get(me.idColumn) && view.uniqueByIdentificator))
                );
            });
            if (found > -1) {
                repeated.push(outer.get(me.idColumn));
            }
        });

        if (repeated.length) {
            messageLines.push('Найдены повторяющиеся строки: ' + Ext.Array.unique(repeated).join(','));
        }

        if (messageLines.length) {
            return messageLines.join('<br/>');
        } else {
            return '';
        }
    },

    showMessage: function() {
        var me = this;
        var msg = [];
        var idColumnText = Ext.Array.findBy(me.getView().getColumns(), function(item) {
            return item.dataIndex === me.idColumn;
        }).text;
        var addToMsg = function(items, reason) {
            if (items && items.length) {
                msg.push(reason + ' значения поля "' + idColumnText + '": ' +
                    Ext.Array.unique(items).join(', '));
            }
        };

        addToMsg(me.invalid, 'Несуществующие');
        addToMsg(me.repeated, 'Повторяющиеся');

        me.repeated = [];
        me.invalid = [];

        if (msg.length) {
            Ext.Msg.alert('Сообщение', msg.join('<br/>'));
        }
    },

    mergeRecordArrays: function(arr1, arr2) {
        var me = this;
        var fields = me.getView().getColumns().map(function(column) {return column.dataIndex;});
        var result = [];

        arr1.forEach(function(r1) {
            arr2.forEach(function(r2) {
                if (r1[me.idColumn] == r2[me.idColumn]) {
                    var resultRecord = {};
                    fields.forEach(function(field) {
                        resultRecord[field] = r1[field] || r2[field];
                    });
                    result.push(resultRecord);
                }
            });
        });

        return result;
    },

    loadRemoteData: function(records, callback) {
        var me = this;
        var view = me.getView();
        var store = view.getStore();
        var xlsRecords = typeof records[0] === "object"; // данные из поля XLS или список с id
        var ids = xlsRecords ?
            records.map(function(r) {
                return Number(r[me.idColumn]);
            }) : records;
        var requestOptions = me.getRequestOptions(ids);

        if (records.length) {
            view.setLoading(true);

            requestOptions.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            requestOptions.callback = function(options, success, response) {
                if (success) {
                    var receivedRecords = Ext.JSON.decode(response.responseText, true);
                    var receivedIds = receivedRecords.map(function(r) { return Number(r[me.idColumn]); });
                    me.invalid = me.invalid.concat(Ext.Array.difference(ids, receivedIds));
                    callback.call(this, receivedRecords, receivedIds);
                    me.showMessage();
                } else {
                    Ext.Msg.alert('Ошибка', response.responseText);
                }
                view.setLoading(false);
            };

            Ext.Ajax.request(requestOptions);
        } else {
            me.showMessage();
        }
    },

    unique: function(records) {
        var me = this;
        var view = me.getView();
        var uniqueById = view.uniqueByIdentificator;
        var store = view.getStore();
        var result = [];

        for (var i = records.length - 1; i >= 0; i--) {
            var rec = records[i];
            var found = Ext.Array.findBy(result, function(r) {
                return uniqueById ?
                    rec[me.idColumn] === r[me.idColumn] :
                    Ext.Array.equals(Ext.Object.getValues(rec), Ext.Object.getValues(r));
            });

            if (found !== null) {
                me.repeated.push(rec[me.idColumn]);
                continue;
            }

            found = store.findBy(function(r) {
                if (uniqueById) {
                    return rec[me.idColumn] == r.get(me.idColumn);
                } else {
                    for (var i in rec) {
                        var storeValue = r.get(i);
                        if (storeValue instanceof Date) {
                            storeValue = Ext.Date.format(storeValue, 'd.m.Y');
                        }
                        if (storeValue != rec[i]) {
                            return false;
                        }
                    }
                    return true;
                }
            });

            if (found > -1) {
                me.repeated.push(rec[me.idColumn]);
                continue;
            }

            result.splice(0, 0, rec);
        }

        return result;
    },

    extractRecordsFromXls: function(xls) {
        var me = this;
        var view = me.getView();
        var columns = view.getColumns();
        var rows = xls.split('\n');
        var records = [];
        var colSpecs = [];

        columns.forEach(function(column) {
            var columnIx = column.columnInXls;
            if (columnIx !== undefined) {
                colSpecs[columnIx] = {
                    dataIndex: column.dataIndex,
                    identificator: column.identificator ? true : false,
                    required: column.required ? true : false,
                    columnStore: column.xtype === 'combocolumn' ? column.store : null
                };
            }
        });

        rows.forEach(function(row) {
            var row = row.split('\t');
            var record = {};
            if (row.length) {
                var id;
                for (var i in colSpecs) {
                    var item = row[i] && row[i].length ? row[i] : null;
                    var columnStore = colSpecs[i].columnStore;

                    if (columnStore) {
                        var recordFromCombo = columnStore.findExactRecord('name', item);
                        item = recordFromCombo ? recordFromCombo.get('id') : null;
                    }

                    if ((colSpecs[i].required || colSpecs[i].identificator) && !item) {
                        return;
                    }

                    record[colSpecs[i].dataIndex] = item;
                }
                id = record[me.idColumn];
                if (Ext.Number.from(id, null) === null) {
                    me.invalid.push(id);
                } else {
                    records.push(record);
                }
            }
        });

        return me.unique(records);
    },

    onXlsChanged: function(field, xls) {
        var me = this;
        var records;

        if (!xls || !xls.length) {
            return;
        }

        field.reset();

        records = me.extractRecordsFromXls(xls);

        me.loadRemoteData(records, function(receivedRecords) {
            me.getView().getStore().add(me.mergeRecordArrays(records, receivedRecords));
        });
    }
});
