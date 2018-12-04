var layerModal,
    layerLoading,
    itemPageNo=1,
    pageNo=1,
    pageSize=20,
    picking_id,
    code= 'ZY03',
    check_id,
    ajaxItemData={};

ajaxData={};
$(function(){
    setAjaxData();
    resetParamItem();
    getOutsource();
    bindEvent();
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            delete ajaxData.picking_id;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
            picking_id=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).picking_id;
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
            getOutsource();
        }
    });
}
function bindItemPagenationClick(totalData,pageSize){
    $('#item_pagenation').show();
    $('#item_pagenation').pagination({
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
            getOutsource();
        }
    });
}

//重置搜索参数
function resetParam(){
    $("#search_EBELN").val('');
    $("#search_EKGRP").val('');
    $("#search_BUKRS").val('');
    $("#search_LIFNR").val('');
    ajaxData={
        EBELN: '',
        EKGRP: '',
        BUKRS: '',
        LIFNR: ''
    };
}

//获取物料列表
function getOutsource(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['outsource'].OutMachine+"?"+_token+urlLeft,
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
            noData('获取物料列表失败，请刷新重试',10);
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
                <td><span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.id}" data-id="${item.id}">
		                <span class="el-checkbox-outset"></span>
                    </span></td>
                <td>${tansferNull(item.EBELN)}</td>
                <td>${tansferNull(item.BUKRS)}</td>
                <td>${tansferNull(item.BSTYP)}</td>
                <td>${tansferNull(item.BSART)}</td>
                <td>${tansferNull(item.LIFNR)}</td>
                <td>${tansferNull(item.EKORG)}</td>
                <td>${tansferNull(item.EKGRP)}</td>
                <td class="right">
                    <div class="btn-group">
                        <button type="button" class="button pop-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
                        <ul class="dropdown-menu" style="right: 0;left: auto" role="menu">
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=5&type_code=ZY03">生成委外定额领料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=4&type_code=ZB03">生成委外补料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=3&type_code=ZY06">生成委外定额退料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=2&type_code=ZY05">生成委外超耗补料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=1&type_code=ZY04">生成委外超发退料</a></li>
                        </ul>
                    </div>
                    <a class="link_button" style="border: none;padding: 0;" href="/Outsource/viewOutsource?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
    if(picking_id){
        $("#check_input"+picking_id).click();
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
            code=$(this).attr('data-code');
            ajaxItemData={
                type_code: code,
                picking_id: picking_id
            };
            if(picking_id==undefined){
                layer.confirm('请选择一个委外单！?', {icon: 3, title:'提示',offset: '250px',end:function(){
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
            type_code: code,
            picking_id: picking_id
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
                EBELN: encodeURIComponent(parentForm.find('#search_EBELN').val().trim()),
                EKGRP: encodeURIComponent(parentForm.find('#search_EKGRP').val().trim()),
                BUKRS: encodeURIComponent(parentForm.find('#search_BUKRS').val().trim()),
                LIFNR: encodeURIComponent(parentForm.find('#search_LIFNR').val().trim()),
            };
            pageNo=1;
            getOutsource();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        resetParam();
        getOutsource();
    });

}


//获取粗排列表
function getPickingList(){
    var urlLeft='';
    for(var param in ajaxItemData){
        urlLeft+=`&${param}=${ajaxItemData[param]}`;
    }
    urlLeft+="&page_no="+itemPageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['outsource'].OutMachineZy+"?"+_token+urlLeft,
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
            ajaxData.picking_id=picking_id;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
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
			<td>${tansferNull(item.type_code)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.time)}</td>
			<td>${tansferNull(item.status==1?'未发送':item.status==2?'执行中':item.status==2?'完成':'')}</td>
			<td class="right">
	         ${item.status!=2?`<button data-id="${item.id}" class="button pop-button item_submit">推送</button>`:''}
	         <a class="button pop-button view" href="/Outsource/editOutsource?id=${item.id}&type=${item.type_code}">查看</a>
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
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">员工</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">状态</th>                   
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
        type_code: '',
        picking_id: ''
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
                LayerConfig('success','推送成功！');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','推送失败！错误日志为：'+rsp.message);
        }
    }, this)
}

