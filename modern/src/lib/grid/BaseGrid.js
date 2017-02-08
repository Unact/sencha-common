Ext.define('Ext.modern.lib.grid.BaseGrid', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.basegrid',

    requires: [
        'Ext.modern.lib.shared.Toolbar'
    ],

    config: {
        bufferSize: 100,
        hideTitleBar: true,
        plugins: [
            'columnresizing'
        ],
        masked: {

        }
    },



    constructor: function(currentConfig){
        var initialConfig = this.config;
        var config = {};
        var toolbarConfig;

        config.suffix = initialConfig.suffix || this.xtype;
        config.enableDeleteDialog = initialConfig.enableDeleteDialog;
        //Base config
        if (initialConfig.hideTitleBar){
            config.titleBar = {
                hidden: true
            }
        }

        //Toolbar config
        toolbarConfig = {
            xtype: 'sharedtoolbar',
            docked: 'top',
            beforeButtons: initialConfig.beforeButtons,
            afterButtons: initialConfig.afterButtons,

            disableDelete: initialConfig.disableDelete,
            disableAdd: initialConfig.disableAdd,
            disableSave: initialConfig.disableSave,
            disableRefresh: initialConfig.disableRefresh,

            suffix: config.suffix
        };
        config.items = !initialConfig.items ? [] : initialConfig.items;
        toolbarConfig.enabledButtons = initialConfig.enabledButtons;
        config.items.push(toolbarConfig);

        //New config
        Ext.apply(currentConfig, config);
        this.callParent(arguments);
    },


    //Иначе появляется маска загрузки
    onBeforeLoad: function(){
    },

    scrollToRecord: function(record){
        this.callParent(arguments);
        this.select(record);
    }
});
