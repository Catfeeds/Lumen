var layerModal,layerLoading,
    parentId=0,
    nameCorrect=!1,
    codeCorrect=!1,
    pageNo=1,
    pageSize=40,
    itemSelect=[],
    ajaxData={};
    validatorToolBox={
        checkCode: function(name){
            var value=$('#addType_form').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
            !Validate.checkCustomerCode(value)?(showInvalidMessage(name,"编码由1-20位字母数字下划线组成"),codeCorrect=!1,!1):
            (codeCorrect=1,!0);
        },
        checkName: function(name){
            var value=$('#addType_form').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
            !Validate.checkName(value)?(showInvalidMessage(name,"名称长度不能超出30位"),nameCorrect=!1,!1):
            (nameCorrect=1,!0);
        },
    },
    remoteValidatorToolbox={
        remoteCheckName: function(flag,name,id){
            var value=$('#addType_form').find('#'+name).val().trim();
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
        remoteCheckCode: function(flag,name,id){
            var value=$('#addType_form').find('#'+name).val().trim();
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
    },
    validatorConfig = {
        name:'checkName',
        code:'checkCode'
    },
    remoteValidatorConfig={
        name: "remoteCheckName",
        code: "remoteCheckCode"
    };

$(function () {
    getTypeData();
    bindEvent()
});

//重置搜索参数
function resetParam(){
    ajaxData={
        name: '',
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
            getTypeData();
        }
    });
}

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&product_type_id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['type'].unique+"?"+_token+urlLeft,
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
    $('.addType').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('.addType').find('.submit').removeClass('is-disabled');
}

//获取产品分类列表
function getTypeData(){
    $('.table_tbody').html(' ');
    AjaxClient.get({
        url: URLS['type'].list+'?'+_token,
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
                // console.log(rsp.results)
                $('.table_tbody').html(treeHtml(rsp.results,parent_id,'table'));
            }else{
                noData('暂无数据',9)
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取产品分类失败，请刷新重试',4);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}
function addType(data) {
    AjaxClient.post({
        url: URLS['type'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('updateSuccess','添加成功');
            layer.close(layerModal);
            getTypeData();
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
function typeDelete(id) {
    AjaxClient.get({
        url: URLS['type'].delete+'?'+_token+"&"+"product_type_id="+id,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getTypeData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
function typeView(id,flag) {
    console.log(id);
    AjaxClient.get({
        url: URLS['type'].show+'?'+_token+"&"+"product_type_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getTypeItemData(id,flag,rsp.results);
            // showTypeModal(flag,[],rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

function editType(data) {
    AjaxClient.post({
        url: URLS['type'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getTypeData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addType_form').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
    },this)
}

//获取select列表
function getTypeItemData(id,flag,data){

    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['type'].list+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showTypeModal(flag,rsp.results,data);
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取上级分类失败');
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

function bindEvent(){
    //点击弹框内部关闭dropdown
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

    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        if($(this).parents('.value_wrap').length&&$(this).find('.el-input-icon.is-reverse').length){
            var width=$(this).width();
            var offset=$(this).offset();
            $(this).siblings('.el-select-dropdown').width(width).css({top: 0,left: 0}).offset({top: offset.top+30,left: offset.left});
        }
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        // console.log(899);
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val($(this).attr('data-id'));
        $(this).parents('.el-select-dropdown').hide();
    });



//排序
    $('.sort-caret').on('click',function(e){
        e.stopPropagation();
        $('.el-sort').removeClass('ascending descending');
        if($(this).hasClass('ascending')){
            $(this).parents('.el-sort').addClass('ascending')
        }else{
            $(this).parents('.el-sort').addClass('descending')
        }
        $(this).attr('data-key');
        ajaxData.order=$(this).attr('data-sort');
        ajaxData.sort=$(this).attr('data-key');
        getTypeData();
    });

//搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            // pageNo=1;
            ajaxData={
                code: parentForm.find('#code').val().trim(),
                name: parentForm.find('#name').val().trim(),
                order: 'desc',
                sort: 'id',
            }
            getTypeData();
        }
    });

//重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#name').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        // pageNo=1;
        resetParam();
        getTypeData();
    });

//输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addType_form').attr("data-flag"),
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
    $('body').on('click','#type_add.button',function(e){
        e.stopPropagation();
        getTypeItemData(0,'add');
    });

//点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });

//关闭弹窗
    $('body').on('click','.addType .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
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

    $('body').on('click','.addType .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addType_form');
            var id= parentForm.find('#itemId').val(),
                code = parentForm.find('#code').val(),
                name = parentForm.find('#name').val().trim(),
                parent_id=parentForm.find('#parent_id').val()||0,
                description = parentForm.find('#description').val();
            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
            if(nameCorrect&&codeCorrect) {
                $(this).hasClass('edit') ? (
                    editType({
                        product_type_id: id,
                        parent_id: parent_id,
                        code:code,
                        name: name,
                        description: description,
                        _token: TOKEN

                    })
                ) : (addType({
                    code:code,
                    name: name,
                    parent_id: parent_id,
                    description: description,
                    _token: TOKEN
                }))
            }
        }
    });

//点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        var id=$(this).attr("data-id");
        console.log(id);
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            typeDelete(id);
        });
    });

//点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        typeView($(this).attr("data-id"),'edit');
    });
//查看
    $('.uniquetable').on('click','.button.pop-button.view',function(){
        $(this).parents('tr').addClass('active');
        typeView($(this).attr("data-id"),'view');
    });

}



function showTypeModal(flag,Type,data) {
    var {product_type_id='',code='',name='',parent_id='',description=''}={};
    if(data){
        ({product_type_id='',code='',name='',parent_id='',description=''}=data)
    }

    var labelWidth=100,
        title='查看产品分类',
        btnShow='btnShow',
        readonly='',
        shtml=selectHtml(Type,flag,parent_id),
        noEdit='';

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑产品分类',noEdit='readonly="readonly"'):title='添加产品分类');
    layerModal = layer.open({
        type: 1,
        title: title ,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addType formModal formMateriel" id="addType_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${product_type_id}">
                 <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">上级分类</label>
                        ${shtml}
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                        <input type="text" id="code" ${readonly} ${noEdit} value="${code}" data-name="编码" class="el-input" placeholder="请输入编码">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                        <input type="text" id="name" ${readonly} value="${name}" data-name="名称" class="el-input" placeholder="请输入名称">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                        <textarea type="textarea" maxlength="500" ${readonly} id="description" rows="5" class="el-textarea" placeholder="${flag=='view'?'':'请输入注释，最多只能输入500字'}">${tansferNull(description)}</textarea>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px; display:block;"></p>
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
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

//生成上级分类数据
function selectHtml(fileData,flag,value){
    var elSelect,innerhtml,selectVal,lis='',parent_id='';
    if(fileData&&fileData.length){
        parent_id=fileData[0].parent_id;

        lis=treeHtml(fileData,parent_id,'select',value);
    }
    console.log(itemSelect.length)
    itemSelect.length?(selectVal=itemSelect[0].name,parent_id=itemSelect[0].product_type_id):
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

function treeHtml(fileData, parent_id, flag,value) {

    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        var distance,className,itemImageClass,tagI,itemcode='';
        var hasChild = hasChilds(fileData, item.product_type_id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`) : (distance=level * 20,tagI='',itemcode='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`: `${tagI}<span>${item.name}</span> ${itemcode}`;
        if(flag==='table'){
            _html += `
	        <tr data-id="${item.product_type_id}" data-pid="${parent_id}" class="${className}">
	          <td>${item.code}</td>
	          <td>${span}</td>
	          <td><div>${item.description.length>30?item.description.substring(0,30)+'...':item.description}</div></td>
	          <td class="right">
                <button data-id="${item.product_type_id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.product_type_id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.product_type_id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.product_type_id, flag)}
	        `;
        }else{

            item.product_type_id==value?(itemSelect.push(item),selectedClass='selected'):null;


            _html += `
    		<li data-id="${item.product_type_id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.product_type_id, flag,value)}
	        `;
        }
    });
    return _html;
};



