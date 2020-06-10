Ext.define('Ext.lib.imagegallery.View', {
    extend: 'Ext.view.View',
    alias: 'widget.imagegallery',

    requires: [
        'Ext.lib.imagegallery.ViewController'
    ],

    controller: 'imagegallery',

    /*
        Обязательно передавать в моделе:
            small_url - ссылка на превью
            url - путь к полным изображениям

        Имя окна с полным изображением задается через конфиг windowName.
        Если нужны скроллы, использовать стандартный конфиг для View - scrollable.
    */

    constructor: function(initialConfig) {
        var me = this,
            config;
        Ext.apply(config, me.getInitialConfig());
        Ext.apply(config, initialConfig);
        Ext.apply(this, config);
        me.callParent(arguments);
    },

    initComponent: function() {
        var me = this,
            controller = me.getController();

        me.fullImageWindow = new Ext.window.Window({
            title: me.windowName ? me.windowName : 'Фотография',
            width: '66%',
            height: '66%',
            referenceHolder: true,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    reference: 'leftButton',
                    xtype: 'button',
                    text: '<',
                    listeners: {
                        click: 'onLeftButtonClick',
                        scope: controller
                    }
                }, {
                    reference: 'imageContainer',
                    xtype: 'container',
                    flex: 1,
                    layout: 'container',
                    items: [{
                        reference: 'img',
                        xtype: 'image',
                        alt: 'Изображение',
                        style: {
                            maxHeight: '100%',
                            maxWidth: '100%',
                            display: 'block',
                            margin: 'auto'
                        },
                        listeners: {
                            load: {
                                element: 'el',
                                fn: 'onImageLoaded',
                                scope: controller
                            }
                        }
                    }]
                }, {
                    reference: 'rightButton',
                    xtype: 'button',
                    text: '>',
                    listeners: {
                        click: 'onRightButtonClick',
                        scope: controller
                    }
                },
            ],
            listeners: {
                beforeclose: 'onBeforeFullImageClose',
                scope: controller
            }
        });

        me.tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="x-gallery-thumb-wrap">',
                    '<div class="x-gallery-thumb">',
                        '<div class="x-gallery-centered-image" style="background-image:url({small_url})">',
                        '</div>',
                    '</div>',
                '</div>',
            '</tpl>'
        );

        me.callParent();
    },
    itemSelector: 'div.x-gallery-thumb-wrap',
    deferEmptyText: false,
    emptyText: '<div class="x-gallery-empty-text">Нет фотографий для отображения</div>',
    listeners: {
        changepicture: 'onChangePicture',
        beforeselect: 'onItemClick',
        scope: 'controller'
    },

    getByRef: function(refName) {
        return this.fullImageWindow.lookupReference(refName);
    }
});
