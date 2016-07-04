Ext.define('Renew.ymaps.SelfIntersection', {
    extend: 'Ext.Mixin',

    selfIntersectionAddEvents: function(polygon) {
        polygon.events.add('intersectiondetectionend', this.onSelfIntersectionIntersectionDetectionEnd, this);
        polygon.events.add('mapchange', this.onSelfIntersectionMapChange, this);
    },

    selfIntersectionRemovePlacemarks(map, colleciton) {
        map.geoObjects.remove(colleciton);
        colleciton.removeAll();
    },

    onSelfIntersectionMapChange(event) {
        var me = this;
        var map = event.get('oldMap');
        var polygon = event.get('target');

        // Это признак удаления объекта с карты
        if (map !== null) {
            var selfIntersectionCollection = polygon.properties.get('selfIntersectionCollection');
            if (selfIntersectionCollection !== undefined) {
                me.selfIntersectionRemovePlacemarks(map, selfIntersectionCollection);
            }
        }
    },

    onSelfIntersectionIntersectionDetectionEnd: function(event) {
        var me = this;
        var polygon = event.get('target');
        var selfIntersectionCollection = polygon.properties.get('selfIntersectionCollection');

        //Первое срабатывание события для полигона
        if (selfIntersectionCollection === undefined) {
            selfIntersectionCollection = new ymaps.GeoObjectCollection();
            polygon.properties.set('selfIntersectionCollection', selfIntersectionCollection);
        }

        me.selfIntersectionRemovePlacemarks(me.map, selfIntersectionCollection);

        event.get('points').forEach(function(coordinates) {
            selfIntersectionCollection.add(new ymaps.Placemark(coordinates, {
                balloonContent: 'Точка самопересечения. Определяются "на лету" для полигонов ' +
                    'с количеством верним не превышающем ' + event.get('lengthCheck') + '.'
            }, {
                preset: 'islands#greenDotIcon'
            }));
        });

        me.map.geoObjects.add(selfIntersectionCollection);
    }
});
