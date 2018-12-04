
var layerModal,
    layerLoading,
    layerEle='',
    pageNo=1,
    pageSize=20,
    ajaxData={},
    proceData = [];

$(function () {
    getProceData();
    getProcemanageData();
    bindEvent();
    resetParam();

});

//重置搜索参数
function resetParam(){
    ajaxData={
        operation_name: '',
    };
}

//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addProceSetModal_form').find('.submit').removeClass('is-disabled');
}

function getProcemanageData() {
    $('.table_tbody').html("");
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    // urlLeft = "&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['workhoursetting'].listAll+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results && rsp.results.length){
                $('.table_tbody').html(treeHtml(rsp.results,rsp.results[0].parent_id,'table'));
                $('.treeNode .itemIcon').each(function () {
                    $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
                    hideChildren($(this).parents('.treeNode').attr("data-id"));

                });

            }else{
                noData('暂无数据',9);
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取工序维护列表失败，请刷新重试',10);

        }
    },this)
}

function treeHtml(fileData, parent_id, flag,value) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        var distance,className,itemImageClass,tagI,itemTable="";
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`) : (distance=level * 20,tagI='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.operation_name?item.operation_name:""}</span> </div>`: `${tagI}<span>${item.operation_name?item.operation_name:""}</span> `;
        if(item.groups&&item.groups.length){
            itemTable=getItemTableHtml(item.groups);
        }

        if(flag==='table'){
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}" ${item.is_sign==1?'style="background-color: #00F7DE"':''}">
	          <td>${span}</td>
	          <td>${item.ability_name?item.ability_name:""}</td>
	          <td>${item.quantity_interval}</td>
	          <td>${item.multiple}</td>
	          <td>${item.preparation_hour}</td>
	          <td>${item.ability_value}</td>
	          <td>${itemTable}</td>
	          <td >${item.level==0?"":item.is_sign==1?"是":"否"}</td>
	          <td class="right">
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button clear">置空</button>
                ${item.is_sign==1?`<button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button clear_setting">取消基准</button>`:""}
                ${item.level==1?`<button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button setting">设为基准</button>`:""}
               
              </td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
        }else{
            item.id==value?(itemSelect.push(item),selectedClass='selected'):null;
            _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${encodeURI(item.name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id, flag,value)}
	        `;
        }
    });
    return _html;
};
function getItemTableHtml(lis) {
    var tr = '',_html;
    lis.forEach(function (item) {
        tr += `<tr style="background-color: rgb(0,219,174)">
                    <td style="text-align: center">${item.nextoperation_name}</td>
                    <td style="text-align: center">${item.nextability_name}</td>
                    <td style="text-align: center">${item.flow_value}</td>
                </tr>`
    });
    _html=`<table>
                <tr style="background-color: rgb(0,161,106)">
                    <th style="text-align: center">下道工序</th>
                    <th style="text-align: center">能力</th>
                    <th style="text-align: center">流转工时[s]</th>
                </tr>
                ${tr}
            </table>`;
    return _html;

}

function getProceData() {
    AjaxClient.get({
        url: URLS['procemanage'].procedureList+'?'+_token,
        dataType: 'json',
        success:function (rsp) {
            layer.close(layerLoading);
            proceData = rsp.results.list;
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this)
}


function bindEvent() {
    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
        if(layerEle!=''&&$(this).siblings('.el-select-dropdown').is(':visible')){
            getLayerSelectPosition(layerEle);
        }
    });
    $('.table_tbody').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewWorkHourSetting($(this).attr("data-id"),'view');
    });
    $('.table_tbody').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewWorkHourSetting($(this).attr("data-id"),'edit');
    });
    $('.table_tbody').on('click','.setting',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        signWorkHourSetting($(this).attr("data-id"));
    });
    $('.table_tbody').on('click','.clear_setting',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        signWorkHourClearSetting($(this).attr("data-id"));
    });
    $('.table_tbody').on('click','.clear',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行置空操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            clearWorkHourSetting(id);
        });
    });
    //搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            // $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                operation_name: encodeURIComponent(parentForm.find('#operation').val().trim()),
            }

            getProcemanageData();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        // $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        encodeURIComponent(parentForm.find('#operation').val(''));
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getProcemanageData();
    });

    //下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto)',function(e){
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

    $('body').on('click','.operation_name .el-select-dropdown-item:not(.el-auto)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            getAbility($(this).attr('data-id'),$(this))
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

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
    //树形表格展开收缩
    $('body').on('click','.treeNode .itemIcon',function(){
        if($(this).parents('.treeNode').hasClass('collasped')){
            $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
            showChildren($(this).parents('.treeNode').attr("data-id"));
        }else{
            $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
            hideChildren($(this).parents('.treeNode').attr("data-id"));
        }
    });

    $('body').on('click','#addWorkHourSettig_form:not(".disabled") .submit',function () {
        var index = 0;
        var arr=[],_len = $('.inputOperationability_table .table_tbody tr'),obj={};
        if(_len.length){
            $(_len).each(function (k,v) {

                if($(v).find('.next_operation').val() != '' && $(v).find('.ability_id').val() != '' && $(v).find('.flow_value').val() != ''){
                    obj={
                        id:$(v).find('.item_id').val().trim()?$(v).find('.item_id').val().trim():"",
                        next_operation:$(v).find('.next_operation').val().trim(),
                        next_ability:$(v).find('.ability_id').val().trim(),
                        flow_value:$(v).find('.flow_value').val().trim(),
                    };
                    arr.push(obj)
                }else {
                    index++;
                }
            });
        };


        var parentForm = $(this).parents('#addWorkHourSettig_form'),
            id=parentForm.find('#itemId').val(),
            prepare_work_hour=parentForm.find('#prepare_work_hour').val(),
            ability_value=parentForm.find('#ability_value').val(),
            remark=parentForm.find('#remark').val(),
            rated_value=parentForm.find('#rated_value').val(),
            number_range=parentForm.find("input[name='number_range']:checked").val()?parentForm.find("input[name='number_range']:checked").val():0,
            multiple=parentForm.find("input[name='multiple']:checked").val()?parentForm.find("input[name='multiple']:checked").val():0,
            type=parentForm.find("input[name='type']:checked").val()?parentForm.find("input[name='type']:checked").val():0,
            is_ladder=parentForm.find("input[name='is_ladder']:checked").val()?parentForm.find("input[name='is_ladder']:checked").val():0,
            flag=parentForm.attr("data-flag");
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                if(flag=='edit'){
                    editWorkHourSetting({
                        id:id,
                        preparation_hour: prepare_work_hour,
                        quantity_interval: number_range,
                        multiple:multiple,
                        ability_value:ability_value?ability_value:0,
                        rated_value:rated_value,
                        is_ladder:is_ladder,
                        remark:remark,
                        type:type,
                        items:JSON.stringify(arr),
                        _token:TOKEN
                    },index)
                }



            }


    })

    $('body').on('change','input[type="number"]',function (e) {
        e.stopPropagation();

        var val = $(this).val();
        var relval = val>=0?val:0;
        $(this).val(relval)

    });

    $("#work_hours_sync").on('click',function (e) {
        e.stopPropagation();
        sync();
    });


}

function signWorkHourSetting(id) {
    AjaxClient.get({
        url: URLS['workhoursetting'].setting+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getProcemanageData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getProcemanageData();
            }
        }
    },this);
}
function signWorkHourClearSetting(id) {
    AjaxClient.get({
        url: URLS['workhoursetting'].clearSetting+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getProcemanageData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getProcemanageData();
            }
        }
    },this);
}

function sync() {
    AjaxClient.get({
        url: URLS['workhoursetting'].sync+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getProcemanageData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该选型失败');
            if(rsp.code==404){
                getProcemanageData();
            }
        }
    },this);
}

function viewWorkHourSetting(id,flag) {
    AjaxClient.get({
        url: URLS['workhoursetting'].view+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            workHourSettingModel(id,flag,rsp.results);

        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该选型失败');
            if(rsp.code==404){
                getProcemanageData();
            }
        }
    },this);
}

function clearWorkHourSetting(id) {
    AjaxClient.get({
        url: URLS['workhoursetting'].empty+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getProcemanageData();
            LayerConfig('success','置空成功！');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getProcemanageData();
            }
        }
    },this);
}

function editWorkHourSetting(data,index) {
    AjaxClient.post({
        url: URLS['workhoursetting'].edit,
        dataType: 'json',
        data: data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            if (rsp.code == '200' || rsp.message == 'OK') {
                if(index>0){
                    layer.confirm("有"+index+"条数据维护不全", {icon: 3, title:'提示',offset: '250px',end:function(){
                    }}, function(index){
                        layer.close(index);
                        getProcemanageData();
                    });
                }else {
                    layer.confirm("编辑成功", {icon: 1, title:'提示',offset: '250px',end:function(){
                    }}, function(index){
                        layer.close(index);
                        getProcemanageData();
                    });
                }
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addWorkHourSettig_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }

        }
    },this)
}

function workHourSettingModel(id,flag,data) {
    var {multiple='',operation_code='',operation_id='',groups='',parent_id='',rated_value='',operation_name='',preparation_hour='',quantity_interval='',ability_id='',ability_name='',ability_value='',flow_value='',next_operation_id='',next_operation_name='',type='',remark='',is_ladder=''}={};
    if(data){
        ({multiple='',operation_code='',operation_id='',groups='',parent_id='',rated_value='',operation_name='',preparation_hour='',quantity_interval='',ability_id='',ability_name='',ability_value='',flow_value='',next_operation_id='',next_operation_name='',type='',remark='',is_ladder=''}=data[0])
    }

    var labelWidth=100,title='查看工时设置',btnShow='btnShow',readonly='',noEdit='',proceItem = '',disabled='';

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"',disabled='disabled="disabled"'):(flag==='edit'?(title='编辑工时设置',noEdit='readonly="readonly"'):title='添加工时设置');

    if(proceData && proceData.length){
        // console.log(proceData);
        proceData.forEach(function (item) {
            if(flag == 'edit'){
                proceItem += `<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`
            }
        });
    }

    var multiple1='',multiple2='',range1='',range2='',range3='',range4='',type1='',type2='',is_ladder1='',is_ladder2='';
    switch (quantity_interval){
        case 1:
            range1='checked="checked"';
        break;
        case 2:
            range2='checked="checked"';
        break;
        case 3:
            range3='checked="checked"';
        break;
        case 4:
            range4='checked="checked"';
        break;
    }
    switch (multiple){
        case 1:
            multiple1='checked="checked"';
        break;
        case 2:
            multiple2='checked="checked"';
        break;
    }
    switch (type){
        case 1:
            type1='checked="checked"';
        break;
        case 2:
            type2='checked="checked"';
        break;
    }
    switch (is_ladder){
        case 1:
            is_ladder1='checked="checked"';
        break;
        case 0:
            is_ladder2='checked="checked"';
        break;
    }

    layerModal = layer.open({
        type: 1,
        title: title ,
        offset: '60px',
        area: '1000px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="formModal formWorkHourSetting" id="addWorkHourSettig_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${id}">      
                <div class="workHour_wrap" >
                       <div class="workHour_left"> 
                         <div class="el-form-item prev">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">工序<span class="mustItem">*</span></label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-form-item">
                                            <input type="text"  class="el-input" readonly="readonly" value="${operation_name}">
                                            <input type="hidden" class="val_id" id="operation_id" value="${operation_id}">
                                        </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                            ${ability_name?`<div class="el-form-item prev">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">能力<span class="mustItem">*</span></label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-form-item">
                                            <input type="text"  class="el-input" readonly="readonly" value="${ability_name}">
                                            <input type="hidden" class="val_id" id="ability_id" value="${ability_id}">
                                        </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                            <div class="el-form-item" style="margin-top: 20px;">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">圆盘切割</label>
                                    <div class="el-select-dropdown-wrap">
                                    <div style="display: flex;flex-direction: row;flex-wrap: nowrap">
                                        <div style="flex:1;"><input type="radio" ${disabled} name="is_ladder" id="is_ladder1" value="1" ${is_ladder1}>
                                        <label for="multiple1">是</label></div>
                                        <div style="flex:1;"><input type="radio" ${disabled} name="is_ladder" id="is_ladder2" value="0" ${is_ladder2}>
                                        <label for="multiple2">否</label></div>
                                    </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>`:`<div class="el-form-item">
                                <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: ${labelWidth}px;">数量区间</label>
                                    <div class="el-select-dropdown-wrap" >
                                    
                                    <div style="display: flex;flex-direction: row;flex-wrap: nowrap">
                                    <div style="margin-top: 20px;flex:1;">
                                        <input type="radio" ${disabled} name="number_range" id="range1" value="1" ${range1}> 
                                        <label for="range1">工时溢出（向下取值）</label></div>
                                       <div style="margin-top: 20px;flex:1;"> <input type="radio" ${disabled} name="number_range" id="range2" value="2" ${range2}>
                                        <label for="range2">工时负溢出（向上取值）</label></div>
                                    </div>
                                    <div style="display: flex;flex-direction: row;flex-wrap: nowrap">
                                    <div style="margin-top: 20px;flex:1;"><input type="radio" ${disabled} name="number_range" id="range3" value="3" ${range3}>
                                        <label for="range3">正常情况</label></div>
                                        <div style="margin-top: 20px;flex:1;"><input type="radio" ${disabled} name="number_range" id="range4" value="4" ${range4}> 
                                        <label for="range4">不按区间维护</label></div>
                                    </div> 

                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>`}
                            
                            
                            
                            
                            <div class="el-form-item" style="margin-top: 20px;">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">倍数设置</label>
                                    <div class="el-select-dropdown-wrap">
                                    <div style="display: flex;flex-direction: row;flex-wrap: nowrap">
                                        <div style="flex:1;"><input  ${disabled} type="radio" name="multiple" id="multiple1" value="1" ${multiple1}>
                                        <label for="multiple1">倍数准备工时（按倍数）</label></div>
                                        <div style="flex:1;"><input ${disabled} type="radio" name="multiple" id="multiple2" value="2" ${multiple2}>
                                        <label for="multiple2">非倍数准备工时（固定值）</label></div>
                                    </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div> 
                            <div class="el-form-item" style="margin-top: 20px;">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">方法</label>
                                    <div class="el-select-dropdown-wrap">
                                    <div style="display: flex;flex-direction: row;flex-wrap: nowrap">
                                        <div style="flex:1;"><input type="radio" ${disabled} name="type" id="type1" value="1" ${type1}>
                                        <label for="multiple1">同步</label></div>
                                        <div style="flex:1;"><input type="radio" ${disabled} name="type" id="type2" value="2" ${type2}>
                                        <label for="multiple2">异步</label></div>
                                    </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                         
                       </div>
                       <div class="workHour_btn">
                       <span></span>
                        </div>
                       <div class="workHour_ability_right">
                           <div class="el-form-item"style="margin-top: 20px;">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">准备工时</label>
                                     <input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" id="prepare_work_hour" ${readonly} data-name="" class="el-input" placeholder="" value="${preparation_hour}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                            
                            <div class="el-form-item"style="margin-top: 20px;">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">标准工时</label>
                                     <input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" id="rated_value" ${readonly} data-name="" class="el-input" placeholder="" value="${rated_value}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                            ${ability_id?`<div class="el-form-item"style="margin-top: 20px;">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">倍数值</label>
                                     <input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" id="ability_value" ${readonly} data-name="" class="el-input" placeholder="" value="${ability_value}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>`:``}
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                                    <textarea type="textarea" ${readonly}  maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="">${remark}</textarea>
                                </div>
                                <p class="errorMessage" style="display: block;"></p>
                            </div>
                            
                       </div>
                    </div>
                    
                    ${parent_id==0?``:`<div style="border: solid 1px #d1dbe5">
                        <div class="title"><h5>下道工序</h5><span class="errorMessage"></span></div>
                           <div class="inputOperationability_table">
                            <table class="info_table">
                                <thead>
                                  <tr class="th_table_tbody">
                                        <th class="thead">工序名称</th>
                                        <th class="thead">能力</th>
                                        <th class="thead">流转工时[s]</th>
                                        <th class="thead change">操作</th>

                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    <tr>
                                        <input type="hidden" class="val_id item_id" id="item_id" value="">
                                        <td class="operation_name">
                                            <div class="el-form-item operation" style="width:160px;margin:auto;">
                                                <div class="el-form-item-div">
                                                    <div class="el-select-dropdown-wrap">
                                                        <div class="el-select">
                                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                            <input type="hidden" class="val_id next_operation" id="next_operation_id" value="">
                                                        </div>
                                                        <div class="el-select-dropdown">
                                                            <ul class="el-select-dropdown-list">
                                                                <li data-id="" class="el-select-dropdown-item kong"  data-name="--请选择--">--请选择--</li>
                                                            </ul>
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>
                                        </td>
                                        <td class="ability_name">
                                            <div class="el-form-item ability" style="width:160px;margin:auto;">
                                                <div class="el-form-item-div">
                                                    <div class="el-select-dropdown-wrap">
                                                        <div class="el-select">
                                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                            <input type="hidden" class="val_id ability" id="ability_id" value="">
                                                        </div>
                                                        <div class="el-select-dropdown">
                                                            <ul class="el-select-dropdown-list">
                                                                <li data-id="" class="el-select-dropdown-item kong"  data-name="--请选择--">--请选择--</li>
                                                            </ul>
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>                                     </td>
                                        <td>
                                            <input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="请输入工时" class="flow_value"  style="line-height:20px;width:160px;margin:auto;">
                                        </td>
                                        <td><i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                                    <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i></td>
                                    </tr>   
                                </tbody>
                            </table>
                          </div>
                    </div>`}
                    <div class="el-form-item ${btnShow}" style="margin-top: 20px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
</form>`,
        success: function(layero,index){
            layerEle=layero;
            getLayerSelectPosition($(layero));
            if(groups&&groups.length){
                getNowOperation(groups,flag)
            }else {
                getSearch_next();
            }
            $('body').off('click','.inputOperationability_table .add');
            if(flag!=='view'){

                $('body').off('click','.inputOperationability_table .add').on('click','.inputOperationability_table .add',function () {
                    AjaxClient.get({
                        url: URLS['workhour'].operationSelect+'?'+_token,
                        dataType: 'json',
                        beforeSend: function(){
                            layerLoading = LayerConfig('load');
                        },
                        success: function(rsp){
                            if(rsp&&rsp.results&&rsp.results.length) {
                                layer.close(layerLoading);


                                var lis = '';
                                rsp.results.forEach(function (item) {
                                    lis += `<li data-id="${item.id}" data-pid="" class="el-select-dropdown-item kong" data-name="" class=" el-select-dropdown-item">${item.name}</li>`;
                                });
                                var tr = `<tr>
                                        <td class="operation_name">
                                            <input type="hidden" class="val_id item_id" id="item_id" value="">
                                            <div class="el-form-item operation" style="width:160px;margin:auto;">
                                                <div class="el-form-item-div">
                                                    <div class="el-select-dropdown-wrap">
                                                        <div class="el-select">
                                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                            <input type="hidden" class="val_id next_operation" id="next_operation_id" value="">
                                                        </div>
                                                        <div class="el-select-dropdown">
                                                            <ul class="el-select-dropdown-list">
                                                                <li data-id="" class="el-select-dropdown-item kong"  data-name="--请选择--">--请选择--</li>
                                                                ${lis}
                                                            </ul>
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>
                                        </td>
                                        <td class="ability_name">
                                            <div class="el-form-item ability" style="width:160px;margin:auto;">
                                                <div class="el-form-item-div">
                                                    <div class="el-select-dropdown-wrap">
                                                        <div class="el-select">
                                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                            <input type="hidden" class="val_id ability_id" id="ability_id" value="">
                                                        </div>
                                                        <div class="el-select-dropdown">
                                                            <ul class="el-select-dropdown-list">
                                                                <li data-id="" class="el-select-dropdown-item kong"  data-name="--请选择--">--请选择--</li>
                                                            </ul>
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>                                     
                                        </td>
                                        <td><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="请输入工时" class="flow_value" style="line-height:20px;width:160px;margin:auto;"></td>
                                        <td><i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                                    <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i></td>
                                    </tr>`
                                $(this).parents().parents().eq(0).after(tr);
                            }
                        },
                        fail: function(rsp){
                        }
                    },this);

                });
                $('body').on('click','.inputOperationability_table .delete',function () {
                    if($(this).parent().parent().parent().find('tr').length>1){
                        $(this).parents().parents().eq(0).remove();
                    }
                });
            }
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
};


function getNowOperation(groups,flag) {
    AjaxClient.get({
        url: URLS['workhour'].operationSelect+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            if(rsp&&rsp.results&&rsp.results.length) {
                layer.close(layerLoading);
                showItemLIst($('.inputOperationability_table .table_tbody'),groups,rsp.results,flag);
            }
        },
        fail: function(rsp){
        }
    },this);
}

function showItemLIst(ele,data,operation,flag){
    ele.html('');
    var lis = '';
    operation.forEach(function (item) {
        lis += `<li data-id="${item.id}" data-pid="" class="el-select-dropdown-item kong" data-name="" class=" el-select-dropdown-item">${item.name}</li>`;
    });
    if(flag=='view'){
        $('.inputOperationability_table .change').hide();
        data.forEach(function (item) {

            var tr=`<tr>
                    <td class="operation_name">
                        <input type="hidden" class="val_id item_id" id="item_id" value="${item.id}">
                        <div class="el-form-item operation" style="width:160px;margin:auto;">
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <input type="text" readonly="readonly" class="el-input" value="${item.nextoperation_name}">
                                        <input type="hidden" class="val_id next_operation" id="next_operation_id" value="${item.nextoperation_id}">
                                    </div>                                
                                </div> 
                            </div>
                        </div>
                    </td>
                    <td class="ability_name">
                        <div class="el-form-item ability" style="width:160px;margin:auto;">
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <input type="text" readonly="readonly" class="el-input" value="${item.nextability_name}">
                                        <input type="hidden" class="val_id ability_id" id="ability_id" value="${item.nextability_id}">
                                    </div>                                
                                </div> 
                            </div>
                        </div>                                     
                    </td>
                    <td><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" readonly="readonly" placeholder="请输入工时" class="flow_value" style="line-height:20px;width:160px;margin:auto;" value="${item.flow_value}"></td>
                    `;
            ele.append(tr)
        })

    }else{
        data.forEach(function (item) {

            var tr=`<tr>
                    <td class="operation_name">
                        <input type="hidden" class="val_id item_id" id="item_id" value="${item.id}">
                        <div class="el-form-item operation" style="width:160px;margin:auto;">
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="${item.nextoperation_name}">
                                        <input type="hidden" class="val_id next_operation" id="next_operation_id" value="${item.nextoperation_id}">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong"  data-name="--请选择--">--请选择--</li>
                                            ${lis}
                                        </ul>
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </td>
                    <td class="ability_name">
                        <div class="el-form-item ability" style="width:160px;margin:auto;">
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="${item.nextability_name}">
                                        <input type="hidden" class="val_id ability_id" id="ability_id" value="${item.nextability_id}">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong"  data-name="--请选择--">--请选择--</li>
                                        </ul>
                                    </div>
                                </div> 
                            </div>
                        </div>                                     </td>
                    <td><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="请输入工时" class="flow_value" style="line-height:20px;width:160px;margin:auto;" value="${item.flow_value}"></td>
                    <td><i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i></td>
                </tr>`;
            ele.append(tr)
        })
    }

}

function getSearch(){
    $.when(getOperation())
        .done(function(operationrsp,abilityrsp){
            var operationlis='',abilitylis='';
            if(operationrsp&&operationrsp.results&&operationrsp.results.length){
                operationlis=selectHtml(operationrsp.results,'operation');
                $('.el-form-item.operation').find('.el-select-dropdown-wrap').html(operationlis);
            }
        }).fail(function(unitrsp,dataTypersp){
        console.log('获取失败');
    }).always(function(){
        layer.close(layerLoading);
    });
};function getSearch_next(){
    $.when(getOperation_next())
        .done(function(operationrsp,abilityrsp){
            var operationlis='',abilitylis='';
            if(operationrsp&&operationrsp.results&&operationrsp.results.length){
                operationlis=nextSelectHtml(operationrsp.results,'next_operation');
                $('.el-form-item.operation').find('.el-select-dropdown-wrap').html(operationlis);
            }
        }).fail(function(unitrsp,dataTypersp){
        console.log('获取失败');
    }).always(function(){
        layer.close(layerLoading);
    });
};

function getOperation(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['workhour'].operationSelect+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
function getOperation_next(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['workhour'].operationSelect+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
function getAbility(id,ele){
    AjaxClient.get({
        url: URLS['workhoursetting'].abilityList+'?'+_token+'&operation_id='+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            if(rsp&&rsp.results&&rsp.results.length){
                layer.close(layerLoading);
                var abilitylis=abilitySelectHtml(rsp.results,'ability_id');
                ele.parent().parent().parent().parent().parent().parent().parent().find('.el-form-item.ability').find('.el-select-dropdown-wrap').html(abilitylis);
            }
        },
        fail: function(rsp){
        }
    },this);
}
//生成下拉框数据
function selectHtml(fileData,flag){
    var innerhtml,selectVal;
    var lis='';
    fileData.forEach(function(item){
        lis+=`<li data-id="${item.id}" data-pid="" class="el-select-dropdown-item kong" data-name="" class=" el-select-dropdown-item">${item.name}</li>`;
    });
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="${flag}" value="">
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
function nextSelectHtml(fileData,flag){
    var innerhtml,selectVal;
    var lis='';
    fileData.forEach(function(item){

        lis+=`<li data-id="${item.id}" data-pid="" class="el-select-dropdown-item kong" data-name="" class=" el-select-dropdown-item">${item.name}</li>`;
    });
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id ${flag}" id="${flag}" value="">
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
function abilitySelectHtml(fileData,flag){
    var innerhtml,selectVal;
    var lis='';
    fileData.forEach(function(item){

        lis+=`<li data-id="${item.ability_id}" data-pid="" class="el-select-dropdown-item kong" data-name="" class=" el-select-dropdown-item">${item.ability_name}</li>`;
    });
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id ${flag}" id="${flag}" value="">
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
