Ext.define('Ext.lib.shared.Toolbar', {
    extend : 'Ext.Toolbar',
    alias : 'widget.sharedtoolbar',

    enabledButtons: [
        'refresh',
        'save',
        'add',
        'delete'
    ],
    
    overflowHandler: 'scroller',
    
    initComponent: function() {
        var me = this;
        var buttons = [];

        if (me.beforeButtons != null) {
            for (i = 0; i < me.beforeButtons.length; i++) {
                buttons.push(me.beforeButtons[i]);
            }
        }
        
        if (me.enabledButtons.indexOf('refresh')!=-1 && !me.disableRefresh) {
            buttons.push({
                reference : 'refresh' + me.suffix,
                icon : '/images/refresh.gif',
                tooltip : 'Обновить',
                handler : 'onRefresh'
            });
        }
        if (me.enabledButtons.indexOf('save')!=-1 && !me.disableSave) {
            buttons.push({
                reference : 'save' + me.suffix,
                icon : '/images/save.png',
                tooltip : 'Сохранить',
                handler : 'onSave'
            });
        }
        if (me.enabledButtons.indexOf('add')!=-1 && !me.disableAdd) {
            buttons.push({
                reference : 'add' + me.suffix,
                icon : '/images/add.gif',
                tooltip : 'Добавить',
                handler : 'onAdd'
            });
        }
        if (me.enabledButtons.indexOf('delete')!=-1 && !me.disableDelete) {
            buttons.push({
                reference : 'delete' + me.suffix,
                icon : '/images/delete.gif',
                disabled : true,
                tooltip : 'Удалить',
                handler : 'onDelete'
            });
        }

        if (me.afterButtons != null) {
            for ( i = 0; i < me.afterButtons.length; i++) {
                buttons.push(me.afterButtons[i]);
            }
        }
        
        me.items = buttons;
        me.callParent(arguments);
    }
});
