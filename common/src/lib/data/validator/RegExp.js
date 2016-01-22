Ext.define('Ext.lib.data.validator.RegExp', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.regexp',
    
    type: 'regexp',
    
    config: {
        message: 'Неверное регулярное выражение'
    },

    validate: function(value) {
        var result = true;
        try {
            new RegExp(value);
        } catch(e) {
            result = false;
        }
        return result ? result : this.getMessage();
    }
});