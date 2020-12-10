Ext.define('Ext.lib.Utils', {
    statics: {
        printWindow: function(url) {
            const win = window.open(url, '_blank');

            if (win) {
                win.onload = () => {
                    win.print();
                };
            } else {
                Ext.Msg.alert('Ошибка', 'Не удалось открыть окно для печати');
            }
        }
    }
});
