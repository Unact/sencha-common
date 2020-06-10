Ext.define('Ext.lib.imagegallery.ViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.imagegallery',

    onChangePicture: function(id) {
        var me = this;
        var store = me.getView().getStore();

        store.getProxy().setExtraParam('id', id);
        store.load();
    },

    onItemClick: function(me, record, item, index) {
        var me = this,
            view = me.getView();

        view.fullImageWindow.show();
        me.setImage(record);
    },

    onLeftButtonClick: function() {
        var me = this;
        me.selectNextImage(-1);
    },

    onRightButtonClick: function() {
        var me = this;
        me.selectNextImage(1);
    },

    onImageLoaded: function() {
        var me = this;
        me.fitImageWindowWidth();
        me.getView().getByRef('imageContainer').setLoading(false);
    },

    onBeforeFullImageClose: function(panel) {
        var me = this;
        me.getView().setSelection(null);
        panel.hide();
        return false;
    },

    privates: {
        setImage: function(record) {
            var me = this,
                view = me.getView();

            view.getByRef('imageContainer').setLoading(true);
            if (record)
                view.getByRef('img').setSrc(record.get('url'));
        },

        selectNextImage: function(direction) {
            var me = this,
                view = me.getView(),
                sm = view.getSelectionModel(),
                store = view.getStore(),
                index = store.indexOf(sm.getSelection()[0]) + direction,
                count = store.count();

            sm.select(
                index == count ? 0 : (index == -1 ? count - 1 : index)
            );
        },

        fitImageWindowWidth: function() {
            var me = this;
            var view = me.getView();
            var wnd = view.fullImageWindow;
            var img = view.getByRef('imageContainer').items.get(0);
            var newWidth = Math.ceil(
                img.getWidth()/img.getHeight() * wnd.body.getHeight()   // ширина изображения
                + 2 * view.getByRef('leftButton').getWidth()            // плюс ширина кнопок
                + wnd.getSize().width - wnd.getSize(true).width         // плюс ширина рамки
            );

            if (newWidth !== wnd.getWidth())
                wnd.setX(Ext.getBody().getWidth()/2.0-newWidth/2.0, true);

            wnd.setWidth(newWidth);
        }
    }
});
