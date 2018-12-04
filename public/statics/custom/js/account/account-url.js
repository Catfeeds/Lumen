var URLS={
	admin: {
		store: '/Admin/store',
		update: '/Admin/update',
		show: '/Admin/show',
		list: '/Admin/pageIndex',
		unique: '/Admin/unique',
		selectdRole: '/Admin/selectedRole',
		saveRole: '/Admin/admin2role',
		delete:'/Admin/delete'
	},
	node: {
		list: '/Node/pageIndex',
		menu: '/Node/menu',
		store: '/Node/store',
		unique: '/Node/unique',
		edit: '/Node/tableUpdate',
		delete: '/Node/destroy',
		saveRole: '/Node/node2role',
		selectdRole: '/Node/selectedRole',
		select: '/Node/select'
	},
	role: {
		list: '/Role/pageIndex',
		store: '/Role/store',
		update: '/Role/update',
		delete: '/Role/destroy',
		show: '/Role/show',
		unique: '/Role/unique',
		selectedNode: '/Role/selectedNode',
		saveNode: '/Role/role2node'
	},
	menu: {
		list: '/Menu/treeIndex',
		store: '/Menu/store',
		unique: '/Menu/unique',
		select: '/Menu/select',
		delete: '/Menu/destroy',
		show: '/Menu/show',
		update: '/Menu/update',
		oneLevel: '/Menu/oneLevel',
		clear: '/Menu/clear',
		init: '/Menu/initialize'
	},
	log: {
		list: '/Admin/log' 
	}
}