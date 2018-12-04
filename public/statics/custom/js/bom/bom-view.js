var id,layerLoading,
    bomShowData = {},
    topMaterial = {},
    itemData = [],
    go=true,
    bomid=0,
    routeid=0,
    hoursFlag,
    routenodes=[],
    productId,
    productDifference = [],
    productPageNo = 1,
    productPageSize = 10,
    newroutingGraph = null;

$(function () {

    $('#showLog').show();
    id=getQueryString('id');
    hoursFlag= getQueryString('flag');
    if(id!=undefined){
        bomid=id;
        getBomView(id);
    }else{
        layer.msg('url链接缺少id参数，请给到id参数', {icon: 5
            ,offset: '250px'});
    }

    bindEvent();
})

function getBomView(id) {
    var is_design = (getQueryString('is_design') == 1) ? 1 : 0;
    AjaxClient.get({
        url: URLS['bomList'].show+'?'+_token+"&bom_id="+id+"&is_design="+is_design,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // console.log(rsp);
            var version=rsp.results.version;
            $('.el-form-item.version_release').html('当前版本:'+version+'.0');
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                showBomView(rsp.results)
                if(hoursFlag!=undefined){
                    $(".el-tap-wrap .el-tap[data-item='addRoute_form']").click();
                }
            }else{
                layer.msg("获取信息失败",{icon:5,offset:'250px'});
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            layer.msg("获取信息失败",{icon:5,offset:'250px'});
        }
    })
}
function dateFormat (timestamp, formats) {
    // formats格式包括
    // 1. Y-m-d
    // 2. Y-m-d H:i:s
    // 3. Y年m月d日
    // 4. Y年m月d日 H时i分
    formats = formats || 'Y-m-d H:i:s';

    var zero = function (value) {
        if (value < 10) {
            return '0' + value;
        }
        return value;
    };

    var myDate = timestamp? new Date(timestamp*1000): new Date();

    var year = myDate.getFullYear();
    var month = zero(myDate.getMonth() + 1);
    var day = zero(myDate.getDate());

    var hour = zero(myDate.getHours());
    var minite = zero(myDate.getMinutes());
    var second = zero(myDate.getSeconds());

    return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
        return ({
            Y: year,
            m: month,
            d: day,
            H: hour,
            i: minite,
            s: second
        })[matches];
    });
};
function showBomView(data) {
    bomShowData = data.bom_tree;
    topMaterial = data.bom_tree;
    var limitTime = dateFormat(data.DATUV);
    var bomFrom = '';
    if(data.from == 1){
        bomFrom = 'MES';
    }else if(data.from == 2){
        bomFrom = 'ERP';
    }else if(data.from == 3){
        bomFrom = 'SAP';
    }
    //常规页面
    var parentForm = $('#viewBom');
    $('#viewBomCommon #material_id').val(data.bom_tree.name).data("topMaterial",topMaterial).
    siblings('label').addClass('mater-active').siblings('.choose-material').hide();
    parentForm.find('#basic_operation_id').val(bomShowData.operation_name);
    parentForm.find('#validity').val(limitTime);
    parentForm.find('#bom_unit').val(data.BMEIN);
    parentForm.find('#bom_no').val(data.item_no);
    parentForm.find('#update_no').val(data.AENNR);
    parentForm.find('#SAP_desc').val(data.bom_sap_desc);
    parentForm.find('#bom_from').val(bomFrom);
    var _checkbox = $('.ability_wrap .ability ul');
    if(bomShowData.operation_ability!=''){
        var arr = bomShowData.operation_ability.split(',');
        if(arr.length){
            $('.ability_wrap .el-select').find('.el-input').val(arr.length+'项被选中');
            for(var i in arr) {
                var innerHtml=`<li class="el-select-dropdown-item ability-item">
                                 <span class="el-checkbox_input operation-check is-checked">
                                 <span class="el-checkbox-outset"></span>
                                 <span class="el-checkbox__label">${bomShowData.operation_ability_pluck[arr[i]]}</span>
                                 </span>
                            </li>`;
                _checkbox.append(innerHtml)
            }
        }
    }


    var labelId = ['code','name','unit','bom_group_name','qty','label','loss_rate','description','version','version_description'];
    labelId.forEach(function (item,index) {
        parentForm.find('#'+item).val(data[item]);
    });
    itemData = [];
    if(data.bom_tree.children && data.bom_tree.children.length){
        data.bom_tree.children.forEach(function (item) {
            item.itemAddFlag=1;
            itemData.push(item);
            if(item.replaces&&item.replaces.length){
                item.replaces.forEach(function(reitem) {
                    reitem.itemAddFlag=2;
                    reitem.replaceItemId = item.material_id;
                    itemData.push(reitem);
                })
            }
        })
    }
    showAddItem(itemData);
    //附件页面
    showBomFile(data.attachments);
    //工艺路线
    getBomRouteLine();
    //设计bom
    getDesignBom(data.material_id,'nopop');
    //制造bom
    productId = data.material_id;
    getProductBom(data.material_id,'productBom')
}

//查看BOM文件
function showBomFile(data) {

    var ele = $('#viewBomFiles .bom_table .t-body');
    if(data && data.length){
        data.forEach(function (item) {

            var url=window.storage+item.path,
                preview = '';

            if(item.path.indexOf('jpg')>-1||item.path.indexOf('png')>-1||item.path.indexOf('jpeg')>-1){
                preview = `<img width="60" height="60" src="${url}" alt="">`
            }else{
                preview = `<div class='file-preview-text existAttch'>
                               <h3 style="font-size: 50px;color: #428bca;"><i class="el-icon el-icon-file"></i></h3>
                           </div>`
            }


            var size =item.size >= 1024 ?  `${(item.size/1024).toFixed(2)}KB` : `${item.size}B`;
            var tr= ` <tr class="tritem" data-id="${item.attachment_id}">
                  <td style="font-size: 18px;">
                    ${preview}
                  </td>
                  <td style="text-align:left">${item.filename}<span style="color: #999;">(${size})</span></td>
                  <td style="text-align: left">${item.creator_name}<br/><span style="color: #666;">${item.ctime}</span></td>
                  <td><textarea readonly class="fujiantext" maxlength="50" rows="1">${item.comment}</textarea></td>
                  <td><a download="${item.filename}" href="${item.is_from_erp==1?item.path:'/storage/'+item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a></td>             
              </tr>`;
            ele.append(tr);
        })

    }else{
        var tr= `<tr>
                    <td colspan="6" style="color:#666">暂无数据</td> 
                 </tr>`;
        ele.append(tr);
    }



}

//添加项
function showAddItem(data) {

    var ele = $('#viewBomCommon .item_table .t-body');
    ele.html("");

    if(data.length){
        data.forEach(function (item,index) {

            var replacetr='',replacetrId='', version='',maxVersion=0;
            if(item.itemAddFlag==2){
                replacetr = 'tr-replace';
                replacetrId=`data-replace-id="${item.replaceItemId}"`
            }

            if(item.is_assembly>0){
                if(item.versions&&item.versions.length){
                    if(item.version){
                        maxVersion=item.version;
                    }else{
                        maxVersion=Math.max.apply(null, item.versions);
                    }
                }
            }


            var tr =  `
            <tr class="ma-tritem ${replacetr}" data-id="${item.material_id}" ${replacetrId}>
                  <td><p class="show-material" data-version="${maxVersion}" data-has-bom="${item.has_bom>0?'1':'0'}" data-assembly="${item.is_assembly>0?'1':'0'}" data-id="${item.material_id}">${item.item_no}</p></td>
                  <td>${item.name}</td>
                  <td><input type="number" step="0.01" value="${item.loss_rate!=undefined?item.loss_rate:'0.00'}" readonly class="el-input bom-ladder-input loss_rate"></td>
                  <td>
                      <span class="el-checkbox_input assembly-check ${item.has_bom?'':'noedit'} ${item.is_assembly!=undefined&&item.is_assembly?'is-checked':''}" data-id="${item.material_id}" data-has-bom="${item.has_bom}" data-version="${item.version||0}">
                          <span class="el-checkbox-outset"></span>
                      </span>
                  </td>
                  <td><input type="text" value="${item.usage_number!=undefined?item.usage_number:''}" readonly class="bom-ladder-input usage_number"></td>
                  <td>${item.unit}</td>
                  <td><textarea class="el-textarea bom-textarea comment" readonly name="" id="" cols="30" rows="3">${item.comment!=undefined?item.comment:''}</textarea></td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("matableItem",item);
        });
    }else{
        var tr =`<tr>
                   <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
                </tr>`;
        ele.append(tr);
    }
}


function createRealBom(treeData,fn,flag) {

    var bomHtml = "";
    if(treeData.children && treeData.children.length){
        var bomItem = treeList(treeData,0,flag);

        bomHtml = `<div class="tree-folder" data-id="${treeData.material_id}">
                 <div class="tree-folder-header">
                 <div class="flex-item">
                 <i class="icon-minus expand-icon"></i>
                 <div class="tree-folder-name"><p class="bom-tree-item top-item item-name ${flag}" data-pid="0" data-post-id="${treeData.material_id}" title="${treeData.name}">${treeData.name}</p></div></div></div>
                 <div class="tree-folder-content">
                   ${bomItem}
                 </div>
              </div> `;
    }else{
        bomHtml=`<div class="tree-item" data-id="${treeData.material_id}">
              <div class="flex-item">
              <i class="item-dot expand-icon"></i>
              <div class="tree-item-name"><p class="bom-tree-item top-item item-name ${flag}" data-pid="0" data-post-id="${treeData.material_id}" title="${treeData.name}">${treeData.name}</p></div></div>  
            </div>`;
    }

    fn&&typeof fn=='function'?fn(bomHtml):null;

}

function treeList(data,pid,flag) {
    var bomTree = '';

    if(flag == 'realBom' || flag == 'noedit'){
        data.children.forEach(function (item) {
            var replaceStr='',replaceCss='',assemblyStr='';
            if(item.replaces!=undefined&&item.replaces.length){
              replaceStr='<span>替</span>';
              replaceCss='replace-item';
            }

            if(item.children && item.children.length&&item.is_assembly){

                bomTree += `<div class="tree-folder" data-id="${item.material_id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name"><p class="item-name bom-tree-item ${flag} ${replaceCss}" data-pid="${item.ppid}" data-post-id="${item.material_id}" title="${replaceStr}${item.name}">${replaceStr}${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(item, 0,flag)}
                   </div>
                </div> `;

            }else{
              var assbomid='';
              if(item.is_assembly==0&&item.children&&item.children.length){
                assemblyStr='<span class="bom-flag">BOM</span>';
                assbomid=item.children[0].bom_id;
              }
                bomTree += `<div class="tree-item" data-id="${item.material_id}">
                <div class="flex-item">
                <i class="item-dot expand-icon"></i>
                <div class="tree-item-name"><p class="item-name bom-tree-item ${flag} ${replaceCss}" data-pid="${item.ppid}" data-post-id="${item.material_id}" title="${replaceStr}${assemblyStr}${item.name}">${replaceStr}${assemblyStr}${item.name}</p></div></div>  
                </div>`;
            }

        })
    }

    return bomTree
}

function addExtendData(id,ppid,replaceid) {
    var maConEle=$('.bom_item_container'),
        newData = {
            bom_item_qty_levels: [],
            total_consume: maConEle.find('.total_consume').length&&maConEle.find('.total_consume').val().trim()||''
        };

    if(maConEle.find('.basic_info.qty').is(':visible')&&maConEle.find('.parent_min_qty').length){
        maConEle.find('.basic_info.qty .tritem').each(function() {
            var parent_min_qty = $(this).find('.parent_min_qty').val().trim(),
                qty = $(this).find('.qty').val().trim();
            if (parent_min_qty != '' && qty != '') {
                var qtyobj = {
                    bom_item_qty_level_id: $(this).attr('data-bom-qty-id'),
                    bom_item_id: $(this).attr('data-bom-item-id'),
                    parent_min_qty: parent_min_qty,
                    qty: qty
                };
            newData.bom_item_qty_levels.push(qtyobj);
        }
        });
    }
    go=true;
    actTree(bomShowData,id,ppid,newData,replaceid);
}

function actTree(data,id,ppid,newData,replaceid) {

    if(go==false){//阻止继续遍历下去
        return;
    }

    if(data.material_id==id&&data.ppid==ppid){
        if(newData){

            if(replaceid!=undefined){

                data.replaces&&data.replaces.forEach(function(item){
                    if(item.material_id==replaceid){
                        item.bom_item_qty_levels=newData.bom_item_qty_levels;
                        item.total_consume=newData.total_consume;
                        return false;
                    }
                });
            }else{

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

//构造每一个子项的详细内容
function createMDetailInfo(data,flag,ppid){

    var ele=$('#viewBomExtend .bom_item_container'),
        eletap=ele.find('.el-tap-wrap'),
        topId=$('.bom-tree-item.top-item').attr('data-post-id');
    if(flag){
        eletap.removeClass('edit').html('');
        if(data.replaces!=undefined&&data.replaces.length){//有替代物料
            var span=`<span data-id="${data.material_id}" data-pid="${data.ppid}" class="el-tap el-ma-tap active">${data.name}&nbsp;&nbsp;<span class="hasReplace">替</span></span></span>`;
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
    ele.find('.mbasic_info .item_no span').html(data.item_no);

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
            qtyBtn=`<button type="button" class="bom-info-button add-qty" data-id="${data.material_id}" data-bom-item-id="${data.bom_item_id||0}">添加一行</button>`;
            consumInput=`<input type="number" style="width: 150px;" readonly class="bom-ladder-input total_consume" value="${data.total_consume||''}">`;
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
                          <td>${item.parent_min_qty == null ? item.parent_min_qty : `<input type="number" readonly style="width: 150px;" class="bom-ladder-input parent_min_qty" value="${item.parent_min_qty}">`}</td>
                          <td>${item.qty == null ? item.qty : `<input type="number" readonly style="width: 150px;" class="bom-ladder-input qty" value="${item.qty}">`}</td>           
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
        <h3>阶梯用量</h3>
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
    </div>` : '';
    }
    ele.find('.bom_blockquote_wrap.qty').html(qtyhtml);

    //总单耗
    if(data.children&&data.children.length){
        data.children.forEach(function(item){
            consumtr+=`<tr class="tritem" data-id="${item.material_id}">
            <td><p class="show-material" data-id="${item.material_id}">${item.item_no}</p></td>
            <td>${item.name}</td>
            <td>${item.usage_number}</td>            
        </tr>`;
        });
    }
    var consumhtml=consumInput.length||consumtr.length?`<div class="bom_blockquote">
        <h3>总单耗</h3>
        ${consumInput}
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


function createExistBomData(existData) {
    var form1=$('#viewBomCommon');

    bomShowData=form1.find('#material_id').data('topMaterial');
    bomShowData.ppid=0;
    bomShowData.usage_number=form1.find('#qty').val();
    console.log(bomShowData);

    form1.find('.ma-tritem').each(function(){
        var data=$(this).data('matableItem');

        data.loss_rate=$(this).find('.loss_rate').val().trim();
        data.usage_number=$(this).find('.usage_number').val().trim();
        data.comment=$(this).find('.el-textarea').val();

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
            }
        }
    });

    bomShowData.children = existData.children;
    actParentTree(bomShowData);
    createRealBom(bomShowData,function (bomHtml) {
        $('#viewBomExtend .bom-tree').html(bomHtml);
        setTimeout(function(){
            $('#viewBomExtend .bom-tree').find('.item-name.bom-tree-item').eq(0).click();
        },200);
    },'realBom');
}

function getDesignBom(id,flag,version) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomDesign+"?"+_token+'&material_id='+id,
        dataType: 'json',
        success:function (rsp) {

            if(rsp.results&&rsp.results.length){
                if(flag=='pop'){
                    var tr=showModalDesignTable(rsp.results);
                    $('.materialInfo_table .t-body').html(tr);

                    if(version!=0){
                        $('.materialInfo_table .t-body').find('.tr-bom-item[data-version='+version+']').click();
                    }else{
                        $('.materialInfo_table .t-body').find('.tr-bom-item:first-child').click();
                    }
                }else{
                    var tr=createMainDesignTable(rsp.results);
                    $('#viewBomDesign .design_main_table .t-body').html(tr);
                }
            }
        },
        fail:function (rsp) {

        }
    },this)
}

function getProductBom(ids,flag) {

    var urlLeft ="&page_no="+productPageNo+"&page_size="+productPageSize + "&material_id=" + ids + "&sort=id&order=asc";

    AjaxClient.get({
        url: URLS['bomProduct'].productList + '?' +_token + urlLeft,
        dataType: 'json',
        success:function (rsp) {

            var pageTotal = rsp.paging.total_records;

            if(pageTotal>productPageSize){
                bindProductPagenationClick(pageTotal,productPageSize);
            }else{
                $('#producePagenation').html('');
            }

            if(rsp.results){
                var tr = showProductTable(rsp.results);
                $('#viewBomProduct .t-body').html(tr);
            }
        },
        fail:function (rsp) {

        }
    },this)
}

function bindProductPagenationClick(total,size) {
    $('.pagenation_wrap').show();
    $('#producePagenation').pagination({
        totalData:total,
        showData:size,
        current: productPageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            productPageNo=api.getCurrent();
            getProductBom(productId,'productBom');
        }
    });
}

//显示制造bom列表
function showProductTable(data) {

    var trs = [];

    if(data.length){
        data.forEach(function (item,index) {

            var tr = `
               <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.version}</td>
                    <td>${item.version_description}</td>
                    <td><button type="button" class="bom-info-button productLog" data-id="${item.product_bom_id}">详情</button></td>
                    <td>
                        <button type="button" data-id="${item.product_bom_id}" class="bom-info-button view">查看</button>
                    </td>
                </tr>`;
            trs.push(tr);
            var obj = {
                key:item.product_bom_id,
                value: item.differences
            }
            productDifference.push(obj)
        });
    }else{
        var tr = `
               <tr>
                    <td colspan="6">暂无数据</td> 
                </tr>`;
        trs.push(tr)
    }

    return trs;
}

function showModalDesignTable(data) {
    var ele = [];
    if(data.length){
        data.forEach(function(item,index){
            var tr=`
            <tr class="tr-bom-item" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.user_name == null?'':item.user_name}</td>
                 <td>${item.version}.0</td>
                <td><p title="item.version_description">${item.version_description.length>25?item.version_description.substring(0,24)+'...':item.version_description}</p></td>             
            </tr>
        `;
            ele.push(tr);
        });
    }else{
        var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
            </tr>`;
        ele.push(tr);
    }

    return ele;
}

function createMainDesignTable(data) {
    var trs=[];
    if(data.length){
        data.forEach(function(item,index){
            var condition;
            if(item.status==0){
                condition=`<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未激活</span>`;
            }else{
                if(item.is_version_on==1){
                    condition=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
                }else{
                    condition=`<span style="padding: 2px;border: 1px solid #d2dc15;color: #d2dc15;border-radius: 4px;">已激活</span>`;
                }
            }
            var tr=`
            <tr class="tr-bom-item" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.user_name == null ? '' : item.user_name}</td>
                <td>${item.version}.0</td>
                <td><span title="item.version_description">${item.version_description.length>25?item.version_description.substring(0,24)+'...':item.version_description}</span></td>
                <td>${condition}</td>
                <td>
                  <button type="button" data-id="${item.bom_id}" data-msg="is_design=1" class="bom-info-button view">查看</button>
                </td>            
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

function setStep() {
  var ele=$('.route_overflow tbody.route-tbody');
  ele.html('');
  rnodes.iroutes.forEach(function (step,index){
    createStpe(step,index,ele);
  });
  setTimeout(function () {
    rnodes.iroutes.forEach(function (ritem,index) {
        //console.log(ritem);
      var uniqueId=ritem.field_id+'_'+Number(index+1);
      var rele=$('.step-tr[data-step-id='+uniqueId+']');
      if(ritem.is_start_or_end==1){//单步骤
      }else if(ritem.is_start_or_end==2){//开始
        rele.find('.s-e-check.start').click();
      }else if(ritem.is_start_or_end==3){//结束
        rele.find('.s-e-check.end').click();
      }
      var mahtml='';
      ritem.material_info.forEach(function (maitem) {
        var inclass='income',inname='进料';
        if(maitem.type==2){
          inclass='outcome';
          inname='出料';
        }
        mahtml+=`<tr class="${inclass}" data-is-lzp="${maitem.is_lzp}" data-id="${maitem.material_id}" data-item-no="${maitem.item_no}" data-type="${maitem.type}" data-json='${JSON.stringify(maitem)}'>
                      <td style="width: 138px;">
                      <span class="name_flow" style="word-wrap: break-word;overflow: inherit;text-overflow: inherit;white-space: inherit;">${maitem.item_no}</span>
                      <span class="name_flow" style="word-wrap: break-word;overflow: inherit;text-overflow: inherit;white-space: inherit;">(${maitem.name||''})</span></td>
                      <td style="width: 75px;">${maitem.usage_number||''}[${maitem.commercial}]</td>
                      <td style="width: 62px;"><span class="${inclass}">${inname}</span></td>
                      <td><p>${maitem.desc}</p></td>
                  </tr>`;
      });

        var workcenters = '';
        if(ritem.workcenters){
            ritem.workcenters.forEach(function (wcitem,wcindex) {
                workcenters += `<p style="background: #fffcdc;margin-bottom:0;">${wcindex+1}. ${wcitem.name}</p>`;
            });
        }
        rele.find('.workcenters_list').html(workcenters);
      rele.find('.route_item .select_route tbody').html(mahtml);
      rele.find('.ma-textarea').text(ritem.comment);
      rele.find('.time_number').val(ritem.practice_work_hour);
      if(ritem.operation_ability_ids){
        ritem.operation_ability_ids.split(',').forEach(function (aitem) {
          rele.find('.el-form-item.ma-ability_wrap .el-select-dropdown-item[data-id='+aitem+'] .route-ab-check').click();
        });
      }
      if(ritem.select_type){
          console.log($('.mode-wrap').find('span').length);
          setTimeout(function () {
            rele.find('.mode-wrap .mode-check').eq(ritem.select_type-1).click();
          },20);
      }
      imgchecks=[];
      if(ritem.drawings&&ritem.drawings.length){
        var imgs='',imgchecks=ritem.drawings;
        imgchecks.forEach(function (item) {
          imgs+=`<p><img data-img-id="${item.drawing_id}" src="/storage/${item.image_path}" width="80" height="40"><br>${item.code}</p>`;
        });
        rele.attr('data-imgs',JSON.stringify(imgchecks)).find('.img-wrap').html(imgs);
      }
      if(ritem.attachments&&ritem.attachments.length){
        var attchs='';
        ritem.attachments.forEach(function (titem) {
          attchs+=`<p><a href="${titem.is_from_erp==1?titem.path:'/storage/'+item.path}" download="${titem.filename}">${titem.filename}</a><i class="fa fa-times-circle attch-delete" data-attch-id="${titem.attachment_id}"></i></p>`;
        });
        rele.attr('data-attch',JSON.stringify(ritem.attachments)).find('.attch-wrap').html(attchs);
      }
    });
  },100);
}

//将指定节点下面的所有svg转换成canvas
function svg2canvas (targetElem) {
    var nodesToRecover = [];
    var nodesToRemove = [];
    var svgElem = targetElem.find('svg');

    svgElem.each(function(index, node) {
        var parentNode = node.parentNode;
        var svg = node.outerHTML;
        var canvas = document.createElement('canvas');
        canvg(canvas, svg);
        nodesToRecover.push({
            parent: parentNode,
            child: node
        });
        parentNode.removeChild(node);
        nodesToRemove.push({
            parent: parentNode,
            child: canvas
        });
        parentNode.appendChild(canvas);
    });

}

//模拟iframe,并且将需要的数据存入临时iframe
function openWithIframe(html){
    var iframe = document.createElement('iframe');
    iframe.setAttribute("id", "myFrmame");

    var $iframe = $(iframe);
    $iframe.css({
        'visibility': 'hidden', 'position':'static', 'z-index':'4'
    }).width($(window).width()).height($(window).height());
    $('body').append(iframe);
    var ifDoc = iframe.contentWindow.document;

    var style ="<link type='text/css' rel='stylesheet' href='/statics/custom/css/common.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/custom/css/material/material-add.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/custom/css/bom/bom.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/common/orgChart/css/jquery.orgchart.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/common/fileinput/fileinput.min.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/common/fileinput/theme/theme.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/custom/css/bom/log.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/custom/css/bom/routing.css'>";
    style+="<link type='text/css' rel='stylesheet' href='/statics/custom/css/practice/img_upload.css'>";

    html = "<!DOCTYPE html><html><head>"+style+"</head><body>"+html+"</body></html>"

    ifDoc.open();
    ifDoc.write(html);
    ifDoc.close();

    var fbody = $iframe.contents().find("body");

    fbody.find("#chart-center").removeAttr("width");

    fbody.find("#downlist,#downsPdf,#downsPdf .preview-wrap, #downsPdf .el-panel-preview-wrap").css("width", "100%");
    //fbody.find("#downsPdf").css("width", "100%");

    fbody.find("#severity-chart svg").attr("width", "370");
    fbody.find("#status-chart svg").attr("width", "300");
    return fbody;
}
function bindEvent() {
    //工艺文件预览页面中点击 "下载PDF" 按钮
    $('body').on('click','#renderPDF',function(e){
        // 防止频繁下载pdf判断
        var clicktag = 0;
        if (clicktag == 0){
            clicktag = 1;
            $('#renderPDF').addClass('editDisabled');
            //var chartCenter = document.getElementById("downlist").outerHTML;
            var chartCenter = document.getElementById("doc_list").outerHTML;
            var fbody = openWithIframe(chartCenter);
            svg2canvas(fbody);
            html2canvas(fbody, {
                onrendered: function(canvas) {
                    var contentWidth = canvas.width;
                    var contentHeight = canvas.height;
                    var pageHeight = contentWidth / 595.28 * 841.89;
                    var leftHeight = contentHeight+1000;
                    var position = 0;
                    var imgWidth = 841.89;
                    var imgHeight = 595.28/contentWidth * contentHeight;

                    var pageData = canvas.toDataURL('image/jpeg',1.0);

                    var pdf = new jsPDF('l', 'pt', 'a4');

                    var options = {
                        pagesplit: true
                    };

                    if (leftHeight < pageHeight) {
                        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight );
                    } else {
                        while(leftHeight > 0) {
                            pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                            leftHeight -= pageHeight;
                            position -= 595.28;
                            //避免添加空白页
                            if(leftHeight > 0) {
                                pdf.addPage();
                            }
                        }
                    }
                    var bom_name = $('#viewBomCommon #code') .val();
                    var route_name = $('#addRoute_form .route-tag.selected').attr('data-name');
                    var tab_name=$("#renderPDF").siblings().find(".el-tap.active").html();
                    pdf.save(bom_name+tab_name+'.pdf');
                    $('#myFrmame').remove();
                },
                background:"#fff",
                allowTaint: true
            });
            setTimeout(function () {
                clicktag = 0;
                $('#renderPDF').removeClass('editDisabled');

            },6000)
        }
    });
    //点击工艺路线列表
    $('body').on('click','.route-tag',function () {
        if(!$(this).hasClass('selected')){
            $(this).addClass('selected').siblings('.el-tag').removeClass('selected');
            var routeId=$(this).attr('data-route-id');
            $('#addRoute_form .route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');
            $('#routing_graph_new').html('');
            $('.el-form-item.route-line .el-select-dropdown-item[data-id='+routeId+']').click();
            routeid=routeId;
        }
    });
  //点击工艺路线列表
  $('body').on('click','.route-tag',function () {
    if(!$(this).hasClass('selected')){
      $(this).addClass('selected').siblings('.el-tag').removeClass('selected');
      var routeId=$(this).attr('data-route-id');
      $('#addRoute_form .route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');
      $('#routing_graph_new').html('');
      $('.el-form-item.route-line .el-select-dropdown-item[data-id='+routeId+']').click();
      routeid=routeId;
    }
  });
  //做法点击
  $('body').on('click','.make-item',function () {
    var makeid=$(this).attr('data-id');
    $(this).addClass('selected').siblings('.make-item').removeClass('selected');
    if(rnodes.iroutes&&rnodes.iroutes.length){
      setStep();
    }
  });
  $('body').on('click','.self-make-btn',function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).addClass('selected');
    $('.make_list_all .make-item').removeClass('selected');
    if(rnodes&&rnodes.ipractice_id==-1&&rnodes.iroutes.length){
      $(this).addClass('is-disabled');
      setStep();
    }
  });
    //tap切换按钮
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){

        if(!$(this).hasClass('active')){
            if($(this).hasClass('el-ma-tap')){//替代物料相互切换
                var former=$('.el-ma-tap.active'),
                    formerMId=former.attr('data-main-id'),
                    formerPId=former.attr('data-pid'),
                    formerREId=former.attr('data-id');
                formerMId==undefined?addExtendData(formerREId,formerPId):addExtendData(formerMId,formerPId,formerREId);
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var data=$(this).data('spanItem'),
                    ppid=$(this).attr('data-pid');
                createMDetailInfo(data,false,ppid);
            }else{
                $(this).addClass('active').siblings('.el-tap').removeClass('active');

                var form=$(this).attr('data-item');

                if(form == 'viewBomExtend'){
                    var existData = bomShowData;
                    existData.children == undefined ? existData.children=[]: null;

                    bomShowData = {};
                    // console.log(existData);
                    // console.log(existData.children);

                    createExistBomData(existData)
                }

                $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');

            }

        }

    });

    //显示树形图
    $('body').on('click','.viewBomExtend #showBomTree',function () {
        if(!$('.bom_container').hasClass('active')){
            $(this).text('显示树形图');
            $('.bom_container').addClass('active').siblings('.bom_tree_wrap').removeClass('active')
        }else{
            $(this).text('显示列表项');
            $('.bom_tree_wrap').addClass('active').siblings('.bom_container').removeClass('active');
            showBomPic(bomShowData);
        }
    })

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

    //bom 树节点
    $('body').on('click','.item-name',function () {
        var parent=$(this).parents('.bom_tree_container');

        if($(this).hasClass('bom-tree-item')){
            if($(this).hasClass('selected')){
                return false;
            }
            // actExtendData();
            parent.find('.item-name').removeClass('selected');
            $(this).addClass('selected');

            var id=$(this).attr('data-post-id'),
                ppid=$(this).attr('data-pid');

            go=true;

            actTree(bomShowData,id,ppid);

        }
    })

    //物料详细信息
    $('body').on('click','.show-material',function () {
        if($(this).hasClass("top-material")){
            if($(this).hasClass("mater-active")){
                var id=topMaterial.material_id;
                getMaterialInfoData(id,'top');
            }

        }else{
            var id=$(this).attr('data-id');
            if($(this).attr('data-has-bom')==1){
                var curversion=$(this).attr('data-version');
                getMaterialInfoData(id,'item',curversion);
            }else{
                getMaterialInfoData(id,'top');
            }

        }

    })
    //物料详细信息弹窗
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

    //弹窗关闭
    $('body').on('click','#materialModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    //设计bom项
    $('body').on('click','.materialInfo_container .tr-bom-item',function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.tr-bom-item').removeClass('active');
            var id=$(this).attr('data-id'),
                version=$(this).attr('data-version');
            getDesignBomTree(id,version);
        }
    });

    //设计bom 查看其他版本详细信息
    $('body').on('click','.design_main_table .bom-info-button.view',function (e) {
        var id = $(this).attr('data-id');
        var msg=$(this).attr('data-msg');
        var viewurl=$('#bom_view').val()+'?id='+id+'&'+msg;

        window.open(viewurl);
    })

    $('body').on('click','.product_main_table .bom-info-button.view',function (e) {

        var id = $(this).attr('data-id');
        var viewurl=$('#product_bom_view').val()+'?id='+id;
        window.open(viewurl);

    })

    $('body').on('click','#viewBomProduct .productLog',function (e) {
        var id =  $(this).attr('data-id');

        if(productDifference.length){

            productDifference.forEach(function (item,index) {
                if(id==item.key){

                    showProductLogModal(item.value)
                }
            })
        }
    })

    //下拉框点击事件
    $('body').on('click','.el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
  $('body').on('click','.el-checkbox_input.mode-check',function () {
    $(this).toggleClass('is-checked');
    if($(this).hasClass('is-checked')){
      $(this).siblings('.mode-check').removeClass('is-checked');
    }
  });
    $('body').on('click', '.el-checkbox_input.route-ab-check', function () {
        var abele = $(this).parents('.ma-ability_wrap'),
            ids = abele.find('.val_id').val().trim() ? abele.find('.val_id').val().trim().split(',') : [],
            // workcenter_ids = [],
            // workcenter_names = [],
            abjson = [];
        // var lis=$(this).next().children();
        // if(lis.length>0){
        //     $(lis).each(function(key,val){
        //         workcenter_ids.push($(this).attr('data-wcid'));
        //         workcenter_names.push($(this).attr('data-wcname'));
        //     })
        // }
        // var workcenterNames = workcenter_names.join(',');
        // if(workcenterNames==''){
        //     workcenterNames='无';
        //     // $('.showwcnames').css('display','none');
        //
        // }
        // console.log(workcenterNames);
        if (abele.attr('data-json')) {
            abjson = JSON.parse(abele.attr('data-json'));
        } else {
            abjson = [];
        }
        $(this).toggleClass('is-checked');
        var id = $(this).attr('data-checkid');
        cname = $(this).attr('data-checkname');

        if ($(this).hasClass('is-checked')) {
            var obj = {
                ability_id: id,
                ability_name: cname,
                // workcenter_names:workcenterNames,
                // workcenter_ids : workcenter_ids
            };

            abjson.push(obj);
            ids.push(id);

        } else {
            var index = ids.indexOf(id);
            // console.log(index);
            ids.splice(index, 1);
            abjson.splice(index, 1);
        }
        var names = [];
        abjson.forEach(function (item,index) {
            var i=index+1;
            // console.log(item);
            // console.log(abjson);
            names.push("<span style='background: #d2f8ce'><span style='display:inline-block;'>"+i+'.'+"</span>"+item.ability_name+"<br></span>");
        });
        abele.find('.val_id').val(ids.join(','));
        abele.attr('data-json', JSON.stringify(abjson));
        abele.find('.abs-name').html(names.join(''));
        if (ids.length) {
            abele.find('.el-input').val(ids.length + '项被选中');
        } else {
            abele.find('.el-input').val('--请选择--');
        }
    })
    //下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto,.ability-item,.route-ability-item)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            var idval=$(this).attr('data-id');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
          if(ele.find('.val_id').attr('id')=='route_id'){//工艺路线
            if(idval!=''){
              $('.route-lists .route-tag[data-route-id='+idval+']').addClass('selected').siblings('.el-tag').removeClass('selected');
              $('#addRoute_form .route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');
              $('#routing_graph_new').html('');
              getBomRoute(idval);
            }
          }
        }

        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
  //步骤中开始结束点击
  $('body').on('click','.check-group .s-e-check',function () {
    $(this).toggleClass('is-checked');
    if($(this).hasClass('is-checked')){
      $(this).siblings('.el-checkbox_input').removeClass('is-checked');
      $(this).parents('.step-tr').addClass('step-check');
      if($(this).hasClass('start')){//作为开始工序
      }else if($(this).hasClass('end')){//作为结束工序
        $('.route-tbody').find('tr.step-tr').removeAttr('data-group-id');
        $(this).parents('.route-tbody').find('tr.step-tr').each(function () {
          var checkele=$(this).find('.check-group .s-e-check.is-checked');
          if(checkele.length){
            if(checkele.hasClass('start')){
              $(this).addClass('_group').nextAll().addClass('_group');
              $(this).find('.route_item .bottom .create-out').remove();
            }else if(checkele.hasClass('end')){
              if($('tr.step-tr._group').length){
                var start=$('tr.step-tr._group').eq(0).attr('data-step-id'),
                  end=$(this).attr('data-step-id');
                $(this).nextAll().removeClass('_group');
                var groupEle=$('tr.step-tr._group').attr('data-group-id',start+'-'+end);
                groupEle.not(':last-child').find('.mode-wrap').html('');
                // groupEle.not(':last-child').find('.img-add').html('');
                groupEle.removeClass('_group');
                if(!$(this).find('.mode-wrap').html()){
                  var modeHtml=`<span class="el-checkbox_input mode-check" data-index="1">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="2">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料多流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="3">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="4">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料多流转品</span>
                            </span>`;
                  $(this).find('.mode-wrap').html(modeHtml);
                }
                // if(!$(this).find('.img-add').html()){
                //   $(this).find('.img-add').html('<span class="ma_item_img_add">编辑图纸</span>');
                // }

              }else{
                console.log('没有选择开始，禁用按钮');
              }
            }
          }else{
            $(this).find('.route_item .bottom .create-out').remove();
          }
        });
      }
    }else{
      $(this).parents('.step-tr').removeClass('step-check');
    }
  });
  $('body').on('click','.img-wrap img',function(){
    getImgInfo($(this).attr('data-img-id'));
  });
  $('body').on('click','.el-tap-img-wrap .el-tap',function(){
    var form=$(this).attr('data-item');
    if(!$(this).hasClass('active')){
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      $('.pic-wrap #'+form).addClass('active').siblings('.el-img-panel').removeClass('active');
    }
  });
  $('body').on('click','.el-tap-preview-wrap .el-tap',function(){
    if(!$(this).hasClass('active')){
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      var rnid=$(this).attr('data-item');
      getPreview(rnid);
    }
  });
    $('body').on('click','.preview_draw_wrap img',function (e) {
        $(this).parents('.preview_draw_wrap').toggleClass('active').siblings('.preview_draw_wrap').removeClass('active');
        if($(this).parents('.preview_draw_wrap').hasClass('active')){
            var path=$(this).parents('.preview_draw_wrap').attr('data-url');
            var img =`<img src="/storage/${path}" alt=""/>`;
            $(this).parents('.route_preview_container').find('.img_expand_pre').addClass('active').html(img);
        }else{
            $(this).parents('.route_preview_container').find('.img_expand_pre').removeClass('active').html('');
        }
    })
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

  $('body').on('click','.preview-route',function (e) {
    e.stopPropagation();
    e.preventDefault();
    previewModal();
  });
}

//制造bom详情
function showProductLogModal(data) {
    var list = '';

    if(data == ""){
        list = '';
    }else{
        var listObj=JSON.parse(data);
        if(listObj.length){

            listObj.forEach(function (item,index) {
                var text = '',actionStyle = '';

                switch(item.action){
                    case "add":
                        actionStyle = "#20a0ff";
                        text = "添加";
                        break;
                    case "delete" :
                        actionStyle = '#f00';
                        text = "删除";
                        break;
                    case "update" :
                        actionStyle = '#449d44';
                        text = "更新";
                        break;
                    default:
                        actionStyle = '#333';
                        text = "";
                }

                list+= `<li><i class="fa fa-info-circle" style="color: #449d44;"></i>&nbsp;<span style="color:${actionStyle}">${text}</span>${item.desc}</li>`;

            })
        }else{
            list =  `<li style="text-align: center;color:#666">暂无数据</li>`
        }
    }


    layerModal = layer.open({
        type: 1,
        title: '详细信息',
        offset: '100px',
        area: '600px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<div class="product_log_contanier">
                     <ul>${list}</ul>
                 </div>`,
        success: function(layero,index){

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}


//设计bom tree
function getDesignBomTree(id,version) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomTree+"?"+_token+'&bom_material_id='+id+'&version='+version+'&bom_item_qty_level=1&replace=1',
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                createRealBom(rsp.results,function(bomHtml){
                    $('.materialInfo_tree .bom-tree').html(bomHtml);
                },'noedit');
            }
        },
        fail: function(rsp){
            console.log('获取物料清单树失败');
        }
    },this);
}

//获取物料信息
function getMaterialInfoData(id,flag,version) {

    AjaxClient.get({
        url: URLS['bomList'].materialInfo+"?"+_token+"&material_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                showMaterialModal(rsp.results,flag,version)
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    })
}

//物料详情属性tab
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

//物料详情属性tab 项
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

//生成图纸列表
function createPicList(picData){
    var items=[];
    if(picData.length){
        picData.forEach(function(item){
            var item=`<div class="pic_item">
                 <div class="pic_img">
                    <img width="370" height="170" src="/storage/${item.image_path}" alt="">
                 </div>
                 <div class="pic_text"><span>${item.code}</span></div>
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
                  <td><p title="${item.comment}">${item.comment!=null&&item.comment!=''?(item.comment.length>11?item.comment.substring(0,9)+'...':item.comment):''}</p></td>
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

function showMaterialModal(data,flag,version) {
    if(data != null){
        var attrData = {
            material_attributes: data.material_attributes,
            operation_attributes: data.operation_attributes
        }
    }else{
        return
    }

    layerModal = layer.open({
        type:1,
        title: `物料${data.item_no}详细信息`,
        offset: '100px',
        area: ['900px','444px'],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`
            <div class="bom-wrap-container" id="materialModal">
                <div class="bom-wrap">
                    <div class="bom-tap-wrap">
                        <span data-item="materialBasicInfo_from" class="bom-tap active">基础信息</span>
                        <span data-item="materialAttribute_from" class="bom-tap">属性</span>
                        <span data-item="materialPlan_from" class="bom-tap">计划</span>
                        <span data-item="materialPic_from" class="bom-tap">图纸</span>
                        <span data-item="materialFile_from" class="bom-tap">附件</span>
                        <span data-item="materialDesignBom_from" data-ma-id="${data.material_id}" data-version="${version||0}" class="bom-tap" style="display: ${flag=='top'?'none':''}">设计BOM</span>
                    </div>
                    <div class="bom-panel-wrap" style="padding-top: 10px;">
                         <!--基础信息-->
                         <div class="bom-panel active" id="materialBasicInfo_from">
                              <div class="material_block">
                                   <h3>基本信息</h3>
                                   <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料分类:</label>
                                                    <span>${tansferNull(data.material_category_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">批次号前缀:</label>
                                                    <span>${tansferNull(data.batch_no_prefix)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">名称:</label>
                                                    <span>${tansferNull(data.name)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小订单数量:</label>
                                                    <span>${tansferNull(data.moq)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料编码号:</label>
                                                    <span>${tansferNull(data.item_no)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">描述:</label>
                                                    <p title="${data.description}" style="margin-bottom: 0px;">${tansferNull(data.description)}</p>
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
                                                    <span>${tansferNull(data.unit_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装长度:</label>
                                                    <span>${tansferNull(data.length)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装数量:</label>
                                                    <span>${tansferNull(data.mpq)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装宽度:</label>
                                                    <span>${tansferNull(data.width)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装重量:</label>
                                                    <span>${tansferNull(data.weight)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装高度:</label>
                                                    <span>${tansferNull(data.height)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div>
                         </div>
                         <!--基础信息-->
                         <!--属性-->
                         <div class="bom-panel" id="materialAttribute_from">
                               <div class="material_block">
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料模板:</label>
                                                    <span>${data.template_name==''?'--无--':tansferNull(data.template_name)}</span>
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
                         <!--属性-->
                         <!--计划信息-->
                         <div class="bom-panel" id="materialPlan_from">
                              <div class="material_block">
                                    <h3>计划信息</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料来源:</label>
                                                    <span>${createSource(meterielSource,data.source)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">安全库存:</label>
                                                    <span>${tansferNull(data.safety_stock)}</span>
                                                </div>
                                            </div> 
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">低阶码:</label>
                                                    <span>${tansferNull(data.low_level_code)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">固定提前期:</label>
                                                    <span>${tansferNull(data.fixed_advanced_period)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最高库存:</label>
                                                    <span>${tansferNull(data.max_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">累计提前期:</label>
                                                    <span>${tansferNull(data.cumulative_lead_time)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最低库存:</label>
                                                    <span>${tansferNull(data.min_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                              </div> 
                         </div>
                         <!--计划信息-->
                         <!--图纸-->
                         <div class="bom-panel clearfix" id="materialPic_from">
                              ${createPicList(data.drawings)} 
                         </div>
                         <!--图纸-->
                         <!--附件-->
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
                                        ${createAttachTable(data.attachments)}
                                      </tbody>
                                    </table>
                              </div>
                         </div>
                         <!--附件-->
                         <!--设计bom-->
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
                         <!--设计bom-->
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

//orgchart树形图
function showBomPic(data) {
    $('#orgchart-container').html('');

    var nodeTemplate = function (data) {
      var ability='';
      if(data.operation_ability_pluck){
        var abs=data.operation_ability_pluck;
        for(var type in abs){
          ability+=abs[type]+',';
        }
      }
            return `<div class="title">
                   ${data.item_no}
                </div>
                <div class="content">
                    <p class="name" title="${data.name}"><span style="color: #666;">名称：</span>${data.name.length>6?data.name.substring(0,4)+'...':data.name}</p>
                    <p class="name"><span style="color: #666;">数量：</span>${data.usage_number}${data.commercial!=undefined?'['+data.commercial+']':''}</p>
                    <p class="name"><span style="color: #666;">工序：</span>${tansferNull(data.operation_name)}</p>
                    <p class="name" title="${ability}"><span style="color: #666;">能力：</span>${ability}</p>
                </div>`;
        };
        console.log(JSON.stringify(bomShowData))

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

//获取工艺路线详情
function getProcedureShow(routeid) {
  $('.route_pic-wrap .make_list_all').html('<p style="padding-left: 10px;">暂无数据</p>');
  $('.make_list_line_all').html('');
  AjaxClient.get({
    url: URLS['bomAdd'].procedureShow + '?' +_token+'&id='+routeid,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      bomItemArr=[];
      if(rsp&&rsp.results&&rsp.results.operations&&rsp.results.orderlist){
        var ritem='',
          rdata={
            routing_graph:{
              nodes:[],
              edges:[]
            }
          };
        rsp.results.operations.forEach(function (item,index) {
          var op={},mode='';
          switch (item.type){
            case '0':
              mode='MODE_REQUIRED';
              break;
            case '1':
              mode='MODE_SKIPPABLE';
              break;
            case '2':
              mode='MODE_SELECTABLE';
              break;
            case '3':
              mode='MODE_SKIPPABLE_SELECTABLE';
              break;
          }
          if(index==0){
            op={
              operation: '<none>',
              label: 'root',
              mode: "MODE_REQUIRED"
            };
          }else{
            op={
              operation: item.name,
              operation_id: item.operation_id,
              operation_code: item.operation_code,
              routeid: item.routeid,
              oid: item.oid,
              label: item.order-1,
              mode: mode
            };
            var arr=createNodeInfo(item.oid);
            if(arr.length){
              op.ipractice_id=arr[0].practice_id;
              op.iroutes=arr;
            }
          }
          rdata.routing_graph.nodes.push(op);
        });
        rdata.routing_graph.edges=rsp.results.orderlist;
        // rdata.routing_graph.edges.unshift([0,1]);
        $('#routing_graph_new').html('');
        newroutingGraph = new emi2cRoutingGraph('routing_graph_new', rdata.routing_graph, 700, 300);
        newroutingGraph.calcPositions();
        newroutingGraph.draw();
      }
    },
    fail:function (rsp) {
      layer.close(layerLoading);
      console.log('获取工艺路线详情失败');
    }
  },this);
}

//获取工艺路线列表异步
function getProcedure(fn) {
    AjaxClient.get({
        url: URLS['bomGroup'].procedureGroup + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(rsp);
            routeLine = rsp && rsp.results || [];
            var lis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
            if (routeLine) {
                routeLine.forEach(function (item) {
                    var groupArray=JSON.stringify(item.procedure_route);
                    lis += `<li data-json='${groupArray}' data-id="${item.group_id}" class="el-select-dropdown-item">${item.group_name}</li>`;
                });

            }
            $('.el-form-item.route-line .el-select-dropdown-list-group').html(lis);
            $('body').on('click','.el-select-dropdown-list-group .el-select-dropdown-item',function(e){
                e.stopPropagation();
                if(!$(this).attr('data-json')==''){
                    var routeMsg=JSON.parse($(this).attr('data-json'));
                    var groupId=$(this).attr('data-id');
                    // console.log(routeMsg);
                    var routeLis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
                    routeMsg.forEach(function(val,i){
                        routeLis += `<li data-id="${val.id}" data-groupId="${groupId}" class="el-select-dropdown-item">${val.name}</li>`;
                    })
                    $('.el-form-item.route-line .el-select-dropdown-list-route').html(routeLis);
                }else{
                    $('.el-form-item.route-line .el-select-dropdown-list-route').html('<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>');
                }
                $('.el-form-item.route-line .el-select-dropdown-list-route li:first-child').click();
            })

            fn && typeof fn == 'function' ? fn() : null;
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工艺路线列表失败');
        }
    }, this);
}

//生成每一个节点info
function createNodeInfo(nodeid) {
  var arr=[];
  if(routeid==$('#route_id').val().trim()){
    arr=filternodes(routenodes,nodeid);
  }
  return arr;
}

function filternodes(dataArr,nodeid) {
  return dataArr.filter(function (e) {
    return e.routing_node_id==nodeid;
  });
}
function createStpe(step,index,ele) {
  var abs='',abwrap='无';
  if(opabs.length){
      opabs.forEach(function (abitem) {
          // if(abitem.workcenters!=[]){
          //     abitem.workcenters.forEach(function(witem){
          //         workcenter_name+=`<li data-wcid="${witem.workcenter_id}" data-wcname="${witem.workcenter_name}">${witem.workcenter_name}</li>`
          //     })
          // }
          abs += `<li data-id="${abitem.id}" data-name="${abitem.ability_name}" class="el-select-dropdown-item route-ability-item" style="height:auto;">
                       <span class="el-checkbox_input route-ab-check" data-checkid="${abitem.id}" data-checkname="${abitem.ability_name}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label show_description" data-desc="${abitem.ability_description}">${abitem.ability_name}</span>
                       </span>
                    </li>`;
          // workcenter_name='';
      });
    abwrap=`<div class="el-form-item ma-ability_wrap">
                <p class="abs-name"></p>
                            <div class="el-form-item-div" style="display: none;">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" value="">
                                    </div>
                                    <div class="el-select-dropdown ability" style="display: none;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong route-ability-item" data-name="--请选择--">--请选择--</li>
                                            ${abs}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>`;
  }
  var steps=`<tr data-name="${step.name}" data-code="${step.code}" data-step-id="${step.field_id}_${index+1}" class="step-tr" data-index="${index+1}" data-field-id="${step.field_id}">
                <td class="index-column">${index+1}</td>
                <td>
                  <p>${step.name}</p>
                  <p>(${step.code})</p>
                  <p class="check-group">
                      <span class="el-checkbox_input s-e-check start" data-step-id="${step.field_id}_${index+1}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">开始</span>
                      </span>
                      <span class="el-checkbox_input s-e-check end" data-step-id="${step.field_id}_${index+1}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">结束</span>
                      </span>
                  </p>
                </td>
                <td>${abwrap}</td>
                <td><div class="workcenters_list"></div></td>
                <td>设备1</td>
                <td>
                  <div class="mode-wrap">
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">一进料一流转品</span>
                      </span>
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">一进料多流转品</span>
                      </span>
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">多进料一流转品</span>
                      </span>
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">多进料多流转品</span>
                      </span>
                  </div>
                </td>
                <td>
                    <div class="route_item">
                        <div class="select_route">
                            <table class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th>物料</th>
                                    <th>数量</th>
                                    <th>类型</th>
                                     <th>描述</th>
                                </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
                <td><div class="img-wrap"></div><div class="img-add"></div></td>
                <td><div class="basic-text">${step.description||''}</div></td>
                <td><textarea readonly class="el-textarea ma-textarea" cols="30" rows="10"></textarea></td>
                <td><div class="attch-wrap"></div></td>
            </tr>`;
  ele.append(steps);
  step.index=index+1;
  step.unique_id=step.field_id+'_'+step.index;
  ele.find('.step-tr:last-child').data('step',step);
}
//获取bom工艺路线(√)
function getBomRoute(rid) {
  routenodes=[];
  AjaxClient.get({
    url: URLS['bomAdd'].bomRoute + '?' +_token+'&bom_id='+bomid+'&routing_id='+rid,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      if(rsp&&rsp.results&&rsp.results.length){
        routenodes=rsp.results;
      }
      getProcedureShow(rid);
    },
    fail:function (rsp) {
      layer.close(layerLoading);
      console.log('获取bom工艺路线失败');
    }
  },this);
}
function getBomRouteLine() {
  AjaxClient.get({
    url: URLS['bomAdd'].getBomRoute + '?' +_token+'&bom_id='+bomid,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      //工艺路线
      var span='',rlis='',group_name='';
      if(rsp&&rsp.results&&rsp.results.length){
        rsp.results.forEach(function (rlitem) {
            group_name = `${rlitem.group_name}`;
          rlis+=`<li data-id="${rlitem.routing_id}" class="el-select-dropdown-item">${rlitem.name}</li>`
          span+=`<span data-route-id="${rlitem.routing_id}" data-name="${rlitem.name}" class="el-tag route-tag">${rlitem.name}</span>`;
        });
      }
      $('#route_group_name').val(group_name);
      $('#addRoute_form .route-lists').html(span);
      $('.el-form-item.route-line .el-select-dropdown-list').html(rlis);
      setTimeout(function () {
        $('#addRoute_form .route-lists').find('.route-tag').length&&$('#addRoute_form .route-lists').find('.route-tag').eq(0).click();
      },20);
    },
    fail:function (rsp) {
      layer.close(layerLoading);
      console.log('获取bom工艺路线集合失败');
    }
  },this);
}

//获取图纸详情
function getImgInfo(id){
  AjaxClient.get({
    url: URLS['bomAdd'].imgshow+"?"+_token+"&drawing_id="+id,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.results){
        imgDeModal(rsp.results,1);
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取图纸详情失败');
    }
  },this);
}
var transformStyle = {
  rotate:"rotate(0deg)",
  scale:"scale(1)",
};
function zoomPcIMG() {
  $("body").css("overflow-y", "hidden");
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

function imgDeModal(data,flag){
  transformStyle = {
    rotate:"rotate(0deg)",
    scale:"scale(1)",
  };
  var {image_orgin_name='',name='',category_name='',group_name='',comment='',attributes=[]}={};
  if(data){
    ({image_orgin_name='',name='',category_name='',group_name='',comment='',attributes=[]}=data)
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
                        <div class="el-tap-img-wrap">
                            <span data-item="image_form" class="el-tap active">图纸</span>
                            <span data-item="basic_form" class="el-tap">属性信息</span> 
                        </div>  
                        <div class="el-panel-img-wrap" style="padding-top: 10px;">
                            <div class="el-img-panel image_form active" id="image_form">
                                <div class="pic-detail-wrap" style="width: ${mwidth};height: ${nheight-130}px"></div>
                                <div class="action">
                                    <i class="el-icon fa-search-plus"></i>
                                    <i class="el-icon fa-search-minus"></i>
                                    <i class="el-icon fa-rotate-right"></i>
                                </div>
                            </div>
                            <div class="el-img-panel" id="basic_form">
                                <div class="imginfo">
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

function getPreview(rnid) {
  var rid=$('#route_id').val();
  AjaxClient.get({
    url: URLS['bomAdd'].preview+"?"+_token+"&bom_id="+bomid+"&routing_id="+rid+"&routing_node_id="+rnid,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.results&&rsp.results.length){
        createPreview(rsp.results);
      }else{
        //暂无数据
          var con= `<div class="no_data_center">暂无数据</div>`;
          $('.preview-wrap-container .el-preview-panel').html(con);
      }
      // console.log(rsp);
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取工序预览失败');
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
        ma_attr+=`<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.commercial?'['+aitem.commercial+']':''}</td></tr>`
      });
      ma_attr_container=`<table>${ma_attr}</table>`
    }else{
      ma_attr=`<span>暂无数据</span>`;
      ma_attr_container=`<div style="color:#999;margin-top: 20px;">${ma_attr}</div>`
    }
    str+=`<div class="route_preview_material ${bgColor}">
              <div class="pre_code">${mitem.material_code}(${mitem.material_name})</div>
              <div class="pre_attr">${ma_attr_container}</div>
              <div class="pre_unit"><span>${mitem.use_num}</span><p>${mitem.commercial}</p></div>
          </div>`;
  });
  return str;
}
function createPreview(data) {
  var stepBlocks='',in_flag='';
  data.forEach(function (item) {
    var stepItems='';
    // console.log(item);
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
          var name_desc = '',work_center='';
          if (sitem.abilitys&&sitem.abilitys.length){
              sitem.abilitys.forEach(function (descitem,sindex) {
                  name_desc += `<table width="400" style="background: #f0f0f0; text-align: left; margin: 5px 0;">
                      <tr style="height: auto">
                        <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">能力&nbsp;</td>
                        <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${descitem.ability_name}</td>
                      </tr>
                      ${descitem.description!=null&&descitem.description!=''?`<tr style="height: auto">
                        <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;能力描述&nbsp;</td>
                        <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
                          ${descitem.description}
                        </td>
                      </tr>`:''}
                </table>`;
              });
          }else{
              name_desc = '';
          }
          var work_arr = sitem.workcenters;
          // 工作中心
          if (work_arr) {
              work_arr.forEach(function (witem,windex) {
                  work_center += `<table width="200" style="background: #f0f0f0; text-align: left; margin: 5px;">
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">${windex + 1}.编码&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${witem.code}</td>
                          </tr>
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;名称&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
                              ${witem.name}
                            </td>
                          </tr>
                        </table>`;
              });

          } else {
              work_center = '';
          }
        stepItems+=`<tr>
                   <td>${sindex+1>9? sindex+1: `0${sindex+1}`}</td>
                   <td>${sitem.name}</td>
                   <td align="left" style="width: 260px;">${name_desc}</td>
                   <td>${work_center}</td>
                   <td class="pre_material ma_in">${s_material_in}</td>
                   <td class="pre_material ma_out">${s_material_out}</td>
                   <td class="pre_bgcolor imgs">${s_draw.join(',')}</td>
                   <td class="pre_bgcolor desc">${sitem.description?sitem.description:''}</td>
                   <td class="pre_bgcolor desc">${sitem.comment}</td>
                 </tr>`
      })
    }
    var step_draw='';
    if(item.drawings&&item.drawings.length){
      item.drawings.forEach(function (ditem) {
        step_draw+=`<div class="preview_draw_wrap" data-url="${ditem.image_path}">
                 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
                 <p>${ditem.code}</p>
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
                              <th>能力</th>
                              <th>工作中心</th>
                              <th>进料</th>
                              <th>出料</th>
                              <th>图纸</th>
                              <th>标准工艺</th>
                              <th>特殊工艺</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${stepItems}
                          <tr><td colspan="8"><div class="draw_content clearfix">${step_draw}</div></td></tr>
                        </tbody>
                    </table>
                    <div class="img_expand_pre"></div>
                 </div>`
  });
  if(stepBlocks){
    $('.preview-wrap-container .el-preview-panel').html(stepBlocks);
  }else{
    $('.preview-wrap-container .el-preview-panel').html('');
  }
}

function previewModal(data){
  var wwidth=$(window).width()-80,
    wheight=$(window).height()-80,
    mwidth=wwidth+'px',
    mheight=wheight+'px';
  var taps='';
  if(newroutingGraph!=null){
    newroutingGraph.routingGraph.nodes.forEach(function (nitem) {
      if(nitem.operation!='<none>'&&nitem.operation!='开始'){
        taps+=`<span data-opid="${nitem.operation_id}" data-item="${nitem.oid}" class="el-tap">${nitem.operation}</span>`;
      }
    });
  }
  layerModal = layer.open({
    type: 1,
    title: '工艺文件预览',
    offset: '40px',
    area: [mwidth,mheight],
    shade: 0.1,
    shadeClose: true,
    resize: false,
    move: false,
    content:`<div class="preview-wrap-container">
                <button id="renderPDF">下载PDF</button>
                    <div class="preview-wrap">
                        <div class="el-tap-preview-wrap">
                            ${taps}
                        </div>  
                        <div id="doc_list" class="el-panel-preview-wrap" style="padding: 10px;min-height: 500px;">
                            <div class="el-preview-panel active">
                            </div>
                        </div>
                    </div>
                </div>`,
    success: function(){
      if($('.el-tap-preview-wrap .el-tap').length){
        $('.el-tap-preview-wrap .el-tap').eq(0).click();
      }
    },
    end: function(){
    }
  })
}