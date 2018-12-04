var layerModal,
    layerLoading,
    pageNo=1,
    deviceTypeList,
    faultTypeList,
    repairRangeList,
    pageSize=20,
    ajaxData={},
experienceType=["维修经验", "保养经验"];
$(function(){
    resetParam();
    getUpkeeExperience();
    bindEvent();
    getSearch();

});
//重置搜索参数
function resetParam(){
    ajaxData={
        experience_type: '',
        device_type: '',
        fault_type: ''
    };
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
            getUpkeeExperience();
        }
    });
};
//获取列表
function getUpkeeExperience(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['upkeeExpreience'].pageIndex+"?"+_token+urlLeft,
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
                <td>${experienceType[item.experience_type]}</td>
                <td>${item.devicetype_name}</td>
                <td>${item.faultype_name}</td>
                <td>${item.device_code}</td>
                <td>${item.device_name}</td>
                <td>${item.repairdegree_name}</td>
                <td>${item.fault_describe}</td>
                <td>${item.repair_remark}</td> 
                <td class="right">
                <a class="link_button" href="/Device/operateUpkeeExpreience?id=${item.id}&flag=view"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                <a class="link_button" href="/Device/operateUpkeeExpreience?id=${item.id}&flag=edit"><button data-id="${item.id}" class="button pop-button edit">编辑</button></a>
                <button data-id="${item.id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};
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

//搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                experience_type: parentForm.find('#experience_type').val().trim(),
                device_type: parentForm.find('#device_type').val().trim(),
                fault_type: parentForm.find('#fault_type').val().trim()
            }
            getUpkeeExperience();
        }
    });
    $('body').on('click','#searchForm .el-select',function(){
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
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#experience_type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#device_type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#fault_type').val('').siblings('.el-input').val('--请选择--');

        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getUpkeeExperience();
    });

    $('.table_tbody').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#table_attr_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteOtherOption(id,num);
        });
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
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);

    });


};

function deleteOtherOption(id,leftNum) {
    AjaxClient.get({
        url: URLS['upkeeExpreience'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getUpkeeExperience();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                pageNo? null:pageNo=1;
                getUpkeeExperience();
            }
        }
    },this);
}




//生成下拉框数据
function selectHtml(fileData,parent_id,flag){
    var innerhtml,selectVal,parent_id;
    var lis=selecttreeHtml(fileData,parent_id);
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="${flag=='deviceType'?'device_type':'fault_type'}" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;
    itemSelect=[];
    return innerhtml;
}
//获取设备类型列表
function getDeviceType(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['deviceType'].treeIndex+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
            deviceTypeList=rsp.results;
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
//获取故障类型列表
function getFaultType(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['faultType'].treeIndex+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
            faultTypeList = rsp.results;
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}


function getSearch(){
    $.when(getDeviceType(),getFaultType())
        .done(function(deviceTypeRsp,getFaultTypeRsp){
            var deviceTypelis='',faultTypelis='';
            if(deviceTypeRsp&&deviceTypeRsp.results&&deviceTypeRsp.results.length){
                deviceTypelis=selectHtml(deviceTypeRsp.results,deviceTypeRsp.results[0].parent_id,"deviceType");
                $('.el-form-item.deviceType').find('.el-select-dropdown-wrap').html(deviceTypelis);
            }
            if(getFaultTypeRsp&&getFaultTypeRsp.results&&getFaultTypeRsp.results.length){
                faultTypelis=selectHtml(getFaultTypeRsp.results,getFaultTypeRsp.results[0].parent_id,"faultType");
                $('.el-form-item.faultType').find('.el-select-dropdown-wrap').html(faultTypelis);
            }

        }).fail(function(unitrsp,dataTypersp){
        console.log('获取设备类型失败');
    }).always(function(){
        layer.close(layerLoading);
    });
}