var layerLoading,
id;
$(function(){
	id=getQueryString('id');
	if(id!=undefined){
		viewStorageInit(id);
	}else{
		layer.msg('url链接缺少id参数，请给到id参数',{icon: 5,offset: '250px'});
	}
});


function viewStorageInit(id){
	console.log(id=getQueryString('id'));
	AjaxClient.get({
		url: URLS['storageInitial'].show+_token+"&id="+id,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			$('#customcode').val(rsp.results[0].customcode);
			$('#plant_name').val(rsp.results[0].plant_name);
			$('#depot_name').val(rsp.results[0].depot_name);
			$('#subarea_name').val(rsp.results[0].subarea_name);
			$('#bin_name').val(rsp.results[0].bin_name);
			$('#material_name').val(rsp.results[0].material_name);
			$('#material_number').val(rsp.results[0].material_number);
			$('#unit_text').val(rsp.results[0].unit_text);
			$('#quantity').val(rsp.results[0].quantity);
			$('#price').val(rsp.results[0].price);
			$('#billdate').val(rsp.results[0].billdate);
			rsp.results[0].lock_status?$('.is_lock_status.yes').parent().addClass('is-radio-checked'):$('.is_lock_status.no').parent().addClass('is-radio-checked');
			rsp.results[0].status?$('.is_status.yes').parent().addClass('is-radio-checked'):$('.is_status.no').parent().addClass('is-radio-checked');
			$('#comment').val(rsp.results[0].remark);
		},
		fail: function(rsp){
			layer.close(layerLoading);
			console.log('获取期初详情失败');
		}
	},this);
} 




