Ext.define('Ext.lib.view.PlainTable', {
	extend: 'Ext.Component',
	alias: 'widget.plaintable',

	defaultBindProperty: 'data',

	standartTpl: [
		'<table>',
			'<tpl if="columns"><tr><tpl for="columns"><th>{.}</th></tpl></tr></tpl>',
			'<tpl if="rows">',
				'<tpl for="rows"><tr><tpl for="."><td>{.}</td></tpl></tr></tpl>',
			'</tpl>',
		'</table>'],

	rotatedTpl: [
		'<table>',
			'<tpl if="rows">',
				'<tpl for="rows">',
					'<tr>',
						'<td style="font-weight: bold;">{[parent.columns[xindex-1]]}</td>',
						'<tpl for=".">',
							'<td>{.}</td>',
						'</tpl>',
					'</tr>',
				'</tpl>',
			'</tpl>',
		'</table>'],

	constructor: function(config){
		var me = this;

		Ext.apply(me, config);

		me.tpl = new Ext.XTemplate(me.rotated ? me.rotatedTpl : me.standartTpl);

		me.setData(config.xmlData);

		me.callParent(arguments);
	},

	setData: function(data){
		var me = this,
			newData = {
				columns: [],
				rows: []
			},
			i;

		if(me.rootElement && me.rootElement.length>0){
			me.data = (data && data.length>0) ? Ext.lib.view.PlainTable.parseXML(
				Ext.util.Format.htmlDecode(data),
				me.rootElement) : null;

		} else {
			me.data = data;
		}

		if(me.fields && me.data){
			me.fields.forEach(function(field){
				i = me.data.columns.indexOf(field);
				if(i!=-1){
					newData.columns.push(me.data.columns[i]);
					newData.rows.push(me.data.rows[i]);
				}
			});
			me.data = newData;
		}
		me.update(me.data);
	},

	statics: {
		parseXML: function(xmlData, rootElement){
			var parser = new DOMParser(),
				xmlDoc = parser.parseFromString(xmlData, "text/xml"),
				x = xmlDoc.getElementsByTagName(rootElement)[0].childNodes,
				row,
				data = {
					columns: [],
					rows: []
				};

			for ( i = 0; i < x.length; i++) {
				data.columns.push(x[i].getAttribute('name'));
				row = [];
				if (x[i].childNodes.length > 0) {
					row.push(x[i].childNodes[0].nodeValue);
				}

				data.rows.push(row);
			}
			return data;
		}
	}
});
