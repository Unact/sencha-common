Ext.define('Ext.lib.shared.Detailable', {
    mixinId: 'detailable',
   
    /**
     * Возвращает true, если надо задизейблить таблицу (грид или дерево)
     * @param {Ext.data.Model} master - Выбранный мастер, если мастера нет, то null
     * @return {Boolean}
     */
    isDisabledView: function(master) {
        if(master == null) {
            return true;
        }
        return master.phantom;
    } 
});