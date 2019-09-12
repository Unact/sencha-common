Ext.define('Ext.lib.dblog.Window', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.lib.dblog.View'
    ],

    title: 'История изменения записи',
    height: 350,
    width: 1000,
    layout: 'fit',
    modal: true,
    items: [{
        xtype: 'dblog',
        header: false,
        allowXidEdit: false,
        viewConfig: {
            loadMask: true
        }
    }],

    refresh: function(id, modelName) {
        var view = this.down('dblog');
        view.getViewModel().set({
            id: id,
            modelName: modelName
        });

        // Без принудительного связывания наблюдается плавающая ошибка, воспроизводящая при выключенной
        // консоле разработчика. Ошибка: data в vm проинициализирована, но на сервер передаются одни null-ы
        view.getViewModel().notify();
        view.fireEvent('refreshtable');
    },

    onDestroy: function() {
        Ext.GlobalEvents.fireEvent('endserveroperation', true, null, true);
    }
});
