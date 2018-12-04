var layerModal,
    layerLoading,
    layerEle='',
    nameCorrect=!1,
    codeCorrect=!1,
    phoneCorrect=!1,
    faxCorrect=!1,
    emailCorrect=!1,
    deptSelect = [],
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                    (nameCorrect=1,!0);
        },
        checkPhone: function (name) {
            var value=$('#'+name).val().trim();

            if(value == ""){

                return phoneCorrect=1 ;
            }else{
                return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(phoneCorrect=!1,!1):
                    !Validate.checkMobile(value)?(showInvalidMessage(name,"手机号不正确"),phoneCorrect=!1,!1):(phoneCorrect=1,!0);
            }

        },
        checkFax: function (name) {
            var value=$('#'+name).val().trim();

            if(value == ""){

                return faxCorrect=1 ;
            }else{
                return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(faxCorrect=!1,!1):
                    !Validate.checkFax(value)?(showInvalidMessage(name,"传真格式不正确"),faxCorrect=!1,!1):(faxCorrect=1,!0);
            }
        },
        checkEmail: function (name) {
            var value=$('#'+name).val().trim();

            if(value == ""){

                return emailCorrect=1 ;
            }else{
                return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(emailCorrect=!1,!1):
                    !Validate.checkEmail(value)?(showInvalidMessage(name,"邮箱格式不正确"),emailCorrect=!1,!1):(emailCorrect=1,!0);
            }
        }
    },
    remoteValidatorToolbox={
        remoteCheckName: function(name,flag,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){

                if(rsp.results&&rsp.results.exist){
                    nameCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    nameCorrect=1;
                }
            });
        }
    },
    validatorConfig = {
        name:'checkName',
        phone: 'checkPhone',
        fax: 'checkFax',
        email: 'checkEmail'
    },
    remoteValidatorConfig = {
        name: 'remoteCheckName'
    };

$(function () {

    getDeptData();
    
    getDeptSelect();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addDeptModal_form').find('.submit').removeClass('is-disabled');
}

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['dept'].deptUnique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results && rsp.results.exist){
                editUnique = true;
            }
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');

        }
    },this);
}

function getDeptData() {
    $('#table_dept_table .table_tbody').html("");

    AjaxClient.get({
        url: URLS['dept'].deptList+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results && rsp.results.length){

                $('#table_dept_table .table_tbody').html(createTableHtml(rsp.results))
            }else{
                noData('暂无数据',4);
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取部门列表失败，请刷新重试',10);

        }
    },this)
}

function getDeptSelect() {
    AjaxClient.get({
        url: URLS['dept'].deptSelect+'?'+_token,
        async: false,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            deptSelect = rsp.results;
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取上级部门失败，请刷新重试',4);

        }
    },this)
}

function createTableHtml(data) {
    var _html = '';

    data.forEach(function (item,index) {
        _html+=`<tr>
                    <td>${item.name}</td>
                    <td>${item.abbreviation}</td>
                    <td>${tansferNull(item.father_name)}</td>
                    <td class="right">
                        <button data-id="${item.department_id}" class="button pop-button view">查看</button>
                        <button data-id="${item.department_id}" class="button pop-button edit">编辑</button>
                        <button data-id="${item.department_id}" class="button pop-button delete">删除</button>
                    </td>
                </tr>`
    });
    
    return _html;
}

function bindEvent() {

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

    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('#department_add').on('click',function () {
        nameCorrect=!1;
        codeCorrect=!1;
        deptAddModal(0,'add');
    });

    $('body').on('click','#table_dept_table .table_tbody .pop-button',function () {

        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){

            viewDeptData(id,'view');
        }else if($(this).hasClass('edit')){
            nameCorrect=!1;
            codeCorrect=!1;
            viewDeptData(id,'edit');

        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteDeptData(id);
            });
        }

    })

    $('body').on('click','#department_tree',function () {

        if(!$('.job_table').hasClass('none')){
            $(this).text('显示列表');
            $('.job_table').addClass('none').siblings('.job_orgchart').removeClass('none');
            showDeptChartData();
         }else {
            $(this).text('显示结构');
            $('.job_orgchart').addClass('none').siblings('.job_table').removeClass('none')
        }

    });

    $('body').on('click','.addDeptModal:not(".disabled") .submit',function (e) {

        e.stopPropagation();

        var parentForm = $(this).parents('#addDeptModal_form'),
            id=parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag");

        for (var type in validatorConfig){validatorToolBox[validatorConfig[type]](type,flag,id)}

        if(nameCorrect&&phoneCorrect&&faxCorrect&&emailCorrect){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');

                var name = parentForm.find('#name').val().trim(),
                    abbr = parentForm.find('#abbr').val().trim(),
                    description = parentForm.find('#description').val().trim(),
                    parent_id = parentForm.find('#superModalDept').val(),
                    fax = parentForm.find('#fax').val().trim(),
                    phone = parentForm.find('#phone').val().trim(),
                    email = parentForm.find('#email').val().trim();

                parent_id == '' ? parent_id = 0 : parent_id;

                $(this).hasClass('edit') ? editDeptData({
                    name:name,
                    abbreviation:abbr,
                    description:description,
                    department_id:id,
                    fax:fax,
                    phone:phone,
                    email:email,
                    _token:TOKEN
                }) :
                    addDeptData({
                        name:name,
                        abbreviation:abbr,
                        description:description,
                        parent_id:parent_id,
                        fax:fax,
                        phone:phone,
                        email:email,
                        _token:TOKEN
                    })
            }
        }
    });

    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addDeptModal_form').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });

}

function addDeptData(data) {

    AjaxClient.post({
        url: URLS['dept'].deptAdd,
        dataType: 'json',
        data: data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getDeptData();
            showDeptChartData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addDeptModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }

        }
    },this)
}

function editDeptData(data) {

    AjaxClient.post({
        url:URLS['dept'].deptUpdate,
        data:data,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function () {
            layer.close(layerLoading);
            layer.close(layerModal);
            getDeptData();
            getDeptSelect();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addDeptModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this)
}

function viewDeptData(id,flag) {
    AjaxClient.get({
        url:URLS['dept'].deptShow+'?'+_token+'&department_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {

            layer.close(layerLoading);
            deptAddModal(id,flag,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp.code==404){
                getDeptData();
            }
        }
    },this);
}

function deleteDeptData(id) {
    AjaxClient.get({
        url: URLS['dept'].deptDelete+'?'+_token+"&department_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getDeptData();
            getDeptSelect();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getDeptData();
                getDeptSelect();
            }
        }

    },this)
}

function deptAddModal(ids,flag,data) {

    var {department_id='',abbreviation='',name='',parent_id='',description='',fax='',phone='',email=''} = {};

    if(data){
        ({department_id='',abbreviation='',name='',parent_id='',description='',fax='',phone='',email=''}=data);
    }

    var title = '查看部门',labelWidth=100,readonly = '',btnShow='btnShow',placeholder="请输入描述，最多能输入500个字符",noEdit = '';

    flag=='view' ? (readonly='readonly="readonly"',btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加部门' : (title = '编辑部门',noEdit='readonly="readonly"'));

    var deptSelectList = '',inputValue =`<input type="text" value="" readonly data-name="" class="el-input">`;

    if(deptSelect.length){

        deptSelect.forEach(function (item,index) {
            if(flag == 'add'){
                deptSelectList += `<li data-id="${item.department_id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`
            }
            else{

                if(item.department_id == parent_id){

                    inputValue=`<input type="text" value="${item.name}" readonly data-name="名称" class="el-input" placeholder="请输入名称">`
                }
            }
        })
    }

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '50px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: true,
        move: false,
        content: `<form class="addDeptModal formModal formMateriel" id="addDeptModal_form" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">缩写</label>
                            <input type="text" id="abbr" value="${abbreviation}" ${readonly} data-name="缩写" class="el-input" placeholder="请输入缩写">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div> 
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">上级部门</label>
                              ${flag == 'add' ? `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                   
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="superModalDept" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                        ${deptSelectList}
                                    </ul>
                                </div>
                            </div>` : inputValue}
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div> 
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">电话</label>
                            <input type="text" id="phone" value="${phone}" ${readonly} data-name="电话" class="el-input" placeholder="请输入电话">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">传真</label>
                            <input type="text" id="fax" value="${fax}" ${readonly} data-name="传真" class="el-input" placeholder="请输入传真">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱</label>
                            <input type="text" id="email" value="${email}" ${readonly} data-name="邮箱" class="el-input" placeholder="请输入邮箱">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${description}</textarea>
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

function showDeptChartData() {
    AjaxClient.get({
        url: URLS['dept'].deptTreeList+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results &&rsp.results.length){
                rsp.results.forEach(function (item,index) {
                    showDeptChart(item)
                })
            }else{
                $('#orgchart-container').html('暂无数据展示');
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)

}

//orgchart树形图
function showDeptChart(item) {
    $('#orgchart-container').html('');

    var nodeTemplate = function (item) {

        return `<div class="title">
                   ${item.name}
                </div>
                <div class="content">
                    <p class="name" title="${item.name}">${item.name}</p>
                </div>`;
    };
    $('#orgchart-container').orgchart({
        'data' : item,
        'zoom' : true,
        'pan' : true,
        'depth': 99,
        'nodeTemplate': nodeTemplate,
        'createNode': function ($node,data) {

            var secondMenuIcon = $('<i>', {
                'class': 'fa fa-info-circle second-menu-icon',
                'node-id':`${data.department_id}`,
                click: function(e) {
                    e.stopPropagation();

                    if($(this).siblings('.second-menu').is(":hidden")){
                        $('.second-menu').hide();
                        $(this).siblings('.second-menu').show();
                    }else{
                        $(this).siblings('.second-menu').hide();
                    }
                }
            });

            var ul = `<ul class="deptInfo">
                                <li>电话：${data.phone}</li>
                                <li>传真：${data.fax}</li>
                                <li>邮箱：${data.email}</li>
                          </ul>`;
            var secondMenu = `<div id="second-menu" class="second-menu">${ul}</div>`;

            $node.append(secondMenuIcon).append(secondMenu);
        }
    });
}