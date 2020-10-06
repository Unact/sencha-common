Ext.define('Ext.overrides.data.TreeStore', {
    override: 'Ext.data.TreeStore',

    filterer: 'bottomup',
    /**
     * @private
     * Filters the passed node according to the passed function.
     *
     * If this TreeStore is configure {@link #cfg-bottomUpFiltering} then leaf
     * nodes are tested according to the fuction, parent nodes are filtered in
     * if any descendant leaf nodes have passed the filter test.
     *
     * Otherwise a parent node which fails the test will terminate the branch and
     * descebdant nodes which pass the filter test will be filtered out.
     */
    filterHasChanges: function(item) {
        return this.callParent(arguments) && !item.isRoot();
    },

    filterDataSource: function(fn) {
        var source = this.getDataSource();
        var items = [];

        this.getRootNode().cascadeBy(rec => items.push(rec));

        var len = items.length;
        var ret = [];

        for (var i = 0; i < len; i++)
            if (fn.call(source, items[i]))
                ret.push(items[i]);
        return ret
    },

    privates: {
        doFilter: function(node) {
            if (node) {
                this.filterNodes(node, this.getFilters().getFilterFn(), true);
            }
        },

        filterNodes: function(node, filterFn, parentVisible) {
            var me = this,
                bottomUpFiltering = me.filterer === 'bottomup',
                // MUST call filterFn first to avoid shortcutting if parentVisible is false.
                // filterFn may have side effects, so must be called on all nodes.
                match = filterFn(node) && (parentVisible || node.isRoot()),
                childNodes = node.childNodes,
                len = childNodes && childNodes.length,
                i, matchingChildren;

            if (len) {
                for (i = 0; i < len; ++i) {
                    // MUST call method first to avoid shortcutting boolean expression if matchingChildren is true
                    matchingChildren = me.filterNodes(childNodes[i], filterFn, match || bottomUpFiltering) || matchingChildren;
                }
                if (bottomUpFiltering) {
                    match = matchingChildren || match;
                }
            }

            node.set('visible', match, me._silentOptions);
            return match;
        },

        /**
         * @private
         *
         * Called from filter/clearFilter. Refreshes the view based upon
         * the new filter setting.
         */
        onNodeFilter: function(root, childNodes) {
            var me = this,
                data = me.getData(),
                toAdd = [];

            // If we have any child nodes visible then the root must also be visible
            if (me.getRootVisible()) {
                if (childNodes.length || root.get('visible')) {
                    toAdd.push(root);
                } else {
                    root.set('visible', false, me._silentOptions);
                }
            }

            me.handleNodeExpand(root, childNodes, toAdd);

            // Do not relay the splicing's add&remove events.
            // We inform interested parties about filtering through a refresh event.
            me.suspendEvents();
            data.splice(0, data.getCount(), toAdd);
            me.resumeEvents();

            if (!me.suppressNextFilter) {
                me.fireEvent('datachanged', me);
                me.fireEvent('refresh', me);
            }
        },
    }
});
