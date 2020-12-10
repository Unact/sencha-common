Ext.define('Ext.overrides.dataview.Abstract', {
    override: 'Ext.dataview.Abstract',

    onInnerFocusEnter: function(e) {
        var me = this,
            navigationModel = me.getNavigationModel(),
            focusPosition, itemCount;





        if (navigationModel.lastLocation === 'scrollbar') {
            if (e.relatedTarget) {
                e.relatedTarget.focus();
            }
            return;
        }

        if (e.target === me.getFocusEl().dom) {
            focusPosition = me.restoreFocus && navigationModel.getPreviousLocation();
            if (focusPosition) {






                focusPosition = focusPosition.refresh();
            }


            else if (e.backwards) {
                focusPosition = me.getLastDataItem();
            } else

            {
                focusPosition = me.getFirstDataItem();
            }
        } else

        {
            focusPosition = e;
        }

        me.toggleChildrenTabbability(false);
        itemCount = me.getFastItems().length;

        // FIX
        // https://forum.sencha.com/forum/showthread.php?347730-Issue-on-focus-when-dataview-has-items-but-no-records
        if (itemCount && focusPosition) {



            if (focusPosition.isWidget) {
                focusPosition = focusPosition.getFocusEl() || focusPosition.el;
            }

            navigationModel.setLocation(focusPosition, {
                event: e,
                navigate: false
            });
        }




        if (navigationModel.getLocation()) {
            me.el.dom.setAttribute('tabIndex', -1);
        }
    },
});
