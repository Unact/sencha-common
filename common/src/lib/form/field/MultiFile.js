/**
 * Класс позволяет загружать более одного файла
 */
Ext.define('Ext.lib.form.field.MultiFile', {
	extend: 'Ext.form.field.File',
	alias: 'widget.multifile',
	
	listeners: {
		render: function(me, eOpts) {
			me.fileInputEl.set({
				multiple: true
			});
		}
	},

	initComponent: function() {
		var me = this;

		me.on('render', function() {
			me.fileInputEl.set({
				multiple: true
			});
		});

		me.callParent(arguments);
	},

	onFileChange: function(button, e, value) {
		this.duringFileSelect = true;

		var me = this, upload = me.fileInputEl.dom, files = upload.files, names = [];

		if (files) {
			for (var i = 0; i < files.length; i++)
				names.push(files[i].name);
			value = names.join(', ');
		}

		Ext.form.field.File.superclass.setValue.call(this, value);
		delete this.duringFileSelect;
		this.fileInputEl.set({
			multiple: true
		});
	}
});

