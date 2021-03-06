Ext.define('Renew.ymaps.Placemarkable', {
    extend: 'Ext.Mixin',

    options: ['iconLayout', 'iconImageHref', 'iconImageSize', 'iconImageOffset', 'preset'],

    mixins: [
        'Renew.ymaps.Bound'
    ],

    getPlacemark: function() {
        var me = this;

        return me.placemark || me.createPlacemark();
    },

    createPlacemark: function() {
        var me = this;
        var properties = {model: me};
        var options = {};

        me.getFields().forEach(function(field) {
            var fieldName = field.getName();
            if(fieldName == 'latitude' || fieldName == 'longitude') {
                return;
            }

            var isOpt = me.options.some(function(opt) {
                return opt == fieldName;
            });


            if(isOpt) {
                options[fieldName] = me.get(fieldName);
            } else {
                properties[fieldName] = me.get(fieldName);
            }
        });

        Ext.merge(properties, me.appendProperties());
        Ext.merge(options, me.appendOptions());

        me.placemark = new ymaps.Placemark(this.getCoordinates(), properties, options);

        return me.placemark;
    },

    getCoordinates: function() {
        var coord = [this.get('latitude'), this.get('longitude')];

        if(!this.validCoord(coord)) {
            coord = Renew.ymaps.Defaults.center;
        }

        return coord;
    },

    appendProperties: Ext.emptyFn,

    appendOptions: Ext.emptyFn
});
