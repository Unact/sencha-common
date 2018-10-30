Ext.define('Ext.overrides.grid.plugin.BufferedRenderer', {
    override: 'Ext.grid.plugin.BufferedRenderer',

    onRangeFetched: function(range, start, end, options, fromLockingPartner) {
        var me = this,
            view = me.view,
            viewEl = view.el,
            oldStart,
            rows = view.all,
            removeCount,
            increment = 0,
            calculatedTop, newTop,
            lockingPartner = (view.lockingPartner && !fromLockingPartner && !me.doNotMirror) && view.lockingPartner.bufferedRenderer,
            newRows, partnerNewRows, topAdditionSize, topBufferZone, i,
            variableRowHeight = me.variableRowHeight,
            activeEl, containsFocus, pos, newFocus;

        // View may have been destroyed since the DelayedTask was kicked off.
        if (view.destroyed) {
            return;
        }
        // If called as a callback from the Store, the range will be passed, if called from renderRange, it won't
        if (range) {
            // Re-cache the scrollTop if there has been an asynchronous call to the server.
            me.scrollTop = me.view.getScrollY();
        } else {
            range = me.store.getRange(start, end);
            // Store may have been cleared since the DelayedTask was kicked off.
            if (!range) {
                return;
            }
        }
        // If we contain focus now, but do not when we have rendered the new rows, we must focus the view el.
        activeEl = Ext.Element.getActiveElement();
        containsFocus = viewEl.contains(activeEl);
        // Best guess rendered block position is start row index * row height.
        calculatedTop = start * me.rowHeight;
        // The new range encompasses the current range. Refresh and keep the scroll position stable
        if (start < rows.startIndex && end > rows.endIndex) {
            // How many rows will be added at top. So that we can reposition the table to maintain scroll position
            topAdditionSize = rows.startIndex - start;
            // MUST use View method so that itemremove events are fired so widgets can be recycled.
            view.clearViewEl(true);
            newRows = view.doAdd(range, start);
            view.fireEvent('itemadd', range, start, newRows);
            for (i = 0; i < topAdditionSize; i++) {
                increment -= newRows[i].offsetHeight;
            }
            // We've just added a bunch of rows to the top of our range, so move upwards to keep the row appearance stable
            newTop = me.bodyTop + increment;
        } else {
            // No overlapping nodes, we'll need to render the whole range
            // teleported flag is set in getFirstVisibleRowIndex/getLastVisibleRowIndex if
            // the table body has moved outside the viewport bounds
            if (me.teleported || start > rows.endIndex || end < rows.startIndex) {
                newTop = calculatedTop;
                // If we teleport with variable row height, the best thing is to try to render the block
                // <bufferzone> pixels above the scrollTop so that the rendered block encompasses the
                // viewport. Only do that if the start is more than <bufferzone> down the dataset.
                if (variableRowHeight) {
                    topBufferZone = me.scrollTop < me.position ? me.leadingBufferZone : me.trailingBufferZone;
                    if (start > topBufferZone) {
                        newTop = me.scrollTop - me.rowHeight * topBufferZone;
                    }
                }
                // MUST use View method so that itemremove events are fired so widgets can be recycled.
                view.clearViewEl(true);
                me.teleported = false;
            }
            if (!rows.getCount()) {
                newRows = view.doAdd(range, start);
                view.fireEvent('itemadd', range, start, newRows);
            }
            // Moved down the dataset (content moved up): remove rows from top, add to end
            else if (end > rows.endIndex) {
                removeCount = Math.max(start - rows.startIndex, 0);
                // We only have to bump the table down by the height of removed rows if rows are not a standard size
                if (variableRowHeight) {
                    increment = rows.item(rows.startIndex + removeCount, true).offsetTop;
                }
                newRows = rows.scroll(Ext.Array.slice(range, rows.endIndex + 1 - start), 1, removeCount);
                // We only have to bump the table down by the height of removed rows if rows are not a standard size
                if (variableRowHeight) {
                    // Bump the table downwards by the height scraped off the top
                    newTop = me.bodyTop + increment;
                } else {
                    newTop = calculatedTop;
                }
            } else // Moved up the dataset: remove rows from end, add to top
            {
                removeCount = Math.max(rows.endIndex - end, 0);
                oldStart = rows.startIndex;
                newRows = rows.scroll(Ext.Array.slice(range, 0, rows.startIndex - start), -1, removeCount);
                // We only have to bump the table up by the height of top-added rows if rows are not a standard size
                if (variableRowHeight) {
                    // Bump the table upwards by the height added to the top
                    newTop = me.bodyTop - rows.item(oldStart, true).offsetTop;
                    // We've arrived at row zero...
                    if (!rows.startIndex) {
                        // But the calculated top position is out. It must be zero at this point
                        // We adjust the scroll position to keep visual position of table the same.
                        if (newTop) {
                            view.setScrollY(me.position = (me.scrollTop -= newTop));
                            newTop = 0;
                        }
                    }
                    // Not at zero yet, but the position has moved into negative range
                    else if (newTop < 0) {
                        increment = rows.startIndex * me.rowHeight;
                        view.setScrollY(me.position = (me.scrollTop += increment));
                        newTop = me.bodyTop + increment;
                    }
                } else {
                    newTop = calculatedTop;
                }
            }
            // The position property is the scrollTop value *at which the table was last correct*
            // MUST be set at table render/adjustment time
            me.position = me.scrollTop;
        }
        // We contained focus at the start, but that activeEl has been derendered.
        // Focus the cell's column header.
        if (containsFocus && !viewEl.contains(activeEl)) {
            pos = view.actionableMode ? view.actionPosition : view.lastFocused;

            // FIX
            // If there is an editing plugin element cache it
            // Otherwise it will be destroyed but still be referenced by the plugin
            // which will break the next edit
            if (pos.view.editingPlugin) {
                Ext.getDetachedBody().dom.appendChild(pos.view.editingPlugin.getActiveEditor().el.dom)
            }

            if (pos && pos.column) {
                view.onFocusLeave({});

                //////////////////////////////////////////////
                //
                // The Fix/
                // ========
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
        // Position the item container.
        newTop = Math.max(Math.floor(newTop), 0);
        if (view.positionBody) {
            me.setBodyTop(newTop);
        }
        // Sync the other side to exactly the same range from the dataset.
        // Then ensure that we are still at exactly the same scroll position.
        if (newRows && lockingPartner && !lockingPartner.disabled) {
            // Set the pointers of the partner so that its onRangeFetched believes it is at the correct position.
            lockingPartner.scrollTop = lockingPartner.position = me.scrollTop;
            if (lockingPartner.view.ownerCt.isVisible()) {
                partnerNewRows = lockingPartner.onRangeFetched(null, start, end, options, true);
                // Sync the row heights if configured to do so, or if one side has variableRowHeight but the other doesn't.
                // variableRowHeight is just a flag for the buffered rendering to know how to measure row height and
                // calculate firstVisibleRow and lastVisibleRow. It does not *necessarily* mean that row heights are going
                // to be asymmetric between sides. For example grouping causes variableRowHeight. But the row heights
                // each side will be symmetric.
                // But if one side has variableRowHeight (eg, a cellWrap: true column), and the other does not, that
                // means there could be asymmetric row heights.
                if (view.ownerGrid.syncRowHeight || (lockingPartner.variableRowHeight !== variableRowHeight)) {
                    me.syncRowHeights(newRows, partnerNewRows);
                    // body height might have changed with change of rows, and possible syncRowHeights call.
                    me.bodyHeight = view.body.dom.offsetHeight;
                }
            }
            if (lockingPartner.bodyTop !== newTop) {
                lockingPartner.setBodyTop(newTop);
            }
            // Set the real scrollY position after the correct data has been rendered there.
            // It will not handle a scroll because the scrollTop and position have been preset.
            lockingPartner.view.setScrollY(me.scrollTop);
        }
        return newRows;
    }
});
