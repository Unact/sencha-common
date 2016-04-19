//Функции для работы с полигонами
Ext.define('Renew.ymaps.Polygon', {
	statics: {
		//private
		checkLineIntersection: function(start1, end1, start2, end2){
			var dir1 = [end1[0] - start1[0], end1[1] - start1[1]],
				dir2 = [end2[0] - start2[0], end2[1] - start2[1]],
			//считаем уравнения прямых проходящих через отрезки
				a1 = -dir1[1],
				b1 = +dir1[0],
				d1 = -(a1 * start1[0] + b1 * start1[1]),
				a2 = -dir2[1], b2 = +dir2[0],
				d2 = -(a2 * start2[0] + b2 * start2[1]),
			//подставляем концы отрезков, для выяснения в каких полуплоскотях они
				seg1_line2_start = a2 * start1[0] + b2 * start1[1] + d2,
				seg1_line2_end = a2 * end1[0] + b2 * end1[1] + d2,
				seg2_line1_start = a1 * start2[0] + b1 * start2[1] + d1,
				seg2_line1_end = a1 * end2[0] + b1 * end2[1] + d1;
	
			//если концы одного отрезка имеют один знак, значит он в одной полуплоскости и пересечения нет.
			return !(seg1_line2_start * seg1_line2_end >= 0 || seg2_line1_start * seg2_line1_end >= 0);
		},
		
		//Функция проверяет пересечение полигонов
		//Параметр - GeoObjectCollection, состоящий из полигонов. У каждого полигона должно быть заполнено свойство id
		//Результат - массив пар id-ков пересекающихся полигонов 
		checkPolygonsIntersections: function(polygons){
			var polygonsCoordinates = [],
				i, j, k, l, flagNoIntersections,
				result = [];
			
			polygons.each(
				function(polygon){
					polygonsCoordinates.push({
						id: polygon.properties.get('id'),
						coords: polygon.geometry.getCoordinates()[0]
					});
				}
			);
			
			//смотрим попарно многоугольники
			//цикл для получения первого многоуольника
			for(i=0; i<polygonsCoordinates.length-1; i++){
				//если первый многоугольник имеет не меньше 3 вершин, то тогда сравниваем
				if(polygonsCoordinates[i].coords.length>=3){
					//цикл для получения второго многоугольника
					for(j=i+1; j<polygonsCoordinates.length; j++){
						//если второй многоугольник имеет не меньше 3 вершин, то тогда сравниваем
						if(polygonsCoordinates[j].coords.length>=3){
							flagNoIntersections = true;
							//проверяем попарно пересечение сторон
							//цикл получения вершин первого многоугольника
							for(k=0; k<polygonsCoordinates[i].coords.length-1 && flagNoIntersections; k++){
								//цикл получения вершин второго многоугольника
								for(l=0; l<polygonsCoordinates[j].coords.length-1 && flagNoIntersections; l++){
									if(
										this.checkLineIntersection(
											polygonsCoordinates[i].coords[k],
											polygonsCoordinates[i].coords[k+1],
											polygonsCoordinates[j].coords[l],
											polygonsCoordinates[j].coords[l+1])
									){
										result.push([polygonsCoordinates[i].id, polygonsCoordinates[j].id]);
										flagNoIntersections = false;
									}
								}
							}
						}
					}
				}
			}
			return result;
		}
	}
});
