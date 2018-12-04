var pageNo=1,pageSize=20,ajaxData={},layerModal,id;
$(function () {
    id = getQueryString('id');
    getExcelFilesItem();
});


function bindPagenationClick(totalData,pageSize){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNo=api.getCurrent();
            getExcelFilesItem();
        }
    });
}
function getExcelFilesItem() {
    var urlLeft='';

    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize+"&file_id="+id;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['import'].pageIndexItem+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',10);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取物料列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}
//生成列表数据
function createHtml(ele,data){

    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${tansferNull(item.sale_order_code)}</td>
                <td>${tansferNull(item.sale_order_line_code)}</td>
                <td>${tansferNull(item.operation_text)}</td>
                <td>${tansferNull(item.deliver_date)}</td>
                <td>${tansferNull(item.buy_number)}</td>
                <td>${tansferNull(item.today_repot_number)}</td>
                <td>${tansferNull(item.sum_repot_number)}</td>
                <td>${tansferNull(item.semimanufactures_code)}</td>
                <td>${tansferNull(item.semimanufactures_description)}</td>
                <td>${tansferNull(item.buy_order_code)}</td>
                <td>${tansferNull(item.product_order_code)}</td>
                <td>${tansferNull(item.operation_code)}</td>
                <td>${tansferNull(item.statistician)}</td>
                <td>${tansferNull(item.supplier_code)}</td>
                <td>${tansferNull(item.supplier_name)}</td>
                <td>${tansferNull(item.status)}</td>
                <td>${tansferNull(item.actual_start_date)}</td> 
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}
