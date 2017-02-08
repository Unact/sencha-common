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
        var parentRecord = record.parentNode;

        parentRecord.removeChild(record);

        recordsCount = store.getCount();

        parentRecord.set('leaf', !parentRecord.hasChildNodes());

        if (recordsCount > 0) {
            sm.select(recordsCount > index ? index : index - 1);
        }
    },

    isDisableDeleteButton: function(records){
        return !(records && records.length==1 && records[0].isLeaf());
    },

    callbackRefresh: function(tree, store, oldSelectionId, oldSelectionIndex) {
        var me = this;
        var record;
        var pathProperty; //Если поле с названием pathProperty не String, то могут быть проблемы

        store.getRootNode().cascadeBy(function(node) {
            if(node.getId() == oldSelectionId) {
                record = node;
            }
        });

        if(!record) {
            record = store.getRoot();
        }

        if(record) {
            pathProperty = record.pathProperty || record.idProperty;
            //Раскрыть ветвь, выделить узел, проскроллить к узлу
            //решени со скроллом взято отсюда: http://www.sencha.com/forum/showthread.php?251980-scrolling-to-specific-node-in-tree-panel&p=923068&viewfull=1#post923068
            tree.selectPath(record.getPath(pathProperty), pathProperty, null, function (s, n) {
                if(s) {
                    var nodeEl = Ext.get(tree.view.getNode(n));
                    nodeEl.scrollIntoView(tree.view.el, false, true);
                }
            });
        }
    }
});
