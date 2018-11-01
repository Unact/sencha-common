Ext.define('Ext.lib.dblog.Window', {
    extend: 'Ext.window.Window',

    requires: ['Ext.lib.dblog.View'],

    title: 'История изменения записи',
    height: 350,
    width: 1200,
    layout: 'fit',
    modal: true,
    items: [{
        xtype: 'dblog',
        header: false,
        allowXidEdit: false
    }],

    refresh: function(modelOrXid, url) {
        if (modelOrXid.isModel) {
            this.setData({
                id: modelOrXid.getId(),
                url: url
            });
        } else {
            this.setData({
                xid: modelOrXid
            });
        }
    },

    setData: function(data) {
        var view = this.down('dblog');
        view.getViewModel().set(data);

        // Без принудительного связывания наблюдается плавающая ошибка, воспроизводящая при выключенной
        // консоле разработчика. Ошибка: data в vm проинициализирована, но на сервер передаются одни null-ы
        view.getViewModel().notify();
        view.fireEvent('refreshtable');
    },

    onDestroy: function() {
        Ext.GlobalEvents.fireEvent('endserveroperation', true, null, true);
    }
});
