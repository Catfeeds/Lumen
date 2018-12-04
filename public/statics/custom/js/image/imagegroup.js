var layerModal,
layerLoading,
pageNo=1,
pageSize=20,
ajaxData = {
    sort: 'ctime',
    order: 'desc'
},
validatorToolBox={
    checkCode: function (name) {
        var value = $('#addImageGroup').find('#'+name).val().trim();
        return $('#addImageGroup').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        !Validate.checkImgCode(value)?(showInvalidMessage(name,"由1-20位字母、数字、下划线组成"),!1):(!0);
    },
    checkName:function (name) {
        var value = $('#addImageGroup').find('#'+name).val().trim();
        return $('#addImageGroup').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"分组名称必填"),!1):(!0);
    },
    checkCate: function(name){
        var value = $('#addImageGroup').find('#'+name).val();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
          Validate.checkNull(value)?(showInvalidMessage(name,"请选择图纸分类"),!1):(!0)
    }
},
remoteValidatorToolbox={
    remoteCheck: function(name,flag,id){
        var value=$('#addImageGroup').find('#'+name).val().trim();
        getUnique(flag,name,value,id,function(rsp){
            if(rsp.results&&rsp.results.exist){
                var val='已注册';
                showInvalidMessage(name,val);
            }
        });
    }
},
validatorConfig = {
    type_id: 'checkCate',
    code: 'checkCode',
    name:'checkName'
},
remoteValidatorConfig = {
    code: 'remoteCheck',
    name: 'remoteCheck'
};

$(function () {
    resetParam();
    getCategoryList();
    imgGroupList();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val) {
    $('#addImageGroup').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addImageGroup').find('.submit').removeClass('is-disabled');
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        code: '',
        type_id: '',
        name: '',
        creator_name: '',
        sort: 'ctime',
        order: 'desc'
    }
}

//分页
function bindPagenationClick(total,size) {
    $('#pagenation').show();
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
            imgGroupList();
        }
    });
}

//获取图纸分组数据
function imgGroupList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['group'].list+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            $('.table_tbody').html('');
            var pageTotal = rsp.paging.total_records;
            if(pageTotal>pageSize){
                bindPagenationClick(pageTotal,pageSize);
            }else{
                $('#pagenation').html('');
            }
            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',6);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取图纸分组列表失败，请刷新重试',6);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    })
}

function createHtml(ele,data) {
    data.forEach(function (item,index) {
        var tr = ` <tr data-id="${item.imageGroup_id}">
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${tansferNull(item.type_name)}</td>
                    <td>${tansferNull(item.creator_name)}</td>
                    <td>${item.ctime}</td>
                    <td class="right nowrap">
                        <button class="button pop-button view" data-id="${item.imageGroup_id}">查看</button>
                        <button class="button pop-button edit" data-id="${item.imageGroup_id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.imageGroup_id}">删除</button>
                    </td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })
}

//获取图纸分类数据
function getCategory(val) {
  AjaxClient.get({
    url: URLS['groupType'].select+"?"+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      var lis='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
      if(rsp.results && rsp.results.length){
        rsp.results.forEach(function (item) {
          lis+=`<li data-id="${item.image_group_type_id}" class=" el-select-dropdown-item">${item.name}</li>`;
        });
      }else{
        console.log('暂无数据');
      }
      $('#addImageGroup .el-select-dropdown-list').html(lis);
      if(val){
        $('#addImageGroup .el-select-dropdown-list').find('.el-select-dropdown-item[data-name='+val+']').click();
      }

    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸分类数据失败');
    }
  })
}

//获取图纸分类数据
function getCategoryList() {
  AjaxClient.get({
    url: URLS['groupType'].select+"?"+_token,
    dataType: 'json',
    beforeSend: function(){
      // layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      // layer.close(layerLoading);
      var lis='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
      if(rsp.results && rsp.results.length){
        rsp.results.forEach(function (item) {
          lis+=`<li data-id="${item.image_group_type_id}" class=" el-select-dropdown-item">${item.name}</li>`;
        });
      }else{
        console.log('暂无数据');
      }
      $('.el-form-item.category .el-select-dropdown-list').html(lis);
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸分类数据失败');
    }
  })
}

//图纸分组添加
function addImageGroup(data) {
    AjaxClient.post({
        url: URLS['group'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            imgGroupList();
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.field!==undefined&&rsp.message){
                showInvalidMessage(rsp.field,rsp.message);
            }else{
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }else{
                    LayerConfig('fail','添加失败');
                }
            }
            $('#addImgGroup').find('.submit').removeClass('is-disabled');
        }
    },this);
}

//图纸分组查看
function viewImageGroup(id,flag) {
    AjaxClient.get({
        url:URLS['group'].show+'?'+_token+'&imageGroup_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            imgGroupModal(flag,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp.code==404){
                imgGroupList();
            }
        }
    },this);
}

//图纸分组删除
function deleteImageGroup(id,leftNum) {
    AjaxClient.get({
        url: URLS['group'].delete+"?"+_token+"&imageGroup_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功啦');
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            imgGroupList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                pageNo? null:pageNo=1;
                imgGroupList();
            }
        }
    },this);
}

//图纸分组编辑
function editImageGroup(data) {
    AjaxClient.post({
        url: URLS['group'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            imgGroupList();
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.field!==undefined&&rsp.message){
                showInvalidMessage(rsp.field,rsp.message);
            }else{
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }else{
                    LayerConfig('fail','编辑失败');
                }
            }
            $('#addImageGroup').find('.submit').removeClass('is-disabled');
        }
    },this);
}

//检测唯一性
function getUnique(flag,field,value,id,fn){
    var urlLeft='',urlname='';
    if(field=='name'){
      var correct=validatorConfig['type_id']&&validatorToolBox[validatorConfig['type_id']]('type_id');
      if(!correct){
          return;
      }
      console.log($('#addImageGroup #type_id').val());
      urlname='&type_id='+$('#addImageGroup #type_id').val();
    }
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}${urlname}`;
    }else{
        urlLeft=`&field=${field}&value=${value}${urlname}`;
    }
    AjaxClient.get({
        url: URLS['group'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}

function imgGroupModal(flag,data) {
    var {imageGroup_id='',type_name='',type_id=0,code='',name='',description=''} = {};
    if(data){
        ({imageGroup_id='',type_name='',type_id=0,code='',name='',description=''}=data);
    }
    var labelWidth=80,
        btnShow='btnShow',
        title = "查看图纸分组",
        placeholder="请输入描述，最多能输入500个字符";

    flag=='view' ? (btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加图纸分组' : (title = '编辑图纸分组'));

    layerModal=layer.open({
        type: 1,
        title: title ,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="addImageGroup formModal formMateriel" id="addImageGroup" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${imageGroup_id}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">关联分类<span class="mustItem">*</span></label>
                            ${flag!='add' ? `<input type="text" readonly="readonly" class="el-input" value="${type_name}">
                            <input type="hidden" class="val_id" id="type_id" value="${type_id}">` : 
                            `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="type_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                    </ul>
                                </div>
                            </div>`}
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" value="${code}" autocomplete="off" class="el-input" placeholder="由1-20位字母、数字、下划线组成">
                        </div>
                        <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" value="${name}" autocomplete="off" class="el-input" placeholder="请输入名称">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述aaaa</label>
                            <textarea type="textarea" maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${description}</textarea>
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
            getCategory();
            getLayerSelectPosition($(layero));
            if(flag=='view'){
                $('#addImageGroup .el-input,#addImageGroup .el-textarea').attr('readonly','readonly');
            }else if(flag=='edit'){
                $('#addImageGroup #code').attr('readonly','readonly');
            }
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}

function bindEvent() {
    $('body').on('click','.formMateriel:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item:not(disabled)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        if(ele.parents('#addImageGroup').length){
          var correct=validatorConfig['type_id']&&validatorToolBox[validatorConfig['type_id']]('type_id');
          if(correct){
              ele.parents('.el-form-item-div').siblings('.errorMessage').html('').removeClass('active');
          }
        }
        $(this).parents('.el-select-dropdown').hide();
    });
    //图纸分组 添加
    $('.button_add').on('click',function () {
        imgGroupModal('add');
    })

    //图纸分组 添加提交
    $('body').on('click','#addImageGroup .submit',function (e) {
        e.stopPropagation();
        var parentForm=$(this).parents('#addImageGroup'),
            flag=parentForm.attr("data-flag");
        var correct=1;
        for (var type in validatorConfig) {
            correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
            if(!correct){
                break;
            }
        }
        if (correct){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                var id=parentForm.find('#itemId').val(),
                    type_id = parentForm.find('#type_id').val()||0,
                    code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    description = parentForm.find('#description').val().trim();
                $(this).hasClass('edit')?(
                    editImageGroup({
                        type_id: type_id,
                        code: code,
                        name: name,
                        description: description,
                        imageGroup_id: id,
                        _token:TOKEN
                    })
                ) :(
                    addImageGroup({
                        type_id: type_id,
                        code: code,
                        name: name,
                        description: description,
                        _token:TOKEN
                    })
                )
            }
        }
    })
    
    //图纸分组查看
    $('.uniquetable').on('click','.view',function () {
        $(this).parents('tr').addClass('active');
        viewImageGroup($(this).attr("data-id"),'view')
    });

    //图纸分组 编辑
    $('.uniquetable').on('click','.edit',function () {
        $(this).parents('tr').addClass('active');
        viewImageGroup($(this).attr("data-id"),'edit')
    });

    //删除分组
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#image_group_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteImageGroup(id,num);
        });
    });
    
    //搜索
    $('body').on('click','#searchForm .submit',function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchForm');
            ajaxData.type_id=parentForm.find('#type_id').val().trim();
            ajaxData.code=parentForm.find('#code').val().trim();
            ajaxData.name=encodeURIComponent(parentForm.find('#name').val().trim());
            ajaxData.creator_name=encodeURIComponent(parentForm.find('#creator_name').val().trim());
            pageNo=1;
            imgGroupList();
        }
    })

    //搜索重置
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm = $(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#name').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#type_id').val('').siblings('.el-input').val('--请选择--');
        resetParam();
        pageNo=1;
        imgGroupList();
    });

    //更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
          $('#searchForm .el-item-show').css('background','#e2eff7');
          $('#searchForm .el-item-hide').slideDown(400,function(){
            that.removeClass('noclick');
          });
        }else{
          $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
            that.removeClass('noclick');
          });
        }
    });

    //输入框的相关事件
    $('body').on('focus','.formMateriel .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel .el-input:not([readonly])',function(){
        var flag=$('#addImageGroup').attr("data-flag"),
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

$('body').on('input','.el-item-show #code',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\-+={}|《》？：“”【】、；‘’，。、]/im,"");
})