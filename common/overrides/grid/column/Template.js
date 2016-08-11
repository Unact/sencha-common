Ext.define('Ext.overrides.grid.column.Template', {
    override: 'Ext.grid.column.Template',

    // У templatecolumn реализован очень странный метод updater:
    // Если что-то поменялось в модели он выводит checkbox
    // Отменить это певедение
    updater: Ext.emptyFn
});
