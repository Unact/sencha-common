/**
 * Специальный класс для работы с универсальным REST API.
 * Уже настроены заголовки и параметры безопасности.
 * Дополнительно надо указать имя сущности.
 */
Ext.define('Ext.lib.data.RestXmlStore', {
	extend: 'Ext.data.Store',

	alias: 'store.restxml',

	requires : [
		'Ext.data.proxy.Rest',
		'Ext.data.reader.Xml',
		'Ext.data.writer.Xml'],

	proxy: {
		type: 'rest',
		timeout: 120000,
		headers: {
			'HTTP_X_CSRF_TOKEN': window._token
		},
		extraParams: {
			_csrf: window._token
		},
		reader: {
			type: 'xml',
			messageProperty: 'error'
		},
		writer: {
			type:'xml'
		}
	},

	/**
	 *
	 * @param {Object} config. entityName - имя сущности. по нему автоматически создается конфигурация proxy
	 */
	constructor : function(config) {
		var currentProxyConfig = {},
			entityName = '',
			entityPluralName = '',
			currentConfig = {};

		Ext.apply(currentConfig, this.getInitialConfig());
		Ext.apply(currentConfig, config);

		currentProxyConfig = currentConfig.proxy,
		entityName = currentConfig.entityName,
		entityPluralName = Ext.util.Inflector.pluralize(entityName);

		currentProxyConfig.url = '/rest/' + entityPluralName;
		currentProxyConfig.reader.record = entityName;
		currentProxyConfig.reader.rootProperty = entityPluralName;
		currentProxyConfig.writer.record = entityName;
		currentProxyConfig.writer.documentRoot = entityPluralName;

		this.callParent(arguments);

		//Ext.apply(this, currentConfig);
	}
});
