
var  pageNo=1,
    pageSize=10,
    currentPageNo=1,
    ajaxData={},
    indexAjaxData={},
    currentPageSize=20,
    layerModal,
    layerLoading,
    selectMaterial={},
    loadedObj={},
    material_list=[];

$(function () {
    getWorkHourData();
    bindEvent();
    getSearch();
    indexrRsetParam();
});

function getSearch(){
    $.when(getOperation(),getAbility())
        .done(function(operationrsp,abilityrsp){
            var operationlis='',abilitylis='';
            if(operationrsp&&operationrsp.results&&operationrsp.results.length){
                operationlis=selectHtml(operationrsp.results,'operation');
                $('.el-form-item.operation').find('.el-select-dropdown-wrap').html(operationlis);
            }
            if(abilityrsp&&abilityrsp.results&&abilityrsp.results.length){
                abilitylis=selectHtml(abilityrsp.results,'ability');
                $('.el-form-item.ability').find('.el-select-dropdown-wrap').html(abilitylis);
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
function getAbility(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['ability'].list+'?'+_token,
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
//重置搜索参数
function resetParam(){
    ajaxData={
        item_no: '',
        operation: '',
        isset: ''
    };
}
//重置搜索参数
function indexrRsetParam(){
    indexAjaxData={
        material_name: '',
        material_item_no: '',
        operation_id: '',
        ability_id: ''
    };
}

function bindEvent() {
    $('body').on('click','.formMateriel:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    //弹窗关闭
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('body').on('click','#workhour_table .table_tbody .pop-button',function () {

        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){

            viewWorkHourData(id,'view');
        }else if($(this).hasClass('edit')){
            viewWorkHourData(id,'edit');
        }else{
            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteWorkHourData(id);
            });
        }
    })
    $('body').on('click','.submit.workHour-edit',function () {
        var workhours_id = $('#itemId').val().trim(),
            operation_id = $('#operation_id').val(),
            ability_id = $('#ability_id').val(),
            material_no = $('#material_no').val(),
            max_value = $('#max_value').val(),
            min_value = $('#min_value').val(),
            work_hours = $('#workhours').val(),
            sample_hours = $('#samplehours').val();
        if(max_value && min_value){
            var data = {
                operation_id:operation_id,
                ability_id:ability_id,
                material_no:material_no,
                workhours_id:workhours_id,
                max_value:max_value,
                min_value:min_value,
                work_hours:work_hours,
                sample_hours:sample_hours,
                _token:TOKEN
            };
        }else {
            var data = {
                operation_id:operation_id,
                ability_id:ability_id,
                material_no:material_no,
                workhours_id:workhours_id,
                max_value:'',
                min_value:'',
                work_hours:work_hours,
                sample_hours:sample_hours,
                _token:TOKEN
            };
        }

          editWorkHour(data)
    })
    $('body').on('click','.actions #work_hours_add',function (e) {
        resetParam();
        addWorkHoursModal(0,'add');
    })
    $('body').on('click','.el-radio-input:not(.noedit)',function (e) {
        e.preventDefault();
        if($(this).parents('.procedure_select').hasClass('material')){//选择物料
            $(this).addClass('is-radio-checked').parents('.tritem').siblings('.tritem').find('.el-radio-input:not(.noedit)').removeClass('is-radio-checked');

            if($(this).hasClass('is-radio-checked')){
                selectMaterial = $(this).parents('.tritem').data('tritem');
                getHourList(selectMaterial.material_item_no)
            }
        }
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
                item_no: parentForm.find('#material_code').val().trim(),
                operation: parentForm.find('#operation').val().trim(),
                isset: parentForm.find('#is_set').val().trim()
            };
            $('.inputOperationValue_table .table_tbody').html('');
            selectMaterial={};
            material_list=[];
            getMaterailList();
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
        parentForm.find('#material_code').val('');
        parentForm.find('#operation').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#is_set').val('').siblings('.el-input').val('--请选择--');

        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        $('.inputOperationValue_table .table_tbody').html('');
        selectMaterial={};
        material_list=[];
        pageNo=1;
        resetParam();
        showMaterial();
    });
    //搜索
    $('body').on('click','#indexSearchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#indexSearchForm .el-item-hide').slideUp(400,function(){
            $('#indexSearchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            // $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#indexSearchForm');
            $('.el-sort').removeClass('ascending descending');
            currentPageNo=1;
            indexAjaxData={
                material_name: parentForm.find('#material_name').val().trim(),
                material_item_no: parentForm.find('#material_code').val().trim(),
                operation_id: parentForm.find('#operation').val().trim(),
                ability_id: parentForm.find('#ability').val().trim()
            };

            getWorkHourData();
        }
    });
    //重置搜索框值
    $('body').on('click','#indexSearchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        // $(this).addClass('is-disabled');
        $('#indexSearchForm .el-item-hide').slideUp(400,function(){
            $('#indexSearchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#indexSearchForm');
        parentForm.find('#material_code').val('');
        parentForm.find('#material_name').val('');
        parentForm.find('#operation').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#ability').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        currentPageNo=1;
        indexrRsetParam();
        getWorkHourData();
    });
    $('body').on('click','.procedure_ability.submit:not(.is-disabled)',function () {
        var arr=[],_len = $('.inputOperationValue_table .table_tbody tr'),obj={};
        if(_len.length){
            $(_len).each(function (k,v) {
                if($(v).find('.min-count').length){
                    if($(v).find('.hours-count').val() != ''&&$(v).find('.min-count').val() != ''&&$(v).find('.max-count').val() != ''){
                        obj={
                            operation_id:$(v).attr('data-opId'),
                            ability_id:$(v).attr('data-abId'),
                            workhours_id:$(v).attr('data-whId')&&$(v).attr('data-whId')!=undefined?$(v).attr('data-whId'):"",
                            work_hours:$(v).find('.hours-count').val().trim(),
                            sample_hours:$(v).find('.sample-count').val().trim(),
                            min_value:$(v).find('.min-count').val().trim(),
                            max_value:$(v).find('.max-count').val().trim(),
                        };
                        arr.push(obj)
                    }
                }else {
                    if($(v).find('.hours-count').val() != ''){
                        obj={
                            operation_id:$(v).attr('data-opId'),
                            ability_id:$(v).attr('data-abId'),
                            workhours_id:$(v).attr('data-whId')&&$(v).attr('data-whId')!=undefined?$(v).attr('data-whId'):"",
                            work_hours:$(v).find('.hours-count').val().trim(),
                            sample_hours:$(v).find('.sample-count').val().trim(),
                        };
                        arr.push(obj)
                    }
                }


            });
        }
        saveHours({
            material_no: selectMaterial.material_item_no,
            data:JSON.stringify(arr),
            _token:TOKEN
        });
    })

    $('body').on('click','.inputOperationValue_table .add',function () {
        var operation_id = $(this).parents().parents().eq(0).attr('data-opId'),
         ability_id = $(this).parents().parents().eq(0).attr('data-abId'),
         // workhours_id = $(this).parents().parents().eq(0).attr('data-whId'),
         operation_name = $(this).parent().parent().find('.operation_name').text(),
         ability_name = $(this).parent().parent().find('.ability_name').text(),
         tr = `<tr data-opId="${operation_id}" data-abId="${ability_id}">
                    <td class="operation_name">${operation_name}</td>
                    <td class="ability_name">${ability_name}</td>
                    <td><input type="number" placeholder="请输入最大值" class="min-count" value="" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                    <td><input type="number" placeholder="请输入最小值" class="max-count" value="" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                    <td><input type="number" placeholder="请输入工时" class="hours-count" value="" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                    <td><input type="number" placeholder="请输入工时" class="sample-count" value="" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                    <td><i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i></td>
                </tr>`
        $(this).parents().parents().eq(0).after(tr);
    });
    $('body').on('click','.inputOperationValue_table .delete',function () {
        $(this).parents().parents().eq(0).remove();
    });
    //更多搜索条件下拉
    $('#indexSearchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#indexSearchForm .el-item-show').css('background','#e2eff7');
            $('#indexSearchForm .el-item-hide').slideDown(400,function(){
                that.removeClass('noclick');
            });
        }else{
            $('#indexSearchForm .el-item-hide').slideUp(400,function(){
                $('#indexSearchForm .el-item-show').css('background','transparent');
                that.removeClass('noclick');
            });
        }
    });

}
function editWorkHour(data) {
    AjaxClient.post({
        url: URLS['workhour'].workhourUpdate,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getWorkHourData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}

function getWorkHourData() {

    $('#workhour_table .table_tbody').html("");

    var urlLeft='';
    for(var param in indexAjaxData){
        urlLeft+=`&${param}=${indexAjaxData[param]}`;
    }
    urlLeft += "&page_no="+currentPageNo+"&page_size="+currentPageSize;
    AjaxClient.get({
        url: URLS['workhour'].workhourList+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            var total = rsp.results.total_records;

            if(rsp.results && rsp.results.list && rsp.results.list.length){
                createTableHtml($('#workhour_table .table_tbody'),rsp.results.list)
            }else{
                noData('暂无数据',10);
            }

            if(total>currentPageSize){
                bindCurrentPagenationClick(total,currentPageSize);
            }else{
                $('#list_pagenation').html('')
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

function createTableHtml(ele,data) {
    data.forEach(function (item,index) {
        var tr = ` <tr>
                    <td>${item.material_no}</td>
                    <td>${item.material_name}</td>
                    <td>${item.operation_name}</td>
                    <td>${tansferNull(item.ability_name)}</td>
                    <td>${item.min_value==0?"":item.min_value}</td>
                    <td>${item.max_value==0?"":item.max_value}</td>
                    <td>${item.sample_hours?item.sample_hours+"[s]":""}</td>
                    <td>${item.work_hours}[s]</td>
                    <td class="right">
                        <button data-id="${item.id}" class="button pop-button view">查看</button>
                        <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                        <button data-id="${item.id}" class="button pop-button delete">删除</button>
                    </td>
                </tr>`;
        ele.append(tr)
    })
}
function deleteWorkHourData(id) {
    var data = {
        workhours_id: id,
        _token: TOKEN
    };
    AjaxClient.post({
        url: URLS['workhour'].workhourDelete,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getWorkHourData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getWorkHourData();
            }
        }

    },this)
}

function viewWorkHourData(id,flag) {
    AjaxClient.get({
        url:URLS['workhour'].workhourShow+'?'+_token+'&workhours_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(flag =='edit'){
                addWorkHoursModal(id,flag,rsp.results)
            }else{
                workHourShowModal(id,flag,rsp.results)
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('.uniquetable tr.active').removeClass('active');

            if(rsp.code==404){
                getWorkHourData();
            }
        }
    },this);
}

function workHourShowModal(ids,flag,data) {

    var labelWidth = 100,readonly="readonly='readonly'",title='查看工时',btnShow='btnHide';
    if(data){
        ({ability_id='',operation_id='',material_no='',material_name='',operation_name='',work_hours='',ability_name='',max_value='',min_value='',sample_hours=''}=data)
    }

    flag == 'edit'? (title='编辑工时',btnShow='btnShow') :'';
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="formModal formMateriel work-hour-view">
                    <input type="hidden" id="itemId" value="${ids}">
                    <input type="hidden" id="operation_id" value="${operation_id}">
                    <input type="hidden" id="ability_id" value="${ability_id}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">物料编码</label>
                            <input type="text" id="material_no" ${readonly} data-name="物料编码" class="el-input" placeholder="" value="${material_no}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">物料名称</label>
                            <input type="text" id="name" ${readonly} data-name="物料名称" class="el-input" placeholder="" value="${material_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工序</label>
                            <input type="text" id="procedure" ${readonly} data-name="工序" class="el-input" placeholder="" value="${operation_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">能力</label>
                            <input type="text" id="ability_name" ${readonly} data-name="能力" class="el-input" placeholder="" value="${ability_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    ${min_value!=0?`<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">最小值</label>
                            <input type="number" id="min_value" ${flag=='edit'? '' :readonly} data-name="工时" class="el-input" placeholder="" value="${min_value}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>`:``}
                    
                    ${max_value!=0?`<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">最大值</label>
                            <input type="number" id="max_value" ${flag=='edit'? '' :readonly} data-name="工时" class="el-input" placeholder="" value="${max_value}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>`:``}
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工时</label>
                            <input type="number" id="workhours" ${flag=='edit'? '' :readonly} data-name="工时" class="el-input" placeholder="" value="${work_hours}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">首样工时</label>
                            <input type="number" id="samplehours" ${flag=='edit'? '' :readonly} data-name="首样工时" class="el-input" placeholder="" value="${sample_hours}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit workHour-edit">确定</button>
                        </div>
                    </div>
                  </form>`,
        end:function () {
            $('.uniquetable tr.active').removeClass('active');
        }
    })

}
function bindCurrentPagenationClick(total,size) {
    $('#list_pagenation').show();
    $('#list_pagenation').pagination({
        totalData:total,
        showData:size,
        current: currentPageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            currentPageNo=api.getCurrent();
            getWorkHourData();
        }
    });
}
function bindPagenationClick(total,size){
    $('#pagenation').show();
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
            showMaterial();
        }
    });
}
function getMaterailList() {
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&sort=id&order=desc&page_no="+pageNo+"&page_size="+pageSize;

    $('.selectOperationAbility_table .info_table .table_tbody').html('');

    AjaxClient.get({
        url: URLS['workhour'].materialList+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            material_list = rsp.results;
            showMaterial();
            if(loadedObj.mLoaded){
                setTimeout(function () {
                    var _len = $('.selectOperationAbility_table.table_page .table_tbody');
                    if(_len.find('tr').length) {
                        _len.find('tr.tritem[data-id='+loadedObj.mLoaded+'] .el-radio-input').click();
                    }
                },100)
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);

            var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
            $('.selectOperationAbility_table .table_tbody').html(tr);
        },
        complete: function(){

        }
    },this);
}
function showMaterial() {
    var totalData=material_list.length;
    if(material_list&&material_list.length){
        createMaterialTable($('.selectOperationAbility_table .info_table .table_tbody'),material_list.slice((pageNo-1)*pageSize,pageNo*pageSize),selectMaterial);
    }else{
        var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('.selectOperationAbility_table .table_tbody').html(tr);
    }
    if(totalData>pageSize){
        bindPagenationClick(totalData,pageSize);
    }else{
        $('#pagenation').html('');
    }
}
function createMaterialTable(ele,data,sma){
    ele.html('');
    var viewurl=$('#bom_view').val();
        data.forEach(function (item) {
            sma = sma.material_id ? sma : {};
            // var _checkbox=`<span class="el-checkbox_input material-check ${sma.material_id == item.material_id ? 'is-checked':''}" data-no="${item.item_no}" data-name="${item.name}">
            //         <span class="el-checkbox-outset"></span>
            //     </span>`;
            var _checkbox=`<span class="el-radio-input material-check ${sma.material_id == item.material_id ? 'is-radio-checked':''}" data-no="${item.item_no}" data-name="${item.name}">
                                <span class="el-radio-inner"></span>
                           </span>`;
            var tr=`<tr class="tritem" data-id="${item.material_id}">
                <td class="tdleft">${_checkbox}</td>
                <td><a href="${item.bom_id === '' ? 'javascript:;': `${viewurl}?id=${item.bom_id}&flag=hour`}" target="_blank">${item.material_item_no}</a></td>
                <td>${item.material_name}</td>
                <td>${item.materialcategory_name==null?'':item.materialcategory_name}</td>             
            </tr>`;
            ele.append(tr);
            ele.find("tr:last-child").data('tritem',item)
        })
}

function getHourList(id) {
    $('.inputOperationValue_table .table_tbody').html('');
    AjaxClient.get({
        url:URLS['workhour'].workMaterialNo+'?'+_token+'&material_no='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){

                showHourList($('.inputOperationValue_table .table_tbody'),rsp.results);
                if(loadedObj.hLoaded){
                    setTimeout(function () {
                        var _abLen = $('.procedure_ability_value .table_tbody');
                        if(_abLen.find('tr').length){
                            _abLen.find('tr[data-abId='+loadedObj.hLoaded+']').addClass('ability_selected');
                        }
                    },100)
                }
            }else{
                var tr=`<tr>
                            <td class="nowrap" colspan="7" style="text-align: center;">暂无数据</td>
                        </tr>`;
                $('.inputOperationValue_table .table_tbody').html(tr)
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            // layer.close(layerModal);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
function showHourList(ele,data) {
    $('.inputOperationValue_table .th_table_tbody').find('.change').hide();
    var operation_id = $('#searchForm').find('#operation').val();
    var data_arr = [];
    if(operation_id==''){
        data_arr=data;
    }else {
        data.forEach(function (item) {
            if(item.operation_id == operation_id){
                data_arr.push(item);
            }
        });
    }
    data_arr.forEach(function (item) {
        if(item.hasOwnProperty("max_value")){
            $('.inputOperationValue_table .th_table_tbody').find('.change').show();
            var tr=`<tr data-opId="${item.operation_id}" data-abId="${item.ability_id}" data-whId="${item.workhours_id!=undefined?item.workhours_id:''}">
                <td class="operation_name">${item.operation_name}</td>
                <td class="ability_name">${item.ability_name}</td>
                <td><input type="number" placeholder="请输入最大值" class="min-count" value="${item.min_value}" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                <td><input type="number" placeholder="请输入最小值" class="max-count" value="${item.max_value}" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                <td><input type="number" placeholder="请输入工时" class="hours-count" value="${item.work_hours}" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                <td><input type="number" placeholder="请输入工时" class="sample-count" value="${item.sample_hours}" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                <td><i class="fa fa-plus-square oper_icon add" title="添加" data-id="${item.id}"></i>
            <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="${item.id}" style="margin-right: 10px;color: #20a0ff"></i></td>
            </tr>`;
            ele.append(tr)
        }else {
            var tr=`<tr data-opId="${item.operation_id}" data-abId="${item.ability_id}" data-whId="${item.workhours_id!=undefined?item.workhours_id:''}">
                <td class="operation_name">${item.operation_name}</td>
                <td class="ability_name">${item.ability_name}</td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="请输入工时" class="hours-count" value="${item.work_hours}" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                <td><input type="number" placeholder="请输入工时" class="sample-count" value="${item.sample_hours}" style="line-height:20px;width: 80px;font-size: 10px;"></td>
                <td></td>
            </tr>`;
            ele.append(tr)
        }

    });
}
function addWorkHoursModal(ids,flag,data) {
    var labelWidth=120,btnShow='btnShow',title="添加工时";

    var {operation_id='',material_no='',material_id='',ability_id='',min_value='',max_value='',work_hours='',sample_hours=''}={};
    if(data){
        ({operation_id='',material_no='',material_id='',ability_id='',min_value='',max_value='',work_hours='',sample_hours=''}=data)
    }

    flag=='edit' ? title = '编辑工时' : title = '添加工时';

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '50px',
        area: '1200px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="relationWorkClass formModal" id="relationWorkClass_from">
                    <div class="el-form-item procedure_wrap" >
                       <div class="procedure_select material">
                         <div class="title"><h5>选择物料</h5></div>
                         <div class="searchItem" id="searchForm">
                            <div class="searchMAttr searchModal formModal" id="searchMAttr_from">
                                <div class="el-item">
                                    <div class="el-item-show" style="width: 400px;">
                                        <div class="el-item-align">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label" style="width: 80px;">物料编号</label>
                                                    <input type="text" id="material_code" class="el-input" placeholder="物料编号" value="">
                                                </div>
                                            </div>
                                            <div class="el-form-item operation">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label" style="width: 80px;">工序</label>
                                                    <div class="el-select-dropdown-wrap">
                                                        <div class="el-select">
                                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                            <input type="hidden" class="val_id" id="operation" value="">
                                                        </div>
                                                        <div class="el-select-dropdown">
                                                            <ul class="el-select-dropdown-list">
                                                                <li data-id="" data-pid="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        <ul class="el-item-hide">
                                            <li>
                                                <div class="el-form-item isSet">
                                                    <div class="el-form-item-div">
                                                        <label class="el-form-item-label" style="width: 80px;">是否维护</label>
                                                        <div class="el-select-dropdown-wrap">
                                                            <div class="el-select">
                                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                                <input type="hidden" class="val_id" id="is_set" value="">
                                                            </div>
                                                            <div class="el-select-dropdown">
                                                                <ul class="el-select-dropdown-list">
                                                                    <li data-id="0"  class=" el-select-dropdown-item">--请选择--</li>
                                                                    <li data-id="1"  class=" el-select-dropdown-item">否</li>
                                                                    <li data-id="2"  class=" el-select-dropdown-item">是</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                       
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                                            <button type="button" class="el-button reset">重置</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div class="selectOperationAbility_table table_page">
                            <div id="pagenation" class="pagenation"></div>
                            <table class="info_table">
                                <thead>
                                  <tr>
                                    <th class="thead">选择</th>
                                    <th class="thead">物料编码</th>
                                    <th class="thead">物料名称</th>
                                    <th class="thead">物料分类</th>
                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                   
                                </tbody>
                            </table>
                         </div>
                       </div>
                       <div class="procedure_btn">
                           <span>&gt;</span>
                        </div>
                       <div class="procedure_ability_value">
                           <div class="title"><h5>关联工序</h5><span class="errorMessage"></span></div>
                           <div class="inputOperationValue_table">
                            <table class="info_table">
                                <thead>
                                  <tr class="th_table_tbody">
                                        <th class="thead">工序名称</th>
                                        <th class="thead">能力</th>
                                        <th class="thead">最小值</th>
                                        <th class="thead">最大值</th>
                                        <th class="thead">工时[s]</th>
                                        <th class="thead">首样工时[s]</th>
                                        <th class="thead">操作</th>

                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                  
                                </tbody>
                            </table>
                          </div>
                       </div>
                    </div>
                    
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit procedure_ability">确定</button>
                        </div>
                    </div>                    
                </form>`,
        success:function (layero,index) {
            // getMaterailList();
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
            getProcedureSourceData(operation_id);
            loadedObj.mLoaded=material_id;
            loadedObj.hLoaded=ability_id;
        },
        end:function () {
            selectMaterial={};
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

//获取全部工序数据
function getProcedureSourceData(val) {
    AjaxClient.get({
        url: URLS['workhour'].procedureAll+'?'+_token,
        dataType: 'json',
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.list&&rsp.results.list.length){
                var procedureitem = '' ,innerHtml = '';
                rsp.results.list.forEach(function (item,index) {

                    procedureitem+=`<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${procedureitem}`;
                $('.el-form-item.operation').find('.el-select-dropdown-list').html(innerHtml);

                if(val){//工序编辑
                    $('.el-form-item.operation').find('.el-select-dropdown-item[data-id='+val+']').click();
                    $('.procedure_select.material #searchForm').find('.submit').click();
                }

            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this)

}
function saveHours(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['workhour'].workhourAdd,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getWorkHourData();
            selectMaterial={};
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}