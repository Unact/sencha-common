Ext.define('Ext.lib.singletree.ViewController', {
    extend : 'Ext.lib.singletable.ViewController',
    alias : 'controller.singletree',

    addRecord: function(store, sm, result){
        var selectedNode = sm.getLastSelected() || store.getRoot();
        var newRec;
        
        selectedNode.set('leaf', false);
        selectedNode.set('expanded', true);

        newRec = selectedNode.appendChild(result);
        newRec.set('leaf', true);
        
        return newRec;       
    },
    
    deleteRecords: function(store, records, index, sm){
        var recordsCount;
        var record = records[0]; 

        record.parentNode.removeChild(record);
        
        recordsCount = store.getCount();
        
        if (recordsCount > 0) {
            sm.select(recordsCount > index ? index : index - 1);
        }
    },
    
    isDisableDeleteButton: function(records){
        return !(records && records.length==1 && records[0].get('leaf'));
    },
});