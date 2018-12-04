var layerModal,
layerLoading,
ajaxData={},
pageNo=1,
pageSize=5,
materialData=[],
//负责人
chargeData=[],
ids=[];

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
      getUnique(name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                    console.log('已注册');
                }else{
                    codeCorrect=1;
                }
            });
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
  getOwner();
  bindEvent();
});

function bindPagenationClick(totalData,pageSize){
	$('#pagenation').show();
	$('#pagenation').pagination({
	totalData:totalData,
	showData:pageSize,
	current: pageNo,
	isHide: true,
	coping: true,
	homePage: '首页',
	endPage:'末页',
	prevContent:'上页',
	nextContent:'下页',
	jump: true,
	callback: function(api){
		pageNo=api.getCurrent();
		getStorageInve();
	}
});
}

//显示错误信息
function showInvalidMessage(name,val){
    $('.basic_info').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val);
    $('.basic_info').find('.submit').removeClass('is-disabled');
}

//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';
        urlLeft=`&field=code&value=${value}`;
    var xhr=AjaxClient.get({
        url: URLS['otherOutstore'].unique+_token+urlLeft,
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

//获取实时库存列表
function getStorageInve(){
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['allocate'].inve+_token+urlLeft,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			var totalData=rsp.paging.total_records;
			if(rsp.results && rsp.results.length){
        createModalHtml($('#addOtherOutItem .table_tbody'),rsp.results);
			}else{
        $('#addOtherOutItem .table_tbody').html(`<tr><td colspan="11">暂无数据</td></tr>`);
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

//添加其它出库
function addOtherOutstore(data){
	AjaxClient.post({
		url: URLS['otherOutstore'].store,
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
		},
		complete: function(){
          $('.submit.submit').removeClass('is-disabled');
      }
	},this);
}

//编辑其他出库
function editOtherOutstore(data){
	AjaxClient.post({
		url: URLS['otherOutstore'].update,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			LayerConfig('success','编辑仓库调拨成功');
		},
		fail: function(rsp){
			layer.close(layerLoading);
			console.log('编辑仓库期初失败');
			if(rsp&&rsp.message!=undefined&&rsp.message!=null){
				LayerConfig('fail',rsp.message);
			}
			if(rsp&&rsp.field!==undefined){
				showInvalidMessage(rsp.field,rsp.message);
			}
		},
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

//获得所属者
function getOwner(val){
  AjaxClient.get({
    url: URLS['otherOutstore'].owner+_token,
    dataType: 'json',
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp.results&&rsp.results.length){
        var lis='',innerhtml='';
        rsp.results.forEach(function(item){
          lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`
        });
        innerhtml=`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                   ${lis}`;
         $('.el-form-item.owner').find('.el-select-dropdown-list').html(innerhtml);
         if(val){
            $('.el-form-item.owner').find('.el-select-dropdown-item[data-id='+val+']').click();
        }
      }
    },
    fail: function(rsp){
      layer.msg('获取所有者列表失败', {icon: 5,offset: '250px',time: 1500});
    }
  },this)
}

//获取id
function getIds(data){
    var ids=[];
        data.forEach(function(item){
            ids.push(item.id);
        });
    return ids;
}

//操作数组
function actArray(data,flag,id){
    var ids=getIds(data,flag);
    var index=ids.indexOf(Number(id));
    data.splice(index,1);
}

//负责人
function getFilterData(type,dataArr){
  return dataArr.filter(function(e){
    var name = e.surname+e.name;
    return name.indexOf(type)>-1;
  });
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


//添加项信息
function addinformation(){
    var array = [];
    $('.ma-tritem').each(function(item){
      var data=$(this).data('trData');
        var obj = {
        	id: null,
            material_id : data.material_id,
            remark:  $(this).find('.remark').val().trim(),
            unit_id: data.unit_id,
            lot: data.lot,
            plant_id: data.plant_id,
            depot_id: data.depot_id,
            subarea_id: data.subarea_id,
            bin_id: data.bin_id,
            inve_id: data.id,
            lock_status: data.lock_status,
            price: 100,
            amount: 1,
            quantity: $(this).find('.usage_number').val().trim(),
            // creator: 1
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

  //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item:not(disabled)',function(e){
        e.stopPropagation();
        // console.log(899);
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


  //添加项
    $('body').on('click','.storage-add-item:not(.is-disabled)',function () {   
      addOtherOutItemModal();
    });

    //删除项
    $('body').on('click','.bom-del',function(){
       var that=$(this);
       layer.confirm('将删除项?',{icon: 3,title:'提示',offset: '250px',end:function(){
       }},function(index){
        if(that.hasClass('bom-item-del')){
            var ele=that.parents('.ma-tritem'),
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
                remark = parentForm.find('#remark').val().trim()             
                addOtherOutstore({
                        code: code,
                        employee_id: employee_id,
                        workorder_code: workorder_code,
                        indent_code: indent_code,
                        own_id: own_id,
                        order_code: 1,
                        creator: 1,
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
        var parentForm=$('.addOtherOutstoreItem');  
          pageNo1=1;
          ajaxData={
            material_item_no: parentForm.find('#material_item_no').val(),
            material_name: parentForm.find('#material_name').val(),
          };
          getStorageInve();
        }
    });

    $('body').on('click','.submit',function () {
        if($(this).hasClass('ma-item-ok')){
            createHtml($('.storage_table.item_table .t-body'),materialData);//添加项
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
    <td>${tansferNull(item.material_item_no)}</td>
    <td>${tansferNull(item.material_name)}</td>
    <td>${tansferNull(item.unit_text)}</td>
    <td>${tansferNull(item.plant_name)}</td>
    <td>${tansferNull(item.depot_name)}</td>
    <td>${tansferNull(item.subarea_name)}</td>
    <td>${tansferNull(item.bin_name)}</td>
    <td>${tansferNull(item.quantity)}</td>
    <td>${tansferNull(item.lock_status? '是':'否')}</td>
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
    var tr = `
    <tr class="ma-tritem">
    <td>${tansferNull(item.material_item_no)}</td>
    <td>${tansferNull(item.material_name)}</td>
    <td>${tansferNull(item.unit_text)}</td>
    <td>${tansferNull(item.plant_name)}</td>
    <td>${tansferNull(item.depot_name)}</td>
    <td>${tansferNull(item.subarea_name)}</td>
    <td>${tansferNull(item.bin_name)}</td>
    <td><input type="number" class="bom-ladder-input usage_number" style="width: 100px;" value="${tansferNull(item.quantity)}"></td>
    <td><input class="el-textarea bom-textarea remark"  name id cols="30" rows="3" value="${tansferNull(item.remark)}"></td>
    <td>${tansferNull(item.lock_status? '是':'否')}</td>
    <td class="tdright">
    ${delBtn}
    </td>
    </tr>
    `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}

//添加项弹层
function addOtherOutItemModal(){
  console.log(666)
  var width=33;
   layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '900px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addOtherOutstoreItem formModal" id="addOtherOutItem">
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
                                <button style="margin-top: 5px;" type="button" class="el-button choose-search choose-material">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
               <div class="table-container select_table_margin">
                  <div class="table-container table_page">
                        <div id="pagenation" class="pagenation" style="border: hidden;"></div>
                        <table class="bom_table">
                          <thead>
                            <tr>
                              <th class="thead" style="text-align: center;"></th>
                              <th class="thead" style="text-align: center;">物料编码</th>
                              <th class="thead" style="text-align: center;">名称</th>
                              <th class="thead" style="text-align: center;">单位</th>
                              <th class="thead" style="text-align: center;">厂区</th>
                              <th class="thead" style="text-align: center;">仓库</th>
                              <th class="thead" style="text-align: center;">分区</th>
                              <th class="thead" style="text-align: center;">仓位</th>
                              <th class="thead" style="text-align: center;">数量</th>
                              <th class="thead" style="text-align: center;">是否锁库？</th>
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
          getStorageInve();
    },
    end: function(){
    }

    })

}
