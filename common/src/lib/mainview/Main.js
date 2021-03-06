Ext.define('Ext.lib.mainview.Main', {
    extend : 'Ext.container.Container',

    requires: ['Ext.state.CookieProvider'],

    referenceHolder: true,

    viewModel: Ext.create('Ext.app.ViewModel'),

    constructor: function(config){
    	var me = this,
    		items = [],
    		mainItem = {
		        xtype : 'container',
		        layout : 'card',
		        reference: 'mainPanel',
				width : '100%',
		        items: [{
			        // This page has a hidden tab so we can only get here during initialization. This
			        // allows us to avoid rendering an initial activeTab only to change it immediately
			        // by routing
			        xtype: 'component',
			        tabConfig: {
			            hidden: true
			        }
			    }]
		    },
		    i;
    	Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

    	if(me.disableMenu!==true){
    		me.layout = {
		        type : 'vbox'
		    };

    		items.push({
		    	xtype : 'toolbar',
				width : '100%',
				overflowHandler: 'scroller',
				items : Ext.JSON.decode(Ext.get('menu').getValue(), true)
		    });

		    mainItem.height = Ext.getBody().getViewSize().height - 40;
    	}

    	for(i = 0; i<me.cards.length; i++){
    		mainItem.items.push(me.cards[i]);
    	}

    	items.push(mainItem);
    	me.items = items;

    	document.getElementById("browser_message").innerHTML="";

    	me.callParent(arguments);
    }
});
