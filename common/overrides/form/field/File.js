Ext.define('Ext.overrides.form.field.File', {
	override : 'Ext.form.field.File',

	encoding : 'utf-8',

	checkFile: function(file){
		var me = this,
			errors = [];

		if (me.acceptSize && file.size > me.acceptSize * 1024) {
			errors.push('Размер файла' +
				(file.size / 1048576).toFixed(1) +
				' MB (не должен превышать ' + (me.acceptSize / 1024).toFixed(1) + ' MB)');
		}

		if (me.acceptMimes && me.acceptMimes.indexOf(file.type) === -1) {
			errors.push('Неправильный тип файла: ' + file.type);
		}

		return errors.length>0 ? errors.join("\n") : true;
	},

	checkCurrentFile: function(){
		return checkFile(file = me.fileInputEl.getAttribute('file')[0]);
	},

	readTextFile: function(callback){
		var me = this,
			file = me.fileInputEl.getAttribute('files')[0];

		if(file){
			check = me.checkFile(file);

			if(check!==true){
				Ext.Msg.alert('Ошибка', check);
				me.reset();
			} else {
				if (window.File && window.FileReader && window.FileList && window.Blob) {
					reader = new FileReader();
					reader.onload = function(event) {
		                callback(event.target.result);
		                me.reset();
		            };

					reader.onerror = function(event) {
						Ext.Msg.alert('Ошибка', "Файл не может быть прочитан! Код " + event.target.error.code);
						me.reset();
					};

					reader.readAsText(file, me.encoding);
				} else {
					Ext.Msg.alert('Ошибка', 'API для работы с файлами не поддерживается Вашим браузером');
				}
			}
		}
	}
});
