Ext.define('Ext.overrides.dom.UnderlayPool', {
    override: 'Ext.dom.UnderlayPool',

    /// Fix errors
    /// Cannot read property 'value' of null
    /// Cannot read property 'style' of null
    /// https://www.sencha.com/forum/showthread.php?308989-Grbage-collector-destroys-cached-elements

    checkOut: function () {
        var cache = this.cache,
            len = cache.length,
            el;

        // do cleanup because some of the objects might have been destroyed
        while (len--) {
            if (cache[len].destroyed) {
                cache.splice(len, 1);
            }
        }
        // end do cleanup

        el = cache.shift();

        if (!el) {
            el = Ext.Element.create(this.elementConfig);
            el.setVisibilityMode(2);
            //<debug>
            // tell the spec runner to ignore this element when checking if the dom is clean
            el.dom.setAttribute('data-sticky', true);
            //</debug>
        }

        return el;
    }
});
