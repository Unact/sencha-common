Ext.define('Ext.lib.tree.plugin.TreeStateful',
{
    extend:'Ext.AbstractPlugin',
    alias:'plugin.treestateful',
    
    stateId:null,
    stateIdSuffix:'-stfulPlugin',
    //объект tree.Panel, к которому прикручивается плагин
    treePanel:null,
    //какие изменения запоминаются в состоянии
    actions2Remember:null,//'all', //['all','check','expand']
    //что из сохраненного состояния применится
    actions2Apply:null,//'all', //['all','check','expand']
    //автоматическое подвешивание this.applyState() на treestore load event
    autoOnLoad:true,
    //вызвавшая текущее изменение состояния категория событий ('check'||'expand')
    currentEvent:'',
    changedNodes:{},
    changeNum:0,
    currentNode:null,
    
    constructor:function(config)
    {
        var me=this;
        if(config||false)
        {
            //обработка прилетевшего из конфига (за кем следить, цеплять ли listener)
            me.callParent(config);
            me.actions2Remember=config['actions2Remember']||'all';
            me.actions2Apply=me.actions2Remember;
            me.autoOnLoad=Ext.isEmpty(config['autoOnLoad'])?true:config['autoOnLoad'];
        }
        else{me.callParent();}
    },
    
    destroy:function()
    {
        var me=this;
        
        me._flushState();
        me.callParent();
    },
    
    init:function(treePanel)
    {
        var me=this,
            stateContent,
            events=[]
        ;
        me.setCmp(treePanel);
        me.treePanel=treePanel;
        //Взводим признак запоминания результатов событий
        //задействован в treePanel.saveState()
        treePanel.memorizeEnabled=true;
        
        //ищем провайдера пограничных состояний
        if(!(Ext.state.Manager.getProvider()||false))
        {
            if(Ext.util.LocalStorage.supported)
            {Ext.state.Manager.setProvider(Ext.state.LocalStorageProvider.create());}
            else
            {Ext.state.Manager.setProvider(new Ext.state.CookieProvider({expires:new Date(new Date().getTime()+(86400000))}));}
        }
        //добываем состояние, если есть
        me.stateId=treePanel.stateful&&(!Ext.isEmpty(treePanel.getStateId()))?treePanel.getStateId()+me.StateIdSuffix:'';
        stateContent=Ext.state.Manager.get(me.stateId,false);

        if(stateContent){me.changedNodes=stateContent['changedNodes']||{};}

        //Формирование списка событий, за которыми наблюдаем
        if(me.actions2Remember=='expand')
        {events=['afteritemexpand','afteritemcollapse'];}
        else if(me.actions2Remember=='check')
        {events=['checkchange']}
        else
        {events=['checkchange','afteritemexpand','afteritemcollapse']}
        
        treePanel.on({
            checkchange:{fn:function(node){me.currentEvent='checkchange';me.currentNode=node;},scope:me},
            afteritemexpand:{fn:function(){me.currentEvent='afteritemexpand';},scope:me},
            afteritemcollapse:{fn:function(){me.currentEvent='afteritemcollapse';},scope:me}
        });
        treePanel.addStateEvents(events);
        
        //прикручиваем к целевому дереву методы Ext.state.Stateful
        treePanel.ownSaveState=treePanel.saveState;//собственная память дерева
        treePanel.saveState=function()
        {
            if(treePanel.memorizeEnabled)
            {
                try{treePanel.ownSaveState(arguments);}catch(e){}
                me._saveState()
            }
        };
        
        treePanel.ownApplyState=treePanel.applyState;//собственная память дерева
        treePanel.applyState=function(act2Apply)
        {
            try{treePanel.ownApplyState(arguments);}catch(e){}
            
            me.actions2Apply=Ext.isEmpty(act2Apply)?me.act2Remember:act2Apply.toString();
            me._applyState();
            me._flushState();
        };
        //самодеятельность (после применения состояния не обнуляет его, а продолжает накапливать изменения)
        treePanel.applyStateWithoutFlush=function(act2Apply)
        {
            me.actions2Apply=Ext.isEmpty(act2Apply)?me.act2Remember:act2Apply.toString();
            me._applyState();
        };
        treePanel.flushState=function(){me._flushState()};
        //цепляем применение состояния на загрузку хранилища дерева, если установлено autoOnLoad
        if(me.autoOnLoad)
        {treePanel.store.on({load:{fn:'applyState',scope:treePanel}});}
        //Подтираем за предыдущими состояниями
        me._flushState();
    },
    
    //Собирает массив id всех развернутых узлов
    getExpanded:function()
    {
        var me=this,
            expandedIds=[]
        ;
        me.treePanel.getRootNode().cascadeBy({
            before: function(node)
            {
                if(node.isExpanded())
                {
                    if(!node.isRoot()){expandedIds.push(node.getId())};
                    return true;
                }
                else 
                {return false};
            }
        });
        
        return (expandedIds.length>0)?expandedIds:[];
    },
    //Собираем "хэш" {id: {checked, порядковый номер изменения}} чекнутых/анчекнутых узлов
    getChanged:function(changedNodes)
    {
        var me=this,
            node=me.currentNode,
            id
        ;
        if(!Ext.isEmpty(node))
        {
            changedNodes[node.getId()]={checked:node.get('checked'),changeNum:me.changeNum++};
            me.currentNode=null;
        }
        return changedNodes;
    },
    //Собираем информацию состояния для сохранения
    _getState:function()
    {
        var me=this,
            ret={}
        ;
        //развернутые
        if(me.actions2Remember!='check'&&me.currentEvent!='checkchange')
        {ret.expandedIds=me.getExpanded();}
        //измененные
        if(me.actions2Remember!='expand'&&me.currentEvent=='checkchange')
        {ret.changedNodes=me.getChanged(me.changedNodes);}
        
        return ret;
    },

    //Сохраняем состояние (обновляются данные только произошедших событий)
    _saveState:function()
    {
        var me=this,
            contentState,
            savingData,
            changedData
        ;
        if(!Ext.isEmpty(me.stateId))
        {
            contentState=Ext.state.Manager.get(me.stateId,false);
            savingData=contentState?contentState:{};
            changedData=me._getState();
            
            for (key in changedData)
            {savingData[key]=changedData[key];}
            
            Ext.state.Manager.set(me.stateId,savingData);
        }
    },
    //Подчищает
    _flushState:function()
    {
        var me=this;
        
        me.changedNodes={};
        me.changeNum=0;
        me.currentNode=null;
        
        if(!Ext.isEmpty(me.stateId))
        {
            Ext.state.Manager.set(me.stateId,{expandedIds:[],changedNodes:{}});
        }
    },
    //Применяем запомненное (в зависимости от this.actions2Apply можем применить all||check||expand)
    _applyState:function()
    {
        var me=this,
            treePanel=me.treePanel,
            viewStore=treePanel.store,
            stateContent,
            expandedIds,
            checkedIds
        ;
        if(viewStore||false)
        {
            stateContent=Ext.state.Manager.get(me.stateId,false);
            if(stateContent)
            {
                expandedIds=stateContent['expandedIds']||[];
                changedNodes=stateContent['changedNodes']||{};
                
                if(expandedIds.length>0 && me.actions2Apply!='check'){me.processExpandedIds(viewStore,expandedIds);}
                
                if(me.actions2Apply!='expand')
                {
                    me.clearChecked();
                    
                    if(Object.keys(changedNodes).length>0)
                    {me.processChangedNodes(viewStore,changedNodes);}
                }
            }
        }
    },
    //Разворачиваем
    processExpandedIds:function(treeStore,expIds)
    {
        var me=this;
        
        me.clearExpand();
        
        expIds.forEach(
            function(nodeId)
            {
                var node=treeStore.getNodeById(nodeId);
                if(!Ext.isEmpty(node))
                {
                    node.expand();
                }
            }
        );
    },
    clearExpand:function(){this.treePanel.collapseAll();},
    
    //Чекаем/анчекаем
    processChangedNodes:function(treeStore,changedNodes)
    {
        var me=this,
            testNode=me.treePanel.getRootNode().firstChild||false,
            treeview=me.treePanel.getView(),
            arrNodes=[]
        ;
        //отключаем запоминание постыдных событий
        me.treePanel.memorizeEnabled=false;
        
        //формируем массив, отсортированный по порядковому номеру изменения
        for(keyId in changedNodes)
        {arrNodes.push({id:keyId,checked:changedNodes[keyId].checked,changeNum:changedNodes[keyId].changeNum});}
        
        arrNodes=arrNodes.sort(function(n1,n2){return n1.changeNum-n2.changeNum});
        //имитируем прошлую жизнь (спонсор: Ext.tree.View.onCheckChange())
        arrNodes.forEach(
            function(changed)
            {
                var node=treeStore.getNodeById(changed.id);
                if(!Ext.isEmpty(node))
                {
                    node.set('checked',!changed.checked);
                    treeview.onCheckChange(node);
                }
            }
        );
        
        //теперь опять начинаем все тщательно запоминать
        me.treePanel.memorizeEnabled=true;
    },
    clearChecked:function(){this.treePanel.getChecked().forEach(function(node){node.set('checked',false)});}

}
);
