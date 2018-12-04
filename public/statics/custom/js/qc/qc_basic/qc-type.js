var layerModal,
    layerLoading,
    layerEle='',
    itemSelect=[],
    createTemplate,
    codeCorrect=!1,
    nameCorrect=!1,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                    (nameCorrect=1,!0);
        },
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                    !Validate.checkMaterialClass(value)?(showInvalidMessage(name,"编码由2-50位字母数字下划线中划线组成"),codeCorrect=!1,!1):
                        (codeCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckName: function(name,flag,id){
            var value=$('#'+name).val().trim();
            // getUnique(flag,name,value,id,function(rsp){
            //     if(rsp.results&&rsp.results.exist){
            //         nameCorrect=!1;
            //         var val='已注册';
            //         showInvalidMessage(name,val);
            //     }else{
            //         nameCorrect=1;
            //     }
            // });
        },
        remoteCheckCode: function(name,flag,id){
            var datacode=$('#parent_id').attr('data-code'),
                value=datacode+$('#'+name).val().trim();
            // getUnique(flag,name,value,id,function(rsp){
            //     if(rsp.results&&rsp.results.exist){
            //         codeCorrect=!1;
            //         var val='已注册';
            //         showInvalidMessage($('#'+name),val);
            //     }else{
            //         codeCorrect=1;
            //     }
            // });
        },
    },
    validatorConfig = {
        name: "checkName",
        code: "checkCode"
    },remoteValidatorConfig={
        name: "remoteCheckName",
        code: "remoteCheckCode"
    };

$(function(){
    createTemplate=$('#template_create').val();
    getQCType();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addQCType_from').find('.submit').removeClass('is-disabled');
}

//获取质检类别列表
function getQCType(){
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['type'].select+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var parent_id=rsp.results[0].parent_id;
                $('.table_tbody').html(treeHtml(rsp.results,parent_id,'table'));
            }else{
                noData('暂无数据',3);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取质量类别列表失败，请刷新重试',3);
        }
    },this);
};



function treeHtml(fileData, parent_id, flag,value) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        var distance,className,itemImageClass,tagI,itemcode='';
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode collasped',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`,itemcode=`(${item.code})`) : (distance=level * 20,tagI='',itemcode='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`: `${tagI}<span>${item.name}</span> ${itemcode}`;
        if(flag==='table'){
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}" style="display: ${hideChild};">
	          <td>${span}</td>
	          <td><div>${item.description.length>30?item.description.substring(0,30)+'...':item.description}</div></td>
	          <td class="right">
                <a class="link_button" style="border: none;padding: 0;" href="${createTemplate}?id=${item.id}&name=${item.name}&code=${item.code}"><button data-id="${item.id}" data-name="${item.name}" data-pid="${parent_id}" class="button pop-button template">生成模板</button></a>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
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


function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','.formQCType:not(".disabled") .el-select-dropdown-wrap,.procedureModal:not(".disabled") .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    //弹窗取消
    $('body').on('click','.formQCType:not(".disabled") .cancle,.procedureModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewQCType($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewQCType($(this).attr("data-id"),'edit');
    });
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteType(id);
        });
    });
    //弹窗下拉
    // $('body').on('click','.formQCType:not(".disabled") .el-select,.procedureModal:not(".disabled") .el-select',function(){
    //     $(this).find('.el-input-icon').toggleClass('is-reverse');
    //     $(this).siblings('.el-select-dropdown').toggle();
    //
    // });
    // //下拉选择
    // $('body').on('click','.formQCType:not(".disabled") .el-select-dropdown-item',function(e){
    //     e.stopPropagation();
    //     $(this).parents('.el-form-item').find('.errorMessage').html('');
    //     $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    //     $(this).addClass('selected');
    //     if($(this).hasClass('selected')){
    //         var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
    //         ele.find('.el-input').val($(this).text());
    //         ele.find('.val_id').val($(this).attr('data-id'));
    //         ele.find('.val_id').attr('data-code',$(this).attr('data-code'));
    //     }
    //     $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    // });

//单选按钮点击事件
    $('body').on('click','.el-radio-input:not(.noedit)',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });

    //添加和编辑的提交
    $('body').on('click','.formQCType:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addQCType_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
            if(nameCorrect&&codeCorrect){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var name=parentForm.find('#name').val().trim(),
                    datacode=parentForm.find('#parent_id').attr('data-code'),
                    code=datacode+parentForm.find('#code').val().trim(),
                    description=parentForm.find('#description').val().trim(),
                    is_releva_type=parentForm.find('#is_releva_type').is(':checked')?1:0,
                    parent_id=parentForm.find('#parent_id').val()||0,
                    type_kind = parentForm.find('.is-radio-checked .type_kind').val(),
                    status = parentForm.find('.is-radio-checked .status').val();
                var is_releva_type=0;
                var is_releva_operation=0;
                if(status==1){
                    is_releva_type=1;
                    is_releva_operation=0;
                }else if(status==2){
                    is_releva_type=0;
                    is_releva_operation=1;
                }else if(status==3){
                    is_releva_type=0;
                    is_releva_operation=0;
                }
                $(this).hasClass('edit')?(
                    editQCType({
                        type_id: id,
                        name: name,
                        code:code,
                        description: description,
                        is_releva_type: is_releva_type,
                        is_releva_operation: is_releva_operation,
                        type_kind: type_kind,
                        _token: TOKEN
                    })
                ):(
                    addQCType({
                        name: name,
                        code:code,
                        parent_id: parent_id,
                        description: description,
                        is_releva_type: is_releva_type,
                        is_releva_operation: is_releva_operation,
                        type_kind: type_kind,
                        _token: TOKEN
                    })
                )
            }
        }
    });
    //输入框的相关事件
    $('body').on('focus','.formQCType:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formQCType:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addMCategory_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });
    //添加物料分类
    $('.button_add').on('click',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        getTypes(0,'add');
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
};

//获取select列表
function getTypes(id,flag,data){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['type'].select+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Modal(flag,rsp.results,data);
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取上级分类失败');
            dtd.reject(rsp);
        }
    },this);
    return dtd;
};

//查看和添加和编辑模态框
function Modal(flag,type,data){
    var {id='',type_id='',code='',name='',description='',parent_id='',is_releva_type='',type_kind='',is_releva_operation='',is_material_type='',is_operation=''}={};
    if(data){
        ({id='',type_id='',code='',name='',description='',parent_id='',is_releva_type='',type_kind='',is_releva_operation='',is_material_type='',is_operation=''}=data[0]);
    }
    var labelWidth=100,
        btnShow='btnShow',
        title='查看质检类别',
        textareaplaceholder='',
        readonly='',
        noEdit='',
        type_kind1='',
        type_kind2='',
        type_kind3='',
        is_releva_type_checked='',
        is_releva_operation_checked='',
        no_checked='is-radio-checked',
        disable='',
        selecthtml=selectHtml(type,flag,parent_id);
        type_kind==1?(type_kind1 = 'is-radio-checked',type_kind2='', type_kind3=''):type_kind==2?(type_kind2 = 'is-radio-checked',type_kind1='',type_kind3=''):type_kind==3?(type_kind3 = 'is-radio-checked',type_kind1='',type_kind2=''):(type_kind1='is-radio-checked',type_kind2='',type_kind3='');
        if(is_releva_type==1){
            is_releva_type_checked='is-radio-checked';
            is_releva_operation_checked='';
            no_checked='';
        }

        if(is_releva_operation==1){
            is_releva_operation_checked='is-radio-checked';
            is_releva_type_checked='';
            no_checked='';
        }

    flag==='view'?(btnShow='btnHide',disable='disabled="disabled"',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加质检类别':(title='编辑质检类别',textareaplaceholder='',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formQCType" id="addQCType_from" data-flag="${flag}">
            <input type="hidden" id="itemId" value="${id}">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">上级分类</label>
                ${selecthtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                <input type="text" id="code"  ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="2-50位字母数字下划线中划线组成" value="${code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${textareaplaceholder}">${description}</textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>
          ${flag=='add'?`<div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">类型种类</label>
                    <div class="el-radio-group" style="width: 100%;display: inline-block;">
                        <label class="el-radio">
                            <span class="el-radio-input ${type_kind1}">
                                <span class="el-radio-inner"></span>
                                <input class="type_kind" type="hidden" value="1">
                            </span>
                            <span class="el-radio-label">IQC</span>
                        </label>
                        <label class="el-radio">
                            <span class="el-radio-input ${type_kind2}">
                                <span class="el-radio-inner"></span>
                                <input class="type_kind" type="hidden" value="2">
                            </span>
                            <span class="el-radio-label">IPQC</span>
                        </label>
                        <label class="el-radio">
                            <span class="el-radio-input ${type_kind3}">
                                <span class="el-radio-inner"></span>
                                <input class="type_kind" type="hidden" value="3">
                            </span>
                            <span class="el-radio-label">OQC</span>
                        </label>
                    </div>
                </div>
                <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
            </div>`:''} 
            
            ${(type_kind==1&&is_material_type==1&&is_operation==0)||(type_kind==2&&is_material_type==1&&is_operation==1)?'':`
                    
          <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">关联项</label>
                    <div class="el-radio-group" style="width: 100%;display: inline-block;">
                    ${(flag=='edit' || flag=='view')?`${type_kind==1?((is_material_type==0 && is_operation==0)?`<label class="el-radio">
                            <span class="el-radio-input ${is_releva_type_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="1">
                            </span>
                            <span class="el-radio-label">物料</span>
                        </label>
                        <label class="el-radio">
                            <span class="el-radio-input ${no_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="3">
                            </span>
                            <span class="el-radio-label">无</span>
                        </label>`:''):''}
                        
                        ${type_kind==2?((is_operation==0&&is_material_type==0)?`<label class="el-radio">
                            <span class="el-radio-input ${is_releva_operation_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="2">
                            </span>
                            <span class="el-radio-label">工序</span>
                        </label><label class="el-radio">
                            <span class="el-radio-input ${no_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="3">
                            </span>
                            <span class="el-radio-label">无</span>
                        </label>`:((is_operation==1&&is_material_type==0)?`<label class="el-radio">
                            <span class="el-radio-input ${is_releva_type_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="1">
                            </span>
                            <span class="el-radio-label">物料</span>
                        </label>
                        <label class="el-radio">
                            <span class="el-radio-input ${no_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="3">
                            </span>
                            <span class="el-radio-label">无</span>
                        </label>`:'')):''}
                     ${type_kind == 3 ? ((is_material_type == 0 && is_operation == 0) ?`<label class="el-radio">
                            <span class="el-radio-input ${is_releva_type_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="1">
                            </span>
                            <span class="el-radio-label">物料</span>
                        </label>
                        <label class="el-radio">
                            <span class="el-radio-input ${no_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="3">
                            </span>
                            <span class="el-radio-label">无</span>
                        </label>`:''):''}`:`<label class="el-radio">
                            <span class="el-radio-input ${is_releva_type_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="1">
                            </span>
                            <span class="el-radio-label">物料</span>
                        </label><label class="el-radio">
                            <span class="el-radio-input ${is_releva_operation_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="2">
                            </span>
                            <span class="el-radio-label">工序</span>
                        </label><label class="el-radio">
                            <span class="el-radio-input ${no_checked}">
                                <span class="el-radio-inner"></span>
                                <input class="status" type="hidden" value="3">
                            </span>
                            <span class="el-radio-label">无</span>
                        </label>`}  
                    </div>
                </div>
                <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
            </div>`}
            
          
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            if(flag=='view'){
                $(layero).find('.el-radio-input').addClass('noedit');
            }
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}

//生成上级分类数据
function selectHtml(fileData,flag,value){
    var elSelect,innerhtml,selectVal,lis='',parent_id='';
    if(fileData.length){
        parent_id=fileData[0].parent_id;
        lis=treeHtml(fileData,parent_id,'select',value);
    }
    itemSelect.length?(selectVal=itemSelect[0].name,parent_id=itemSelect[0].id):
        (flag=='view'||flag=='edit'?(selectVal='无',parent_id=0):(selectVal='--请选择--',parent_id=0));
    if(flag==='view'||flag==='edit'){
        innerhtml=`<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" readonly class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
    }else{
        innerhtml=`<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" readonly class="val_id" data-code="" id="parent_id" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }
    elSelect=`<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    itemSelect=[];
    return elSelect;
}
//编辑质检分类
function editQCType(data){
    AjaxClient.post({
        url: URLS['type'].edit,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getQCType();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
//添加质检分类
function addQCType(data){
    AjaxClient.post({
        url: URLS['type'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getQCType();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//查看质量类别
function viewQCType(id,flag){
    AjaxClient.get({
        url: URLS['type'].view+"?"+_token+"&type_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getTypes(rsp.results.parent_id,flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if(rsp.code==404){
                getQCType();
            }
        }
    },this);
}
//删除质量类别
function deleteType(id){
    AjaxClient.get({
        url: URLS['type'].delete+"?"+_token+"&type_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            getQCType();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getQCType();
            }
        }
    },this);
}

