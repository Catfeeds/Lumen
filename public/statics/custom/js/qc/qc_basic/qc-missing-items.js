var layerModal,
    layerLoading,
    editFlag='',
    layerEle='',
    itemSelect=[],
    typeItemSelect=[],
    procedureSource=[],
    procedureIds = [],
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
        remoteCheckCode: function(name,flag,id){
            var datacode=$('#parent_id').attr('data-code'),
                value=datacode+$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage($('#'+name),val);
                }else{
                    codeCorrect=1;
                }
            });
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
    getMissingItem();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addQCType_from').find('.submit').removeClass('is-disabled');
}

//获取质检类别列表
function getMissingItem(){
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['missing'].select+"?"+_token,
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
        var distance,className,itemImageClass,tagI;
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`) : (distance=level * 20,tagI='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.question_name}</span></div>`: `${tagI}<span>${item.question_name}</span>`;
        if(flag==='table'){
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td><div>${item.type_name}</div></td>
	          <td><div>${item.docking_people_name}</div></td>
	          <td><div>${item.grade}</div></td>
	          <td class="right">
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
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
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


    //弹窗取消
    $('body').on('click','.formQuestion:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewQuestion($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewQuestion($(this).attr("data-id"),'edit');
    });
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteQuestion(id);
        });
    });
    //弹窗下拉
    $('body').on('click','.formQuestion:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.formQuestion:not(".disabled") .el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.val_id').attr('data-code',$(this).attr('data-code'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });


    //添加和编辑的提交
    $('body').on('click','.formQuestion:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addQuestion_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            // for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}

            $(this).addClass('is-disabled');
            parentForm.addClass('disabled');
            var name=parentForm.find('#name').val().trim(),
                type=parentForm.find('#type').val(),
                employee=parentForm.find('#employee').val(),
                grade=parentForm.find('#grade').val(),
                parent_id=parentForm.find('#parent_id').val()||0;
            $(this).hasClass('edit')?(
                editQuestion({
                    question_items_id: id,
                    type: type,
                    name:name,
                    parent_id: parent_id,
                    docking_people: employee,
                    grade: grade,
                    _token: TOKEN
                })
            ):(
                addQuestion({
                    type: type,
                    name:name,
                    parent_id: parent_id,
                    docking_people: employee,
                    grade: grade,
                    _token: TOKEN
                })
            )

        }
    });
    //输入框的相关事件
    $('body').on('focus','.formQuestion:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
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
        getQuestions(0,'add');
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
};

//获取select列表
function getQuestions(id,flag,data){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['missing'].select+"?"+_token,
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
function Modal(flag,questions,data){
    var {id='',type_id='',type_name='',grade='',question_name='',employee_id='',parent_id='',docking_people_name=''}={};
    if(data){
        ({id='',type_id='',type_name='',grade='',question_name='',employee_id='',parent_id='',docking_people_name=''}=data[0]);
    }

    var labelWidth=100,
        btnShow='btnShow',
        title='查看检验项',
        textareaplaceholder='',
        readonly='',
        noEdit='',
        selecthtml=selectHtml(questions,flag,parent_id);
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加检验项':(title='编辑检验项',textareaplaceholder='',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formQuestion" id="addQuestion_from" data-flag="${flag}">
            <input type="hidden" id="itemId" value="${id}">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">上级分类</label>
                ${selecthtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item type_wrap">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">类别</label>
                <div class="el-select-dropdown-wrap type_wrap">
                    
                </div> 
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${question_name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
         
         <div class="el-form-item employee_wrap">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">接收人</label>
                ${flag == 'view' ?`<input type="text" id="employee_view" readonly class="el-input" value="">` :`
                <div class="el-select-dropdown-wrap source_wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="employee" value="">
                    </div>
                    <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        </ul>
                    </div>
                </div> `}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div> 
          
          <div class="el-form-item level_wrap">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">严重等级</label>
                ${flag == 'view' ?`<input type="text" id="grade_view" readonly class="el-input" value="">` :`
                <div class="el-select-dropdown-wrap source_wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="grade" value="">
                    </div>
                    <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        </ul>
                    </div>
                </div> `}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
         
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            selectTypeHtml(type_id,flag,layero);
            getLayerSelectPosition($(layero));
            selectLevelHtml(grade,flag);
            selectEmployeeHtml(employee_id,flag);

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
    itemSelect.length?(selectVal=itemSelect[0].question_name,parent_id=itemSelect[0].id):
        (flag=='view'||flag=='edit'?(selectVal='无',parent_id=0):(selectVal='--请选择--',parent_id=0));
    if(flag==='view'||flag==='edit'){
        innerhtml=`<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
    }else{
        innerhtml=`<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="">
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
//编辑缺失项
function editQuestion(data){
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
//添加缺失项
function addQuestion(data){
    AjaxClient.post({
        url: URLS['missing'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getMissingItem();
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
//查看缺失项
function viewQuestion(id,flag){
    AjaxClient.get({
        url: URLS['missing'].view+"?"+_token+"&question_items_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getQuestions(rsp.results[0].parent_id,flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if(rsp.code==404){
                getMissingItem();
            }
        }
    },this);
}
//删除质量类别
function deleteQuestion(id){
    AjaxClient.get({
        url: URLS['missing'].delete+"?"+_token+"&question_items_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getMissingItem();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getMissingItem();
            }
        }
    },this);
}


//问题类别下拉
function selectTypeHtml(val,flag,layero) {
    AjaxClient.get({
        url:URLS['type'].select+'?'+_token,
        dataType:'json',
        beforeSend:function () {
            layerLoading =  LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var lis = '',innerHtml='',parent_id='';
            if(val) parent_id= val;
            if(rsp.results&&rsp.results.length){
                var selecthtml=typeSelectHtml(rsp.results,flag,parent_id);
                // innerHtml=`${selecthtml}`;
                $('.el-form-item.type_wrap').find('.el-select-dropdown-wrap').html(selecthtml);
                var layerOffset=layero.offset();
                layero.find('.el-select').each(function(item){
                    var width=$(this).width();
                    var height = $(this).height();
                    var offset=$(this).offset();
                    $(this).siblings('.el-select-dropdown').width(width).css({top: offset.top+33-layerOffset.top,left: offset.left-layerOffset.left});

                });

                if(val){
                    $('.el-select-dropdown-wrap.type_wrap').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取模板列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this)
}

function typeSelectHtml(fileData,flag,value){
    var elSelect,innerhtml,selectVal,lis='',parent_id='';
    if(fileData.length){
        parent_id=fileData[0].parent_id;
        lis=typeTreeHtml(fileData,parent_id,'select',value);
    }
    typeItemSelect.length?(selectVal=typeItemSelect[0].name,parent_id=typeItemSelect[0].id):
        (flag=='view'||flag=='edit'?(selectVal='无',parent_id=0):(selectVal='--请选择--',parent_id=0));
    if(flag==='view'||flag==='edit'){
        innerhtml=`<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
    }else{
        innerhtml=`<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="type" value="">
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
    typeItemSelect=[];
    return elSelect;
}
function typeTreeHtml(fileData, parent_id, flag,value) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        var distance,className,itemImageClass,tagI,itemcode='';
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`,itemcode=`(${item.code})`) : (distance=level * 20,tagI='',itemcode='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`: `${tagI}<span>${item.name}</span> ${itemcode}`;
        if(flag==='table'){
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td><div>${item.description.length>30?item.description.substring(0,30)+'...':item.description}</div></td>
	          <td class="right">
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
        }else{
            item.id==value?(typeItemSelect.push(item),selectedClass='selected'):null;
            _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${typeTreeHtml(fileData, item.id, flag,value)}
	        `;
        }
    });
    return _html;
};
//严重等级下拉
function selectLevelHtml(val,flag) {

    var data = [
        {
            id:1,
            grade:'次要'
        },
        {
            id:2,
            grade:'主要'
        },
        {
            id:3,
            grade:'重要'
        }
    ]

    var lis = '',innerHtml='';
console.log(val);
console.log(flag);
        data.forEach(function(item){
            lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.grade}</li>`;
            if(val && flag == 'view'){
                if(val == item.id){
                    $('#grade_view').val(item.grade)
                }
            }
        });
        innerHtml=`
                <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}`;
        $('.el-form-item.level_wrap').find('.el-select-dropdown-list').html(innerHtml);
        if(val){
            $('.el-select-dropdown-wrap.level_wrap').find('.el-select-dropdown-item[data-id='+val+']').click();
        }



}
//接收人下拉
function selectEmployeeHtml(val,flag) {

    var data = [
        {
            id:1,
            employee:'沈鹏'
        },
        {
            id:3,
            employee:'顾桂林'
        },
        {
            id:4,
            employee:'付小兵'
        }
    ]

    var lis = '',innerHtml='';

    data.forEach(function(item){
        lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.employee}</li>`;
        if(val && flag == 'view'){
            if(val == item.id){
                $('#employee_view').val(item.employee)
            }
        }
    });
    innerHtml=`
                <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}`;
    $('.el-form-item.employee_wrap').find('.el-select-dropdown-list').html(innerHtml);
    if(val){
        $('.el-select-dropdown-wrap.employee_wrap').find('.el-select-dropdown-item[data-id='+val+']').click();
    }



}

