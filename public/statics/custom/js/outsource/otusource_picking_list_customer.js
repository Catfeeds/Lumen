var layerModal,
    layerLoading,
    itemPageNo=1,
    pageNo=1,
    pageSize=20,
    id,
    code= 'ZY03',
    check_id,
    ajaxItemData={};

ajaxData={};
$(function(){
    resetParam();
    resetParamItem();
    getOutsource();
    bindEvent();




});
window.onload = function() {
    check_id = $("#add_check_checkbox").val();
    $('#searchForm .submit').click();
};

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

//重置搜索参数
function resetParam(){
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
                    <a class="link_button" style="border: none;padding: 0;" href="/Outsource/viewOutsourceCopy?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
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

    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).parent().parent().parent().find('.el-checkbox_input_check').each(function (k,v) {
            $(v).removeClass('is-checked');
        })
        $(this).addClass('is-checked');
        id = $(this).attr('data-id');
        $("#add_check_checkbox").val(id);
        ajaxItemData={
            id: id
        };
        if(id==undefined){
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
        url: URLS['outsource'].showOutWork+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            var _html=createItemHtml(rsp);
            $('.show_item_table_page').html(_html);


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
			<tr class="tritem" data-id="${item.id}">
                <td>${tansferNull(item.number)}</td>
                <td>${tansferNull(item.BANFN)}</td>
                <td>${tansferNull(item.BNFPO)}</td>
                <td>${tansferNull(item.production_number)}</td>
                <td>${tansferNull(item.operation_name)}</td>
               
                <td class="right">
                    
                    <a class="link_button" style="border: none;padding: 0;" href="/Outsource/viewOutsourceOrderCopy?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>

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
                        <th>委外工单号</th>
                        <th>采购申请编号</th>
                        <th>采购申请的项目编号</th>
                        <th>生产订单号</th>
                        <th>工序名称</th>
                        <th class="right">操作</th>
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
        id: ''
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
            LayerConfig('fail','SAP推送失败！错误日志为：'+rsp.message);
        }
    }, this)
}

