
var URLS = {
    job:{
        jobList : '/EmployeePosition/pageIndex',
        jobAdd : '/EmployeePosition/store',
        jobShow : '/EmployeePosition/show',
        jobUpdate : '/EmployeePosition/update',
        jobDelete : '/EmployeePosition/destroy',
        jobUnique : '/EmployeePosition/unique',
        roleStore:'/EmployeePosition/positionToRole',
        roleExit:'/EmployeePosition/getPositionRole',
        roleList:'/Role/pageIndex'
    },
    dept:{
        source:'/Company/getCurrentAdminCompany',
        factory:'/Factory/select',
        factoryList:'/Factory/pageIndex',
        show: '/Company/show',
        treeList:'/Department/treeIndex',
        compTreeList:'/Department/getTreeByCompany',
        nextDept:'/Department/getNextLevelList',
        deptUnique : '/Department/unique',
        deptAdd : '/Department/store',
        deptDelete : '/Department/destroy',
        deptShow : '/Department/show',
        deptUpdate : '/Department/update'
        // list: '/Company/pageIndex',
        // show: '/Company/show',
        // update: '/Company/update',
        // delete: '/Company/delete',
        // store: '/Company/store',
        // unique: '/Company/unique'
        // deptList : '/Department/pageIndex',
        // deptAdd : '/Department/store',
        // deptShow : '/Department/show',
        // deptSelect : '/Department/select',
        // deptDelete : '/Department/destroy',
        // deptUpdate : '/Department/update',
        // deptUnique : '/Department/unique',
        // deptTreeList : '/Department/treeIndex'
    },
    employee:{
        uploadAttachment: '/Upload/attachment',
        getRole: '/Employee/getRoles',
        getDept: '/Employee/getDepartments',
        getPosition: '/Employee/getPositions',
        getEducation: '/Employee/getEducations',
        getProvince: '/Employee/getProvince',
        employeeAdd: '/Employee/store',
        employeeList: '/Employee/pageIndex',
        employeeShow: '/Employee/show',
        employeeDelete: '/Employee/destroy',
        employeeUpdate: '/Employee/update',
        employeeExcel: '/Employee/export',
        uploadEmployeeExcel: '',
        factoryTree: '/Factory/getTree',
        unique: '/Admin/unique',
        deptTree:'/Department/treeIndex',
        download:'/Employee/downloadTemplate'
    }
}
