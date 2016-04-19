Ext.define('Ext.lib.shared.CheckmarkToolbar', {
    extend : 'Ext.Toolbar',
    alias : 'widget.sharedcheckmarktoolbar',

    enabledButtons: [
        'refresh',
        'save',
        'filterCheck',
        'branch'
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
        if (me.enabledButtons.indexOf('filterCheck')!=-1 && !me.disableFilterCheck) {
            buttons.push({
                reference: 'filterCheck' + me.suffix,
                icon: '/images/check.png',
                tooltip: 'Фильтровать отмеченные',
                handler : 'onFilterCheck',
                enableToggle: true
            });
        }
        if (me.enabledButtons.indexOf('branch')!=-1 && !me.disableBranch) {
            buttons.push({
                reference : 'branch' + me.suffix,
                icon : '/images/node_tree.png',
                tooltip : 'Обрабатывать подветви',
                handler : 'onBranch',
                enableToggle: true
            });
        }

        if (me.afterButtons != null) {
            for ( i = 0; i < me.afterButtons.length; i++) {
                buttons.push(me.afterButtons[i]);
            }
        }
        
        me.items = buttons;
        me.callParent();
    }
});
