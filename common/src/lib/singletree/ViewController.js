Ext.define('Ext.lib.singletree.ViewController', {
    extend : 'Ext.lib.singlegrid.ViewController',
    alias : 'controller.singletree',
    
    onAdd : function() {
        var me = this;
        var result = {};
        var sm = me.grid.getSelectionModel();
        var store = me.grid.getStore();
        var newRec;
        var masterRecord;
        var selectedNode = sm.getLastSelected() || store.getRoot();
        
        if(me.masterGrid){
            masterRecord = me.masterGrid.getViewModel().get('masterRecord');
        }
        
        result = me.beforeAdd(masterRecord);
        
        if(result){
            selectedNode.set('leaf', false);
            selectedNode.set('expanded', true);

            newRec = selectedNode.appendChild(result);
            newRec.set('leaf', true);
/*            
            var editingColumn;
            var editingPlugin;

            if(store.isSorted()){
                newRec = store.add(result)[0];
            } else {
                newRec = store.insert(Math.max(index, 0), result)[0];
            }
            me.grid.view.scrollTo(newRec);
            sm.select(newRec);
*/
//            editingColumn = me.grid.getConfig('autoEditOnAdd');
            editingPlugin = me.grid.findPlugin('cellediting');
            if(editingPlugin) {
                editingPlugin.startEdit(newRec, 0);
            }
 
        }
        me.afterAdd(newRec);
    },



    onRefresh: function(){
        var me = this,
            result = true,
            masterRecord,
            vm = me.grid.getViewModel(),
            sm = me.grid.getSelectionModel(),
            store = me.grid.getStore(),
            oldSelection = sm.getSelection(),
            oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
                store.indexOf(oldSelection[0]) :
                null,
            oldSelectionId = (oldSelection && oldSelection.length==1) ?
                oldSelection[0].get('id') :
                null;
        sm.deselectAll();
        
        if(me.masterGrid){
            masterRecord = me.masterGrid.getViewModel().get('masterRecord');
            if(masterRecord && !masterRecord.phantom)
            {
                result = me.beforeRefresh(masterRecord);
            } else {
                store.loadData([]);
                result = false;
            }
        } else {
            result = me.beforeRefresh(masterRecord);
        }
        
        if(result){
            if (vm==null || vm.get('filterReady')!==false) {
                me.mainView.setLoading(true);
                store.load(
                    function(records, operation, success){
                        var recordToSelect = store.getById(oldSelectionId);
                        if (!success) {
                            me.onError(operation.getError().response);
                        }
                        if(recordToSelect){
                            me.grid.view.scrollTo(recordToSelect);
                        } else {
                            if(oldSelectionIndex && store.getCount()>oldSelectionIndex){
                                me.grid.view.scrollTo(oldSelectionIndex);
                            }
                        }
                        me.mainView.setLoading(false);
                        me.afterRefresh.call(me);
                    }
                );
            }
        }
    },
    
});;