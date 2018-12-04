var id,layerLoading,
    bomShowData = {},
    topMaterial = {},
    itemData = [],
    go=true,
    productId,
    productPageNo = 1,
    productPageSize = 10;

var labelId = ['code','name','bom_group_name','qty','loss_rate','description','version','version_description'];


$(function () {

    $('.el-tap-wrap').addClass('edit');

        id=getQueryString('id');
        if(id!=undefined){
            getBomView(id);
        }else{
            layer.msg('url链接缺少id参数，请给到id参数', {icon: 5
                ,offset: '250px'});
        }

    bindEvent();
})

function getBomView(id) {
    AjaxClient.get({
        url: URLS['bomProduct'].productShow+'?'+_token+"&manufacture_bom_id="+id,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                showBomView(rsp.results)
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

function showBomView(data) {
    var objData = JSON.parse(data.bom_tree)

    bomShowData = JSON.parse(data.bom_tree);
    topMaterial = JSON.parse(data.bom_tree);
    //常规页面
    var parentForm = $('#viewBom');
    $('#viewBomCommon #material_id').val(bomShowData.name).data("topMaterial",topMaterial).
    siblings('label').addClass('mater-active').siblings('.choose-material').hide();
    labelId.forEach(function (item,index) {
        parentForm.find('#'+item).val(data[item]);
    });
    itemData = [];
    if(objData.children && objData.children.length){
        objData.children.forEach(function (item) {
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
}

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
                  <td><a download="${item.filename}" href="/storage/${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a></td>             
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
                  <td><p class="show-material" data-version="${maxVersion}" data-assembly="${item.is_assembly>0?'1':'0'}" data-id="${item.material_id}">${item.item_no}</p></td>
                  <td>${item.name}</td>
                  <td><input type="number" step="0.01" value="${item.loss_rate!=undefined?item.loss_rate:'0.00'}" readonly class="el-input bom-ladder-input loss_rate"></td>
                  <td>${item.is_assembly >0 ? '是': '否'}</td>
                  <td>${item.version == 0 ? '' : item.version}</td>
                  <td><input type="number" step="0.01" value="${item.usage_number!=undefined?item.usage_number:''}" readonly class="bom-ladder-input usage_number"></td>
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
                 <div class="tree-folder-name"><p class="bom-tree-item top-item item-name ${flag}" data-pid="0" data-post-id="${treeData.material_id}">${treeData.name}</p></div></div></div>
                 <div class="tree-folder-content">
                   ${bomItem}
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

function treeList(data,pid,flag) {
    var bomTree = '';

    if(flag == 'realBom' || flag == 'noedit'){
        data.children.forEach(function (item) {
            var replaceStr='',replaceCss='';
            if(item.replaces!=undefined&&item.replaces.length){
              replaceStr='<span>替</span>';
              replaceCss='replace-item';
            }

            if(item.children && item.children.length){

                bomTree += `<div class="tree-folder" data-id="${item.material_id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name"><p class="item-name bom-tree-item ${flag} ${replaceCss}" data-pid="${item.ppid}" data-post-id="${item.material_id}">${replaceStr}${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(item, 0,flag)}
                   </div>
                </div> `;

            }else{
                bomTree += `<div class="tree-item" data-id="${item.material_id}">
                <div class="flex-item">
                <i class="item-dot expand-icon"></i>
                <div class="tree-item-name"><p class="item-name bom-tree-item ${flag} ${replaceCss}" data-pid="${item.ppid}" data-post-id="${item.material_id}">${replaceStr}${item.name}</p></div></div>  
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
            <td>${item.item_no}</td>
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

function bindEvent() {
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
            if($(this).attr('data-assembly')==1){
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
        var viewurl=$('#bom_view').val()+'?id='+id;

        window.open(viewurl);
    })

    $('body').on('click','.product_main_table .bom-info-button.view',function (e) {

        var id = $(this).attr('data-id');
        var viewurl=$('#product_bom_view').val()+'?id='+id;
        window.open(viewurl);

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
                                                    <p class="des" title="${data.description}">${tansferNull(data.description)}</p>
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
                                                    <label class="el-form-item-label">最小包装数量</label>
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
            return `<div class="title">
                   ${data.item_no}
                </div>
                <div class="content">
                    <p class="name" title="${data.name}"><span style="color: #666;">名称：</span>${data.name.length>6?data.name.substring(0,4)+'...':data.name}</p>
                    <p class="name"><span style="color: #666;">数量：</span>${data.usage_number}${data.commercial!=undefined?'['+data.commercial+']':''}</p>
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