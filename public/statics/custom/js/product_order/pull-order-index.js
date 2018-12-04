var order_no,startDate,endDate,pageNo=1,pageSize=20,orderList=[],ids=[];
$(function(){
    order_no=getQueryString('order_no');

    startDate=getQueryString('startDate');
    endDate=getQueryString('endDate');
    startDate=startDate.replace(/-/g,'');
    endDate=endDate.replace(/-/g,'');


    getOrder();
    bindEvent();

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
            showOrderList();
            ids=[];
            $('#checkAll').removeClass('is-checked');
        }
    });
};
//获取列表
function getOrder(){
    var urlLeft='';
    urlLeft+="&order_no="+order_no+"&start_date="+startDate+"&end_date="+endDate;

    $('.table_tbody').html('');
    AjaxClient.get({
        // url: "http://58.221.197.202:30087/Proorder/showOrderStatus?"+_token+urlLeft,
        url: URLS['order'].pullorderList+'?'+_token+urlLeft,
        dataType: 'json',
        timeout:300000,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            orderList=rsp.results;
            showOrderList();

        },
        fail: function(rsp){

            layer.close(layerLoading);
            noData('列表拉取失败！',6);
        },
        complete: function(){
        }
    },this);
};

function showOrderList() {
    var totalData=orderList.length;
    if(orderList&&orderList.length){
        createHtml($('.table_tbody'),orderList.slice((pageNo-1)*pageSize,pageNo*pageSize));
    }else{
        noData('暂无数据',10);
    }
    if(totalData>pageSize){
        bindPagenationClick(totalData,pageSize);
    }else{
        $('#pagenation').html('');
    }
}

//生成列表数据
function createHtml(ele,data){
    ele.html('')
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem">
                <td class="left norwap">
		             <span class="el-checkbox_input el-checkbox_input_check" 
		             data-number="${item.number}" 
		             data-sales_order_no="${item.sales_order_no}" 
		             data-production_code="${item.production_code}" 
		             data-status ="${item.status }" 
		             data-start_date ="${item.start_date }" 
		             data-qty  ="${item.qty  }" 
		             data-release_date ="${item.release_date }">
		                <span class="el-checkbox-outset"></span>
                    </span>
		        </td>
		        <td>${item.sales_order_no}</td>
                <td>${item.number}</td>
                <td>${item.production_name}</td>
                <td>${item.production_code}</td>
                <td class="right el-form-item">
                    <a class="link_button" href="/ProductOrder/pullOrderbom?item_no=${item.production_code}"><button class="button pop-button view">查看</button></a>
                    ${item.storage_status==0?`<button data-id="${item.number}" class="button pop-button pull_order el-button">拉取</button>`:'<button data-id="${item.number}"  class="button pop-button pull_order el-button is-disabled">已拉取</button>'}
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};

function pullOrderInfo(data) {
    AjaxClient.post({
        url: URLS['order'].pullOrder,
        data: data,
        dataType: 'json',
        timeout:300000,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results.list&&rsp.results.list.length){
                var str = '';
                rsp.results.list.forEach(function (item) {
                    if(item.error==0){
                        $('.el-checkbox_input_check.is-checked[data-number='+item.number+']').parent().parent().find('.pull_order').eq(0).addClass('is-disabled');
                        $('.el-checkbox_input_check.is-checked[data-number='+item.number+']').parent().parent().find('.pull_order').eq(0).text('已拉取');
                        $('.el-checkbox_input_check.is-checked[data-number='+item.number+']').removeClass('is-checked');
                    }
                    str += '单号：'+item.number+'；信息：'+item.message+'。'+"<br>";
                })
                layer.confirm('成功：'+rsp.results.records.success+'个，失败：'+rsp.results.records.fail+'个。'+"<br>"+str, {
                    area:['600px','400px'],icon: 3, title: '提示', offset: '200px', end: function () {}
                }, function (index) {
                    layer.close(index);

                });

            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.confirm('正在拉取中，请稍后！', {
                icon: 3, title: '提示', offset: '250px', end: function () {}
            }, function (index) {
                layer.close(index);
            });

        }
    },this);
}


function bindEvent() {
    $('body').on('click','.table_tbody .pull_order:not("is-disabled")',function (e) {
        e.stopPropagation();
        var item_no = $(this).attr('data-id');
        $(this).parent().parent().parent().find('.el-checkbox_input_check').removeClass("is-checked");
        $(this).parent().parent().find('.el-checkbox_input_check').addClass("is-checked");
        ids=[];
        ids=[{
            number:$(this).parent().parent().find('.el-checkbox_input_check').attr("data-number"),
            sales_order_no:$(this).parent().parent().find('.el-checkbox_input_check').attr("data-sales_order_no"),
            production_code :$(this).parent().parent().find('.el-checkbox_input_check').attr("data-production_code"),
            qty :$(this).parent().parent().find('.el-checkbox_input_check').attr("data-qty"),
            release_date :$(this).parent().parent().find('.el-checkbox_input_check').attr("data-release_date"),
            start_date :$(this).parent().parent().find('.el-checkbox_input_check').attr("data-start_date"),
            status :$(this).parent().parent().find('.el-checkbox_input_check').attr("data-status"),
        }]
        pullOrderInfo({
            orders:JSON.stringify(ids),
            _token:TOKEN
        });
    });
    $('body').on('click','.el-checkbox_input_check',function(){
        if(!($(this).parent().parent().find('.pull_order').eq(0).hasClass('is-disabled'))){
            $(this).toggleClass('is-checked');
            var number=$(this).attr("data-number"),
                sales_order_no=$(this).attr("data-sales_order_no"),
                production_code=$(this).attr("data-production_code"),
                qty=$(this).attr("data-qty"),
                release_date=$(this).attr("data-release_date"),
                start_date=$(this).attr("data-start_date"),
                status=$(this).attr("data-status");
            var item ={
                number:number,
                sales_order_no:sales_order_no,
                production_code:production_code,
                qty:qty,
                release_date:release_date,
                start_date:start_date,
                status:status,
            };
            if($(this).hasClass('is-checked')){
                if(ids.indexOf(item)==-1){
                    ids.push(item);
                }
            }else{
                var index=ids.indexOf(item);
                ids.splice(index,1);
            }
        }

    });
    $('body').on('click','#checkAll',function(){
        $(this).toggleClass('is-checked');
        ids=[];
        if($(this).hasClass('is-checked')){
            var items= $('#pull_all_order_value .table_tbody tr');
            $(items).each(function (k,v) {
                if(!$(v).find('.pull_order').eq(0).hasClass('is-disabled')){
                    $(v).find('.el-checkbox_input_check').addClass('is-checked');
                    ids.push({
                        number:$(v).find('.el-checkbox_input_check').attr("data-number"),
                        sales_order_no:$(v).find('.el-checkbox_input_check').attr("data-sales_order_no"),
                        production_code:$(v).find('.el-checkbox_input_check').attr("data-production_code"),
                        qty:$(v).find('.el-checkbox_input_check').attr("data-qty"),
                        release_date:$(v).find('.el-checkbox_input_check').attr("data-release_date"),
                        start_date:$(v).find('.el-checkbox_input_check').attr("data-start_date"),
                        status:$(v).find('.el-checkbox_input_check').attr("data-status"),
                    });
                }


            })
            // $('body').find('.el-checkbox_input_check').addClass('is-checked');

        }else {
            ids=[];
            $('body').find('.el-checkbox_input_check').removeClass('is-checked');
        }
    });

    $('#pull_all').on('click',function (e) {
        e.stopPropagation();
        pullOrderInfo({
            orders:JSON.stringify(ids),
            _token:TOKEN
        });
    })

    $('body').on('click', '.formPullOrder:not(".disabled") .cancle', function (e) {
        e.stopPropagation();
        console.log("cancle");
        layer.close(layerModal);
    })

}