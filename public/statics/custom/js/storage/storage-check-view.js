var layerLoading,
id;
$(function(){
	id=getQueryString('id');
	if(id!=undefined){
		viewStorageCheck(id);		
	}else{
		layer.msg('url链接缺少id参数，请给到id参数',{icon: 5,offset: '250px'});
	}
});

function viewStorageCheck(id){
	console.log(id=getQueryString('id'));
	AjaxClient.get({
		url: URLS['check'].show+_token+"&id="+id,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			$('#customcode').val(rsp.results[0].customcode);
			$('#material_item').val(rsp.results[0].material_item);
			$('#material_name').val(rsp.results[0].material_name);
			$('#unit_text').val(rsp.results[0].unit_text);
			$('#oquantity').val(rsp.results[0].oquantity);
			$('#nquantity').val(rsp.results[0].nquantity);
			$('#bquantity').val(rsp.results[0].bquantity);
			$('#sign').val(rsp.results[0].sign);
			rsp.results[0].lock_status?$('.is_lock_status.yes').parent().addClass('is-radio-checked'):$('.is_lock_status.no').parent().addClass('is-radio-checked');
			rsp.results[0].status?$('.is_status.yes').parent().addClass('is-radio-checked'):$('.is_status.no').parent().addClass('is-radio-checked');
		}

	})
}