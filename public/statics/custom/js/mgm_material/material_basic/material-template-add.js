var layerLoading,
layerModal,
atrrTool,
opAttrTool,
itemSelect=[],
codeCorrect=!1,
nameCorrect=!1,
attrCorrect=!1,
parentId=0,
materielTypeId=0,
dataTypeFlag='',
temActionFlag='',
templateid='',
editUrl='',
validatorToolBox={
    checkCode: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
        !/^[a-zA-Z]\w{0,49}$/g.test(value)?(showInvalidMessage(name,"由1-49个字母数字下划线组成，且字母开头"),codeCorrect=!1,!1):
        (codeCorrect=1,!0);
    },
    checkName: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
        (nameCorrect=1,!0);
    }
},
remoteValidatorToolbox={
    remoteCheckCode: function(flag,name){
        var value=$('#'+name).val().trim();
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
        var value=$('#'+name).val().trim();
        getUnique(flag,name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                labelCorrect=!1;
                var val='已注册';
                showInvalidMessage(name,val);
            }else{
                labelCorrect=1;
            }
        });
    }
},
validatorConfig = {
    code: "checkCode",
    name: "checkName"
},remoteValidatorConfig={
    code: "remoteCheckCode",
    name: "remoteCheckName"
};

$(function(){
    editUrl=$('#template_edit').val();
    var url=window.location.pathname.split('/');
    if(url.indexOf('templateEdit')>-1){
        temActionFlag='edit';
        $('#addMTemplate_from').find('.btn-group.edit').show().siblings('.btn-group.add').hide();
        templateid=getQueryString('id');
        templateid!=undefined?getMaterielTemplateShow(templateid):LayerConfig('fail','url链接缺少id参数，请给到id参数');
        $('.el-tap-wrap').addClass('edit');
        $('.el-button.next').addClass('edit');
        $('.addMTemplate_from .tip-info').show();
    }else{
        $('.addMTemplate_from .tip-info').hide();
        temActionFlag='add';
        getMaterielVaildTemplate();
    } 
    bindEvent();
});


//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val).show();
    $('#'+name).parents('.formMateriel').find('.submit').removeClass('is-disabled');
}

//工艺属性初始化
function getCraftsApp(sdata,tdata,flag){
    if(opAttrTool!=undefined){
        opAttrTool.destroy();
    }
    opAttrTool=$('#craftsApp').MTransferTool({
        'sourceTitle': '可选属性',
        'targetTitle': '已选属性',
        'sdata': sdata,
        'tdata': tdata,
        'pdata': [],
        'flag': flag,
        'extendFlag': false,
        'fn': function(){
            if($('.submit.opattr').hasClass('is-disabled')){
                $('.submit.opattr').removeClass('is-disabled');
            }
        }
    });
}
//物料属性初始化
function getAttrApp(sdata,tdata,pdata,flag){
    if(atrrTool!=undefined){
        atrrTool.destroy();
    }
    atrrTool=$('#attrApp').MTransferTool({
        'sourceTitle': '可选属性',
        'targetTitle': '已选属性',
        'sdata': sdata,
        'tdata': tdata,
        'pdata': pdata,
        'flag': flag,
        'extendFlag': true,
        'fn': function(){
            if($('.submit.attr').hasClass('is-disabled')){
                $('.submit.attr').removeClass('is-disabled');
            }
        }
    });
}

//添加基础信息
function addMaterielTemplate(data){
    AjaxClient.post({
        url: URLS['template'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加成功,将前往编辑页面', {icon: 1,offset: '250px',time: 1500});
            setTimeout(function(){
                window.location.href=editUrl+'?id='+rsp.results.template_id;
            },1000);
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            console.log('添加失败');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
        complete: function(XHR, TS){
            $('body').find('.submit.basic').removeClass('is-disabled');
        }
    },this);
}

//查看物料模板
function getMaterielTemplateShow(id){
    AjaxClient.get({
        url: URLS['template'].show+"?"+_token+"&template_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            $('#code').val(rsp.results.code).attr('readonly','readonly');
            $('#name').val(rsp.results.name);
            $('#label').val(rsp.results.label);
            $('#description').val(rsp.results.description);
            var statushtml=`<span class="el-tag ${rsp.results.status?'el-tag-success':'el-tag-danger'}">${rsp.results.status?'有效':'无效'}</span>
            ${rsp.results.status?'':'<div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip">没有物料属性<i></i></span></div>'}`;
            $('.el-form-item.status').show().find('.status').html(statushtml);
            parentId=rsp.results.parent_id;
            getMaterielVaildTemplate();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取模板信息失败');
        }
    },this);
}

//编辑物料模板
function editMaterielBasic(data){
    AjaxClient.post({
        url: URLS['template'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','保存物料模板基础信息成功');
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            console.log('编辑基础信息失败');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
        complete: function(XHR, TS){
            $('body').find('.submit.basic').removeClass('is-disabled');
        }
    },this);
}

//获取物料模板树列表
function getMaterielVaildTemplate(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['template'].select+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var parentlis=selectHtml(rsp,'parent',parentId);
            $('.el-form-item.parent').find('.el-form-item-div .div_wrap').html(parentlis);
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取有效父级模板失败');
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

//获取物料模板树列表
function getTemplateSearch(name){
    AjaxClient.get({
        url: URLS['template'].select+"?"+_token+"&name="+name,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var parent_id=$('#addMTemplate_from #parent_id').val()||0;
            var lis='<li data-id="" data-pid="" class="el-select-dropdown-item  kong" data-name="--请选择--">--请选择--</li>';
            if(rsp.results&&rsp.results.length){
                lis+=treeHtml(rsp.results,rsp.results[0].parent_id,parent_id);
            }
            $('.el-form-item.parent').find('.el-select-dropdown-list').html(lis);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取有效父级模板失败');
        }
    },this);
}

//获取属性可选属性
function getSelectAttr(id,type){
    var url='';
    type=='attr'?url=URLS['template'].attr+"?":url=URLS['template'].opattr+"?";
    var dtd=$.Deferred();
    AjaxClient.get({
        url: url+_token+"&template_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

//获取属性已选属性
function getSelectedAttr(id,type){
    type=='attr'?url=URLS['template'].attrSelected+"?":url=URLS['template'].opattrSelected+"?";
    var dtd=$.Deferred();
    AjaxClient.get({
        url: url+_token+"&template_id="+id,
        dataType: 'json',
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

//获取属性继承属性
function getExtendAttr(id,type){
    type=='attr'?url=URLS['template'].attrParent+"?":url=URLS['template'].opattrParent+"?";
    var dtd=$.Deferred();
    AjaxClient.get({
        url: url+_token+"&template_id="+id,
        dataType: 'json',
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

//物料属性所有异步
function getAllAttr(){
    $.when(getSelectAttr(templateid,'attr'),getSelectedAttr(templateid,'attr'),getExtendAttr(templateid,'attr'))
    .done(function(attrrsp,selectedrsp,extendrsp){
        attrrsp&&attrrsp.results
        &&selectedrsp&&selectedrsp.results
        &&extendrsp&&extendrsp.results
        &&getAttrApp(attrrsp.results,selectedrsp.results,extendrsp.results,'attr');
        if(extendrsp.results&&extendrsp.results.length){
            attrCorrect=1;
        }
    }).fail(function(attrrsp,selectedrsp,extendrsp){
        console.log('获取物料属性失败');
    }).always(function(){
        layer.close(layerLoading);
    });
}

//工艺属性所有异步
function getAllOPAttr(){
    $.when(getSelectAttr(templateid,'opattr'),getSelectedAttr(templateid,'opattr'))
    .done(function(attrrsp,selectedrsp){
        attrrsp&&attrrsp.results
        &&selectedrsp&&selectedrsp.results
        &&getCraftsApp(attrrsp.results,selectedrsp.results,'opattr');
        setTimeout(function(){
            getFilterData(attrrsp.results);
        },0);
    }).fail(function(attrrsp,selectedrsp,extendrsp){
        console.log('获取工艺属性失败');
    }).always(function(){
        layer.close(layerLoading);
    });
}

//属性过滤所有异步
function getAttrFilter(){
    AjaxClient.get({
        url: URLS['template'].attrFilter+"?"+_token+"&template_id="+templateid,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                if(!(rsp.results.operation_attribute.length||rsp.results.material_attribute.length)){
                    $('#table_filter_noData').parents('.div_con_wrapper').show();
                }else{
                    $('#table_filter_noData').parents('.div_con_wrapper').hide();
                }
                if(rsp.results.material_attribute&&rsp.results.material_attribute.length){
                    $('#table_filter_attr').parents('.div_con_wrapper').show();
                    $('#table_filter_attr').find('.table_tbody').html('');
                    var html=createFilterHtml(rsp.results.material_attribute,$('#table_filter_attr').find('.table_tbody')); 
                }else{
                    $('#table_filter_attr').parents('.div_con_wrapper').hide();
                }
                if(rsp.results.operation_attribute&&rsp.results.operation_attribute.length){
                    $('#table_filter_gyattr').parents('.div_con_wrapper').show();
                    $('#table_filter_gyattr').find('.table_tbody').html('');
                    var html=createFilterHtml(rsp.results.operation_attribute,$('#table_filter_gyattr').find('.table_tbody'));
                }else{
                    $('#table_filter_gyattr').parents('.div_con_wrapper').hide();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取过滤属性失败');
            dtd.reject(rsp);
        }
    },this);
}

//过滤已选的工艺属性
function getFilterData(arr){
    opAttrTool.getSubmitEle().each(function(){
        var id=$(this).data('item').attribute_definition_id;
        arr.forEach(function(item,index){
            if(item.attribute_definition_id==id){
                var ids=getIds(arr);
                var delindex=ids.indexOf(id);
                arr.splice(delindex,1);
            }
        });
    });

    opAttrTool.changeGYData($('#craftsApp').find('.source-panel'),arr);
}

//查看物料属性
function getMaterielAttribute(id){
    AjaxClient.get({
        url: URLS['attr'].show+"?"+_token+"&attribute_definition_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            AttrModal(rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取属性详情失败');
        }
    },this);
}

function getIds(arr){
    var ids=[];
    arr.forEach(function(item){
        ids.push(item.attribute_definition_id);
    });
    return ids;
}

//读取已选的属性和工艺属性
function getAllPostAttr(type){
    var eles=[];
    type=='attr'?eles=atrrTool.getSubmitEle():eles=opAttrTool.getSubmitEle();
    var ids=[];
    eles.each(function(){
        var item={
                attribute_definition_id: $(this).data('item').attribute_definition_id,
                is_extends: $(this).find('.el-radio-input.is-radio-checked').length
            };
        ids.push(item);
    });
    return ids;
}

//保存物料属性
function saveAttr(data){
    AjaxClient.post({
        url: URLS['template'].saveAttr,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','保存物料属性成功');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('保存物料属性失败');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                layer.confirm(rsp.message, {
                    icon: 5,
                    btn: ['恢复已选属性', '关闭'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px',
                    btn2: function(index, layero){
                        layer.close(index);
                  }
                }, function(index, layero){
                    getAllAttr();
                    layer.close(index);
                });
            }
        },
        complete: function(XHR, TS){
            $('body').find('.submit.attr').removeClass('is-disabled');
        }
    },this);
}

//保存工艺属性
function saveOPAttr(data){
    AjaxClient.post({
        url: URLS['template'].saveOPAttr,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','保存工艺属性成功');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('保存工艺属性失败');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                layer.confirm(rsp.message, {
                    icon: 5,
                    btn: ['恢复已选属性', '关闭'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px',
                    btn2: function(index, layero){
                        layer.close(index);
                  }
                }, function(index, layero){
                    getAllOPAttr();
                    layer.close(index);
                });
            }
        },
        complete: function(XHR, TS){
            $('body').find('.submit.opattr').removeClass('is-disabled');
        }
    },this);
}

//保存属性过滤值
function saveFilterVlaue(){
    var attrdata=[];
    $('#addMTemplateAttrFilter_from .attr_tr').each(function(){
        var item={},filterdata=[];
        if($(this).find('.gwj.is-checked').length){
            if($(this).attr('data-type')==2){
                $(this).find('.value_wrap').length?($(this).find('.value_wrap').each(function(){
                    var value=$(this).find('.val_id').val();
                    if(!Validate.checkNull(value)&&(filterdata.indexOf(value)==-1)){
                        filterdata.push(value);
                    }
                })):filterdata=[];
            }else{
                $(this).find('.value_wrap').length?($(this).find('.value_wrap').each(function(){
                    var value=$(this).find('.el-input').val();
                    if(!Validate.checkNull(value)&&(filterdata.indexOf(value)==-1)){
                        filterdata.push(value);
                    }
                })):filterdata=[];
            }
        }
        item={
            attribute_definition_id: $(this).attr('data-id'),
            is_merge: $(this).find('.merge.is-checked').length,
            is_view: $(this).find('.gwj.is-checked').length,
            filter_value: filterdata.length?filterdata:''
        }
        attrdata.push(item);
    });
    var data={
        template_id: templateid,
        attributes_config: JSON.stringify(attrdata),
        _token: TOKEN
    }
    AjaxClient.post({
        url: URLS['template'].saveAttrFilter,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','保存属性过滤值成功');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('保存属性过滤值失败');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        },
        complete: function(XHR, TS){
            $('body').find('.submit.saveFilter').removeClass('is-disabled');
        }
    },this);
}

//生成过滤值的项
function createFilterItem(data,type){
    var filterInput='',dropdownhtml='';
    if(data.datatype_id==1){
        if(type=='add'){
            filterInput=`<div class="value_wrap">
                        <input type="number" class="el-input" value=""><span class="unit-span">${data.unit_name}</span><span class="el-tag"><i class="el-icon el-tag-close el-icon-close"></i></span>
                    </div>`;
        }else{
            var filterData="",
            itemhtml='',
            is_view=data.is_view,
            readonly='',
            show='';
            if(!is_view){
                readonly='readonly="readonly"';
                show='display: none;'
            }
            filterData=data.filter_value!=null&&data.filter_value!=""&&data.filter_value;
            if(filterData.length){
                filterData.forEach(function(item){
                    itemhtml+=`<div class="value_wrap">
                        <input type="number" class="el-input" value="${item}"><span class="unit-span">${data.unit_name}</span><span style="${show}" class="el-tag"><i class="el-icon el-tag-close el-icon-close"></i></span>
                    </div>`;
                });
            }
            filterInput=itemhtml;
        }
    }else if(data.datatype_id==2){
        var filterData=[],selectFilterData=[];
        data.filter_value!=null&&data.filter_value!=""&&(filterData=data.filter_value);
        var rangeData=JSON.parse(data.range);
        if(rangeData&&rangeData.options!=undefined&&rangeData.options.length){
            var lis='';
            rangeData.options.forEach(function(item){
                lis+=`<li data-id="${item.index}" data-code="${item.code}" title="${item.label}" class=" el-select-dropdown-item "><span>${item.label}</span></li>`;
                filterData.indexOf(item.index)>-1?selectFilterData.push(item):null;
            });
            dropdownhtml=`<div class="el-select-dropdown">
                <ul class="el-select-dropdown-list">
                    ${lis}
                </ul>
            </div>`;
        }else{
            dropdownhtml=`<div class="el-select-dropdown">
                <ul class="el-select-dropdown-list">
                    <li class="" style="color:red;"><span>请先去完善属性选择项</span></li>
                </ul>
            </div>`;
        }
        if(type=='add'){
            filterInput=`<div class="value_wrap">
                <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input select-input" value="--请选择--">
                        <input type="hidden" class="val_id"  value="">
                    </div>
                    ${dropdownhtml}
                </div>
                <span class="el-tag"><i class="el-icon el-tag-close el-icon-close"></i></span>
            </div>`;
        }else{
            var itemhtml='',
            is_view=data.is_view,
            readonly='',
            show='';
            if(!is_view){
                readonly='readonly="readonly"';
                show='display: none;'
            } 
            if(filterData.length){
                filterData.forEach(function(item,index){
                    itemhtml+=`<div class="value_wrap">
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" readonly="readonly" class="el-input select-input" value="${selectFilterData[index].label}">
                            <input type="hidden" class="val_id"  value="${selectFilterData[index].index}">
                        </div>
                        ${dropdownhtml}
                    </div>
                    <span class="el-tag"><i class="el-icon el-tag-close el-icon-close"></i></span>
                </div>`;
                });
            }
            filterInput=itemhtml;
        }  
    }else{
        if(type=='add'){
            filterInput=`<div class="value_wrap">
                        <input type="text" class="el-input" value=""><span class="unit-span">${data.unit_name}</span><span class="el-tag"><i class="el-icon el-tag-close el-icon-close"></i></span>
                    </div>`;
        }else{
            var filterData="",
            itemhtml='',
            is_view=data.is_view,
            readonly='',
            show='';
            if(!is_view){
                readonly='readonly="readonly"';
                show='display: none;'
            }
            filterData=data.filter_value!=null&&data.filter_value!=""&&data.filter_value;
            if(filterData.length){
                filterData.forEach(function(item){
                    itemhtml+=`<div class="value_wrap">
                        <input type="text" class="el-input" value="${item}"><span class="unit-span">${data.unit_name}</span><span style="${show}" class="el-tag"><i class="el-icon el-tag-close el-icon-close"></i></span>
                    </div>`;
                });
            }
            filterInput=itemhtml;
        }
    }

    return filterInput;
}
//生成属性过滤列表
function createFilterHtml(data,ele){
    var html='';
    data.forEach(function(item){
        html=`<tr class="attr_tr" data-id="${item.attribute_definition_id}" data-type="${item.datatype_id}" data-unit="${item.unit_name}">
            <td><div class="overflow" title="${item.key}">${item.key}</div></td>
            <td><div class="overflow" title="${item.name}">${item.name}</div></td>
            <td>${item.datatype_name}</td>
            <td>${item.unit_name}</td>
            <td>
                <div class="filter_checkbox_wrap">
                    <span class="el-checkbox_input merge ${item.is_merge? 'is-checked':''}">
                        <span class="el-checkbox-outset"></span>
                        <input type="hidden" value="1">
                    </span>
                    拼单属性？
                </div>
            </td>
            <td>
                <div class="filter_checkbox_wrap">
                    <span class="el-checkbox_input gwj ${item.datatype_id==2?'select':''} ${item.is_view? 'is-checked':''}">
                        <span class="el-checkbox-outset"></span>
                        <input type="hidden" value="1">
                    </span>
                    工位机可查看？
                </div>
            </td>
            <td>
                <div class="el-form-item">
                    <div class="filter_value">
                        ${createFilterItem(item,'edit')}
                    </div>
                    <button class="el-button add-filter ${item.is_view? '':'is-disabled'}">添加</button>
                </div>
            </td>
        </tr>`;
        ele.append(html);
        ele.find('.attr_tr:last-child').data({'trdata':item});
    });
}

//生成select框数据
function selectHtml(data,flag,selectId){
    var elSelect,innerhtml,selectVal='--请选择--',parent_id='',lis='';
    itemSelect=[];
    if(data&&data.results&&data.results.length){
        lis=treeHtml(data.results,data.results[0].parent_id,selectId);
    }
    if(temActionFlag=='edit'){
        itemSelect.length?(selectVal=itemSelect[0].name,parent_id=itemSelect[0].id):
        (selectVal='无',parent_id='');   
    }
    if(temActionFlag=='edit'&&flag=='parent'){
        innerhtml=`<div class="el-select">
            <input type="text" readonly="readonly" class="el-input readonly" value="${selectVal}">
            <input type="hidden" class="val_id" id="parent_id" value="${parent_id}">
        </div>`;
    }else{
        innerhtml=`<div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectVal}">
            <input type="hidden" class="val_id" id="parent_id" value="${parent_id}">
        </div>
        <div class="el-select-dropdown">
            <div class="search-div">
                <input type="text" class="el-input el-input-search" placeholder="搜索">
                <span class="search-icon search-span m_category"><i class="fa fa-search"></i></span>
            </div>
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item  kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div>`;
    }
    
    elSelect=`<div class="el-select-dropdown-wrap">
            ${innerhtml}
        </div>`;
    itemSelect=[];
    return elSelect;
}

//生成树结构
function treeHtml(fileData, parent_id,selectId) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';

    children.forEach(function (item, index) {
      var selectedClass='';
      item.id==selectId?(itemSelect.push(item),selectedClass='selected'):null;
      var lastClass=index===children.length-1? 'last-tag' : '';
      var level = item.level;
      var distance,className,itemImageClass,tagI;
      var hasChild = hasChilds(fileData, item.id);
      hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
      distance=level * 20;
      tagI='';
      var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`: `${tagI}<span>${item.name}</span>`;
       selectId==item.id?itemSelect.push(item):null;
       _html += `
        <li data-id="${item.id}" data-pid="${parent_id}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
        ${treeHtml(fileData, item.id,selectId)}
        `;
    });
    return _html;
  };

//检测唯一性
function getUnique(flag,field,value,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${templateid}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['template'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = layer.load(2, {shade: false,offset: '300px'});
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

//获取基础信息数据
function getaddMTemplateData(){
    var parentForm=$('#addMTemplate_from');
    var ajaxAddForm={
        _token: TOKEN,
        code: parentForm.find('#code').val().trim(),
        name: parentForm.find('#name').val().trim(),
        label: parentForm.find('#label').val().trim(),
        description: parentForm.find('#description').val().trim(),
        parent_id: parentForm.find('#parent_id').val().trim()||0
    };

    return ajaxAddForm;
}

//tab点击发异步
function tabClick(panel){
    if(panel=='addMTemplate_from'){ //基础信息
        getMaterielTemplateShow(templateid);
    }else if(panel=='addMTemplateAttr_from'){ //物料属性
        getAllAttr();
    }else if(panel=='addMTemplateGYAttr_from'){ //工艺属性
        getAllOPAttr();
    }else if(panel=='addMTemplateAttrFilter_from'){//属性过滤
        getAttrFilter();
    }   
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
    var numHtml=`<div class="attr-item-wrap">
                <div class="attr-item">
                    <span class="attr-label">最小值：</span>
                    <span class="attr-val">${min_value}</span>
                </div>
                <div class="attr-item">
                    <span class="attr-label">最大值：</span>
                    <span class="attr-val">${max_value}</span>
                </div>
                <div class="attr-item">
                    <span class="attr-label">默认值：</span>
                    <span class="attr-val">${default_value}</span>
                </div>
            </div>`;
    return numHtml;
}
//数据类型为选择
function createSelectHtml(data){
    var sehtml='';
    if(data&&data!==null&&data!=="null"){
        var jsonData=JSON.parse(data);
        if(jsonData.options&&jsonData.options.length){
            jsonData.options.forEach(function(item){
                var selected=item.index==jsonData.default_value? true: false;
                sehtml+=createSelectItemHtml(item.index,item,selected);
            })
        }
    }
    var selectHtml=`<div class="attr-item-wrap">
        ${sehtml}
    </div>`;
    return selectHtml;
}

function createSelectItemHtml(num,item,selected){
    var itemHtml=`<div class="attr-item">
                    <span class="attr-label">选项：</span>
                    <span class="attr-val">${item.label}</span>
                    <span class="el-checkbox_input ${selected? 'is-checked':''}">
                        <span class="el-checkbox-outset"></span>
                        <input type="hidden" value="${num}">
                    </span>
                </div>`;
    return itemHtml;
}

//属性详情
function AttrModal(data){
    var typehtml='';
    if(data.datatype_id==1){
        typehtml=createNumHtml(data.range);
    }else if(data.datatype_id==2){
        typehtml=createSelectHtml(data.range);
    }
    layerModal=layer.open({
      type: 1, 
      title: '属性详情',
      offset: '100px',
      area: '400px',
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: false,
      content: `<div class="attr-info-wrap">
            <div class="attr-item-wrap">
                <div class="attr-item">
                    <span class="attr-label">键值：</span>
                    <span class="attr-val" title="${data.key}">${data.key}</span>
                </div>
                <div class="attr-item">
                    <span class="attr-label">名称：</span>
                    <span class="attr-val" title="${data.name}">${data.name}</span>
                </div>
            </div>
            <div class="attr-item-wrap">
                <div class="attr-item">
                    <span class="attr-label">标签：</span>
                    <span class="attr-val" title="${data.label}">${data.label}</span>
                </div>
                <div class="attr-item">
                    <span class="attr-label">单位：</span>
                    <span class="attr-val">${data.unit_text}</span>
                </div>
            </div>
            <div class="attr-item">
                <span class="attr-label">数据类型：</span>
                <span class="attr-val">${data.datatype}</span>
            </div>
            ${typehtml}
            <div class="attr-item">
                <span class="attr-label">注释：</span>
                <span class="attr-val" title="${data.comment}">${data.comment}</span>
            </div>
      </div>` ,
        success: function(layero,index){
            layerEle=layero;
        },
        end: function(){
        }
    }); 
}

//操作属性
function actAttr(ele){
    if(ele.hasClass('attr')){//物料属性搜索
        var val=$('#search_attr').val();
        var data=atrrTool.getLastData();
        var searchData=[];
        data.forEach(function(item,index){
            (item.key.indexOf(val)>-1||item.name.indexOf(val)>-1||item.label.indexOf(val)>-1)?searchData.push(item):null;
        });
        atrrTool.changeData($('#attrApp').find('.source-panel'),searchData);
    }else{//工艺属性搜索
        var val=$('#search_opattr').val();
        var data=opAttrTool.getLastData();
        var searchData=[];
        data.forEach(function(item,index){
            (item.key.indexOf(val)>-1||item.name.indexOf(val)>-1||item.label.indexOf(val)>-1)?searchData.push(item):null;
        });
        opAttrTool.changeData($('#craftsApp').find('.source-panel'),searchData);
    }
}

function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });
    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    $('body').on('click','.el-checkbox-template .info',function(){
        if($(this).hasClass('attr')){//物料属性
            getMaterielAttribute($(this).attr('data-id'));
        }else{//工艺属性

        }
    });

    //模板搜索
    $('body').on('click','.search-icon.search-span',function(){
        var val=$(this).siblings('.el-input').val().trim();
        getTemplateSearch(val);
    });
    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        if($(this).parents('.value_wrap').length&&$(this).find('.el-input-icon.is-reverse').length){
            var width=$(this).width();
            var offset=$(this).offset();
            $(this).siblings('.el-select-dropdown').width(width).css({top: 0,left: 0}).offset({top: offset.top+30,left: offset.left});
        }
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //属性详情弹框
    $('body').on('click','.value_wrap .el-tag',function(e){
        $(this).parents('.value_wrap').remove();
    });
    //属性过滤删除
    $('body').on('click','.value_wrap .el-tag',function(e){
        $(this).parents('.value_wrap').remove();
    });

    //属性过滤的添加
    $('body').on('click','.add-filter',function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    $('body').on('click','.add-filter:not(.is-disabled)',function(e){
        e.stopPropagation();
        e.preventDefault();
        var data=$(this).parents('.attr_tr').data('trdata');
        var filterInput='';
        filterInput=createFilterItem(data,'add');
        $(this).siblings('.filter_value').append(filterInput);
        $('body').find('.submit.saveFilter').removeClass('is-disabled');
    });

    //物料属性搜索
    $('body').on('click','.el-panel .search',function(){
        actAttr($(this));
    });

    //物料属性搜索enter事件
    $("body").on("keyup","#search_attr,#search_opattr",function(event){
        if(event.keyCode=="13"){
            actAttr($(this));
        }
    });

    //属性过滤复选框点击
    $('body').on('click','#addMTemplateAttrFilter_from .el-checkbox_input',function(e){
        e.stopPropagation();
        e.preventDefault();
        $(this).toggleClass('is-checked');
        if($(this).hasClass('gwj')){
            if($(this).hasClass('is-checked')){
                 $(this).parents('.attr_tr').find('.add-filter').removeClass('is-disabled');
                $(this).parents('.attr_tr').find('.el-tag').show();
                if($(this).hasClass('select')){
                    $(this).parents('.attr_tr').find('.el-select').removeClass('noedit');
                    $(this).parents('.attr_tr').find('.el-select .el-icon-caret-top').show();
                }else{
                   $(this).parents('.attr_tr').find('.el-input:not(.select-input)').removeAttr('readonly');
                }
            }else{
                $(this).parents('.attr_tr').find('.add-filter').addClass('is-disabled');
                $(this).parents('.attr_tr').find('.el-tag').hide();
                if($(this).hasClass('select')){
                    $(this).parents('.attr_tr').find('.el-select').addClass('noedit');
                    $(this).parents('.attr_tr').find('.el-select .el-icon-caret-top').hide();
                }else{
                   $(this).parents('.attr_tr').find('.el-input:not(.select-input)').attr('readonly','readonly');
                }
            }
        }
    });

    //tap切换按钮
    $('body').on('click','.el-tap',function(){
        var form=$(this).attr('data-item');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
            tabClick(form);
        }
    });
    //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        $(this).parents('.el-select-dropdown').hide();
    });
    //单选按钮点击事件
    $('body').on('click','.el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');     
    });
    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly],.el-input-search),.el-textarea',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("").hide();
    }).on('blur','.el-input:not([readonly],.el-input-search),.el-textarea',function(){
        var flag=temActionFlag,
        name=$(this).attr("id");
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name);
    });
    //上一步按钮
    $('body').on('click','.el-button.prev',function(){
        var prevPanel=$(this).attr('data-prev');
        $(this).parents('.el-panel').removeClass('active').siblings('.'+prevPanel).addClass('active');
        $('.el-tap[data-item='+prevPanel+']').addClass('active').siblings().removeClass('active');
        tabClick(prevPanel);
    });
    //下一步按钮
    $('body').on('click','.el-button.next',function(){
        var nextPanel=$(this).attr('data-next');
        $(this).parents('.el-panel').removeClass('active').siblings('.'+nextPanel).addClass('active');
        $('.el-tap[data-item='+nextPanel+']').addClass('active').siblings().removeClass('active');
        tabClick(nextPanel);
    });
    //添加按钮点击
    $('body').on('click','.submit:not(.is-disabled)',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
            $(this).addClass('is-disabled');
            if($(this).hasClass('basic')){//基础信息
                $(this).removeClass('is-disabled');
                for (var type in validatorConfig) {
                    validatorConfig[type]&&
                    validatorToolBox[validatorConfig[type]](type);
                }
                if (codeCorrect &&nameCorrect) {
                    $(this).addClass('is-disabled');
                    var data={};
                    temActionFlag=='add'?
                    addMaterielTemplate(getaddMTemplateData()):
                    (data=getaddMTemplateData(),data.template_id=templateid,editMaterielBasic(data));
                }
            }else if($(this).hasClass('attr')){//物料属性
                var attrs=getAllPostAttr('attr');
                if(attrCorrect||attrs.length){
                    var data={
                        template_id: templateid,
                        attribute_definition_ids: JSON.stringify(getAllPostAttr('attr')),
                        _token: TOKEN
                    }
                    saveAttr(data);
                }else{
                    // 物料属性至少选择一个
                    // LayerConfig('fail','至少有一个物料属性');
                }
            }else if($(this).hasClass('opattr')){//工艺属性
                var data={
                    template_id: templateid,
                    attribute_definition_ids: JSON.stringify(getAllPostAttr('opattr')),
                    _token: TOKEN
                }
                saveOPAttr(data);
            }else if($(this).hasClass('saveFilter')){//属性过滤值
                saveFilterVlaue();
            }
        }
        })
}

    