Ext.define('Ext.overrides.view.Table', {
    override: 'Ext.view.Table',

    enableTextSelection: true,

    /**
     * Переход и фокусировка к строке по индексу или записи
     * @param {Number/Ext.data.Model} nodeInfo индекс или запись.
     */
    scrollToRecord: function(nodeInfo, silentSelect) {
        var me = this;

        me.selModel.select(nodeInfo, false, silentSelect);
        if (me.bufferedRenderer) {
            if (nodeInfo != null) {
                me.bufferedRenderer.scrollTo(nodeInfo);
            }
        } else if (me.getRow(nodeInfo) !== null) {
            me.getRow(nodeInfo).scrollIntoView(me.getEl());
        }
    }
});
