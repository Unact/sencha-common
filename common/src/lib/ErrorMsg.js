Ext.define('Ext.lib.ErrorMsg', {
	statics: {
		show: function(msg, operations) {
			var err, tail = "", body, bodyDetail = [];
			if(operations instanceof String) {
				err = operations; 
			} else {
				if(operations instanceof Array) {
					err = operations[0].getError();
					tail = '<br/>Всего ошибок: ' + operations.length;
				} else {
					err = operations.getError();
				}
			}
			
			if(err instanceof String) {
				body = err;
			} else {
				for (var key in err) {
					bodyDetail.push(key + " = " + err[key]);
				}
				body = bodyDetail.join("<br/>");
			}
			
			Ext.Msg.alert('Ошибка', msg + "<br/>" + body + tail);
		}
	}
});
