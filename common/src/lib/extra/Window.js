Ext.define('Ext.lib.extra.Window', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.lib.extra.View'
    ],

    title: 'Дополнительно',
    height: 350,
    width: 1000,
    layout: 'fit',
    modal: true,
    items: [{
        xtype: 'extra',
        viewConfig: {
            loadMask: true
        }
    }],

    refresh: function(id, modelName) {
        var view = this.down('extra');
        view.getViewModel().set({
            recordId: id,
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
