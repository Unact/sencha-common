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
    },

    getMasterRecord: function() {
        if (this.masterGrid) {
            return this.masterGrid.getViewModel().get('masterRecord');
        } else {
            return null;
        }
    },

    hasMaster: function() {
        return Boolean(this.masterGrid);
    },

    onChangeMaster: function() {
        var vm = this.getViewModel();
        var view = this.getView();
        var store = view.getStore();
        var records = vm.get('copiedRecords');

        if (records === null) {
            var selection = view.getSelectionModel().getSelection();

            vm.set('copiedRecords', selection);
            store.remove(selection);
        } else {
            var masterId = vm.get('selectedMaster').get('id');
            var storeRecords = store.add(records);
            storeRecords.map(rec => rec.set(this.masterProperty, masterId));

            vm.set('copiedRecords', null);
            view.getView().scrollToRecord(storeRecords[0]);
        }
    }
});
