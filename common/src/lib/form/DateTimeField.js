Ext.define('Ext.lib.form.DateTimeField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.datetimefield',

    mixins: ['Ext.form.field.Text'],

    layout: 'column',
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
        var dateValue = me.getFields()[0].getRawValue();
        var timeValue = me.getFields()[1].getRawValue();
        var timeValues = timeValue.split(':');
        var value = '';
                
        if (dateValue){
            value  = Ext.Date.parse(dateValue, me.dateFormat);
            value  = Ext.Date.add(value, Ext.Date.HOUR,     timeValues[0]);
            value  = Ext.Date.add(value, Ext.Date.MINUTE,   timeValues[1]);
        }
        value = value === '' ? null : value;
        return value;
    },

    isValid: function(){
        var me = this,
            valid = true;

        me.getFields().forEach(function(el, i, array){
            valid = !valid ? !el.isValid() : valid;
            
        });
        return valid;
    },

    getFields: function(){
        return this.items.items;
    }
});
