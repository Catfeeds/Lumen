var layerModal,layerLoading,
    codeCorrect=!1,
    nameCorrect=!1,

    pageNo=1,
    pageSize=15,
    ajaxData={};
validatorToolBox={
    checkCode: function(name){
        var value=$('#addOffcut_form').find('#'+name).val().trim();
        return Validate.checkNull(value)?(showInvalidMessage(name,"边角料名称不能为空"),codeCorrect=!1,!1):
            (codeCorrect=1,!0);
    },
    checkName: function(name){
        var value=$('#addOffcut_form').find('#'+name).val().trim();
        return Validate.checkNull(value)?(showInvalidMessage(name,"边角料编码不能为空"),nameCorrect=!1,!1):
            (nameCorrect=1,!0);
    }


},
    remoteValidatorToolbox={
        remoteCheckCode: function(flag,name,id){
            var value=$('#addOffcut_form').find('#'+name).val().trim();
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
            var value=$('#addOffcut_form').find('#'+name).val().trim();
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
        offcut_code:'checkCode',
        offcut_name:'checkName',


    },
    remoteValidatorConfig={
        offcut_code: "remoteCheckCode",
        offcut_name: "remoteCheckName",

    };

$(function () {
    getOffcutData();
    bindEvent()
});

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        order: 'desc',
        sort: 'id',
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
            getOffcutData();
        }
    });
}

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['Offcut'].unique+"?"+_token+urlLeft,
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
    $('.addOffcut').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('.addOffcut').find('.submit').removeClass('is-disabled');
}

function getOffcutData(){
    $('.table_tbody').html('');

    AjaxClient.get({
        url: URLS['Offcut'].selete+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            if(rsp.results && rsp.results.length){
                var parent_id=rsp.results[0].parent_id;
                $('.table_tbody').html(treeHtml(rsp.results,parent_id,'table'));
            }else{
                noData('暂无数据',5)
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',5);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}
function treeHtml(fileData, parent_id, flag,value) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        var distance,className,itemImageClass,tagI,itemcode='';
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`,itemcode=`(${item.offcut_code})`) : (distance=level * 20,tagI='',itemcode='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.offcut_name}</span> ${itemcode}</div>`: `${tagI}<span>${item.offcut_name}</span> ${itemcode}`;
        if(flag==='table'){
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}" >
	          <td>${span}</td>
	          <td>${item.offcut_code}</td>
	          <td class="right">
	          ${level==0?`<button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button add">添加边角料</button>`:''}
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
        }
    });
    return _html;
};
function addOffcut(data) {
    AjaxClient.post({
        url: URLS['Offcut'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','添加成功');
            layer.close(layerModal);
            getOffcutData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.addAbility .submit').removeClass('is-disabled');
        }
    },this)
}
function OffcutDelete(id) {
    AjaxClient.get({
        url: URLS['Offcut'].delete+"?"+_token+"&id="+id,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getOffcutData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
function OffcutView(id,flag) {
    AjaxClient.get({
        url: URLS['Offcut'].show+'?'+_token+"&"+"id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showOffcutModal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

function editOffcut(data) {
    AjaxClient.post({
        url: URLS['Offcut'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            // getOffcutData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addPractice_form').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
    },this)
}



function bindEvent(){
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            // $('.el-select-dropdown').slideUp();
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });



//输入框的相关事件
    $('body').on('focus','.addOffcut:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.addOffcut:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addOffcut_form').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name,id);
    });

//添加页面
    $('body').on('click','#Offcut_add.button',function(e){
        e.stopPropagation();
        showOffcutModal('add','',0);
    });

//点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });

//关闭弹窗
    $('body').on('click','.addOffcut .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });


    $('body').on('click','.addOffcut .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addOffcut_form'), id=$('#itemId').val(),parent_id=$('#itemParentId').val();

            var offcut_code = parentForm.find('#offcut_code').val().trim(),
                offcut_name = parentForm.find('#offcut_name').val().trim();

            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
            if(nameCorrect&&codeCorrect){
                $(this).hasClass('edit')?(
                    editOffcut({
                        id: id,
                        offcut_code: offcut_code,
                        offcut_name: offcut_name,
                        _token: TOKEN

                    })
                ):(addOffcut({
                    offcut_code: offcut_code,
                    offcut_name: offcut_name,
                    parent_id:parent_id,
                    _token: TOKEN
                }));
            }
        }
    })

//点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            OffcutDelete(id);
        });
    });

//点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        codeCorrect=!1;
        nameCorrect=!1;
        $(this).parents('tr').addClass('active');
        OffcutView($(this).attr("data-id"),'edit');
    });
    //点击添加边角料
    $('.uniquetable').on('click','.button.pop-button.add',function(){
        codeCorrect=!1;
        nameCorrect=!1;
        showOffcutModal('add','',$(this).attr('data-id'));
    });
//查看
    $('.uniquetable').on('click','.button.pop-button.view',function(){
        $(this).parents('tr').addClass('active');
        OffcutView($(this).attr("data-id"),'view');
    });
//单选按钮点击事件
    $('body').on('click','.el-radio-input:not(.noedit)',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });

    //树形表格展开收缩
    $('body').on('click','.treeNode .itemIcon',function(){

        // console.log($('[data-pid="3067"]'));
        if($(this).parents('.treeNode').hasClass('collasped')){
            $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
            showChildren($(this).parents('.treeNode').attr("data-id"));
        }else{
            $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
            hideChildren($(this).parents('.treeNode').attr("data-id"));
        }
    });

}



function showOffcutModal(flag,data,parent_id) {
    // offcut_code，offcut_name，attr_code，attr_name
    var {id='',offcut_code='',offcut_name=''}={};
    if(data){
        ({id='',offcut_code='',offcut_name=''}=data)
    }
    var common_true =  '',common_false =  '';


    var labelWidth=120,title='查看边角料',btnShow='btnShow',readonly='',noEdit='';

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑边角料',noEdit='readonly="readonly"'):title='添加边角料');
    layerModal = layer.open({
        type: 1,
        title: title ,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addOffcut formModal formMateriel" id="addOffcut_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${id}">
                <input type="hidden" id="itemParentId" value="${parent_id}">
               
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                        <input type="text" id="offcut_code" ${readonly} value="${offcut_code}" data-name="编码" class="el-input" placeholder="请输入编码">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                        <input type="text" id="offcut_name" ${readonly} value="${offcut_name}" data-name="名称" class="el-input" placeholder="请输入名称">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                </div>
                
                
               
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                    </div>
                </div>
</form>`,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            if(flag=='view'){
                $(layero).find('.el-radio-input').addClass('noedit');
            }
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}
$('body').on('input','.el-item-show #code',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘’，。、]/im,"");
})