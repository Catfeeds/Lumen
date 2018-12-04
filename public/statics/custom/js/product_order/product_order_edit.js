var layerModal,
creator_token='',
ajaxTopData={
  order: 'desc',
  sort: 'id'
},
ajaxData={
  order: 'desc',
  sort: 'id'
},
pageNo=1,
pageNo1=1,
materialData=[],
bomShowData={},
itemAddFlag=1,
replaceId='',
topMaterial={},
ajaxSubmitData={},
codeCorrect=!1,
nameCorrect=!1,
materialCorrect=!1,
bomChildrenCorrect=!1,
versionCorrect=!1,
operationCorrect=!1,
mActionFlag='add',
bom_id='',
bomProduct = '',
go=true,
operationSource=[],
abilitySource=[],
ability_pluck=[],
noEditField = ['basic_material_id','basic_qty','basic_scrap','basic_start_date','basic_end_date'],
validatorToolBox={
    checkCode: function($name){
        var value=$name.val().trim();
        return $name.parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):Validate.checkNull(value)?(showInvalidMessage($name,"物料清单编码不能为空"),codeCorrect=!1,!1):
        !Validate.checkItemno(value)?(showInvalidMessage($name,"物料清单编码由4-20位字母数字下划线组成"),codeCorrect=!1,!1):
        (codeCorrect=1,!0);
    },
    checkLossrate: function($name){
        var value=$name.val().trim();
        if(isNaN(value)||value<0){
          $name.val(0);
        }else if(value>=100){
          $name.val(99.99);
        }else if(!(/^\d+(\.\d{1,2})?$/g.test(value))){
          var str=value.toString(),
          index=str.indexOf('.');
          if(index>-1){
            var newStr='';
            str.length>=index+3?(newStr=str.substring(0,index+3)):(newStr=str.substring(0,index));
            $name.val(Number(newStr));
          }else{
            $name.val(0);
          }
        }
        return 1;
    },
    checkName: function($name){
        var value=$name.val().trim();
        return $name.parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):Validate.checkNull(value)?(showInvalidMessage($name,"物料清单名称不能为空"),nameCorrect=!1,!1):
        (nameCorrect=1,!0);
    },
    checkOperationId: function ($name) {
        var value=$name.val();
        if(value== '--请选择--'){
            value='';
        }
        return $name.parents('.el-form-item').find('.errorMessage').hasClass('active')?(operationCorrect=!1,!1):
            Validate.checkNull(value)?(showInvalidMessage($name,"请选择工序"),operationCorrect=!1,!1):
                (operationCorrect=1,!0);
    },
    checkMaterial: function($name){
      var val=$name.data('topMaterial');
      return $name.parents('.el-form-item').find('.errorMessage').hasClass('active')?(materialCorrect=!1,!1):val==undefined||val!=undefined&&val.material_id==undefined?(showInvalidMessage($name,"物料编码不能为空"),materialCorrect=!1,!1):
        (materialCorrect=1,!0);
    },
    checkBomChildren: function(data){
        if(data.children != undefined){
            return data.children.length?(bomChildrenCorrect=1,!0):(bomChildrenCorrect=!1,!1);
        }

    },
    checkVersion: function(){
      if(!$('.ma-tritem.is-version-tr').length){
        versionCorrect=1; 
      }else{
        versionCorrect=1;
        $('.ma-tritem.is-version-tr').each(function(){
          if($(this).find('#is-version').val()==''||$(this).find('#is-version').siblings('.el-input').val()=='--请选择--'){
            versionCorrect=!1;
            return false;
          }
        });
      }
      return versionCorrect;
    }
},
remoteValidatorToolbox={
    remoteCheckCode: function(name){
        var value=$('#'+name).val().trim();
        getUnique(name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                codeCorrect=!1;
                var val='已注册';
                showInvalidMessage($('#'+name),val);
            }else{
                codeCorrect=1;
            }
        });
    },
    remoteCheckName: function(name){
        var value=$('#'+name).val().trim();
        getUnique(name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                nameCorrect=!1;
                var val='已注册';
                showInvalidMessage($('#'+name),val);
            }else{
                nameCorrect=1;
            }
        });
    },
    remoteMaterial: function(name){
      var value=$('#'+name).data('topMaterial').material_id;
      getUnique(name,value,function(rsp){
          if(rsp.results&&rsp.results.exist){
              materialCorrect=!1;
              var val='该物料已存在bom';
              $('.bom-button.bom-add-new-item').addClass('is-disabled');
              $('.el-form-item-label.show-material').removeClass('mater-active');
              showInvalidMessage($('#'+name),val);
          }else{
              $('.bom-button.bom-add-new-item').removeClass('is-disabled');
              $('.el-form-item-label.show-material').addClass('mater-active');
              $('#material_id').parents('.el-form-item').find('.errorMessage').removeClass('active').html('');
              materialCorrect=1;
          }
      });
    }
},
validatorConfig = {
    bom_children: "checkBomChildren",
    iversion: "checkVersion",
    code: 'checkCode',
    loss_rate: "checkLossrate",
    name: "checkName",
    material_id: "checkMaterial",
    // basic_operation_id:"checkOperationId"
},remoteValidatorConfig={
    code: 'remoteCheckCode',
    // name: 'remoteCheckName',
    material_id: 'remoteMaterial',
    operation_id:"checkOperationId"
};
var tabError={
  'orderBasic_from':['name','code','material_id','operation_id'],
  };

$(function () {

    // creator_token=getCookie("session_emi2c_mlily_demo");
    creator_token='88t8r9m70r2ea5oqomfkutc753';
    var url=window.location.pathname.split('/');
    if(url.indexOf('productOrderEdit')>-1){
        mActionFlag='edit';
        bom_id=getQueryString('id');
        // bomDesign=getQueryString('design')||'';
        // bomProduct = getQueryString('product') || '';
        bom_id!=undefined?getProductOrderInfo(bom_id):LayerConfig('fail','url链接缺少id参数，请给到id参数');
        noEditField.forEach(function (item,index) {
            $('#'+item).attr('readonly','readonly');
        })
    }
    bindEvent();
});

//显示错误信息
function showInvalidMessage($name,val){
  $name.parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
}
//附件初始化
function fileinit(ele,preUrls,preOther){
    $('#'+ele).fileinput({
        'theme': 'explorer-fa',
        language: 'zh',
        uploadAsync:true,
        'uploadUrl':URLS['order'].uploadAttachment,
        uploadExtraData: function(previewId, index){
            var obj = {};
            obj.flag = 'bom';
            obj._token=TOKEN;
            obj.creator_token=creator_token;
            return obj;
        },
        initialPreview: preUrls,
        initialPreviewConfig: preOther,
        dropZoneEnabled:false,
        showCaption: false,
        showClose: false,
        showUpload: false,
        showRemove: false,
        maxFileSize: 10*1024,
        maxFileCount: 1,
        overwriteInitial: false,
        showCancel: false
    }).on('fileselect', function(event, numFiles, label) {
        $(this).fileinput("upload");
    }).on('fileloaded', function(event, file, previewId, index, reader) {
        $('#'+previewId).attr('data-preview','preview-'+file.lastModified);
    }).on('fileuploaded', function(event, data, previewId, index) {
        var result=data.response,
        file=data.files[0];
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
function bindPagenationClick(totalData,pageSize,pageno){
    $('#pagenation').show();
    $('#pagenation').pagination({
    totalData:totalData,
    showData:pageSize,
    current: pageno,
    isHide: true,
    coping:true,
    homePage:'首页',
    endPage:'末页',
    prevContent:'上页',
    nextContent:'下页',
    jump: true,
    callback:function(api){
        pageno=api.getCurrent();
        itemAddFlag==3?(pageNo=pageno,getTopMaterialList()):(pageNo1=pageno,getMaterialList(topMaterial.material_id));
    }
});
}

//获取生产订单信息
function getProductOrderInfo(id) {
    AjaxClient.get({
        url: URLS['order'].orderShow+"?"+_token+'&product_order_id='+id,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){

                var order = rsp.results.order,bom = rsp.results.bom;
                if(order != '{}'){
                    showOrderBasicInfo(order);
                }
                // console.log(bom.id)
                if(bom.id){
                    setBomData(bom);
                    getBOMGroup(bom.bom_group_id);
                    var obj = JSON.parse(bom.bom_tree);
                    getProcedureSource(obj.item_no,obj.operation_id,obj.operation_ability);
                }
            }
        },
        fail: function(rsp){

            console.log('获取生产订单详细信息失败');
        }
    },this);
}

function showOrderBasicInfo(data) {
    var basicForm = $('#orderBasic_from');
    ajaxSubmitData.manufacture_bom_id=data.manufacture_bom_id;
    basicForm.find('#basic_material_id').val(data.material_name).attr('data-id',data.product_id);
    basicForm.find('#basic_qty').val(data.qty);
    basicForm.find('#basic_scrap').val(data.scrap);
    basicForm.find('#basic_start_date').val(data.start_date);
    basicForm.find('#basic_end_date').val(data.end_date);
    basicForm.find('#routing_name').val(data.routing_name);
    basicForm.find('#sales_order_code').val(data.sales_order_code);
    basicForm.find('#priority_id').val(data.priority);
    if (data.remark){
        basicForm.find('#remark').val(data.remark);
    }else{
        basicForm.find('#remark').val('暂无信息');
    }
    if (data.unit){
        basicForm.find('#unit_name').val(data.unit);
    }else{
        basicForm.find('#unit_name').val('无');
    }

    var priority_text = '';
    if (data.priority == 1){
        priority_text = '低';
    }else if (data.priority == 2){
        priority_text = '中';
    }else if (data.priority == 3){
        priority_text = '高';
    }else if (data.priority == 4){
        priority_text = '紧急';
    }else{
        priority_text = '无';
    }
    basicForm.find('#priority').val(priority_text);

}
//获取物料信息
function getMaterialInfo(id,flag,version){
  AjaxClient.get({
        url: URLS['order'].materialShow+"?"+_token+"&material_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
          layer.close(layerLoading);
          if(rsp&&rsp.results){

            materialDetailInfoModal(rsp.results,flag,version);
          }else{
            console.log('获取物料信息失败');
          }
        },
        fail: function(rsp){
          layer.close(layerLoading);
          console.log('获取物料信息失败');
        }
    },this);
}

//获取物料分类
function getCategory(){
  AjaxClient.get({
        url: URLS['order'].category+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
          layer.close(layerLoading);
          if(rsp&&rsp.results&&rsp.results.length){
            var catehtml=treeList(rsp.results,rsp.results[0].parent_id,'fake');
            $('.selectMaterial_tree .bom-tree').html(catehtml);
            setTimeout(function(){//填充数据
              if(itemAddFlag==3){
                ajaxTopData.material_category_id!=undefined&&
                ajaxTopData.material_category_id!=''?$('.selectMaterial_tree .bom-tree').
                find('.item-name[data-post-id='+ajaxTopData.material_category_id+']').addClass('selected'):null;
                $('.selectMaterial_table').find('#item_no').val(ajaxTopData.item_no);
                $('.selectMaterial_table').find('#name').val(ajaxTopData.name);
              }else{
                ajaxData.material_category_id!=undefined&&
                ajaxData.material_category_id!=''?$('.selectMaterial_tree .bom-tree').
                find('.item-name[data-post-id='+ajaxData.material_category_id+']').addClass('selected'):null;
                $('.selectMaterial_table').find('#item_no').val(ajaxData.item_no);
                $('.selectMaterial_table').find('#name').val(ajaxData.name);
                ajaxData.has_bom!=undefined&&ajaxData.has_bom!=''?$('.selectMaterial_table').find('.el-form-item.has_bom .el-select-dropdown-item[data-id='+ajaxData.has_bom+']').click():null;
              }
            },100);
          }else{
            console.log('获取物料分类失败');
          }
        },
        fail: function(rsp){
          layer.close(layerLoading);
          console.log('获取物分类失败');
        }
    },this);
}

//获取顶级物料
function getTopMaterialList(){
  var urlLeft='';
    urlLeft+="&page_no="+pageNo+"&page_size=6";
    $('.selectMaterial_table .table-container .table_tbody').html('');
  AjaxClient.get({
    url: URLS['bomAdd'].bomMother+"?"+_token+urlLeft,
    data: ajaxTopData,
    dataType: 'json',
    beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
    success: function(rsp){
      layer.close(layerLoading);
      var totalData=rsp.paging.total_records;
      if(totalData!=0&&pageNo>Math.ceil(totalData/6)){
        pageNo=1;
        getTopMaterialList();
        return;
      }
      if(rsp.results&&rsp.results.length){
        createMaterialTable($('.selectMaterial_table .table_tbody'),rsp.results);
      }else{
        var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('.selectMaterial_table .table-container .table_tbody').html(tr);             
      }  
      if(totalData>5){
          bindPagenationClick(totalData,6,pageNo);
      }else{
          $('#pagenation').html('');
      }      
    },
    fail: function(rsp){
      layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
      var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
      $('.selectMaterial_table .table-container .table_tbody').html(tr);
    },
    complete: function(){
        // $('#searchMAttr_from .submit').removeClass('is-disabled');
    }
  },this);
}

//获取物料列表
function getMaterialList(bom_material_id){
  var urlLeft='';
    urlLeft+="&page_no="+pageNo1+"&page_size=6&bom_material_id="+bom_material_id;
    $('.selectMaterial_table .table-container .table_tbody').html('');
  AjaxClient.get({
    url: URLS['order'].bomItem+"?"+_token+urlLeft,
    data: ajaxData,
    dataType: 'json',
    beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
    success: function(rsp){
      layer.close(layerLoading);
      var totalData=rsp.paging.total_records;
      if(totalData!=0&&pageNo1>Math.ceil(totalData/6)){
        pageNo1=1;
        getMaterialList(bom_material_id);
        return;
      }
      if(rsp.results&&rsp.results.length){
        createMaterialTable($('.selectMaterial_table .table_tbody'),rsp.results);
      }else{
        var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('.selectMaterial_table .table-container .table_tbody').html(tr);             
      }  
      if(totalData>5){
          bindPagenationClick(totalData,6,pageNo1);
      }else{
          $('#pagenation').html('');
      }      
    },
    fail: function(rsp){
      layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
      var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
      $('.selectMaterial_table .table-container .table_tbody').html(tr);
    },
    complete: function(){
        // $('#searchMAttr_from .submit').removeClass('is-disabled');
    }
  },this);
}

//给从这个页面打开的页面调用
function pagegetMaterial(){
  getMaterialList(topMaterial.material_id);
}

//获取bom分组
function getBOMGroup(val){
    AjaxClient.get({
        url: URLS['order'].bomGroupSelect+"?"+_token,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.bom_group_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.bom_group').find('.el-select-dropdown-list').html(innerhtml);
                if(val){
                  $('.el-form-item.bom_group').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }    
        },
        fail: function(rsp){
            console.log('获取物料清单分组失败');
        }
    },this);
}
//获取bom树
function getBomTree(id,version) {
    AjaxClient.get({
        url: URLS['order'].bomTree+"?"+_token+'&bom_material_id='+id+'&version='+version+'&bom_item_qty_level=1&replace=1',
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                var ids=getIds(materialData,'material');
                var index=ids.indexOf(Number(id));
                materialData[index].children=rsp.results.children;
                if($('.ma-tritem[data-id='+id+']').length){
                  $('.ma-tritem[data-id='+id+']').data('matableItem').children=rsp.results.children;
                }
            }    
        },
        fail: function(rsp){
            console.log('获取物料清单分组失败');
        }
    },this); 
}

//获取设计bom
function getDesignBom(id,flag,version) {
    AjaxClient.get({
        url: URLS['order'].bomDesign+"?"+_token+'&material_id='+id,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
              if(flag=='pop'){
                var trs=createDesignTable(rsp.results);
                $('.materialInfo_table .t-body').html(trs);
                if(version!=0){
                  $('.materialInfo_table .t-body').find('.tr-bom-item[data-version='+version+']').click();
                }else{
                  $('.materialInfo_table .t-body').find('.tr-bom-item:first-child').click();
                }
              }else{
                var trs=createMainDesignTable(rsp.results);
                $('#addDesignBom_from .design_main_table .t-body').html(trs);
              }
            }    
        },
        fail: function(rsp){
            console.log('获取物料清单分组失败');
        }
    },this); 
}
//获取设计bom树
function getDesignBomTree(id,version) {
    AjaxClient.get({
        url: URLS['order'].bomTree+"?"+_token+'&bom_material_id='+id+'&version='+version+'&bom_item_qty_level=1&replace=1',
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
              createRealBom(rsp.results,function(bomHtml){
                $('.materialInfo_tree .bom-tree').html(bomHtml);
              },'noedit');
            }    
        },
        fail: function(rsp){
            console.log('获取物料清单分组失败');
        }
    },this); 
}

//制造bom添加提交
function bomProductSubmit() {

    var basicForm=$('#orderInfo_from');
    var ver=basicForm.find('#code').data('subVersion');

    ajaxSubmitData.version = ver.version;
    ajaxSubmitData.version_description = ver.version_description;
    console.log(ajaxSubmitData)
    AjaxClient.post({
        url:URLS['order'].productAdd,
        data: ajaxSubmitData,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            $('.submit.save').removeClass('is-disabled');

            LayerConfig('success','编辑成功',function(){
                $('.el-tap[data-item=orderBasic_from]').click();
            });

        },
        fail:function (rsp) {
            layer.close(layerLoading);

            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message,function(){
                    if(rsp&&rsp.field!==undefined&&rsp.field!=""){
                        for(var key in tabError){
                            if(tabError[key].indexOf(rsp.field)>-1){
                                $('.el-tap[data-item='+key+']').click();
                                setTimeout(function(){
                                    showInvalidMessage(rsp.field,rsp.message);
                                },200);
                                break;
                            }
                        }
                    }
                });
            }
            $('.submit.save').removeClass('is-disabled');
        }
    },this)
}

//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';
    if(mActionFlag=='add'){
        urlLeft=`&field=${field}&value=${value}`;
    }else if(mActionFlag=='edit'&&bom_id!=''){
        urlLeft=`&field=${field}&value=${value}&id=`+bom_id;
    }
    var xhr=AjaxClient.get({
        url: URLS['order'].unique+"?"+_token+urlLeft,
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

//填充bom数据
function setBomData(data){
    var productBomData;
    if(typeof data.bom_tree == 'string'){
        productBomData=JSON.parse(data.bom_tree);
    }else{
        productBomData=JSON.stringify(data.bom_tree);
    }
    bomShowData=productBomData;
    topMaterial=productBomData;

  //填充基础数据
  var basicForm=$('#orderInfo_from');
  basicForm.find('#code').val(data.code).attr('readonly','readonly').data('subVersion',data);
  basicForm.find('#name').val(data.name);
  basicForm.find('#loss_rate').val(data.loss_rate);
  basicForm.find('#qty').val(data.qty);
  basicForm.find('#description').val(data.description);
  basicForm.find('#material_id').val(productBomData.name).data('topMaterial',topMaterial).attr('readonly','readonly').
  siblings('label').addClass('mater-active').siblings('.choose-material').hide();

  basicForm.find('.bom-add-new-item').removeClass('is-disabled');
  // basicForm.find('.el-form-item.version').show();
  // basicForm.find('#version').val(data.version);
  // basicForm.find('#version_description').val(data.version_description);
  //添加项
  materialData=[];
  if(productBomData.children&&productBomData.children.length){
      productBomData.children.forEach(function(item){
      item.itemAddFlag=1;
      materialData.push(item);
      if(item.replaces&&item.replaces.length){//替代物料
        item.replaces.forEach(function(reitem){
          reitem.itemAddFlag=2;
          reitem.replaceItemId=item.material_id;
          materialData.push(reitem);
        });
      }
    })
  }
  createMaterialItem(materialData);
  actParentTree(bomShowData);
  //附件
  var preurls=[],predata=[];

  if(data.attachments&&data.attachments.length){
      data.attachments.forEach(function(item){
          var url=window.storage+item.path,preview='';
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
              size: item.size,
              url: URLS['order'].orderList+'?page_no=1&page_size=5'
          };
          preurls.push(preview);
          predata.push(pitem);
      });
  }
  fileinit('attachment',preurls,predata);
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
          //下载
          if (data.attachments && data.attachments.length) {
              data.attachments.forEach(function (item) {
                  var attachment_dowload = $('#orderFile_from').find('tr[attachment_id=' + item.attachment_id + ']').eq(0);
                  if (item.is_from_erp == 0) {
                      var a = `<a href="${window.storage + item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                      if (!attachment_dowload.find('.attch-download').length) {
                          attachment_dowload.find('.file-footer-buttons').append(a);
                      }
                  } else if (item.is_from_erp == 1) {
                      var a = `<a href="${item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                      if (!attachment_dowload.find('.attch-download').length) {
                          attachment_dowload.find('.file-footer-buttons').append(a);
                      }
                  }


              });
          }
      }
  },1000);
}

function createBomProductData(treedata) {

    var basicForm=$('#orderInfo_from');
    ajaxSubmitData.code=basicForm.find('#code').val().trim();
    ajaxSubmitData.name=basicForm.find('#name').val().trim();
    ajaxSubmitData.material_id=basicForm.find('#material_id').data('topMaterial').material_id;
    ajaxSubmitData.loss_rate=basicForm.find('#loss_rate').val().trim();
    ajaxSubmitData.bom_group_id=basicForm.find('#bom_group_id').val().trim();
    ajaxSubmitData.qty=basicForm.find('#qty').val().trim();
    ajaxSubmitData.description=basicForm.find('#description').val().trim();
    ajaxSubmitData.cookie=creator_token;
    ajaxSubmitData._token=TOKEN;
    createFujianData();
    var bom_tree = [];
    if(treedata.children&&treedata.children.length){
        treedata.children.forEach(function(item){

            var bomObj={
                item_no:item.item_no,
                name:item.name,
                bom_material_id: ajaxSubmitData.material_id,
                bom_item_id: item.bom_item_id||0,
                material_id: item.material_id,
                loss_rate: item.loss_rate,
                is_assembly: item.is_assembly||0,
                usage_number: item.usage_number,
                has_bom: item.has_bom,
                comment: item.comment,
                version: item.version||0,
                bom_item_qty_levels: item.bom_item_qty_levels||[],
                son_material_id: item.son_material_id,
                total_consume: item.total_consume||'',
                replaces:[]
            };
            if(item.replaces&&item.replaces.length){
                item.replaces&&item.replaces.forEach(function(ritem){
                    var replaceObj={

                        item_no:ritem.item_no,
                        name:ritem.name,
                        bom_material_id: ajaxSubmitData.material_id,
                        bom_item_id: ritem.bom_item_id||0,
                        material_id: ritem.material_id,
                        loss_rate: ritem.loss_rate,
                        is_assembly: ritem.is_assembly||0,
                        usage_number: ritem.usage_number,
                        has_bom: ritem.has_bom,
                        comment: ritem.comment,
                        version: item.version||0,
                        bom_item_qty_levels: ritem.bom_item_qty_levels||[],
                        son_material_id: ritem.son_material_id,
                        total_consume: ritem.total_consume||''
                    }
                    bomObj.replaces.push(replaceObj);
                });
            }
            bom_tree.push(bomObj);
        });
    }

    var subData = {
        material_id: basicForm.find('#material_id').data('topMaterial').material_id,
        name:basicForm.find('#material_id').val().trim(),
        item_no:basicForm.find('#material_id').data('topMaterial').item_no,
        // qty:basicForm.find('#qty').val().trim(),
        operation_id:basicForm.find('#basic_operation_id').val(),
        operation_ability:abilitySource.join(','),
        operation_ability_pluck:ability_pluck,
        children : []
    }
    subData.children=bom_tree;

    ajaxSubmitData.bom_tree = JSON.stringify(subData);

    console.log(ajaxSubmitData)
}

//存储附件数据
function createFujianData(){
    var ele=$('#orderFile_from .file-preview-frame.file-preview-success,#orderFile_from .file-preview-frame.init-success-file');
    var fujianData=[];
    ele.each(function(){
        var item={
            attachment_id: $(this).attr('attachment_id'),
            comment: $(this).find('.fujiantext').val().trim()
        };
        fujianData.push(item);
    });
    ajaxSubmitData.attachments=JSON.stringify(fujianData);
}

function createRealBom(treeData,fn,flag){
  var bomHtml='';
  if(treeData.children&&treeData.children.length){
    var bomitemHtml=treeList(treeData,0,flag);
    bomHtml=`<div class="tree-folder" data-id="${treeData.material_id}">
                 <div class="tree-folder-header">
                 <div class="flex-item">
                 <i class="icon-minus expand-icon"></i>
                 <div class="tree-folder-name"><p class="bom-tree-item top-item item-name ${flag}" data-pid="0" data-post-id="${treeData.material_id}">${treeData.name}</p></div></div></div>
                 <div class="tree-folder-content">
                   ${bomitemHtml}
                 </div>
              </div> `;
  }else{
    bomHtml=`<div class="tree-item" data-id="${treeData.material_id}">
              <div class="flex-item">
              <i class="item-dot expand-icon"></i>
              <div class="tree-item-name"><p class="bom-tree-item top-item item-name ${flag}" data-pid="0" data-post-id="${treeData.material_id}">${treeData.name}</p></div></div>  
            </div>`;
  }
  fn&&typeof fn=='function'?fn(bomHtml):null;
}
//扩展物料结构树
function treeList(data,pid,flag) {
    var bomTree = '';
    if(flag=='realBOM'||flag=='noedit'){
      data.children.forEach(function(item){
        var replaceStr='',replaceCss='';
        if(item.replaces!=undefined&&item.replaces.length){
          replaceStr='<span>替</span>';
          replaceCss='replace-item';
        }
        if(item.children&&item.children.length){
          bomTree += `<div class="tree-folder" data-id="${item.material_id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name"><p class="item-name bom-tree-item ${flag} ${replaceCss}" data-pid="${item.ppid||0}" data-post-id="${item.material_id}">${replaceStr}${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(item, 0,flag)}
                   </div>
                </div> `;
        }else{
          bomTree += `<div class="tree-item" data-id="${item.material_id}">
                <div class="flex-item">
                <i class="item-dot expand-icon"></i>
                <div class="tree-item-name"><p class="item-name bom-tree-item ${flag} ${replaceCss}" data-pid="${item.ppid||0}" data-post-id="${item.material_id}">${replaceStr}${item.name}</p></div></div>  
                </div>`;
        }
      });
    }else{
      var children = getChildById(data, pid);
      children.forEach(function (item,index) {
          var hasChild = hasChilds(data, item.id);
          if(hasChild){
              bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name"><p class="item-name ${flag}" data-post-id="${item.id}">${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id,flag)}
                   </div>
                </div> `;
          }else{
              bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name ${flag}" data-post-id="${item.id}">${item.name}</p></div></div>  
                </div>`;
          }
      });
    }
    return bomTree;
}

//操作树形结构,填充数据
function actTree(data,id,ppid,newData,replaceid){
  if(go==false){//阻止继续遍历下去
    return;
  }
  if(data.material_id==id&&data.ppid==ppid){
    //do something and break;
    if(newData){
      // console.log(newData);
      // console.log('添加')
      if(replaceid!=undefined){
        data.replaces&&data.replaces.forEach(function(item){
          if(item.material_id==replaceid){
            item.bom_item_qty_levels=newData.bom_item_qty_levels;
            item.total_consume=newData.total_consume;
            return false;
          }
        });
      }else{
        // console.log('添加2');
        data.bom_item_qty_levels=newData.bom_item_qty_levels;
        data.total_consume=newData.total_consume;
      } 
    }else{
      createMDetailInfo(data,true,ppid);
    }
    go=false;
    return;
  }else{
    if(data.children&&data.children.length){
      data.children.forEach(function(item){
        actTree(item,id,ppid,newData,replaceid);
      });
    }
  }
}

//删除树中的项
function deleteTreeItem(data,id,flag,replaceid){
  if(flag=='replace'){//删除替代物料
    data.children.forEach(function(item,index){
      if(item.material_id==id){
        actArray(data.children[index].replaces,'material',replaceid);
      }
    });
  }else{//删除物料
    actArray(data.children,'material',id);
  }
}

//为每一个子项加pid
function actParentTree(data){
  data.son_material_id=[];
  if(data.replaces&&data.replaces.length){
    data.replaces.forEach(function(item){
      item.son_material_id=[];
      if(item.children&&item.children.length){
        item.children.forEach(function(citem){
          item.son_material_id.push(citem.material_id);
          actParentTree(item);
        });
      }
    });
  }
  if(data.children&&data.children.length){
    data.children.forEach(function(item){
      item.ppid=data.material_id;
      data.son_material_id.push(item.material_id);
      actParentTree(item);
    });
  }
}

//构造每一个子项的详细内容
function createMDetailInfo(data,flag,ppid){
  var ele=$('#addExtend_from .bom_item_container'),
  eletap=ele.find('.el-tap-wrap'),
  topId=$('.bom-tree-item.top-item').attr('data-post-id');
  if(flag){
    eletap.removeClass('edit').html('');
    if(data.replaces!=undefined&&data.replaces.length){//有替代物料
      var span=`<span data-id="${data.material_id}" data-pid="${data.ppid}" class="el-tap el-ma-tap active">${data.name}</span>`;
      eletap.append(span).addClass('edit');
      eletap.find('span:last-child').data('spanItem',data);
      data.replaces.forEach(function(item){
        var span=`<span data-main-id="${data.material_id}" data-id="${item.material_id}" data-pid="${data.ppid}" class="el-tap el-ma-tap">${item.name}</span>`;
        eletap.append(span).addClass('edit');
        eletap.find('span:last-child').data('spanItem',item);
      });
    }
  }
  //基本信息
  ele.find('.mbasic_info .name span').html(data.name);
  ele.find('.mbasic_info .attr .show-material').attr({
    'data-id':data.material_id,
    'data-assembly': data.is_assembly||0,
    'data-version': data.version
  });
  //工艺路线
  //阶梯用量
  var qtyBtn='',qtyhtml='',
  consumInput='',consumhtml='',consumtr='';
  if(ppid==0){//顶级物料
    qtyhtml='';
  }else{
    if(ppid==topId){//bom的儿子
        qtyBtn = '';
        // consumInput = '';
      // qtyBtn=`<button type="button" class="bom-info-button add-qty" data-id="${data.material_id}" data-bom-item-id="${data.bom_item_id||0}">添加一行</button>`;
      consumInput=`<input type="number" readonly="readonly" style="width: 150px;"  class="bom-ladder-input total_consume" value="${data.total_consume||''}">`;
    }else{//bom的孙子
      qtyBtn='';
      data.total_consume==undefined||data.total_consume==''?consumInput='':
      consumInput=`<input type="number" readonly="readonly" style="width: 150px;"  class="bom-ladder-input total_consume" value="${data.total_consume}">`;
    }
    var qtytr='';
    if(data.bom_item_qty_levels&&data.bom_item_qty_levels.length){
      data.bom_item_qty_levels.forEach(function(item){
        if(ppid==topId){
          qtytr+=`<tr class="tritem" data-bom-qty-id="${item.bom_item_qty_level_id}" data-bom-item-id="${item.bom_item_id}">
              <td><input type="number" style="width: 150px;" class="bom-ladder-input parent_min_qty" value="${item.parent_min_qty}"></td>
              <td><input type="number" style="width: 150px;" class="bom-ladder-input qty" value="${item.qty}"><span class="fa fa-minus-circle qty-close"></span></td>           
          </tr>`;
        }else{
          qtytr+=`<tr class="tritem" data-bom-qty-id="${item.bom_item_qty_level_id}">
              <td>${item.parent_min_qty}</td>
              <td>${item.qty}</td>           
          </tr>`;
        }
      });
    }
    qtyhtml=qtyBtn.length||qtytr.length?`<div class="bom_blockquote qty">
        <h3>阶梯用量 ${qtyBtn}</h3>
        <div class="basic_info qty" style="display: ${qtytr.length?'':'none'};">
            <div class="table-container">
                <table class="bom_table qty_table">
                  <thead>
                    <tr>
                      <th class="thead">父项最小数量</th>
                      <th class="thead">用量</th>
                    </tr>
                  </thead>
                  <tbody class="t-body">${qtytr}</tbody>
                </table>
            </div>
        </div>
    </div>`:'';
  }
  ele.find('.bom_blockquote_wrap.qty').html(qtyhtml);

  //总单耗
  if(data.children&&data.children.length){
    data.children.forEach(function(item){
      consumtr+=`<tr class="tritem" data-id="${item.material_id}">
            <td>${item.item_no}</td>
            <td>${item.name}</td>
            <td>${item.usage_number}</td>            
        </tr>`;
    });
  }
  var consumhtml=consumInput.length||consumtr.length?`<div class="bom_blockquote">
       
        <div class="basic_info consum" style="display: ${consumtr.length?'':'none'};">
          <div class="table-container">
            <table class="bom_table qty_table">
              <thead>
                <tr>
                  <th class="thead">物料编码</th>
                  <th class="thead">名称</th>
                  <th class="thead">使用数量</th>
                </tr>
              </thead>
              <tbody class="t-body">${consumtr}</tbody>
            </table>
          </div>
        </div>
    </div>`:'';
  ele.find('.bom_blockquote_wrap.consum').html(consumhtml);
}

//获取id
function getIds(data,flag){
    var ids=[];
    if(flag=='material'){
        data.forEach(function(item){
            ids.push(item.material_id);
        });
    }else{
        data.forEach(function(item){
            ids.push(item.attribute_definition_id);
        });
    }
    return ids;
}

//操作数组
function actArray(data,flag,id){
    var ids=getIds(data,flag);
    var index=ids.indexOf(Number(id));
    data.splice(index,1);
}

//添加扩展数据
function addExtendData(id,ppid,replaceid){
  var maConEle=$('.bom_item_container'),
  newData={
    bom_item_qty_levels: [],
    total_consume: maConEle.find('.total_consume').length&&maConEle.find('.total_consume').val().trim()||''
  };
  if(maConEle.find('.basic_info.qty').is(':visible')&&maConEle.find('.parent_min_qty').length){
    maConEle.find('.basic_info.qty .tritem').each(function(){
      var parent_min_qty=$(this).find('.parent_min_qty').val().trim(),
      qty=$(this).find('.qty').val().trim();
      if(parent_min_qty!=''&&qty!=''){
        var qtyobj;
        if(mActionFlag=='add'){
          qtyobj={
            bom_item_qty_level_id: 0,
            bom_item_id: 0,
            parent_min_qty: parent_min_qty,
            qty: qty
          };
        }else{
          qtyobj={
            bom_item_qty_level_id: $(this).attr('data-bom-qty-id'),
            bom_item_id: $(this).attr('data-bom-item-id'),
            parent_min_qty: parent_min_qty,
            qty: qty
          };
        }
        newData.bom_item_qty_levels.push(qtyobj);
      }
    });
  }
  go=true;
  actTree(bomShowData,id,ppid,newData,replaceid);
}

//填充扩展数据操作
function actExtendData(){
  var former=$('.item-name.bom-tree-item.selected');
  //顶级物料的儿子才操作数据
  if(former.attr('data-pid')!=$('.bom-tree-item.top-item').attr('data-post-id')){
    return false;
  }
  if(former.find('span').length){//有替代物料,具体到替代物料的tab
    var reformer=$('.el-ma-tap.active'),
      reformerMId=reformer.attr('data-main-id'),
      reformerPId=reformer.attr('data-pid'),
      reformerREId=reformer.attr('data-id');
      reformerMId==undefined?addExtendData(reformerREId,reformerPId):addExtendData(reformerMId,reformerPId,reformerREId);
  }else{
    var formerMId=former.attr('data-post-id'),
    formerPId=former.attr('data-pid');
    addExtendData(formerMId,formerPId);
  }
}

//校验顶级bom
function checkTopBom(correct){
  if(correct){
      $('#addExtend_from .extend_wrap').show();
    var existData=JSON.parse(JSON.stringify(bomShowData)); 
    existData.children==undefined?existData.children=[]:null;
    bomShowData={};
    createExistBomData(existData);
  }else{
    $('#addExtend_from .extend_wrap').hide();
  }
}

function bindEvent() {
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    //弹窗关闭
    $('body').on('click','#materialModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('body').on('click','.bom-info-button',function(e){

        e.preventDefault();
    });
    //tap切换按钮
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){
        if(!$(this).hasClass('active')){
            if($(this).hasClass('el-ma-tap')){//替代物料相互切换
                actExtendData();
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var data=$(this).data('spanItem'),
                    ppid=$(this).attr('data-pid');
                createMDetailInfo(data,false,ppid);
            }else{
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var form=$(this).attr('data-item');
                if(form=='orderPic_from'){
                    var correct=validatorToolBox[validatorConfig['material_id']]($('#material_id'));
                    checkTopBom(correct);
                    var form1=$('#orderInfo_from');
                    bomShowData=form1.find('#material_id').data('topMaterial');
                    console.log(bomShowData)
                    showBomPic(bomShowData);
                }
                $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
                tapFlag=form;
                tabClick(form);
            }
        }
    });
    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    //下拉框点击事件
    $('body').on('click','.el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto,.ability-item)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            var idval=$(this).attr('data-id');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    //搜索按钮物料
    $('body').on('click','.choose-search',function(){
      if($(this).hasClass('choose-material')){
        var parentForm=$('.addBomItem');
        if(itemAddFlag==3){
          pageNo=1;
          ajaxTopData={
            material_category_id: parentForm.find('.item-name.selected').length&&parentForm.find('.item-name.selected').attr('data-post-id')||'',
            item_no: parentForm.find('#item_no').val(),
            name: parentForm.find('#name').val(),
            order: 'desc',
            sort: 'id'
          };
          getTopMaterialList();
        }else{
          pageNo1=1;
          ajaxData={
            material_category_id: parentForm.find('.item-name.selected').length&&parentForm.find('.item-name.selected').attr('data-post-id')||'',
            item_no: parentForm.find('#item_no').val(),
            name: parentForm.find('#name').val(),
            has_bom: parentForm.find('#has_bom').val(),
            order: 'desc',
            sort: 'id'
          };
          getMaterialList(topMaterial.material_id);
        }
      }
    });
    //树中节点点击
    $('body').on('click','.item-name:not(.noedit)',function(){
       
      var parele=$(this).parents('.bom_tree_container');
      if($(this).hasClass('bom-tree-item')){//bom的树
        if($(this).hasClass('selected')){
          return false;
        }
        actExtendData();
        parele.find('.item-name').removeClass('selected');
        $(this).addClass('selected');
        var id=$(this).attr('data-post-id'),
        ppid=$(this).attr('data-pid');
        go=true;
        actTree(bomShowData,id,ppid);
      }else{
        var material_category_id='';
        if($(this).hasClass('selected')){
          parele.find('.item-name').removeClass('selected');
          $(this).removeClass('selected');
        }else{
          parele.find('.item-name').removeClass('selected');
          $(this).addClass('selected');
          material_category_id=$(this).attr('data-post-id');
        }
       
        var parentForm=$('.addBomItem');
        if(itemAddFlag==3){
          pageNo=1;
          ajaxTopData={
            material_category_id: material_category_id,
            item_no: parentForm.find('#item_no').val(),
            name: parentForm.find('#name').val(),
            order: 'desc',
            sort: 'id'
          };
          getTopMaterialList();
        }else{
          pageNo1=1;
          ajaxData={
            material_category_id: material_category_id,
            item_no: parentForm.find('#item_no').val(),
            name: parentForm.find('#name').val(),
            has_bom: parentForm.find('#has_bom').val(),
            order: 'desc',
            sort: 'id'
          };
          getMaterialList(topMaterial.material_id);
        }
      }
    });
    //checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit,.operation-check)',function (e) {
        e.preventDefault();
        if($(this).hasClass('assembly-check')){
          $(this).toggleClass('is-checked');
          var id=$(this).attr('data-id');
          if($(this).hasClass('is-checked')){//选择组装
            getBomTree(id,$(this).attr('data-version'));
          }else{//选择不组装
            var ids=getIds(materialData,'material');
            var index=ids.indexOf(Number(id));
            materialData[index].children=[];
            $(this).parents('.ma-tritem').data('matableItem').children=[];
          }
        }else if(itemAddFlag==3){//选择物料
          $(this).addClass('is-checked').parents('.tritem').siblings('.tritem').find('.el-checkbox_input:not(.noedit)').removeClass('is-checked');
          topMaterial=$(this).parents('.tritem').data('materItem');
        }else if($(this).hasClass('material-check')&&itemAddFlag!=3){//添加项
          $(this).toggleClass('is-checked');
          var ids=getIds(materialData,'material');
          var data=$(this).parents('.tritem').data('materItem');
          if($(this).hasClass('is-checked')){
            if(ids.indexOf(data.material_id)==-1&&topMaterial.material_id!=data.material_id){
                data.itemAddFlag=itemAddFlag;
                if(itemAddFlag==2){//替换物料
                  data.replaceItemId=replaceId;
                  var itemIndex=ids.indexOf(Number(replaceId));
                  materialData[itemIndex].replaceFlag=true;
                  materialData.splice(itemIndex+1,0,data);
                }else{
                  materialData.push(data);
                }
            }
          }else{
            var index=ids.indexOf(Number(data.material_id));
            index>-1?materialData.splice(index,1):null;
          }
        }
    });

    //树形表格展开收缩
    $('body').on('click','.bom-tree .expand-icon',function(e){
        if($(this).hasClass('icon-minus')){
             $(this).addClass('icon-plus').removeClass('icon-minus');
             $(this).parents('.tree-folder-header').siblings('.tree-folder-content').hide();
        }else {
            $(this).addClass('icon-minus').removeClass('icon-plus');
            $(this).parents('.tree-folder-header').siblings('.tree-folder-content').show();
        }
    });

    //添加项
    $('body').on('click','.bom-add-item:not(.is-disabled)',function () {
      if($(this).hasClass('choose-material')){
        itemAddFlag=3;
      }else{
        var ele=$('.bom_table.item_table .t-body');
        materialData.forEach(function(item){
          var id=item.material_id,
          trele=ele.find('.ma-tritem[data-id='+id+']');
          item.loss_rate=trele.find('.loss_rate').val();
          item.usage_number=trele.find('.usage_number').val();
          item.comment=trele.find('.el-textarea').val();
          item.is_assembly=trele.find('.assembly-check.is-checked').length;
        });
        if($(this).hasClass('bom-button')){//添加项
          itemAddFlag=1;
        }else{//添加替换物料
          itemAddFlag=2;
          replaceId=$(this).attr('data-id');
        }
      }
      addBomItemModal();
    });
    //删除
    $('body').on('click','.bom-del',function () {
      var that=$(this);
      layer.confirm('将删除项?', {icon: 3, title:'提示',offset: '250px',end:function(){
      }}, function(index){
        if(that.hasClass('bom-item-del')){//删除项及下面的替代物料
          var ele=that.parents('.ma-tritem'),
          id=that.attr('data-id');
          $('.ma-tritem.tr-replace[data-replace-id='+id+']').each(function(){
            actArray(materialData,'material',that.attr('data-id'));
            $(this).remove();
          });
          actArray(materialData,'material',id);
          if(bomShowData.material_id!=undefined){
            deleteTreeItem(bomShowData,id,'item');
          }
          ele.remove();
        }else if(that.hasClass('bom-replace-del')){//删除替代物料
          var id=that.attr('data-replace-id'),
          replaceid=that.attr('data-id');
          actArray(materialData,'material',replaceid);
          if(bomShowData.material_id!=undefined){
            deleteTreeItem(bomShowData,id,'replace',replaceid);
          }
          that.parents('.ma-tritem').remove();
        }
        layer.close(index);
      });
    });
    //物料详细信息
    $('body').on('click','.show-material',function () {
      if($(this).hasClass("top-material")){
        if($(this).hasClass('mater-active')){
          var id=topMaterial.material_id;
          getMaterialInfo(id,'top');
        }
      }else{
        var id=$(this).attr('data-id');
        if($(this).attr('data-has-bom')==1){
          var curversion=$(this).attr('data-version');
          getMaterialInfo(id,'item',curversion);
        }else{
          getMaterialInfo(id,'top');
        }
      }
    });
    $('body').on('click','.bom-tap-wrap .bom-tap',function () {
        var form=$(this).attr('data-item');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.bom-tap').removeClass('active');
            if(form=='materialDesignBom_from'){
              var version=$(this).attr('data-version');
              getDesignBom($(this).attr('data-ma-id'),'pop',version);
            }
            $('#'+form).addClass('active').siblings().removeClass('active');
        }
    });
    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly])',function(){
        if(!$(this).hasClass('no-check')){
            $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
        }
    }).on('blur','.el-input:not([readonly],.el-input-search),.el-textarea',function(){
        var name='';
        if($(this).hasClass('loss_rate')){
          name='loss_rate';
        }else{
          name=$(this).attr("id")
        }
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]]($(this))
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name);
    }).on('input','.bom-ladder-input.parent_min_qty',function(){
      var that = $(this);
      var currentVal = $.trim(that.val());
      setTimeout(function () {
          if ($.trim(that.val()) === currentVal) {
              if ($.trim(that.val()) !== "") {
                var allqty=[];
                that.parents('.tritem').siblings('.tritem').each(function(){
                  allqty.push($(this).find('.bom-ladder-input.parent_min_qty').val().trim());
                });
                if(allqty.indexOf(currentVal)>-1){//填写了相同的父项用量
                  LayerConfig('fail','填写了相同的父项用量',function(){
                    that.val('');
                  });
                }
              }
          }
      }, 500);
    });
    //下拉框的相关事件
    $('body').on('focus','.el-select .el-input',function () {

        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-select .el-input',function () {
        var name=$(this).siblings('input').attr("id");
        var obj = $(this);
        setTimeout(function(){
            if(obj.siblings('input').val() == '') {
                validatorConfig[name]
                && validatorToolBox[validatorConfig[name]]
                && validatorToolBox[validatorConfig[name]](obj)
            }else{
                $('#'+name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);
    });
    //设计bom显示具体项
    $('body').on('click','.materialInfo_container .tr-bom-item',function(){
      if(!$(this).hasClass('active')){
        $(this).addClass('active').siblings('.tr-bom-item').removeClass('active');
        var id=$(this).attr('data-id'),
        version=$(this).attr('data-version');
        getDesignBomTree(id,version);
      }
    });
    $('body').on('click','.submit',function () {
        if($(this).hasClass('ma-item-ok')){
          if(itemAddFlag==3){//选择物料
            if(topMaterial.material_id!=undefined){
              if(topMaterial.material_id!=$('#material_id').attr('data-id')){//顶级物料改变，清空数据
                  bomShowData={};
                  materialData=[];
                  $('.operation-wrap .el-input').val("--请选择--");
                  $('.ability_wrap .el-input').val("--请选择--");
                  $('.ability_wrap .ability ul').html(`<li data-id="" class="el-select-dropdown-item kong ability-item" data-name="--请选择--">--请选择--</li>`)
                  $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
                  abilitySource=[];
                  operationSource=[];
                  $('#orderInfo_from .bom_table.item_table .t-body').html(`<tr>
                  <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                </tr>`);
              }

              $('#material_id').val(topMaterial.name).
              attr('data-id',topMaterial.material_id).data('topMaterial',topMaterial);
                getProcedureSource(topMaterial.item_no);
              $('.bom-button.bom-add-new-item').removeClass('is-disabled');
              $('.el-form-item-label.show-material').addClass('mater-active');
              $('#material_id').parents('.el-form-item').find('.errorMessage').removeClass('active').html('');
              // remoteValidatorToolbox['remoteMaterial']('material_id');

               if( $('#material_id').val() != '') {
                   $('.saveBtn .submit.save').attr('disabled',false)
               }

            }else{
              $('#material_id').val('').
              attr('data-id','').data('topMaterial',{});
              $('.bom-button.bom-add-new-item').addClass('is-disabled');
              $('.el-form-item-label.show-material').removeClass('mater-active');
              if(topMaterial.material_id!=$('#material_id').attr('data-id')){//顶级物料改变，清空数据
                  bomShowData={};
                  materialData=[];
                  $('#orderInfo_from .bom_table.item_table .t-body').html(`<tr>
                  <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                </tr>`);
              }
            }
          }else{
            createMaterialItem(materialData);//添加项
          }
          layer.close(layerModal);
        }else if($(this).hasClass('save')){//保存bom
          //先采集数据在做校验
          if($('.tap-btn-wrap .el-tap.active').attr('data-item')=='orderInfo_from'){//填充基础项信息
            var existData=JSON.parse(JSON.stringify(bomShowData)); 
            existData.children==undefined?existData.children=[]:null;
            bomShowData={};
            createExistBomData(existData);
          }else if($('.tap-btn-wrap .el-tap.active').attr('data-item')=='orderPic_from'){//填充扩展
            actExtendData();
          }
          var correct=1;
          for (var type in validatorConfig) {
              if(type=='bom_children'){
                correct=validatorConfig[type]&&
                      validatorToolBox[validatorConfig[type]](bomShowData);
              }else{
                correct=validatorConfig[type]&&
                      validatorToolBox[validatorConfig[type]]($('#'+type));
              }
              if(!correct){
                  break;
              }
          }
          if(correct){
            if($(this).hasClass('confirm-ok')){//编辑
                createBomProductData(bomShowData);
                bomProductSubmit();
            }
          }else{//必填字段不正确
            $('.el-tap[data-item=orderInfo_from]').click();
            if(!bomChildrenCorrect){
              LayerConfig('fail','物料清单必须有子项');
            }
          }
        }
    });

    $('body').on('click','.operation-item',function () {
        $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
        abilitySource=[];
        var _this = $(this);
        var _checkbox = $('.ability_wrap .ability ul');
        operationSource.forEach(function (item,index) {
            if(_this.attr('data-id') == ''){
                $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
                $('.ability_wrap .ability ul').html(`<li data-id="" class="el-select-dropdown-item kong ability-item" data-name="--请选择--">--请选择--</li>`)
                abilitySource=[];
            }
            if(_this.attr('data-id') == item.operation_id){
                _checkbox.html(`<li data-id="" class="el-select-dropdown-item kong ability-item" data-name="--请选择--">--请选择--</li>`)
                if(item.ability.length){
                    item.ability.forEach(function (lity) {
                        var innerHtml=`<li data-id="${lity.id}" data-name="${lity.ability_name}" class="el-select-dropdown-item ability-item">
                                         <span class="el-checkbox_input operation-check" data-checkname="${lity.ability_name}" data-checkId="${lity.id}">
                                         <span class="el-checkbox-outset"></span>
                                         <span class="el-checkbox__label">${lity.ability_name}</span>
                                         </span>
                                    </li>`;
                        _checkbox.append(innerHtml)
                    })
                }
            }
        })
    });

    var _checkRow={};
    $('body').on('click','.el-checkbox_input.operation-check',function () {
        $(this).toggleClass('is-checked');
        var id =$(this).attr('data-checkid');

        if($(this).hasClass('is-checked')){
            abilitySource.push(id);
            _checkRow[id] = $(this).attr('data-checkname');
            ability_pluck.push(_checkRow);
            _checkRow={};
        }else{
            for(var i=0;i<abilitySource.length;i++){
                if(id==abilitySource[i]){
                    abilitySource.splice(i,1);
                    ability_pluck.splice(i,1);
                }
            }
        }
        if(abilitySource.length){
            $('.ability_wrap .el-select').find('.el-input').val(abilitySource.length+'项被选中');
        }else{
            $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
        }
    })

    $('body').on('blur','#edit_usage_num',function () {
        var reg1 ="^[0-9]+.([0-9])+$",reg2="^[0-9]+/([0-9])+$",reg3="^[0-9]+$";
        var _reg1=new RegExp(reg1),_reg2=new RegExp(reg2),_reg3=new RegExp(reg3);
        var value = $(this).val(),test = _reg1.test(value) || _reg2.test(value) || _reg3.test(value);
        if(!test){
            $(this).val('')
        }
    })
}

//tab点击发异步
function tabClick(panel){
    $(window).scrollTop(0);
}
//已生成bom后修改项及顶级bom
function createExistBomData(existData){
  var form1=$('#orderInfo_from');
  bomShowData=form1.find('#material_id').data('topMaterial');
  bomShowData.ppid=0;
  bomShowData.usage_number=form1.find('#qty').val();
  form1.find('.ma-tritem').each(function(){
    var data=$(this).data('matableItem');
    data.loss_rate=$(this).find('.loss_rate').val().trim();
    data.usage_number=$(this).find('.usage_number').val().trim();
    data.comment=$(this).find('.el-textarea').val();
    data.is_assembly=$(this).find('.assembly-check.is-checked').length;
    var existIds=getIds(existData.children,'material');
    if($(this).hasClass('tr-replace')){//替代物料
      var existIndex=existIds.indexOf(Number($(this).attr('data-replace-id')));

      var replaceids=getIds(existData.children[existIndex].replaces,'material');
      var replaceIndex=replaceids.indexOf(data.material_id);
      if(replaceIndex==-1){//该替代物料为新增
        existData.children[existIndex].replaces.push(data);
      }else{//该替代物料已存在，修改该替代物料数据
        existData.children[existIndex].replaces[replaceIndex].loss_rate=data.loss_rate;
        existData.children[existIndex].replaces[replaceIndex].usage_number=data.usage_number;
        existData.children[existIndex].replaces[replaceIndex].comment=data.comment;
        existData.children[existIndex].replaces[replaceIndex].children=data.children||[];
        existData.children[existIndex].replaces[replaceIndex].is_assembly=data.is_assembly;
      }
    }else{
      var existIndex=existIds.indexOf(data.material_id);
      if(existIndex==-1){//该项为新添加项
        data.replaces=[];
        existData.children.push(data);
      }else{//该项已存在，修改该项数据
        existData.children[existIndex].loss_rate=data.loss_rate;
        existData.children[existIndex].usage_number=data.usage_number;
        existData.children[existIndex].comment=data.comment;
        existData.children[existIndex].children=data.children||[];
        existData.children[existIndex].is_assembly=data.is_assembly;
      }
    }
  });
  bomShowData.children=existData.children;
  actParentTree(bomShowData);
  // createRealBom(bomShowData,function(bomHtml){
  //   $('#addExtend_from .bom-tree').html(bomHtml);
  //   setTimeout(function(){
  //     $('#addExtend_from .bom-tree').find('.item-name.bom-tree-item').eq(0).click();
  //   },200);
  // },'realBOM');
}
//orgchart树形图
function showBomPic(data) {
    $('#orgchart-container').html('');
    var nodeTemplate = function (data) {
        return `<div class="title">
                   ${data.item_no}
                </div>
                <div class="content">
                    <p class="name" title="${data.name}"><span style="color: #666;">名称：</span>${data.name.length>6?data.name.substring(0,4)+'...':data.name}</p>
                    <p class="name"><span style="color: #666;">数量：</span>${data.usage_number==undefined? '': data.usage_number}${data.commercial!=undefined?'['+data.commercial+']':''}</p>
                </div>`;
    };
    $('#orgchart-container').orgchart({
        'data' : bomShowData,
        'zoom' : true,
        'pan' : true,
        'depth': 99,
        'exportButton': true,
        'exportFilename': `物料${data.name}的树形图`,
        'nodeTemplate': nodeTemplate,
        'createNode': function($node, data){
          var replaceClass=data.replaces!=undefined&&data.replaces.length ? 'nodeReplace': '';
          $node.addClass(replaceClass);
          if(data.bom_item_qty_levels&&data.bom_item_qty_levels.length){
          var secondMenuIcon = $('<i>', {
              'class': 'fa fa-info-circle second-menu-icon',
              'node-id':`${data.material_id}`,
               click: function(e) {
                  e.stopPropagation();
                  var that=$(this);
                  if($(this).siblings('.second-menu').is(":hidden")){    
                  $('.second-menu').hide();
                  $(this).siblings('.second-menu').show();
                  }else{
                      $(this).siblings('.second-menu').hide();   
                  }
              }
          });
          var trs='';
          data.bom_item_qty_levels.forEach(function(item){
            trs+=` <tr>
                  <td>${item.parent_min_qty}</td>
                  <td>${item.qty}</td>
              </tr>`;
          });
          var table=`<table class="bordered">
                <tr>
                    <th> 父项最小数量 </th>
                    <th> 用量 </th>
                </tr>
                ${trs}            
          </table>`;
          var secondMenu = `<div id="second-menu" class="second-menu">${table}</div>`;
          $node.append(secondMenuIcon).append(secondMenu);}
        }
    });
}
//添加项弹层
function addBomItemModal() {
  var has_bom='',width=33;
  if(itemAddFlag!=3){
    width=30;
    has_bom=`<div class="el-form-item has_bom" style="width: 30%;">
        <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 100px;text-align: right !important;">是否有bom结构</label>
            <div class="el-select-dropdown-wrap">
                <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="has_bom" value="">
                </div>
                <div class="el-select-dropdown" style="position: absolute;">
                    <ul class="el-select-dropdown-list">
                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                        <li data-id="1" class=" el-select-dropdown-item "><span>是</span></li>
                        <li data-id="0" class=" el-select-dropdown-item "><span>否</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
  }
    layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '950px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addBomItem formModal" id="">
          <div class="selectMaterial_container">
            <div class="selectMaterial_tree">
              <div class="bom_tree_container">
                  <div class="bom-tree"></div>
              </div>
            </div>
            <div class="selectMaterial_table">
               <ul class="query-item">
                    <li>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 92px;text-align: right !important;">物料编码</label>
                                <input type="text" id="item_no"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 90px;text-align: right !important;">名称</label>
                                <input type="text" id="name"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        ${has_bom}
                        <div class="el-form-item" style="width: 100%;">
                            <div class="el-form-item-div btn-group">
                                <button style="margin-top: 5px;" type="button" class="el-button el-button--primary choose-search choose-material">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
               <div class="table-container select_table_margin">
                  <div class="table-container table_page">
                        <div id="pagenation" class="pagenation"></div>
                        <table class="bom_table">
                          <thead>
                            <tr>
                              <th class="thead">选择</th>
                              <th class="thead">物料编码</th>
                              <th class="thead">名称</th>
                              <th class="thead" style="display: ${itemAddFlag==3?'none':''}">bom</th>
                              <th class="thead">创建人</th>
                              <th class="thead">物料分类</th>
                            </tr>
                          </thead>
                          <tbody class="table_tbody">
                          </tbody>
                        </table>
                  </div>
               </div>
            </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
            </div>
          </div>       
    </form>`,
    success: function(layero, index){
        getCategory();
        if(itemAddFlag==3){
          getTopMaterialList();
        }else{
          getMaterialList(topMaterial.material_id);
        }
    },
    cancel: function(layero, index){//右上角关闭按钮
      if(itemAddFlag!=3){//添加项的关闭
        if(materialData.length>$('#orderInfo_from .item_table .ma-tritem').length){
          materialData=[];
          $('.item_table .ma-tritem').each(function(){
            materialData.push($(this).data('matableItem'));
          });
        }
      }else{//选择物料的关闭
        topMaterial=$('#material_id').data('topMaterial')||{};
      }
    },
    end: function(){
      // pageNo=1;
      // pageNo1=1;
    }

    })
}
//详细信息弹层
function materialDetailInfoModal(data,flag,version) {
  var {material_id='',
    material_category_name='',
    name='',item_no='',
    batch_no_prefix='',
    moq='',description='',
    unit_name='',mpq='',weight='',
    length='',width='',height='',
    template_name='',material_attributes=[],
    operation_attributes=[],
    source=1,fixed_advanced_period='',
    cumulative_lead_time='',
    safety_stock='',max_stock='',min_stock='',
    low_level_code='',drawings=[],
    attachments=[]
  }={},
  attrData={
    material_attributes:[],
    operation_attributes:[]
  };
  if(data!=undefined&&data!=null){
    ({material_id='',
      material_category_name='',
      name='',item_no='',
      batch_no_prefix='',
      moq='',description='',
      unit_name='',mpq='',weight='',
      length='',width='',height='',
      template_name='无',material_attributes=[],
      operation_attributes=[],
      source=1,fixed_advanced_period='',
      cumulative_lead_time='',
      safety_stock='',max_stock='',min_stock='',
      low_level_code='',drawings=[],
      attachments=[]
    }=data);
    attrData={
      material_attributes: material_attributes,
      operation_attributes: operation_attributes
    };
  }
    layerModal = layer.open({
        type: 1,
        title: `物料${item_no}详细信息`,
        offset: '100px',
        area: ['900px','444px'],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<div class="bom-wrap-container" id="materialModal">
                    <div class="bom-wrap">
                        <div class="bom-tap-wrap">
                            <span data-item="materialBasicInfo_from" class="bom-tap active">基础信息</span>
                            <span data-item="materialAttribute_from" class="bom-tap">属性</span>
                            <span data-item="materialPlan_from" class="bom-tap">计划</span>
                            <span data-item="materialPic_from" class="bom-tap">图纸</span>
                            <span data-item="materialFile_from" class="bom-tap">附件</span>
                            <span data-ma-id="${material_id}" data-version="${version||0}" data-item="materialDesignBom_from" class="bom-tap" style="display: ${flag=='top'?'none':''}">设计Bom</span>
                        </div>  
                        <div class="bom-panel-wrap" style="padding-top: 10px;">
                            <div class="bom-panel active" id="materialBasicInfo_from">
                                <div class="material_block">
                                    <h3>基本信息</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料分类:</label>
                                                    <span>${tansferNull(material_category_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">批次号前缀:</label>
                                                    <span>${tansferNull(batch_no_prefix)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">名称:</label>
                                                    <span>${tansferNull(name)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小订单数量:</label>
                                                    <span>${tansferNull(moq)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料编码号:</label>
                                                    <span>${tansferNull(item_no)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">描述:</label>
                                                    <p class="des" title="${description}">${tansferNull(description)}</p>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div> 
                                <div class="material_block">
                                    <h3>包装设置</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">基本单位:</label>
                                                    <span>${tansferNull(unit_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装长度:</label>
                                                    <span>${tansferNull(length)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装数量</label>
                                                    <span>${tansferNull(mpq)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装宽度:</label>
                                                    <span>${tansferNull(width)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装重量:</label>
                                                    <span>${tansferNull(weight)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装高度:</label>
                                                    <span>${tansferNull(height)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bom-panel" id="materialAttribute_from">
                                  <div class="material_block">
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料模板:</label>
                                                    <span>${tansferNull(template_name)==''?'--无--':tansferNull(template_name)}</span>
                                                </div> 
                                            </div>
                                        </div>
                                    </div>
                                  </div> 
                                  <div class="material_block">
                                    <h3>物料属性</h3>
                                    <div class="basic_info">
                                        <div class="item attr_item">
                                          ${createAttrHtml(attrData,'self','attr')}
                                        </div>
                                    </div>
                                  </div> 
                                  <div class="material_block">
                                    <h3>工艺属性</h3>
                                    <div class="basic_info">
                                        <div class="item attr_item">
                                            ${createAttrHtml(attrData,'self','opattr')}
                                        </div>
                                    </div>
                                  </div> 
                            </div>
                            <div class="bom-panel" id="materialPlan_from">
                                <div class="material_block">
                                    <h3>计划信息</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料来源:</label>
                                                    <span>${createSource(meterielSource,source)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">安全库存:</label>
                                                    <span>${tansferNull(safety_stock)}</span>
                                                </div>
                                            </div> 
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">低阶码:</label>
                                                    <span>${tansferNull(low_level_code)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">固定提前期:</label>
                                                    <span>${tansferNull(fixed_advanced_period)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最高库存:</label>
                                                    <span>${tansferNull(max_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">累计提前期:</label>
                                                    <span>${tansferNull(cumulative_lead_time)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最低库存:</label>
                                                    <span>${tansferNull(min_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div> 
                            </div>
                            
                            <div class="bom-panel clearfix" id="materialPic_from">
                              ${createPicList(drawings)}
                            </div>
                            <div class="bom-panel" id="materialFile_from">
                                 <div class="table-container">
                                    <table class="bom_table">
                                      <thead>
                                        <tr>
                                          <th class="thead">缩略图</th>
                                          <th class="thead">名称</th>
                                          <th class="thead">创建人</th>
                                          <th class="thead">创建时间</th>
                                          <th class="thead">注释</th>
                                          <th class="thead">操作</th>
                                        </tr>
                                      </thead>
                                      <tbody class="t-body">
                                        ${createAttachTable(attachments)}
                                      </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="bom-panel" id="materialDesignBom_from" style="display: ${flag=='top'?'none':''}">
                                  <div class="materialInfo_container">
                                    <div class="materialInfo_table" style="overflow-y: auto;">
                                         <div class="table-container select_table_margin">
                                            <div class="table-container">
                                              <table class="bom_table design_table">
                                                <thead>
                                                  <tr>
                                                    <th class="thead">物料清单编码</th>
                                                    <th class="thead">物料清单名称</th>
                                                    <th class="thead">创建人</th>
                                                    <th class="thead">版本</th>
                                                    <th class="thead">版本描述</th>
                                                  </tr>
                                                </thead>
                                                <tbody class="t-body">
                                                  
                                                </tbody>
                                              </table>
                                            </div>
                                         </div>
                                    </div>  
                                    <div class="materialInfo_tree">
                                      <div class="bom_tree_container">
                                        <div class="bom-tree">
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item">
                       <div class="el-form-item-div btn-group">
                         <button type="button" class="el-button cancle">关闭</button>
                       </div>
                    </div>
                </div>`
    })
}
//生成图纸列表
function createPicList(picData){
    var items=[];
    if(picData.length){
        picData.forEach(function(item){
          var item=`<div class="pic_item">
                 <div class="pic_img">
                    <img width="370" height="170" src="/storage/${item.image_path}${item.image_name}.jpg370x170.jpg" alt="">
                 </div>
                 <div class="pic_text"><span>${item.code}(${item.drawing_name})</span></div>
            </div>`;
            items.push(item);
        });
    }
    return items.join('');
}    
//生成附件表格
function createAttachTable(data){
    var trs=[];
    if(data.length){
        data.forEach(function(item,index){
            var path=item.path.split('/');
            var name=path[path.length-1],
            namepre=name.split('.')[0],
            nameSuffix=name.split('.')[1],
            nameSub=namepre.length>4?namepre.substring(0,4)+'...':namepre;
            var tr=`
              <tr class="tritem" data-id="${item.attachment_id}">
                  <td style="font-size: 20px;">
                    <i class="el-icon el-input-icon el-icon-file"></i>
                  </td>
                  <td><p style="cursor: default;" title="${name}">${nameSub}.${nameSuffix}</p></td>
                  <td><p>${item.creator_name}</p></td>
                  <td>
                    <p>${item.ctime}</p>
                  </td>
                  <td><p title="${item.comment}">${item.comment.length>11?item.comment.substring(0,9)+'...':item.comment}</p></td>
                  <td><a download="${namepre}" href="/storage/${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a></td>             
              </tr>
          `;
            trs.push(tr);
        });
    }else{
      var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
      trs.push(tr);
    }
    return trs.join('');
}      
//生成属性列表,flag:self,type:attr
function createAttrHtml(data,flag,type){
    var divCon=[];
    if(type=='opattr'){
        divCon.push(createAttrli(data,data.operation_attributes,flag,type));
    }else{
        if(flag=='self'){
            divCon.push(createAttrli(data,data.material_attributes,flag,type));
        }else{
            data.forEach(function(item){
                divCon.push(createAttrli(item,item.material_attributes,flag,type));
            });
        }
    }    
    return divCon.join('');
}
//生成属性具体项
function createAttrli(item,itemdata,flag,type){
    var divwrap='',lis='',len=0;
    if(itemdata&&itemdata.length){
        var divitems=[];
        itemdata.forEach(function(attritem,index){
            var inputhtml='',divitem='',unithtml='',deletehtml='';
            inputhtml=`<span>${attritem.value||''}</span>`;
            unithtml=attritem.unit!==null&&attritem.unit!==''&&attritem.unit!==undefined?`<span class="unit">[${attritem.unit}]</span>`:'<span class="unit"></span>';
            if(attritem.datatype_id==2){
                inputhtml=createOption(attritem.range,attritem.value);
            }
            divitem=`<div class="attr_wrap">
                  <p>名称：${attritem.name}</p>
                    <p>值：${inputhtml}${unithtml}</p>
                </div>`;
            divitems.push(divitem);
        });
        divwrap=`<h4>${item.template_name==undefined?'':item.template_name}</h4> 
                <div class="attr_wrap_con">
                    ${divitems.join('')}
                </div>`;
    }
    return divwrap;
}
//生成属性下拉框数据
function createOption(data,value){
    var opdata=JSON.parse(data);
    var innerhtml,selectVal;
    if(opdata.options&&opdata.options.length){
        opdata.options.forEach(function(item){
            if(value!=''&&value!=undefined&&item.index==value){
                selectVal=item.label;
            }
        });
    }
    innerhtml=`<span>${selectVal!=undefined&&selectVal!=''?selectVal:'--无--'}</span>`;
    selectVal='';
    return innerhtml;
}  
//生成物料来源数据
function createSource(data,val){
    var sItem=[];
    data&&data.length&&data.forEach(function(item){
        if(val&&val==item.id){
            sItem.push(item);
        }
    });
    var uname='--无--',uid='';
    if(sItem.length){
        uname=sItem[0].name;
        uid=sItem[0].id;
    }
    var eleSource=`<span>${uname}</span>`;
    return eleSource;
}
//生成弹层设计bom列表
function createDesignTable(data){
  var trs=[];
  if(data.length){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tr-bom-item" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.user_name}</td>
                 <td>${item.version}.0</td>
                <td><p title="item.version_description">${item.version_description.length>25?item.version_description.substring(0,24)+'...':item.version_description}</p></td>             
            </tr>
        `;
      trs.push(tr);
    });
  }else{
    var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
            </tr>`;
    trs.push(tr);
  } 

  return trs;
}
//生成物料列表
function createMaterialTable(ele,data){
    var chooseIds=[],
    editurl=$('#bom_edit').val();
    if(itemAddFlag==3){//顶级bom
      if(topMaterial.material_id!=undefined){
        chooseIds.push(topMaterial.material_id);
      }
    }else{//添加项及替代物料
      chooseIds=getIds(materialData,'material');
    }

    data.forEach(function(item,index){
        var has_bom='',
        checkbox=`<span class="el-checkbox_input material-check ${chooseIds.indexOf(item.material_id)>-1?'is-checked':''}">
                        <span class="el-checkbox-outset"></span>
                    </span>`,
        maName=item.name;
        if(itemAddFlag!=3){
          has_bom=`<td>
                  ${item.has_bom>0?'是':'否'}
                </td>`;
          if(item.has_bom==1){
            if(!(item.bom_status==1&&item.is_version_on==1)){
              checkbox=`<div class="tip_check">
                      <span class="el-checkbox_input material-check noedit ${chooseIds.indexOf(item.material_id)>-1?'is-checked':''}" data-has-bom="${item.has_bom}">
                          <span class="el-checkbox-outset"></span>
                      </span>
                      <div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip">未发布<i></i></span></div>
                    </div>`;
              maName=`<a href="${editurl}?id=${item.bom_id}&design=1" target="_blank" style="color: #67b9ff;">${item.name}</a>`;
            }
          }
        }
        var tr=`
            <tr class="tritem" data-id="${item.material_id}">
                <td class="tdleft">
                  ${checkbox}
                </td>
                <td>${item.item_no}</td>
                <td>${maName}</td>
                ${has_bom}
                <td>${item.creator_name}</td>
                <td>${item.material_category_name==null?'':item.material_category_name}</td>             
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data('materItem',item);
    });
}
//生成添加项列表
function createMaterialItem(data){
  var ele=$('.bom_table.item_table .t-body');
  ele.html('');

  if(data.length){
    data.forEach(function(item,index){

        var replaceBtn=`<button type="button" data-id="${item.material_id}" id="edit-replace-btn" class="bom-info-button bom-add-item bom-item-replace">替换物料</button>`,
        delBtn=`<button type="button" id="edit-bom-btn" data-id="${item.material_id}" class="bom-info-button bom-info-del bom-item-del bom-del">删除</button>`,
        replacetr='',
        replacetrId='';
        if(item.itemAddFlag==2){
          replaceBtn='';
          replacetr='tr-replace';
          replacetrId=`data-replace-id="${item.replaceItemId}"`;
          delBtn=`<button type="button" id="edit-replace-btn" ${replacetrId} data-id="${item.material_id}" class="bom-info-button bom-info-del bom-replace-del bom-del">删除</button>`;
        }

        var tr=`
            <tr class="ma-tritem ${replacetr} ${item.is_assembly>0?'is-version-tr':''}" data-id="${item.material_id}" ${replacetrId}>
              <td><p class="show-material" data-version="${item.version}" data-has-bom="${item.has_bom>0?'1':'0'}" data-id="${item.material_id}">${item.item_no}</p></td>
              <td>${item.name}</td>
              <td><input type="number" step="0.01" value="${item.loss_rate!=undefined?item.loss_rate:'0.00'}" class="el-input bom-ladder-input loss_rate"></td>
              <td class="assemblyBom">
                  <span class="el-checkbox_input assembly-check ${item.is_assembly!=undefined&&item.is_assembly?'is-checked':''} ${item.has_bom?'':'noedit'}" data-id="${item.material_id}" data-has-bom="${item.has_bom}" data-version="${item.version||0}">
                      <span class="el-checkbox-outset"></span>
                  </span>
              </td>
              <td><input type="text" value="${item.usage_number!=undefined?item.usage_number:''}" id="edit_usage_num" class="bom-ladder-input usage_number"> <span>${item.commercial!=undefined?item.commercial:''}</span></td>
              <td><textarea class="el-textarea bom-textarea comment" name="" id="" cols="30" rows="3">${item.comment!=undefined?item.comment:''}</textarea></td>
              <td class="tdright">
                ${replaceBtn}
                ${delBtn}
              </td>
            </tr>
        `;
       ele.append(tr);
       ele.find('tr:last-child').data('matableItem',item);
    });
  }else{
    var tr=`<tr>
                <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
            </tr>`;
    ele.append(tr);
  }
}

function getProcedureSource(id,val,ability) {
    $('.operation-wrap .list ul').html(`<li data-id="" class="el-select-dropdown-item kong operation-item" data-name="--请选择--">--请选择--</li>`);
    AjaxClient.get({
        url:URLS['order'].workMaterialNo+'?'+_token+'&page_no=1&page_size=10&material_no='+id,
        dataType: 'json',
        success:function (rsp) {
            var data = rsp.results.list;
            if(data&&data.length){
                operationSource = data;

                var _html = $('.operation-wrap .list ul'),innerHtml='';
                data.forEach(function (item) {
                    innerHtml=`<li data-id="${item.operation_id}" data-name="${item.operation_name}" class=" el-select-dropdown-item operation-item">${item.operation_name}</li>`
                    _html.append(innerHtml);
                });

                if(val){
                    $('.el-select-dropdown-wrap.operation-wrap').find('.el-select-dropdown-item[data-id='+val+']').click();
                    if(ability){
                        var arr = ability.split(',');

                        for(var i in arr){
                            $('.el-select-dropdown.ability').find('.operation-check[data-checkid='+arr[i]+']').click();
                        }
                    }
                }

            }else{
                // LayerConfig('fail','此物料暂无工序');
            }
        },
        fail:function (rsp) {
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
