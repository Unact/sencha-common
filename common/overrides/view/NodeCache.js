Ext.define('Ext.overrides.view.NodeCache', {
    override: 'Ext.view.NodeCache',

    scroll: function(newRecords, direction, removeCount) {
        var me = this,
            view = me.view,
            store = view.store,
            elements = me.elements,
            recCount = newRecords.length,
            nodeContainer = view.getNodeContainer(),
            range = me.statics().range,
            i, el, removeEnd, children, result,
            removeStart, removedRecords, removedItems,
            oldStartIndex;

        if (!(newRecords.length || removeCount)) {
            return;
        }

        // Scrolling up (content moved down - new content needed at top, remove from bottom)
        if (direction === -1) {
            if (removeCount) {
                removedRecords = [];
                removedItems = [];
                removeStart = (me.endIndex - removeCount) + 1;

                if (range) {
                    range.setStartBefore(elements[removeStart]);
                    range.setEndAfter(elements[me.endIndex]);
                    range.deleteContents();

                    for (i = removeStart; i <= me.endIndex; i++) {
                        el = elements[i];
                        delete elements[i];

                        removedRecords.push(
                            store.getByInternalId(el.getAttribute('data-recordId'))
                        );

                        removedItems.push(el);
                    }
                }
                else {
                    for (i = removeStart; i <= me.endIndex; i++) {
                        el = elements[i];
                        delete elements[i];
                        Ext.removeNode(el);

                        removedRecords.push(
                            store.getByInternalId(el.getAttribute('data-recordId'))
                        );

                        removedItems.push(el);
                    }
                }

                me.endIndex -= removeCount;

                view.fireItemMutationEvent(
                    'itemremove', removedRecords, removeStart, removedItems, view
                );
            }

            // Only do rendering if there are rows to render.
            // This could have been a remove only operation due to a view resize event.
            if (newRecords.length) {

                // grab all nodes rendered, not just the data rows
                result = view.bufferRender(newRecords, me.startIndex -= recCount);
                children = result.children;

                for (i = 0; i < recCount; i++) {
                    elements[me.startIndex + i] = children[i];
                }

                nodeContainer.insertBefore(result.fragment, nodeContainer.firstChild);

                // pass the new DOM to any interested parties
                view.fireItemMutationEvent('itemadd', newRecords, me.startIndex, children, view);
            }
        }

        // Scrolling down (content moved up - new content needed at bottom, remove from top)
        else {
            if (removeCount) {
                removedRecords = [];
                removedItems = [];
                removeEnd = me.startIndex + removeCount;

                if (range) {
                    range.setStartBefore(elements[me.startIndex]);
                    range.setEndAfter(elements[removeEnd - 1]);
                    range.deleteContents();

                    for (i = me.startIndex; i < removeEnd; i++) {
                        el = elements[i];
                        delete elements[i];

                        removedRecords.push(
                            store.getByInternalId(el.getAttribute('data-recordId'))
                        );

                        removedItems.push(el);
                    }
                }
                else {
                    for (i = me.startIndex; i < removeEnd; i++) {
                        el = elements[i];
                        delete elements[i];
                        Ext.removeNode(el);

                        removedRecords.push(
                            store.getByInternalId(el.getAttribute('data-recordId'))
                        );

                        removedItems.push(el);
                    }
                }

                /// FIX
                /// TypeError: Cannot read property 'getHeight' of null
                /// If we fire the event before changing startIndex,
                /// it can be processed before value of startIndex changes
                /// which will lead to incorrect retrieval of the first element
                oldStartIndex = me.startIndex;
                me.startIndex = removeEnd;

                view.fireItemMutationEvent(
                    'itemremove', removedRecords, oldStartIndex, removedItems, view
                );
            }

            // grab all nodes rendered, not just the data rows
            result = view.bufferRender(newRecords, me.endIndex + 1);
            children = result.children;

            for (i = 0; i < recCount; i++) {
                elements[me.endIndex += 1] = children[i];
            }

            nodeContainer.appendChild(result.fragment);

            // pass the new DOM to any interested parties
            view.fireItemMutationEvent('itemadd', newRecords, me.endIndex + 1, children, view);
        }

        // Keep count consistent.
        me.count = me.endIndex - me.startIndex + 1;

        return children;
    }
});
