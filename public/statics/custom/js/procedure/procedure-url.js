
var URLS = {
    procedure: {
        procedureList: '/operation/index',
        procedureAdd: '/operation/store',
        procedureUpdate: '/operation/update',
        procedureDelete: '/operation/destroy',
        procedureShow: '/operation/show',
        unique: '/operation/unique',
        getCode:'/encoding/get',
        abilityUsed:'/operation/abilityHasUsed',
        pracUsed:'/operation/practiceFieldsHasUsed'
    },
    procemanage: {
        procemanageList: '/operation/relationIndex',
        procemanageAdd: '/operation/relationStore',
        procemanageUpdate: '/operation/relationUpdate',
        procemanageDelete: '/operation/relationDestroy',
        procemanageShow: '/operation/relationShow',
        procedureList: '/operation/AllIndex'
    },
    workhour: {
        hourBomShow:'/Bom/show',
        bomDesign: '/Bom/getDesignBom',
        bomRouting:'/BomRouting/getBomRoutings',
        procedureDisplay:'/procedure/display',
        routeDetail:'/BomRouting/getPreviewData',
        workhourList: '/workhour/index',
        workhourAdd: '/workhour/store',
        workhourUpdate: '/workhour/update',
        workhourDelete: '/workhour/destroy',
        workhourShow: '/workhour/show',
        workMaterialNo: '/workhour/getWorkHoursByMaterialNo',
        workShowHour:'/workhour/getWorkHoursByRouting',
        // materialList: '/Material/pageIndex',
        materialList: '/workhour/showMaterialsByProcess',
        category: '/MaterialCategory/treeIndex',
        bomItem: '/Material/bomItem',
        operationSelect: '/operation/select',
        procedureAll: '/operation/AllIndex',
        imgShow:'/Image/show',
        workCenter:'/WorkCenterStandard/getStandardByWorkCenter',
        syncSAP:'/Sap/syncRoute',
        getBomRoutingBaseQty:'/BomRouting/getBomRoutingBaseQty',
        updateBomRoutingBaseQty:'/BomRouting/updateBomRoutingBaseQty',
    },
    ability:{
        list:'/operation/getAbilities',
        unique:'/operation/checkUnique',
        store:'/operation/createAbility',
        delete:'/operation/deleteAbility',
        show:'/operation/displayAbility',
        update:'/operation/updateAbility'
    },
    practice:{
        listAll:'/PracticeField/selectAll',
        list:'/PracticeField/selectPage',
        unique:'/PracticeField/unique',
        store:'/PracticeField/store',
        delete:'/PracticeField/delete',
        show:'/PracticeField/selectOne',
        update:'/PracticeField/update',
    },
    practiceCategory:{
        list:'/practiceCategory/select',
        store:'/practiceCategory/store',
        delete:'/practiceCategory/delete',
        show:'/practiceCategory/show',
        update:'/practiceCategory/update',
        unique:'/practiceCategory/unique',

    },
    use:{
        list:'/PracticeUse/selectTree',
        store:'/PracticeUse/store',
        delete:'/PracticeUse/delete',
        update:'/PracticeUse/update',
        show:'/PracticeUse/selectOne',
        unique:'/PracticeUse/unique'

    },
    type:{
        list:'/ProductType/selectTree',
        store:'/ProductType/store',
        delete:'/ProductType/delete',
        update:'/ProductType/update',
        show:'/ProductType/selectOne',
        unique:'/ProductType/unique'
    },
    workhoursetting:{
        listAll:'/workhour/Setting_list',
        add:'/workhour/setting',
        view:'/workhour/setting_show',
        edit:'/workhour/updateSetting',
        destroy:'/workhour/setting_dlt',
        empty: '/workhour/setting_empty',
        sync: '/operation/fit',
        abilityList: '/operation/optoability',
        setting: '/workhour/setting_sign',
        clearSetting: '/workhour/cancel_sign',
    }
}
