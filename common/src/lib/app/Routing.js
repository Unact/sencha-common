Ext.define('Ext.lib.app.Routing', {
	extend : 'Ext.app.Controller',
	
	routes : {
		':id' : {
			before : 'beforeNavigate',
			action : 'onNavigate'
		}
	},

	listen : {
		controller : {
			'#' : {
				unmatchedroute : 'onUnmatchedRoute'
			}
		}
	},
	
	onUnmatchedRoute : function(hash) {
		this.redirectTo("index");
	},

	beforeNavigate : function(id, action) {
		var me = this,
			item = me.cards.items.get(id);
		
		if (item) {
			action.resume();
		} else {
			me.onUnmatchedRoute(id);
		}
	},

	onNavigate : function(id) {
		var me = this,
			newCard = me.cards.setActiveItem(id);
		
		if(newCard){
			document.title = newCard.lookupViewModel().get('title');
		}
	},
	
	onLaunch : function() {
		var controller = this,
			mainView = controller.application.getMainView();
		
		controller.cards = mainView.lookupReference('mainPanel');
	}
});