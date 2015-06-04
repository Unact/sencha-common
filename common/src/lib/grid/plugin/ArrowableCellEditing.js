Ext.define('Ext.lib.grid.plugin.ArrowableCellEditing', {
	alias: 'plugin.arrowablecellediting',
	extend: 'Ext.grid.plugin.CellEditing',
	
	onSpecialKey: function(ed, field, e) {
		me=this, me;
		
		me.callParent(arguments);
		
		if(e.getKey()===e.DOWN){
            console.log('down');
           
			e.stopEvent();
			
			sm = ed.up('tablepanel').getSelectionModel();
			if(sm.onEditorDown) {
				return sm.onEditorDown(ed.editingPlugin, e);
			};
       };
        
        if(e.getKey()===e.UP){
            console.log('up');
           
			e.stopEvent();
			
			sm = ed.up('tablepanel').getSelectionModel();
			if(sm.onEditorUp) {
				return sm.onEditorUp(ed.editingPlugin, e);
			};
        };
	}
});