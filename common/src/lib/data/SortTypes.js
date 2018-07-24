Ext.apply(Ext.data.SortTypes, {
    asNumericNull: function(value) {
        return value == null ? -1 : value;
    }
});
