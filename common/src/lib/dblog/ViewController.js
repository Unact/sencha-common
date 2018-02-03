/*
Используются залоченные колонки (можно перемещать грид горизонтально, а залоченные колонки останутся на месте).
В связи с этим есть ряд проблем:
- незалоченные колонки добавляются динамически. А заранее известные колонки - залочены. Создав изначально грид
  с одними только залоченными колонками наблюдаются проблемы при добвлении колонок. Поэтмоу, добавлена пустая колонка,
  что бы обойти эту проблему. Так же долавлена опция enableColumnHide: false, что бы лишить пользователя возможности
  увидеть несуществующую колонку
- при добавлении колонок (метод reconfigure) не удается использовать уже заранее созданные колонки
  (хотя в незалоченных гридах так можно). Приходится использовать в качестве колонок - initialConfig.
  Причем получать его не геттером, а непосредственно обращением к полю.

И все равно окно можно сломать: перетащить все залоченные колонки в облать незалоченных колонок
это можно предотвратить используя enableColumnMove: false, но перемещать калонки представляется полезной
фитчей в этом потенциально широком гриде
*/

Ext.define('Ext.lib.dblog.ViewController', {
    extend: 'Ext.lib.singlegrid.ViewController',
    alias: 'controller.dblog',

    boxReady: function() {
        this.getViewModel().notify();
        this.initialColumns = this.getView().columns.map((column) => {return column.initialConfig});
        this.initialFields = this.getView().getStore().getModel().getFields().slice();
    },

    afterRefresh: function() {
        var newColumns = this.getView().getStore().getProxy().getReader().metaData || [];
        var newFields = newColumns.map((column) => {
            return {
                name: column.dataIndex,
                type: 'string'
            };
        });

        this.getView().getStore().getModel().replaceFields(this.initialFields.concat(newFields), true);
        this.getView().reconfigure(null, this.initialColumns.concat(newColumns));
    }
});
