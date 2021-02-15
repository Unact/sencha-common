Ext.define('Ext.overrides.view.TableLayout', {
    override: 'Ext.view.TableLayout',

    finishedLayout: function(ownerContext) {
        var me = this,
            ownerGrid = me.owner.ownerGrid,
            nodeContainer = Ext.fly(me.owner.getNodeContainer()),
            scroller = this.owner.getScrollable(),
            buffered;
        me.callParent([
            ownerContext
        ]);
        if (nodeContainer) {
            nodeContainer.setWidth(ownerContext.headerContext.props.contentWidth);
        }
        // Inform any buffered renderer about completion of the layout of its view
        buffered = me.owner.bufferedRenderer;
        if (buffered) {
            buffered.afterTableLayout(ownerContext);
        }
        if (ownerGrid) {
            ownerGrid.syncRowHeightOnNextLayout = false;
        }
        if (scroller && !scroller.isScrolling) {
            // BufferedRenderer only sets nextRefreshStartIndex to zero when preserveScrollOnReload
            // is false. And if variableRowHeight is true, restoring the scroller will be handled
            // by the bufferedRenderer
            if (buffered) {
                if (buffered.nextRefreshStartIndex === 0 || me.owner.hasVariableRowHeight()) {
                    return;
                }
                /// FIX
                /// The view may have refreshed and scrolled to the top
                buffered.onViewScroll();
            }
            scroller.restoreState();
        }
    },
});
