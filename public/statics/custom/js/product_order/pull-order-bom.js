var item_no,saveFlag=false;
$(function(){
    item_no=getQueryString('item_no');

    getBOM();
    bindEvent();


});


//获取列表
function getBOM(){
    var urlLeft='';
    urlLeft+="&item_no="+item_no;
    AjaxClient.get({
        url: "http://58.221.197.202:30087/Probom/showBomTree?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var parent_id=rsp.results[0].parent_id;
                $('.bom-tree').html(treeList(rsp.results,parent_id));
                $('.bom-tree').find('p[data-id='+item_no+']').addClass('selected');
                getMaterialLists(item_no);

            }else{
                noData('暂无数据',3);
            }


        },
        fail: function(rsp){
            layer.close(layerLoading);
        },
        complete: function(){
        }
    },this);
};
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
                   <div class="tree-folder-name"><p class="item-name"  data-id="${item.subitem_code}">${item.subitem_code}</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id)}
                   </div>
                </div> `;
        }else{
            bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name"  data-id="${item.subitem_code}">${item.subitem_code}</p></div></div>  
                </div>`;
        }
    });
    return bomTree;
};
function getMaterialLists(code) {

    var urlLeft='';
    urlLeft+="&item_no="+code;
    AjaxClient.get({
        url: "http://58.221.197.202:30087/Proinv/showInv?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp.results)
            if(rsp.results&&rsp.results.length){
                $("#item_no").val(rsp.results[0].item_no)
                $("#name").val(rsp.results[0].name)
                $("#procurement_lead_time").val(rsp.results[0].procurement_lead_time)
                $("#min_procurement_cycle").val(rsp.results[0].min_procurement_cycle)
                $("#description").val(rsp.results[0].流水描述)
                $("#item_no").val(rsp.results[0].item_no)
                $("#item_no").val(rsp.results[0].item_no)
            }else {
                $("#item_no").val('')
                $("#name").val('')
                $("#procurement_lead_time").val('')
                $("#min_procurement_cycle").val('')
                $("#description").val('')

            }

            // if(rsp.results&&rsp.results.length){
            //     var parent_id=rsp.results[0].parent_id;
            //     console.log(rsp.results);
            //     $('.bom-tree').html(treeList(rsp.results,parent_id));
            // }else{
            //     noData('暂无数据',3);
            // }


        },
        fail: function(rsp){
            layer.close(layerLoading);
        },
        complete: function(){
        }
    },this);
}


function bindEvent() {
    $('body').on('click','.table_tbody .view',function (e) {
        e.stopPropagation();
        var item_no = $(this).attr('data-id');
        getBOM(item_no);
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
        var selectedId=$(this).attr('data-id');
        if(!$(this).hasClass('selected')){
            parele.find('.item-name').removeClass('selected');
            $(this).addClass('selected');
            getMaterialLists(selectedId);
        }
    });
}