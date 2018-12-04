var layerModal,
    layerLoading,
    parentId=0,
    layerEle='',
    itemSelect=[],
    tempSelect=[],
    codeCorrect=!1, unitCorrect=!1,
    nameCorrect=!1,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1): (nameCorrect=1,!0);
        },
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                        (codeCorrect=1,!0);
        },

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
                    showInvalidMessage(name,val);
                }else{
                    codeCorrect=1;
                }
            });
        },
    },
    validatorConfig = {
        name: "checkName",
        code: "checkCode",
    },remoteValidatorConfig={
        name: "remoteCheckName",
        code: "remoteCheckCode"
    };
$(function(){
    getDeviceType();

    // getProcedureSourceData();

    // selectMaterialHtml();

    bindEvent();
});
//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addDevice_from').find('.submit').removeClass('is-disabled');
}

//获取设备类型列表
function getDeviceType(){
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['deviceType'].treeIndex+"?"+_token,
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
            noData('获取物料分类列表失败，请刷新重试',3);
        }
    },this);
}
//添加设备类型
function addDeviceType(data){
    AjaxClient.post({
        url: URLS['deviceType'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getDeviceType();
        },
        fail: function(rsp){
            layer.close(layerLoading);

            $('body').find('#addDevice_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//查看设备类型
function viewDeviceType(id,flag){
    AjaxClient.get({
        url: URLS['deviceType'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp.results)
            getdeviceTypes(rsp.results.parent_id,flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if(rsp.code==404){
                getDeviceType();
            }
        }
    },this);
}
//编辑设备类型
function editDeviceType(data){
    AjaxClient.post({
        url: URLS['deviceType'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getDeviceType();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('body').find('#addDevice_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
//删除设备类型
function deleteDeviceType(id){
    AjaxClient.get({
        url: URLS['deviceType'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            getDeviceType();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getDeviceType();
            }
        }
    },this);
}
//获取select列表
function getdeviceTypes(id,flag,data){
    var dtd=$.Deferred();

    AjaxClient.get({
        url: URLS['deviceType'].treeIndex+"?"+_token,
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
        url: URLS['deviceType'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
            // layer.close(layerLoading);
        }
    },this);
}

function bindEvent() {
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click', '.formDevice:not(".disabled") .el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    $('body').on('click', '.formDevice:not(".disabled") .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('.uniquetable').on('click', '.view', function () {
        $(this).parents('tr').addClass('active');
        viewDeviceType($(this).attr("data-id"), 'view');
    });
    $('.uniquetable').on('click', '.edit', function () {
        nameCorrect = !1;
        codeCorrect = !1;
        $(this).parents('tr').addClass('active');
        viewDeviceType($(this).attr("data-id"), 'edit');
    });
    $('.uniquetable').on('click', '.delete', function () {
        var id = $(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
                $('.uniquetable tr.active').removeClass('active');
            }
        }, function (index) {
            layer.close(index);
            deleteDeviceType(id);
        });
    });
    $('body').on('click', '.formDevice:not(".disabled") .el-select', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
        if (layerEle != '' && $(this).siblings('.el-select-dropdown').is(':visible')) {
            getLayerSelectPosition(layerEle);
        }
    });

    $('body').on('click', '.formDevice:not(".disabled") .el-select-dropdown-item', function (e) {
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
            var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.val_id').attr('data-code', $(this).attr('data-code'));
            if (ele.find('.val_id').attr('id') == 'unit_id') {
                if ($(this).text() == '--请选择--') {
                    ele.parents('.el-form-item').find('.errorMessage').html('请选择单位');
                } else {
                    ele.parents('.el-form-item').find('.errorMessage').html('');
                }
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });


    //添加和编辑的提交
    $('body').on('click', '.formDevice:not(".disabled") .submit', function (e) {
        e.stopPropagation();
        if (!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addDevice_from'),
                id = parentForm.find('#itemId').val(),
                flag = parentForm.attr("data-flag");
            for (var type in validatorConfig) {
                validatorToolBox[validatorConfig[type]](type);
            }
            if (nameCorrect && codeCorrect) {
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var name = parentForm.find('#name').val().trim(),
                    datacode = parentForm.find('#parent_id').attr('data-code'),
                    code = datacode + parentForm.find('#code').val().trim(),
                    remark = parentForm.find('#remark').val().trim(),
                    template_id = parentForm.find('#template_id').val(),
                    parent_id = parentForm.find('#parent_id').val() || 0;
                $(this).hasClass('edit') ? (
                    editDeviceType({
                        id: id,
                        // template_id:template_id,
                        name: name,
                        sort: "",
                        parent_id: parent_id,
                        code: code,
                        remark: remark,
                        _token: TOKEN
                    })
                ) : (
                    addDeviceType({
                        name: name,
                        code: code,
                        sort: "",
                        parent_id: parent_id,
                        remark: remark,
                        _token: TOKEN
                    })
                )
            }
        }
    });
    //输入框的相关事件
    $('body').on('focus', '.formDevice:not(".disabled") .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.formDevice:not(".disabled") .el-input:not([readonly])', function () {
        var flag = $('#addDevice_from').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
    });
    //添加物料分类
    $('.button_add').on('click', function () {
        nameCorrect = !1;
        codeCorrect = !1;
        getdeviceTypes(0, 'add');
    });
    //树形表格展开收缩
    $('body').on('click', '.treeNode .itemIcon', function () {
        if ($(this).parents('.treeNode').hasClass('collasped')) {
            $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
            showChildren($(this).parents('.treeNode').attr("data-id"));
        } else {
            $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
            hideChildren($(this).parents('.treeNode').attr("data-id"));
        }
    });
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);

    });
}

//查看和添加和编辑模态框
    function Modal(flag, deviceType, data) {
        var {id = '', code = '', name = '', remark = '', parent_id = ''} = {};
        if (data) {
            ({id='', code='', name='', remark ='', parent_id =''} = data);
        }
        var labelWidth = 100,
            btnShow = 'btnShow',
            title = '查看设备类型',
            textareaplaceholder = '',
            readonly = '',
            noEdit = '',
            selecthtml = selectHtml(deviceType, flag, parent_id);
        flag === 'view' ? (btnShow = 'btnHide', readonly = 'readonly="readonly"') : (textareaplaceholder = '请输入描述，最多只能输入500字符', flag === 'add' ? title = '添加设备类型' : (title = '编辑设备类型', textareaplaceholder = '', noEdit = 'readonly="readonly"'));

        layerModal = layer.open({
            type: 1,
            title: title,
            offset: '100px',
            area: '500px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            move: false,
            content: `<form class="addMGroup formModal formDevice" id="addDevice_from" data-flag="${flag}">
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
                <input type="text" id="code" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="编码由1-10个大写字母组成" value="${code}">
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
                <textarea type="textarea" ${readonly} maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="${textareaplaceholder}">${remark}</textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>`,
            success: function (layero, index) {
                getLayerSelectPosition($(layero));
            },
            end: function () {
                $('.uniquetable tr.active').removeClass('active');
            }
        });
    }


//生成上级分类数据
    function selectHtml(fileData, flag, value) {
        var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
        if (fileData.length) {
            parent_id = fileData[0].parent_id;
            lis = treeHtml(fileData, parent_id, 'select', value);
        }
        itemSelect.length ? (selectVal = itemSelect[0].name, parent_id = itemSelect[0].id) :
            (flag == 'view' || flag == 'edit' ? (selectVal = '无', parent_id = 0) : (selectVal = '--请选择--', parent_id = 0));
        if (flag === 'view' || flag === 'edit') {
            innerhtml = `<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
        } else {
            innerhtml = `<div class="el-select">
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
        elSelect = `<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
        itemSelect = [];
        return elSelect;
    }



//生成树结构
    function treeHtml(fileData, parent_id, flag, value) {

        var _html = '';
        var children = getChildById(fileData, parent_id);
        var hideChild = parent_id > 0 ? 'none' : '';
        children.forEach(function (item, index) {
            var lastClass = index === children.length - 1 ? 'last-tag' : '';
            var level = item.level;
            var distance, className, itemImageClass, tagI, itemcode = '';
            var hasChild = hasChilds(fileData, item.id);
            hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
            flag === 'table' ? (distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`, itemcode = `(${item.code})`) : (distance = level * 20, tagI = '', itemcode = '');
            var selectedClass = '';
            var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>` : `${tagI}<span>${item.name}</span> ${itemcode}`;
            if (flag === 'table') {
                _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td><div>${item.remark.length > 30 ? item.remark.substring(0, 30) + '...' : item.remark}</div></td>
	          <td class="right">
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
            } else {
                if (flag == 'template') {
                    item.id == value ? (tempSelect.push(item), selectedClass = 'selected') : null;
                } else {
                    item.id == value ? (itemSelect.push(item), selectedClass = 'selected') : null;
                }

                _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id, flag, value)}
	        `;
            }
        });
        return _html;
    };



