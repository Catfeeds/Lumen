var layerModal,
    layerLoading,
    itemPageNo=1,
    pageNo=1,
    pageSize=20,
    picking_id,
    check_id,
    type=1,
    ajaxItemData={};

ajaxData={};
$(function(){
    setAjaxData();
    resetParamItem();
    getOutsourceOrder();
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
            getOutsourceOrder();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        production_code: '',
        purchase_code: '',
    };
}

//获取列表
function getOutsourceOrder(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['outsource'].outsourceOrder+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            ajaxData.pageNo=pageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('#outsource_table .table_tbody'),rsp.results);
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
            noData('获取列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);

}



//生成列表数据
function createHtml(ele,data){
    ele.html('');
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td><span class="el-checkbox_input el-checkbox_input_check" data-id="${item.id}">
		                <span class="el-checkbox-outset"></span>
                    </span></td>
                <td>${tansferNull(item.number)}</td>
                <td>${tansferNull(item.BANFN)}</td>
                <td>${tansferNull(item.BNFPO)}</td>
                <td>${tansferNull(item.production_number)}</td>
                <td>${tansferNull(item.operation_name)}</td>
                <td>${tansferNull(item.on_off==0?'关闭':'开启')}</td>
               
                <td class="right">
                    
                    <a class="link_button" style="border: none;padding: 0;" href="/Outsource/viewOutsourceOrder?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>

                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
    if(check_id){
        $("#check_input"+check_id).click();
    }

}


function bindEvent(){
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

    $('body').on('click','.el-tap-wrap .el-item-tap',function () {
        var form=$(this).attr('data-item');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-item-tap').removeClass('active');
            type=$(this).attr('data-status');
            ajaxItemData={
                type: type,
                sub_id: picking_id
            };
            if(picking_id==undefined){
                layer.confirm('请选择一个委外工单！?', {icon: 3, title:'提示',offset: '250px',end:function(){
                }}, function(index){
                    layer.close(index);
                });
            }else {
                getPickingList();

            }

        }
    });
    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).parent().parent().parent().find('.el-checkbox_input_check').each(function (k,v) {
            $(v).removeClass('is-checked');
        })
        $(this).addClass('is-checked');
        picking_id = $(this).attr('data-id');
        $("#add_check_checkbox").val(picking_id);
        ajaxItemData={
            type: type,
            sub_id: picking_id
        };
        if(picking_id==undefined){
            layer.confirm('请选择一个委外单！?', {icon: 3, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
            });
        }else {
            getPickingList();

        }

    });

    $('body').on('click','.item_submit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id);
        });

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
                production_code: encodeURIComponent(parentForm.find('#production_code').val().trim()),
                purchase_code: encodeURIComponent(parentForm.find('#purchase_code').val().trim()),
            };
            pageNo=1;
            getOutsourceOrder();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#production_code').val('');
        parentForm.find('#purchase_code').val('');
        resetParam();
        getOutsourceOrder();
    });

    $('body').on('click','.item_audit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            check(id);
        });

    });

}

function check(id) {
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


//获取粗排列表
function getPickingList(){
    var urlLeft='';
    for(var param in ajaxItemData){
        urlLeft+=`&${param}=${ajaxItemData[param]}`;
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

            var totalData=rsp.paging.total_records;
            var _html=createItemHtml(rsp);
            $('.show_item_table_page').html(_html);
            if(totalData>pageSize){
                bindItemPagenationClick(totalData,pageSize);
            }else{
                $('#item_pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',9);
        }

    },this)
}


//生成未排列表数据
function createItemHtml(data){
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){

            trs+= `
			<tr>
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
    var thtml=`<div class="wrap_table_div" style="height: 300px; overflow-y: auto; overflow-x: hidden;" >
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
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

//重置搜索参数
function resetParamItem(){
    ajaxItemData={
        type: '',
        sub_id: ''
    };
}
function submint(id) {
    AjaxClient.get({
        url: URLS['outsource'].pushOutMachineZy +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','成功！');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if(rsp.code==9503){
                LayerConfig('fail',rsp.message);
            }else {
                LayerConfig('fail','失败！');
            }
        }
    }, this)
}

