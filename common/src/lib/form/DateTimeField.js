Ext.define('Ext.lib.form.DateTimeField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.datetimefield',

    mixins: ['Ext.form.field.Text'],

    layout: 'column',
    defaultMargins: '0 0 0 0',
    dateFormat: 'd.m.Y',
    timeFormat: 'H:i',
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
        var parsedValue = '';
                
        if (dateValue){
            if (timeValue){
                value = dateValue + ' ' + timeValue;
                format = me.dateFormat + ' ' + me.timeFormat;
            } else {
                value = dateValue;
                format = me.dateFormat;
            }
            parsedValue = Ext.Date.parse(value, format);
        }
        return parsedValue === '' ? null : parsedValue;
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
