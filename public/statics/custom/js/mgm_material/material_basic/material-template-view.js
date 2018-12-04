var layerLoading,
layerModal,
itemSelect=[],
parentId=0,
templateid='';
$(function(){
    templateid=getQueryString('id');
    templateid!=undefined?getMaterielTemplateShow(templateid):LayerConfig('fail','url链接缺少id参数，请给到id参数');
    bindEvent();
});

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
            console.log(rsp);
            $('#code').val(rsp.results.code).attr('readonly','readonly').parents('.el-form-item').find('.info').hide();
            $('#name').val(rsp.results.name);
            $('#label').val(rsp.results.label);
            $('#comment').val(rsp.results.comment);
            $('#description').val(rsp.results.description);
            var statushtml=`<span class="el-tag ${rsp.results.status?'el-tag-success':'el-tag-danger'}">${rsp.results.status?'有效':'无效'}</span>
            ${rsp.results.status?'':'<div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle-o"></i><span class="tip">没有物料属性<i></i></span></div>'}`;
            $('.el-form-item.status').show().find('.status').html(statushtml);
            parentId=rsp.results.parent_id;
            getMaterielTemplateShowTree();
            getAllAttr();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取模板信息失败');
        }
    },this);
}

//获取物料模板树列表
function getMaterielTemplateShowTree(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['template'].treeList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var parentlis='';
            parentlis=selectHtml(rsp,'parent',parentId);
            $('.el-form-item.parent').find('.el-select-dropdown-wrap').html(parentlis);
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取物料模板树列表失败');
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
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
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
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

function createAttrHtml(data,type){
    var html='';
    data&&data.results&&data.results.length&&data.results.forEach(function(item){
        html+=`<div class="attr_def" data-id="${item.attribute_definition_id}">
                <p><span>键值:</span>${item.key}</p>
                <p><span>名称:</span>${item.name}</p>
            </div>`;
    });
    return html;
}

//获取所有属性
function getAllAttr(){
    $.when(getSelectedAttr(templateid,'attr'),getExtendAttr(templateid,'attr'),getSelectedAttr(templateid,'opattr'))
    .done(function(attrrsp,attrprsp,oprsp,opprsp){
        var attrhtml='',attrphtml='',opattrhtml='',oppattrhtml='';
        attrhtml=createAttrHtml(attrrsp,'attr');
        attrphtml=createAttrHtml(attrprsp,'attr');
        opattrhtml=createAttrHtml(oprsp,'opattr');
        oppattrhtml=createAttrHtml(opprsp,'opattr');
        attrhtml?$('.material_attr').html(attrhtml):$('.attr_wrap').html('');
        attrphtml?$('.material_parent_attr').html(attrphtml):$('.attrp_wrap').html('');
        opattrhtml?$('.op_attr').html(opattrhtml):$('.op_wrap').html('');
        $('.allAttr_wrap').each(function(){
            !$(this).find('.attrWrap').length?$(this).html('暂无数据'):null;
        });
    }).fail(function(unitrsp,dataTypersp){
        console.log('获取物料属性失败');
    });
}

//生成select框数据
function selectHtml(data,flag,selectId){
    var elSelect,innerhtml,selectVal='无',parent_id='',lis='';
    itemSelect=[];
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item){
            item.id==selectId?itemSelect.push(item):null;
        });
    }
    itemSelect.length?(flag=='unit'?(selectVal=itemSelect[0].unit_text,parent_id=itemSelect[0].id):(selectVal=itemSelect[0].name,parent_id=itemSelect[0].id)):
        (selectVal='无',parent_id='');      
    elSelect=`<div class="el-select">
            <input type="text" readonly="readonly" class="el-input" value="${selectVal}">
            <input type="hidden" class="val_id" id="${flag=='parent'?'parent_id':flag=='unit'?'unit_id':'material_type_id'}" value="${parent_id}">
        </div>`;
    itemSelect=[];
    return elSelect;
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
                    <span class="attr-val">${data.unit_text?data.unit_text:'无'}</span>
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

function bindEvent(){
    $('body').on('click','.attr_def',function(){
        getMaterielAttribute($(this).attr('data-id'));
    });
}