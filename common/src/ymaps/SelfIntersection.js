Ext.define('Renew.ymaps.SelfIntersection', {
    extend: 'Ext.Mixin',

    selfIntersectionAddEvents: function(polygon) {
        polygon.events.add('intersectiondetectionend', this.onSelfIntersectionIntersectionDetectionEnd, this);
        polygon.events.add('mapchange', this.onSelfIntersectionMapChange, this);
    },

    selfIntersectionRemovePlacemarks: function(map, colleciton) {
        map.geoObjects.remove(colleciton);
        colleciton.removeAll();
    },

    onSelfIntersectionMapChange: function(event) {
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
            var msg = 'Точка самопересечения.';
            if (event.get('lengthCheck') !== null && event.get('lengthCheck') !== undefined) {
                msg += ' Определяются "на лету" для полигонов ' +
                    'с количеством верним не превышающем ' + event.get('lengthCheck') + '.';
            }
            selfIntersectionCollection.add(new ymaps.Placemark(coordinates, {
                balloonContent: msg
            }, {
                preset: 'islands#greenDotIcon'
            }));
        });

        me.map.geoObjects.add(selfIntersectionCollection);
    },

    // Условие использования этой функции - модель, представляющая зону должна иметь поле polygon, которае
    // ссылается на объект ymaps.Polygon
    //
    // Фнкция должна испльзоваться в обработчике ошибки при синхронизации стора с зонами.
    selfIntersectionSyncErrorHandler: function(polygon, message) {
        var re = /Validation failed: Зона имеет самопересечение в точке \[([+-]?\d+(\.\d+)?); ([+-]?\d+(\.\d+)?)\]/;
        var found = message.match(re);

        if (found !== null) {
            polygon.events.fire('intersectiondetectionend', {
                points: [[parseFloat(found[1]), parseFloat(found[3])]]
            });
        }
    }
});
