var id,
ajaxData={},
pageNo=1,
pageSize=50,
createor_token='';

$(function(){
	id=getQueryString('id');
	if(id!= undefined){
		getSellsOrderView(id);
	}else{
		layer.msg('url链接缺少参数，请给到id参数',{
			icon: 5,
			offset: '250px'
		});
	}
    // bindEvent();
});

// //查看客户
// function viewCustomer(id){
//     // console.log(id);
//     AjaxClient.get({
//         url: URLS['customer'].show+_token+"&"+"customer_id="+id,
//         dataType: 'json',
//         beforeSend: function(){
//             layerLoading = LayerConfig('load');
//         },
//         success: function(rsp){
//             layer.close(layerLoading);
//             console.log(rsp.results)
//             $('.customer.choose-material').data('customerData',rsp.results.id)
//             $('#customerNum').val(rsp.results.code);
//             $('#customerName').val(rsp.results.name);
//             $('#company').val(rsp.results.company);
//             $('#position').val(rsp.results.position);
//             $('#phonenum').val(rsp.results.mobile);
//             $('#email').val(rsp.results.email);
//             $('#address').val(rsp.results.address);
//             $('#lable').val(rsp.results.lable);
//         },
//         fail: function(rsp){
//             layer.close(layerLoading);
//             layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
//         }
//     },this);
// }

function getSellsOrderView(id){
	console.log(id=getQueryString('id'));
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
        url: URLS['sellsOrder'].show+_token+"&sellorder_id="+id+urlLeft,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            // viewCustomer(rsp.results.custormer_id);
            $('#customerNum').val(rsp.results.customer_code);
            $('#customerName').val(rsp.results.customer_name);
            $('#company').val(rsp.results.company);
            $('#position').val(rsp.results.position);
            $('#phonenum').val(rsp.results.mobile);
            $('#email').val(rsp.results.email);
            $('#address').val(rsp.results.address);
            $('#lable').val(rsp.results.lable);
            $('#code').val(rsp.results.code);
            $('#remark').val(rsp.results.comment);
            showAddItem(rsp.results.productList);
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
                  <td>${tansferNull(item.code)}</td>
                  <td>${tansferNull(item.name)}</td>
                  <td>${tansferNull(item.num)}</td>
                  <td>${tansferNull(item.unit_text)}</td>
                  <td>${tansferNull(item.end_time)}</td>
                  <td>${tansferNull(item.comment)}</td>
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




