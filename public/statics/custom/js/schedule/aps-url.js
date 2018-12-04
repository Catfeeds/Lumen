var URLS={
	aps: {
		pro: '/APS/getProductOrder',
		wt: '/APS/getWorkTask',
		wo: '/APS/getWorkOrder',
		split: '/WorkTask/split',
		factory: '/Factory/select',
		workshop: '/Workshop/select',
		workcenter: '/WorkCenter/select',
		ops: '/WorkBenchOperationAbility/capacity',
		simplePlan: '/APS/simplePlan',
		capacity: '/APS/getCapacity',
		splitwo: '/APS/splitWorkOrder',
		destroy: '/APS/destroy',
		newCapacity: '/WorkBenchOperationAbility/newCapacity',
		woshow: '/WorkOrder/show',
		checkCanPlan: '/APS/checkCanPlan',
		getWorkOrdersByDate: '/APS/getWorkOrdersByDate'
	},
	pro: {
		pro: '/ProductOrder/pageIndex',
		wt: '/WorkTask/pageIndex',
		poinfo: '/APS/getProductOrderInfo'
	},
	thinPro:{
		woList: '/APS/getWorkOrder',
		benchList: '/WorkBench/select',
		equipList: '/WorkBench/show',
		factoryTree: '/Factory/getTree',
		store: '/APS/carefulPlan',
		carefulPlan: '/APS/getCarefulPlan',
		getFactoryTree:'/APS/showAllWorkCenters',
        rankPlan:'/APS/showWorkCenterRankPlan'
	}
}