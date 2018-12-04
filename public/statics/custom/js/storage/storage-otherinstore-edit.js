var layerModal,
ajaxData={},
pageNo=1,
pageSize=5,
materialData=[],
categoryData=[],
locationData=[],
//负责人
chargeData=[],
ids=[];
initData=null;

validatorToolBox={
  checkCode: function(name){
    var value=$('.basic_info').find('#'+name).val().trim();
    return Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
        !Validate.checkCode(value)?(showInvalidMessage(name,"编码由1-10位大写字母组成"),codeCorrect=!1,!1):
          (codeCorrect=1,!0);
  },
  checkIndentCode: function(name){
    var value=$('.basic_info').find('#'+name).val().trim();
    return Validate.checkNull(value)?(showInvalidMessage(name,"生产订单编号不能为空"),indentCodeCorrect=!1,!1):
          (indentCodeCorrect=1,!0);
  },
  checkWorkorderCode: function(name){
    var value=$('.basic_info').find('#'+name).val().trim();
    return Validate.checkNull(value)?(showInvalidMessage(name,"工单号不能为空"),workorderCodeCorrect=!1,!1):
          (workorderCodeCorrect=1,!0);
  }
},
remoteValidatorToolbox={
  remoteCheckCode: function(name,id){
      var value=$('.basic_info').find('#'+name).val().trim();
  }
},
validatorConfig = {
    code: "checkCode",
    indent_code: "checkIndentCode",
    workorder_code: "checkWorkorderCode",
},remoteValidatorConfig={
    code: "remoteCheckCode",
    indent_code: "remoteCheckIndentCode",
    workorder_code: "remoteCheckWorkorderCode",
};

$(function(){
    getChargeData();
    bindEvent(); 
    getMaterialList();
    id=getQueryString('id');
    if(id!=undefined){
    	getOtherInstoreView(id);
    }else{
    	layer.msg('url链接缺少参数，请给到id参数',{
    		icon: 5,
    		offset: '250px'
    	});
    }
});

function bindPagenationClick(totalData,pageSize){
	$('#pagenation').show();
	$('#pagenation').pagination({
		totalData:totalData,
		showData:pageSize,
		current: pageNo,
		isHide: true,
		coping:true,
		homepage:'首页',
		endpage:'末页',
		prevContent:'上页',
		nextContent:'下页',
		jump: true,
		callback:function(api){
			pageNo=api.getCurrent();
			getMaterialList();
		}
	});
}

//显示错误信息
function showInvalidMessage(name,val){
    $('.basic_info').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val);
    $('.basic_info').find('.submit').removeClass('is-disabled');
}

//查看其他入库
function getOtherInstoreView(id){
	console.log(id=getQueryString('id'));
	AjaxClient.get({
		url: URLS['otherInstore'].InstoreShow+_token+"&id="+id,
		dataType: 'json',
		beforeSend:function(){
			layerLoading = LayerConfig('load');
		},
		success:function(rsp){
			layer.close(layerLoading);
			initData=rsp.results[0];
			console.log(initData)
			getOwner();
			$('#code').val(rsp.results[0].code);
			$('#indent_code').val(rsp.results[0].indent_code);
			$('#workorder_code').val(rsp.results[0].workorder_code);
			$('#owner').val(rsp.results[0].owner_name);
			$('#personInCharge').val(rsp.results[0].employee_surname+rsp.results[0].employee_name).attr('data-id',rsp.results[0].employee_id);
			$('#remark').val(rsp.results[0].remark);
			showAddItem(rsp.results[0].groups);
			materialData=rsp.results[0].groups;
		},
		fail:function(rsp){
			layer.close(layerLoading);
			layer.msg("获取信息失败",{icon:5,offset:'250px'});
		}
	},this);
}

//获取物料列表
function getMaterialList(){
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['otherInstore'].materialShow+_token+urlLeft,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			var totalData=rsp.paging.total_records;
			if(rsp.results && rsp.results.length){
        createModalHtml($('#addOtherInstoreItem .table_tbody'),rsp.results);
			}else{
        $('#addOtherInstoreItem .table_tbody').html(`<tr><td colspan="11">暂无数据</td></tr>`);
			}
			if(totalData>pageSize){
				bindPagenationClick(totalData,pageSize);
			}else{
				$('#pagenation').html('');
			}
		},
		fail: function(rsp){
			layer.close(layerLoading);
			noData('获取调拨单列表失败，请刷新重试',9);
		},
		complete: function(){
			$('#searchForm .submit').removeClass('is-disabled');	
		}
	},this)
}

//获取仓库分类
function getCategory(){
  AjaxClient.get({
        url: URLS['otherInstore'].category+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
          layer.close(layerLoading);
          categoryData=rsp.results||[];
          if(rsp&&rsp.results&&rsp.results.length){
            var catehtml=treeList(rsp.results,rsp.results[0].parent_id);
            $('.selectMaterial_tree .bom-tree').html(catehtml);
          }else{
            console.log('获取仓库分类失败');
          }
        },
        fail: function(rsp){
          layer.close(layerLoading);
          console.log('获取仓库分类失败');
        }
    },this);
}

//获得负责人
function getChargeData(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['depot'].chargeShow+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);            
            chargeData=rsp.results;            
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);    
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

//获取所属者列表
function getOwner(val){
    AjaxClient.get({
        url: URLS['otherOutstore'].owner+_token,
        dataType: 'json',
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.owner').find('.el-select-dropdown-list').html(innerhtml);
                if(initData&&initData.owner_id){
                  $('.el-form-item.owner').find('.el-select-dropdown-item[data-id='+initData.owner_id+']').click();
                }
            }   
        },
        fail: function(rsp){
            layer.msg('获取所有者列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//生成所属者列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==item.id){
            selectName=item.name;
            selectId=item.id;
        }
        lis+=`<li data-id="${item.id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectName!=''?selectName:'--请选择--'}" style="width:100%">
            <input type="hidden" class="val_id" id="${typeid}" value="${selectId!=''?selectId:''}">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
        return innerhtml;
}

//获得节点的祖先
function getAncestorsData(id,level,mid){
  AjaxClient.get({
    url: URLS['otherInstore'].Ancestors+'id='+id+'&level='+level+'&'+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      var trele=$('.tr-item[data-mid='+mid+']'),
      trData=trele.data('trData');
      trData.plant_id=0;
      trData.plant_name='';
      trData.depot_id=0;
      trData.depot_name='';
      trData.subarea_id=0;
      trData.subarea_name='';
      trData.bin_id=0;
      trData.bin_name='';
      if(rsp&&rsp.results){
        var locateData=rsp.results;
        if(locateData.plant&&locateData.plant.length){//厂区
          trData.plant_id=locateData.plant[0].id;
          trData.plant_name=locateData.plant[0].name;
        }
        if(locateData.depot&&locateData.depot.length){//仓库
          trData.depot_id=locateData.depot[0].id;
          trData.depot_name=locateData.depot[0].name;    
        }
        if(locateData.subarea&&locateData.subarea.length){//分区
          trData.subarea_id=locateData.subarea[0].id;
          trData.subarea_name=locateData.subarea[0].name;      
        }
        if(locateData.bin&&locateData.bin.length){//分区
          trData.bin_id=locateData.bin[0].id;
          trData.bin_name=locateData.bin[0].name;      
        }
      }
      var ids=getIds(materialData,'material');
      var data=$(this).parents('tr').data('trData');
      var index=ids.indexOf(Number(mid));
      index>-1?materialData.splice(index,1,trData):null;
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取祖先失败');
    }
  },this);
}

//添加其他入库单
function addOtherInstore(data){
  AjaxClient.post({
    url: URLS['otherInstore'].store,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      $('.submit.save').removeClass('is-disabled');
        LayerConfig('success','添加成功',function(){
        resetAllData();
      });
    },
    fail: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.message!=undefined&&rsp.message!=null){
        LayerConfig('fail',rsp.message);
      }
      if(rsp&&rsp.field!==undefined){
        showInvalidMessage(rsp.field,rsp.message);
      }
    },
    complete: function(){
        $('.submit.submit').removeClass('is-disabled');
      }
  },this);
}

//编辑入库
function editOtherInstore(data){
  AjaxClient.post({
    url: URLS['otherInstore'].update,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      $('.submit.save').removeClass('is-disabled');
      LayerConfig('success','编辑成功',function(){
      });
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('编辑失败');
      if(rsp&&rsp.message!=undefined&&rsp.message!=null){
        LayerConfig('fail',rsp.message);
      }
    },
  },this);
}

//操作数组
function actArray(data,flag,id){
    var ids=getIds(data,flag);
    var index=ids.indexOf(Number(id));
    data.splice(index,1);
}

//获取id
function getIds(data,flag){
    var ids=[];
    if(flag=='material'){
        data.forEach(function(item){
            ids.push(item.id);
        });
    }else{
        data.forEach(function(item){
            ids.push(item.attribute_definition_id);
        });
    }
    return ids;
}

//负责人
function getFilterData(type,dataArr){
  return dataArr.filter(function(e){
    var name = e.surname+e.name;
    return name.indexOf(type)>-1;
  });
}

//添加项
function showAddItem(data){
	 var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    if(data.length){
        data.forEach(function (item,index) {
            var delBtn=`<button type="button" id="edit-bom-btn" data-id="${item.id}" ${editBtnFlag} class="bom-info-button bom-info-del bom-item-del bom-del ${editStyleFlag}">删除</button>`,
                editBtnFlag = '',
                editStyleFlag = '';
          	var YesClass=item.lock_status==1? 'is-radio-checked': '';
            var NoClass=item.lock_status==0||item.lock_status==undefined? 'is-radio-checked':'';
            var tr =  `
            <tr class="tr-item" data-id="${item.id}">
	          <td>${tansferNull(item.item_no)}</td>
              <td>${tansferNull(item.name)}</td>
              <td>${tansferNull(item.unit_text)}</td>
              <td class="plant">${tansferNull(item.plant_name)}</td>
    		      <td class="depot">${tansferNull(item.depot_name)}</td>
    		      <td class="subarea">${tansferNull(item.subarea_name)}</td>
    		      <td class="bin"><div class="binChoose">
    		        <input type="text" class="bom-ladder-input bin" disabled="" placeholder="请选择仓位" style="width: 120px;" value="${item.bin_name||''}">
    		        <span data-mid="${item.material_id}" class="fa fa-table pos-icon bom-add-item choose-material"></span></div>
    		      </td>
    		      <td><input type="number" class="bom-ladder-input usage_number" style="width: 100px;" value="${tansferNull(item.quantity)}"></td>
    		      <td><input class="el-textarea bom-textarea remark"  name id cols="30" rows="3" value="${tansferNull(item.remark)}"></td>
    		      <td class="status">
    		      <div class="el-radio-group">
                    <label class="el-radio">
                        <span class="el-radio-input ${YesClass}">
                            <span class="el-radio-inner"></span>
                            <input class="is-packaging" type="hidden" value="1">
                        </span>
                        <span class="el-radio-label">是</span>
                    </label>
                    <label class="el-radio">
                        <span class="el-radio-input ${NoClass}">
                            <span class="el-radio-inner"></span>
                            <input class="is-packaging" type="hidden" value="0">
                        </span>
                        <span class="el-radio-label">否</span>
                    </label>
    		      </div></td>
              <td class="tdright">
              ${delBtn}
              </td>
    		    </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        });
    }else{
        var tr =`<tr>
                   <td class="nowrap" colspan="10" style="text-align: center;">暂无数据</td>
                </tr>`;
        ele.append(tr);
    }
}

function createStorage(that){
  console.log(888888888)
    var currentVal = that.val().trim();
    setTimeout(function(){
        var val=that.val().trim();
        if(currentVal==val){
            var filterData=getFilterData(val,chargeData);
            var lis='';
            if (filterData.length > 0) {
                for (var i = 0; i < filterData.length; i++) {
                    lis+=`<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].surname}${filterData[i].name}</span></li>`;
                }
            } else {
                lis='<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
            }
            $('.el-form-item.charge').find('.el-select-dropdown-list').html(lis);
            if ($('.el-form-item.charge').find('.el-select-dropdown').is(":hidden")) {
                $('.el-form-item.charge').find('.el-select-dropdown').slideDown("200");
            }
        }
    },1000); 
}

//操作物料分类
function findLeaf(data,id,selectedId){
    var returnId=0;
    if(hasChilds(data,id)){
      var children=getChildById(data,id);
      findLeaf(data,children[0].only_id,selectedId);
    }else{
        $('.bom-tree').find('.item-name[data-post-id='+id+']').addClass('selected');
        var selectItem=categoryData.filter(function(e){
            return e.only_id==id;
        });
        console.log(selectItem);
        var mid=$('#mid').val();
        getAncestorsData(selectItem[0].id,selectItem[0].level,mid);
        console.log(selectItem[0].id);
    } 
}

//添加项信息
function addinformation(){
  var array = [];
  $('.tr-item').each(function(item){
    var data=$(this).data('trData');
    var obj = {
      id : null,
      material_id : data.material_id,
      remark: $(this).find('.remark').val().trim(),
      unit_id: data.unit_id,
      lot: data.lot,
      plant_id: data.plant_id,
      depot_id: data.depot_id,
      subarea_id: data.subarea_id,
      bin_id: data.bin_id,
      lock_status: $(this).find('.el-radio-input.is-radio-checked .is-packaging').val(),
      price: 100,
      amount: 1,
      quantity: $(this).find('.usage_number').val().trim(),
    }
    array.push(obj);
  });
  return array;
}

//清空所有数据
function resetAllData(){
  //常规信息
  var basicForm = $('#addSBasic_form');
  basicForm.find('#code').val('');
  basicForm.find('#personInCharge').val('');
  basicForm.find('#workorder_code').val('');
  basicForm.find('#indent_code').val('');
  basicForm.find('#ownerval').val('--请选择--');
  basicForm.find('#remark').val('');
  basicForm.find('.storage_table.item_table .t-body').
  html(`<tr>
      <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
    </tr>`);
  basicForm.find('.storage-add-new-item').addClass('is-disabled');
}

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
  $('body').on('click','.el-select',function(){
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
    //树中节点点击
    $('body').on('click','.item-name:not(.noedit)',function(){
        var parele=$(this).parents('.bom_tree_container');
        var selectedId=parele.find('.item-name.selected').attr('data-post-id');
        if(!$(this).hasClass('selected')){
          parele.find('.item-name').removeClass('selected');
          findLeaf(categoryData,$(this).attr('data-post-id'),selectedId);
        }
    });
    $('body').on('click','.search-div .search-icon',function(){
        var ele=$(this).siblings('.el-input');
        findAttrval(ele);
    });

 //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item:not(disabled)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('el-auto')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-input');
            var idval=$(this).attr('data-id');
            ele.val($(this).text()).attr('data-id',idval);
        }else{
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            var idval=$(this).attr('data-id');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val(idval);
        }
        $(this).parents('.el-select-dropdown').hide();
    });

    //单选框
    $('body').on('click','.el-radio-input:not(.view)',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });

    //添加项
    $('body').on('click','.storage-add-item:not(.is-disabled)',function () { 
      var ele=$('.storage_table.item_table .t-body');
      addOtherInItemModal();
    });

    //选择仓位
    $('body').on('click','.binChoose .choose-material',function () {
      var mid=$(this).attr('data-mid');
      locationTreeModal(mid);
    });

    //删除项
    $('body').on('click','.bom-del',function(){
       var that=$(this);
       layer.confirm('将删除项?',{icon: 3,title:'提示',offset: '250px',end:function(){
       }},function(index){
        if(that.hasClass('bom-item-del')){
            var ele=that.parents('.tr-item'),
            id=that.attr('data-id');
            $(this).remove();
            ele.remove();
            actArray(materialData,'material',id);
        }
        layer.close(index);
       }); 
    });

    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly])',function(){
        if($(this).attr('id')=='personInCharge'){
            var that=$(this);
            createStorage(that);
            $(this).parent().siblings('.el-select-dropdown').show();
        }else{
            $(this).parents('.el-form-item').find('.errorMessage').html("");
        }
    }).on('blur','.basic_info .el-input:not([readonly])',function(){
      var name=$(this).attr('id'),
      id=$('itemId').val();
       validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,id);
    }).on('input','#personInCharge',function(){
        var that=$(this);
        createStorage(that);
    });

    $('body').on('click','.submit.save',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $('#addSBasic_form');
            var code = parentForm.find('#code').val().trim(),
                employee_id = parentForm.find('#personInCharge').attr('data-id'),
                workorder_code = parentForm.find('#workorder_code').val().trim(),
                indent_code = parentForm.find('#indent_code').val().trim(),                
                own_id = parentForm.find('#owner_id').val(),
                order_code = 1,
                creator = 1,
                company_id = 1,
                remark = parentForm.find('#remark').val().trim()             
                editOtherInstore({
                	      id: id,
                        code: code,
                        employee_id: employee_id,
                        workorder_code: workorder_code,
                        indent_code: indent_code,
                        own_id: own_id,
                        order_code: 1,
                        creator: 1,
                        company_id: 1,
                        remark: remark,
                        items: JSON.stringify(addinformation()),
                        _token: TOKEN
                });
        }
    })


    //checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        $(this).toggleClass('is-checked');
        var ids=getIds(materialData,'material');
        var data=$(this).parents('tr').data('trData');
        if($(this).hasClass('is-checked')){
          materialData.push(data);
        }else{
          var index=ids.indexOf(Number(data.id));
          index>-1?materialData.splice(index,1):null;
        }
    });

    //搜索按钮物料
    $('body').on('click','.choose-search',function(){
      if($(this).hasClass('choose-material')){
        var parentForm=$('.addOtherInstoreItem');  
          pageNo1=1;
          ajaxData={
            item_no: parentForm.find('#material_item_no').val(),
            name: parentForm.find('#material_name').val(),
          };
          getMaterialList();
        }
    });

    $('body').on('click','.submit',function () {
        if($(this).hasClass('ma-item-ok')){
            createHtml($('.storage_table.item_table .t-body'),materialData);//添加项
            layer.close(layerModal);
        }
    });

    $('body').on('click','.tree_submit',function (){
      if($(this).hasClass('ma-item-ok')){
        var mid=$('#mid').val(),
        trele=$('.tr-item[data-mid='+mid+']'),
        trData=trele.data('trData');
        trele.find('td.plant').html(trData.plant_name);
        trele.find('td.depot').html(trData.depot_name);
        trele.find('td.subarea').html(trData.subarea_name);
        trele.find('td.bin .bom-ladder-input.bin').val(trData.bin_name);
        layer.close(layerModal);
      }
    });
}

function createModalHtml(ele,data){
    ele.html('');
    data.forEach(function(item,index){
    var tr = `
    <tr>
    <td class="left norwap">
    <span class="el-checkbox_input material-check">
    <span class="el-checkbox-outset"></span>
    </span>
    </td>
    <td>${tansferNull(item.item_no)}</td>
    <td>${tansferNull(item.name)}</td>
    <td>${tansferNull(item.unit_text)}</td>
    <td>${tansferNull(item.creator_name)}</td>
    <td>${tansferNull(item.material_category_name)}</td>
    </tr>
    `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}

function createHtml(ele,data){
  ele.html('');
  data.forEach(function(item,index){
    var delBtn=`<button type="button" id="edit-bom-btn" data-id="${item.id}" class="bom-info-button bom-info-del bom-item-del bom-del">删除</button>`,
        editBtnFlag = '',
        editStyleFlag = '';
    var YesClass=item.lock_status==1? 'is-radio-checked': '';
    var NoClass=item.lock_status==0||item.lock_status==undefined? 'is-radio-checked':'';
    var tr = `
    <tr class="tr-item" data-mid="${item.material_id}">
    <td>${tansferNull(item.item_no)}</td>
    <td>${tansferNull(item.name)}</td>
    <td>${tansferNull(item.unit_text)}</td>
    <td class="plant">${tansferNull(item.plant_name)}</td>
    <td class="depot">${tansferNull(item.depot_name)}</td>
    <td class="subarea">${tansferNull(item.subarea_name)}</td>
    <td class="bin"><div class="binChoose">
        <input type="text" class="bom-ladder-input bin" disabled="" placeholder="请选择仓位" style="width: 120px;" value="${item.bin_name||''}">
        <span data-mid="${item.material_id}" class="fa fa-table pos-icon bom-add-item choose-material"></span></div>
    </td>
    <td><input type="number" class="bom-ladder-input usage_number" style="width: 100px;" value="${tansferNull(item.quantity)}"></td>
    <td><input class="el-textarea bom-textarea remark"  name id cols="30" rows="3" value="${tansferNull(item.remark)}"></td>
    <td class="status"><div class="el-radio-group">
        <label class="el-radio">
            <span class="el-radio-input ${YesClass}">
                <span class="el-radio-inner"></span>
                <input class="is-packaging" type="hidden" value="1">
            </span>
            <span class="el-radio-label">是</span>
        </label>
        <label class="el-radio">
            <span class="el-radio-input ${NoClass}">
                <span class="el-radio-inner"></span>
                <input class="is-packaging" type="hidden" value="0">
            </span>
            <span class="el-radio-label">否</span>
        </label>
      </div></td>
    <td class="tdright">
    ${delBtn}
    </td>
    </tr>
    `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}


//扩展物料结构树
function treeList(data,pid) {
    var bomTree = '';
    var children = getChildById(data, pid);
    // console.log(children);
    children.forEach(function (item,index) {
        var hasChild = hasChilds(data, item.only_id);
        if(hasChild){
            bomTree += `<div class="tree-folder" data-id="${item.only_id}" data-pid="${pid}">
                 <div class="tree-folder-header">
                 <div class="flex-item">
                 <i class="icon-minus expand-icon"></i>
                 <div class="tree-folder-name"><p class="item-name" data-post-id="${item.only_id}">${item.name}</p></div></div></div>
                 <div class="tree-folder-content">
                   ${treeList(data, item.only_id)}
                 </div>
              </div> `;
        }else{
            bomTree += `<div class="tree-item" data-id="${item.only_id}" data-pid="${pid}">
                <div class="flex-item">
                <i class="item-dot expand-icon"></i>
                <div class="tree-item-name"><p class="item-name" data-post-id="${item.only_id}">${item.name}</p></div></div>  
              </div>`;
        }
    });
    return bomTree;
}

//生成树弹层
function locationTreeModal(mid){
  var width = 33;
  layerModal = layer.open({
    type: 1,
    title: '选择仓位',
    offset: '100px',
    area: '400px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content:`
    <form class="addLocate formModal" id="addLocate">
          <input type="hidden" id="mid" value="${mid}" />
          <div class="selectMaterial_container">
            <div class="selectMaterial_tree">
              <div class="bom_tree_container">
                  <div class="bom-tree"></div>
              </div>
            </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary ma-item-ok tree_submit">确定</button>
            </div>
          </div>       
    </form>
    `,
    success: function(layero, index){
          getCategory();
    },
    end: function(){
    }
  })
}

//添加项弹层
function addOtherInItemModal(){
  var width=33;
   layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '850px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addOtherInstoreItem formModal" id="addOtherInstoreItem">
          <div class="selectMaterial_container">
            <div class="selectMaterial_table">
               <ul class="query-item-storage">
                    <li>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                                <input type="text" id="material_item_no"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 90px;">名称</label>
                                <input type="text" id="material_name"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: 10%;">
                            <div class="el-form-item-div btn-group">
                                <button style="margin-top: 8px;" type="button" class="el-button choose-search choose-material">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
               <div class="table-container select_table_margin">
                  <div class="table-container table_page">
                        <div id="pagenation" class="pagenation" style="height: 22px;"></div>
                        <table class="bom_table">
                          <thead>
                            <tr>
                              <th class="thead"></th>
                              <th class="thead">物料编码</th>
                              <th class="thead">名称</th>
                              <th class="thead">单位</th>
                              <th class="thead">创建人</th>
                              <th class="thead">材料类别</th>
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
          // getCategory();
          getMaterialList();
    },
    end: function(){
    }

    })
}
