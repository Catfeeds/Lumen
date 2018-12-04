var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    categoryList={},
    codeCorrect=!1, unitCorrect=!1,
    nameCorrect=!1,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"选型不能为空"),nameCorrect=!1,!1):
                    Validate.checkNot0(value)? (showInvalidMessage(name,"选型不能为0"),nameCorrect=!1,!1):(nameCorrect=1,!0);
        },
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编号不能为空"),codeCorrect=!1,!1):
                    !Validate.checkUpperCase(value)?(showInvalidMessage(name,"编码由1-10位大写字母组成"),codeCorrect=!1,!1):(codeCorrect=1,!0);
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
    },
    validatorConfig = {
        name: "checkName",
        code: "checkCode"
    },remoteValidatorConfig={
        name: "remoteCheckName",
        code: "remoteCheckCode"
    };
$(function(){
    resetParam();
    getCategory();
    getOtherOption();
    bindEvent();

    // typeList();

});
//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addOtherOption_from').find('.submit').removeClass('is-disabled');
}
//重置搜索参数
function resetParam(){
    ajaxData={
        category_id: '',
        category_code: ''
    };
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
        url: URLS['otherOption'].unique+"?"+_token+urlLeft,
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
            getOtherOption();
        }
    });
};

//获取异常单列表
function getOtherOption(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['otherOption'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',10);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取物料列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}
//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.option_id}">
                <td>${item.option_name}</td>
                <td>${item.option_code}</td>
                <td>${tansferNull(categoryList[item.option_category_id])}</td>
                <td>${item.option_remark}</td> 
                <td class="right">
                <button data-id="${item.option_id}" class="button pop-button view">查看</button>
                <button data-id="${item.option_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.option_id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};
function bindEvent(){
    //点击弹框内部关闭dropdown
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
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    //输入框的相关事件
    $('body').on('focus', '.formOtherOption:not(".disabled") .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.formOtherOption:not(".disabled") .el-input:not([readonly])', function () {
        var flag = $('#addOtherOption_from').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
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
            pageNo=1;
            ajaxData={
                category_code: encodeURIComponent(parentForm.find('#option_code').val().trim()),
                category_id: parentForm.find('#category').val().trim()
            }
            getOtherOption();
        }
    });
    $('body').on('click','#searchForm .el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });
    $('body').on('click','.el-select-dropdown-item',function(e){
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

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#option_code').val('');
        parentForm.find('#category').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getOtherOption();
    });
    //添加
    $('.button_check').on('click',function(){
        Modal('add');

    });
    $('.table_tbody').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewOtherOption($(this).attr("data-id"),'view');
    });
    $('.table_tbody').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewOtherOption($(this).attr("data-id"),'edit');
    });
    $('.table_tbody').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteOtherOption(id);
        });
    });
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);

    });

    //弹窗下拉
    $('body').on('click','.formOtherOption:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.formOtherOption:not(".disabled") .el-select-dropdown-item',function(e){
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

// //检验单下拉筛选
//     $('body').on('click','.search-span',function () {
//         var code = $('#searchVal').val();
//         var ele=$(this).siblings('.el-input');
//         getSearchCode(ele,code);
//     });
    //添加和编辑的提交
    $('body').on('click','.formOtherOption:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addOtherOption_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            // $(this).addClass('is-disabled');
            // parentForm.addClass('disabled');
            var category=parentForm.find('#category').val().trim(),
                name=parentForm.find('#name').val().trim(),
                code=parentForm.find('#code').val().trim(),
                remark=parentForm.find('#remark').val();
            for (var type in validatorConfig) {
                validatorToolBox[validatorConfig[type]](type);
            }
            if(category){
                if (nameCorrect && codeCorrect){

                    $(this).hasClass('edit')?(
                        editOtherOption({
                            id:id,
                            category_id:category,
                            name:name,
                            code:code,
                            sort:"",
                            remark:remark,
                            _token:TOKEN
                        })

                    ):(
                        addOtherOption({
                            category_id:category,
                            name:name,
                            code:code,
                            sort:"",
                            remark:remark,
                            _token:TOKEN
                        })

                    )
                }
            }else {
                $(this).removeClass('is-disabled');
                parentForm.removeClass('disabled');
                // layer.confirm('类型不能为空！', {icon: 3, title:'提示',offset: '250px',end:function(){
                //
                // }}, function(index){
                //     layer.close(index);
                // });
            }



        }
    });
};

function deleteOtherOption(id) {

    AjaxClient.get({
        url: URLS['otherOption'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getOtherOption();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getOtherOption();
            }
        }
    },this);
}

//查看其他选型
function viewOtherOption(id,flag){
    AjaxClient.get({
        url: URLS['otherOption'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Modal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该选型失败');
            if(rsp.code==404){
                getOtherOption();
            }
        }
    },this);
}

function editOtherOption(data) {
    AjaxClient.post({
        url: URLS['otherOption'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getOtherOption();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addOtherOption_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
function addOtherOption(data) {
    AjaxClient.post({
        url: URLS['otherOption'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getOtherOption();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addOtherOption_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}

function getCategory() {

    AjaxClient.get({
        url:URLS['otherOption'].allshow+"?"+_token,
        dataType:'json',
        beforeSend:function () {
            layerLoading =  LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            categoryList=rsp.results;
            var typelis='';
            typelis=selectHtml(0,'selete');
            $('.el-form-item.type').find('.el-select-dropdown-wrap').html(typelis);
        },
        fail:function (rsp) {
            layer.close(layerLoading) ;
            layer.msg('获取类别失败', {icon: 5,offset: '250px',time: 1500});

        }
    },this);
}




function Modal(flag,data){
    var {option_id='',option_name='',option_code='',option_category_id='',option_remark=''}={};
    if(data){
        ({option_id='',option_name='',option_code='',option_category_id='',option_remark=''}=data);
    }

    var labelWidth=50,
        btnShow='btnShow',
        title='查看选型',


        textareaplaceholder='',
        readonly='',
        typeHtml=selectHtml(option_category_id,flag),
        noEdit='';
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加选型':(title='编辑选型',textareaplaceholder='',noEdit='readonly="readonly"'));


    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form style="padding: 30px;" class="formModal formOtherOption" id="addOtherOption_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${option_id}">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">选型<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} ${noEdit} data-name="选型" class="el-input" placeholder="请输入选型" value="${option_name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">编号<span class="mustItem">*</span></label>
                <input type="text" id="code" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="请输入编号" value="${option_code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">类型<span class="mustItem">*</span></label>
                ${typeHtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                <textarea type="textarea" ${readonly} maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="">${option_remark}</textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>

          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};

function selectHtml(id,flag) {
    var elSelect,innerhtml,lis='';

    for(var item in categoryList){
        lis+= `
    		<li data-id="${item}"  class="el-select-dropdown-item ">${categoryList[item]}</li>
	        `;
    }
    if(flag==='view'||flag==='edit'){
        innerhtml=`<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${categoryList[id]}">
			<input type="hidden" class="val_id" data-code="" id="category" value="${id}">
		</div>`;
    }else {
        innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="category" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="" data-pid="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }

    elSelect=`<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    return elSelect;
}

