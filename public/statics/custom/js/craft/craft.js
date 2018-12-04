var layerModal,
layerLoading,
pageNo=1,
pageSize=50,
ajaxData={},
keyCorrect=!1,
nameCorrect=!1,
dataTypeCorrect=!1,
numberCorrect=1,
selectCorrect=!1,
dataTypeFlag='',
attrActionFlag='',
dataTypeData=[],
unitData=[],
dataTypeSelect=[],
unitSelect=[],
dataTypeId=0,
unitId=0,
range=null,
attrid='',
layerEle='',
validatorToolBox={
    checkKey: function(name){
        var value=$('#addMAttr_from').find('#'+name).val().trim();
        return $('#addMAttr_from').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(keyCorrect=!1,!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"键值不能为空"),keyCorrect=!1,!1):
        !Validate.checkAttrKey(value)?(showInvalidMessage(name,"键值由3-50位字母下划线数字组成,字母开头"),keyCorrect=!1,!1):
        (keyCorrect=1,!0);
    },
    checkName: function(name){
        var value=$('#addMAttr_from').find('#'+name).val().trim();
        return $('#addMAttr_from').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
        (nameCorrect=1,!0);
    },
    checkDataType: function(name){
        var value=$('#addMAttr_from').find('#'+name).val();
        return value==0||$('#addMAttr_from').find('#'+name).siblings('.el-input').text()=='--请选择--'?(showInvalidMessage(name,"请选择数据类型"),dataTypeCorrect=!1,!1):
        (dataTypeCorrect=1,!0);
    },
    checkNumberValue: function(def){
        numberCorrect=1;
        var mval=$('#min_value').val().trim(),
        mmval=$('#max_value').val().trim(),
        dval=$('#'+def).val().trim();
        var minValue=Number(mval),
        maxValue=Number(mmval),
        defValue=Number(dval);

        if(mval!==''&&mmval!==''&&dval!==''){
            return (defValue<minValue||defValue>maxValue)?(showInvalidMessage(def,"默认值应在最大最小值之间"),numberCorrect=!1,!1):
            (numberCorrect=1,!0); 
        }else if(mval!==''&&dval!==''){
            return (defValue<minValue)?(showInvalidMessage(def,"默认值应该大于等于最小值"),numberCorrect=!1,!1):
            (numberCorrect=1,!0);
        }else if(mmval!==''&&dval!==''){
            return (defValue>maxValue)?(showInvalidMessage(def,"默认值应该小于等于最大值"),numberCorrect=!1,!1):
            (numberCorrect=1,!0);
        }else if(mval!==''&&mmval!==''){
            return (maxValue<minValue)?(showInvalidMessage(def,"最大值应大于等于最小值"),numberCorrect=!1,!1):
            (numberCorrect=1,!0);
        }else{
            return numberCorrect;
        }
    },
    checkSelectData: function(name){
        var ele=$('#dataTypeWrap').find('.validator');
        if(ele.length){
            selectCorrect=1;
            ele.each(function(index,item){
                if(Validate.checkNull($(item).val().trim())){
                    selectCorrect=!1;
                    $('#dataTypeWrap').find('.errorMessage').html('选项不能为空').show();
                    return false;
                }  
            });
        }else{
            selectCorrect=!1;
            $('#dataTypeWrap').find('.errorMessage').html('选择类型必须添加选项').show();
        }
        if(selectCorrect){
            $('#dataTypeWrap').find('.errorMessage').html('');
        }
        return selectCorrect;
    }
},
remoteValidatorToolbox={
    remoteCheckKey: function(flag,name){
        var value=$('#addMAttr_from').find('#'+name).val().trim();
        getUnique(flag,name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                keyCorrect=!1;
                var val='已注册';
                showInvalidMessage(name,val);
            }else{
                keyCorrect=1;
            }
        });
    },
    remoteCheckName: function(flag,name){
        var value=$('#addMAttr_from').find('#'+name).val().trim();
        getUnique(flag,name,value,function(rsp){
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
    key: "checkKey",
    name: "checkName",
    datatype_id: 'checkDataType',
    default_value: '',
    selectData: ''
},remoteValidatorConfig={
    key: "remoteCheckKey",
    name: "remoteCheckName"
};
$(function(){
    resetParam();
	getMaterielAttr();
    getAjaxSearchData();
	bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#addMAttr_from').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addMAttr_from').find('.submit').removeClass('is-disabled');
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
            getMaterielAttr();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        key: '',
        label: '',
        name: '',
        datatype_id: '',
        unit_id: '',
        order: 'desc',
        sort: 'id',
        is_searchable: '',
        is_visible_table: '',
        is_man_haur_param: ''
    };
}

//获取物料属性列表
function getMaterielAttr(){
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
		success: function(rsp){
			layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',6);                
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
			noData('获取物料属性列表失败，请刷新重试',6);
		},
        complete: function(){
            $('#searchMAttr_from .submit,#searchMAttr_from .reset').removeClass('is-disabled');
        }
	},this);
}

//删除物料属性
function deleteMaterielAttr(id,leftNum){
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
            getMaterielAttr();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                pageNo? null:pageNo=1;
                getMaterielAttr();
            }
        }
    },this);
}

//添加物料属性
function addMaterielAttribute(data){
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
            getMaterielAttr();
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//查看物料属性
function getMaterielAttribute(id,flag){
    AjaxClient.get({
        url: URLS['attr'].show+"?"+_token+"&attribute_definition_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                range=rsp.results.range||null;
                AttrModal(flag,rsp.results);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取属性详情失败');
        }
    },this);
}

//编辑物料属性
function editMaterielAttribute(data){
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
            getMaterielAttr();
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}

//检测唯一性
function getUnique(flag,field,value,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${attrid}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['attr'].unique+"?"+_token+urlLeft,
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
//数据类型为数字
function createNumHtml(data){
    var min_value='',max_value='',default_value='';
    if(data&&data!==null&&data!=="null"){
        var jsonData=JSON.parse(data);
        min_value=jsonData.min_value;
        max_value=jsonData.max_value;
        default_value=jsonData.default_value;
    }
    var numHtml=`<div class="el-form-item">
        <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 84px;">最小值</label>
            <input type="number" id="min_value" class="el-input" value="${min_value}">
        </div>        
    </div>
    <div class="el-form-item">
        <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 84px;">最大值</label>
            <input type="number" id="max_value" class="el-input" value="${max_value}">
        </div>
    </div>
    <div class="el-form-item">
        <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 84px;">默认值</label>
            <input type="number" id="default_value" class="el-input" value="${default_value}">
        </div>
        <p class="errorMessage" style="padding-left: 84px;"></p> 
    </div>`;
    return numHtml;
}
//数据类型为选择
function createSelectHtml(data){
    var sehtml='',addBtn='';
    if(data&&data!==null&&data!=="null"){
        var jsonData=JSON.parse(data);
        if(jsonData.options&&jsonData.options.length){
            jsonData.options.forEach(function(item){
                var selected=item.index==jsonData.default_value? true: false;
                sehtml+=createSelectItemHtml(item.index,item,selected);
            })
        }
    }
    if($('#addMAttr_from').attr('data-flag')!='view'){
        addBtn=`<div class="el-form-item">
            <div class="el-form-item-div" id="dataType_item_add">
                <button type="button" class="el-button item-add">添加项</button>
            </div>
        </div>`;
    }
    var selectHtml=`${addBtn}
    <div class="item-wrap">
        <div class="item-select-wrap">
            ${sehtml}
        </div>
        <p class="errorMessage" style="padding-left: 84px;"></p>
    </div>`;
    return selectHtml;
}

function createSelectItemHtml(num,item,selected){
    var itemDElete=`<div calss="el-item-wrap">
                <button type="button" class="el-button item-delete">X</button>
            </div>`;
    if(item){
        itemDElete='';
    }
    var itemHtml=`<div class="el-form-item select-item">
        <div class="el-form-item-div">
            <div class="el-item-wrap" style="margin-left: 5px;">
                <label class="el-form-item-label">选项<span class="mustItem">*</span></label>
                <input type="text" data-id="label" id="item-label" data-code="${item?item.code:''}" class="el-input validator" placeholder="请输入选项" value="${item?item.label:''}">
            </div>
            <div class="el-item-wrap checkboxwrap" style="margin-left: 5px;">
                <span class="num">${num}</span>
                <span class="el-checkbox_input ${selected? 'is-checked':''}">
                    <span class="el-checkbox-outset"></span>
                    <input type="hidden" value="${num}">
                </span>
                默认值？
            </div>
            ${itemDElete}
        </div>        
    </div>`;
    return itemHtml;
}

function getMinMaxvalue(){
    var data={
        min_value: $('.dataTypeWrap').find('#min_value').val().trim(),
        max_value: $('.dataTypeWrap').find('#max_value').val().trim(),
        default_value: $('.dataTypeWrap').find('#default_value').val().trim()
    };
    return data;
}

function getOptionvalue(){
    var options=[],default_value=0,data=null;
    if($('.dataTypeWrap').find('.select-item').length){
        $('.dataTypeWrap').find('.select-item').each(function(index,item){
            var item={
                'label': $(item).find('[data-id=label]').val(),
                'code': $(item).find('[data-id=label]').attr('data-code'),
                'index': $(item).find('.num').html()
            }
            options.push(item);
        });
        default_value=$('.dataTypeWrap').find('.el-checkbox_input.is-checked input').val()||0;
        data={
            'default_value': default_value,
            'options': options
        }
    }
    return data;
}
//生成列表数据
function createHtml(ele,data){
    var viewurl=$('#attr_view').val(),
    editurl=$('#attr_edit').val();
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td><div class="overflow" title="${item.key}">${item.key}</div></td>
                <td><div class="overflow" title="${item.name}">${item.name}</div></td>
                <td><div class="overflow" title="${item.label}">${item.label}</div></td>
                <td>${item.data_type}</td>
                <td>${item.unit==null?'':item.unit}</td>
                <td class="right">
                <button data-id="${item.id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

//生成单位和数据类型列表
function createUnitHtml(lis,type){
    var elSelect='',innerhtml='';
    if(lis){
        innerhtml+=`<div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" id="${type=='dataType'? 'datatypeval':'unitval'}" class="el-input" value="--请选择--">
            <input type="hidden" class="val_id" id="${type=='dataType'? 'datatype_id':'unit_id'}" value="">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                ${lis}
            </ul>
        </div>`; 
    }else{
        innerhtml+=`<div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" id="${type=='dataType'? 'datatypeval':'unitval'}" class="el-input" value="--请选择--">
            <input type="hidden" class="val_id" id="${type=='dataType'? 'datatype_id':'unit_id'}" value="">
        </div>`; 
    }
    return innerhtml;
}

//单位列表和数据类型接口都执行完毕
function getAjaxSearchData(){
    $.when(ajax_PublicFn.getUnits(function(){
        layerLoading = LayerConfig('load');
    }),ajax_PublicFn.getAttributeDataType())
    .done(function(unitrsp,dataTypersp){
        layer.close(layerLoading);
        var unitlis='',dataTypelis='';
        unitData=unitrsp.results||[];
        dataTypeData=dataTypersp.results||[];
        if(unitrsp.results&&unitrsp.results.length){
            unitrsp.results.forEach(function(item){
                unitlis+=`<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.unit_text}</li>`;
            }); 
        }
        if(dataTypersp.results&&dataTypersp.results.length){
            dataTypersp.results.forEach(function(item){
                dataTypelis+=`<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.cn_name}</li>`;
            }); 
        }
        $('.el-form-item.datatype').find('.el-select-dropdown-wrap').html(createUnitHtml(dataTypelis,'dataType'));
        $('.el-form-item.unit').find('.el-select-dropdown-wrap').html(createUnitHtml(unitlis,'unit'));
    }).fail(function(unitrsp,dataTypersp){
        layer.close(layerLoading);
        console.log('获取单位列表或数据类型失败，请重新搜索');
        // LayerConfig('fail','获取单位列表或数据类型失败，请重新搜索');
    });
}

//属性弹层
function AttrModal(flag,data){
    var height=($(window).height()-200)+'px';
    var {id='',key='',name='',comment='',datatype_id='',unit_id='',label=''}={};
    if(data){
        ({id='',key='',name='',comment='',datatype_id='',unit_id='',label=''}=data);
    }
    var labelWidth=84,
        btnShow='btnShow',
        title='查看物料属性',
        unitHtml='',
        dataTypeHtml='';

    if(unitData.length){
        unitData.forEach(function(item){
            unitHtml+=`<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.unit_text}</li>`;
        });
    }

    if(dataTypeData.length){
        dataTypeData.forEach(function(item){
            dataTypeHtml+=`<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.cn_name}</li>`;
        });
    }
    flag==='view'?(btnShow='btnHide'):(flag==='add'?title='添加物料属性':(title='编辑物料属性'));
    
    layerModal=layer.open({
      type: 1, 
      title: title,
      offset: '100px',
      area: '500px',
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: false,
      content: `<form id="addMAttr_from" class="formModal formMateriel" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${id}">
                <div class="modal-wrap" style="max-height: ${height}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">键值<span class="mustItem">*</span></label>
                            <input type="text" id="key" class="el-input" placeholder="由3-50位字母下划线数字组成,字母开头" value="${key}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" class="el-input" placeholder="请输入名称" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">标签</label>
                            <input type="text" id="label" class="el-input" placeholder="${flag=='view'?'':'请输入标签'}" value="${label}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" id="unitDiv">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">单位</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="unit_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        ${unitHtml}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" id="dataTypeDiv">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">数据类型<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="datatype_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        ${dataTypeHtml}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="dataTypeWrap" id="dataTypeWrap">
                            
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">注释</label>
                            <textarea type="textarea" maxlength="500" id="comment" rows="5" class="el-textarea" placeholder="${flag=='view'?'':'请输入注释，最多只能输入500字'}">${comment}</textarea>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group" id="material_attribute_add">
                        <button type="button" class="el-button el-button--primary submit add">确定</button>
                    </div>
                </div>
            </form>` ,
        success: function(layero,index){
            layerEle=layero;
            getLayerSelectPosition($(layero));
            if(data){
                if(flag=='view'){
                    if(data.unit_id!=''){
                        var unitText=$(layero).find('#unitDiv .el-select-dropdown-item[data-id='+data.unit_id+']').text();
                        $(layero).find('#unitDiv .el-select-dropdown-wrap').html(`<input type="text" readonly="readonly" class="el-input" value="${unitText}">`);
                    }else{
                        $(layero).find('#unitDiv .el-select-dropdown-wrap').html(`<input type="text" readonly="readonly" class="el-input" value="--无--">`);
                    }
                    var typeText=$(layero).find('#dataTypeDiv .el-select-dropdown-item[data-id='+data.datatype_id+']').text();
                    $(layero).find('#dataTypeDiv .el-select-dropdown-wrap').html(`<input type="text" readonly="readonly" class="el-input" value="${typeText}">`);
                    if(data.datatype_id==1){
                        $('#dataTypeWrap').html(createNumHtml(data.range));
                    }else if(data.datatype_id==2){
                        $('#dataTypeWrap').html(createSelectHtml(data.range));
                        setTimeout(function(){
                            $('#dataTypeWrap').find('.el-checkbox_input').addClass('noedit');
                        },200);
                    }
                    $(layero).find('.el-input,.el-textarea').attr('readonly','readonly');
                }else if(flag=='edit'){
                    $(layero).find('#key').attr('readonly','readonly');
                    $(layero).find('#dataTypeDiv .el-select-dropdown-item[data-id='+data.datatype_id+']').click();
                    if(data.unit_id!=0&&data.unit_id!=''){
                        var uele=$(layero).find('#unitDiv');
                        uele.find('.el-select-dropdown-item[data-id='+data.unit_id+']').click();
                        uele.find('.el-select').addClass('noedit').find('.el-input').addClass('readonly').siblings('.el-input-icon').remove();
                    }
                    var dele=$(layero).find('#dataTypeDiv');
                    dele.find('.el-select').addClass('noedit').find('.el-input').addClass('readonly').siblings('.el-input-icon').remove();
                } 
            }
        },
        end: function(){
            layerEle='';
            $('.uniquetable tr.active').removeClass('active');
        }
    }); 
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
    $('.uniquetable').on('click','.delete',function(){
    	var id=$(this).attr("data-id");
        var num=$('#table_attr_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
    	layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
		  layer.close(index);
		  deleteMaterielAttr(id,num);
		});
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
        getMaterielAttr();
    });
    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
        if(layerEle!=''&&$(this).siblings('.el-select-dropdown').is(':visible')){
            getLayerSelectPosition(layerEle);
        }
	});

	$('body').on('click','.el-select-dropdown-item',function(e){
		e.stopPropagation();
		$(this).parent().find('.el-select-dropdown-item').removeClass('selected');
		$(this).addClass('selected');
		var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val($(this).attr('data-id'));
        if(ele.find('.val_id').attr('id')=='datatype_id'){
            var parentEle=$(this).parents('.el-form-item');
            validatorConfig['datatype_id']
            &&validatorToolBox[validatorConfig['datatype_id']]('datatype_id');
            if(dataTypeCorrect){
                parentEle.find('.errorMessage').html('');
                if(idval==1){//数字
                    dataTypeFlag='number';
                    validatorConfig.default_value='checkNumberValue';
                    validatorConfig.selectData='';
                    if(range!==null&&range!="null"){
                        $('#addMAttr_from #dataTypeWrap').html(createNumHtml(range));
                    }else{
                        $('#addMAttr_from #dataTypeWrap').html(createNumHtml());
                    }    
                }else if(idval==2){//选择
                    dataTypeFlag='select';
                    validatorConfig.default_value='';
                    validatorConfig.selectData='checkSelectData';
                    if(range!==null&&range!=="null"){
                        $('#addMAttr_from #dataTypeWrap').html(createSelectHtml(range));
                    }else{
                        $('#addMAttr_from #dataTypeWrap').html(createSelectHtml());
                    }
                }else{
                    dataTypeFlag='';
                    validatorConfig.default_value='';
                    validatorConfig.selectData='';
                    numberCorrect=1;
                    selectCorrect=1;
                    $('#dataTypeWrap').html('').css("border","none");
                }
            }
        }
		$(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
	});

	//搜索物料属性
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
                key: parentForm.find('#key').val().trim(),
                name: parentForm.find('#name').val().trim(),
                label: parentForm.find('#label').val().trim(),
                datatype_id: parentForm.find('#datatype_id').val(),
                unit_id: parentForm.find('#unit_id').val(),
                order: 'desc',
                sort: 'id',
                is_searchable: parentForm.find('#is_searchable').val(),
                is_visible_table: parentForm.find('#is_visible_table').val(),
                is_man_haur_param: parentForm.find('#is_man_haur_param').val()
            }
            getMaterielAttr();
        }  
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#key').val('');
        parentForm.find('#name').val('');
        parentForm.find('#label').val('');
        parentForm.find('#datatype_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#unit_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#is_searchable').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#is_visible_table').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#is_man_haur_param').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getMaterielAttr();
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

    //添加
    $('body').on('click','.button_add',function(){
        range=null;
        AttrModal('add');
    });

    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        if($(this).attr('id')=='min_value'||$(this).attr('id')=='max_value'){
            $('#default_value').parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
        }else{
            $(this).parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
        }
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=attrActionFlag,
        name=$(this).attr("id");
        if($(this).hasClass('validator')){
            name='selectData';
        }
        if(name=='min_value'||name=='max_value'){
            name='default_value';
        }
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name);
    });

    //添加选择项
    $('body').on('click','.formMateriel:not(".disabled") .item-add',function(e){
        var len=$('#dataTypeWrap').find('.select-item').length+1;
        $('#dataTypeWrap .item-select-wrap').append(createSelectItemHtml(len));
    });

    //删除选择项
    $('body').on('click','.formMateriel:not(".disabled") .item-delete',function(){
        $(this).parents('.select-item').remove();
        $('#dataTypeWrap').find('.select-item').each(function(index,item){
            $(item).find('.num').html(index+1);
        });
        $('#dataTypeWrap').find('.errorMessage').html('').show();
    });

    //checkbox点击
    $('body').on('click','.formMateriel:not(".disabled") .el-checkbox_input:not(.noedit)',function(){
        $(this).toggleClass('is-checked').parents('.select-item').siblings('.select-item').find('.el-checkbox_input').removeClass('is-checked');
    });

    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        getMaterielAttribute($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        $(this).parents('tr').addClass('active');
        getMaterielAttribute($(this).attr("data-id"),'edit');
    });
    //添加按钮点击
    $('body').on('click','.formMateriel:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addMAttr_from');
            var correct=1;
            for (var type in validatorConfig) {
                if(type=='default_value'&&validatorConfig['default_value']==''){
                    correct=1;
                }else if(type=='selectData'&&validatorConfig['selectData']==''){
                    correct=1;
                }else{
                    correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                }
                if(!correct){
                    break;
                }
            }
            if (correct) {
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var attrid=parentForm.find('#itemId').val(),
                skey = parentForm.find('#key').val().trim(),
                 slabel = parentForm.find('#label').val().trim(),
                 sname= parentForm.find('#name').val().trim(),
                 sunit_id = parentForm.find('#unit_id').val(),
                 scomment = parentForm.find('#comment').val(),
                 sdatatype_id = parentForm.find('#datatype_id').val(),
                 sis_man_haur_param = 0,
                 sis_visible_table = 0,
                 sis_searchable = 0;
                 var range={};
                 if(dataTypeFlag=='number'){
                    range=getMinMaxvalue();
                 }else if(dataTypeFlag=='select'){
                    range=getOptionvalue();
                 }
                parentForm.attr('data-flag')=='add'?
                addMaterielAttribute({
                    key: skey,
                    label: slabel,
                    name: sname,
                    datatype_id: sdatatype_id,
                    unit_id: sunit_id,
                    range: JSON.stringify(range),
                    is_searchable: sis_searchable,
                    is_visible_table: sis_visible_table,
                    is_man_haur_param: sis_man_haur_param,
                    comment: scomment,
                    _token: TOKEN
                }):
                editMaterielAttribute({
                    key: skey,
                    label: slabel,
                    name: sname,
                    datatype_id: sdatatype_id,
                    unit_id: sunit_id,
                    range: JSON.stringify(range),
                    is_searchable: sis_searchable,
                    is_visible_table: sis_visible_table,
                    is_man_haur_param: sis_man_haur_param,
                    comment: scomment,
                    _token: TOKEN,
                    attribute_definition_id: attrid
                })

            }
        }

        })
}