Ext.define('Ext.lib.picturepanel.View', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.picturepanel',

    requires: [
        'Ext.lib.picturepanel.ViewController',
        'Ext.lib.LabelEditor',
        'Ext.lib.shared.Toolbar',
        'Ext.lib.shared.PanelBuilders',
        'Ext.lib.form.field.MultiFile'
    ],

    mixins: [
        'Ext.lib.shared.PanelBuilders'
    ],

    controller: 'picturepanel',

    config: {
        pictureUrlPrefix: null,
        title: 'Картинки',
        multiFile: false,
        autoScroll: true
    },

    items: [{
        xtype: 'form',
        hidden: true,
        reference: 'addForm',
        items: [{
            name: 'image',
            xtype: 'filefield',
            reference: 'addFormFileField',
            acceptMimes: ['image'],
            acceptSize: 30000,
            buttonOnly: true,
            listeners: {
                change: 'onAddWindowClose'
            }
        }]
    }, {
        reference: 'pictureView',
        xtype: 'dataview',
        plugins: [{
            ptype: 'labeleditor',
            dataIndex: 'name'
        }],
        loadMask: false,
        emptyText: 'Нет изображений',
        itemSelector: 'div.picture',
        multiSelect: true,
        autoScroll: true,
        trackOver: true,
        overItemCls: 'x-item-over',
        listeners: {
            selectionchange: 'onChangeSelect',
            itemdblclick: 'onPictureDblClick'
        }
    }],

    constructor: function(currentConfig) {
        var config = {};
        var dataViewConfig = this.items[1];
        var formFileFieldConfig = this.items[0].items[0];

        config.suffix = currentConfig.suffix || this.xtype;
        Ext.apply(config, this.getInitialConfig());
        Ext.apply(config, Ext.clone(currentConfig));
        Ext.apply(config, Ext.clone(this.cfg));
        this.formToolbarConfig(config);

        // Настраиваем dataView
        dataViewConfig.tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="picture">',
                    '<img width="{small_width}" height="{small_height}" src="' +
                    config.pictureUrlPrefix +
                    '/get_small/{id}?_dc={[new Date()]}"/>',
                    '<span class="x-editable">{name}</span>',
                '</div>',
            '</tpl>'
        );
        dataViewConfig.bind = {
            store: config.store || '{pictures}'
        };
        if (config.multiFile) {
            formFileFieldConfig.xtype = 'multifile';
            formFileFieldConfig.name = 'image[]';
        }
        Ext.apply(this, config);
        this.callParent(arguments);
    }
});
