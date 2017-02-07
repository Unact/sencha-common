Ext.define('Ext.lib.SearchSupport', {
	idx: -1,
	search: null,
	nodes: [],

	reset: function() {
		var me = this;

		me.idx = -1;
		me.search = null;
		me.nodes = [];
	},

	isLast: function() {
		var me = this;

		return !(me.idx < me.nodes.length - 1);
	},

	next: function() {
		var me = this;

		if(!me.isEmpty()) {
			me.idx = (me.idx + 1) % me.nodes.length;
			return me.nodes[me.idx];
		} else
			return null;
	},

	setSearch: function(v) {
		var me = this;

		me.reset();
		me.search = v;
	},

	isEmpty: function() {
		var me = this;

		return me.nodes.length == 0;
	},

	push: function(v) {
		var me = this;

		me.nodes.push(v);
	}
});
