var layerModal,
  layerLoading,
  pageNo=1,
  pageSize=20,
  groupTypeIds=[],
  ajaxData = {
    sort: 'ctime',
    order: 'asc'
  },
  validatorToolBox={
    checkName:function (name) {
      var value = $('#addimgAttr').find('#'+name).val().trim();
      return $('#addimgAttr').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),!1):(!0)
    },
    checkCate: function(name){
      var value = $('#addimgAttr').find('#'+name).val();
      return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
          Validate.checkNull(value)?(showInvalidMessage(name,"请选择图纸来源"),!1): (!0)
    }
  },
  remoteValidatorToolbox={
    remoteCheckName: function(name,flag,id){
      var value=$('#addimgAttr').find('#'+name).val().trim();
      var cate_id = $('#addimgAttr').find('#cate').val();
      getUnique(flag,name,value,id,cate_id,function(rsp){
        if(rsp.results&&rsp.results.exist){
          var val='已注册';
          showInvalidMessage(name,val);
        }
      });
    }
  },
  validatorConfig = {
    name:'checkName',
    cate: 'checkCate'
  },
  remoteValidatorConfig = {
    name: 'remoteCheckName',
    // owner: 'remoteCheckName'
  };

$(function () {
  resetParam();
  getImageCategory();
  imgAttrList();
  bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val) {
  $('#addimgAttr').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
  $('#addimgAttr').find('.submit').removeClass('is-disabled');
}

//重置搜索参数
function resetParam() {
  ajaxData = {
    sort: 'ctime',
    order: 'asc'
  }
}
function getImageCategory() {
  AjaxClient.get({
    url: URLS['category'].select+"?"+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      var lis='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
      if(rsp.results && rsp.results.length){
        rsp.results.forEach(function (item) {
          lis+=`<li data-id="${item.imageCategory_id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;
        });
      }else{
        console.log('暂无数据');
      }
      $('#searchImgGroup_from .el-select-dropdown-list').html(lis);

    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸分类数据失败');
    }
  })
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
      imgAttrList();
    }
  });
}

//获取图纸属性数据
function imgAttrList(){
  var urlLeft='';
  for(var param in ajaxData){
    urlLeft+=`&${param}=${ajaxData[param]}`;
  }
  urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['attr'].list+"?"+_token+urlLeft,
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
        noData('暂无数据',6);
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      noData('获取图纸属性列表失败，请刷新重试',6);
    },
    complete: function(){
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  })
}

//获取图纸来源数据
function getCategory(val) {
  AjaxClient.get({
    url: URLS['category'].select+"?"+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      var lis='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
      if(rsp.results && rsp.results.length){
        rsp.results.forEach(function (item) {
          lis+=`<li data-id="${item.imageCategory_id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;
        });
      }else{
        console.log('暂无数据');
      }
      $('#addimgAttr .el-select-dropdown-list').html(lis);

      if(val){
        $('#addimgAttr .el-form-item.source .el-select-dropdown-list').find('.el-select-dropdown-item[data-name='+val+']').click();
      }

    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸来源数据失败');
    }
  })
}

function createHtml(ele,data) {
  data.forEach(function (item,index) {
    var groupType=[];
    if(item.groupTypeArr.length){
        item.groupTypeArr.forEach(function(i){
            groupType.push(i.group_type_name);
        })
    }
    var tr = ` <tr data-id="${item.attribute_definition_id}">
                    <td>${item.definition_name}</td>
                    <td>${item.category_name}</td>
                    <td><div class="word_wrap">${groupType.join(',')}</div></td>
                    <td>${tansferNull(item.user_name)}</td>
                    <td>${item.ctime}</td>
                    <td class="right nowrap">
                        <button class="button pop-button view" data-id="${item.attribute_definition_id}">查看</button>
                        <button class="button pop-button edit" data-id="${item.attribute_definition_id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.attribute_definition_id}">删除</button>
                    </td>
                </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}

//图纸属性添加
function addimgAttr(data) {
  AjaxClient.post({
    url: URLS['attr'].store,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      layer.close(layerModal);
      imgAttrList();
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

//图纸属性查看
function viewimgAttr(id,flag) {
  AjaxClient.get({
    url:URLS['attr'].show+'?'+_token+'&attribute_definition_id='+id,
    dataType: 'json',
    beforeSend:function () {
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      imgAttrModal(flag,id,rsp.results)
    },
    fail:function (rsp) {
      layer.close(layerLoading);
      if(rsp.code==404){
        imgAttrList();
      }
    }
  },this);
}

//图纸属性删除
function deleteimgAttr(id,leftNum) {
  AjaxClient.get({
    url: URLS['attr'].delete+"?"+_token+"&attribute_definition_id="+id,
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
      imgAttrList();
    },
    fail: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.message!=undefined&&rsp.message!=null){
        LayerConfig('fail',rsp.message);
      }
      if(rsp&&rsp.code==404){
        pageNo? null:pageNo=1;
        imgAttrList();
      }
    }
  },this);
}

//图纸属性编辑
function editimgAttr(data) {
  AjaxClient.post({
    url: URLS['attr'].update,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      layer.close(layerModal);
      imgAttrList();
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
      $('#addimgAttr').find('.submit').removeClass('is-disabled');
    }
  },this);
}

function addTag(obj) {
    var tag = obj.val();
    if (tag != '') {
        var i = 0;
        $(".tag").each(function() {
            var _this = $(this);
            if ($(this).text() == tag + "×") {
                $(this).addClass("tag-warning");
                setTimeout(function () {
                    _this.removeClass('tag-warning')
                }, 400);
                i++;
            }
        });
        obj.val('');
        if (i > 0) { //说明有重复
            return false;
        }
        $("#form-field-tags").before("<span class='tag'><i>" + tag + "</i><button class='close tag-close' type='button'>×</button></span>"); //添加标签
    }
}

//图纸分类
function getGroupTypeSource(val,flag){
    AjaxClient.get({
        url: URLS['groupType'].select+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results && rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function (item,index) {
                    lis+=`<li data-id="${item.image_group_type_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                })
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong proceDisabled">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.groupTypeSelect').find('.el-select-dropdown-list').html(innerhtml);

                if(val.length){
                    val.forEach(function (item) {
                        $('.el-form-item.groupTypeSelect .el-select-dropdown-item[data-id='+item.group_type_id+']').click();
                    })
                }

                flag=='view' ? $('.proceTipDel').hide() :'';

            }
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    })
}

//检测唯一性
function getUnique(flag,field,value,id,cate_id,fn){
  var urlLeft='';
  if(flag==='edit'){
    urlLeft=`&field=${field}&value=${value}&id=${id}&category_id=${cate_id}`;
  }else{
    urlLeft=`&field=${field}&value=${value}&category_id=${cate_id}`;
  }
  var xhr=AjaxClient.get({
    url: URLS['attr'].unique+"?"+_token+urlLeft,
    dataType: 'json',
    success: function(rsp){
      fn && typeof fn==='function'? fn(rsp):null;
    },
    fail: function(rsp){
      console.log('唯一性检测失败');
    }
  },this);
}

function imgAttrModal(flag,ids,data) {
  var {attribute_definition_id='',definition_name='',category_name='',group_type=[]} = {};
  if(data){
    ({attribute_definition_id='',definition_name='',category_name='',group_type=[]}=data);
  }
  var labelWidth=100,
    btnShow='btnShow',
    title = "查看图纸属性",
    readonly='';

  flag=='view' ? (btnShow='btnHide',readonly='readonly'):(flag == 'add' ? title = '添加图纸属性' : (title = '编辑图纸属性'));
  layerModal=layer.open({
    type: 1,
    title: title ,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<div class="addimgAttr formModal formMateriel" id="addimgAttr" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item source">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">关联来源<span class="mustItem">*</span></label>
                            ${flag!='add' ? `<input type="text" readonly="readonly" class="el-input" value="${category_name}">` : 
                            `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="cate" value="">
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
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">属性名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} value="${definition_name}" autocomplete="off" class="el-input" placeholder="请输入名称">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                    </div> 
                    <div class="el-form-item groupTypeSelect">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">图纸分类<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select ${flag=='view' ? 'group_type' :''}">
                                    <div class="selectValue groupType"></div>
                                    <input type="hidden" class="val_id" id="groupType" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                       
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="groupType errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
        </div>` ,
    success: function(layero,index){
      // if(flag=='view'){
      //   $('#addimgAttr .el-input,#addimgAttr .el-textarea').attr('readonly','readonly');
      //   $('#addimgAttr .el-radio-input').addClass('noedit');
      // }
      getLayerSelectPosition($(layero));
      getCategory(category_name);
      getGroupTypeSource(group_type,flag);
      console.log(group_type);
    },
    end: function(){
      $('.uniquetable tr.active').removeClass('active');
    }
  });
}

function bindEvent() {
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
  $('body').on('click','.formMateriel .cancle',function(e){
    e.stopPropagation();
    layer.close(layerModal);
  });

    //分类
    $('body').on('click','.el-form-item.groupTypeSelect .el-select-dropdown-item',function (e) {
        e.stopPropagation();

        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');

        var selectInput = $('.selectValue.groupType');

        if(!$(this).hasClass('proceDisabled')){
            var proId = $(this).attr('data-id'),proText = $(this).text();

            var tips = `<span class="proceTip groupType" data-id="${proId}">${proText}<i class="fa fa-close proceTipDel"></i></span>`;

            selectInput.append(tips);
            groupTypeIds.push({'id':proId});
            $('.groupTypeSelect .errorMessage').html('');

            $(this).addClass('proceDisabled');
        }
        $('.el-form-item.groupTypeSelect .proceTipDel').click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            var ids = $(this).parents('.proceTip').attr('data-id');
            $('.selectValue span').remove('.proceTip[data-id='+ids+']');

            $('.el-form-item.groupTypeSelect .el-select-dropdown-item[data-id='+ids+']').removeClass('proceDisabled');

            groupTypeIds.forEach(function (item,index) {
                if(item.id == ids){
                    groupTypeIds.splice(index,1);
                }
            })
        })
    });
  //图纸属性 添加
  $('.button_add').on('click',function () {
    imgAttrModal('add',0);
  })

  //图纸属性 添加提交
  $('body').on('click','#addimgAttr .submit',function (e) {
    e.stopPropagation();
    var parentForm=$(this).parents('#addimgAttr'),
      flag=parentForm.attr("data-flag");
      groupTypeTag=1;
    var correct=1;
    var _select = $('.selectValue.groupType .proceTip.groupType'),groupType_string=[],groupType_id=[];
    if(_select.length){
        groupTypeTag=1;
        $('.groupTypeSelect .errorMessage').html('');
        $(_select).each(function (k,v) {
            groupType_string.push($(v).text());
            groupType_id.push($(v).attr('data-id'))
        })
    }else{
        abilityTag=!1;
        $('.groupTypeSelect .errorMessage').html('请选择分类');
        groupType_string=[];
        groupType_id=[];
    }
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
          name = parentForm.find('#name').val().trim(),
          category_id = parentForm.find('#cate').val();
        $(this).hasClass('edit')?(
          editimgAttr({
            name: name,
            attribute_definition_id: id,
            group_type_str:groupType_id.join(','),
            _token:TOKEN
          })
        ) :(
          addimgAttr({
            name: name,
            category_id: category_id,
            group_type_str:groupType_id.join(','),
            _token:TOKEN
          })
        )
      }
    }
  });

    $('body').on('keydown','.tags_enter',function (e) {
        var key_code = e.keyCode;
        if(key_code == 13){
            addTag($(this))
        }
    }).on('blur','.tags_enter',function () {
        addTag($(this));
        $(this).parents(".tags").css({
            "border-color": "#d5d5d5"
        })
    })
    $('body').on("click", ".tag-close",function() {
        $(this).parent(".tag").remove();
    });

  //图纸属性查看
  $('.uniquetable').on('click','.view',function () {
    $(this).parents('tr').addClass('active');
    viewimgAttr($(this).attr("data-id"),'view')
  });

  //图纸属性 编辑
  $('.uniquetable').on('click','.edit',function () {
    $(this).parents('tr').addClass('active');
    viewimgAttr($(this).attr("data-id"),'edit')
  });

  //删除属性
  $('.uniquetable').on('click','.delete',function(){
    var id=$(this).attr("data-id");
    var num=$('#image_category_table .table_tbody tr').length;
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
      $('.uniquetable tr.active').removeClass('active');
    }}, function(index){
      layer.close(index);
      deleteimgAttr(id,num);
    });
  });

  $('body').on('click','.el-select:not(.noedit,.group_type)',function(){
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  //下拉列表项点击事件
  $('body').on('click','.el-form-item.source .el-select-dropdown-item:not(disabled)',function(e){
    e.stopPropagation();
    var ele=$(this).parents('.el-select-dropdown').siblings('.el-select'),formerVal=ele.find('.val_id').val();
    var idval=$(this).attr('data-id');
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    ele.find('.el-input').val($(this).text());
    ele.find('.val_id').val(idval);
    if(formerVal!=idval){
      if(ele.find('.val_id').attr('id')=='cate'){
        $('#addimgAttr #cate').parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
        var correct=validatorConfig['cate']
          && validatorToolBox[validatorConfig['cate']]
          && validatorToolBox[validatorConfig['cate']]('cate');
        if(correct){
          $('#addimgAttr #cate').parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
        }
      }
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //单选按钮点击事件
  $('body').on('click','.el-radio-input:not(.noedit)',function(e){
    $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
    $(this).addClass('is-radio-checked');
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
      ajaxData.name=encodeURIComponent(parentForm.find('#name').val().trim());
      ajaxData.category_id=parentForm.find('#m_cate').val();
      // ajaxData.owner=parentForm.find('#owner').val().trim();
      // ajaxData.has_attribute=parentForm.find('#has_attribute').val().trim()
      // ajaxData.creator_name=parentForm.find('#creator_name').val().trim();
      pageNo=1;
      imgAttrList();
    }
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

  //搜索重置
  $('body').on('click','#searchForm .reset:not(.is-disabled)',function (e) {
    e.stopPropagation();
    $(this).addClass('is-disabled');
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#name').val('');
    parentForm.find('#m_cate').val('');
    parentForm.find('#m_cate').val('').siblings('.el-input').val('--请选择--');
    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    resetParam();
    pageNo=1;
    imgAttrList();
  });

  //输入框的相关事件
  $('body').on('focus','.formMateriel .el-input:not([readonly])',function(){
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur','.formMateriel .el-input:not([readonly])',function(){
    var flag=$('#addimgAttr').attr("data-flag"),
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