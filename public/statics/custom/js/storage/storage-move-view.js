var id;


$(function(){
	id=getQueryString('id');
	if(id!= undefined){
		getMoveView(id);
	}else{
		layer.msg('url链接缺少参数，请给到id参数',{
			icon: 5,
			offset: '250px'
		});
	}
});

function getMoveView(id){

	AjaxClient.get({
        url: URLS['move'].show+"?"+_token+"&id="+id,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            $('#sale_order_code').val(rsp.results[0].new_sale_order_code);
            $('#wo_number').val(rsp.results[0].new_po_number);
            $('#po_number').val(rsp.results[0].new_wo_number);

            $('#remark').val(rsp.results[0].remark);
            showAddItem(rsp.results[0].groups);
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            layer.msg("获取信息失败",{icon:5,offset:'250px'});
        }
    },this);
}

//添加项
function showAddItem(data) {
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    if(data.length){
        data.forEach(function (item,index) {
            var tr =  `
            <tr data-id="${item.id}">
                  <td>${tansferNull(item.sale_order_code)}</td>
                  <td>${tansferNull(item.po_number)}</td>
                  <td>${tansferNull(item.wo_number)}</td>
                  <td>${tansferNull(item.material_item_no)}</td>
                  <td>${tansferNull(item.material_name)}</td>
                  <td>${tansferNull(item.lot)}</td>
                  <td>${tansferNull(item.unit_text)}</td>
                  <td>${tansferNull(item.plant_name)}</td>
                  <td>${tansferNull(item.depot_name)}</td>
                  <td>${tansferNull(item.subarea_name)}</td>
                  <td>${tansferNull(item.bin_name)}</td>
                  <td>${tansferNull(item.quantity)}</td>
                  <td>${tansferNull(item.remark)}</td>
                  <td></td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        });
    }else{
        var tr =`<tr>
                   <td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
                </tr>`;
        ele.append(tr);
    }
}




