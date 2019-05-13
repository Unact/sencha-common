Ext.define('Ext.lib.grid.column.ComboColumn', {
    extend : 'Ext.grid.column.Column',
    alias : 'widget.combocolumn',

    requires: [
        'Ext.lib.form.field.ComboColumnField',
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

    /**
     * @param {Object} config Config object.
     * store - хранилище или идентификатор или полное имя класса
     * field - настройки поля
     *
     * onlyRenderer - не создавать элемент для редактирования
     * primaryKey - наименование поля первичного ключа. по умолчанию 'id'
     * primaryValue - наименование поля, хранящего отображаемое значение. по умолчанию 'name'
     *
     * В модель таблицы при ее создании добавляется вычисляемое поле,
     * хранящее значение, которое надо отобразить.
     *
     * Если для поля не задано хранилище, то будет создано новое связанное
     * с хранилищем колонки
     */
    constructor: function(config){
        var me = this,
            fieldConfig = {},
            model, modelFields, fieldName,
            renderer;

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

        function renderer(v, metaData, rec){
            var record = me.store.findRecord('id', v);
            if (config.colorField && record) {
                metaData.style = "color: " + record.get(config.colorField) + ";";
            };
            return rec.get(me.fieldName);
        };

        me.renderer = config.renderer || renderer;

        me.getSortParam = function(){
            return me.fieldName;
        };

        if(!config.onlyRenderer){
            if(me.width){
                fieldConfig.width = me.width - 4;
            }
            Ext.applyIf(fieldConfig, config.field);
            Ext.applyIf(fieldConfig, {
                queryMode: 'local',
                displayField: me.primaryValue,
                valueField: me.primaryKey,
                column: me,
                name: me.dataIndex,
                triggerAction: 'all',
                xtype: 'combocolumnfield',
                selectOnFocus: true
            });

            if(!fieldConfig.store) {
                if (fieldConfig.bind && !fieldConfig.bind.store){
                    fieldConfig.bind.store = {
                        source: me.store
                    };
                } else if(!fieldConfig.bind) {
                    fieldConfig.store = {
                        type: 'chained',
                        source: me.store
                    };
                }
            }

            me.fieldConfig = fieldConfig;
            me.field = Ext.create('Ext.lib.form.field.ComboColumnField', fieldConfig);
        }
    },

    getStore: function(){
        return this.store;
    },

    setStore: function(store) {
        var me = this,
            initConfig = me.getInitialConfig();

        me.store = store;
        if(me.field &&
            !(
                initConfig.field &&
                (initConfig.field.store || (initConfig.field.bind && initConfig.field.bind.store))
            )){
            me.field.bindStore(Ext.create('Ext.data.ChainedStore', {
                source: store
            }), false, true);
        }
    },

    // эта функция при привязке стора к колонке
    addPrimaryValueField: function(model){
        var me = this;
        var field = null;
        var convertFunction = function(v, rec) {
            var matching = null;
            var data = me.getStore().snapshot || me.getStore().data;
            var foreignKey = rec.get(me.dataIndex);

            data.each(function(record) {
                if (record.get(me.primaryKey) == foreignKey) {
                    matching = record.get(me.primaryValue);
                }
                return matching == null;
            });
            return matching || (foreignKey != null ? (v || null) : "");
        };

        model.getFields().forEach(function(fieldFromFrid){
            if(fieldFromFrid.name==me.fieldName){
                field = fieldFromFrid;
            }
            return field;
        });

        if(!field){
            model.addFields([{
                name: me.fieldName,
                convert: convertFunction,
                depends: [me.dataIndex],
                persist: false
            }]);
        } else if (!field.depends) {
            field.convert = convertFunction;
            field.depends = [me.dataIndex];

            model.replaceFields([field]);
        }
    }
});
