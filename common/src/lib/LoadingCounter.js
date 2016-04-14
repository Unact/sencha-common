Ext.define('Ext.lib.LoadingCounter', {

	/**
	 * @private
	 * @property {Number} countDownCounter
	 * Счетчик обратного отсчета.
	 */
	countDownCounter: 0,

	/**
	 * @private
	 * @property {Function} countDownCallback
	 * Функция обратного вызова, вызываемая, при обнулении счечтика обратного отсчета.
	 */	

	/**
	 * Инициируются параметры счетчика обатного отсчета и компоненту устанавливается loading
	 * @param {Object} initCntDwn Начальное значение счетчика обратного отсчета
	 * @param {Object} callbackCntDwn Функция обратного вызова
	 * @return {Ext.LoadMask} The LoadMask instance that has just been shown. 
	 */
	setLoadingCounter: function(initCntDwn, callbackCntDwn) {
		var me = this;
		
		me.countDownCounter = initCntDwn;
		me.countDownCallback = callbackCntDwn;
		
		return me.setLoading(true);
	},

	/**
	 * Уменьшить счетчик обратного вызова на 1. Если дошли до 0, то компоненту снимается loading и вызывается функция обратного вызова.
	 * @return {Ext.LoadMask} The LoadMask instance that has just been shown.
	 */
	loadingCountDown: function() {
		var me = this;
		
		if(0 == --me.countDownCounter) {
			var ret = me.setLoading(false);
			if(me.countDownCallback && (typeof me.countDownCallback)=="function")
				me.countDownCallback();
			return ret;
		}
	},

	/**
	 * Сброс счетчика обратного отсчета. Компоненту снимается loading
	 * @param {Boolean} silent 'true' - не вызывать функцию обратного вызова
	 * @return {Ext.LoadMask} The LoadMask instance that has just been shown.
	 */
	loadingBreak: function(silent) {
		var me = this;
		
		me.countDownCounter = 0;
		
		if(!silent)
			if(me.countDownCallback && (typeof me.countDownCallback)=="function")
				me.countDownCallback();
		
		me.countDownCallback = null;
		
		return me.setLoading(false);
	}
});
