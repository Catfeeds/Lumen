var id,
ajaxData={},
pageNo=1,
pageSize=50,
creator_token='';

$(function(){
	$('el-tab-wrap').addClass('edit');
	id=getQueryString('id');
	if(id!=undefined){
		getOtherInstoreView(id);
	}else{
		layer.msg('url链接缺少参数，请给到id参数',{
			icon: 5,
			offset: '250px'
		});
	}
});

function getOtherInstoreView(id){
	console.log(id=getQueryString('id'));
	AjaxClient.get({
		url: URLS['otherInstore'].InstoreShow+_token+"&id="+id,
		dataType: 'json',
		beforeSend:function(){
			layerLoading = LayerConfig('load');
		},
		success:function(rsp){
			layer.close(layerLoading);
			$('#code').val(rsp.results[0].code);
			$('#indent_code').val(rsp.results[0].indent_code);
			$('#workorder_code').val(rsp.results[0].workorder_code);
			$('#owner').val(rsp.results[0].owner_name);
			$('#personInCharge').val(rsp.results[0].employee_surname+rsp.results[0].employee_name);
			$('#remark').val(rsp.results[0].remark);
			showAddItem(rsp.results[0].groups);
		},
		fail:function(rsp){
			layer.close(layerLoading);
			layer.msg("获取信息失败",{icon:5,offset:'250px'});
		}
	},this);
}

//添加项
function showAddItem(data){
	 var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    if(data.length){
        data.forEach(function (item,index) {
            var tr =  `
            <tr data-id="${item.id}">
	          <td>${tansferNull(item.item_no)}</td>
              <td>${tansferNull(item.name)}</td>
              <td>${tansferNull(item.unit_text)}</td>
              <td>${tansferNull(item.plant_name)}</td>
              <td>${tansferNull(item.depot_name)}</td>
              <td>${tansferNull(item.subarea_name)}</td>
              <td>${tansferNull(item.bin_name)}</td>
              <td>${tansferNull(item.quantity)}</td>
              <td>${tansferNull(item.remark)}</td>
              <td>${tansferNull(item.lock_status? '是':'否')}</td>
              <td></td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        });
    }else{
        var tr =`<tr>
                   <td class="nowrap" colspan="10" style="text-align: center;">暂无数据</td>
                </tr>`;
        ele.append(tr);
    }
}