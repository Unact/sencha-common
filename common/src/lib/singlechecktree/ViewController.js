Ext.define('Ext.lib.singlechecktree.ViewController', {
    extend: 'Ext.lib.app.ViewController',
    alias : 'controller.singlechecktree',

    mixins: ['Ext.lib.shared.Detailable'],

    isProcessBranch: false,

    init: function(view){
        var me = this;

        me.mainView = me.mainView || view;

        view.on('refreshtable', me.onCheckmarkRefresh, me);
        view.on('savetable', me.onSave, me);
        view.on('checkchange', me.onViewCheckChange, me);
    },

    onCheckmarkRefresh: function() {
        this.sharedRefresh(true, true);
    },

    onRefresh: function() {
        this.sharedRefresh(true, true);
    },

    sharedRefresh: function(isRefreshTree, isRefreshCheckmark) {
        var me = this;
        var result = true;
        var masterRecord;
        var view = me.getView();
        var vm = view.getViewModel();
        var sm = view.getSelectionModel();
        var treeStore = view.getStore();  //?
        var checkmarkStore = view.getCheckmarkStore();
        var oldSelection = sm.getSelection();
        var oldSelectionId = (oldSelection && oldSelection.length==1) ?
                oldSelection[0].get('id') :
                null;
        var stores = [];
        var counter = 0;

        if(me.hasMaster()){
            masterRecord = me.getMasterRecord();
            if(masterRecord && !masterRecord.phantom)
            {
                result = me.beforeRefresh(masterRecord);
            } else {
                if(!checkmarkStore.isEmptyStore) {
                    checkmarkStore.loadData([]);
                }
                result = false;
            }
        } else {
            result = me.beforeRefresh(masterRecord);
        }

        if(isRefreshTree) {
            stores.push(treeStore);
        }

        if(isRefreshCheckmark) {
            if(result && (!vm || vm.get('filterReady')!==false)) {
                stores.push(checkmarkStore);
            }
        }

        counter = stores.length;

        if(counter === 0) {
            me.afterRefresh();
            return;
        }

        me.mainView.setLoading(true);

        Ext.Array.each(stores, function(store) {
            store.load({
                callback: function(records, operation, success) {
                    if (!success) {
                        me.onError(operation.getError().response);
                    }

                    counter--;
                    if(counter === 0) {
                        //afterRefresh изменяет выделенную строку, поэтому
                        //вызовим его до установки фокуса на строку
                        me.afterRefresh();

                        me.callbackRefresh(view, treeStore, oldSelectionId);

                        me.mainView.setLoading(false);
                    }
                }
            });
        });
    },

    callbackRefresh: function(tree, store, oldSelectionId) {
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
    },

    onSave: function() {
        var me = this;
        var view = me.getView();
        var recordsChecked = view.getChecked();
        var viewStore = this.getView().getStore();
        var store = view.getCheckmarkStore();
        var recordsDel = [];
        var recordsAdd = [];
        var masterRecord;
        var callback;
        var callbackScope;

        if (me.hasMaster()) {
            masterRecord = me.getMasterRecord();
        } else {
            masterRecord = me.getViewModel().get('masterRecord');
        }

        if (arguments[0] && (typeof arguments[0]==='function')) {
            callback = arguments[0];
            callbackScope = arguments[1] || me;
        }

        //найти где сняли галочки. (нет recordsChecked)
        store.each(function(record) {
            var isExists = false;
            Ext.Array.each(recordsChecked, function(recordChecked) {
                if(record.get(me.checkmarkLink) == recordChecked.get('id')) {
                    if (recordChecked.dirty) {
                        record.set(recordChecked.getChanges());
                    }

                    isExists = true;
                    return false; //выход из итератора
                }
            });

            //Если галочка не стоит
            if(!isExists) {
                recordsDel.push(record);
            }
        });
        store.remove(recordsDel);

        Ext.Array.each(recordsChecked, function(recordChecked) {
            var isExists = false;

            store.each(function(record) {
                if(record.get(me.checkmarkLink) == recordChecked.get('id')) {
                    isExists = true;
                    return false; //выход из итератора
                }
            });

            //Если в сторе нет записи
            if(!isExists) {
                recordsAdd.push(
                    Ext.merge(me.createCheckmarkRecord(recordChecked, masterRecord), recordChecked.getChanges())
                );
            }
        });
        store.add(recordsAdd).forEach(rec => rec.phantom = true);

        if(store.hasChanges()) {
            me.mainView.setLoading(true);

            store.sync({
                success: function(){
                    me.mainView.setLoading(false);

                    viewStore.each(record => record.commit());

                    if(callback) {
                        callback.call(callbackScope);
                    }
                },

                failure: function(batch){
                    if (batch.exceptions.length > 0) {
                        me.onError(batch.exceptions[0].getError().response);
                    }
                    me.mainView.setLoading(false);
                    if(callback) {
                        callback.call(callbackScope);
                    }
                }
            });
        } else {
            if(callback) {
                callback.call(callbackScope);
            }
        }
    },

    onFilterCheck: function(btn) {
        var me = this;
        var store = me.getView().getStore();

        if(btn.pressed) {
            store.filterBy(function(node) {
                var isVisible = false;

                node.cascadeBy({
                    before: function(n) {
                        if(n.get('checked')) {
                            isVisible = true;
                        }

                        return !isVisible; //Это немножко сократит кол-во итераций
                    }
                });

                if(!node.isLeaf()) {
                    node.set('expanded', isVisible);
                }
                return isVisible;
            });
        } else {
            store.clearFilter();
        }
    },

    onBranch: function(btn) {
        this.isProcessBranch = btn.pressed;
    },

    /**
     * Функция должна возвратить "истину" для продолжения обновления
     */
    beforeRefresh: function(){
        return true;
    },

    afterRefresh: function() {
        var me = this;
        var ids=[];
        var view = me.getView();
        var rootNode = view.getRootNode();
        var checkmarkStore = view.getCheckmarkStore();
        var store = view.getStore();
        var filters = store.getFilters().clone();
        var additionalNodeData = {};

        checkmarkStore.each(function(record) {
            var id = record.get(me.checkmarkLink);
            var additionalFields = record.getFields().
                filter(field => field.identifier !== true && field.name !== me.checkmarkLink).
                map(field => field.name);

            ids.push(id);
            additionalNodeData[id] = additionalFields.reduce(function(prev, field) {
                prev[field] = record.get(field);
                return prev;
            }, {});
        });

        store.clearFilter();
        rootNode.cascadeBy(function(node) {
            var index = ids.indexOf(node.get('id'));

            // Ignore pseudo-root node called "Root"
            if (index >= 0 && !node.isRoot()) {
                node.set('checked', true);
                node.set(additionalNodeData[ids[index]]);
                ids.splice(index, 1);
            } else {
                node.set('checked', false);
            }
            node.commit();
        });

        store.filter(filters.getRange());
    },

    onViewCheckChange: function(node, checked) {
        var me = this;

        node.cascadeBy(function(n) {
            if(me.isProcessBranch) {
                n.set('checked', checked);
            }
        });
    },

    cleanTable: function() {
        this.getView().getStore().loadData([]);
        this.getView().getCheckmarkStore().loadData([]);
    }
});
