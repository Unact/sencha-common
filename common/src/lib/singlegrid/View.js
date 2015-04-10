Ext.define('Ext.lib.singlegrid.View', {
	extend : 'Ext.lib.grid.Panel',
	alias : 'widget.singlegrid',

	requires : ['Ext.lib.singlegrid.ViewController'],

	controller : 'singlegrid'

	// Для методов добавления и обновления доступны "предварительные" шаблонные методы

	/**
	 * @cfg {function} beforeAdd
	 * beforeAdd - должен вернуть объект для вставки в хранилище
	 * /
	
	/** 
	 * @cfg {function} beforeRefresh
	 * beforeRefresh - должен вернуть истину
	 */
	
	// если "предварительные" методы возвращают другие значения, то основной метод далее не выполняется

	/**
	 * @cfg {boolean} enableDeleteDialog
	 * Показывать диалог подтверждения удаления или нет
	 */
});
