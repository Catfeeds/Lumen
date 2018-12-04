var layerModal,
    layerLoading,
    pageNo=1,
    itemPageNo=1,
    pageSize=20,
    push_type=1,
    ajaxData={},
ajaxItemData={};
$(function () {
    setAjaxData();
    resetParamItem();
    if(!itemPageNo){
        itemPageNo=1;
    }
    $('.el-tap[data-status='+push_type+']').addClass('active').siblings('.el-tap').removeClass('active');
    getPickingList(push_type);
    bindEvent();
});
//重置搜索参数
function resetParamItem(){
    ajaxItemData={
        type: '',
        sub_id: ''
    };
}
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            delete ajaxData.push_type;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
            push_type=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).push_type;
        }catch (e) {
            resetParam();
        }
    }
}
function bindPagenationClick(totalData,pageSize,push_type){
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
            getPickingList(push_type);
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        work_order_code: '',
        product_order_code: '',
        type: '',
        status: ''
    };
}

//获取粗排列表
function getPickingList(push_type){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].MaterialRequisition+"?"+_token+urlLeft+"&push_type="+push_type,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            ajaxData.pageNo=pageNo;
            ajaxData.push_type=push_type;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,push_type);
            }else{
                $('#pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',11);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    },this)
}

//生成未排列表数据
function createHtml(data){
    var viewurl=$('#workOrder_view').val();
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){

            trs+= `
			<tr>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.product_order_code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
			<td>${tansferNull(item.workbench_code)}</td>
			<td>${tansferNull(item.line_depot_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.workbench_code)}</td>
            <td>${item.push_type == 0 ?
                `<span style="display: inline-block;border: 1px solid red;color: red;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">线边</span>`
                :item.push_type == 1 ?
                    `<span style="display: inline-block;border: 1px solid green;color: green;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">SAP</span>`
                    :item.push_type == 2 ?
                        `<span style="display: inline-block;border: 1px solid #debf08;color: #debf08;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">车间</span>`:
                        ''
                }
            </td>			
            <td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status))}</td>
			<td>${tansferNull(checkType(item.type))}</td>
			<td>${tansferNull(item.ctime)}</td>
			<td class="right">
	         ${item.status == 1 && item.push_type != 2 ? `<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button item_submit">推送</button>` : ''}
	         <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">编辑</a>
	         ${((item.status == 1) || ((item.status == 2||item.status == 1) && item.type==2) ) ?`<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button delete">删除</button>`:''}
	         ${(item.push_type==0&&item.status == 4) ?`<!--<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button returnAudit">反审</button>-->`:''}
	         
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="11" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">发送至</th>
                        <th class="left nowrap tight">领料人</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;
}

function check(id) {
    AjaxClient.get({
        url: URLS['work'].check +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');

                getPickingList(push_type);

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}
function returnAudit(id) {
    AjaxClient.get({
        url: URLS['work'].returnAudit +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');
                getPickingList(push_type);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}

function deleteItem(id) {
    AjaxClient.get({
        url: URLS['work'].delete +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
                LayerConfig('success','删除成功！');
                getPickingList(push_type);

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','删除失败！错误日志为：'+rsp.message)
        }
    }, this)
}

function submint(id,type) {
    AjaxClient.get({
        url: URLS['work'].submit +"?"+ _token + "&id=" + id+ "&type=" + type,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','推送成功！');
                getPickingList(push_type);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','推送失败！错误日志为：'+rsp.message)
        }
    }, this)
}
function resetAll() {
    var parentForm=$('#searchForm');
    parentForm.find('#code').val('');
    parentForm.find('#work_order_code').val('');
    parentForm.find('#product_order_code').val('');
    parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
    pageNo = 1;
    resetParam();
}


function bindEvent() {
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var _type = $(this).attr('data-status');
            push_type=_type;
            resetAll();
            getPickingList(push_type);
        }
    });

    $('body').on('click','.choose_status',function(e){
        e.stopPropagation();
        var type = $(this).attr('data-id');
        var _html = chooseStatus(type);
        $('#show_status').html(_html);
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
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
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    $('body').on('click','.el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });
    $(document).keydown(function(event){
        if(event.keyCode == 13){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('backageground','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                var parentForm=$("#searchForm .submit").parents('#searchForm');
                $('.el-sort').removeClass('ascending descending');
                ajaxData={
                    code: encodeURIComponent(parentForm.find('#code').val().trim()),
                    work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                    product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                    type: encodeURIComponent(parentForm.find('#type').val().trim()),
                    status: encodeURIComponent(parentForm.find('#status').val().trim()),
                };
                pageNo=1;
                getPickingList(push_type);
            }
        }
    });
    //搜索
    $('body').on('click','#searchForm .submit',function(e){
        e.stopPropagation();
        e.preventDefault();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('backageground','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            ajaxData={
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                type: encodeURIComponent(parentForm.find('#type').val().trim()),
                status: encodeURIComponent(parentForm.find('#status').val().trim()),
            };
            pageNo=1;
            getPickingList(push_type);
        }
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#product_order_code').val('');
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        pageNo=1;
        resetParam();
        getPickingList(push_type);
    });
    $('body').on('click','.item_submit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');

        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id,type);
        });

    });


    $('body').on('click','.delete',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            deleteItem(id);
        });

    });
    $('body').on('click','.item_check',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            check(id);
        });

    });
    $('body').on('click','.returnAudit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            returnAudit(id);
        });

    });


}


function checkPickingStatus(status) {
    switch(status)
    {
        case 1:
            return '未发送';
            break;
        case 2:
            return '已推送';
            break;
        case 3:
            return '待入库';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}
function checkReturnStatus(status) {
    switch (status) {
        case 1:
            return '待推送';
            break;
        case 2:
            return '进行中';
            break;
        case 3:
            return '待出库';
            break;
        case 4:
            return '完成';
            break;
        case 5:
            return '反审完成';
            break;
        default:
            break;
    }
}

function checkType(type) {
    switch(type)
    {
        case 1:
            return '领料';
            break;
        case 2:
            return '退料';
            break;
        case 7:
            return '补料';
            break;
        default:
            break;
    }
}

function chooseStatus(type) {
    switch(Number(type))
    {
        case 1:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        case 2:
            return `<li data-id="1" class=" el-select-dropdown-item">待出库</li>
                    <li data-id="2" class=" el-select-dropdown-item">待推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">进行中</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>
                    <li data-id="5" class=" el-select-dropdown-item">反审完成</li>`;
            break;
        case 7:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        default:
            break;
    }
}

