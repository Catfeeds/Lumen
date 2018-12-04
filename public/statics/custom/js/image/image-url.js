var URLS={
	category: {
		store: '/ImageCategory/store',
		update: '/ImageCategory/update',
		show: '/ImageCategory/show',
		list: '/ImageCategory/pageIndex',
		delete: '/ImageCategory/destroy',
		unique: '/ImageCategory/unique',
		select: '/ImageCategory/select'
	},
	group: {
		list: '/ImageGroup/pageIndex',
		store: '/ImageGroup/store',
		unique: '/ImageGroup/unique',
		show: '/ImageGroup/show',
		delete: '/ImageGroup/destroy',
		update: '/ImageGroup/update',
		select: '/ImageGroup/select'
	},
	groupType: {
    list: '/ImageGroupType/selectPages',
    store: '/ImageGroupType/store',
    unique: '/ImageGroupType/unique',
    show: '/ImageGroupType/selectOne',
    delete: '/ImageGroupType/delete',
    update: '/ImageGroupType/update',
    select: '/ImageGroupType/selectAll'
	},
	image: {
		list: '/Image/pageIndex',
		store: '/Image/store',
		unique: '/Image/unique',
		update: '/Image/update',
		delete: '/Image/destroy',
		show: '/Image/show',
		upload: '/Image/upload',
		attrSelect: '/ImageAttributeDefinition/selectAll',
		getCode: '/encoding/get',
		searchImg: '/Image/listBySearchStr',
    	uploadAttachment: '/Upload/attachment',
		uploadEdit: '/Image/reUploadImage',
        showCareLable: '/CareLabel/show',
        addCareLable:'/CareLabel/store',
        careLableToSap:'/Sap/syncCareLabel',
		batchStore:'/Image/batchStore',
		careLabelIndex:'/CareLabel/careLabelPageIndex',
		// batchUpload:'/Image/batchUploadDrawing',
	},
	attr:{
		store:'/ImageAttributeDefinition/store',
		unique:'/ImageAttributeDefinition/unique',
		list:'/ImageAttributeDefinition/selectPage',
		show:'/ImageAttributeDefinition/selectOne',
		update:'/ImageAttributeDefinition/update',
		delete:'/ImageAttributeDefinition/delete',
		upload: '/Image/upload',
	}
}