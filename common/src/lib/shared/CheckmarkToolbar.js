Ext.define('Ext.lib.shared.CheckmarkToolbar', {
    extend: 'Ext.lib.shared.BaseToolbar',
    alias : 'widget.sharedcheckmarktoolbar',

    additionalEnabledButtons: [
        'filterCheck',
        'branch'
    ],

    additionalButtons: function() {
        var buttons = [];

        if (this.enabledButtons.indexOf('filterCheck')!=-1 && !this.disableFilterCheck) {
            buttons.push({
                reference: 'filterCheck' + this.suffix,
                icon: '/images/check.png',
                tooltip: 'Фильтровать отмеченные',
                handler: 'onFilterCheck',
                enableToggle: true,
                margin: this.sharedToolbarButtonMargins
            });
        }
        if (this.enabledButtons.indexOf('branch')!=-1 && !this.disableBranch) {
            buttons.push({
                reference: 'branch' + this.suffix,
                icon: '/images/node_tree.png',
                tooltip: 'Обрабатывать подветви',
                handler: 'onBranch',
                enableToggle: true,
                margin: this.sharedToolbarButtonMargins
            });
        }

        return buttons;
    }
});
