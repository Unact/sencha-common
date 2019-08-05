Ext.define('Ext.lib.grid.column.ChoiceColumn', {
    extend: 'Ext.grid.column.Column',

    requires: [
        'Ext.data.ChainedStore'
    ],

    defineFieldName: function(newTail) {
        var oldTail = '_id';
        var len = oldTail.length;

        if (this.dataIndex.substr(this.dataIndex.length - len, len) === oldTail) {
            return this.dataIndex.substr(0, this.dataIndex.length - len) + '_' + newTail;
        } else {
            return this.dataIndex + '_' + newTail;
        }
    },

    getStore: function() {
        return this.store;
    },

    setStore: function(store) {
        var me = this;
        var initConfig = me.getInitialConfig();

        me.store = store;

        if(me.field &&
            !(
                initConfig.field &&
                (initConfig.field.store || (initConfig.field.bind && initConfig.field.bind.store))
            )) {
                if (store.isTreeStore) {
                    me.field.bindStore(store);
                } else {
                    me.field.bindStore(Ext.create('Ext.data.ChainedStore', {
                        source: store
                    }), false, true);
                }
        }
    },

    convertFunction: function(v, rec) {
        var me = this;
        var store = me.getStore();
        var foreignKey = rec.get(me.dataIndex);
        var matchingRec = store.isTreeStore ?
            store.findNode(me.primaryKey, foreignKey) :
            store.findExactRecord(me.primaryKey, foreignKey);
        var matching = matchingRec ? matchingRec.get(me.primaryValue) : null;;

        return matching || (foreignKey != null ? (v || null) : "");
    },

    columnRenderer: function(v, metaData, rec) {
        var me = this;
        var storeRecord = me.store.findExactRecord('id', v);
        var initConfig = me.getInitialConfig();

        if (initConfig.storeColorField && storeRecord) {
            metaData.style = "color: " + storeRecord.get(initConfig.storeColorField) + ";";
        }

        if (initConfig.colorField) {
            metaData.style = "color: " + rec.get(initConfig.colorField) + ";";
        };

        return rec.get(me.fieldName);
    },

    constructor: function(config) {
        var me = this;
        var fieldConfig = {};

        me.callParent(arguments);

        me.primaryKey = config.primaryKey || 'id';
        me.primaryValue = config.primaryValue || 'name';

        me.fieldName = this.defineFieldName(me.primaryValue);

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

        me.renderer = config.renderer || function(v, metaData, rec) {
            return me.columnRenderer(v, metaData, rec);
        }

        me.getSortParam = function() {
            return me.fieldName;
        };

        if (!config.onlyRenderer) {
            if(me.width) {
                fieldConfig.width = me.width - 4;
            }
            Ext.applyIf(fieldConfig, config.field);
            Ext.applyIf(fieldConfig, me.defaultFieldConfig());

            if(!fieldConfig.store) {
                if (fieldConfig.bind && !fieldConfig.bind.store){
                    fieldConfig.bind.store = {
                        source: me.store
                    };
                } else if(!fieldConfig.bind) {
                    if (me.store.isTreeStore) {
                        fieldConfig.store = me.store;
                    } else {
                        fieldConfig.store = {
                            type: 'chained',
                            source: me.store
                        };
                    }
                }
            }

            me.fieldConfig = fieldConfig;
            me.field = Ext.create(fieldConfig);
        }
    },

    addPrimaryValueField: function(model){
        var me = this;
        var field = null;
        var convertFunction = function(v, rec) {
            return me.convertFunction(v, rec);
        }

        model.getFields().forEach(function(fieldFromGrid){
            if(fieldFromGrid.name==me.fieldName){
                field = fieldFromGrid;
            }
            return field;
        });

        if(!field){
            model.addFields([{
                name: me.fieldName,
                scope: me,
                convert: convertFunction,
                depends: [me.dataIndex],
                persist: false
            }]);
        } else if (!field.depends) {
            field.scope = me;
            field.convert = convertFunction;
            field.depends = [me.dataIndex];

            model.replaceFields([field]);
        }
    }
});
