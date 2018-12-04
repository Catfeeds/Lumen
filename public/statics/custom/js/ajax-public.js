var ajax_PublicFn={
	//获取单位列表
	getUnits: function(fn){
		var dtd=$.Deferred();
		AjaxClient.get({
			url: "/getUnits?"+_token,
			dataType: 'json',
			beforeSend: function(){
				fn&&typeof fn=='function'?fn:null;
	        },
			success: function(rsp){
				dtd.resolve(rsp);
			},
			fail: function(rsp){
				// layer.msg('获取单位列表失败，请重试', {icon: 5,offset: '250px'});
				console.log('获取单位列表失败');
				dtd.reject(rsp);
			}
		},this);

		return dtd;
	},

	//获取数据类型
	getAttributeDataType: function(fn){
		var dtd=$.Deferred();
		AjaxClient.get({
			url: "/getAttributeDataType?type=material&"+_token,
			dataType: 'json',
			beforeSend: function(){
				fn&&typeof fn=='function'?fn:null;
	        },
			success: function(rsp){
				dtd.resolve(rsp);
			},
			fail: function(rsp){
				// layer.msg('获取数据类型列表失败，请重试', {icon: 5,offset: '250px'});
				console.log('获取数据类型列表失败');
				dtd.reject(rsp);
			}
		},this);

		return dtd;
	},

	//获取工序列表
	getOperations: function(){
		var dtd=$.Deferred();
		AjaxClient.get({
			url: "/getOperations?"+_token,
			dataType: 'json',
			success: function(rsp){
				dtd.resolve(rsp);
			},
			fail: function(rsp){
				// layer.msg('获取工序列表失败，请重试', {icon: 5,offset: '250px'});
				console.log('获取工序列表失败');
				dtd.reject(rsp);
			}
		},this);

		return dtd;
	}
};