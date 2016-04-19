Ext.define('Ext.lib.form.DateTimeField', {
    extend: 'Ext.container.Container',
    alias: 'widget.datetimefield',

    mixins: ['Ext.form.field.Text'],

    layout: 'column',
    timeFormat: 'H:i',
    defaultMargins: '0 0 0 0',
    dateFormat: 'd.m.Y',
    flex:1,

    items: [
        {
            xtype: 'datefield',
            format: 'd.m.Y',
            width: '50%'
        }, {
            xtype: 'timefield',
            increment: 15,
            format: 'H:i',
            width: '50%',
            validateOnChange: false
        }
    ],
    
    setValue: function(value){
        var me = this;

        me.getFields()[0].setValue(Ext.Date.format(value, me.dateFormat));
        me.getFields()[1].setValue(Ext.Date.format(value, me.timeFormat));
        
        return true;
    },

    resetOriginalValue: function(){
        var me = this;

        me.getFields().forEach(function(el, i, array){
            el.resetOriginalValue();
        });
    },

    getValue: function(){
        var me = this;
        var dateValue = me.getFields()[0].getValue();
        var timeValue = me.getFields()[1].getValue();
        var value = '';
        
        if (dateValue){
            value = Ext.Date.format(dateValue, 'Y-m-d');
            if (timeValue){
                value +=  ' ' + Ext.Date.format(timeValue, me.timeFormat);
            }
        }
        value = value === '' ? null : new Date(value);
        return value;
    },

    isValid: function(){
        var me = this,
            valid = true;

        me.items.items.forEach(function(el, i, array){
            valid = !valid ? !el.isValid() : valid;
            
        });
        return valid;
    },

    getFields: function(){
        return this.items.items;
    }
});
