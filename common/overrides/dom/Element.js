Ext.define('Ext.overrides.dom.Element', {
    override: 'Ext.dom.Element',

    setStyle: function(prop, val) {
        return this.dom ? this.callParent([prop, val]) : this;
    },

    getValue: function(asNumber) {
        return this.dom ? this.callParent([asNumber]) : null;
    }
});
