Ext.define('Ext.overrides.grid.ViewDropZone', {
    override: 'Ext.grid.ViewDropZone',

    handleNodeDrop : function(data, record, position) {
        var view = this.view,
            store = view.getStore(),
            crossView = view !== data.view,
            index, records, i, len;

        // If the copy flag is set, create a copy of the models
        if (data.copy) {
            records = data.records;
            for (i = 0, len = records.length; i < len; i++) {
                records[i] = records[i].copy();
            }
        } else if (crossView) {
            /*
             * Remove from the source store only if we are moving to a different store.
             */
            data.view.store.remove(data.records);
        }

        if (record && position) {
            index = store.indexOf(record);

            // 'after', or undefined (meaning a drop at index -1 on an empty View)...
            if (position !== 'before') {
                index++;
            }
            store.insert(index, data.records);

            /// FIX
            //У прошлого родителя был всего один потомок и тот перенесся
            if (record.parentNode.childNodes.length === 1) {
                record.parentNode.set('leaf', true);
            }

            //Если бросаем под лист, то лист сделать узлом
            if (record.isLeaf() && dropPosition === 'after') {
                eOpts.cancelDrop();
                record.set('expanded', true);
                record.set('leaf', false);
                record.appendChild(data.records[0]);
            }
        }
        // No position specified - append.
        else {
            store.add(data.records);
        }

        // Select the dropped nodes unless dropping in the same view.
        // In which case we do not disturb the selection.
        if (crossView) {
            view.getSelectionModel().select(data.records);
        }

        // Focus the first dropped node.
        view.getNavigationModel().setPosition(data.records[0]);
    }
});
