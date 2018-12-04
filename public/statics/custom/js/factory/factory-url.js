/**
 * Created by admin on 2017/11/6.
 */
var URLS = {
    company:{
        source:'/Company/getCurrentAdminCompany',
        list: '/Company/pageIndex',
        show: '/Company/show',
        update: '/Company/update',
        delete: '/Company/delete',
        store: '/Company/store',
        unique: '/Company/unique'
    },
    source:{
        factory:'/Factory/select',
        workShop:'/Workshop/select',
        workCenter:'/WorkCenter/select',
        workBench:'/WorkBench/select',
        workMachine:'/WorkMachine/select',
        workClass: '/RankPlan/select'
    },
    show:{
        factoryShow:'/Factory/show',
        workshopShow:'/Workshop/show',
        workcenterShow:'/WorkCenter/show',
        workbenchShow:'/WorkBench/show',
        workmachineShow:'/WorkMachine/show'
    },
    list:{
        factoryList:'/Factory/pageIndex',
        workShopList:'/Workshop/pageIndex',
        workCenterList:'/WorkCenter/pageIndex',
        workBenchList:'/WorkBench/pageIndex',
        workMachineList:'/WorkMachine/pageIndex',
        workClassList:'/RankPlan/pageIndex',
    },
    factory: {
        unique:'/Factory/unique',
        add:'/Factory/store',
        show:'/Factory/show',
        update:'/Factory/update',
        delete:'/Factory/delete',
        country:'/Company/countrySelect'
    },
    workShop:{
        unique:'/Workshop/unique',
        add:'/Workshop/store',
        show:'/Workshop/show',
        update:'/Workshop/update',
        delete:'/Workshop/delete',
    },
    workCenter:{
        unique:'/WorkCenter/unique',
        add:'/WorkCenter/store',
        show:'/WorkCenter/show',
        update:'/WorkCenter/update',
        delete:'/WorkCenter/delete',
        allProcedure: '/Operation/getAllOperationAndStep',
        procedureStore: '/WorkCenterOperation/update',
        workcenter: '/WorkCenterStandard/getDeclareStandardByWorkCenter',

    },
    workBench:{
        unique:'/WorkBench/unique',
        add:'/WorkBench/store',
        show:'/WorkBench/show',
        update:'/WorkBench/update',
        delete:'/WorkBench/delete',
        selectDevice:'/WorkMachine/selectDevice',
        devicePageIndex:'/devicelist/pageIndex',
        deviceselect:'/devicelist',
    },
    workMachine:{
        unique:'/WorkMachine/unique',
        add:'/WorkMachine/store',
        show:'/WorkMachine/show',
        update:'/WorkMachine/update',
        delete:'/WorkMachine/delete',
    },

    workBenchOperation:{
        unique:'/WorkBenchOperationAbility/unique',
        pageIndex:'/WorkBenchOperationAbility/pageIndex?',
        store:'/WorkBenchOperationAbility/store',
        show:'/WorkBenchOperationAbility/show',
        update:'/WorkBenchOperationAbility/update',
        delete:'/WorkBenchOperationAbility/delete',
        list: '/WorkBenchOperationAbility/pageIndex'
    },
    rankPlan:{
        unique:'/RankPlan/unique',
        add:'/RankPlan/store',
        show:'/RankPlan/show',
        update:'/RankPlan/update',
        delete:'/RankPlan/delete',
        relation: '/WorkBenchRankPlanEmplyee/getList',
        employee: '/Employee/pageIndex',
        pageIndex:'/RankPlan/pageIndex?',
        type: '/RankPlanType/select'
    },
    rankPlanType:{
        list: '/RankPlanType/pageIndex',
        unique: '/RankPlanType/unique',
        store: '/RankPlanType/store',
        show:'/RankPlanType/show',
        update:'/RankPlanType/update',
        delete: '/RankPlanType/delete'
    },
    other:{
        operationList:'/WorkCenterOperation/getWorkCenterOperationAbilitys',
    },
    centerOperation: {
        list: '/WorkCenterOperation/getWorkCenterOperation',
        store: '/WorkCenterRankPlan/update',
        rankPlanRelation: '/WorkCenterRankPlan/getWorkCenterRankPlan',
        employee: '/Employee/select',
        relationPerson: '/WorkBenchRankPlanEmplyee/update',
        rankRelationPerson: '/WorkBenchRankPlanEmplyee/getList'
    }

}