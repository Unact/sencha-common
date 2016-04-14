Ext.define('Renew.ymaps.Bound', {
	requires: [
		'Renew.ymaps.Defaults'
	],
	
	//bounds - массив областей
	//Функция возвращает границу области, содуржащую все области из массива областей bounds
	//Если массив областей состоит из всех null объектов или массив областей не задан, то вернется [center, center]
	superBounds: function(bounds) {
		var result = [Renew.ymaps.Defaults.center, Renew.ymaps.Defaults.center],
		    indexNotNull;

		if(bounds==null || bounds.length == 0)
			return result;
		
		//Найдем первый не null элемент в массиве bounds и назначим этот элемент новому result
		for(var i = 0, len = bounds.length; i < len; i++) {
			var b = bounds[i];
			
			if(b) {
				indexNotNull = i;
				result = b; 
				break;
			}
		};
		
		//Найдем область, содержащую все области из массива областей bounds
		for(var i = indexNotNull + 1, len = bounds.length; i < len; i++) {
			var b = bounds[i];
			
			if(b) 			
				result = [[Math.min(result[0][0], b[0][0]), Math.min(result[0][1], b[0][1])],
				          [Math.max(result[1][0], b[1][0]), Math.max(result[1][1], b[1][1])]];
		}

		return result;
	},
	
	//coord - массив из двух элементов
	//Функция проверяет, что оба элемента массива хранят числа в интервале -180..180
	validCoord: function(coord) {
		if(coord==null)
			return false;
		
		return typeof coord[0] == 'number' && coord[0] >= -180 && coord[0] <= 180
		    && typeof coord[1] == 'number' && coord[1] >= -180 && coord[1] <= 180;
	}
});
