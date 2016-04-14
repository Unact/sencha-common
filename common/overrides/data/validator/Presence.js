Ext.define('Ext.overrides.data.validator.Presence', {
	override : 'Ext.data.validator.Presence',

	config: {
		allowEmty: false,
		message: 'не может быть пустым'
	}
}); 
