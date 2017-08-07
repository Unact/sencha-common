Ext.define('Ext.lib.LabelEditor', {
    extend: 'Ext.Editor',
    alias: 'plugin.labeleditor',

    requires: [
        'Ext.form.field.Text'
    ],

    completeOnEnter: true,
    
    cancelOnEsc: true,

    autoSize: {
        width: 'field',
        height: 'field'
    },

    labelSelector: 'x-editable',

    constructor: function(config) {
        config.editor = config.editor || Ext.create('Ext.form.field.Text', {
            allowOnlyWhitespace: false,
            selectOnFocus: true
        });
        this.callParent(arguments);
    },

    init: function(view) {
        view.on('itemclick', this.onItemClick, this);
        this.on('complete', this.updateRecord, this);
    },

    destroy: function(view) {
        view.un('itemclick', this.onItemClick, this);
        this.un('complete', this.updateRecord, this);
    },

    onItemClick: function(view, record, item, index, e) {
        if (Ext.fly(e.target).hasCls(this.labelSelector) && !this.editing && !e.ctrlKey && !e.shiftKey) {
            e.stopEvent();
            this.startEdit(e.target, record.data[this.dataIndex]);
            this.activeRecord = record;
        } else if (this.editing) {
            this.field.blur();
            e.preventDefault();
        }
    },

    updateRecord: function(editor, value) {
        this.activeRecord.set(this.dataIndex, value);
    }
});
