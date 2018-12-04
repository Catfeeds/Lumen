var layerModal,layerLoading,
    nameCorrect=!1,
    codeCorrect=!1,
    pageNo=1,
    pageSize=20,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                !Validate.checkName(value)?(showInvalidMessage(name,"名称长度不能超出30位"), nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        },
        checkCode:function (name) {
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                !Validate.checkMaintainCode(value)?(showInvalidMessage(name,"编码由1-20位字母数字下划线横线组成"), codeCorrect=!1,!1):
                (codeCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckCode: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                   codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    codeCorrect=1;
                }
            });
        },
        remoteCheckName: function(flag,name,id){
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
        },
    },
    validatorConfig = {
        name:'checkName',
        code:'checkCode'
    },
    remoteValidatorConfig={
        code: "remoteCheckCode",
        name: "remoteCheckName",
    };

$(function () {
    getAbilityData();
    bindEvent()
})

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['ability'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}
//显示错误信息
function showInvalidMessage(name,val) {
    $('.addAbility').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('.addAbility').find('.submit').removeClass('is-disabled');
}

function getAbilityData() {
    $('.table_tbody').html(' ');
    var urlLeft = "&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['ability'].list+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',4);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',4);
        }
    })
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
            getAbilityData();
        }
    });
}

function createHtml(ele,data) {
    data.forEach(function (item,index) {
        var tr = ` <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td style="max-width: 500px;word-break: break-all;">${item.description}</td>
                    <td class="right nowrap">
                        <button class="button pop-button view" data-id="${item.id}">查看</button>
                        <button class="button pop-button edit" data-id="${item.id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.id}">删除</button>
                    </td>
                </tr>`;
        ele.append(tr);
    })
}

function bindEvent() {
    $('body').on('click','.actions #ability_add',function () {
        // showAbilityModal('add',0)
        getAilityCode()
    })
    $('body').on('click','.formMateriel:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    
    $('body').on('click','#ability_table .pop-button',function (e) {
        e.stopPropagation();
        var id=$(this).attr('data-id'),
            flag=$(this).attr('data-flag');
        if($(this).hasClass('view')){
            abilityView(id,'view')
        }else if($(this).hasClass('edit')){
            abilityView(id,'edit')
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                abilityDelete(id);
            });
        }
    });
    
    $('body').on('click','.addAbility .submit',function (e) {
        var parentForm = $(this).parents('#addAbility_form'),
            id = parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag");
        for (var type in validatorConfig){validatorToolBox[validatorConfig[type]](type,flag,id)}
        if(nameCorrect&&codeCorrect){
            if (!$(this).hasClass('is-disabled')) {
                $(this).addClass('is-disabled');

                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    desc = parentForm.find('#desc').val();

                $(this).hasClass('edit') ? editAbility({
                    ability_id:id,
                    code:code,
                    name:name,
                    description:desc,
                    _token:TOKEN
                }) : addAbility({
                    code:code,
                    name:name,
                    description:desc,
                    _token:TOKEN
                })
            }

        }
    })

    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addAbility_form').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name,id);
    });
}

function addAbility(data) {
    AjaxClient.post({
        url: URLS['ability'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getAbilityData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
        },
        complete: function(){
            $('.addAbility .submit').removeClass('is-disabled');
        }
    },this)
}
function abilityDelete(id) {
    var data={
        ability_id:id,
        _token:TOKEN
    }
    AjaxClient.post({
        url: URLS['ability'].delete,
        dataType: 'json',
        data:data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getAbilityData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
function abilityView(id,flag) {
    var data={
        ability_id:id,
        _token:TOKEN
    }
    AjaxClient.post({
        url: URLS['ability'].show,
        dataType: 'json',
        data:data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showAbilityModal(flag,id,rsp.results[0]);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

function editAbility(data) {
    AjaxClient.post({
        url: URLS['ability'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getAbilityData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addAbility_form').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
    },this)
}
function getAilityCode() {
    AjaxClient.post({
        url:URLS['procedure'].getCode,
        dataType: 'json',
        data:{
            _token:TOKEN,
            type_code:'',
            type:4
        },
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            // rsp.results.code = '';
            console.log(rsp.results);
            showAbilityModal('add',0,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
function showAbilityModal(flag,ids,data) {
    var {code='',name='',description=''}={};
    if(data){
        ({code='',name='',description=''}=data)
    }

    var labelWidth=100,title='查看能力',btnShow='btnShow',readonly='',noEdit='';

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑能力',noEdit='readonly="readonly"'):(title='添加能力',code=''));

    layerModal = layer.open({
        type: 1,
        title: title ,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addAbility formModal formMateriel" id="addAbility_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${ids}">
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                        <input type="text" id="code" ${noEdit} ${readonly} value="${code}" data-name="编码" class="el-input" placeholder="请输入编码">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                        <input type="text" id="name" ${readonly} value="${name}" data-name="名称" class="el-input" placeholder="请输入名称">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                        <textarea type="textarea" maxlength="500" ${readonly} id="desc" rows="5" class="el-textarea" placeholder="${flag=='view'?'':'请输入注释，最多只能输入500字'}">${tansferNull(description)}</textarea>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                    </div>
                </div>
</form>`,
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}