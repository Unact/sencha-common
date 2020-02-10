Ext.define('Ext.lib.imagepanel.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.imagepanel',

    beforeRefresh: function() {
        this.getView().getStore().getProxy().setExtraParam('model_id', this.getMasterId());
        return true;
    },

    beforeAdd: function(masterRecord) {
        return {
            model_id: this.getMasterId()
        };
    },

    onAdd: function() {
        const evt = document.createEvent('MouseEvents');
        const fileInput = this.getView().lookupReference('addFileField').fileInputEl.dom;

        if (this.masterExists()) {
            evt.initEvent('click', true, false);
            document.getElementById(fileInput.id).dispatchEvent(evt);
        }
    },

    masterExists: function() {
        return Ext.isNumeric(this.getMasterId());
    },

    getMasterId: function() {
        var selectedMaster = this.getViewModel().get('selectedMaster');
        return selectedMaster ? selectedMaster.get('id') : null;
    },

    onImageDblClick: function(view, record) {
        window.open(record.get('url'), '_blank');
    },

    onAddWindowClose: function() {
        const fileInput = this.getView().lookupReference('addFileField').fileInputEl.dom;

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            const addData = this.beforeAdd(this.getViewModel().get('selectedMaster'));

            for (const key in addData) {
                formData.set(key, addData[key]);
            }
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('images[]', fileInput.files[i]);
            }

            Ext.GlobalEvents.fireEvent('beginserveroperation');
            Ext.Ajax.request({
                headers: {
                    'Content-Type': null,
                    'Authorization': AppProperties.rapiHeader
                },
                url: this.getView().getStore().getProxy().getUrl(),
                rawData: formData,
                timeout: 300000,
                method: 'POST'
            }).then((response) => {
                Ext.GlobalEvents.fireEvent('endserveroperation');
                this.onRefresh();
            }, (response) => {
                Ext.GlobalEvents.fireEvent('endserveroperation');
                this.onError(response);
            });
        }
    }
});
