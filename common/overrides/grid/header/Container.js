Ext.define('Ext.overrides.grid.header.Container', {
    override: 'Ext.grid.header.Container',

    sortClearText: 'Отменить сортировку',

    getColumnBy: function(propertyName, propertyValue){
        var columns = this.getGridColumns();

        return columns.filter(function(column){
            return column[propertyName]==propertyValue;
        })[0];
    },

    onSortClearClick: function() {
        var menu = this.getMenu(),
            activeHeader = menu.activeHeader;

        activeHeader.clearSort(null);
    },

    getMenuItems: function() {
        var me = this,
            menuItems = me.callParent();

        if (me.sortable) {
            menuItems.unshift({
                itemId: 'clearItem',
                text: me.sortClearText,
                handler: me.onSortClearClick,
                scope: me
            });
        }

        return menuItems;
    }
});
