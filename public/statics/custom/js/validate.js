var Validate={
	//非空验证
	checkNull:function(value){
		return ""===value||/^\s*$/g.test(value)? true:false;
	},
	//code验证
	checkCode:function(value){
		return /^[A-Z]{1,10}$/g.test(value)? true:false;
	},
	//key值验证
	checkKey: function(value){
		return /^[a-zA-Z]+([a-zA-Z_]{2,49})$/g.test(value)? true:false;
	},
	//验证正浮点数
	checkNum: function(value){
		return /^\d+(\.\d+)?$/g.test(value)? true:false;
	},
	//属性key值验证，字母，下划线数字组成
	checkAttrKey: function(value){
		return /^[a-zA-Z]\w{2,49}$/g.test(value)? true:false;
	},
	checkNewAttrKey: function(value){
		return /^[A-Za-z_0-9\-]{3,50}$/g.test(value)? true:false;
	},
	//物料编码验证
	checkItemno: function(value){
		return /^[-A-Za-z_0-9]{4,20}$/g.test(value)? true:false;
	},
	//物料分类编码验证
	checkMaterialClass:function (value) {
		return /^[-A-Za-z0-9_]{2,50}$/g.test(value)? true:false;
	},
	//验证数字
	checkNumber: function(m,n,value){
		return /^\d{m,n}$/g.test(value)? true:false;
	},
	//验证物料分组code
	checkBomGroupCode:function (value) {
		return /^[A-Za-z][A-Za-z_0-9]{2,49}$/g.test(value) ? true :false;
	},
	//验证url链接
	checkUrl: function(value){
		return /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/g.test(value)?true:false;
	},
	//验证邮箱
	checkEmail: function(value){
		return /^[a-zA-Z\d]([\w\-\.]*[a-zA-Z\d])?@[a-zA-Z\d]([a-zA-Z\d\-]*[a-zA-Z\d])?(\.[a-zA-Z]{2,6})+$/g.test(value)?true:false;
	},
	//验证姓名
	checkRealName: function(value){
		return /^\s*[\u4e00-\u9fa5]{2,15}\s*$/g.test(value)?true:false;
	},
	//验证密码
	checkPassword: function(value){
		return /^(\w){6,18}$/g.test(value)?true:false;
	},
	//验证手机号
	checkMobile: function(value){
		return /^0?(13|14|15|18|17)[0-9]{9}$/g.test(value)?true:false;
	},
	//验证电话号
	checkPhone: function (value) {
		return /^0\d{2,3}-?\d{7,8}$/g.test(value)? true : false;
	},
	//验证传真
	checkFax: function (value) {
		return /^(\d{3,4}-)?\d{7,8}$/g.test(value) ? true :false;
	},
	//验证身份证号
	checkIDNumber: function (value) {
		return /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/g.test(value)?true :false;
	},
	//验证员工卡号
	checkCardId: function (value) {
        return /^[A-Za-z0-9]{1,50}$/g.test(value) ? true :false;
	},
	//验证密码
	checkCardPassword: function (value) {
		return /^\d{4,6}$/g.test(value) ? true :false;
	},
	//中文，字母，下划线1-30位验证
	checkImgGroupName: function(value){
		return /^([\u4e00-\u9fa5]|[a-zA-Z_]){1,30}$/g.test(value)? true: false;
	},
	//1-10个大写字母组成
	checkUpperCase: function (value) {
		return /^[A-Z]{1,10}$/g.test(value)? true : false;
    },
	//1-10个数字组成
	checkPartnerCode: function (value) {
		return /^[0-9]{1,10}$/g.test(value)? true : false;
    },
	//工厂模块验证，1-20位字母下划线数字组成
	checkFactoryCode:function(value){
		return /^[0-9a-z_A-Z]{1,20}$/g.test(value)? true : false;
	},
	//验证客户编码, 1-20位字母数字下划线组成
	checkCustomerCode:function(value){
		return /^\w{1,20}$/g.test(value)?true : false;   	
	},
  	//图纸编码验证
	checkImgCode: function(value){
		return /^[-A-Za-z_0-9]{1,20}$/g.test(value)? true:false;
	},
	//工序编码验证 针对SAP
	checkOperaCode: function(value){
		return /^[0-9]{1,4}$/g.test(value)? true:false;
	},
    //IP验证
	checkIp: function (value) {
		return /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)$/g.test(value)? true:false;
	},

	// 名称验证 输入长度限制1-30范围
	checkName: function (value) {
		return /^.{1,30}$/g.test(value)?true : false;
	},

	// 工艺管理 -- 做法维护 编码验证，1-20位字母下划线横线数字组成
	checkMaintainCode:function(value){
		return /^[-A-Za-z_0-9]{1,20}$/g.test(value)? true : false;
	},

	//非0验证
    checkNot0:function(value){
        return value == '0'? true : false;
    },
}

