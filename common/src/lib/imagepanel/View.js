Ext.define('Ext.lib.imagepanel.View', {
    extend: 'Ext.lib.singlegrid.View',
    alias: 'widget.imagepanel',

    requires: [
        'Ext.lib.imagepanel.ViewController',
        'Ext.lib.form.field.MultiFile'
    ],

    controller: 'imagepanel',

    listeners: {
        itemdblclick: 'onImageDblClick'
    },

    buttons: [{
        hidden: true,
        name: 'images[]',
        xtype: 'multifile',
        reference: 'addFileField',
        accept: 'image/*',
        acceptSize: 30000,
        buttonOnly: true,
        listeners: {
            change: 'onAddWindowClose'
        }
    }],

    columns: [{
        width: 300,
        text: 'Изображения',
        xtype: 'templatecolumn',
        tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="picture">',
                    '<img src="{short_url}"/>',
                '</div>',
            '</tpl>'
        )
    }]
});
