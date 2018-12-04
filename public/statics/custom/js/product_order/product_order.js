
var pageNo=1,pageSize=20,ajaxData = { order:'desc',sort:'id'},layerLoading,layerModal,start,end;
$(function () {
    setAjaxData();
    getOrderData();
    bindEvent();

})
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
        }catch (e) {
            ajaxData = {};
        }
    }
}
function resetParam() {
    ajaxData = {
        admin_name: '',
        item_no: '',
        sales_order_code: '',
        number: ''
    }
}

function bindEvent() {
    $('#pull').on('click',function (e) {
        e.stopPropagation();
        Model();
    })
    //搜索
    $('body').on('click','#searchBomAttr_from:not(".is-disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchBomAttr_from');
            ajaxData = {
                admin_name : encodeURIComponent(parentForm.find('#creator').val().trim()),
                item_no: encodeURIComponent(parentForm.find('#materialName').val().trim()),
                sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                number: encodeURIComponent(parentForm.find('#number').val().trim()),
                order: 'desc',
                sort: 'id'
            };
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            getOrderData();
        }
    })
    //发布操作
    $('.uniquetable').on('click','.publish',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行发布操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
          layer.close(index);
          release(id);
        });
    });

    //bom 搜索重置
    $('body').on('click','#searchBomAttr_from .reset',function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#searchBomAttr_from');
        parentForm.find('#creator').val('');
        parentForm.find('#materialName').val('');
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#number').val('');
        resetParam();
        getOrderData();
    });
//更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#searchForm .el-item-show').css('background','#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400,function(){
                that.removeClass('noclick');
            });
        }else{
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
                that.removeClass('noclick');
            });
        }
    });
    $('body').on('click','#product_order_table .delete',function () {
        var id=$(this).attr("data-id");

        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            deleteProductOrder(id);
            layer.close(index);
        });
    });
    $('body').on('click','.formPullOrder:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#addPullOrder_from'),
        order_no = parentForm.find('#order').val(),
        date = parentForm.find('#date').val(),
        start = date.substr(0,10),
        end = date.substr(13,10);
        location.href="pullOrderIndex?order_no="+order_no+"&startDate="+start+"&endDate="+end;

    })

    $('body').on('click', '.formPullOrder:not(".disabled") .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    })

}

function Model(){


    var labelWidth=150,
        title='拉取订单';


    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formPullOrder" id="addPullOrder_from">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">销售订单</label>
                <input type="text" id="order"  data-name="销售订单" class="el-input" placeholder="销售订单" value="">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">时间段</label>
                <input type="text" id="date"  data-name="时间段" class="el-input" placeholder="时间段" value="">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>
                
    </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            getDate('#date');
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};
function getDate(ele) {
    start = laydate.render({
            elem: ele,range:true,
            done: function (value, date, endDate) {

            }
        });
}




function deleteProductOrder(id) {
    AjaxClient.get({
        url: URLS['order'].orderDelete+"?"+_token+"&product_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);

            getOrderData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
            if(rsp.code==404){
                getOrderData();
            }
        }
    },this);
}

function getOrderData() {
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;

    $('.table_tbody').html('');

    AjaxClient.get({
        url: URLS['order'].orderList+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results && rsp.results.length){
                $('.table_tbody').html('');
                var pageTotal = rsp.paging.total_records;

                if(pageTotal>pageSize){
                    bindPagenationClick(pageTotal,pageSize);
                }else{
                    $('#pagenation').html('');
                }

                if(rsp.results && rsp.results.length){
                    createHtml($('.table_tbody'),rsp.results)
                }else{
                    noData('暂无数据',10);
                }
            }else {
                noData('暂无数据',10);
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取生产订单列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchBomAttr_from .submit').removeClass('is-disabled');
        }
    })
}

function release(id){
    AjaxClient.get({
        url: URLS['order'].release+"?"+_token+"&production_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.msg("发布成功", {icon: 1,offset: '250px',time: 1500});
            getOrderData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null){
                LayerConfig('fail', rsp.message);
            }
            console.log('发布失败');
        }
    })
}

function createHtml(ele,data) {

    var editurl=$('#order_edit').val(),
        viewurl=$('#order_view').val();
    data.forEach(function (item,index) {
        var status = item.status,editBtn='',pubBtn='';
        switch (status){
            case 0:
                editBtn=`<a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.product_order_id}"><button class="button pop-button edit">编辑</button></a>`;
                pubBtn =`<button class="button pop-button publish" data-id="${item.product_order_id}">发布</button>`;
                break;
            case 1:
                editBtn='';
                pubBtn='';
                break;
            default:
                editBtn='';
                pubBtn='';
        }
        var tr = ` <tr>
                    <td>${item.number}</td>
                    <td>${item.sales_order_code}</td>
                    <td>${item.material_name==null?'':item.material_name}</td>
                    <td>${item.qty}</td>
                    <td>${item.scrap}</td>
                    <td>${item.start_date}</td>
                    <td>${item.end_date}</td>
                    <td>${item.status == 0 ? `<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未发布</span>`:
                            `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`}</td>
                    <td>${item.admin_name==null?'':item.admin_name}</td>
                    <td>${item.ctime}</td>
                    <td class="right nowrap">
                        ${pubBtn}
                        <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.product_order_id}"><button class="button pop-button view" data-id="${item.product_order_id}">查看</button></a>
                        ${editBtn}
                        <button class="button pop-button delete" data-id="${item.product_order_id}">删除</button>
                    </td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })
}
//分页
function bindPagenationClick(total,size) {
    $('.pagenation_wrap').show();
    $('#pagenation').pagination({
        totalData:total,
        showData:size,
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
            getOrderData();
        }
    });
}


