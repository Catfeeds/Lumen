
var layerModal,
    layerLoading,
    layerEle='',
    pageNo=1,
    pageSize=50,
    prevCorrect=!1,
    nextCorrect=!1,
    timeCorrect=!1,
    proceData = [],
    validatorToolBox={
        checkTime: function(name){
            var value=$('#'+name).val().trim();

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(timeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"间隔时间不能为空"),timeCorrect=!1,!1):
                    (timeCorrect=1,!0);
        },
        checkPrev: function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(prevCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择上道工序"),prevCorrect=!1,!1):
                    (prevCorrect=1,!0);

        },
        checkNext: function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nextCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择下道工序"),nextCorrect=!1,!1):
                    (nextCorrect=1,!0);

        },
    },
    validatorConfig = {
        prevProcedure: "checkPrev",
        nextProcedure: "checkNext",
        minTime: "checkTime"
    };

$(function () {
    getProceData();
    getProcemanageData();
    bindEvent()
});

//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addProceSetModal_form').find('.submit').removeClass('is-disabled');
}

function getProcemanageData() {
    $('#proceSetting_table .table_tbody').html("");

    var urlLeft = "&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['procemanage'].procemanageList+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results && rsp.results.list && rsp.results.list.length){
                createTableHtml($('#proceSetting_table .table_tbody'),rsp.results.list)
            }else{
                noData('暂无数据',4);
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

function createTableHtml(ele,data) {

    data.forEach(function (item,index) {
        var type = '';
       switch (item.type){
           case 1:
               type = '同步';
               break;
           case 2:
               type = '异步';
               break;
           case 3:
               type = '无关系';
               break;
           default:
               type = ''
       }

        var tr = `<tr>
                    <td>${item.from_operation_name}</td>
                    <td>${tansferNull(item.to_operation_name)}</td>
                    <td>${item.interval_time} &nbsp;[min]</td>
                    <td>${type}</td>
                    <td>${item.desc}</td>
                    <td class="right">
                            <button data-id="${item.id}" class="button pop-button view">查看</button>
                            <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                            <button data-id="${item.id}" class="button pop-button delete">删除</button>
                        </td>
                </tr>`;
        ele.append(tr)
    })
}

function bindEvent() {
    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
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

    //单选按钮点击事件
    $('body').on('click','.el-radio-input',function(e){
        // $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        // $(this).addClass('is-radio-checked');
        if(!$(this).parents('.el-radio-group').hasClass('view')){
            $(this).toggleClass('is-radio-checked');

            if($(this).hasClass('is-radio-checked')){

                $(this).parents('.el-radio').siblings().find('.el-radio-input').removeClass('is-radio-checked');
            }
        }

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

    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addProceSetModal_form').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name);
    });

    //下拉框的相关事件
    $('body').on('focus','.el-select .el-input',function () {

        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-select .el-input',function () {
        var name=$(this).siblings('input').attr("id");

        var obj = $(this);

        setTimeout(function(){

            if(obj.siblings('input').val() == '') {

                validatorConfig[name]
                && validatorToolBox[validatorConfig[name]]
                && validatorToolBox[validatorConfig[name]](name);

            }else{

                $('#'+name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);

    });

    $('body').on('click','.actions #proce_setting_add',function () {

        procedureSetModal(0,'add');
    });

    $('body').on('click','#proceSetting_table .table_tbody .pop-button',function () {

        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){

            viewProceSetData(id,'view');
        }else if($(this).hasClass('edit')){

            viewProceSetData(id,'edit');

        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteProcedureData(id);
            });
        }

    })

    $('body').on('click','#addProceSetModal_form:not(".disabled") .submit',function () {

        var parentForm = $(this).parents('#addProceSetModal_form'),
            id=parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag");

        for (var types in validatorConfig){validatorToolBox[validatorConfig[types]](types,flag,id)}

        if(timeCorrect&&prevCorrect&&nextCorrect){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');

                var from_operation_id = parentForm.find('#prevProcedure').val(),
                    to_operation_id = parentForm.find('#nextProcedure').val(),
                    interval_time = parentForm.find('#minTime').val().trim(),
                    description = parentForm.find('#description').val().trim(),
                    type = 3;

                if(parentForm.find('.el-radio-input').hasClass('is-radio-checked')){

                    type = parentForm.find('.is-radio-checked .status').val();
                }

                $(this).hasClass('edit') ? editProceSetData({
                    relation_id:id,
                    desc: description,
                    interval_time:interval_time,
                    type: type,
                    _token:TOKEN
                }) :
                    addProceSetData({
                        from_operation_id : from_operation_id,
                        to_operation_id: to_operation_id,
                        desc: description,
                        interval_time:interval_time,
                        type: type,
                        _token:TOKEN
                    })
            }
        }

    })
}

function addProceSetData(data) {
    AjaxClient.post({
        url: URLS['procemanage'].procemanageAdd,
        dataType: 'json',
        data: data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getProcemanageData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addProceSetModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }

        }
    },this)
}


function viewProceSetData(id,flag) {
    AjaxClient.get({
        url:URLS['procemanage'].procemanageShow+'?'+_token+'&relation_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {

            layer.close(layerLoading);
            procedureSetModal(id,flag,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

            if(rsp.code==404){
                getProcemanageData();
            }
        }
    },this);
}

function editProceSetData(data) {

    AjaxClient.post({
        url:URLS['procemanage'].procemanageUpdate,
        data:data,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function () {
            layer.close(layerLoading);
            layer.close(layerModal);
            getProcemanageData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addProceSetModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this)
}

function deleteProcedureData(id) {
    var data = {
        relation_id: id,
        _token: TOKEN
    };

    AjaxClient.post({
        url: URLS['procemanage'].procemanageDelete,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getProcemanageData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

            if(rsp&&rsp.code==404){
                getProcemanageData();
            }
        }

    },this)
}

function procedureSetModal(ids,flag,data) {

    var {id='',from_operation_name='',from_operation_id = '',to_operation_name='',to_operation_id = '',interval_time='',desc='',type=''} = {};
    if(data){
        ({id='',from_operation_name='',from_operation_id = '',to_operation_name='',to_operation_id = '',interval_time='',desc='',type=''}=data);
    }

    var labelWidth=140,readonly='',title="查看工序维护",btnShow='btnShow',placeholder="请输入描述，最多能输入500个字符",proceItem = '',
        fromOperation =`<input type="text" value="" readonly data-name="" class="el-input">`,toOperation='';

    flag=='view' ? (readonly='readonly="readonly"',btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加工序维护' : (title = '编辑工序维护',noEdit='readonly="readonly"'));

    var _radio = `<div class="el-radio-group ${flag}"><label class="el-radio">
                    <span class="el-radio-input is-radio-checked">
                        <span class="el-radio-inner"></span>
                        <input class="status" type="hidden" value="1">
                    </span>
                    <span class="el-radio-label">同步</span>
                </label>
                <label class="el-radio">
                    <span class="el-radio-input">
                        <span class="el-radio-inner"></span>
                        <input class="status" type="hidden" value="2">
                    </span>
                    <span class="el-radio-label">异步</span>
                </label></div>`;

    if(flag != 'add'){

        switch (type){

            case 1:
                _radio = `<div class="el-radio-group ${flag}"><label class="el-radio">
                        <span class="el-radio-input is-radio-checked">
                            <span class="el-radio-inner"></span>
                            <input class="status" type="hidden" value="1">
                        </span>
                        <span class="el-radio-label">同步</span>
                    </label>
                    <label class="el-radio">
                        <span class="el-radio-input">
                            <span class="el-radio-inner"></span>
                            <input class="status" type="hidden" value="2">
                        </span>
                        <span class="el-radio-label">异步</span>
                    </label></div>`;
                break;
            case 2:
                type = '异步';
                _radio = `<div class="el-radio-group ${flag}"><label class="el-radio">
                        <span class="el-radio-input">
                            <span class="el-radio-inner"></span>
                            <input class="status" type="hidden" value="1">
                        </span>
                        <span class="el-radio-label">同步</span>
                    </label>
                    <label class="el-radio">
                        <span class="el-radio-input is-radio-checked">
                            <span class="el-radio-inner"></span>
                            <input class="status" type="hidden" value="2">
                        </span>
                        <span class="el-radio-label">异步</span>
                    </label></div>`;
                break;
            case 3:
                _radio = `<div class="el-radio-group ${flag}"><label class="el-radio">
                        <span class="el-radio-input">
                            <span class="el-radio-inner"></span>
                            <input class="status" type="hidden" value="1">
                        </span>
                        <span class="el-radio-label">同步</span>
                    </label>
                    <label class="el-radio">
                        <span class="el-radio-input">
                            <span class="el-radio-inner"></span>
                            <input class="status" type="hidden" value="2">
                        </span>
                        <span class="el-radio-label">异步</span>
                    </label></div>`;
                break;
            default:
                _radio = ''
        }


    }

    if(proceData && proceData.length){
        proceData.forEach(function (item,index) {
            if(flag == 'add'){
                proceItem += `<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`
            }

            if(item.id == from_operation_id){
                fromOperation=`<input type="text" value="${item.name}" readonly data-name="名称" class="el-input">`;
            }
            if(item.id == to_operation_id){
                toOperation = `<input type="text" value="${item.name}" readonly data-name="名称" class="el-input">`
            }
        });
    }

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '600px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addProcedureModal formModal formMateriel" id="addProceSetModal_form" data-flag="${flag}">
                     <input type="hidden" id="itemId" value="${ids}">
                     <div class="el-form-item prev">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">上道工序<span class="mustItem">*</span></label>
                            ${flag != 'add'? fromOperation : `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="prevProcedure" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                        ${proceItem}
                                    </ul>
                                </div>
                            </div>`}
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                     </div>
                     <div class="el-form-item next">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">下道工序<span class="mustItem">*</span></label>
                            ${flag != 'add' ? toOperation : `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="nextProcedure" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                         ${proceItem}
                                    </ul>
                                </div>
                            </div> `}
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                     </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">间隔时间[min]<span class="mustItem">*</span></label>
                            <input type="number" id="minTime" ${readonly} data-name="最小间隔时间" class="el-input" placeholder="请输入时间" value="${interval_time}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                     </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 115px;">方式</label>
                            ${_radio}
                        </div>
                        <p class="errorMessage"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${desc}</textarea>
                        </div>
                        <p class="errorMessage"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
                </form>`,
        success: function(layero,index){
            layerEle=layero;
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}