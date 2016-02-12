Ext.define('Renew.ymaps.Placemarkable', {
    options: ['iconLayout', 'iconImageHref', 'iconImageSize', 'iconImageOffset', 'preset'],

    getPlacemark: function() {
        var me = this;

        return me.placemark || me.createPlacemark();
    },

    createPlacemark: function() {
        var me = this;
        var coord = [me.get('latitude'), me.get('longitude')];
        var properties = {model: me};
        var options = {};
         
        Ext.getClass(me).getFields().forEach(function(field) {
            var fieldName = field.name;
            if(fieldName == 'latitude' || fieldName == 'longitude') {
                return;
            };
            
            var isOpt = me.options.some(function(opt) {
                return opt == fieldName;
            });
            
            
            if(isOpt) {
                options[fieldName] = me.get(fieldName);
            } else {
                properties[fieldName] = me.get(fieldName);    
            };
        });

        Ext.merge(properties, me.appendProperties());
        Ext.merge(options, me.appendOptions());
        
        me.placemark = new ymaps.Placemark(coord, properties, options);
        
        return me.placemark;
    },
    
    appendProperties: Ext.emptyFn,
    
    appendOptions: Ext.emptyFn
});
