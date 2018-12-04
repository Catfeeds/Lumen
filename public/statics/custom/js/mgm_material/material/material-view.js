var layerLoading,
picData=[],
attrData={},
creator_token='',
templateid='',
material_id='';
var ziduan={
    'addMBasic_from':['item_no','unit_name','name','label','batch_no_prefix','item_no','moq','weight','description','mpq','length','width','height'],
    'addMPlan_from':['fixed_advanced_period','cumulative_lead_time','safety_stock','max_stock','min_stock']
};
$(function(){
    // creator_token=getCookie("session_emi2c_mlily_demo");
    $('.el-tap-wrap').addClass('edit');
    $('.el-button.next').addClass('edit');
    $('#showLog').removeClass('none');
    bindEvent();
    material_id=getQueryString('id');
    if(material_id!=undefined){
        getCategory(material_id);//分类
    }else{
        layer.msg('url链接缺少id参数，请给到id参数', {icon: 5
            ,offset: '250px'});
    }   
    $('.el-form-item.source .divwrap').html(createSource(meterielSource,1,'source'));
});

//获取物料信息
function getMaterial(id){
    AjaxClient.get({
        url: URLS['material'].show+"?"+_token+"&material_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                setData(rsp.results);
            }else{
                layer.msg('获取物料信息失败', {icon: 5,offset: '250px'});
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取物料信息失败', {icon: 5,offset: '250px'});
        }
    },this);
}
//获取物料详细信息
// function getMaterial(id){
//     var dtd=$.Deferred();
//     AjaxClient.get({
//         url: URLS['material'].show+"?"+_token+"&material_id="+id,
//         dataType: 'json',
//         beforeSend: function(){
//             layerLoading = LayerConfig('load');
//         },
//         success: function(rsp){
//             layer.close(layerLoading);
//             if(rsp&&rsp.results){
//                 setData(rsp.results);
//             }else{
//                 console.log('获取物料信息失败');
//             }
//             dtd.resolve(rsp);
//         },
//         fail: function(rsp){
//             layer.close(layerLoading);
//             console.log('获取物料信息失败');
//             dtd.reject(rsp);
//         }
//     },this);
//     return dtd;
// }
// 获得分类
function getCategory(id){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['category'].selectList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                categoryData=rsp.results;
                // $('.el-form-item.category').find('.el-select-dropdown').html(categorylis);
                var catehtml=treeList(rsp.results,rsp.results[0].parent_id);
                $('.categoryTree').find('.bom-tree').html(catehtml);
                getMaterial(id);
            }else{
                $('.el-form-item.category .errorMessage').html('暂无物料分类，请先完善');
            }
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('.el-form-item.category .errorMessage').html('获取物料分类失败，请重试');
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
//获取图纸详情
function getPicDetail(id,group){
    AjaxClient.get({
        url: URLS['material'].picShow+"?"+_token+"&drawing_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                createPicDetail(rsp.results,group);
                $('#addMPic_from .picCon').hide();
            }else{
                console.log('获取图纸详情失败');
            } 
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸详情失败');
        }
    },this);
}
//填充数据
function setData(data){
    var basicForm=$('#addMBasic_from');
    for(var type in ziduan){
        var form=$('#'+type);
        ziduan[type].forEach(function(item){
            form.find('#'+item).val(data[item]);
        });
    }
    data.material_category_id!=''?basicForm.find('.item-name[data-post-id='+data.material_category_id+']').addClass('selected'):null;
    var attrForm=$('#addMAttr_from'),attrhtml='';
    data.template_name!=''?attrForm.find('#template_name').val(data.template_name):null;
    attrData={
        material_attributes: data.material_attributes||[],
        operation_attributes: data.operation_attributes||[]
    };
    if(data.material_attributes.length){
        $('#addMAttr_from .mattr-container').removeClass('none').find('.mattr-con-detail').html(createAttrHtml(attrData,'self','attr'));
    }
    if(data.operation_attributes.length){
        $('#addMAttr_from .mgattr-container').removeClass('none').find('.mattr-con-detail').html(createAttrHtml(attrData,'self','opattr'));
    }
    var addMPlan_from=$('#addMPlan_from');
    addMPlan_from.find('.el-form-item.source .el-select-dropdown-item[data-id='+data.source+']').click();
    if(data.source==1){
        data.is_provider==1?$('.el-form-item.othersource .el-checkbox_input.other-check').addClass('is-checked'):$('.el-form-item.othersource .el-checkbox_input.other-check').removeClass('is-checked');
        
    }else{
        $('.el-form-item.othersource').hide();
    }
    var showStoragePlace_form = $('#showStoragePlace');
    if(data.storage_place&&data.storage_place.length){
        showStoragePlace_form.html(createHtml(data.storage_place));
    }
    addMPlan_from.find('#low_level_code').val(data.low_level_code);
    $('.el-form-item.source .divwrap').html(createSource(meterielSource,data.source,'source'));
    var addMPic_from=$('#addMPic_from');
    if(data.drawings&&data.drawings.length){
        picData=data.drawings;
        addMPic_from.find('.picList ul').html(createPicHtml());
    }
    $('#addMFujian_from').find('.fujian').html(createTable(data.attachments));
    setTimeout(function(){
        $('.el-input,.el-textarea,.textarea-comment').attr('readonly','readonly');
    },100);
}
//生成仓储地列表数据
function createHtml(data){
    console.log(data);
    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){

            trs+= `
			<tr>
			
			<td>${tansferNull(item.name)}</td>
			<td>${tansferNull(item.LGFSB)}</td>
			<td>${tansferNull(item.LGPRO)}</td>
		
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable" >
                <thead>
                    <tr>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">采购仓储</th>
                        <th class="left nowrap tight">生产仓储</th>
                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;
}
//扩展物料结构树
function treeList(data,pid) {
    var bomTree = '';
    var children = getChildById(data, pid);
    children.forEach(function (item,index) {
          var hasChild = hasChilds(data, item.id);
          if(hasChild){
              bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name"><p class="item-name" data-post-id="${item.id}">${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id)}
                   </div>
                </div> `;
          }else{
              bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name" data-post-id="${item.id}">${item.name}</p></div></div>  
                </div>`;
          }
      });
    return bomTree;
}
function createSource(data,val){
    var sItem=[];
    data&&data.length&&data.forEach(function(item){
        var selected='';
        if(val&&val==item.id){
            selected='selected';
            sItem.push(item);
        }
    });
    var uname='--无--';
    if(sItem.length){
        uname=sItem[0].name;
    }
    var eleSource=`
        <input type="text" readonly="readonly" class="el-input" value="${uname}">`;
    return eleSource;
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
            var inputhtml='',divitem='',unithtml='';
            inputhtml=`<input type="text" class="el-input attr-val mattr-val" placeholder="" value="${attritem.value||''}">`;
            unithtml=attritem.unit!==null&&attritem.unit!==''&&attritem.unit!==undefined?`<span class="unit">[${attritem.unit}]</span>`:'<span class="unit"></span>';
            if(attritem.datatype_id==2){
                inputhtml=createOption(attritem.range,type,attritem.value);
            }
            divitem=`<div class="el-form-item" data-id="${attritem.attribute_definition_id}" datatype_id="${attritem.datatype_id}" data-template-id="${attritem.template_id==undefined?'':attritem.template_id}" data-attr-id="${attritem.attribute_definition_id}">
                <div class="el-form-item-div">
                    <label class="el-form-item-label"
                     data-key="${attritem.key}"><span>${attritem.name}</span><span>(${attritem.key})</span></label>
                    ${inputhtml}
                    ${unithtml}
                </div>
            </div>`;
            divitems.push(divitem);
        });
        divwrap=`<div class="querywrap ${flag=='self'?'own':''}" data-template_id="${item.template_id==undefined?'':item.template_id}">
                <h4>${item.template_name==undefined?'':item.template_name}</h4> 
                <div class="queryCon">
                    <ul class="query-item">
                        <li>${divitems.join('')}</li>
                    </ul>
                </div>
            </div>`;
    }
    return divwrap;
}
//生成物料继承属性列表
function createParentAttr(data,flag,name){
    var divs=[],divwrap='',lis='';
    data.forEach(function(item,index){
        var inputhtml=`<input type="text" readonly="readonly" class="el-input attr-val" placeholder="" value="${item.value}">`,
            unithtml=item.unit!==null&&item.unit!==''&&item.unit!==undefined?`<span class="unit">[${item.unit}]</span>`:'<span class="unit"></span>',
            edithtml='';
        if(item.datatype_id==2){
            inputhtml=createOption(item.range,'pic',item.value);
        }
        var div=`<div class="el-form-item" datatype_id="${item.datatype_id}">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">${item.name}</label>
                    ${inputhtml}
                    ${unithtml}
                </div>
            </div>`;
        divs.push(div);
    });
    divwrap=`<div class="querywrap">
            <h4>${name}</h4> 
            <div class="queryCon">
                <ul class="query-item">
                    <li>${divs.join('')}</li>
                </ul>
            </div>
        </div>`;
    return divwrap;
}
//生成属性下拉框数据
function createOption(data,flag,value){
    var opdata=JSON.parse(data);
    var innerhtml,selectVal='';
    if(opdata.options&&opdata.options.length){
        opdata.options.forEach(function(item){
            if(item.index==value){
                selectVal=item.label;
            }
        });
    }
    innerhtml=`<div class="el-select-dropdown-wrap">
        <div class="el-select">
            <input type="text" readonly="readonly" class="el-input readonly" value="${selectVal!=undefined&&selectVal!=''?selectVal:'--无--'}">
        </div>
        </div>`;
    selectVal='';
    return innerhtml;
}              
//生成图纸列表
function createPicHtml(){
    var lis=[];
    if(picData.length){
        picData.forEach(function(item){
            var imgurl=item.image_path.split('.');
            var li=`<li class="pic-li" data-id="${item.drawing_id}" data-src="${window.storage}${item.image_path}"><div class="el-card">
                    <div class="el-card-body">
                    <img data-src="${window.storage}${item.image_path}" class="pic-img pic-list-img" src="${window.storage}${imgurl[0]}370x170.jpg" alt="">
                    </div>
                    <div class="el-card-info">
                        <span>${item.name}</span>
                        <div class="comment"><textarea class="textarea-comment" rows="2" maxlength="50" placeholder="">${item.comment!=undefined?item.comment:''}</textarea></div>
                    </div>
                </div></li>`;
            lis.push(li);
        });
    }
    return lis.join('');
}
//生成图纸关联图列表
function createPicLinkHtml(data){
    var trs=[];
    data.forEach(function(item){
        var tr=`<tr class="tritem" data-id="${item.drawing_id}">
                <td>${item.code}</td>
                <td>${item.attribute_name}</td>
                <td>${item.length==null?'':item.length}</td>
                <td>${item.length2==null?'':item.length2}</td>
                <td>${item.width==null?'':item.width}</td>
                <td>${item.width2==null?'':item.width2}</td>
                <td>${item.height==null?'':item.height}</td> 
                <td>${item.height2==null?'':item.height2}</td>
                <td><img data-src="/${item.image_path}${item.image_name}.jpg" class="pic-img" width="80" height="40" src="/${item.image_path}${item.image_name}.jpg80x40.jpg"/></td>              
                <td class="right">
                    <a target="_blank" class="link_button" href="${picviewUrl}.${item.drawing_id}">查看</a></td>
            </tr>`;
        trs.push(tr);
    });
    var table=`<div class="querywrap">
        <h4>关联图</h4>
        <table class="sticky uniquetable commontable">  
        <thead>
            <tr>
                <th>编码</th>
                <th>名称</th>
                <th>长</th>
                <th>长2</th>
                <th>宽</th>
                <th>宽2</th>
                <th>高</th>
                <th>高2</th>
                <th>缩略图</th>
                <th class="right"></th>
            </tr>
        </thead>
        <tbody>${trs.join('')}</tbody>
    </table></div>`;
    return table;
}
//生成附件列表
function createPicFujian(data){
    var fujians=[];
    data.forEach(function(item){
        var fujianitem=`<li><div class="el-card fujian" data-id="${item.attachment_id}" data-path="/storage/${item.path}">
                <div class="info">
                    <span>${item.filename}</span>
                    <p class="des" title="${item.comment}">${item.comment!=''?'注释:':''}${item.comment}</p>
                    <div>
                        <a download="${item.filename}" href="/storage/${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a>
                    </div>
                </div>
            </div><p class="errorMessage" style="width: 100%;word-break: break-all;"></p></li>`;
        fujians.push(fujianitem);
    });
    var fujianhtml=`<div class="querywrap">
                        <h4>附件</h4>
                        <div class="ulwrap">
                            <ul>
                                ${fujians.join('')}
                            </ul>
                        </div>
                </div>`;
    return fujianhtml;
}
//生成图纸详情
function createPicDetail(data,picgroup){
    var parentEle=$('#addMPic_from .picDetail');
    var base=data.base,
    attribute=data.attribute,
    attachment=data.attachment,
    combination=data.combination,
    src=`/${base.image_path}${base.image_name}.jpg370x170.jpg`;
    parentEle.find('#code').val(base.code);
    parentEle.find('#imgShow').attr('src',src);
    parentEle.find('#name').val(base.name);
    parentEle.find('#description').val(base.description);
    parentEle.find('#group').val(picgroup);
    parentEle.find('#length').val(base.length);
    parentEle.find('#length2').val(base.length2);
    parentEle.find('#width').val(base.width);
    parentEle.find('#width2').val(base.width2);
    parentEle.find('#height').val(base.height);
    parentEle.find('#height2').val(base.height2);
    if(attribute&&attribute.length){
        parentEle.find('.picAttr').html(createParentAttr(attribute,'picattr','属性'));
    }
    if(attachment&&attachment.length){
        parentEle.find('.fujian').html(createPicFujian(attachment));
    }
    if(combination&&combination.length){
        parentEle.find('.linkPic').html(createPicLinkHtml(combination));
    }
    $('#addMPic_from .picDetail').show();
}
//生成附件表格
function createTable(data){
    var table='',trs=[];
    if(data.length){
        data.forEach(function(item,index){
            var tr=`
                <tr class="tritem" data-id="${item.attachment_id}">
                    <td style="font-size: 50px;"><i class="el-icon el-input-icon el-icon-file"></i></td>
                    <td><p class="overflow" style="cursor: default;max-width: 150px;" title="${item.filename}">${item.filename}</p></td>
                    <td><p>${item.creator_name}</p></td>
                    <td><p>${item.ctime}</p></td>
                    <td style="width: 300px;"><textarea rows="2" readonly="readonly" class="fujiantext">${item.comment}</textarea></td>
                    <td class="right" style="padding-right: 25px;">
                        <a download="${item.filename}" href="/storage/${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a>
                    </td> 
                </tr>`;
            trs.push(tr);
        });  
    }else{
        var tr=`<tr><td colspan="6" style="text-align: center;">暂无数据</td></tr>`;
        trs.push(tr);
    }
    table=`
        <table class="sticky uniquetable commontable">  
            <thead>
                <tr>
                    <th>图标</th>
                    <th>名称</th>
                    <th>创建人</th>
                    <th>创建时间</th>
                    <th>注释</th>
                    <th class="right">操作</th>
                </tr>
            </thead>
            <tbody>${trs.join('')}</tbody>
        </table>`;
    return table;
} 
//tab点击发异步
function tabClick(panel){
    $(window).scrollTop(0);
}

function bindEvent(){
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
    //tap切换按钮
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){    
        var form=$(this).attr('data-item');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
            tabClick(form);
        }
    });
    //图纸放大
    $('body').on('click','.pic-img',function(){
        var imgList,current;
        if($(this).hasClass('pic-list-img')){
            imgList=$(this).parents('ul').find('.pic-li');
            current=$(this).parents('.pic-li').attr('data-id');
        }else{
            imgList=$(this);
            current=$(this).attr('data-id');    
        }
        showBigImg(imgList,current); 
    });
    //查看图纸详细信息
    $('body').on('click','.pic-li .el-icon-info',function(){
        getPicDetail($(this).attr('data-id'),$(this).attr('data-group'));
    });
    //返回图纸列表
    $('body').on('click','.back-pic',function(){
        $('.picDetail').hide().siblings('.picCon').show();
    });
}

    