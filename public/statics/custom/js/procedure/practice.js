var layerModal,layerLoading,
    nameCorrect=!1,
    codeCorrect=!1,
    pageNo=1,
    pageSize=15,
    ajaxData={};
    validatorToolBox={
      checkName: function(name){
        var value=$('#addPractice_form').find('#'+name).val().trim();
        return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
        !Validate.checkName(value)?(showInvalidMessage(name,"名称长度不能超出30位"),nameCorrect=!1,!1):
        (nameCorrect=1,!0);
      },
      checkCode:function (name) {
        var value=$('#addPractice_form').find('#'+name).val().trim();
        return Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
          !Validate.checkCustomerCode(value)?(showInvalidMessage(name,"编码由1-20位字母数字下划线组成"),codeCorrect=!1,!1):
            (codeCorrect=1,!0);
      }
    },
    remoteValidatorToolbox={
      remoteCheckCode: function(flag,name,id){
        var value=$('#addPractice_form').find('#'+name).val().trim();
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
        var value=$('#addPractice_form').find('#'+name).val().trim();
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
    },
    validatorConfig = {
      code:'checkCode',
      name:'checkName',

    },
    remoteValidatorConfig={
      code: "remoteCheckCode",
      name: "remoteCheckName",
    };

$(function () {
  getPracticeData();
  bindEvent()
});

//重置搜索参数
function resetParam(){
  ajaxData={
    code: '',
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
      getPracticeData();
    }
  });
}

function getUnique(flag,field,value,id,fn){
  var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&practice_field_id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
  var xhr=AjaxClient.get({
    url: URLS['practice'].unique+"?"+_token+urlLeft,
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
  $('.addPractice').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
  $('.addPractice').find('.submit').removeClass('is-disabled');
}

function getPracticeData(){
  $('.table_tbody').html(' ');
  var urlLeft='';
  for(var param in ajaxData){
    urlLeft+=`&${param}=${ajaxData[param]}`;
  }
  urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
  AjaxClient.get({
    url: URLS['practice'].list+'?'+_token+urlLeft,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      if(layerModal!=undefined){
        layer.close(layerModal);
      }
      var totalData=rsp.paging.total_records;
      if(rsp.results && rsp.results.length){
        createHtml($('.table_tbody'),rsp.results)
      }else{
        noData('暂无数据',9)
      }
      if(totalData>pageSize){
        bindPagenationClick(totalData,pageSize);
      }else{
        $('#pagenation').html('');
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      noData('获取列表失败，请刷新重试',4);
    },
    complete: function(){
      $('#searchForm .submit').removeClass('is-disabled');
    }
  })
}
function addPractice(data) {
  AjaxClient.post({
    url: URLS['practice'].store,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = layer.load(2, {shade: false,offset: '300px'});
    },
    success: function(rsp){
      layer.close(layerLoading);
      LayerConfig('updateSuccess','添加成功');
      layer.close(layerModal);
      getPracticeData();
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
function practiceDelete(id) {
  AjaxClient.get({
    url: URLS['practice'].delete+'?'+_token+"&"+"practice_field_id="+id,
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
      getPracticeData();
    },
    fail: function(rsp){
      layer.close(layerLoading);
      layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
    }
  },this);
}
function practiceView(id,flag) {
  console.log(id);
  AjaxClient.get({
    url: URLS['practice'].show+'?'+_token+"&"+"practice_field_id="+id,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      showPracticeModal(flag,[],rsp.results);
    },
    fail: function(rsp){
      layer.close(layerLoading);
      layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
    }
  },this);
}

function editPractice(data) {
  AjaxClient.post({
    url: URLS['practice'].update,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = layer.load(2, {shade: false,offset: '300px'});
    },
    success: function(rsp){
      layer.close(layerLoading);
      layer.close(layerModal);
      getPracticeData();
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
function createHtml(ele,data) {
  data.forEach(function (item,index) {
    var tr = ` <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right nowrap">
                        <button class="button pop-button view" data-id="${item.practice_field_id}">查看</button>
                        <button class="button pop-button edit" data-id="${item.practice_field_id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.practice_field_id}">删除</button>
                    </td>
                </tr>`;
    ele.append(tr);
  })
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
  getPracticeData();
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
      name: encodeURIComponent(parentForm.find('#name').val().trim()),
      order: 'desc',
      sort: 'id',
    }
    getPracticeData();
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
  getPracticeData();
});

// //更多搜索条件下拉
// $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
//   e.stopPropagation();
//   $(this).find('.el-icon').toggleClass('is-reverse');
//   var that=$(this);
//   that.addClass('noclick');
//   if($(this).find('.el-icon').hasClass('is-reverse')){
//     $('#searchForm .el-item-show').css('background','#e2eff7');
//     $('#searchForm .el-item-hide').slideDown(400,function(){
//       that.removeClass('noclick');
//     });
//   }else{
//     $('#searchForm .el-item-hide').slideUp(400,function(){
//       $('#searchForm .el-item-show').css('background','transparent');
//       that.removeClass('noclick');
//     });
//   }
// });
//输入框的相关事件
  $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
    var flag=$('#addPractice_form').attr("data-flag"),
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
$('body').on('click','#practice_add.button',function(e){
  e.stopPropagation();
  showPracticeModal();
});

//点击弹框内部关闭dropdown
$(document).click(function (e) {
  var obj = $(e.target);
  if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
    $('.el-select-dropdown').slideUp();
  }
});

//关闭弹窗
$('body').on('click','.addPractice .cancle',function(e){
  e.stopPropagation();
  layer.close(layerModal);
});


$('body').on('click','.addPractice .submit',function () {
  if(!$(this).hasClass('is-disabled')){
    var parentForm = $(this).parents('#addPractice_form');
    var code = parentForm.find('#code').val().trim(),
        id= parentForm.find('#itemId').val(),
        name = parentForm.find('#name').val().trim(),
        description = parentForm.find('#description').val();
        for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
        if(nameCorrect&&codeCorrect){
        $(this).hasClass('edit')?(
          editPractice({
            practice_field_id: id,
            code: code,
            name: name,
            description:description,
            _token: TOKEN

          })
        ):(addPractice({
          code: code,
          name: name,
          description:description,
          _token: TOKEN
        }));
        }
    }
})

//点击删除
$('.uniquetable').on('click','.button.pop-button.delete',function(){
  var id=$(this).attr("data-id");
  console.log(id);
  $(this).parents('tr').addClass('active');
  layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
    $('.uniquetable tr.active').removeClass('active');
  }}, function(index){
    layer.close(index);
    practiceDelete(id);
  });
});

//点击编辑
$('.uniquetable').on('click','.button.pop-button.edit',function(){
  nameCorrect=!1;
  codeCorrect=!1;
  $(this).parents('tr').addClass('active');
  practiceView($(this).attr("data-id"),'edit');
});
//查看
$('.uniquetable').on('click','.button.pop-button.view',function(){
  $(this).parents('tr').addClass('active');
  practiceView($(this).attr("data-id"),'view');
});

}



function showPracticeModal(flag,dedata,data) {
  var {practice_field_id='',code='',name='',description=''}={};
  if(data){
    ({practice_field_id='',code='',name='',description=''}=data)
  }

  var labelWidth=100,title='查看做法字段',btnShow='btnShow',readonly='',noEdit='';

  flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑做法字段',noEdit='readonly="readonly"'):title='添加做法字段');
  layerModal = layer.open({
    type: 1,
    title: title ,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: true,
    resize: false,
    move: false,
    content:`<form class="addPractice formModal formMateriel" id="addPractice_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${practice_field_id}">
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                        <input type="text" id="code" ${noEdit} ${readonly} value="${code}" data-name="编码" class="el-input" placeholder="请输入编码">
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
    end: function(){
      $('.uniquetable tr.active').removeClass('active');
    }
  })
}
$('body').on('input','.el-item-show #code',function(event){
  event.target.value = event.target.value.replace( /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘’，。、]/im,"");
})