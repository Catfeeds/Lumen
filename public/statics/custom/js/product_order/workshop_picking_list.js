var layerModal,
    layerLoading,
    pageNo=1,
    itemPageNo=1,
    pageSize=20,
    ajaxData={},
    ajaxOutData={};
$(function () {
    if(status==1){
        $("#searchSTallo_from").hide();
        $("#searchOutsource_from").show();
        setAjaxOutData();
        getOutPickingList();
    }else {
        $("#searchSTallo_from").show();
        $("#searchOutsource_from").hide();
        setAjaxData();
        getPickingList();
    }

    bindEvent();
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
        }catch (e) {
            resetParam();
        }
    }
}
function setAjaxOutData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.itemPageNo;
            itemPageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).itemPageNo;
        }catch (e) {
            resetOutParam();
        }
    }
}
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
            getPickingList();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        work_order_code: '',
        product_order_code: ''
    };
}
//重置搜索参数
function resetOutParam(){
    ajaxOutData={
        code: '',
        work_order_code: '',
        po_number: '',
        EBELN: ''
    };
}

//获取粗排列表
function getPickingList(){
    var urlLeft='&push_type=2';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].MaterialRequisition+"?"+_token+urlLeft,
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
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',9);
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
			<td>${tansferNull(item.send_depot_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
            				
            <td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status))}</td>
			<td class="right">
	         <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">编辑</a>       
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
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
                        <th class="left nowrap tight">领料人</th>
                        <th class="left nowrap tight">状态</th>
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

                getPickingList();

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});

            // layer.msg('获取工单详情失败，请刷新重试', 9);
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

                getPickingList();

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
                getPickingList();

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
                getPickingList();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','推送失败！错误日志为：'+rsp.message)
        }
    }, this)
}

function bindItemPagenationClick(totalData,pageSize){
    $('#item_pagenation').show();
    $('#item_pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: itemPageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            itemPageNo=api.getCurrent();
            getOutPickingList();
        }
    });
}
//获取委外列表
function getOutPickingList(){
    var urlLeft='';
    for(var param in ajaxOutData){
        urlLeft+=`&${param}=${ajaxOutData[param]}`;
    }
    if(itemPageNo==undefined){
        itemPageNo=1;
    }
    urlLeft+="&page_no="+itemPageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['outsource'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            ajaxData.itemPageNo=itemPageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createItemHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindItemPagenationClick(totalData,pageSize);
            }else{
                $('#item_pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',9);
        },
        complete: function(){
            $('#searchForm .submitOutsource').removeClass('is-disabled');
        }

    },this)
}
//生成委外列表数据
function createItemHtml(data){
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){

            trs+= `
			<tr>
			<td>${tansferNull(item.sales_order_code)}</td>
			<td>${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.sub_number)}</td>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.BANFN)}</td>
			<td>${tansferNull(item.BNFPO)}</td>
			<td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.time)}</td>
			<td>${tansferNull(item.status==0?'未审核':item.status==1?'审核通过':'')}</td>
			<td>${tansferNull(item.type==1?'领料':item.type==2?'补料':item.type==3?'退料':'')}</td>
			<td class="right">
			 ${item.status==0?`<button data-id="${item.id}" class="button pop-button out_item_audit">审核</button>`:''}
	         <a class="button pop-button view" href="/Outsource/editOutsourceOrder?id=${item.id}">查看</a>
	          ${item.status == 0 ?`<a class="button pop-button view" href="/Outsource/sendOutsourceOrder?id=${item.id}">${item.type==3?'实退':'实发'}</a>`:''}
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div" >
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">销售行项号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">采购申请编号</th>
                        <th class="left nowrap tight">采购申请的项目编号</th>
                        <th class="left nowrap tight">员工</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">状态</th>                   
                        <th class="left nowrap tight">类型</th>                   
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="item_pagenation" class="pagenation unpro"></div>`;
    return thtml;
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
    $('body').on('click','.out_item_audit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            outCheck(id);
        });

    });

    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var _type = $(this).attr('data-status');
            status=_type;
            if(status==1){
                $("#searchSTallo_from").hide();
                $("#searchOutsource_from").show();
                getOutPickingList();
            }else {
                $("#searchSTallo_from").show();
                $("#searchOutsource_from").hide();
                getPickingList();
            }
        }
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
            };
            pageNo=1;
            getPickingList();
        }
    });
    //搜索
    $('body').on('click','#searchForm .submitOutsource',function(e){
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
            ajaxOutData={
                code: encodeURIComponent(parentForm.find('#out_code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#out_work_order_code').val().trim()),
                po_number: encodeURIComponent(parentForm.find('#out_product_order_code').val().trim()),
                EBELN: encodeURIComponent(parentForm.find('#out_Ebeln').val().trim()),
            };
            pageNo=1;
            getOutPickingList();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#product_order_code').val('');
        pageNo=1;
        resetParam();
        getPickingList();
    });
    //重置搜索框值
    $('body').on('click','#searchForm .resetOut',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#out_code').val('');
        parentForm.find('#out_work_order_code').val('');
        parentForm.find('#out_product_order_code').val('');
        parentForm.find('#out_Ebeln').val('');
        pageNo=1;
        resetOutParam();
        getOutPickingList();
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
function outCheck(id) {
    AjaxClient.get({
        url: URLS['outsource'].check +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');
                getPickingList();

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}

function checkPickingStatus(status) {
    switch(status)
    {
        case 1:
            return '未接収';
            break;
        case 2:
            return '待发料';
            break;
        case 3:
            return '已发送';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}
function checkReturnStatus(status) {
    switch(status)
    {
        case 1:
            return '未接收';
            break;
        case 2:
            return '未接收';
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

