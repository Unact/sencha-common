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


    //TODO: у метода load() нет колбэка. надо что-то придумать. 
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
                store.load();
            }
        }
    },
    
    onDelete: function(){
        var me = this,
            sm = me.grid.getSelectionModel(),
            oldSelection = sm.getSelection(),
            store = me.grid.getStore(),
            oldSelectionIndex = (oldSelection && oldSelection.length==1) ?
                store.indexOf(oldSelection[0]) :
                null;
        
        function removeRow(){
            var recordsCount;
            oldSelection[0].parentNode.removeChild(oldSelection[0]);
            
            recordsCount = store.getCount();
            
            console.log(oldSelection[0], recordsCount);
            if (recordsCount > 0) {
                sm.select(recordsCount > oldSelectionIndex ? oldSelectionIndex : oldSelectionIndex - 1);
            }
        };
        
        if(me.grid.enableDeleteDialog===true){
            Ext.Msg.show({
                title : 'Внимание',
                message : 'Вы действительно хотите удалить запись?',
                buttons : Ext.Msg.YESNOCANCEL,
                icon : Ext.Msg.QUESTION,
                fn : function(btn) {
                    if (btn === 'yes') {
                        removeRow();
                    }
                }
            });
        } else {
            removeRow();
        }
    },
    
    onChangeSelect: function(grid, selected, eOpts){
        var me = this,
            selectionCorrect = selected && selected.length > 0,
            selectedOne = selectionCorrect && selected.length==1,
            vm = me.grid.getViewModel(),
            deleteButton = me.lookupReference('delete' + me.grid.suffix);
        
        if(deleteButton){
            deleteButton.setDisabled(!selectedOne || !selected[0].get('leaf'));
        }
        if(vm){
            vm.set('masterRecord', selectedOne ? selected[0] : null);
        }
        
        if(me.detailGrids){
            me.detailGrids.forEach(function(detail){
                detail.setDisabled(!selectedOne || selected[0].phantom);
                detail.fireEvent('refreshtable');
            });
        }
    },
});;