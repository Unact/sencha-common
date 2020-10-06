Ext.define('Ext.lib.bigrid.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.bigrid',

    requires: [
        'Ext.lib.bigrid.ViewModel'
    ],

    spSetsToChange: [],

    addRecordSpSetsToChange: function(record) {
        const keys = Object.getOwnPropertyNames(record.data);
        const biGroupKeys = keys.filter(key => key.includes('bi_group'));
        const spSetsData = biGroupKeys.reduce((acc, key) => {
            const value = record.get(key);

            if (Ext.isNumeric(value)) {
                acc[key] = value;
            }

            return acc;
        }, {});

        biGroupKeys.forEach(key => delete record.data[key]);
        this.spSetsToChange.push({
            internalId: record.internalId,
            data: spSetsData
        });
    },

    removeRecordSpSetsToChange: function(record) {
        const foundRecord = this.spSetsToChange.find(spSet => spSet.internalId === record.internalId);
        this.spSetsToChange = this.spSetsToChange.filter(spSet => spSet.internalId !== record.internalId);

        return foundRecord;
    },

    init: function(view) {
        this.callParent(arguments);

        this.autoRefreshingTable = true;

        const spValuesStore = this.getStore('spValues');
        this.loadDictionaries([spValuesStore], () => {
            const biGroupsIds = spValuesStore.getData().items.
                map(rec => rec.get('bi_group')).
                filter((value, index, self) => self.indexOf(value) === index)
            const biGroups = biGroupsIds.map(id => {
                return {
                    id: id,
                    name: spValuesStore.findExactRecord('bi_group', id).get('bi_name')
                }
            }).sort((a, b) => a.name > b.name ? 1 : -1);

            const oldColumns = view.columns.map((column) => {
                return column.cloneConfig();
            });

            const newColumns = biGroups.map(val => {
                const dataIndex = 'bi_group' + val.id;

                return {
                    text: val.name,
                    dataIndex: dataIndex,
                    width: 150,
                    xtype: 'combocolumn',
                    field: {
                        forceSelection: true,
                        listConfig: {
                            getInnerTpl: function(displayField){
                                return '{["&nbsp;".repeat(2*values.tlev)]}{' + displayField + '}';
                            },
                        },
                        store: Ext.create('Ext.data.ChainedStore', {
                            source: spValuesStore,
                            filters: [{
                                property: 'bi_group',
                                value: val.id
                            }]
                        })
                    },
                    bind: {
                        store: '{spValues}'
                    }
                };
            });

            view.view.grid.reconfigure(null, oldColumns.concat(newColumns));
            view.view.grid.getColumns().filter(column => column.dataIndex.includes('bi_group')).forEach(column => {
                const model = view.getStore().model;

                model.addFields([{
                    name: column.dataIndex,
                    persist: true
                }]);
                column.addPrimaryValueField(model);
            });
        });
    },

    afterRefresh: function() {
        const view = this.getView();
        const store = view.getStore();
        const records = store.getData().items;
        const recordSpSetsStore = this.getStore('recordSpSets');

        if (records.length > 0) {
            recordSpSetsStore.getProxy().setExtraParams({
                'q[id_in][]': records.map(rec => rec.get('id')),
                'q[for_model]': view.modelName
            });

            this.loadDictionaries([recordSpSetsStore], () => {
                records.forEach(record => {
                    recordSpSetsStore.getData().items.
                        filter(spSetRec => spSetRec.get('id')[0] === record.get('id')).
                        forEach(spSetRec => {
                            const groupProp = 'bi_group' + spSetRec.get('id')[2];

                            record.set(groupProp, spSetRec.get('spv_id'));
                            record.set(groupProp + '_name', spSetRec.get('spv_name'));
                        });
                });
                store.commitChanges();
                view.view.refresh();
            });
        }
    },

    onSave: function() {
        const store = this.getView().getStore();

        store.getNewRecords().forEach(this.addRecordSpSetsToChange, this);
        store.getUpdatedRecords().forEach(this.addRecordSpSetsToChange, this);
        store.getRemovedRecords().forEach(this.addRecordSpSetsToChange, this);

        this.callParent(arguments);
    },

    afterSave: function(batch) {
        const view = this.getView();
        const biStore = this.getStore('bi');

        batch.operations.forEach(operation => {
            const record = operation.getRecords()[0];
            const spSetsInfo = this.removeRecordSpSetsToChange(record);
            const spSetsData = spSetsInfo.data;

            record.set(spSetsData);

            if (!operation.exception) {
                record.commit();

                if (Object.keys(spSetsData).length > 0) {
                    biStore.add({
                        sp_sets_data: spSetsInfo,
                        model_name: view.modelName,
                        record_id: record.get('id'),
                        only_delete: operation.request.getAction() === 'destroy'
                    });
                }
            }
        });

        if (biStore.hasChanges()) {
            Ext.GlobalEvents.fireEvent('beginserveroperation');
            biStore.sync({
                callback: batch => {
                    Ext.GlobalEvents.fireEvent('endserveroperation');

                    biStore.loadData([]);

                    if (batch.exceptions.length > 0) {
                        this.onError(batch.exceptions[0].getError().response);
                        batch.operations.forEach(operation => {
                            if (operation.exception) {
                                const record = operation.getRecords()[0];
                                const spSetsData = record.get('sp_sets_data');
                                const storeRecord = view.getStore().getData().items.
                                    find(rec => rec.internalId == spSetsData.internalId);

                                if (storeRecord) {
                                    storeRecord.set(spSetsData.data);
                                }
                            }
                        });
                    } else {
                        this.onRefresh();
                    }
                }
            });
        } else {
            this.onRefresh();
        }
    }
});
