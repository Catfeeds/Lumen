var layerLoading,
layerEle,
layerModal,
layerConfirm,
mActionFlag='add',
fileFlag='single',
  img_page_no=1,
  imgchecks=[],
  image_name='',
    img_id='',
    image_orgin_name='',
attrArr=[],
attrCArr=[],
  sameAjax={},
  ajaxImgData={},
validatorToolBox={
    checkCode: function (name) {
        var value = $('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        !Validate.checkImgCode(value)?(showInvalidMessage(name,"由1-20位字母、数字、下划线和中划线组成"),!1):(!0);
    },
    checkName: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"名称必填"),!1):
        (!0);
    },
    checkSource: function(name){
       var val=$('#'+name).val(),cname=$('#'+name).siblings('.el-input').val();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        val==''||cname=='--请选择--'?(showInvalidMessage('category_id','图纸来源必选'),!1):(!0);
    },
    checkCategory: function(name){
        var val=$('#'+name).val(),cname=$('#'+name).siblings('.el-input').val();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        val==''||cname=='--请选择--'?(showInvalidMessage('type_id','图纸分类必选'),!1):(!0);
    },
    checkGroup: function(name){
        var val=$('#'+name).val(),cname=$('#'+name).siblings('.el-input').val();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        val==''||cname=='--请选择--'?(showInvalidMessage('group_id','图纸分组必选'),!1):(!0);
    },
    checkImg: function(name){
        var iele=$('.file-preview-frame');
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        !iele.length?(showInvalidMessage('drawing','图纸必传'),!1):(!0);
    }
},
remoteValidatorToolbox={
    remoteCheck: function(name){
        var value=$('#'+name).val().trim();
        getUnique(name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                nameCorrect=!1;
                var val='已注册';
                showInvalidMessage(name,val);
            }else{
                nameCorrect=1;
            }
        });
    }
},
validatorConfig = {
    category_id: 'checkSource',
    type_id: 'checkCategory',
    group_id: 'checkGroup',
    code: 'checkCode',
    name: 'checkName',
    drawing: 'checkImg'
},remoteValidatorConfig={
    name: ''
};
var ziduan=['code','name','comment'];
$(function(){
    var url=window.location.pathname.split('/');
    if(url.indexOf('updateImage')>-1){
        mActionFlag='edit';
        img_id=getQueryString('id');
        img_id!=undefined?getImage(img_id):LayerConfig('fail','url链接缺少id参数，请给到id参数');
        $('.el-button.jump,.el-tap.none').removeClass('none');
      // attchinit('attachment',[],[]);
    }else{
      mActionFlag='add';
        imgSource();//来源
        imgCategory();//分类
        //imgGroup();//分组
        fileinit([],[],fileFlag);
    }
    bindEvent();
});

//获取id
function getImgIds(data){
  var ids=[];
  data.forEach(function(item){
    ids.push(item.drawing_id);
  });

  return ids;
}
//操作数组
function actImgArray(data,id){
  var ids=getImgIds(data);
  var index=ids.indexOf(Number(id));
  data.splice(index,1);
}

//洗标信息
var care_label_status = 0,trs = 0,trbgc = '';
function createCareLabelTable(data,file){
    care_label_status++;
    var rsp = data.response.results;
    // console.log(care_label_status%2);
    if(care_label_status%2!==0){
        trs++;
        console.log(trs);
        switch(trs){
            case 1:
                trbgc = '#DBDBFA';
                break;
            case 2:
                trbgc = '#FAF2D8';
                break;
            case 3:
                trbgc = '#FCE0FC';
                break;
            case 4:
                trbgc = '#E5FAD3';
                break;
            case 5:
                trbgc = '#D8E8F5';
                break;
        }
        // console.log(data);
        // console.log(file);
        var index = file.name.lastIndexOf('.');
        var tr = `<tr data-drawing-id="${rsp.insert_id}">
                    <td style="background: ${trbgc}">${file.name}</td>
                    <td><input type="text" placeholder="请输入销售单号" class="sale_order_code"></td>
                    <td><input type="text" placeholder="请输入行项号" class="line_project_code" maxlength="6" onKeyUp="value=value.replace(/[^\\d|chun]/g,'')"></td>
                    <td><input type="text" placeholder="请输入物料号" class="material_code" readonly value="${file.name.slice(0,index)}"></td>
                    <td><input type="text" placeholder="请输入版本号" class="version_code"></td>
                    <td>
                      <i data-code="${rsp.insert_id}" data-msg="${file.name}" data-bgc="${trbgc}" class="fa fa-plus-square oper_icon add" title="添加" style="font-size: 18px;color: #20a0ff;"></i>
                      <i data-code="${rsp.insert_id}" data-msg="${file.name}" class="fa fa-minus-square oper_icon delete" title="删除"  style="margin-right: 10px;font-size: 18px;"></i>
                    </td>
                  </tr>`;
        $('.careLable_table .table_tbody').append(tr);
    }

}

//图纸
function fileinit(preUrls,preothers,flag){
    var actions='<div class="file-actions" style="position: relative;top:15px;">\n' +
        '    <div class="file-footer-buttons">\n' +
        '        {upload} {download} <button type="button" title="重新选择" class="btn btn-kv btn-default addNew"><i class="glyphicon glyphicon-plus"></i></button> {delete} {zoom}' +
        '    </div>\n' +
        '    <div class="clearfix"></div>\n' +
        '</div>';
    var defaultPreviewContent='<img src="/statics/custom/img/pic.png" alt=""><h6 class="text-muted">点击上传</h6>',
    browseFlag=false,
    btnClass='btn btn-primary none file-btn-input',
    dropZoneTitle='',
    parameter={},
    footer=`<div class="file-thumbnail-footer">
        <div class="file-caption-name" style="width:{width}">{caption}</div>
        {progress}
        {actions}</div>
        `,
    layoutTemplates={main2: '{browse}{preview}',actions: actions,footer: footer};
    if(flag=='multiple'){
        defaultPreviewContent='';
        browseFlag=true;
        btnClass='btn btn-primary file-btn-input';
        dropZoneTitle='点击选择按钮去选择图纸';
        layoutTemplates={main2: '{browse}{preview}',footer: footer,actionZoom:'',zoomCache:''};
    }
    $("#drawing").on('filepreajax',function(event, previewId, index){
      parameter={
        category_id: $('#category_id').val(),
        _token: TOKEN
      };
    });
    var upurl=URLS['image'].upload;
    if(mActionFlag=='edit'){
      upurl=URLS['image'].uploadEdit;
    }

    /**
     * 上传图纸插件
     */
    $("#drawing").fileinput({
        uploadAsync: true,
        language: 'zh',
        'uploadUrl': upurl,
        uploadExtraData: function (previewId, index) {
            return parameter;
        },
        overwriteInitial: true,
        initialPreview: preUrls,
        initialPreviewConfig:preothers,
        defaultPreviewContent: defaultPreviewContent,
        showCaption: false,//隐藏标题
        showClose: false, //关闭按钮
        browseClass: btnClass,
        browseOnZoneClick: !browseFlag, //点击上传
        dropZoneTitle: dropZoneTitle,
        maxFileSize: 1500,
        maxFileCount: 5,
        layoutTemplates: layoutTemplates,
        msgErrorClass: 'alert alert-block alert-danger',
        allowedFileExtensions: ["jpg", "png", "gif", "jpeg"],
    })
    //     .on('fileselect', function(event, numFiles, label) {
    //     var correct=validatorToolBox[validatorConfig['category_id']]('category_id');
    //     $("#drawing").parents('.el-form-item').find('.errorMessage').html('').removeClass('active');
    //     if(correct){
    //         $(this).fileinput("upload");
    //     }else{
    //         LayerConfig('fail','请先选择分类');
    //         $("#drawing").fileinput('clear');
    //     }
    // })
        .on('filebatchselected',function(event,files){
            var flag = false;
            var correct=validatorToolBox[validatorConfig['category_id']]('category_id');
            $("#drawing").parents('.el-form-item').find('.errorMessage').html('').removeClass('active');
            files.forEach(function(val,i){
                var imgName = val.name.slice(0,val.name.lastIndexOf('.'));
                console.log(imgName);
                if(imgName.length == 0){
                    layer.msg('图片名称格式不正确');
                    $("#drawing").fileinput('clear');
                }
                var reg =/^[0-9]+$/;
                if(!reg.test(imgName)){
                    layer.msg('图片名称格式不正确');
                    $("#drawing").fileinput('clear');
                }
            });
            if(correct){
                // console.log(files);
                $(this).fileinput("upload");
            }else{
                LayerConfig('fail','请先选择分类');
                $("#drawing").fileinput('clear');
            }
        })
        .on('fileloaded', function (event, file, previewId, index, reader) {
        $('#' + previewId).attr('data-preview', 'preview-' + file.lastModified);
        // console.log(file);
    })
        .on('fileuploaded', function (event, data, previewId, index) {
        // console.log('附件上传成功');
        // console.log(index);
        // console.log(data);
        // console.log(previewId);
        // console.log(index);
        var result = data.response,
            file = data.files[index];
        if (result.code == '200') {
            // console.log(file);
            createCareLabelTable(data,file);
          if(mActionFlag=='edit'){
            $('.file-wrap .file-preview-frame[data-preview=preview-'+file.lastModified+']').addClass('uploaded').
            attr({
              'data-url':result.results.image_path,
              'drawing_id': result.results.drawing_temp_id,
              'drawing_temp_id': result.results.drawing_temp_id
            });
          }else{
            $('.file-wrap .file-preview-frame[data-preview=preview-'+file.lastModified+']').addClass('uploaded').
            attr({
              'data-url':result.results.image_path,
              'drawing_id': result.results.insert_id
            });
          }
        }

    })
        .on('filebeforedelete', function (event, key, data) {
        console.log('附件删除');
    })
}
//附件初始化
function attchinit(ele,preUrls,preOther){
  $('#'+ele).fileinput({
    'theme': 'explorer-fa',
    language: 'zh',
    uploadAsync:true,
    'uploadUrl': URLS['image'].uploadAttachment,
    uploadExtraData: function(previewId, index){
      var obj = {};
      obj.flag = 'image';
      obj._token=TOKEN;
      return obj;
    },
    initialPreview: preUrls,
    initialPreviewConfig: preOther,
    dropZoneEnabled:false,
    showCaption: false,
    showClose: false,
    showUpload: false,
    showRemove: false,
    maxFileSize: 500*1024,
    maxFileCount: 1,
    overwriteInitial: false,
    showCancel: false
  }).on('fileselect', function(event, numFiles, label) {
    var attchname=$('#attchname').val().trim();
    if(attchname){
      if(label.split('.')[0]==attchname){
        $(this).fileinput("upload");
      }else{
        LayerConfig('fail','附件名称不一致',function () {
          $('#addFujian .file-preview').find('tr.file-preview-frame').each(function (index,item) {
            if($(item).find('.kv-file-upload').is(':visible')){
              $(item).find('.kv-file-remove').click();
            }
          });
        });
      }
    }else{
      LayerConfig('fail','请填写附件名称',function () {
        $('#addFujian .file-preview').find('tr.file-preview-frame').each(function (index,item) {
          if($(item).find('.kv-file-upload').is(':visible')){
            $(item).find('.kv-file-remove').click();
          }
        });
      });
    }
  }).on('fileloaded', function(event, file, previewId, index, reader) {
  }).on('filepreupload',function (event, data, previewId, index) {
    // console.log(previewId);
    // console.log(data);
    // console.log(data.files[0].lastModified);
    $('#'+previewId).attr('data-preview','preview-'+data.files[index].lastModified);
  }).on('fileuploaded', function(event, data, previewId, index) {
    var result=data.response,
      file=data.files[index];
    // console.log(result);
    if(result.code=='200'){
      $('.file-preview-frame[data-preview=preview-'+file.lastModified+']').addClass('uploaded').
      attr({
        'data-url':result.results.path,
        'attachment_id': result.results.attachment_id
      }).find('td.creator').html(`<p class="creator_name">${result.results.creator}</p>
            <p class="creator_time">${result.results.time}</p>`).removeAttr('data-preview');
    }else{
      var ele=$('.file-preview-frame[data-preview='+previewId+']');
      ele.remove();
      var errorHtml=`<button type="button" class="close kv-error-close" aria-label="Close">
                           <span aria-hidden="true">×</span>
                        </button>
                        <ul>
                            <li>${result.message}</li>
                        </ul>`;
      $('.kv-fileinput-error.file-error-message').html(errorHtml).show();
      console.log('文件上传失败'+previewId);
    }
  }).on('filebeforedelete', function(event, key, data) {
    console.log('初始化附件删除');
  });
}

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
}
//获取图纸来源数据
function imgSource(){
  AjaxClient.get({
    url: URLS['category'].select+"?"+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      if(rsp&&rsp.results&&rsp.results.length){
        var lis='';
        rsp.results.forEach(function(item){
          lis+=`<li data-id="${item.imageCategory_id}" class="el-select-dropdown-item">${item.name}</li>`;
        });
        $('.el-form-item.source .el-select-dropdown-list').append(lis);
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸来源列表失败');
    },
    complete: function(){
      $('#searchForm .submit').removeClass('is-disabled');
    }
  })
}

//获取图纸分类数据
function imgCategory(fn){
    AjaxClient.get({
        url: URLS['groupType'].select+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                var lis='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.image_group_type_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('.el-form-item.category .el-select-dropdown-list').append(lis);
            }

            fn&&typeof fn=='function'?fn():null;
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸分类列表失败');
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

//获取图纸分组数据
function imgGroup(cid,id){
    AjaxClient.get({
        url: URLS['group'].select+"?"+_token+"&type_id="+cid,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                var lis='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.imageGroup_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('.el-form-item.group .el-select-dropdown-list').html(lis);
                if(id){
                    $('.el-form-item.group .el-select-dropdown-item[data-id='+id+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸分类列表失败');
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

//获取图纸属性
function getImgAttr(cid,tid,fn) {
    AjaxClient.get({
        url: URLS['image'].attrSelect+"?"+_token+"&category_id="+cid+"&group_type_id="+tid,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            attrArr=rsp&&rsp.results||[];
            attrCArr=attrArr.concat();
            fn&&typeof fn=='function'?fn():null;
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸属性列表失败');
        }
    });
}

//获取图纸详情
function getImage(id){
    var xhr=AjaxClient.get({
        url: URLS['image'].show+"?"+_token+"&drawing_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);


                if(rsp&&rsp.results){
                    image_orgin_name = rsp.results.image_orgin_name.split('.')[0];
                if(rsp.results.groupDrawing&&rsp.results.groupDrawing.length){

                    $('#showAssemblyDrawing').show();
                    var parentForm = $('#show_arr_list');

                    rsp.results.groupDrawing.forEach(function (groupDrawing) {
                        var list = '';
                        var th='',td='';
                        groupDrawing.attributes.forEach(function (item) {
                            th += `<th>${item.definition_name}</th>`;
                            td += `<td>${item.value}</td>`;
                        });
                        var table = `<table>
                                        <thead>
                                            <tr>
                                                <th>名称</th>
                                                <th>编码</th>
                                                ${th}
                                                <th>关联图</th>
                                                <th>查看</th>
                                            </tr>
                                        </thead>
                                        
                                        <tbody>
                                            <tr>
                                                <td>${groupDrawing.name}</td>
                                                <td>${groupDrawing.code}</td>
                                                ${td}
                                                <td id="table${groupDrawing.id}"></td>
                                                <td><button data-id="${groupDrawing.image_path}"class="button pop-button view showAssemblyDrawingPicture">查看</button></td>

                                            </tr>
                                        </tbody>
                                    
                                    </table>`;
                        parentForm.append(table);

                        groupDrawing.links.forEach(function (links) {
                            var links_list = '';
                            var links_th='',links_td='';
                            links.attributes.forEach(function (item) {
                                links_th += `<th>${item.definition_name}</th>`;
                                links_td += `<td>${item.value}</td>`;
                            });
                            var table = `<table>
                                        <thead>
                                            <tr>
                                                <th>名称</th>
                                                <th>编码</th>
                                                ${links_th}
                                            </tr>
                                        </thead>
                                        
                                        <tbody>
                                            <tr>
                                                <td>${links.name}</td>
                                                <td>${links.code}</td>
                                                ${links_td}
                                            </tr>
                                        </tbody>
                                    
                                    </table>`;
                            parentForm.find("#table"+groupDrawing.id).append(table);
                        })


                    });



                }

                $('.el-form-item.source').find('.el-select-dropdown-wrap').
                html(`<input type="text" readonly="readonly" class="el-input" value="${rsp.results.category_name}">
                    <input type="hidden" class="val_id" id="category_id" value="${rsp.results.category_id}">`);
                getImgAttr(rsp.results.category_id,rsp.results.type_id,function () {
                    attrCArr=rsp.results.attributes;
                    $('.attr-container').css('display','flex');
                    createAttrList();
                });
                imgCategory(function () {
                  var text=$('.el-form-item.category .el-select-dropdown-item[data-id='+rsp.results.type_id+']').addClass('selected').text();
                  $('#type_id').val(rsp.results.type_id).siblings('.el-input').val(text);
                  imgGroup(rsp.results.type_id,rsp.results.group_id);
                });
                fileFlag='single';
                for(var i=0;i<ziduan.length;i++){
                    $('#'+ziduan[i]).val(rsp.results[ziduan[i]]);
                }
                $('#code').attr('readonly','readonly');
                  var imgurls=[],imgdata=[],imghtml='',
                    imgdobj={
                      caption: rsp.results.image_orgin_name
                    };
                  imghtml=`<img class="imginit" src="/storage/${rsp.results.image_path}" drawing_id="${img_id}" />`;
                  imgurls.push(imghtml);
                  imgdata.push(imgdobj);
                  setTimeout(function(){
                      $('.file-wrap .file-preview-frame').attr({'data-url':rsp.results.image_path,'drawing_id':img_id});
                    },100);
                  fileinit(imgurls,imgdata,fileFlag);
                // var li=`<div class="pic-li file-preview-frame init-success-file" data-url="${rsp.results.image_path}" drawing_id="${img_id}">
                //     <div class="el-card">
                //         <div class="el-card-body">
                //             <img data-src="${window.storage}${rsp.results.image_path}" src="${window.storage}${rsp.results.image_path}" data-id="${img_id}" attachment_id="${img_id}" class='pic-img file-preview-image existAttch'>
                //         </div>
                //         <div class="el-card-info">
                //             <span title="${rsp.results.image_orgin_name}">${rsp.results.image_orgin_name}</span>
                //         </div>
                //     </div>
                //     </div>`;
                // $('.file-wrap').html(li);
                imgchecks=rsp.results.linkArr;
              createLinkHtml();
              $('.link-num span').html(imgchecks.length);
              var preurls=[],predata=[];
              if(rsp.results.attachments&&rsp.results.attachments.length){
                rsp.results.attachments.forEach(function(item){
                  var url='/storage/'+item.path,preview='';
                  var path=item.path.split('/');
                  var name=item.filename;
                  if(item.path.indexOf('jpg')>-1||item.path.indexOf('png')>-1||item.path.indexOf('jpeg')>-1){
                    preview=`<img width="60" height="60" src="${url}" data-creator="${item.creator_name||''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch'>`;
                  }else{
                    preview=`<div class='file-preview-text existAttch' data-creator="${item.creator_name||''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}">
                        <h3 style="font-size: 50px;"><i class='el-icon el-icon-file'></i></h3>
                        </div>`;
                  }
                  var pitem={
                    caption: name,
                    size: item.size
                  };
                  preurls.push(preview);
                  predata.push(pitem);
                });
              }
              attchinit('attachment',preurls,predata);
              setTimeout(function(){
                if($('.existAttch').length){
                  $('.existAttch').each(function(){
                    var pele=$(this).parents('.file-preview-frame');
                    pele.attr({
                      'data-url': $(this).attr('data-url'),
                      'attachment_id': $(this).attr('attachment_id')
                    });
                    var cname=$(this).attr('data-creator'),
                      ctime=$(this).attr('data-ctime');
                    pele.find('.fujiantext').text($(this).attr('comment'));
                    pele.find('.creator').html(`<p>${cname}</p><p>${ctime}</p>`);
                    pele.addClass('init-success-file');
                  });
                }
                if(rsp.results.attachments && rsp.results.attachments.length){
                    rsp.results.attachments.forEach(function (item) {
                        var attachment_dowload = $('#addFujian').find('tr[attachment_id='+item.attachment_id+']').eq(0);
                        var a = `<a href="${window.storage+item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if(!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    });
                }

              },1000);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
        }
    },this);
}


//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';
    if(mActionFlag=='add'){
        urlLeft=`&field=${field}&value=${value}`;
    }else if(mActionFlag=='edit'){
        urlLeft=`&field=${field}&value=${value}&id=''`;
    }
    var xhr=AjaxClient.get({
        url: URLS['image'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('唯一性检测失败');
        }
    },this);
}

//重置所有数据
function resetAllData(){
    $('.el-select-dropdown-item.selected').removeClass('selected');
    $('#category_id').val('').siblings('.el-input').val('--请选择--');
    $('#type_id').val('').siblings('.el-input').val('--请选择--');
    $('#group_id').val('').siblings('.el-input').val('--请选择--');
    $('.el-form-item.group .el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>');
    for(var i=0;i<ziduan.length;i++){
        $('#'+ziduan[i]).val('');
    }
    $('.attr-container').hide().find('.querywrap').html('').hide();
    attrArr=[];
    attrCArr=[];
    $("#drawing").fileinput('destroy');
    fileFlag='single';
    fileinit([],[],fileFlag);
}
//保存
function save(data){
    AjaxClient.post({
        url: URLS['image'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','添加成功',function(){
                // resetAllData();
              if(rsp&&rsp.results&&rsp.results.drawing_id){
                window.location.href=$('#editurl').val()+'?id='+rsp.results.drawing_id;
              }else{
                resetAllData();
              }
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message,function(){
                    if(rsp&&rsp.field!==undefined&&rsp.field!=""){
                        showInvalidMessage(rsp.field,rsp.message);
                    }
                });
            }
        },
        complete: function(){
            $('.submit').removeClass('is-disabled');
        }
    },this);
}
//获取编码
function getCode(typecode){
  var data={
    _token: TOKEN,
    type_code: typecode,
    type: 6
  };
  AjaxClient.post({
    url: URLS['image'].getCode,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.results){
        setting_id=rsp.results.encoding_setting_id;
        automatic_number=rsp.results.automatic_number;
        if(rsp.results.automatic_number=='1'){//自动生成允许手工改动
          $('#code').val(rsp.results.code).attr('data-val',rsp.results.code);
        }else if(rsp.results.automatic_number=='2'){//自动生成不允许手工改动
          // var len=Number(rsp.results.serial_number_length),
          //   start=rsp.results.code.length-len;
          // var newCode=rsp.results.code.substring(0,start)+new Array(len+1).join('*');
          $('#code').val(rsp.results.code).attr({'readonly':'readonly','data-val':rsp.results.code});
        }else{
          $('#code').removeAttr('readonly');
        }
      }else{
        console.log('获取图纸编码失败');
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸编码失败');
    }
  },this);
}
//存储图纸属性
function createPicAttr(){
    var attr=[],
    ele=$('.query-item .el-form-item');
    ele.each(function(){
      var item={
        attribute_definition_id: $(this).attr('attr-id'),
        value: $(this).find('.el-input.pic-attr-input').val().trim()
      };
      attr.push(item);
    });
    return attr;
}

// 编辑整体
function edit(data){
    AjaxClient.post({
        url: URLS['image'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','编辑成功');
            $('.submit').removeClass('is-disabled');
            $('.file-wrap .file-preview-frame').attr('drawing_temp_id', 0);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('.submit').removeClass('is-disabled');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message,function(){
                    if(rsp&&rsp.field!==undefined&&rsp.field!=""){
                        showInvalidMessage(rsp.field,rsp.message);
                    }
                });
            }
        }
    },this);
}

// 查询相同属性图纸
function sameImg(){
  AjaxClient.get({
    url: URLS['image'].searchImg,
    data: sameAjax,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.results&&rsp.results.length){
        var _html=createHtml(rsp.results);
        $('.sameImg').show().find('#table_pic_table tbody').html(_html);
      }else{
        $('.sameImg').show().find('#table_pic_table tbody').html('<tr class="tritem"><td colspan="5" style="text-align: center;">暂无数据</td></tr>');
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);

    }
  },this);
}

//生成列表数据
function createHtml(data){
  var trs='';
  data.forEach(function(item,index){
    var imgsrc=item.image_path==''?'/statics/custom/img/logo_default.png':window.storage+item.image_path;
    trs+=`
            <tr class="tritem" data-id="${item.drawing_id}">
                <td><img class="img pic-img" data-src="${imgsrc}" data-id="${item.drawing_id}" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="${imgsrc}" /></td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${item.ctime}</td> 
            </tr>
        `;
  });
  return trs;
}

function createLinkHtml() {
  var imgs='';
  if(imgchecks.length){
    imgchecks.forEach(function (item) {
      var attrth='',attrtd='';
      if(item.attributes&&item.attributes.length){
        item.attributes.forEach(function (aitem) {
          attrth+=`<th>${aitem.definition_name}</th>`;
          attrtd+=`<td>${aitem.value}</td>`;
        });
      }
      imgs+=`<tr class="tritem" data-id="${item.drawing_id}">
                  <td><img class="img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="/storage/${item.image_path}"></td>
                  <td>${item.code}</td>
                  <td>${item.name}</td>
                  <td><input type="text" value="${item.count}" class="el-input usage_number"></td>
                  <td><textarea class="el-textarea img-textarea comment" cols="30" rows="3">${item.description}</textarea></td>
                  <td>
                    <table class="uniquetable attrtable">
                        <thead><tr>${attrth}</tr></thead>
                        <tbody><tr>${attrtd}</tr></tbody>
                    </table>
                  </td>
                  <td class="right"><i class="fa fa-times-circle img-delete" data-img-id="${item.drawing_id}"></i>
                  </td>
              </tr>`;
    });
  }else{
    imgs='<tr class="tritem"><td colspan="8" style="text-align: center;">暂无数据</td></tr>';
  }
  $('#table_linkpic_table .table_tbody').html(imgs);
}

//查询属性模态框
function ChooseAttr(){
  var tableHeight=($(window).height()-250)+'px';
  layerModal=layer.open({
    type: 1,
    title: '选择图纸属性',
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="chooseAttr formModal formMateriel" id="chooseAttr_from">
            <div class="table table_page" style="max-height: ${tableHeight}px;overflow-y: auto;">
                <div class="img-attr-wrap">
                
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group">
                    <button style="margin: 5px 0;" type="button" class="el-button el-button--primary choose-attr-ok attr-ok">确认</button>
                </div>
            </div>
        </form>` ,
    success: function(layero,index){
      layerEle=layero;
      var attrhtml='';
      if(!attrArr.length){
          attrhtml='<p>暂无数据</p>';
          $('.img-attr-wrap').append(attrhtml);
      }else{
        var ids=getAttrIds(attrCArr);
        attrArr.forEach(function (item) {
          attrhtml=`<p><span class="el-checkbox_input attr-check ${ids.indexOf(item.attribute_definition_id)>-1?'is-checked':''}" data-id="${item.attribute_definition_id}">
                        <span class="el-checkbox-outset"></span>
                        <input class="selected" type="hidden" value="1">
                    </span><span class="attr-label" title="${item.definition_name}">${item.definition_name}</span></p>`;
          $('.img-attr-wrap').append(attrhtml);
          $('.img-attr-wrap').find('p:last-child').data('attrItem',item);
        });
      }

    },
    end: function(){

    }
  });
}

function createAttrList() {
  if(attrCArr.length){
    var _html='';
    attrCArr.forEach(function (item) {
        if(item.isModel&&item.isModel==1){
            _html+=`<div class="el-form-item" attr-id="${item.attribute_definition_id}">
                 <div class="el-form-item-div">
                     <label class="el-form-item-label">${item.definition_name}</label>
                     <input type="text" class="el-input pic-attr-input" placeholder="" value="${item.value||''}">
                 </div>
                 <div class="el-form-item-div">
                     <label class="el-form-item-label">样板时间</label>
                     <input type="text" readonly="readonly" class="el-input pic-attr-input" placeholder="" value="${item.mtime||''}">
                 </div>
             </div>`;
        }else{
            _html+=`<div class="el-form-item" attr-id="${item.attribute_definition_id}">
                     <div class="el-form-item-div">
                         <label class="el-form-item-label">${item.definition_name}</label>
                         <input type="text" class="el-input pic-attr-input" placeholder="" value="${item.value||''}">
                     </div>
                 </div>`;

        }
    });
    var ulhtml=`<ul class="query-item">
                    <li>${_html}</li>
                </ul>`;
    $('.mattr-con-detail .querywrap').html(ulhtml).show();
  }else{
    $('.mattr-con-detail .querywrap').html('').hide()
  }
}

//分页
function bindImgPagenationClick(total,size) {
  $('#pagenation.img').show();
  $('#pagenation.img').pagination({
    totalData:total,
    showData:size,
    current: img_page_no,
    isHide: true,
    coping:true,
    homePage:'首页',
    endPage:'末页',
    prevContent:'上页',
    nextContent:'下页',
    jump: true,
    callback:function(api){
      img_page_no=api.getCurrent();
      if($('.image-select .img-s-check.is-checked').attr('data-name')=='make'){
        var pracid=$('.make_list_all .make-item.selected').attr('data-id');
        getPracticeImg(pracid);
      }else{
        getImageSource();
      }
    }
  });
}

function getImageSource() {
  $('#img_select_form .table_tbody').html('');
  var urlLeft='';
  for(var param in ajaxImgData){
    urlLeft+=`&${param}=${ajaxImgData[param]}`;
  }
  urlLeft+="&page_no="+img_page_no+"&page_size=8";
  AjaxClient.get({
    url: URLS['image'].careLabelIndex+'?'+_token+urlLeft,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      var pageTotal = rsp.paging.total_records;
      if(pageTotal>8){
        bindImgPagenationClick(pageTotal,8);
      }else{
        $('#pagenation').html('');
      }
      if(rsp.results && rsp.results.length){
        createImgHtml($('#img_select_form .table_tbody'),rsp.results);
      }else{
        var tr=`<tr><td colspan="5" style="text-align: center;color: #999;">暂无数据</td></tr>`;

        $('#img_select_form .table_tbody').html(tr)
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
    }
  },this);
}

function createImgHtml(ele,data) {
  var ids=getImgIds(imgchecks);
  data.forEach(function (item,index) {
    var _checkbox=`<span class="el-checkbox_input img-check ${ids.indexOf(item.drawing_id)>-1?'is-checked':''}" data-path="${item.image_path}" data-id="${item.drawing_id}" data-name="${item.name}">
                    <span class="el-checkbox-outset"></span>
                </span>`;
    var tr = ` <tr class="trimgitem">
                    <td>${_checkbox}</td>
                    <td><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="/storage/${item.image_path}" alt=""></td>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.category_name}</td>
                </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}

//获取图纸来源数据
function imglinkSource(){
  AjaxClient.get({
    url: URLS['category'].select+"?"+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      if(rsp&&rsp.results&&rsp.results.length){
        var lis='';
        rsp.results.forEach(function(item){
          lis+=`<li data-id="${item.imageCategory_id}" class="el-select-dropdown-item">${item.name}</li>`;
        });
        $('#searchForm .el-form-item.imgSource .el-select-dropdown-list').append(lis);
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸分类列表失败');
    },
    complete: function(){
      $('#searchForm .submit').removeClass('is-disabled');
    }
  })
}

//获取图纸属性
function getImgSelectAttr(id) {
  if(id == 0 || id==undefined){
    var ele = $('.el-form-item.template_attr .template_attr_wrap');
    ele.html('');
    return false;
  }
  AjaxClient.get({
    url: URLS['image'].attrSelect+'?'+_token+'&category_id='+id,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp.results&&rsp.results.length){
        var ele = $('.el-form-item.template_attr .template_attr_wrap');
        ele.html(' ');
        rsp.results.forEach(function (item,index) {
          var li = `<div class="attr_item" data-id="${item.attribute_definition_id}">
                            <span class="img_text" title="${item.definition_name}">${item.definition_name}</span>
                            <input type="text" value=""/>
                        </div>`;
          ele.append(li);
        })
      }else{
        $('.el-form-item.template_attr .template_attr_wrap').html('');
      }

    },
    fail: function(rsp){
      layer.close(layerLoading);
      layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
    }
  },this);
}
function getFujianData(){
  var ele=$('#addFujian .file-preview-frame.file-preview-success,#addFujian .file-preview-frame.init-success-file');
  var fujianData=[];
  ele.each(function(){
    var item={
      attachment_id: $(this).attr('attachment_id'),
      comment: $(this).find('.fujiantext').val().trim()
    };
    fujianData.push(item);
  });
  return fujianData;
}

function showImageModal() {
  var labelWidth=100,btnShow='';
  layerModal = layer.open({
    type: 1,
    title: '添加关联图纸',
    offset: '50px',
    area: '1000px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content:`<div class="formModal" id="img_select_form" style="min-height:400px;">
                    <div class="searchItem" id="searchForm">
                      <form class="searchMAttr searchModal formModal imgModal" id="searchImgAttr_from">
                          <div class="el-item">
                              <div class="el-item-show">
                                  <div class="el-item-align">
                                      <div class="el-form-item">
                                          <div class="el-form-item-div">
                                              <label class="el-form-item-label">编码</label>
                                              <input type="text" id="searchCode" class="el-input" placeholder="请输入编码" value="">
                                          </div>
                                      </div>
                                      <div class="el-form-item">
                                          <div class="el-form-item-div">
                                              <label class="el-form-item-label">名称</label>
                                              <input type="text" id="searchName" class="el-input" placeholder="请输入名称" value="">
                                          </div>
                                      </div>
                                  </div>
                                  <ul class="el-item-hide">
                                      <li>
                                          <div class="el-form-item category">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">创建人</label>
                                                  <input type="text" id="searchCreator" class="el-input" placeholder="请输入创建人" value="">
                                              </div>
                                          </div>
                                          <div class="el-form-item imgSource">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">图纸来源</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="img_source" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list">
                                                              <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </li>
                                      <li>
                                        <div class="el-form-item template_attr" style="">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">图纸属性</label>
                                                <div class="template_attr_wrap clearfix"></div>
                                            </div>
                                        </div>
                                      </li>
                                  </ul>
                              </div>
                              <div class="el-form-item">
                                  <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                      <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                      <button type="button" class="el-button choose-search">搜索</button>
                                  </div>
                              </div>
                          </div>
                      </form>
                    </div>
                    <div class="img_list table_page">
                        <div id="pagenation" class="pagenation img"></div>
                        <table class="sticky uniquetable commontable">
                            <thead>
                                <tr>
                                    <th class="left nowrap tight">选择</th>
                                    <th class="left nowrap tight">缩略图</th>
                                    <th class="left nowrap tight">图纸编码</th>
                                    <th class="left nowrap tight">图纸名称</th>
                                    <th class="left nowrap tight">图纸来源</th>
                                </tr>
                            </thead>
                            <tbody class="table_tbody">
                               
                            </tbody>
                        </table>
                        <p class="errorMessage" style="padding-left: ${labelWidth};display: block"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <!--<button type="button" class="el-button cancle">取消</button>-->
                            <button type="button" class="el-button el-button--primary select_img_btn">确定</button>
                        </div>
                    </div>
                    
        </div>`,
    success: function(layero,index){
      var pracid=$('.make_list_all .make-item.selected').attr('data-id');
      getImageSource();
      imglinkSource();
    },
    end:function () {
      ajaxImgData={order:'desc',sort:'ctime'}
    }
  })
}
function showPictureModal(path) {

  var labelWidth=100,btnShow='';
  layerModal = layer.open({
    type: 1,
    title: '组合图',
    offset: '50px',
    area: '1000px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content:`<div class="formModal" id="img_select_form" style="min-height:400px;">
                      <img style="margin: auto;" src="${window.storage+path}" alt="">          
        </div>`,
    success: function(layero,index){

    },
    end:function () {
    }
  })
}
function getCareLable(id){
    AjaxClient.get({
        url: URLS['image'].showCareLable+"?"+_token+"&drawing_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results && rsp.results.length){
                crateCareLableHtml($('.careLable_table .table_tbody'),rsp.results);
            }else {
                var tr = `<tr >
                                <td><input type="text" placeholder="请输入销售单号" class="sale_order_code"></td>
                                <td><input type="text" placeholder="请输入行项号" class="line_project_code" maxlength="6" onKeyUp="value=value.replace(/[^\\d|chun]/g,'')"></td>
                                <td><input type="text" placeholder="请输入物料号" class="material_code" readonly value="${image_orgin_name}"></td>
                                <td><input type="text" placeholder="请输入版本号" class="version_code"></td>
                                <td>
                                    <i class="fa fa-plus-square oper_icon add" title="添加" style="font-size: 18px;color: #20a0ff;"></i>
                                    <i class="fa fa-minus-square oper_icon delete" title="删除"  style="margin-right: 10px;font-size: 18px;"></i>
                                </td>
                            </tr>`;
                $('.careLable_table .table_tbody').append(tr);

            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','失败！');


        }
    });
}
function crateCareLableHtml(ele,data) {
    ele.html('')
    data.forEach(function (item) {
        var tr = `<tr data-id="${item.care_label_id}">
                        <td><input type="text" placeholder="请输入销售单号" class="sale_order_code" value="${item.sale_order_code}"></td>
                        <td><input type="text" placeholder="请输入行项号" class="line_project_code" maxlength="6" onKeyUp="value=value.replace(/[^\\d|chun]/g,'')" value="${item.line_project_code}"></td>
                        <td><input type="text" placeholder="请输入物料号" class="material_code" readonly value="${item.material_code}"></td>
                        <td><input type="text" placeholder="请输入版本号" class="version_code" value="${item.version_code}"></td>
                        <td>
                            <i class="fa fa-plus-square oper_icon add" title="添加" style="font-size: 18px;color: #20a0ff;"></i>
                            <i class="fa fa-minus-square oper_icon delete" title="删除"  style="margin-right: 10px;font-size: 18px;"></i>
                        </td>
                    </tr>`;
        ele.append(tr);

    })
}
function addCareLable(careLable) {
    AjaxClient.post({
        url: URLS['image'].batchStore,
        data:{
            category_id:$('#category_id').val(),
            group_id:$('#group_id').val(),
            drawings:careLable,
            _token:TOKEN
        },
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！',function(){
                    window.location.href = '/ImageManagement/careLabelIndex';
                });
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);

            LayerConfig('fail','失败！');

        }
    });
}
function sendCareLable() {
    AjaxClient.post({
        url: URLS['image'].careLableToSap,
        data:{
            drawing_id:img_id,
            _token:TOKEN
        },
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results.SERVICERESPONSE.RETURNCODE==='0'){
                LayerConfig('success','成功！');
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','失败！');

        }
    });
}

function getAttrIds(data) {
  var ids=[];
  data.forEach(function (item) {
    ids.push(item.attribute_definition_id);
  });
  return ids;
}

function getLinkData() {
  imgchecks.forEach(function (item) {
    var trele=$('#table_linkpic_table .tritem[data-id='+item.drawing_id+']');
    if(trele.length){
      item.count=trele.find('.usage_number').val().trim();
      item.description=trele.find('.img-textarea').val().trim();
    }
  });
}

function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });
    $('body').on('click','.addNew',function(){
        $('.file-drop-zone.clickable').click();
    });

    $('body').on('click','.add-linkpic',function () {
      getLinkData();
      showImageModal();
    });
  $('body').on('click','.img-delete',function () {
    var imgid=Number($(this).attr('data-img-id'));
    actImgArray(imgchecks,imgid);
    $('.link-num span').html(imgchecks.length);
    $(this).parents('tr.tritem').remove();
  });
  $('body').on('click','.select_img_btn',function () {
    createLinkHtml();
    $('.link-num span').html(imgchecks.length);
    layer.close(layerModal);
  });
  $('body').on('click','.el-checkbox_input.img-check',function () {
    $(this).toggleClass('is-checked');
    var data=$(this).parents('.trimgitem').data('trData');
    var ids=getImgIds(imgchecks);
    if($(this).hasClass('is-checked')){
      if(ids.indexOf(data.drawing_id)==-1&&data.drawing_id!=img_id){
        data.count=1;
        data.description='';
        imgchecks.push(data);
      }
    }else{
      actImgArray(imgchecks,data.drawing_id);
    }
  });

  $('body').on('click','.saveCareLabel',function (e) {
      e.stopPropagation();
      var temp = {},canStore = true,trs = [];
      $('.careLable_table .table_tbody tr').each(function (k,v) {
          var drawing_id = $(v).attr('data-drawing-id'),
              index = $(v).find('.add').attr('data-msg').lastIndexOf('.'),name = $(v).find('.add').attr('data-msg').slice(0,index);
          var attrName = "O_"+drawing_id;
          var temp_item={
              "sale_order_code": $(v).find('.sale_order_code').val(),
              "line_project_code": $(v).find('.line_project_code').val(),
              "material_code":$(v).find('.material_code').val(),
              "version_code": $(v).find('.version_code').val()
          }
          if(temp[attrName] == undefined){
              var temp_drawing = {
                  "drawing_id":drawing_id,
                  "name":name,
                  "items":[]
              };
              temp[attrName] = temp_drawing;
          }
          temp[attrName].items.push(temp_item);
          trs.push(temp_item);

      });
      // console.log(temp);
      // console.log(trs);
      trs.forEach(function (val,i) {
          // console.log(val);
          if(val.sale_order_code == ''){
              layer.msg('销售单号不能为空',{icon:5});
              canStore = false;
          }else if(val.line_project_code == ''){
              layer.msg('行项号不能为空',{icon:5});
              canStore = false;
          }else if(val.version_code == ''){
              layer.msg('版本号不能为空',{icon:5});
              canStore = false;
          }
      })
      if(canStore){
          addCareLable(temp);

      }
  });
  $('body').on('click','.sendCareLable',function (e) {
      e.stopPropagation();
      sendCareLable();

  });
  $('body').on('click','#searchForm .arrow:not(.noclick)',function(e){
    e.stopPropagation();
    $(this).find('.el-icon').toggleClass('is-reverse');
    var that=$(this);
    that.addClass('noclick');
    if($(this).find('.el-icon').hasClass('is-reverse')){

      $(this).find('.el-icon').removeClass('is-reverse');
      $('#searchForm:not(.search_wrap) .el-item-show').css('background','#e2eff7');
      $('#searchForm:not(.search_wrap) .el-item-hide').slideDown(400,function(){
        that.removeClass('noclick');
      });
    }else{
      $(this).find('.el-icon').addClass('is-reverse');
      $('#searchForm:not(.search_wrap) .el-item-hide').slideUp(400,function(){
        $('#searchForm:not(.search_wrap) .el-item-show').css('background','transparent');
        that.removeClass('noclick');
      });
    }
  });
  $('body').on('click','#searchForm .choose-search',function(e) {
    e.stopPropagation();
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
      $('.arrow .el-input-icon').removeClass('is-reverse');
    });

    var parentForm = $(this).parents('#searchImgAttr_from');
    var ele = $('.template_attr_wrap .attr_item'),_temp=[];
    if(ele.length){
      $(ele).each(function (key,value) {
        if($(value).find('input').val() != ''){
          var obj = {
            attribute_definition_id:$(value).attr('data-id'),
            value:$(value).find('input').val()
          };
          _temp.push(obj)
        }

      })
    }
    img_page_no=1;
    ajaxImgData={
      code:parentForm.find('#searchCode').val(),
      name:parentForm.find('#searchName').val(),
      creator_name:parentForm.find('#searchCreator').val(),
      drawing_attributes: JSON.stringify(_temp),
      category_id:parentForm.find('#img_source').val(),
      order:'desc',
      sort:'ctime'
    };
    getImageSource()
  });

  $('body').on('click','.el-tap-wrap .el-tap',function(){
    var form=$(this).attr('data-item');
    if(!$(this).hasClass('active')){
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      $('.el-panel.'+form).addClass('active').siblings('.el-panel').removeClass('active');
    }
    if(form=='careLable'){
        getCareLable(img_id);
    }
  });

    //图纸放大
    $('body').on('click','.pic-img',function(){
        var imgList,current;
        imgList=$(this);
        current=$(this).attr('data-id');
        showBigImg(imgList,current); 
    });

    $('body').on('click','.el-button.jump',function () {
      window.location.href=$('#addurl').val();
    });

    //图纸属性弹框
    $('body').on('click','.el-button.choose-attr',function () {

      ChooseAttr();
      $('.attr-check').attr('checked',true);
    });

    //图纸属性确认
    $('body').on('click','.choose-attr-ok',function () {
        createAttrList();
        layer.close(layerModal);
    });

    //删除图纸按钮事件
    $('body').on('click','#addImage .kv-file-remove.btn',function(){
        var imgId = $(this).parents('.file-preview-frame').attr('drawing_id');
        console.log(imgId);
        $('.careLable_table').find('tr[data-drawing-id = '+imgId+']').remove();
        if($('#addImage .file-preview-frame').length==1){
            $("#drawing").fileinput('refresh',{
            initialPreview: [],
            initialPreviewConfig: []}).fileinput('clear');
        }else{
            if(mActionFlag=='edit'){
                var ele=$(this).parents('.file-preview-frame');
                ele.remove();
            }
        }   
    });
    // $('body').on('click','#addFujian .kv-file-remove.btn',function(){
    //   var ele=$(this).parents('.file-preview-frame');
    //   ele.remove();
    // });
    //所有按钮禁止冒泡及默认行为
    $('body').on('click','.button',function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    //取消
    $('body').on('click','.cancle',function(e){
        e.stopPropagation();
        if($(this).hasClass('no')){
            layer.close(layerConfirm);
        }
    });
    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id'),formerVal=ele.find('.val_id').val();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        if(formerVal!=idval){
            if(ele.find('.val_id').attr('id')=='category_id'){
                $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html('');
                var scorrect=validatorToolBox[validatorConfig['category_id']]('category_id'),
                    tcorrect=validatorToolBox[validatorConfig['type_id']]('type_id');
                if(!scorrect){
                    $('.attr-container').hide().find('.querywrap').hide();
                    return;
                }
                if(scorrect&&tcorrect){
                    attrArr=[];
                    attrCArr=[];
                    $('.attr-container .querywrap').html('');
                    $('.attr-container').css('display','flex');
                    getImgAttr(idval,$('#type_id').val());
                }
                fileinit([],[],fileFlag);
            }else if(ele.find('.val_id').attr('id')=='type_id'){
                var scorrect=validatorToolBox[validatorConfig['category_id']]('category_id'),
                    tcorrect=validatorToolBox[validatorConfig['type_id']]('type_id');
              if(!tcorrect){
                return;
              }
                if(scorrect&&tcorrect){
                    attrArr=[];
                    attrCArr=[];
                    $('.attr-container .querywrap').html('');
                    $('.attr-container').css('display','flex');
                    getImgAttr($('#category_id').val(),idval);
                }
              $('#group_id').val('').siblings('.el-input').val('--请选择--');
              imgGroup(idval);
            }else if(ele.find('.val_id').attr('id')=='group_id'){
              var correct=validatorToolBox[validatorConfig['type_id']]('type_id');
              if(!correct){
                $('#code').val('');
                return;
              }
              if(mActionFlag=='add'){
                var typeCode=$('.el-form-item.category .el-select-dropdown-item.selected').attr('data-code')+$('.el-form-item.group .el-select-dropdown-item.selected').attr('data-code');
                getCode(typeCode);
              }
            }else if(ele.find('.val_id').attr('id')=='img_source'){
                getImgSelectAttr(idval);
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    $('body').on('click','.el-select:not(.noedit,.el-search)',function(e){
        e.stopPropagation();
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').find('.errorMessage').html('').removeClass('active');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //单选按钮点击事件
    $('body').on('click','.el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');     
    });
    //checkbox
    $('body').on('click','.el-checkbox_input.attr-check',function(){
      // $(this).addClass('is-checked');
      $(this).toggleClass('is-checked');
      var id=Number($(this).attr('data-id')), data=$(this).parent().data('attrItem'), ids=getAttrIds(attrCArr);

      if(!$(this).hasClass('is-checked')){
        index=ids.indexOf(id);
        attrCArr.splice(index,1);
      }else{
        if(ids.indexOf(id)==-1){
          attrCArr.push(data);
        }
      }
      console.log(attrCArr)
    });

    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly],.el-input-search)',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
    }).on('blur','.el-input:not([readonly],.el-input-search),.el-textarea',function(){
        if(!$(this).hasClass('attr_val')){
            var name=$(this).attr("id");
            validatorConfig[name] 
            && validatorToolBox[validatorConfig[name]] 
            && validatorToolBox[validatorConfig[name]](name)
            && remoteValidatorConfig[name] 
            && remoteValidatorToolbox[remoteValidatorConfig[name]] 
            && remoteValidatorToolbox[remoteValidatorConfig[name]](name);
        }
    });
    $('body').on('click','.find-same',function (e) {
      e.stopPropagation();
      e.preventDefault();
      sameAjax={
        drawing_attributes: JSON.stringify(createPicAttr()),
        _token: TOKEN
      };
      sameImg();
    });
    //添加按钮点击
    $('body').on('click','.submit:not(.is-disabled)',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
            var correct=1;
            for (var type in validatorConfig) {
                correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                if(!correct){
                    break;
                }
            }
            if(correct){
                $(this).addClass('is-disabled');
                var data={},
                  category_id=$('#category_id').val(),
                  group_id=$('#group_id').val(),
                  code=$('#code').val(),
                  name=$('#name').val(),
                  comment=$('#comment').val(),
                  drawing_attributes=JSON.stringify(createPicAttr()),
                  drawing_id=$('.file-wrap .file-preview-frame').attr('drawing_id');
                  data={
                    category_id: category_id,
                    group_id: group_id,
                    code: code,
                    name: name,
                    comment: comment,
                    drawing_attributes: drawing_attributes,
                    drawing_id: drawing_id,
                    _token: TOKEN
                  };
                  if(mActionFlag=='add'){
                    save(data);
                  }else {
                    getLinkData();
                    var countFlag=true;
                    imgchecks.forEach(function (citem) {
                      if(citem.count==''||citem.count==0){
                        countFlag=false;
                        return false;
                      }
                    });
                    if(!countFlag){
                      LayerConfig('fail','关联图计数必填!');
                      $('.el-tap[data-item=linkImage]').click();
                      $('.submit.is-disabled').removeClass('is-disabled');
                      return false;
                    }
                    var linkstr=[];
                    imgchecks.forEach(function (item) {
                      var obj={
                        link_id: item.drawing_id,
                        count: item.count,
                        description: item.description
                      };
                      linkstr.push(obj);
                    });
                    data.drawing_id= img_id;
                    if($('.file-wrap .file-preview-frame').attr('drawing_temp_id')){
                      data.drawing_temp_id=$('.file-wrap .file-preview-frame').attr('drawing_temp_id');
                    }
                    data.links=JSON.stringify(linkstr);
                    data.attachments=JSON.stringify(getFujianData());
                    edit(data);
                  }
            }
        }
    });
    $('body').on('click','.showAssemblyDrawingPicture',function (e) {
        e.stopPropagation();
        showPictureModal($(this).attr('data-id'));
    });
    $('body').on('click','.careLable_table .delete',function () {
        $(this).parents().parents().eq(0).remove();
    });
    $('body').on('click','.careLable_table .add',function () {
        var code = $(this).attr('data-code');
        var name = $(this).attr('data-msg');
        var bgc = $(this).attr('data-bgc');
        var index = name.lastIndexOf('.');
        var material_code_name = name.slice(0,index);
        var tr = `<tr data-drawing-id="${code}">
                        <td style='background: ${bgc}'>${name}</td>
                        <td><input type="text" placeholder="请输入销售单号" class="sale_order_code"></td>
                        <td><input type="text" placeholder="请输入行项号"  class="line_project_code" maxlength="6" onKeyUp="value=value.replace(/[^\\d|chun]/g,'')"></td>
                        <td><input type="text" placeholder="请输入物料号" class="material_code" readonly value="${material_code_name}"></td>
                        <td><input type="text" placeholder="请输入版本号" class="version_code"></td>
                        <td>
                            <i data-code="${code}" data-msg="${name}" data-bgc="${bgc}" class="fa fa-plus-square oper_icon add" title="添加" style="font-size: 18px;color: #20a0ff;"></i>
                            <i data-code="${code}" data-msg="${name}" class="fa fa-minus-square oper_icon delete" title="删除"  style="margin-right: 10px;font-size: 18px;"></i>
                        </td>
                    </tr>`;
        $(this).parents().parents().eq(0).after(tr);
    });
    $('body').on('blur','.line_project_code',function (e) {
        e.stopPropagation();
        var str = $(this).val();
        if(str.length<6){
            $(this).val((Array(6).join(0) + str).slice(-6));
        }
    })
}

    