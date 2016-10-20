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

        me.timefield.on('change', me.changeTimeValue, me);
        me.datefield.on('change', me.changeDateValue, me);
    },

    changeTimeValue: function(field, newValue){
        var me = this;
        var date = me.datefield.getValue();

        me.suspendFieldValueChange++;
        me.mixins.field.setValue.call(me, me.computeDateTime(date, newValue));
        (new Ext.util.DelayedTask()).delay(1000,
            function(){
                me.suspendFieldValueChange--;
            }
        );
    
        return true;
    },

    changeDateValue: function(field, newValue){
        var me = this;
        var time = me.timefield.getValue();

        // Иногда приходят странные значения newValue, в таких случаях ничего делать не надо
        me.suspendFieldValueChange++;    
        me.mixins.field.setValue.call(me, me.computeDateTime(newValue, time));
        // Когда сенча обновляет bind, она заново вызывает setValue, которая меняет значения в полях снова
        // чтобы такого цикла не было, даем сенче время на обновление bind
        (new Ext.util.DelayedTask()).delay(1000,
            function(){
                me.suspendFieldValueChange--;
            }
        );
        
        return true;
    },

    // Если дата или время null то и значение должно быть null
    computeDateTime: function(date, time){
        var value = null;
        if (date instanceof Date){
            if (time instanceof Date){
                value = Ext.Date.clearTime(date);
                value = Ext.Date.add(value, Ext.Date.HOUR, time.getHours());
                value = Ext.Date.add(value, Ext.Date.MINUTE, time.getMinutes());
            }
        }

        return value;
    },

    setValue: function(value){
        var me = this;
        me.mixins.field.setValue.call(me, value);

        if (!me.suspendFieldValueChange){
            // Проведем изменение значений без ивентов
            me.timefield.suspendEvents();
            me.datefield.suspendEvents();
            me.datefield.setValue(value);
            me.timefield.setValue(value);
            me.datefield.resumeEvents();
            me.timefield.resumeEvents();
        }
    },

    setDisabled: function(value){
        var me = this;

        me.callParent(arguments);
        me.datefield.setDisabled(value);
        me.timefield.setDisabled(value);
    },

    resetOriginalValue: function(){
        var me = this;

        me.mixins.field.resetOriginalValue.call(me);
        me.getFields().forEach(function(el){
            el.resetOriginalValue();
        });
    },

    isValid: function(){
        var me = this,
            valid = true;

        me.getFields().forEach(function(el){
            valid = !valid ? !el.isValid() : valid;
            
        });
        return valid;
    },

    getFields: function(){
        return this.items.items;
    }
});
