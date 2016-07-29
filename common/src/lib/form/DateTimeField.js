Ext.define('Ext.lib.form.DateTimeField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.datetimefield',

    mixins: ['Ext.form.field.Field'],

    layout: 'column',

    defaultMargins: '0 0 0 0',

    flex: 1,

    // Если включен, значит у полей не надо менять значения
    suspendFieldValueChange: 0,

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
        me.on('change', me.changeValue, me);
    },

    changeTimeValue: function(field, newValue, oldValue, eOpts){
        var me = this;
        var date = me.datefield.getValue();

        if (newValue instanceof Date || newValue === null){
            me.suspendFieldValueChange++;
            me.setValue(me.computeDateTime(date, newValue));
            me.suspendFieldValueChange--;
        }
        return true;
    },

    changeDateValue: function(field, newValue, oldValue, eOpts){
        var me = this;
        var time = me.timefield.getValue();

        // Иногда приходят странные значения newValue, в таких случаях ничего делать не надо
        if (newValue instanceof Date || newValue === null){
            me.suspendFieldValueChange++;
            me.setValue(me.computeDateTime(newValue, time));
            me.suspendFieldValueChange--;
        }

        return true;
    },

    changeValue: function(field, newValue, oldValue, eOpts){
        var me = this;

        if (!me.suspendFieldValueChange){
            // Проведем изменение значений без ивентов и проверок
            me.datefield.suspendCheckChange++;
            me.timefield.suspendCheckChange++;

            me.datefield.setValue(newValue);
            me.timefield.setValue(newValue);
            
            me.timefield.suspendCheckChange--;
            me.datefield.suspendCheckChange--;
        }
    },

    // Если дата или время null то и значение должно быть null
    computeDateTime: function(date, time){
        var value = null;
        if (date){
            if (time){
                value = Ext.Date.clearTime(date);
                value = Ext.Date.add(value, Ext.Date.HOUR, time.getHours());
                value = Ext.Date.add(value, Ext.Date.MINUTE, time.getMinutes());
            }
        }

        return value;
    },

    setDisabled: function(value){
        var me = this;

        me.callParent(arguments);
        me.datefield.setDisabled(value);
        me.timefield.setDisabled(value);
    },

    resetOriginalValue: function(){
        var me = this;

        me.callParent();
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
