var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    id,
    code= 'ZY03',
    check_id,
    ajaxData={};

$(function(){
    resetParam();
    getPickingList();
    bindEvent();

});
//重置搜索参数
function resetParam(){
    ajaxData={
        code:'',
        type_code:'',
    };
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
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                type_code: encodeURIComponent(parentForm.find('#type_code').val().trim()),
            };
            pageNo=1;
            getPickingList();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#type_code').val('');
        resetParam();
        getPickingList();
    });

}


//获取粗排列表
function getPickingList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
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
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){

                createHtml($('#work_order_table .table_tbody'),rsp.results);
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
            noData('获取领料单列表失败，请刷新重试',9);
        }
        ,
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }

    },this)
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
function createHtml(ele,data){
    ele.html('');
    data.forEach(function(item,index){
        var tr=`
            <tr>
			<td>${tansferNull(item.code)}</td>
			<td>${checkReturnStatus(item.type_code)}（${item.type_code}）</td>
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
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });


}
function checkReturnStatus(type_code) {
    switch (type_code) {
        case 'ZY03':
            return '委外定额领料';
            break;
        case 'ZB03':
            return '委外补料';
            break;
        case 'ZY06':
            return '委外定额退料';
            break;
        case 'ZY05':
            return '委外超耗补料';
            break;
        case 'ZY04':
            return '委外超发退料';
            break;
        default:
            break;
    }
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

