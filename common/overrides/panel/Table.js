Ext.define('Ext.overrides.panel.Table', {
    override: 'Ext.panel.Table',

    statics: {
        SPECIAL_COLUMN_XTYPES: ['combocolumn', 'multifieldcolumn', 'windowcolumn', 'treepickercolumn']
    },

    setStore: function(){
        this.callParent(arguments);
        this.initSpecialColumns();
    },

    initSpecialColumns: function(){
        var model = this.store.getModel();

        if (model) {
            this.columns.forEach(function(column) {
                if (Ext.panel.Table.SPECIAL_COLUMN_XTYPES.indexOf(column.xtype) !== -1) {
                    column.addPrimaryValueField(model);
                }
                return true;
            });
        }
    },

    applyState: function(state) {
        if (state) {
            this.headerCt.applyColumnsState(this.buildColumnHash(state.columns), null);
        }
    }
});
