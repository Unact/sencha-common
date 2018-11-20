/**
 * A Column subclass which renders a tri state checkbox in each column cell
 * Does not support:
 * * `Ext.grid.column.Check` header features
 * * `Ext.grid.column.Check` invert feature
 *
 * State values can be changed using `nullValue`, `uncheckedValue`, `checkedValue` configs
 */
Ext.define('Ext.lib.grid.column.TriCheckColumn', {
    extend: 'Ext.grid.column.Check',
    alias: 'widget.tricheckcolumn',

    nullTooltip: '',

    nullValue: null,
    uncheckedValue: false,
    checkedValue: true,

    checkboxCls: 'x-grid-tricheckcolumn',
    checkboxCheckedCls: 'x-grid-cc-checked',
    checkboxNullCls: 'x-grid-cc-null',

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        var me = this;
        var key = type === 'keydown' && e.getKey();
        var isClick = type === me.triggerEvent;
        var disabled = me.disabled;
        var ret;
        var newVal;

        // Flag event to tell SelectionModel not to process it.
        e.stopSelection = !key && me.stopSelection;

        if (!disabled && (isClick || (key === e.ENTER || key === e.SPACE))) {
            switch(record.get(this.dataIndex)) {
                case this.checkedValue:
                    newVal = this.nullValue;
                    break;
                case this.nullValue:
                    newVal = this.uncheckedValue;
                    break;
                case this.uncheckedValue:
                    newVal = this.checkedValue;
                    break;
            }

            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, newVal, record, e) !== false) {

                me.setRecordCheck(record, recordIndex, newVal, cell, e);

                // Do not allow focus to follow from this mousedown unless the grid is already in actionable mode
                if (isClick && !view.actionableMode) {
                    e.preventDefault();
                }
                if (me.hasListeners.checkchange) {
                    me.fireEvent('checkchange', me, recordIndex, newVal, record, e);
                }
            }
        } else {
            ret = me.callParent(arguments);
        }
        return ret;
    },

    defaultRenderer: function(value, cellValues) {
        var me = this;
        var cls = me.checkboxCls;
        var tip = me.tooltip;

        if (me.disabled) {
            cellValues.tdCls += ' ' + me.disabledCls;
        }

        if (value === this.checkedValue) {
            cls += ' ' + me.checkboxCheckedCls;
            tip = me.checkedTooltip || tip;
        }

        if (value === this.nullValue) {
            cls += ' ' + me.checkboxNullCls;
            tip = me.nullTooltip || tip;
        }

        if (me.useAriaElements) {
            cellValues.tdAttr += ' aria-describedby="' + me.id + '-cell-description' +
                                 (!value ? '-not' : '') + '-selected"';
        }

        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();

        return '<span ' + (tip || '') + ' class="' + cls + '" role="' + me.checkboxAriaRole + '"' +
                (!me.ariaStaticRoles[me.checkboxAriaRole] ? ' tabIndex="0"' : '') +
               '></span>';
    },

    isRecordChecked: function (record) {
        return record.get(this.dataIndex);
    },

    setRecordCheck: function (record, recordIndex, checked, cell) {
        if (record.get(this.dataIndex) !== checked) {
            record.set(this.dataIndex, checked);
            this.updater(cell, checked);
        }
    },

    updater: function (cell, value) {
        var me = this;
        var tip = me.tooltip;
        var col;
        var flyCell = Ext.fly(cell);

        if (me.useAriaElements) {
            me.updateCellAriaDescription(null, value, flyCell);
        }

        flyCell[me.disabled ? 'addCls' : 'removeCls'](me.disabledCls);
        col = Ext.fly(flyCell.down(me.getView().innerSelector, true).firstChild);

        switch(value) {
            case this.checkedValue:
                tip = me.checkedTooltip || tip;
                col.addCls(this.checkboxCheckedCls);
                col.removeCls(this.checkboxNullCls);
                break;
            case this.nullValue:
                tip = me.nullTooltip || tip;
                col.removeCls(this.checkboxCheckedCls);
                col.addCls(this.checkboxNullCls);
                break;
            case this.uncheckedValue:
                col.removeCls(this.checkboxCheckedCls);
                col.removeCls(this.checkboxNullCls);
                break;
        }

        if (tip) {
            cell.setAttribute('data-qtip', tip);
        } else {
            cell.removeAttribute('data-qtip');
        }

        me.updateHeaderState();
    },

    // Disables checkbox column header toggle
    toggleAll: Ext.emptyFn
});
