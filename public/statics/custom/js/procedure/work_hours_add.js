var bom_id,routing_id,routing_node_id,layerLoading,layerModal,hour_count=0,bom_description,total=0,once_show,isVersionOn='',
version_num=getQueryString('version'),unit;

$(function () {
    var url=window.location.pathname.split('/');
    if(url.indexOf('addWorkHour')>-1){
        bom_id=getQueryString('id');

        bom_id!=undefined?getBomInfo(bom_id):LayerConfig('fail','url链接缺少id参数，请给到id参数');
    }
    $('.man_hours_info').css('display','none');
    bindEvent();
});
function getBomInfo(id) {
    AjaxClient.get({
        url: URLS['workhour'].hourBomShow+"?"+_token+'&bom_id='+id+'&need_find_level=true',
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                isVersionOn = rsp.results.is_version_on;
                unit = rsp.results.commercial;
                var bom_description = `产品规格：<span>${tansferNull(rsp.results.description)!=''?tansferNull(rsp.results.description):'暂无信息'}</span>`;
                var item_no = `物料清单编码：<span>${tansferNull(rsp.results.item_no)!=''?tansferNull(rsp.results.item_no):''}</span>`;
                var factory = `当前工厂：<span>暂无信息</span>`;
                if(version_num!=undefined||version_num!=null){
                    var version_description = `当前版本：<span>${tansferNull(version_num)!=''?tansferNull(version_num)+'.0':''}</span>`;
                }else{
                    var version_description = `当前版本：<span>${tansferNull(rsp.results.version)!=''?tansferNull(rsp.results.version.toFixed(1)):''}</span>`;
                }
                // 加载设计bom版本
                getDesignBom(rsp.results.material_id,rsp.results.version,rsp.results.bom_no);
                $('.bom_wrap .bom-description').html(bom_description);
                $('.bom_wrap .material-code').html(item_no);
                $('.bom_wrap .version-now').html(version_description);
                $('.bom_wrap .factory_code').html(factory);
                createRealBom(rsp.results.bom_tree,function(bomHtml){
                    $('.bom-fake-tree .bom-tree').html(bomHtml);
                    setTimeout(function(){
                        $('.top-item.item-name.allBOM').addClass('selected');
                        getBomRoute(id);
                    },20);
                },'allBOM');
            }
        },
        fail: function(rsp){
            console.log('获取物料清单相关信息失败');
        }
    },this);
}
function createRealBom(treeData,fn,flag){
    var bomHtml='';
    if(treeData.children&&treeData.children.length){
        var bomitemHtml=treeList(treeData,0,flag,treeData.usage_number, treeData.commercial);
        bomHtml=`<div class="tree-folder" data-id="${treeData.material_id}">
                 <div class="tree-folder-header">
                 <div class="flex-item">
                 <i class="icon-minus expand-icon"></i>
                 <div class="tree-folder-name"><p class="bom-tree-item top-item item-name ${flag}" data-no="${treeData.item_no}" data-bom-id="${treeData.children[0].bom_id}" data-pid="0" data-post-id="${treeData.material_id}">${treeData.name} &nbsp;${flag == 'allBOM' ? `(${treeData.usage_number} ${treeData.commercial} : ${treeData.usage_number} ${treeData.commercial})` : ''}</p></div></div></div>
                 <div class="tree-folder-content">
                   ${bomitemHtml}
                 </div>
              </div> `;
    }else{
        bomHtml=`<div class="tree-item" data-id="${treeData.material_id}">
              <div class="flex-item">
              <i class="item-dot expand-icon"></i>
              <div class="tree-item-name"><p class="bom-tree-item top-item item-name ${flag}" data-no="${treeData.item_no}" data-pid="0" data-post-id="${treeData.material_id}">${treeData.name}</p></div></div>  
            </div>`;
    }
    fn&&typeof fn=='function'?fn(bomHtml):null;
}
//扩展物料结构树
function treeList(data, pid, flag, num, commercial) {
    var bomTree = '';
    if (flag == 'allBOM') {
        data.children.forEach(function (item) {
            var replaceStr = '', replaceCss = '', assemblyStr = '';
            if (item.replaces != undefined && item.replaces.length) {
                replaceStr = '<span>替</span>';
                replaceCss = 'replace-item';
            }

            if (item.children && item.children.length && item.is_assembly) {
                var content;
                if (item.has_route > 0) {
                    content='*';
                }else{
                    content='';
                }
                bomTree += `<div class="tree-folder" data-id="${item.material_id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name">
                   <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}" 
                   data-bom-id="${item.children[0].bom_id || ''}" 
                   data-pid="${item.ppid || 0}" 
                   data-post-id="${item.material_id}">${replaceStr}${item.name}
                   &nbsp;&nbsp; ${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" } </p>
                  <span class="replace">${content}</span>
                   </div></div></div>
                   <div class="tree-folder-content"> 
                     ${treeList(item, 0, flag, num, commercial)}
                   </div>
                </div> `;
            } else {

                var assbomid = '';
                if (item.is_assembly == 0 && item.children && item.children.length) {
                    assemblyStr = '<span class="bom-flag" style="margin-left:3px;">BOM</span>';
                    assbomid = item.children[0].bom_id;
                }
                bomTree += `<div class="tree-item" data-id="${item.material_id}">
                <div class="flex-item">
                <i class="item-dot expand-icon"></i>
                <div class="tree-item-name">
                <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}" data-bom-id="${assbomid}" data-pid="${item.ppid || 0}" data-post-id="${item.material_id}">${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}${assemblyStr} </p>
                </div>
                </div>  
                </div>`;
            }
        });
    } else {
        var children = getChildById(data, pid);
        children.forEach(function (item, index) {
            var hasChild = hasChilds(data, item.id);
            if (hasChild) {
                bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name">
                   <p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}">${item.name}</p>
                   </div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id, flag)}
                   </div>
                </div> `;
            } else {
                bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}">${item.name}</p></div></div>  
                </div>`;
            }
        });
    }
    return bomTree;
}

//获取bom工艺路线
function getBomRoute(bom_id) {
    var bid=$('.bom-tree-item.allBOM.selected').attr('data-bom-id');
    AjaxClient.get({
        url: URLS['workhour'].bomRouting + '?' +_token+'&bom_id='+bom_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            //工艺路线
            var span='';
            if(rsp&&rsp.results&&rsp.results.length){
                rsp.results.forEach(function (rlitem) {
                    span+=`<span data-route-id="${rlitem.routing_id}" data-name="${rlitem.name}" data-factory="${rlitem.factory_name}" class="el-tag route-tag">${rlitem.name}</span>
                            <span class="el-checkbox_input" data-route-id="${rlitem.routing_id}" style="top:5px;left: 5px;">
                                <span class="el-checkbox-outset" data-is_default="${rlitem.is_default}"></span>
                            </span>
                            <div class="sync-SAP-btn" style="padding: 0px;margin-right:25px;position:relative;left:-4px;display: ${isVersionOn == 1?'inline-block':'none'}">
                                <button type="button" style="padding:0px;" class="el-button el-button--primary sync-SAP" data-routing-id="${rlitem.routing_id}" data-factoryId="${rlitem.factory_id}">同步SAP</button>
                            </div>`;
                });

                $('.bom_wrap .route-lists').html(span);
                setTimeout(function () {
                    if(rsp.results.length == 1){
                        $('.bom_wrap .route-lists').find('.route-tag').eq(0).click();
                        $('.bom_wrap .route-lists').find('.route-tag').eq(0).next().children().click();
                    }else{
                        if($('.route-lists .el-tag[data-status = 1]').length){
                            $('.route-lists .el-tag[data-status = 1]').click();
                        }else{
                            $('.bom_wrap .route-lists').find('.route-tag').eq(0).click();
                        }

                        $('.bom_wrap .route-lists .el-checkbox-outset[data-is_default = 1]').click();
                    }
                }, 20);
                setTimeout(function () {
                    $('.bom_wrap .route-lists').find('.route-tag').eq(0).click();
                    $('.el-tap-wrap').addClass('edit');
                },50);
            }else{
                var con= `<div class="no_data_center">暂无数据</div>`;
                $('.work_hours_wrap .bom_wrap .route-lists').html('');
                $('.work_hours_wrap .bom_wrap .el-tap-wrap').html('');
                $('.work_hours_wrap .bom_wrap .el-panel').html(con);
                $('.total_num').css('display','none');
                $('#all_work_hour').css('display','none');
                $('#show_base_num').css('display','none');
                $('#addBaseQty').css('display','none');
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            console.log('获取bom工艺路线集合失败');
        }
    },this);
}
//获取工艺路线信息
function getRouteInfo(id) {
    AjaxClient.get({
        url: URLS['workhour'].procedureDisplay + '?' +_token+'&id='+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.operations){
                var data = rsp.results.operations;
                if(data!=null){
                    var taps='';
                    data.forEach(function (nitem) {
                        if(nitem.operation!='null'&&nitem.order!=1){
                            taps+=`<span data-opid="${nitem.operation_id}" data-excrete="${nitem.is_excrete}" data-item="${nitem.oid}" class="el-tap">${nitem.name}</span>`;
                        }
                    });
                    $('.bom_procedure .el-tap-wrap').html(taps);
                    if($('.el-tap-wrap .el-tap').length){
                        $('.el-tap-wrap .el-tap').eq(0).click();
                    }
                }

            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            console.log('获取工艺路线详情失败');
        }
    },this);
}
//获取工艺路线工序节点详细信息
function getRouteDetail(rnid,bomid) {
    var bid=$('.bom-tree-item.allBOM.selected').attr('data-bom-id'),
        rid=$('.route-tag.selected').attr('data-route-id');
    AjaxClient.get({
        url: URLS['workhour'].routeDetail+"?"+_token+"&bom_id="+bomid+"&routing_id="+rid+"&routing_node_id="+rnid,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            hour_count=0;
            total=0;
            if(rsp&&rsp.results&&rsp.results.length){
                var material_no=$('.bom-tree-item.top-item.item-name').attr('data-no'),
                    route_id=$('.route-tag.selected').attr('data-route-id');
                createPreview(rsp.results,material_no,route_id);
                $('.total_num').css("display","none");
                $('#all_work_hour').css('display','block');
            }else{
                //暂无数据
                var con= `<div class="no_data_center">暂无数据</div>`;
                $('.bom_procedure .el-panel').html(con);
                $('.total_num').css('display','none');
                $('#all_work_hour').css('display','none');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取工序预览失败');
        }
    },this);
}
//工艺路线节点详细信息
function createPreview(data,material_no,route_id) {
    var stepBlocks='',in_flag='';
    data.forEach(function (item) {
        var stepItems='';
        if(item.step_info&&item.step_info.length){
            item.step_info.forEach(function (sitem,sindex) {

                var  s_draw=[],s_material_in='',s_material_out='';
                if(sitem.step_drawings&&sitem.step_drawings.length){
                    sitem.step_drawings.forEach(function (sditem) {
                        s_draw.push(sditem.image_name)
                    })
                }
                if(sitem.material&&sitem.material.length){
                    var material_in=getFilterPreviewData(sitem.material,1),
                        material_out=getFilterPreviewData(sitem.material,2);
                    if(material_in.length){
                        s_material_in=cpreviewAttr(material_in,'in');
                    }else{
                        s_material_in=`<span class="no_material">无</span>`;
                    }
                    if(material_out.length){
                        s_material_out=cpreviewAttr(material_out,'out');
                    }else {
                        s_material_out = `<span class="no_material">无</span>`;
                    }
                }else{
                    s_material_out=s_material_in=`<span class="no_material">无</span>`;
                }

                if(sitem.abilitys_ids.length){
                    getAbilityHour(sitem.operation_id,sitem.id,sitem.abilitys_ids,sitem.bom_id,function (rsp,s_id) {
                        if(rsp&&rsp.length){
                            hour_count=0;
                            rsp.forEach(function (h_item) {
                                if(h_item.flag==1){
                                    var man_all_hour =  Number(h_item.work_hours) +Number(h_item.man_hours) +Number(h_item.once_clip_time);
                                    var hour_set=`<div class="ability_show_wrap">
                                                 <div class="ability_name"><span>${h_item.ability_name}</span></div>
                                                 <div class="ability_list">
                                                      <ul>
                                                            <li>最小值[${unit}]：<span>${h_item.min_value!=undefined? h_item.min_value:''}</span></li>
                                                            <li>最大值[${unit}]：<span>${h_item.max_value!=undefined? h_item.max_value:''}</span></li>
                                                            <li>工时[s]：<span class="hours">${man_all_hour}</span></li>
                                                            <li>首样工时[s]：<span>${h_item.sample_hours}</span></li>
                                                      </ul>
                                                 </div>
                                           </div>`;
                                    hour_count += Number(h_item.work_hours);
                                    if(Number(h_item.work_hours)>0){
                                        total +=Number(h_item.work_hours);
                                    }else if(Number(h_item.man_hours)>0) {
                                        total +=Number(h_item.man_hours);
                                    }else {
                                        total +=Number(h_item.once_clip_time);
                                    }
                                    $('.route_preview_container tr[data-id='+s_id+']').find('.hour_set').append(hour_set);
                                }
                            })
                        }
                        $('.total_num').text("");
                        $('.total_num').append("总的工时："+total.toFixed(4)+'[s]');
                    });

                }
                if (hour_count==0){
                    $('.total_num').text("");
                    $('.total_num').append("总的工时："+total.toFixed(4)+'[s]');
                }
                var jgNengli = '';
                if (sitem.abilitys&&sitem.abilitys.length){
                    sitem.abilitys.forEach(function (jgitem) {
                        jgNengli += `<p>${jgitem.ability_name}</p>`;
                    });
                }
                else{
                    jgNengli = '';
                }
                var workcenter = '' ;
                sitem.workcenters.forEach(function (item) {
                    workcenter +=`<div class="ability_show_wrap">
                                                 <div class="ability_name"><span>${item.name}</span></div>
                                                 
                                           </div>`;
                });
                stepItems+=`<tr data-id="${sitem.id}">
                   <td>${sindex+1>9? sindex+1: `0${sindex+1}`}</td>
                   <td>
                        <P>${sitem.name}</P>
                        <p>（${sitem.code}）</p>
                        <p>${sitem.field_description}</p>
                   </td>
                   <td>${jgNengli}</td>
                   <td>${workcenter}</td>
                   <td><button type="button" class="button edit_work_hour" 
                   data-workcenter="${sitem.workcenters.length?sitem.workcenters[0].workcenter_id:0}"
                       data-abId="${sitem.abilitys_ids.join(',')}" 
                       data-materialNo="${material_no}" 
                       data-routeId="${route_id}"
                       data-bomId="${sitem.bom_id}">维护工时</button>
                   </td>
                   <td class="hour_set"></td>
                   <!--<td class="hour_count"></td>-->
                   <td class="pre_material ma_in">${s_material_in}</td>
                   <td class="pre_material ma_out">${s_material_out}</td>
                   <!--<td class="pre_bgcolor imgs">${s_draw.join(',')}</td>-->
                   <td class="pre_bgcolor desc">${tansferNull(sitem.description)}</td>
                   <td class="pre_bgcolor desc">${tansferNull(sitem.comment)}</td>
                  
                 </tr>`

            })
        }
        var step_draw='';
        if(item.drawings&&item.drawings.length){
            item.drawings.forEach(function (ditem) {
                step_draw+=`<div class="preview_draw_wrap" data-url="${ditem.image_path}">
                 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" data-imgId="${ditem.drawing_id}" alt="" width="370" height="170"></p>
                 <p>${ditem.step_name}-${ditem.image_name}</p>
                 </div>`;
            })
        }else{
            step_draw='';
        }
        stepBlocks+=`<div class="route_preview_container">
                    <table>
                        <thead>
                          <tr>
                              <th>序号</th>
                              <th>步骤</th>
                              <th>加工能力</th>
                              <th>工作中心</th>
                              <th>工时设置</th>
                              <th>工时信息</th>
                              <!--<th>总工时</th>-->
                              <th>消耗品</th>
                              <th>产成品</th>
                              <!--<th>图纸</th>-->
                              <th>标准工艺</th>
                              <th>特殊工艺</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${stepItems}
                          <tr><td colspan="10"><div class="draw_content clearfix">${step_draw}</div></td></tr>
                        </tbody>
                    </table>
                 </div>
                 `
    });

    if(stepBlocks){
        $('.bom_procedure .el-panel').html(stepBlocks);
    }else{
        $('.bom_procedure .el-panel').html('');
    }
}
// 获取能力工时
function getAbilityHour(operation_id,step_id,abilitys_ids,bom_id,fn) {
    var abilitys = abilitys_ids.join(',');
    AjaxClient.get({
        url: URLS['workhour'].workShowHour+"?"+_token+"&step_info_id="+step_id+"&operation_id="+operation_id+"&abilitys="+abilitys+"&bom_id="+bom_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            fn&&typeof fn=='function'?fn(rsp.results,step_id):null;
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取工时信息失败');
            $('.total_num').text("");
            $('.total_num').append("总的工时："+total.toFixed(4)+'[s]');
        }
    },this);
}
function getFilterPreviewData(dataArr,type) {
    return dataArr.filter(function (e) {
        return e.type == type;
    });
}
function cpreviewAttr(data,flag) {
    var bgColor='',str='';
    if(flag=='in'){
        bgColor='ma_in';
    }else{
        bgColor='ma_out';
    }
    data.forEach(function (mitem) {
        var ma_attr='',ma_attr_container='';
        if(mitem.attributes&&mitem.attributes.length){
            mitem.attributes.forEach(function (aitem) {
                if(aitem.from=='erp'){
                    aitem.commercial="null";
                }
                ma_attr+=`<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.commercial=='null'? '':[aitem.commercial]}</td></tr>`;
            });
            ma_attr_container=`<table>${ma_attr}</table>`;
        }else{
            ma_attr=`<span>暂无数据</span>`;
            ma_attr_container=`<div style="color:#999;margin-top: 20px;">${ma_attr}</div>`;
        }
        str+=`<div class="route_preview_material ${bgColor}">
              <div class="pre_code">${mitem.material_code}(${mitem.material_name})</div>
              <div class="pre_attr">${ma_attr_container}</div>
              <div class="pre_unit"><span>${mitem.use_num}</span><p>${mitem.commercial}</p></div>
          </div>`;
    });
    return str;
}
//获取能力工时
function getHourByMaterialNo(step_id,operation_id,abId,bomId) {
    var abilitys = abId.join(',');
    AjaxClient.get({
        url:URLS['workhour'].workShowHour+'?'+_token+"&step_info_id="+step_id+"&operation_id="+operation_id+"&abilitys="+abilitys+"&bom_id="+bomId,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var arr = filterAbility(rsp.results,abId);
                showHourList($('.inputOperationValue_table .table_tbody'),arr);
            }else{
                var tr=`<tr>
                            <td class="nowrap" colspan="7" style="text-align: center;">暂无数据</td>
                        </tr>`;
                $('.inputOperationValue_table .table_tbody').html(tr)
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
function filterAbility(data,arr) {
    var result = [];
    for(var i=0;i<data.length;i++){
        for(var j=0;j<arr.length;j++){
            if(data[i].ability_id == arr[j]){
                result.push(data[i])
            }
        }
    }
    return result
}
function showHourList(ele,data) {
    once_show=false;
    $('.inputOperationValue_table .th_table_tbody').find('.change').hide();
    var operation_id = $('.el-tap-wrap.edit span.el-tap.active').attr('data-opId');
    var data_arr = [];
    if(operation_id==''){
        data_arr=data;
    }else {
        data.forEach(function (item) {
            if(item.operation_id == operation_id){
                data_arr.push(item);
            }
        });
    }
    if(data_arr.length){
        hour_count = 0;
        total=0;
        data_arr.forEach(function (item) {
            if(item.is_ladder==1){
               once_show=true;
                if(item.hasOwnProperty("max_value")){
                    $('.inputOperationValue_table .th_table_tbody').find('.change').show();
                    var tr=`<tr data-opId="${item.operation_id}" 
                            data-abId="${item.ability_id}" 
                            data-se="${item.setting_id}" 
                            data-sign="${item.is_sign}" 
                            data-signId="${item.sign_id}" 
                            data-val="${item.ability_value}" 
                            data-whId="${item.workhours_id!=undefined?item.workhours_id:''}" >
                <td class="operation_name">${item.operation_name}</td>
                <td class="ability_name">${item.ability_name}</td>
                <td></td>
                <td></td>
                <td></td>
                <td class="man_hours_info" style="display: none"></td>
                <td></td>
                <td><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入单次切割时间" class="once_clip_time deal" value="${item.once_clip_time}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <!--<td><input type="number"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入单次最大切割数量" class="once_clip_qty deal" value="${item.once_clip_qty}" style="line-height:20px;width: 100px;font-size: 10px;"></td>-->
                <td class="is_sign">${item.is_sign==1?"是":"否"}</td>
                <td><i class="fa fa-plus-square oper_icon add editDisabled" style="border:0;pointer-events: none;" title="添加" data-id="${item.id}"></i>
            <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="${item.id}" style="margin-right: 10px;color: #20a0ff"></i></td>
            </tr>`;
                    ele.append(tr)
                }else {

                    var tr=`<tr data-opId="${item.operation_id}" data-abId="${item.ability_id}" data-se="${item.setting_id}" data-sign="${item.is_sign}" data-signId="${item.sign_id}" data-val="${item.ability_value}" data-whId="${item.workhours_id!=undefined?item.workhours_id:''}" >
                <td class="operation_name">${item.operation_name}</td>
                <td class="ability_name">${item.ability_name}</td>
                <td></td>
                <td></td>
                <td></td>
                <td class="man_hours_info"  style="display: none"></td>
                <td></td>
                <td><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入单次切割时间" class="once_clip_time deal" value="${item.once_clip_time}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <!--<td><input type="number"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入单次最大切割数量" class="once_clip_qty deal" value="${item.once_clip_qty}" style="line-height:20px;width: 100px;font-size: 10px;"></td>-->
                <td class="is_sign">${item.is_sign==1?"是":"否"}</td>
                <td><i class="fa fa-plus-square oper_icon add editDisabled" style="border:0;pointer-events: none;" title="添加" data-id="${item.id}"></i>
            <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="${item.id}" style="margin-right: 10px;color: #20a0ff"></i></td>
            </tr>`;
                    ele.append(tr)
                }
            }else {
                if(item.hasOwnProperty("max_value")){
                    $('.inputOperationValue_table .th_table_tbody').find('.change').show();
                    var tr=`<tr data-opId="${item.operation_id}" 
                            data-abId="${item.ability_id}" 
                            data-se="${item.setting_id}" 
                            data-sign="${item.is_sign}" 
                            data-signId="${item.sign_id}" 
                            data-val="${item.ability_value}" 
                            data-whId="${item.workhours_id!=undefined?item.workhours_id:''}" >
                <td class="operation_name">${item.operation_name}</td>
                <td class="ability_name">${item.ability_name}</td>
                <td><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入最小值" class="min-count deal" value="${item.min_value}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <td><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入最大值" class="max-count deal" value="${item.max_value}" style="line-height:20px;width: 100px;font-size: 10px;"></td>              
                <td><input type="number" min="0" data-se="${item.setting_id}" data-sign="${item.is_sign}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-signId="${item.sign_id}" data-val="${item.ability_value}"  placeholder="请输入工时" class="hours-count deal" value="${item.work_hours}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <td class="man_hours_info" style="display: none"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入人工工时" class="man_hours deal" value="${item.man_hours}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <td><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入工时" class="sample-count deal" value="${item.sample_hours}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <td class="once_clip_info" style="display: none"></td>
                <td class="once_clip_info" style="display: none"></td>
                <td class="is_sign">${item.is_sign==1?"是":"否"}</td>
                <td><i class="fa fa-plus-square oper_icon add" title="添加" data-id="${item.id}"></i>
            <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="${item.id}" style="margin-right: 10px;color: #20a0ff"></i></td>
            </tr>`;
                    ele.append(tr)
                }else {

                    var tr=`<tr data-opId="${item.operation_id}" data-abId="${item.ability_id}" data-se="${item.setting_id}" data-sign="${item.is_sign}" data-signId="${item.sign_id}" data-val="${item.ability_value}" data-whId="${item.workhours_id!=undefined?item.workhours_id:''}" >
                <td class="operation_name">${item.operation_name}</td>
                <td class="ability_name">${item.ability_name}</td>
                <td></td>
                <td></td>               
                <td><input type="number" min="0" data-se="${item.setting_id}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-sign="${item.is_sign}" data-signId="${item.sign_id}" data-val="${item.ability_value}"  placeholder="请输入工时" class="hours-count deal" value="${item.work_hours}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <td class="man_hours_info"  style="display: none"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="请输入人工工时" class="man_hours deal" value="${item.man_hours}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <td><input type="number" min="0"  placeholder="请输入工时" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="sample-count deal" value="${item.sample_hours}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                <td class="once_clip_info" style="display: none"></td>
                <td class="once_clip_info" style="display: none"></td>
                <td class="is_sign">${item.is_sign==1?"是":"否"}</td>
                <td><i class="fa fa-plus-square oper_icon add editDisabled" style="border:0;pointer-events: none;" title="添加" data-id="${item.id}"></i>
            <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="${item.id}" style="margin-right: 10px;color: #20a0ff"></i></td>
            </tr>`;
                    ele.append(tr)
                }
            }


        });

    }else{
        var tr=`<tr>
                    <td class="nowrap" colspan="7" style="text-align: center;">暂无匹配数据</td>
                </tr>`;
        $('.inputOperationValue_table .table_tbody').html(tr)
    }
    if(once_show){
        $('.once_clip_info').show();
    }
}
function bindEvent() {
    // 点击总工时的显示和隐藏
    $('body').on('click','#all_work_hour',function (e) {
        if ($('#all_work_hour').html()=='显示总工时'){
            $('.total_num').css('display','block');
            $('#all_work_hour').html('隐藏总工时');
        }
        else{
            $('.total_num').css('display','none');
            $('#all_work_hour').html('显示总工时');
        }
    });
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        if ($(this).hasClass('no')) {
            layer.close(layerConfirm);
        }
    });
    // 在维护工时中点击人工工时的显示和隐藏
    $('body').on('click','.show_manHours',function (e) {
        if ($('.show_manHours').html()=='显示人工工时'){
            $('.man_hours_info').css('display','');
            $('.show_manHours').html('隐藏人工工时');
        }
        else{
            $('.man_hours_info').css('display','none');
            $('.show_manHours').html('显示人工工时');
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
    $('body').on('click','.route-tag',function () {
        if(!$(this).hasClass('selected')){
            $(this).addClass('selected').siblings('.el-tag').removeClass('selected');
            var routeId=$(this).attr('data-route-id');
            var factory=$(this).attr('data-factory');
            if(factory){
                var factoryHtml = `当前工厂：<span>${factory}</span>`;
            }else {
                var factoryHtml = `当前工厂：<span>暂无数据</span>`;
            }
            $('.bom_wrap .factory_code').html(factoryHtml);
            $(this).next().find('.el-checkbox-outset').click();
            routing_id=routeId;
            getRouteInfo(routeId);
        }
    });
    $('body').on('click','.item-name.allBOM',function () {
        if($(this).hasClass('selected')){
            return false;
        }
        var id = $(this).attr('data-bom-id');
        bom_id=id;
        // 判断树型表格点击
        if(bom_id){
            if($(this).hasClass('top-item')){
                $(this).parents('.bom_tree_container').find('.item-name').removeClass('selected');
                $(this).addClass('selected');
                getItemBomInfo(id)
            }else{
                $(this).parents('.bom_tree_container').find('.item-name').removeClass('selected');
                $(this).addClass('selected');
                getItemBomInfo(id);
            }
        }

    })
    $('body').on('click','.el-tap-wrap .el-tap',function(){
        if($(this).hasClass('image')){
            var form=$(this).attr('data-item');
            if(!$(this).hasClass('active')){
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                $('.pic-wrap #'+form).addClass('active').siblings('.el-panel').removeClass('active');
            }
        }else{
            if(!$(this).hasClass('active')){
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var rnid=$(this).attr('data-item');
                var is_excrete=$(this).attr('data-excrete');
                routing_node_id=rnid;
                if ($('#all_work_hour').html()=='隐藏总工时'){
                    $('.total_num').css('display','none');
                    $('#all_work_hour').html('显示总工时');
                }
                getRouteDetail(rnid,bom_id);
                if(is_excrete){

                }
                getBaseQty(is_excrete);
            }
        }
    });
    $('body').on('click','.preview_draw_wrap img',function (e) {
        var img_id = $(this).attr('data-imgId');
        getImgInfo(img_id)
    });
    $('body').on('click','.button.edit_work_hour',function () {
        var material_no = $(this).attr('data-materialNo'),
            route_id = $(this).attr('data-routeId'),
            operation_id=$('.el-tap-wrap.edit').find('.el-tap.active').attr('data-opId'),
            abId = $(this).attr('data-abId'),abID_arr=[],
        abID_arr = abId.split(','),
            step_id=$(this).parents('tr').attr('data-id'),
            bom_id = $(this).attr('data-bomid'),
            workcenter_id = $(this).attr('data-workcenter'),
                route_id = $('#addWBasic_from .route-tag.selected').attr('data-route-id');
            showWorkHourModal(material_no,abID_arr,step_id,operation_id,bom_id,route_id,workcenter_id);
    })
    $('body').on('click','.confirm_work_hour.submit:not(.is-disabled)',function () {
        var arr=[],_len = $('.inputOperationValue_table .table_tbody tr'),obj={};
        var material_no=$(this).parents('#workHoursForm').find('#itemId').val(),
            operation_id=$(this).parents('#workHoursForm').find('#opId').val(),
            step_id=$(this).parents('#workHoursForm').find('#stepId').val(),
            routeId =$(this).parents('#workHoursForm').find('#routeId').val();
        if(_len.length){
            $(_len).each(function (k,v) {
                if($(v).find('.min-count').length){
                    if(!($(v).find('.hours-count').val() === ''&&$(v).find('.man_hours').val() === '')&&$(v).find('.min-count').val() !== ''&&$(v).find('.max-count').val() !== ''){
                        obj={
                            operation_id:$(v).attr('data-opId'),
                            ability_id:$(v).attr('data-abId'),
                            workhours_id:$(v).attr('data-whId')&&$(v).attr('data-whId')!=undefined?$(v).attr('data-whId'):"",
                            work_hours:$(v).find('.hours-count').length?$(v).find('.hours-count').val().trim():'',
                            sample_hours:$(v).find('.sample-count').length?$(v).find('.sample-count').val().trim():'',
                            min_value:$(v).find('.min-count').length?$(v).find('.min-count').val().trim():0,
                            max_value:$(v).find('.max-count').length?$(v).find('.max-count').val().trim():0,
                            man_hours:$(v).find('.man_hours').length?$(v).find('.man_hours').val().trim():0,
                            once_clip_time:$(v).find('.once_clip_time').length?$(v).find('.once_clip_time').val().trim():'',
                            once_clip_qty:$(v).find('.once_clip_qty').length?$(v).find('.once_clip_qty').val().trim():'',

                        };

                        arr.push(obj)
                    }
                }else {

                    if(!($(v).find('.hours-count').val() === '' && $(v).find('.man_hours').val() === '')){
                        obj={
                            operation_id:$(v).attr('data-opId'),
                            ability_id:$(v).attr('data-abId'),
                            workhours_id:$(v).attr('data-whId')&&$(v).attr('data-whId')!=undefined?$(v).attr('data-whId'):"",
                            work_hours:$(v).find('.hours-count').length?$(v).find('.hours-count').val().trim():0,
                            sample_hours:$(v).find('.sample-count').length?$(v).find('.sample-count').val().trim():'',
                            min_value:$(v).find('.min-count').length?$(v).find('.min-count').val().trim():0,
                            max_value:$(v).find('.max-count').length?$(v).find('.max-count').val().trim():0,
                            man_hours:$(v).find('.man_hours').length?$(v).find('.man_hours').val().trim():'',
                            once_clip_time:$(v).find('.once_clip_time').length?$(v).find('.once_clip_time').val().trim():'',
                            once_clip_qty:$(v).find('.once_clip_qty').length?$(v).find('.once_clip_qty').val().trim():'',
                        };
                        arr.push(obj)
                    }
                }
            });
        };
        var workCenter = $('#showWorkCenter .work_center_item');
        var workCenterArr=[];
        workCenter.each(function (k,v) {
            workCenterArr.push({
                id:$(v).attr('data-id')?$(v).attr('data-id'):'',
                standard_item_id:$(v).attr('data-work')?$(v).attr('data-work'):'',
                value:$(v).find('.workValue').val()?$(v).find('.workValue').val():'',
            })
        });
        saveHours({
            material_no: material_no,
            routing_id:routeId,
            step_info_id: step_id,
            bom_id: bom_id,
            data:JSON.stringify(arr),
            stands:JSON.stringify(workCenterArr),
            operation_id:operation_id,
            _token:TOKEN
        });

    })
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('body').on('click','.inputOperationValue_table .add',function () {
        var operation_id = $(this).parents().parents().eq(0).attr('data-opId'),
            ability_id = $(this).parents().parents().eq(0).attr('data-abId'),
            setting_id = $(this).parents().parents().eq(0).attr('data-se'),
            is_sign = $(this).parents().parents().eq(0).attr('data-sign'),
            sign_id = $(this).parents().parents().eq(0).attr('data-signId'),
            ability_value = $(this).parents().parents().eq(0).attr('data-val'),
            // workhours_id = $(this).parents().parents().eq(0).attr('data-whId'),
            operation_name = $(this).parent().parent().find('.operation_name').text(),
            ability_name = $(this).parent().parent().find('.ability_name').text(),
            show_manHours = $('.show_manHours').html(),
            tr = `<tr data-opId="${operation_id}" data-abId="${ability_id}" data-se="${setting_id}" data-sign="${is_sign}" data-signId="${sign_id}" data-val="${ability_value}">
                    <td class="operation_name">${operation_name}</td>
                    <td class="ability_name">${ability_name}</td>
                    <td><input  type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入最小值" class="min-count deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    <td><input  type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="请输入最大值" class="max-count deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    <td><input type="number" min="0" data-se="${setting_id}" data-sign="${is_sign}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-signId="${sign_id}" data-val="${ability_value}"  placeholder="请输入工时" class="hours-count deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    ${show_manHours=='隐藏人工工时'?'<td class="man_hours_info"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,\'\')" placeholder="请输入人工时间" class="man_hours deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>':'<td class="man_hours_info" style="display: none;"><input type="number"  placeholder="请输入人工时间" class="man_hours" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>'}
                    <td><input  type="number" placeholder="请输入工时" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="sample-count deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    ${once_show?`<td></td>
                    <td></td>`:''}
                    <td class="is_sign">${is_sign==1?"是":"否"}</td>
                    <td><i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i></td>
                </tr>`;
        $(this).parents().parents().eq(0).after(tr);
    });
    $('body').on('keyup','.inputOperationValue_table .min-count',function () {
        var nowMinCount = $(this).parent().parent().eq(0).find('input.min-count').val(),
            nowMaxCount = $(this).parent().parent().eq(0).find('input.max-count').val(),
            val = $(this).parent().parent().eq(0).attr('data-val'),
            that = $(this).parent().parent().eq(0),
            minCount,
            maxCount;
        $('.inputOperationValue_table .table_tbody tr').each(function (k,v) {
            if($(v).attr('data-sign')==1){

                var signWorkJour = $(v).find('.hours-count').val().trim();
                    minCount = $(v).find('.min-count').val();
                    maxCount = $(v).find('.max-count').val();
                if(nowMinCount==minCount && nowMaxCount==maxCount){
                    that.find('.hours-count').val(((signWorkJour*10000)*(val*10000))/100000000);
                }
            }
        })

    });
    $('body').on('keyup','.inputOperationValue_table .max-count',function () {
        var nowMinCount = $(this).parent().parent().eq(0).find('input.min-count').val(),
            nowMaxCount = $(this).parent().parent().eq(0).find('input.max-count').val(),
            val = $(this).parent().parent().eq(0).attr('data-val'),
            that = $(this).parent().parent().eq(0),
            minCount,
            maxCount;
        $('.inputOperationValue_table .table_tbody tr').each(function (k,v) {
            if($(v).attr('data-sign')==1){

                var signWorkJour = $(v).find('.hours-count').val().trim();
                minCount = $(v).find('.min-count').val();
                maxCount = $(v).find('.max-count').val();
                if(nowMinCount==minCount && nowMaxCount==maxCount){
                    that.find('.hours-count').val(((signWorkJour*10000)*(val*10000))/100000000);
                }
            }
        })

    });
    $('body').on('keyup','.inputOperationValue_table .hours-count',function () {
        var nowMinCount = $(this).parent().parent().eq(0).find('input.min-count').val(),
            nowMaxCount = $(this).parent().parent().eq(0).find('input.max-count').val();

        if($(this).attr('data-sign')==1){
            var signWorkJour = $(this).val();
            $('.inputOperationValue_table .hours-count').each(function (k,v) {
                if($(v).attr('data-sign')==0){
                    var minCount = $(v).parent().parent().eq(0).find('input.min-count').val(),
                        maxCount = $(v).parent().parent().eq(0).find('input.max-count').val();
                    if(nowMinCount==minCount && nowMaxCount==maxCount){
                        $(v).val(((signWorkJour*10000)*(($(v).attr('data-val'))*10000))/100000000)
                    }
                }
            })
        }

    });

    $('body').on('click','.inputOperationValue_table .delete',function () {
        if($(this).parent().parent().parent().find('tr').length>1){
            $(this).parents().parents().eq(0).remove();
        }
    });
    //图纸放大
    $('body').on('click','.el-icon.fa-search-plus',function(e){
        e.stopPropagation();
        e.preventDefault();
        var obj=$(this).parent().siblings('.pic-detail-wrap').find('img');
        zoomPic(1,obj);
    });

    //图纸缩小
    $('body').on('click','.el-icon.fa-search-minus',function(e){
        e.stopPropagation();
        e.preventDefault();
        var obj=$(this).parent().siblings('.pic-detail-wrap').find('img');
        zoomPic(-1,obj);
    });

    //图纸旋转
    $('body').on('click','.el-icon.fa-rotate-right',function(e){
        e.stopPropagation();
        e.preventDefault();
        var obj=$(this).parent().siblings('.pic-detail-wrap').find('img');
        rotatePic(obj);
    });

    //同步SAP
    $('body').on('click','.sync-SAP:not(".is-disabled")',function(){
        $(this).addClass('is-disabled');
        var bom_id = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id'),routing_id = $(this).attr('data-routing-id'),factory_id = $(this).attr('data-factoryId');
        AjaxClient.get({
            url: URLS['workhour'].syncSAP+ "?" + _token + '&bom_id=' + bom_id + '&routing_id='+routing_id+ '&factory_id='+factory_id,
            dataType: 'json',
            success: function (rsp) {
                var msg = '同步成功!';
                layer.open({
                    title:'同步成功',
                    content:msg
                });
                $(this).removeClass('is-disabled');
            },
            fail: function (rsp) {
                var msg = rsp.message;
                layer.open({
                    title:'同步失败',
                    content:msg
                });
                $(this).removeClass('is-disabled');
            },
            complete: function (rsp) {
                $(this).removeClass('is-disabled');
            }
        }, this);
    });
    //勾选默认工艺路线
    $('body').on('click','.route-lists .el-checkbox_input .el-checkbox-outset',function(){
        $(this).parents().find('.route-lists').children('.el-checkbox_input').removeClass('is-checked');
        $(this).parents().find('.route-lists').children('.route-tag').attr('data-status',0);
        $(this).parent().addClass('is-checked');
        $(this).parent().prev().click();
        $(this).parent().prev().attr('data-status',1);
    })

    //添加基础数量
    $('body').on('click','#addBaseQty',function(){
        var value = $('#baseQty').val()?$('#baseQty').val():'';
        var cureing_time = $('#cureing_time').val()?$('#cureing_time').val():'';
        var status = $('.is-radio-checked .status').val()?$('.is-radio-checked .status').val():'';

        var max_split_point = $('#max_split_point').val()?$('#max_split_point').val():'';
        var id =  $(this).attr('data-id');
        if(value==''){
            layer.msg('基础数量不能为空！', {icon: 3,offset: '250px',time: 1500});
        }else {
            addBaseQty(id,value,status,max_split_point,cureing_time);
        }

    })
    //单选按钮点击事件
    $('body').on('click','.el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });
}

function getItemBomInfo(now_bom_id) {
    AjaxClient.get({
        url: URLS['workhour'].hourBomShow+"?"+_token+'&bom_id='+now_bom_id,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                // TODO 不完善的产品规格显示
                var bom_description = `产品规格：<span>${tansferNull(rsp.results.description)!=''?tansferNull(rsp.results.description):'暂无信息'}</span>`;
                var item_no = `物料清单编码：<span>${tansferNull(rsp.results.item_no)!=''?tansferNull(rsp.results.item_no):''}</span>`;
                var version_description = `当前版本：<span>${tansferNull(rsp.results.version)!=''?tansferNull(rsp.results.version.toFixed(1)):''}</span>`;

                // 加载设计bom版本
                $('.gongshi').show();

                getDesignBom(rsp.results.material_id,rsp.results.version,rsp.results.bom_no);
                $('.bom_wrap .bom-description').html(bom_description);
                $('.bom_wrap .material-code').html(item_no);
                $('.bom_wrap .version-now').html(version_description);
                getBomRoute(bom_id);
            }
        },
        fail: function(rsp){
            var con= `<div class="no_data_center"></div>`;
            $('.work_hours_wrap .bom_wrap .route-lists').html('');
            $('.work_hours_wrap .bom_wrap .el-tap-wrap').html('');
            $('.work_hours_wrap .bom_wrap .el-panel').html(con);
            $('.total_num').css('display','none');
            $('.gongshi').css('display','none');
            $('#all_work_hour').css('display','none');
            $('#show_base_num').css('display','none');
            $('#addBaseQty').css('display','none');
            LayerConfig('fail','获取子项物料清单详细信息失败')
        }
    },this);
}
//获取基础数量
function getBaseQty(is_excrete) {
    AjaxClient.get({
        url: URLS['workhour'].getBomRoutingBaseQty+"?"+_token+"&bom_id="+bom_id+"&routing_id="+routing_id+"&routing_node_id="+routing_node_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                if(is_excrete==1){
                    $(".is_excrete").css('display','inline-block');
                }else {
                    $(".is_excrete").css('display','none');
                }
                $('#baseQty').val(rsp.results[0].base_qty);
                if(rsp.results[0].is_split==1){
                    $(".el-radio-input.yes").addClass('is-radio-checked');
                    $(".el-radio-input.no").removeClass('is-radio-checked');
                }else {
                    $(".el-radio-input.yes").removeClass('is-radio-checked');
                    $(".el-radio-input.no").addClass('is-radio-checked');
                }
                $('#max_split_point').val(rsp.results[0].max_split_point);
                $('#addBaseQty').attr('data-id',rsp.results[0].id);

                if(rsp.results[0].control_code=='PP06'){
                    // $('#cure_time').css('display','inline-block');
                    $('#cure_time').css('display','none');
                }else {
                    $('#cure_time').css('display','none');
                }


            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取基础数量失败');
        }
    },this);
}
//提交基础数量
function addBaseQty(id,value,is_split,max_split_point,cureing_time) {
    AjaxClient.post({
        url: URLS['workhour'].updateBomRoutingBaseQty,
        dataType: 'json',
        data:{
            id:id,
            base_qty:value,
            is_split:is_split,
            max_split_point:max_split_point?max_split_point:0,
            curing_time:cureing_time?cureing_time:0,
            _token:TOKEN
        },
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                LayerConfig('success','成功！')
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp.field=='base_qty'){
                layer.msg('提交基础失败,请重试', {icon: 2,offset: '250px'});
            }
            if(rsp.field=='max_split_point'){
                layer.msg('提交最大拆分数失败,请重试', {icon: 2,offset: '250px'});
            }

        }
    },this);
}
//获取图纸详情
function getImgInfo(id){
    AjaxClient.get({
        url: URLS['workhour'].imgShow+"?"+_token+"&drawing_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                showImgModal(rsp.results,1);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸失败');
        }
    },this);
}
function showImgModal(data,flag) {
    transformStyle = {
        rotate:"rotate(0deg)",
        scale:"scale(1)",
    };
    var {drawing_id='',image_orgin_name='',code='',name='',category_name='',group_name='',comment='',attributes=[]}={};
    if(data){
        ({drawing_id='',image_orgin_name='',code='',name='',category_name='',group_name='',comment='',attributes=[]}=data)
    }
    var attr_html = showAttrs(attributes);

    var img = new Image(),
        imgsrc='',
        attribute={},
        wwidth=$(window).width(),
        wheight=$(window).height()-100;
    if(flag){
        img.src=imgsrc=window.storage+data.image_path;
        if(data.attribute){
            attribute=data.attribute;
        }
    }else{
        img.src=imgsrc=data;
    }
    var nwidth=img.width>wwidth?(wwidth*0.8):(img.width),
        nheight=img.height+170>wheight?(Number(wheight-80)):(img.height+90);
    nwidth<500?nwidth=500:null;
    nheight<400?nheight=400:null;
    var mwidth=nwidth+'px',
        mheight=nheight+'px';
    layerModal = layer.open({
        type: 1,
        title: '图纸详细信息',
        offset: '100px',
        area: [mwidth,mheight],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<div class="pic-wrap-container">
                    <div class="pic-wrap">
                        <div class="el-tap-wrap edit">
                            <span data-item="image_form" class="el-tap image active">图纸</span>
                            <span data-item="basic_form" class="el-tap image">属性信息</span> 
                        </div>  
                        <div class="el-panel-wrap" style="padding-top: 10px;">
                            <div class="el-panel image_form active" id="image_form">
                                <div class="pic-detail-wrap" style="width: ${mwidth};height: ${nheight-130}px"></div>
                                <div class="action">
                                    <i class="el-icon fa-search-plus"></i>
                                    <i class="el-icon fa-search-minus"></i>
                                    <i class="el-icon fa-rotate-right"></i>
                                </div>
                            </div>
                            <div class="el-panel" id="basic_form">
                                <div class="imginfo">
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">编码:</label>
                                            <span>${code}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">名称:</label>
                                            <span>${name}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸来源:</label>
                                            <span>${tansferNull(category_name)}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸分组名称:</label>
                                            <span>${tansferNull(group_name)}</span>
                                        </div> 
                                    </div>
                                     <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸注释:</label>
                                            <span>${comment}</span>
                                        </div> 
                                    </div>
                                    ${attr_html}
                                </div> 
                            </div>
                        </div>
                    </div>
                </div>`,
        success: function(){
            var imgObj=$('<img src="'+imgsrc+'" alt="" />');
            img.onload=function(){
                imgObj.css({
                    "left":(nwidth - img.width) / 2,
                    "top":(nheight - img.height-130) / 2,
                    'height':img.height+'px',
                });
                imgObj.attr({"data-scale": 1,"data-rotate": 0});
                if(img.width>nwidth||img.height>(nheight-130)){
                    var widthscale=nwidth/img.width,
                        heightscale=nheight/img.height,
                        scale=Math.max(Math.min(widthscale,heightscale),0.1),
                        imgHeight=img.height*scale;
                    imgObj.attr("data-scale", scale.toFixed(2));
                    transformStyle.scale='scale(' + scale.toFixed(2) + ')';
                    imgObj.css({
                        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
                        "transform": transformStyle.rotate + " " + transformStyle.scale,
                        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
                    });
                }
            }
            imgObj.on({
                "mousedown":function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    isMove = false;
                    var mTop = e.clientY;
                    var mLeft = e.clientX;
                    var oTop = parseFloat($(this).css("top"));
                    var oLeft = parseFloat($(this).css("left"));
                    var disTop = mTop - oTop;
                    var disLeft = mLeft - oLeft;
                    var that = $(this);
                    that.css({
                        "cursor": "url(images/cur/closedhand.cur) 8 8, default"
                    });
                    $(document).on("mousemove",function(event){
                        isMove = true;
                        var x = event.clientX;
                        var y = event.clientY;
                        var posX = x - disLeft;
                        var posY = y - disTop;
                        that.css({
                            "top":posY+"px",
                            "left":posX+"px"
                        });
                    });
                }
            });
            $(document).on("mouseup",function(e){
                $(document).off("mousemove");
                $(document).off("mousedown");
                $(imgObj).css({
                    "cursor": "url(images/cur/openhand.cur) 8 8, default"
                });
            });
            $('.pic-detail-wrap').append(imgObj);
            zoomPcIMG();
        },
        end: function(){
            $("body").css("overflow-y", "auto");
        }
    })
}
function zoomPcIMG(flag) {
    $("body").css("overflow-y", "hidden");
    if(flag=='all'){
        if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
            $("#imgWrap").on("DOMMouseScroll", function (e) {
                wheelZoom(e, $("#imgWrap .current .zoomImg"), true);
            });
        } else {
            $("#imgWrap").on("mousewheel", function (e) {
                wheelZoom(e, $("#imgWrap .current .zoomImg"));
            });
        }
    }else{
        var imgele=$("#image_form .pic-detail-wrap").find('img');
        if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
            $("#image_form .pic-detail-wrap").on("DOMMouseScroll", function (e) {
                wheelZoom(e, imgele, true);
            });
        } else {
            $("#image_form .pic-detail-wrap").on("mousewheel", function (e) {
                wheelZoom(e, imgele);
            });
        }
    }
}
function wheelZoom(e, obj, isFirefox) {
    var zoomDetail = e.originalEvent.wheelDelta;
    if (isFirefox) {
        zoomDetail = -e.originalEvent.detail;
    }
    zoomPic(zoomDetail, $(obj));
}
function zoomPic(zoomDetail, obj) {
    var scale = Number($(obj).attr("data-scale"));
    if (zoomDetail > 0) {
        scale = scale + 0.05;
    } else {
        scale = scale - 0.05;
    }
    if (scale > 2) {
        scale = 2;
    } else if (scale < 0.1) {
        scale = 0.1;
    }
    obj.attr("data-scale", scale.toFixed(2));
    transformStyle.scale='scale(' + scale.toFixed(2) + ')';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}
function rotatePic(obj){
    var rotate = Number($(obj).attr("data-rotate"))||0;
    rotate+=90;
    if(rotate>=360){
        rotate=0;
    }
    obj.attr("data-rotate", rotate);
    transformStyle.rotate='rotate(' + rotate + 'deg)';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}
function showAttrs(data) {
    var _html='';
    if(data.length){
        data.forEach(function (item) {
            _html+=`<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">${item.definition_name}:</label>
                            <span>${item.value}</span>
                        </div> 
                    </div>`
        })
    }
    return _html;
}
function saveHours(data) {
    AjaxClient.post({
        url: URLS['workhour'].workhourAdd,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            var rnid=$('.el-tap-wrap .el-tap.active').attr('data-item');
            getRouteDetail(rnid,bom_id);
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}
function showWorkHourModal(material_no,abId,step_id,operation_id,bom_id,route_id,workcenter_id) {
    var labelWidth=120,btnShow='btnShow';
    layerModal=layer.open({
        type: 1,
        title: '维护工时',
        offset: '100px',
        area: ['1200px','640px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        moveOut: true,
        content: `<form class="work_hours_form formModal" id="workHoursForm">
                       <input type="hidden" id="itemId" value="${material_no}">
                       <input type="hidden" id="stepId" value="${step_id}">
                       <input type="hidden" id="opId" value="${operation_id}">
                       <input type="hidden" id="bomId" value="${bom_id}">
                       <input type="hidden" id="routeId" value="${route_id}">
                       <div class="procedure_ability_value" style="min-height: 300px;">
                           <div class="inputOperationValue_table">
                            <table class="info_table">
                                <thead>
                                  <tr class="th_table_tbody">
                                        <th class="thead">工序名称</th>
                                        <th class="thead">能力</th>
                                        <th class="thead">最小值[${unit}]</th>
                                        <th class="thead">最大值[${unit}]</th>
                                        <th class="thead">工时 [s]</th>
                                        <th class="thead man_hours_info" style="display: none">人工工时 [s]</th>
                                        <th class="thead">首样工时 [s]</th>
                                        <th class="thead once_clip_info" style="display: none">单次切割时间[s]</th>
                                        <!--<th class="thead once_clip_info" style="display: none">单次最大切割数量[${unit}]</th>-->
                                        <th class="thead">是否为基准</th>
                                        <th class="thead">操作</th>
                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                  
                                </tbody>
                            </table>
                          </div>
                       </div>
                       <div>
                            <h3 style="background-color: #F8F8F8;height: 40px;line-height: 40px;">维护工作中心</h3>
                            <div style="min-height: 180px;" id="showWorkCenter">
                            
                            </div>
                       </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button show_manHours">显示人工工时</button>
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit confirm_work_hour">确定</button>
                        </div>
                    </div>                    
           </form>`,
        success:function (layero,index) {
            getHourByMaterialNo(step_id,operation_id,abId,bom_id);
            getWorkCenterForm(workcenter_id,step_id);
        },
        end:function () {

        }
    })
}

function getWorkCenterForm(workcenter_id,step_id) {
    AjaxClient.get({
        url:URLS['workhour'].workCenter+'?'+_token+"&step_info_id="+step_id+"&workcenter_id="+workcenter_id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            $('#showWorkCenter').html('');
            if(rsp.results&&rsp.results.length){
                var workCenterHtml=''
                rsp.results.forEach(function (item) {
                    if(item.code =='ZPP001' || item.code=='ZPP002'){
                        workCenterHtml+= `<div class="work_center_item" data-id="${item.stand_id}" data-work="${item.id}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input readonly class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"><span>（${item.unit}）</span></div>`
                    }else {
                        workCenterHtml+= `<div class="work_center_item" data-id="${item.stand_id}" data-work="${item.id}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"><span>（${item.unit}）</span></div>`

                    }
                });
                $('#showWorkCenter').html(workCenterHtml);
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);

}
//获取设计bom
function getDesignBom(id,version,bom_no) {
    AjaxClient.get({
        url: URLS['workhour'].bomDesign+"?"+_token+'&material_id='+id+'&bom_no='+bom_no,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                var trs=createMainDesignTable(rsp.results);
                $('#addDesignBom_from .design_main_table .t-body').html(trs);
            }
        },
        fail: function(rsp){
            console.log('获取设计bom失败');
        }
    },this);
}
//生成设计bom列表
function createMainDesignTable(data){
    var viewurl=$('#hour_view').val(),
        //editurl=$('#bom_edit').val(),
        flag=$('.status-btn.activate.none').length;
    var trs=[];
    if(data.length){
        data.forEach(function(item,index){
            var tip='';
            if(item.status==0){
                condition=`<span style="padding: 2px;border: 1px solid #ccc;color: #ccc;border-radius: 4px;">未激活</span>`;
            }else if(item.is_version_on==1){
                condition=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
            }else{
                condition=`<span style="padding: 2px;border: 1px solid #ccc;color: #ccc;border-radius: 4px;">已激活</span>`;
            }
            if(!flag){
                tip=`<div class="tipinfo" style="display: inline-block;line-height: 24px;"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip" style="width: 70px;">请先激活<i></i></span></div>`;
            }
            var tr=`
            <tr class="tr-bom-item ${item.bom_id==bom_id?'active':''}" data-bom-id="${item.bom_id}" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.user_name}</td>
                <td>${item.version}.0</td>
                <td><span title="item.version_description">${item.version_description.length>25?item.version_description.substring(0,24)+'...':item.version_description}</span></td>
                <td class="bomstatus">${condition}</td>
                <td>
                  <div class="design_operation">
                  <a class="link_button bom_link" target="_blank" href="${viewurl}?id=${item.bom_id}&version=${item.version}">查看当前版本</a>

                  </div>
                </td>
            </tr>
        `;
            trs.push(tr);
        });
    }else{
        var tr=`<tr>
                <td class="nowrap" colspan="7" style="text-align: center;">暂无数据</td>
            </tr>`;
        trs.push(tr);
    }

    return trs;
}