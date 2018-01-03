Ext.define('Ext.lib.form.field.BarcodeField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.barcodefield',

    fieldLabel: 'Штрих код',
    labelWidth: 30,

    listeners: {
        specialkey: function(field, event) {
            if (event.keyCode === Ext.event.Event.ENTER) {
                // Для сканера ExtJs не успевает обновлять значение в поле
                // Поэтому ждем полсекунды, чтобы значение обновилось
                new Ext.util.DelayedTask(() => {
                    this.fireEvent('scanned', this, event);
                }).delay(500);

                event.preventDefault();
                event.stopEvent();
            } else {
                this.setValue("");
            }
        },
    },

    onRender: function() {
        const parent = this.up("tablepanel");

        if (parent) {
            new Ext.util.KeyMap({
                target: parent.el,
                binding: {
                    key: "1",
                    alt: true,
                    fn: (key, event) => {
                        this.setValue("");
                        this.focus();
                        event.preventDefault();
                    }
                }
            });
        }

        this.callParent(arguments);
    }
});
