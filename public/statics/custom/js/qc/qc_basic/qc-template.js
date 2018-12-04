var templateTypeId,
    templateName,
    templateCode,
    itemSelect=[];


$(function(){
    templateTypeId=getQueryString('id'),templateName=getQueryString('name'),templateCode=getQueryString('code');
    $('#addMTemplate_from').html(decodeURI(templateName+'模板'));
    bindEvent();
    geItemToTemplate();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addQCType_from').find('.submit').removeClass('is-disabled');
}
//获取当前模板检验项列表
function geItemToTemplate(){
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['template'].itemSelect+"?"+_token+"&check_type="+templateTypeId+"&check_type_code="+templateCode,
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
            noData('获取模板检验项列表失败，请刷新重试',3);
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
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`,itemcode=`(${item.code})`) : (distance=level * 20,tagI='',itemcode='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span>${itemcode}</div>`: `${tagI}<span>${item.name}</span>${itemcode}`;
        if(flag==='table'){
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td class="right">
                <button data-id="${item.template_id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
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
    $('body').on('click','.formItemTemplate:not(".disabled") .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    //弹窗取消
    $('body').on('click','.formItemTemplate:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteItemToTemplate(id);
        });
    });
    //弹窗下拉
    $('body').on('click','.formItemTemplate:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.formItemTemplate:not(".disabled") .el-select-dropdown-item',function(e){
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
    $('body').on('click','.formItemTemplate:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addItemTemplate');
            $(this).addClass('is-disabled');
            parentForm.addClass('disabled');
            var check_inspect_id=parentForm.find('#item').val();
            var check_inspect_code=parentForm.find('#item').attr('data-code');
            console.log(check_inspect_code);
            addItemToTemplate({
                check_type:templateTypeId,
                check_type_code:templateCode,
                check_inspect_id: check_inspect_id,
                check_inspect_code: check_inspect_code,
                _token: TOKEN
            })
        }
    });
    //输入框的相关事件
    $('body').on('focus','.formItemTemplate:not(".disabled") .el-input:not([readonly])',function(){
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
        geItems();
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

//获取当前模板检验项列表
function geItems(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['inspect'].select+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Modal(rsp.results);
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
function Modal(items){

    var labelWidth=100,
        btnShow='btnShow',
        title='添加检验项',
        textareaplaceholder='请输入描述，最多只能输入500字符',
        readonly='',
        noEdit='',
        selecthtml=selectHtml(items);
    // flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加质检类别':(title='编辑质检类别',textareaplaceholder='',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formItemTemplate" id="addItemTemplate" data-flag="add">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">检验项</label>
                ${selecthtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
};

function selectHtml(fileData){
    var elSelect,selectVal,lis='',parent_id='';
    if(fileData.length){
        parent_id=fileData[0].parent_id;
        lis=treeHtml(fileData,parent_id,'select');
    }
    elSelect=`<div class="el-select-dropdown-wrap">
			<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="item" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>
		</div>`;
    itemSelect=[];
    return elSelect;
}

function addItemToTemplate(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['template'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            geItemToTemplate();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('body').find('#addItemTemplate').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}


//删除模板检验项
function deleteItemToTemplate(id){
    AjaxClient.get({
        url: URLS['template'].delete+"?"+_token+"&template_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            geItemToTemplate();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                geItemToTemplate();
            }
        }
    },this);
}