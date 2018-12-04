var layerModal,
  layerLoading,
  pageNo=1,
  pageSize=20,
  ajaxData = {},
  validatorToolBox={
    checkCode: function (name) {
      var value = $('#addImageGroupType').find('#'+name).val().trim();
      return $('#addImageGroupType').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        !Validate.checkImgCode(value)?(showInvalidMessage(name,"由1-20位字母、数字、下划线组成"),!1):(!0);
    },
    checkName:function (name) {
      var value = $('#addImageGroupType').find('#'+name).val().trim();
      return $('#addImageGroupType').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"分类名称必填"),!1):(!0);
    }
  },
  remoteValidatorToolbox={
    remoteCheck: function(name,flag,id){
      var value=$('#addImageGroupType').find('#'+name).val().trim();
      getUnique(flag,name,value,id,function(rsp){
        if(rsp.results&&rsp.results.exist){
          var val='已注册';
          showInvalidMessage(name,val);
        }
      });
    }
  },
  validatorConfig = {
    code: 'checkCode',
    name:'checkName'
  },
  remoteValidatorConfig = {
    code: 'remoteCheck',
    name: 'remoteCheck'
  };

$(function () {
  resetParam();
  imgGroupTypeList();
  bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val) {
  $('#addImageGroupType').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
  $('#addImageGroupType').find('.submit').removeClass('is-disabled');
}

//重置搜索参数
function resetParam() {
  ajaxData = {
    name: '',
    code: ''
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
      imgGroupTypeList();
    }
  });
}

//获取图纸分类数据
function imgGroupTypeList(){
  var urlLeft='';
  for(var param in ajaxData){
    urlLeft+=`&${param}=${ajaxData[param]}`;
  }
  urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['groupType'].list+"?"+_token+urlLeft,
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
        noData('暂无数据',5);
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      noData('获取图纸分类列表失败，请刷新重试',5);
    },
    complete: function(){
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  })
}

function createHtml(ele,data) {
  data.forEach(function (item,index) {
    var tr = ` <tr data-id="${item.image_group_type_id}">
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${tansferNull(item.user_name)}</td>
                    <td>${item.ctime}</td>
                    <td class="right nowrap">
                        <button class="button pop-button view" data-id="${item.image_group_type_id}">查看</button>
                        <button class="button pop-button edit" data-id="${item.image_group_type_id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.image_group_type_id}">删除</button>
                    </td>
                </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}

//图纸分类添加
function addImageGroupType(data) {
  AjaxClient.post({
    url: URLS['groupType'].store,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      layer.close(layerModal);
      imgGroupTypeList();
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
      $('#addimgGroupType').find('.submit').removeClass('is-disabled');
    }
  },this);
}

//图纸分类查看
function viewImageGroupType(id,flag) {
  AjaxClient.get({
    url:URLS['groupType'].show+'?'+_token+'&image_group_type_id='+id,
    dataType: 'json',
    beforeSend:function () {
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      imgGroupTypeModal(flag,rsp.results)
    },
    fail:function (rsp) {
      layer.close(layerLoading);
      if(rsp.code==404){
        imgGroupTypeList();
      }
    }
  },this);
}

//图纸分类删除
function deleteImageGroupType(id,leftNum) {
  AjaxClient.get({
    url: URLS['groupType'].delete+"?"+_token+"&image_group_type_id="+id,
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
      imgGroupTypeList();
    },
    fail: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.message!=undefined&&rsp.message!=null){
        LayerConfig('fail',rsp.message);
      }
      if(rsp&&rsp.code==404){
        pageNo? null:pageNo=1;
        imgGroupTypeList();
      }
    }
  },this);
}

//图纸分组编辑
function editImageGroupType(data) {
  AjaxClient.post({
    url: URLS['groupType'].update,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      layer.close(layerModal);
      imgGroupTypeList();
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
      $('#addImageGroupType').find('.submit').removeClass('is-disabled');
    }
  },this);
}

//检测唯一性
function getUnique(flag,field,value,id,fn){
  var urlLeft='';
  if(flag==='edit'){
    urlLeft=`&field=${field}&value=${value}&id=${id}`;
  }else{
    urlLeft=`&field=${field}&value=${value}`;
  }
  AjaxClient.get({
    url: URLS['groupType'].unique+"?"+_token+urlLeft,
    dataType: 'json',
    success: function(rsp){
      fn && typeof fn==='function'? fn(rsp):null;
    },
    fail: function(rsp){
      console.log('唯一性检测失败');
    }
  },this);
}

function imgGroupTypeModal(flag,data) {
  var {image_group_type_id='',code='',name='',description=''} = {};
  if(data){
    ({image_group_type_id='',code='',name='',description=''}=data);
  }
  var labelWidth=70,
    btnShow='btnShow',
    title = "查看图纸分类",
    placeholder="请输入描述，最多能输入500个字符";

  flag=='view' ? (btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加图纸分类' : (title = '编辑图纸分类'));

  layerModal=layer.open({
    type: 1,
    title: title ,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: true,
    resize: false,
    move: false,
    content: `<form class="addImageGroupType formModal formMateriel" id="addImageGroupType" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${image_group_type_id}">
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
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
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
      if(flag=='view'){
        $('#addImageGroupType .el-input,#addImageGroupType .el-textarea').attr('readonly','readonly');
      }else if(flag=='edit'){
        $('#addImageGroupType #code').attr('readonly','readonly');
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
  //图纸分类 添加
  $('.button_add').on('click',function () {
    imgGroupTypeModal('add');
  })

  //图纸分类 添加提交
  $('body').on('click','#addImageGroupType .submit',function (e) {
    e.stopPropagation();
    var parentForm=$(this).parents('#addImageGroupType'),
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
          code = parentForm.find('#code').val().trim(),
          name = parentForm.find('#name').val().trim(),
          description = parentForm.find('#description').val().trim();
        $(this).hasClass('edit')?(
          editImageGroupType({
            code: code,
            name: name,
            description: description,
            image_group_type_id: id,
            _token:TOKEN
          })
        ) :(
          addImageGroupType({
            code: code,
            name: name,
            description: description,
            _token:TOKEN
          })
        )
      }
    }
  })

  //图纸分类查看
  $('.uniquetable').on('click','.view',function () {
    $(this).parents('tr').addClass('active');
    viewImageGroupType($(this).attr("data-id"),'view')
  });

  //图纸分类 编辑
  $('.uniquetable').on('click','.edit',function () {
    $(this).parents('tr').addClass('active');
    viewImageGroupType($(this).attr("data-id"),'edit')
  });

  //删除分类
  $('.uniquetable').on('click','.delete',function(){
    var id=$(this).attr("data-id");
    var num=$('#image_group_table .table_tbody tr').length;
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
      $('.uniquetable tr.active').removeClass('active');
    }}, function(index){
      layer.close(index);
      deleteImageGroupType(id,num);
    });
  });

  //搜索
  $('body').on('click','#searchForm .submit',function (e) {
    e.stopPropagation();
    if(!$(this).hasClass('is-disabled')){
      $(this).addClass('is-disabled');
      var parentForm = $(this).parents('#searchForm');
      ajaxData.code=parentForm.find('#code').val().trim();
      ajaxData.name=encodeURIComponent(parentForm.find('#name').val().trim());
      pageNo=1;
      imgGroupTypeList();
    }
  })

  //搜索重置
  $('body').on('click','#searchForm .reset:not(.is-disabled)',function (e) {
    e.stopPropagation();
    $(this).addClass('is-disabled');
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#code').val('');
    parentForm.find('#name').val('');
    resetParam();
    pageNo=1;
    imgGroupTypeList();
  });

  //输入框的相关事件
  $('body').on('focus','.formMateriel .el-input:not([readonly])',function(){
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur','.formMateriel .el-input:not([readonly])',function(){
    var flag=$('#addImageGroupType').attr("data-flag"),
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