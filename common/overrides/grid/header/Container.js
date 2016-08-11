Ext.define('Ext.overrides.grid.header.Container', {
    override: 'Ext.grid.header.Container',
    
    getColumnBy: function(propertyName, propertyValue){
        var columns = this.getGridColumns();
        
        return columns.filter(function(column){
            return column[propertyName]==propertyValue;
        })[0];
    }
});
