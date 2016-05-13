Ext.define('Ext.lib.form.DateTimeField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.datetimefield',

    mixins: ['Ext.form.field.Field'],

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
            width: '50%'
        }
    ],

    initComponent: function(){
        var me = this;
        me.callParent(arguments);
        
        me.datefield =  me.getFields()[0];
        me.timefield = me.getFields()[1];
        me.initField();
        me.initialValue = me.originalValue = me.lastValue = me.getValue();
        

        me.timefield.on('change', me.changeTimeValue, me);
        me.datefield.on('change', me.changeDateValue, me);
    },

    changeTimeValue: function(field, newValue, oldValue, eOpts){
        var me = this;
        var date = me.datefield.getValue() || new Date();
        var len = field.getRawValue().length;

        if (field.isValid() && (len > 4)){
            me.setValue(me.addTime(date, newValue));
        } 

        if (len === 0) {
            me.setValue(null);
        }

        return true;
    },

    changeDateValue: function(field, newValue, oldValue, eOpts){
        var me = this;
        var time = me.timefield.getValue();
        var len = field.getRawValue().length;

        if (field.isValid() && (len > 9)){
            me.setValue(me.addTime(newValue, time));
        }

        if (len === 0) {
            me.setValue(null);
        }

        return true;
    },

    addTime: function(date, time){
        value = Ext.Date.clearTime(date);
        time = time || value;
        value = Ext.Date.add(value, Ext.Date.HOUR, time.getHours());
        value = Ext.Date.add(value, Ext.Date.MINUTE, time.getMinutes());

        return value;
    },

    setDisabled: function(value){
        var me = this;

        me.callParent(arguments);
        me.datefield.setDisabled(false);
        me.timefield.setDisabled(false);
        return true;
    },
    
    setValue: function(value){
        var me = this;
        var timeValue = me.timefield.getValue();
        var dateValue = me.datefield.getValue();
        var timeValueSet = value;
        var dateValueSet = value;

        if (!value){
            dateValueSet = dateValue ? dateValue : value;
            timeValueSet = timeValue ? timeValue : value;
            if (dateValue && timeValue){
                dateValueSet = null;
                timeValueSet = null;
            }
        }
        
        me.datefield.setValue(dateValueSet);
        me.timefield.setValue(timeValueSet);
        me.mixins.field.setValue.call(me, value);
        me.value = value;

        return true;
    },
    
    getValue: function(){
        return this.value;
    },

    resetOriginalValue: function(){
        var me = this;

        me.getFields().forEach(function(el, i, array){
            el.resetOriginalValue();
        });
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
