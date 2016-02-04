Ext.define('Ext.lib.imagegallery.ViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.imagegallery',

    onChangePicture: function(id) {
        var me = this;
        var store = me.getView().getStore();

        store.getProxy().setExtraParam('q[id_eq]', id);
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
                view.getByRef('img').setSrc(view.fullImagesUri + record.get(view.imageField));
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
        }
    }
});
