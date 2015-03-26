// функции для проверки различных значений (ИНН, расчетный счет и т.д.)
// возвращают истину, если значение верно и сообщение или ложь, если неправильное
Ext.define('Ext.lib.Checkers', {
	statics: {
		checkInnWIthMessage: function(value){
			var check=false;
			if(value==null || value.replace('\s', '')==''){
				return 'Введите ИНН';
			}
			
			value=value.replace('\s', '');
			if((value.length!=10 && value.length!=12) || isNaN(parseInt(value))){
				return 'ИНН должен состоять из 10 или 12 цифр';
			}
			if(value.length==10){
				check=(
					parseInt(value[9]) == (((2*parseInt(value[0])+4*parseInt(value[1])+10*parseInt(value[2])+
					3*parseInt(value[3])+5*parseInt(value[4])+9*parseInt(value[5])+4*parseInt(value[6])+
					6*parseInt(value[7])+8*parseInt(value[8])) % 11) % 10)
				);
			}
			if(value.length==12){
				check=(
					parseInt(value[10]) == (((7*parseInt(value[0])+2*parseInt(value[1])+4*parseInt(value[2])+
					10*parseInt(value[3])+3*parseInt(value[4])+5*parseInt(value[5])+9*parseInt(value[6])+
					4*parseInt(value[7])+6*parseInt(value[8])+8*parseInt(value[9])) % 11) % 10)
				);
				if(check){
					check=(
						parseInt(value[11]) == (((3*parseInt(value[0])+7*parseInt(value[1])+2*parseInt(value[2])+
						4*parseInt(value[3])+10*parseInt(value[4])+3*parseInt(value[5])+
						5*parseInt(value[6])+9*parseInt(value[7])+4*parseInt(value[8])+
						6*parseInt(value[9]) + 8*parseInt(value[10])) % 11) % 10)
					);
				}
			}
			return check || "Значение ИНН некорреткно";
		},
		
		checkInn: function(value){
			var check=false;
			
			if(value!=null){
				value=value.replace('\s', '');
				if(value.length==10){
					check=(
						parseInt(value[9]) == (((2*parseInt(value[0])+4*parseInt(value[1])+10*parseInt(value[2])+
						3*parseInt(value[3])+5*parseInt(value[4])+9*parseInt(value[5])+4*parseInt(value[6])+
						6*parseInt(value[7])+8*parseInt(value[8])) % 11) % 10)
					);
				}
				if(value.length==12){
					check=(
						parseInt(value[10]) == (((7*parseInt(value[0])+2*parseInt(value[1])+4*parseInt(value[2])+
						10*parseInt(value[3])+3*parseInt(value[4])+5*parseInt(value[5])+9*parseInt(value[6])+
						4*parseInt(value[7])+6*parseInt(value[8])+8*parseInt(value[9])) % 11) % 10)
					);
					if(check){
						check=(
							parseInt(value[11]) == (((3*parseInt(value[0])+7*parseInt(value[1])+2*parseInt(value[2])+
							4*parseInt(value[3])+10*parseInt(value[4])+3*parseInt(value[5])+
							5*parseInt(value[6])+9*parseInt(value[7])+4*parseInt(value[8])+
							6*parseInt(value[9]) + 8*parseInt(value[10])) % 11) % 10)
						);
					}
				}
			}
			return check;
		},
		
		checkOwnAccount: function(value){
			var check=false,
				weights = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1],
				//БУКВЫ РУССКИЕ!!!
				clearingCurrencyReplacement = {
					"А": 0, В: 1, С: 2,
					"Е": 3,
					"Н": 4,
					"К": 5,
					"М": 6,
					"Р": 7,
					"Т": 8,
					"Х": 9
				},
				controlValue = 0,
				cvRegexp = /\d{3}\d{5}(\d{1}|[АВСЕНКМРТХ]{1})\d{14}/;
			
			function getControlValue(v, CV){
				var product, cv = 0, intVal, i;
				
				for(i = 0; i< v.length; i++){
					intVal = parseInt(v[i]);
					if(i==8){
						if(isNaN(intVal)){
							intVal = clearingCurrencyReplacement[v[i]];
						}
					}
					
					product = intVal*weights[i]*(CV ? CV : 1);
					
					product = product.toString();
					cv += parseInt(product[product.length-1]);
				}
				return cv;
			}
			if(value!=null){
				value=value.replace('\s', '');
				
				if(cvRegexp.test(value)){
					controlValue = getControlValue(value)*3;
					
					controlValue = getControlValue(value, controlValue).toString();
					
					check = controlValue[controlValue.length-1]==0;
				}
			}
			return check;
		}
	}
});

Ext.apply(Ext.form.field.VTypes, {
	inn: function(value, field){
		return Ext.lib.Checkers.checkInn(value);
	},
	innText: 'Некорректный ИНН',
	innMask: /\d/,
	
	ownaccount: function(value, field){
		return Ext.lib.Checkers.checkOwnAccount(value);
	},
	ownaccountText: 'Некорректное значение лицевого счета',
	ownaccountMask: /[0-9 АВСЕНКМРТХ]/
});