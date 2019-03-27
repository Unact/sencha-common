Ext.define('Ext.lib.form.field.BarcodeField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.barcodefield',

    width: 130,
    fieldLabel: 'Штрих код',
    labelWidth: 60,
    enableKeyEvents: true,
    translateInput: false,

    keyCodeMap: {
        'Digit0': '0',
        'Digit1': '1',
        'Digit2': '2',
        'Digit3': '3',
        'Digit4': '4',
        'Digit5': '5',
        'Digit6': '6',
        'Digit7': '7',
        'Digit8': '8',
        'Digit9': '9',
        'Period': '.',
        'Semicolon': ':',
        'Minus': '-',
        'ShiftLeft': '',
        'ShiftRight': '',
        'Backspace': '',
        'MetaLeft': '',
        'MetaRight': '',
        'KeyA': 'A',
        'KeyB': 'B',
        'KeyC': 'C',
        'KeyD': 'D',
        'KeyE': 'E',
        'KeyF': 'F',
        'KeyV': 'V',
        'KeyZ': 'Z'
    },

    listeners: {
        keyup: function(field, e) {
            if (this.translateInput) {
                this.setValue(this.value.slice(0, this.value.length - 1) + this.translateChar(e.event));
            }
        },
        specialkey: function(field, e) {
            if (e.keyCode === Ext.event.Event.ENTER) {
                // Для сканера ExtJs не успевает обновлять значение в поле
                // Поэтому ждем полсекунды, чтобы значение обновилось
                new Ext.util.DelayedTask(() => {
                    this.fireEvent('scanned', this, e);
                    this.setValue("");
                }).delay(500);

                e.preventDefault();
                e.stopEvent();
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
    },

    translateChar: function(keyboardEvent) {
        const dictResult = this.keyCodeMap[keyboardEvent.code];
        return dictResult == null ? keyboardEvent.key : dictResult;
    }
});
