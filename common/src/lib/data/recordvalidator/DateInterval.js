Ext.define('Ext.lib.data.recordvalidator.DateInterval', {

    /**  
     * Проверяет, что дата начала меньше дата конца
     * Передать checkNull для проверки на пустые значения
     * @param {String} dateFrom
     * @param {String} dateTo
     * @param {Boolean} checkNull
     * @return {String/Boolean} Сообщение о не корректных значениях или true 
     */
    
    validateDates: function(dateFrom, dateTo, checkNull){
        var me = this;
        if (me.get(dateFrom) && me.get(dateTo)){
            if (me.get(dateFrom).valueOf() >= me.get(dateTo).valueOf()){
                return '"Дата до" меньше "Дата от"';
            } else {
                return true;
            }
        } else if (checkNull) {
            return 'Поля дат не могут быть пустыми';
        }
    }
});
