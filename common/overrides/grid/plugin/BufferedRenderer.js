Ext.define('Ext.overrides.grid.plugin.BufferedRenderer', {
    override: 'Ext.grid.plugin.BufferedRenderer',

    onRangeFetched: function(range, start, end, options, fromLockingPartner) {
        var me = this,
            view = me.view,
            scroller = me.scroller,
            viewEl = view.el,
            rows = view.all,
            increment = 0,
            calculatedTop,
            lockingPartner = (view.lockingPartner && !fromLockingPartner && !me.doNotMirror) && view.lockingPartner.bufferedRenderer,
            variableRowHeight = me.variableRowHeight,
            oldBodyHeight = me.bodyHeight,
            layoutCount = view.componentLayoutCounter,
            activeEl, containsFocus, i, newRows, newTop, newFocus, noOverlap,
            oldStart, partnerNewRows, pos, removeCount, topAdditionSize, topBufferZone;

        // View may have been destroyed since the DelayedTask was kicked off.
        if (view.destroyed) {
            return;
        }

        // If called as a callback from the Store, the range will be passed, if called from renderRange, it won't
        if (range) {
            if (!fromLockingPartner) {
                // Re-cache the scrollTop if there has been an asynchronous call to the server.
                me.scrollTop = me.scroller.getPosition().y;
            }
        } else {
            range = me.store.getRange(start, end);

            // Store may have been cleared since the DelayedTask was kicked off.
            if (!range) {
                return;
            }
        }

        // If we contain focus now, but do not when we have rendered the new rows, we must focus the view el.
        activeEl = Ext.fly(Ext.Element.getActiveElement());
        containsFocus = viewEl.contains(activeEl);

        // In case the browser does fire synchronous focus events when a focused element is derendered...
        if (containsFocus) {
            activeEl.suspendFocusEvents();
        }

        // Best guess rendered block position is start row index * row height.
        // We can use this as bodyTop if the row heights are all standard.
        // We MUST use this as bodyTop if the scroll is a telporting scroll.
        // If we are incrementally scrolling, we add the rows to the bottom, and
        // remove a block of rows from the top.
        // The bodyTop is then incremented by the height of the removed block to keep
        // the visuals the same.
        //
        // We cannot always use the calculated top, and compensate by adjusting the scroll position
        // because that would break momentum scrolling on DOM scrolling platforms, and would be
        // immediately undone in the next frame update of a momentum scroll on touch scroll platforms.
        calculatedTop = start * me.rowHeight;

        // The new range encompasses the current range. Refresh and keep the scroll position stable
        if (start < rows.startIndex && end > rows.endIndex) {

            // How many rows will be added at top. So that we can reposition the table to maintain scroll position
            topAdditionSize = rows.startIndex - start;

            // MUST use View method so that itemremove events are fired so widgets can be recycled.
            view.clearViewEl(true);
            newRows = view.doAdd(range, start);
            view.fireItemMutationEvent('itemadd', range, start, newRows, view);
            for (i = 0; i < topAdditionSize; i++) {
                increment -= newRows[i].offsetHeight;
            }

            // We've just added a bunch of rows to the top of our range, so move upwards to keep the row appearance stable
            newTop = me.bodyTop + increment;
        }
        else {
            // No overlapping nodes; we'll need to render the whole range.
            // teleported flag is set in getFirstVisibleRowIndex/getLastVisibleRowIndex if
            // the table body has moved outside the viewport bounds
            noOverlap = me.teleported || start > rows.endIndex || end < rows.startIndex;
            if (noOverlap) {
                view.clearViewEl(true);
                me.teleported = false;
            }

            if (!rows.getCount()) {
                newRows = view.doAdd(range, start);
                view.fireItemMutationEvent('itemadd', range, start, newRows, view);
                newTop = calculatedTop;

                // Adjust the bodyTop to place the data correctly around the scroll vieport
                if (noOverlap && variableRowHeight) {
                    topBufferZone = me.scrollTop < me.position ? me.leadingBufferZone : me.trailingBufferZone;
                    newTop = Math.max(me.scrollTop - rows.item(rows.startIndex + topBufferZone - 1, true).offsetTop, 0);
                }
            }
            // Moved down the dataset (content moved up): remove rows from top, add to end
            else if (end > rows.endIndex) {
                removeCount = Math.max(start - rows.startIndex, 0);

                // We only have to bump the table down by the height of removed rows if rows are not a standard size
                if (variableRowHeight) {
                    increment = rows.item(rows.startIndex + removeCount, true).offsetTop;
                }
                newRows = rows.scroll(Ext.Array.slice(range, rows.endIndex + 1 - start), 1, removeCount);
                view.el.dom.scrollTop = me.scrollTop;

                // We only have to bump the table down by the height of removed rows if rows are not a standard size
                if (variableRowHeight) {
                    // Bump the table downwards by the height scraped off the top
                    newTop = me.bodyTop + increment;
                }
                // If the rows are standard size, then the calculated top will be correct
                else {
                    newTop = calculatedTop;
                }
            }
            // Moved up the dataset: remove rows from end, add to top
            else {
                removeCount = Math.max(rows.endIndex - end, 0);
                oldStart = rows.startIndex;
                newRows = rows.scroll(Ext.Array.slice(range, 0, rows.startIndex - start), -1, removeCount);
                view.el.dom.scrollTop = me.scrollTop;

                // We only have to bump the table up by the height of top-added rows if rows are not a standard size
                if (variableRowHeight) {
                    // Bump the table upwards by the height added to the top
                    newTop = me.bodyTop - rows.item(oldStart, true).offsetTop;

                    // We've arrived at row zero...
                    if (!rows.startIndex) {
                        // But the calculated top position is out. It must be zero at this point
                        // We adjust the scroll position to keep visual position of table the same.
                        if (newTop) {
                            scroller.scrollTo(null, me.position = (me.scrollTop -= newTop));
                            newTop = 0;
                        }
                    }

                    // Not at zero yet, but the position has moved into negative range
                    else if (newTop < 0) {
                        increment = rows.startIndex * me.rowHeight;
                        scroller.scrollTo(null, me.position = (me.scrollTop += increment));
                        newTop = me.bodyTop + increment;
                    }
                }
                // If the rows are standard size, then the calculated top will be correct
                else {
                    newTop = calculatedTop;
                }
            }

            // The position property is the scrollTop value *at which the table was last correct*
            // MUST be set at table render/adjustment time
            me.position = me.scrollTop;
        }

        // We contained focus at the start, check whether activeEl has been derendered.
        // Focus the cell's column header if so.
        if (containsFocus) {
            // Restore active element's focus processing.
            activeEl.resumeFocusEvents();


            if (!viewEl.contains(activeEl)) {
                pos = view.actionableMode ? view.actionPosition : view.lastFocused;

                // FIX
                // If there is an editing plugin and has an active editor element then cache it
                // Otherwise it will be destroyed but still be referenced by the plugin
                // which will break the next edit
                if (view && view.editingPlugin && view.editingPlugin.getActiveEditor()) {
                    Ext.getDetachedBody().dom.appendChild(view.editingPlugin.getActiveEditor().el.dom)
                }

                if (pos && pos.column) {
                    // we set the rendering rows to true here so the actionables know
                    // that view is forcing the onFocusLeave method here
                    view.renderingRows = true;
                    view.onFocusLeave({});
                    view.renderingRows = false;
                    // Try to focus the contextual column header.
                    // Failing that, look inside it for a tabbable element.
                    // Failing that, focus the view.
                    // Focus MUST NOT just silently die due to DOM removal
                    if (pos.column.focusable) {
                        newFocus = pos.column;
                    } else {
                        newFocus = pos.column.el.findTabbableElements()[0];
                    }
                    if (!newFocus) {
                        newFocus = view.el;
                    }
                    newFocus.focus();
                }
            }
        }

        // Calculate position of item container.
        newTop = Math.max(Math.floor(newTop), 0);

        // Sync the other side to exactly the same range from the dataset.
        // Then ensure that we are still at exactly the same scroll position.
        if (newRows && lockingPartner && !lockingPartner.disabled) {
            // Set the pointers of the partner so that its onRangeFetched believes it is at the correct position.
            lockingPartner.scrollTop = lockingPartner.position = me.scrollTop;
            if (lockingPartner.view.ownerCt.isVisible()) {
                partnerNewRows = lockingPartner.onRangeFetched(range, start, end, options, true);

                // Sync the row heights if configured to do so, or if one side has variableRowHeight but the other doesn't.
                // variableRowHeight is just a flag for the buffered rendering to know how to measure row height and
                // calculate firstVisibleRow and lastVisibleRow. It does not *necessarily* mean that row heights are going
                // to be asymmetric between sides. For example grouping causes variableRowHeight. But the row heights
                // each side will be symmetric.
                // But if one side has variableRowHeight (eg, a cellWrap: true column), and the other does not, that
                // means there could be asymmetric row heights.
                if (view.ownerGrid.syncRowHeight || view.ownerGrid.syncRowHeightOnNextLayout || (lockingPartner.variableRowHeight !== variableRowHeight)) {
                    me.syncRowHeights(newRows, partnerNewRows);
                    view.ownerGrid.syncRowHeightOnNextLayout = false;
                }
            }
            if (lockingPartner.bodyTop !== newTop) {
                lockingPartner.setBodyTop(newTop, true);
            }
        }

        if (view.positionBody && !fromLockingPartner) {
            me.setBodyTop(newTop, true);
        }

        // If there's variableRowHeight and the scroll operation did affect that, remeasure now.
        // We must do this because the RowExpander and RowWidget plugin might make huge differences
        // in rowHeight, so we might scroll from a zone full of 200 pixel hight rows to a zone of
        // all 21 pixel high rows.
        if (me.variableRowHeight) {
            delete me.rowHeight;
            me.refreshSize();
        }

        //<debug>
        // If there are columns to trigger rendering, and the rendered block os not either the view size
        // or, if store count less than view size, the store count, then there's a bug.
        if (view.getVisibleColumnManager().getColumns().length && rows.getCount() !== Math.min(me.store.getCount(), me.viewSize)) {
            Ext.raise('rendered block refreshed at ' + rows.getCount() + ' rows while BufferedRenderer view size is ' + me.viewSize);
        }
        //</debug>
        return newRows;
    }
});
