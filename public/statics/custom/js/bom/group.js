var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    codeCorrect=!1,
    nameCorrect=!1,
    ajaxData = {},
    editUnique,
    validatorToolBox={
        checkCode:function (name) {
            var value = $('#'+name).val().trim();

            return Validate.checkNull(value) ? (showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                !Validate.checkBomGroupCode(value) ? (showInvalidMessage(name,"由3-50位字母下划线数字组成,字母开头"),codeCorrect=!1,!1):
            (codeCorrect=1,!0)
        },
        checkName:function (name) {
            var value = $('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):(nameCorrect=1,!0)
        }
    },
    remoteValidatorToolbox={
        remoteCheckCode:function (name,flag,id) {
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
        code:'checkCode',
        name:'checkName'
    },
    remoteValidatorConfig = {
        code: 'remoteCheckCode',
        name: 'remoteCheckName'
    };

$(function () {
    resetParam();
    getBomGroupData();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).show();
    $('#'+name).parents('.el-form-item').find('.info').hide();
    $('#addBomGroup_form').find('.submit').removeClass('is-disabled');
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        code: '',
        name: ''
    }
}

//分页
function bindPagenationClick(total,size) {
    $('.pagenation_wrap').show();
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
            getBomGroupData();
        }
    });
}

//获取bom 分组数据
function getBomGroupData() {

    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }

    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;

    $('.table_tbody').html('');

    AjaxClient.get({
        url: URLS['bomGroup'].list+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            var pageTotal = rsp.paging.total_records;

            if(pageTotal>pageSize){
                bindPagenationClick(pageTotal,pageSize);
            }else{
                $('#pagenation').html('');
            }

            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',5);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取物料清单分组列表失败，请刷新重试',4);
        },
        complete: function(){
            $('#searchBomAttr_from .submit,#searchBomAttr_from .reset').removeClass('is-disabled');
        }
    })
}

function createHtml(ele,data) {

    data.forEach(function (item,index) {
        var tr = ` <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td style="max-width: 600px;word-break: break-all;">${item.description}</td>
                    <td class="right nowrap">
                        <button class="button pop-button view" data-id="${item.bom_group_id}">查看</button>
                        <button class="button pop-button edit" data-id="${item.bom_group_id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.bom_group_id}">删除</button>
                    </td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })
}

//bom分组添加
function addBomGroup(data) {
    var nameUnique = $('#name').parents('.el-form-item').find('.errorMessage').html(),
        codeUnique = $('#code').parents('.el-form-item').find('.errorMessage').html();

     if(nameUnique != "已注册" && codeUnique != "已注册"){
         AjaxClient.post({
             url: URLS['bomGroup'].addGroup,
             data:data,
             dataType:'json',
             beforeSend: function(){
                 layerLoading = LayerConfig('load');
             },
             success:function (rsp) {
                 layer.close(layerLoading);
                 layer.close(layerModal);
                 getBomGroupData();
             },
             fail: function(rsp){
                 layer.close(layerLoading);
                 if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                     LayerConfig('fail',rsp.message)
                 }
                 $('body').find('#addBomGroup_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

                 if(rsp&&rsp.field!==undefined){
                     showInvalidMessage(rsp.field,rsp.message);
                 }

             }
         },this)
     }else{
         $('body').find('#addBomGroup_form').removeClass('disabled').find('.submit').removeClass('is-disabled');
     }



}

//bom 分组查看
function viewBomGroup(id,flag) {
    AjaxClient.get({
        url:URLS['bomGroup'].showBomGroup+'?'+_token+'&bom_group_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {

            layer.close(layerLoading);
            bomGroupModal(id,flag,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp.code==404){
                getBomGroupData();
            }
        }
    },this);
}

//bom分组删除
function deleteBomGroup(id) {

    AjaxClient.get({
        url: URLS['bomGroup'].deleteBomGroup+'?'+_token+"&bom_group_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getBomGroupData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getBomGroupData();
            }
        }

    },this)
}

//bom 分组编辑
function editBomGroup(data) {

    if(editUnique != true){
        AjaxClient.post({
            url:URLS['bomGroup'].editGroup,
            data:data,
            dataType: 'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function () {
                layer.close(layerLoading);
                layer.close(layerModal);
                getBomGroupData();
            },
            fail:function (rsp) {
                layer.close(layerLoading);
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message)
                }
                $('body').find('#addBomGroup_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

                if(rsp&&rsp.field!==undefined){
                    showInvalidMessage(rsp.field,rsp.message);
                }
            }
        },this)
    }else{
        $('body').find('#addBomGroup_form').removeClass('disabled').find('.submit').removeClass('is-disabled');
    }


}

//检测唯一性
function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['bomGroup'].unique+"?"+_token+urlLeft,
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

function bindEvent() {
    $('body').on('click','.formMateriel:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    //bom分组 添加
    $('#bomgroup_add').on('click',function () {
        nameCorrect=!1;
        codeCorrect=!1;
        bomGroupModal(0,'add');
    })

    //bom 分组 添加提交
    $('body').on('click','.addBGroup:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        var parentForm=$(this).parents('#addBomGroup_form'),
            id=parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag");

        for (var type in validatorConfig){validatorToolBox[validatorConfig[type]](type,flag,id)}

        if (nameCorrect&&codeCorrect){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    description = parentForm.find('#description').val().trim();
                $(this).hasClass('edit')?(
                    editBomGroup({
                        code: code,
                        name: name,
                        description: description,
                        bom_group_id: id,
                        _token:TOKEN
                    })
                ) :(
                    addBomGroup({
                        code: code,
                        name: name,
                        description: description,
                        _token:TOKEN
                    })
                )
            }
        }
    })
    
    //bom 分组查看
    $('#table_bom_table.uniquetable').on('click','.view',function () {
        $(this).parents('tr').addClass('active');
        viewBomGroup($(this).attr("data-id"),'view')
    });

    //bom 分组 编辑
    $('#table_bom_table.uniquetable').on('click','.edit',function () {
        $(this).parents('tr').addClass('active');
        viewBomGroup($(this).attr("data-id"),'edit')
    });

    //删除分组
    $('#table_bom_table.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteBomGroup(id);
        });
    });
    
    //bom搜索
    $('body').on('click','#searchBomAttr_from:not(".is-disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchBomAttr_from');
            ajaxData = {
                code : parentForm.find('#searchCode').val().trim(),
                name: parentForm.find('#searchName').val().trim(),
                sort: 'id'
            };
            getBomGroupData();
        }
    })

    //bom 搜索重置
    $('body').on('click','#searchBomAttr_from .reset:not(.is-disabled)',function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm = $(this).parents('#searchBomAttr_from');
        parentForm.find('#searchCode').val('');
        parentForm.find('#searchName').val('');
        resetParam();
        getBomGroupData();
    });

    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").hide();
        $(this).parents('.el-form-item').find('.info').show();
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addBomGroup_form').attr("data-flag"),
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

function bomGroupModal(ids,flag,data) {

    var {id='',code='',name='',description=''} = {};
    if(data){
        ({id='',code='',name='',description=''}=data);
    }

    var readonly = '',
        labelWidth=100,
        btnShow='btnShow',
        noEdit='',
        title = "查看物料清单分组",
        placeholder="请输入描述，最多能输入500个字符";

    flag=='view' ? (readonly='readonly="readonly"',btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加物料清单分组' : (title = '编辑物料清单分组',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title ,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="addBGroup formModal formMateriel" id="addBomGroup_form" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;text-align: right !important;">编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${noEdit} ${readonly} value="${code}" data-name="编码" class="el-input" placeholder="由3-50位字母下划线数字组成,字母开头">
                        </div>
                        <p class="info" style="padding-left: ${labelWidth}px;"></p>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;text-align: right !important;">名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} data-name="名称" value="${name}" class="el-input" placeholder="请输入名称">
                        </div>
                        <p class="info" style="padding-left: ${labelWidth}px;"></p>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;text-align: right !important;position: relative;top:-50px;">描述</label>
                            <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${description}</textarea>
                        </div>
                        <p class="info" style="padding-left: ${labelWidth}px;"></p>
                        <p class="errorMessage"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
        </form>` ,
        success: function(layero,index){

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}
$('body').on('input','.el-item-show input',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘’，。、]/im,"");
})