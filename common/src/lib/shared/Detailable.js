Ext.define('Ext.lib.shared.Detailable', {
    mixinId: 'detailable',
   
    /**
     * Возвращает true, если надо задизейблить таблицу (грид или дерево)
     * @param {Ext.data.Model} master - Выбранный мастер, если мастера нет, то null
     * @return {Boolean}
     */
    isDisabledView: function(master) {
        if(master == null) {
            return true;
        }
        return master.phantom;
    },
    
    applyDetailGrids: function(detailGrids){
        var me = this;
        
        me.detailGrids = detailGrids;
        
        me.detailGrids.forEach(function(detail){
            detail.getController().masterGrid = me.getView();
        });
    },

    findDetail: function(xtype){
        var me = this;

        if (me.detailGrids.length > 0){
            return me.detailGrids.find(function(detail){
                return detail.xtype === xtype;
            });
        }
    }
});
