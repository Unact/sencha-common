//http://jsfiddle.net/slemmon/fSJwF/2/
//добавлена конвертация в стринг перед поиском по RegExt
Ext.define('Ext.lib.tree.plugin.TreeFilter', {
    extend: 'Ext.AbstractPlugin',
        alias: 'plugin.treefilter',

        collapseOnClear: true,                                            // collapse all nodes when clearing/resetting the filter
        allowParentFolders: false,                                        // allow nodes not designated as 'leaf' (and their child items) to  be matched by the filter

        init: function (tree) {
            var me = this;
            me.tree = tree;

            tree.filter = Ext.Function.bind(me.filter, me);
            tree.clearFilter = Ext.Function.bind(me.clearFilter, me);
        },

        filter: function (value, property, re) {
            var me = this;
            var tree = me.tree;
            var matches = [];                                             // array of nodes matching the search criteria
            var root = tree.getRootNode();                                // root node of the tree
            var property = property || 'text';                            // property is optional - will be set to the 'text' propert of the  treeStore record by default
            var re = re || new RegExp(value, "ig");                       // the regExp could be modified to allow for case-sensitive, starts  with, etc.
            var visibleNodes = [];                                        // array of nodes matching the search criteria + each parent non-leaf  node up to root
            var viewNode;

            if (Ext.isEmpty(value)) {                                     // if the search field is empty
                me.clearFilter();
                return;
            }

            tree.expandAll();                                             // expand all nodes for the the following iterative routines

            // iterate over all nodes in the tree in order to evalute them against the search criteria
            root.cascadeBy(function (node) {
                if (node.get(property).toString().match(re)) {            // if the node matches the search criteria and is a leaf (could be  modified to searh non-leaf nodes)
                    matches.push(node);                                   // add the node to the matches array
                }
            });

            if (me.allowParentFolders === false) {                        // if me.allowParentFolders is false (default) then remove any  non-leaf nodes from the regex match
                Ext.each(matches, function (match) {
                    if (!match.isLeaf()) { Ext.Array.remove(matches, match); }
                });
            }

            Ext.each(matches, function (item, i, arr) {                   // loop through all matching leaf nodes
                root.cascadeBy(function (node) {                          // find each parent node containing the node from the matches array
                    if (node.contains(item) == true) {
                        visibleNodes.push(node);                          // if it's an ancestor of the evaluated node add it to the visibleNodes  array
                    }
                });
                if (me.allowParentFolders === true &&  !item.isLeaf()) {  // if me.allowParentFolders is true and the item is  a non-leaf item
                    item.cascadeBy(function (node) {                      // iterate over its children and set them as visible
                        visibleNodes.push(node);
                    });
                }
                visibleNodes.push(item);                                  // also add the evaluated node itself to the visibleNodes array
            });

            root.cascadeBy(function (node) {                              // finally loop to hide/show each node
                viewNode = Ext.fly(tree.getView().getNode(node));         // get the dom element assocaited with each node
                if (viewNode) {                                           // the first one is undefined ? escape it with a conditional
                    viewNode.setVisibilityMode(Ext.Element.DISPLAY);      // set the visibility mode of the dom node to display (vs offsets)
                    viewNode.setVisible(Ext.Array.contains(visibleNodes, node));
                }
            });
        },

        clearFilter: function () {
            var me = this;
            var tree = this.tree;
            var root = tree.getRootNode();

            if (me.collapseOnClear) { tree.collapseAll(); }               // collapse the tree nodes
            root.cascadeBy(function (node) {                              // final loop to hide/show each node
                viewNode = Ext.fly(tree.getView().getNode(node));         // get the dom element assocaited with each node
                if (viewNode) {                                           // the first one is undefined ? escape it with a conditional and show  all nodes
                    viewNode.show();
                }
            });
        }
});
