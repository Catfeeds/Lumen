var layerModal,layerLoading,route_id;
$(function () {
    var url=window.location.pathname.split('/');
    if(url.indexOf('procedureDetail')>-1){
        route_id=getQueryString('id');
        route_id!=undefined?getRouteInfo(route_id):LayerConfig('fail','url链接缺少id参数，请给到id参数');
    }
    bindEvent();
});


function getRouteInfo(id) {
    AjaxClient.get({
        url: URLS['route'].show+"?"+_token+'&id='+id,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                var data = rsp.results;
                if(data.routeInfo.length){
                    showBasicInfo(data.routeInfo[0])
                }
                if(data.operations.length){
                    $('.route_wrap').html('');
                    showRouteTap($('.route_wrap'),data.operations);
                    showRouteLine(data);
                }
            }
        },
        fail: function(rsp){
            console.log('获取详细信息失败');
        }
    },this);
}
function showBasicInfo(data) {
    var ele = ['code','name','description'];
    for(var i in ele){
        $('#route_basic_form').find('#'+ele[i]).val(data[ele[i]]);
        $('#route_basic_form #name').attr('readonly','readonly');
        $('#route_basic_form #code').attr('readonly','readonly');
    }
}
function showRouteTap(ele,data) {
    data.forEach(function (item,index) {
        if(index != 0){
            var next_node = '',mode='';
            if(item.children.length){
                item.children.forEach(function (citem,cindex) {
                    next_node += ` <li data-oid="${citem.oid}" data-order="${citem.order}">
                        ${citem.order-1}-${citem.name}
                     </li>`;
                })
            }
            switch(item.type){
                case "0":
                    mode='必选';
                    break;
                case "1":
                    mode='可跳过';
                    break;
                case "2":
                    mode='可选择';
                    break;
                case "3":
                    mode='跳过并可选';
                    break;
                default:
                    mode=''
            }
            var _html = `<div class="route_item" data-index="${item.order}">
            <div class="title">
                <span class="name">${item.order-1}-${item.name}</span>
            </div>
            <div class="select_route">
               <div class="route_proce">
                    <h6>工序</h6>
                    <div class="proce_list">
                       <ul class="proce_list_ul">
                           <li data-oid="${item.oid}" data-name="${item.name}">${item.name} [${mode}]</li>
                        </ul>
                    </div>
               </div>
               <div class="next_node">
                    <h6>下一节点</h6>
                    <div class="next_list">
                        <ul class="next_list_ul">
                            ${next_node}
                        </ul>
                    </div>
               </div>
            </div>
        </div>`;
            ele.append(_html);
        }

    })
}
function showRouteLine(data, width, height) {
    $('#routing_graph').html('');
    var nodes_value = getNodesValue(data.operations);
    var edges_value=data.orderlist;
    var rou_data = {
        "routing_graph":{
            "nodes":nodes_value,"edges":edges_value
        },
        "success":1
    };
    // console.log(rou_data);
    
    width = width?width:900;
    height = height?height:500;
    var routingGraph = new emi2cRoutingGraph('routing_graph', rou_data.routing_graph, width, height);
    routingGraph.calcPositions();
    routingGraph.draw();
}
function getNodesValue(data) {
    var arr = [];
    // arr.push({
    //     operation:"<none>",
    //     mode:"MODE_REQUIRED",
    //     label:"root"
    // })
    // console.log(data);
    if(data.length){
        data.forEach(function (item) {

            if(item.operation){
                arr.push({
                    id:'',
                    operation:"<none>",
                    mode:'MODE_REQUIRED',
                    label:'root'
                })
            }else{
                switch(item.type){
                    case "0":
                        mode="MODE_REQUIRED";
                        break;
                    case "1":
                        mode='MODE_SKIPPABLE';
                        break;
                    case "2":
                        mode='MODE_SELECTABLE';
                        break;
                    case "3":
                        mode='MODE_SKIPPABLE_SELECTABLE';
                        break;
                    default:
                        mode='MODE_REQUIRED'
                }

                var obj = {
                    id:item.operation_id,
                    operation:item.name,
                    mode:mode,
                    label:item.order-1,
                };
                arr.push(obj);
                obj={};
            }

        })
    }
    return arr;
}
function addNextNode(data) {
    console.log(data)
    AjaxClient.post({
        url: URLS['route'].updateNextNode,
        data:data,
        dataType:'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getRouteInfo(route_id);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }

        }
    },this)
}
function addProcedure(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['route'].storeNode,
        data:data,
        dataType:'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getRouteInfo(route_id);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }

        }
    },this)
}
function deleteRouteNode(data) {
    AjaxClient.post({
        url: URLS['route'].deleteNode,
        dataType: 'json',
        data:data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getRouteInfo(route_id);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
        }
    },this);
}
function bindEvent() {
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    //弹窗关闭
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    //下拉框点击事件
    $('body').on('click','.el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }

        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var form=$(this).attr('data-item');
            $('.'+form).addClass('active').siblings('.el-panel').removeClass('active');
        }
    });

    $('body').on('click','.route_item_add span',function (e) {
        showSelectProcedureModal();
    //     var ele = `<div class="route_item" data-index="">
    //     <div class="title">
    //         <span class="name">索引</span>
    //         <span class="item_delete" data-index=""><i class="fa fa-minus-square"></i></span>
    //     </div>
    //     <div class="select_route">
    //        <div class="route_proce">
    //             <h5>工序 <span class="route_procedure_add" data-index=""><i class="fa fa-plus-square"></i></span></h5>
    //             <div class="proce_list">
    //                <ul class="proce_list_ul">
    //
    //                 </ul>
    //             </div>
    //        </div>
    //        <div class="next_node">
    //             <h5>下一节点 <span class="next_node_add" data-index=""><i class="fa fa-plus-square"></i></span></h5>
    //             <div class="next_list">
    //                 <ul class="next_list_ul">
    //
    //                 </ul>
    //             </div>
    //        </div>
    //     </div>
    // </div>`;
    //         $('.route_wrap').append(ele);
    //     var _len = $('.route_item');
    //     $(_len).each(function (k,v) {
    //         $(v).find('.title .name').html(`索引${k}`);
    //         $(v).attr('data-index',k);
    //         $(v).find('.route_procedure_add').attr('data-index',k);
    //         $(v).find('.item_delete').attr('data-index',k);
    //         $(v).find('.next_node_add').attr('data-index',k);
    //     })

    });

    $('body').on('click','.route_item .item_delete',function (e) {
       var rid = $(this).attr('data-rid'),
           oid = $(this).attr('data-oid');
        deleteRouteNode({
            route_id:rid,
            operation_id:oid,
            _token:TOKEN
        })
    });
    // $('body').on('click','.route_procedure_add',function (e) {
    //     var _index= $(this).attr('data-index');
    //     showSelectProcedureModal(_index);
    // });
    $('body').on('click','.next_node_add',function (e) {
        var next_list = $(this).parents('.next_node').find('.next_list_ul li'),
            current_oid = $(this).parents('.route_item').find('.proce_list_ul li').attr('data-oid'),
            next_node = $(this).parents('.route_item').nextAll(),listArr=[],nodeArr=[];

        $(next_list).each(function (k,v) {
            listArr.push($(v).attr('data-order'))
        });
        $(next_node).each(function (k,v) {
            for(var i in listArr){
                if($(v).find('.proce_list_ul li').length&&listArr[i]!= $(v).attr('data-index')){
                    nodeArr.push({
                        oid:$(v).find('.proce_list_ul li').attr('data-oid'),
                        name:$(v).find('.proce_list_ul li').attr('data-name')
                    })
                }
            }
        });
       showNextNodeModal(nodeArr,current_oid);
    });
    $('body').on('click','.next_node_delete',function (e) {

        var parentForm = $(this).parents('.route_item'),
            current_oid = parentForm.find('.proce_list_ul li').attr('data-oid'),
            next_oid = $(this).parents('li').attr('data-oid');

        // console.log(current_oid,next_oid)
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            // $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            // deleteRoute(id);
            console.log(current_oid,next_oid)
            addNextNode({
                route_id:route_id,
                current_oid:current_oid,
                next_oid:next_oid,
                _token:TOKEN
            });
            layer.close(index);
        });
    })
    $('body').on('click','.submit',function () {
        if($(this).hasClass('procedure')){//选择工序

            var parentForm = $('#procedure_form');
            var operation_id = parentForm.find('#procedure_id').val(),
                type = parentForm.find('#module_id').val();
            addProcedure({
                route_id:route_id,
                operation_id:operation_id,
                type:type,
                _token:TOKEN
            })

        }else if($(this).hasClass('next_node')){
            var parentForm = $('#node_form'),
                c_id=parentForm.find('#itemId').val(),
                n_id=parentForm.find('#next_node').val();

            addNextNode({
                route_id:route_id,
                current_oid:c_id,
                next_oid:n_id,
                _token:TOKEN
            })
        }

        // layer.close(layerModal);
    })
}

function showSelectProcedureModal() {
    var labelWidth=100,btnShow='';
    layerModal = layer.open({
        type: 1,
        title: '路线设置',
        offset: '100px',
        area: '350px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="formModal" id="procedure_form">
                    <input type="hidden" id="itemId" value="">
                <div class="el-form-item procedure">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">工序<span class="mustItem">*</span></label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="procedure_id" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list">
                                    <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block"></p>
                </div>
                <div class="el-form-item module">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">模式<span class="mustItem">*</span></label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="module_id" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list">
                                    <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                    <li data-id="0" class="el-select-dropdown-item" data-name="Required">Required</li>
                                    <li data-id="1" class="el-select-dropdown-item" data-name="Skippable">Skippable</li>
                                    <li data-id="2" class="el-select-dropdown-item" data-name="Selectable">Selectable</li>
                                    <li data-id="3" class="el-select-dropdown-item" data-name="Skippable and Selectable">Skippable and selectable</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block"></p>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <!--<button type="button" class="el-button cancle">取消</button>-->
                        <button type="button" class="el-button el-button--primary submit procedure">确定</button>
                    </div>
                </div>
        </form>`,
        success: function(layero,index){
            layerEle=layero;
            getLayerSelectPosition($(layerEle));
            getAllProcedure();
        },
    })
}
function getAllProcedure(val) {
    AjaxClient.get({
        url: URLS['route'].procedure+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.list.length){
                var lis='',innerhtml='';

                rsp.results.list.forEach(function(item){
                    lis+=`<li data-id="${item.id}" data-name="${item.name}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });

                innerhtml=`
                        <li data-id="" data-name="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.procedure').find('.el-select-dropdown-list').html(innerhtml);

                if(val){

                    $('.el-form-item.procedure').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    },this);
}

function showNextNodeModal(nodeData,c_id) {
    var labelWidth=100,btnShow='';

    layerModal = layer.open({
        type: 1,
        title: '选择下一节点',
        offset: '100px',
        area: '350px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="formModal" id="node_form">
                    <input type="hidden" id="itemId" value="${c_id}">
                <div class="el-form-item next_node">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">节点<span class="mustItem">*</span></label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="next_node" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list">
                                    <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block"></p>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <!--<button type="button" class="el-button cancle">取消</button>-->
                        <button type="button" class="el-button el-button--primary submit next_node">确定</button>
                    </div>
                </div>
        </form>`,
        success: function(layero,index){
            layerEle=layero;
            getLayerSelectPosition($(layerEle));
            if(nodeData.length){
                var lis='',innerhtml='';
                nodeData.forEach(function (item) {
                    lis+=`<li data-id="${item.oid}" data-name="${item.name}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" data-name="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.next_node').find('.el-select-dropdown-list').html(innerhtml);

            }
        },
    })
}
