Ext.define('Ext.modern.lib.grid.column.ValueColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.valuecolumn',

    requires: [
        'Ext.data.ChainedStore'
    ],

    /**
     * @param {Object} config Config object.
     * store - хранилище или идентификатор или полное имя класса
     * field - настройки поля
     *
     * primaryKey - наименование поля первичного ключа. по умолчанию 'id'
     * primaryValue - наименование поля, хранящего отображаемое значение. по умолчанию 'name'
     *
     * Если для поля не задано хранилище, то будет создано новое связанное
     * с хранилищем колонки
     */
    constructor: function(config){
        var dataIndex = config.dataIndex;
        var renderer;

        this.primaryKey = config.primaryKey || 'id';
        this.primaryValue = config.primaryValue || 'name';
        this.fieldName = ((dataIndex.indexOf('_id') === dataIndex.length - 3) ?
            dataIndex.substr(0, dataIndex.length - 3) : dataIndex) + '_' + this.primaryValue;

        if(config.store){
            if(!config.store.isStore){
                this.store = Ext.data.StoreManager.lookup(config.store);
                if(this.store==null){
                    this.store = Ext.create(config.store);
                }
            } else {
                this.store = config.store;
            }
        } else {
            this.store = Ext.create('Ext.data.Store', {
                fields: [this.primaryKey, this.primaryValue],
                proxy: { type: 'memory' }
            });
        }

        renderer = function(v, rec) {
            var storeRecord = this.store.findExactRecord(this.primaryKey, v);
            return storeRecord ? storeRecord.get(this.primaryValue) : "";
        }
        this.renderer = config.renderer || renderer;
        config.renderer = this.renderer;

        this.getSortParam = function(){
            return this.fieldName;
        };

        this.callParent(arguments);
    },


    getStore: function(){
        return this.store;
    },

    setStore: function(store){
        var initConfig = this.getInitialConfig();

        this.store = store;
        if(this.field &&
            !(
                initConfig.field &&
                (initConfig.field.store || (initConfig.field.bind && initConfig.field.bind.store))
            )
        ){
            this.field.bindStore(Ext.create('Ext.data.ChainedStore', {
                source: store
            }), false, true);
        }
    }
});
