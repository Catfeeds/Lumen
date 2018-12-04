var layerModal,layerLoading,route_id,practiceData={},
    validatorToolBox={
        checkProcedure: function (name) {
            var value = $('#procedure_form').find('#'+name).val();
            return $('#procedure_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择工序"),!1):(!0);
            console.log($('#procedure_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active'));
        },
        checkMode: function (name) {
            var value = $('#procedure_form').find('#'+name).val();
            return $('#procedure_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择模式"),!1):(!0);
        },
        checkNextNode: function (name) {
            var value = $('#node_form').find('#'+name).val();
            return $('#node_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择节点"),!1):(!0);
        },
      checkName:function (name) {
        var value = $('.basicForm').find('#'+name).val().trim();
        return $('.basicForm').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
          Validate.checkNull(value)?(showNameInvalidMessage(name,"名称不能为空"),!1):(!0);
      }
    },
    validatorConfig = {
        procedure_id: 'checkProcedure',
        module_id: 'checkMode',
        next_node: 'checkNextNode',
        name: 'checkName'
    };
$(function () {
    var url=window.location.pathname.split('/');
    if(url.indexOf('procedureEdit')>-1){
        route_id=getQueryString('id');
        route_id!=undefined?checkHasUse(route_id):LayerConfig('fail','url链接缺少id参数，请给到id参数');
    }

    bindEvent();
});
function showInvalidMessage(name,val){
    $('.formModal').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.formModal').find('.submit').removeClass('is-disabled');
}
function showNameInvalidMessage(name,val) {
  $('.basicForm').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
  $('.basicForm').find('.submit').removeClass('is-disabled');
}
function checkHasUse(id) {
  AjaxClient.get({
    url: URLS['route'].hasUsed+"?route_id="+id+"&"+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      getRouteInfo(id,rsp.results.exist)
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('做法检测失败');
    }
  },this);
}
function getRouteInfo(id,exist) {
    AjaxClient.get({
        url: URLS['route'].show+"?"+_token+'&id='+id,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                var data = rsp.results;
                if(data.routeInfo.length){
                    showBasicInfo(data.routeInfo[0],exist)
                }
                if(data.operations.length){
                    $('.route_wrap').html('');
                    showRouteTap($('.route_wrap'),data.operations,exist);
                    showRouteLine(data,'routing_graph');
                    // practiceData=data;
                }
            }
        },
        fail: function(rsp){
            console.log('获取详细信息失败');
        }
    },this);
}
// 常规信息input只读
function showBasicInfo(data,exist) {
    var ele = ['code','name','description'];
    for(var i in ele){
        $('#route_basic_form').find('#'+ele[i]).val(data[ele[i]]);
        $('#route_basic_form #code').attr('readonly','readonly');
    }
    if(exist&&exist>0){
      $('#route_basic_form #name').attr('readonly','readonly');
      //$('#route_basic_form #description').attr('readonly','readonly');
      //$('#route_basic_form .el-form-item#btnShow').css('display','none');
    };
}
function showRouteTap(ele,data,exist) {
  var display='';
    exist&&exist>0? (display='none',$('.procedure_alert').css('display','block'),$('.route_item_add').css('display','none')):display='';
    data.forEach(function (item,index) {
        if(index != 0){
            var next_node = '',mode='';
            if(item.children.length){
                item.children.forEach(function (citem,cindex) {
                    next_node += ` <li data-oid="${citem.oid}" data-order="${citem.order}">
                         <span class="fa fa-minus-square next_node_delete ${display}"></span> ${citem.order-1}-${citem.name}
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
                <span class="item_delete ${item.order ==1? 'none': ''} ${display}" data-rid="${item.routeid}" data-oid="${item.oid}"><i class="fa fa-trash-o"></i></span>
            </div>
            <div class="select_route">
               <div class="route_proce">
                    <h6>工序 <span class="route_procedure_edit ${item.order ==1? 'none': ''} ${display}" data-order="${item.order}"><i class="fa fa-edit"></i></span></h6>
                    <div class="proce_list">
                       <ul class="proce_list_ul">
                           <li data-oid="${item.oid}" data-name="${item.name}" data-type="${item.type}">${item.name} [${mode}]</li>
                        </ul>
                    </div>
               </div>
               <div class="next_node">
                    <h6>下一节点 <span class="next_node_add ${data.length-1 == index ? 'none': ''} ${display}" data-order="${item.order}"><i class="fa fa-plus-square"></i></span></h6>
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
function showRouteLine(data,flag) {
    var nodes_value = getNodesValue(data.operations);
    var edges_value=data.orderlist;
    var rou_data = {
      "routing_graph":{
        "nodes":nodes_value,"edges":edges_value
      },
      "success":1
    };
    if(flag=='routing_graph'){
      $('#routing_graph').html('');
      var routingGraph = new emi2cRoutingGraph('routing_graph', rou_data.routing_graph, 900, 500);
      routingGraph.calcPositions();
      routingGraph.draw();
    }
}
function getNodesValue(data) {
    var arr = [],mode='';
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

        },
        complete: function(){
            $('#node_form .submit').removeClass('is-disabled');
        }
    },this)
}
function addProcedure(data) {
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
        },
        complete: function(){
            $('#procedure_form .submit').removeClass('is-disabled');
        }
    },this)
}
function editProcedure(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['route'].editProcedure,
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
        },
        complete: function(){
            $('#procedure_form .submit').removeClass('is-disabled');
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

    //
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
        showSelectProcedureModal('add');
    });

    $('body').on('click','.route_item .item_delete',function (e) {
       var rid = $(this).attr('data-rid'),
           oid = $(this).attr('data-oid');
        layer.confirm('执行删除操作,会导致工艺路线损坏', {icon: 3, title:'提示',offset: '250px',end:function(){
            // $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            // deleteRoute(id);
            deleteRouteNode({
                route_id:rid,
                oid:oid,
                _token:TOKEN
            });
            layer.close(index);
        });

    });
    $('body').on('click','.route_procedure_edit',function (e) {
        var order= $(this).attr('data-order'),
            pro_name = $(this).parents('.route_proce').find('.proce_list_ul li').attr('data-name'),
            pro_mode = $(this).parents('.route_proce').find('.proce_list_ul li').attr('data-type');
        showSelectProcedureModal('edit',{order:order,pro_name:pro_name,pro_mode:pro_mode});
    });
    $('body').on('click','.next_node_add',function (e) {

        var next_list = $(this).parents('.next_node').find('.next_list_ul li'),
            current_oid = $(this).parents('.route_item').find('.proce_list_ul li').attr('data-oid'),
            next_node = $(this).parents('.route_item').nextAll(),listArr=[],nodeArr=[];

        $(next_list).each(function (k,v) {
            listArr.push($(v).attr('data-order'));
        });
        $(next_node).each(function (k,v) {
            nodeArr.push({
                index:$(v).attr('data-index'),
                oid:$(v).find('.proce_list_ul li').attr('data-oid'),
                name:$(v).find('.proce_list_ul li').attr('data-name')
            });
        });

        for(var j =0;j<nodeArr.length;j++){
            for(var i=0;i<listArr.length;i++){
                if(nodeArr[j].index == listArr[i]){
                    nodeArr.splice(j,1);
                }
            }
        }
       showNextNodeModal(nodeArr,current_oid);
    });
    $('body').on('click','.next_node_delete',function (e) {

        var parentForm = $(this).parents('.route_item'),
            current_oid = parentForm.find('.proce_list_ul li').attr('data-oid'),
            next_oid = $(this).parents('li').attr('data-oid');
        layer.confirm('执行删除操作,会导致工艺路线损坏', {icon: 3, title:'提示',offset: '250px',end:function(){
            // $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            addNextNode({
                route_id:route_id,
                current_oid:current_oid,
                next_oid:next_oid,
                _token:TOKEN
            });
            layer.close(index);
        });
    });
    $('body').on('click','.submit.saveBasic',function () {
      var correct=1;
      for (var type in validatorConfig) {
        correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
        if(!correct){
          break;
        }
      }
      // var description = $('#route_basic_form').find('#description').val().trim();
      // if(description.length>500){
      //     $('#route_basic_form').find('#description').parents('.el-form-item').find('.errorMessage').css('display','block').text('最多只能输入500个字符');
      //     return false;
      // }else{
      //     $('#route_basic_form').find('#description').parents('.el-form-item').find('.errorMessage').css('display','none');
      // }

      if(correct){
        if (!$(this).hasClass('is-disabled')) {
          $(this).addClass('is-disabled');
          var parentForm=$('#route_basic_form');

          var name=parentForm.find('#name').val().trim(),
              desc=parentForm.find('#description').val();
          editBasic({
            _token:TOKEN,
            id:route_id,
            name:name,
            description:desc
          })
        }
      }
    })
    $('body').on('click','.submit.procedure',function () {
            var _correct=1;
            for (var type in validatorConfig) {
                _correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                if(!_correct){
                    break;
                }
            }
            if(_correct){
                if (!$(this).hasClass('is-disabled')) {
                    $(this).addClass('is-disabled');
                    var _parentForm = $('#procedure_form'),
                        order = _parentForm.attr('data-order');
                    var operation_id = _parentForm.find('#procedure_id').val(),
                        _type = _parentForm.find('#module_id').val();

                    $(this).hasClass('edit') ? editProcedure({
                        route_id:route_id,
                        operation_id:operation_id,
                        order:order,
                        type:_type,
                        _token:TOKEN
                    }) :
                    addProcedure({
                        route_id:route_id,
                        operation_id:operation_id,
                        type:_type,
                        _token:TOKEN
                    })
                }
            }
    });
    $('body').on('click','.submit.next_node',function () {
            var correct=1;
            for (var types in validatorConfig) {
                correct=validatorConfig[types]&&validatorToolBox[validatorConfig[types]](types);
                if(!correct){
                    break;
                }
            }
            if(correct){
                if (!$(this).hasClass('is-disabled')) {
                    $(this).addClass('is-disabled');
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
            }
    });
    $('body').on('focus','.basicForm .el-input:not([readonly])',function(){
      $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.basicForm .el-input:not([readonly])',function(){
      var flag=$('.basicForm').attr("data-flag"),
        name=$(this).attr("id");
      validatorConfig[name]
      && validatorToolBox[validatorConfig[name]]
      && validatorToolBox[validatorConfig[name]](name);
    });
    $('body').on('click','.el-select .el-input-icon',function () {
        var name_gongxu = $('#procedure_form').find('#procedure_id').val();
        var name_moshi = $('#procedure_form').find('#module_id').val();
        name_gongxu!=''&&name_gongxu!=null?'':$('#procedure_id').parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
        name_moshi!=''&&name_moshi!=null?'':$('#module_id').parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
        //$('#procedure_id').parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    });
    //下拉框的相关事件
    $('body').on('focus','.el-select .el-input',function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-select .el-input',function () {
        var name=$(this).siblings('input').attr("id");
        var obj = $(this);
        setTimeout(function(){
            if(obj.siblings('input').val() == '') {
                validatorConfig[name]
                && validatorToolBox[validatorConfig[name]]
                && validatorToolBox[validatorConfig[name]](name);
            }else{
                $('.formModal').find('#'+name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);

    });
    //单选按钮点击事件
    $('body').on('click','.el-radio-input',function(e){
      $(this).parents('.list').find('li .el-radio-input').removeClass('is-radio-checked');
      $(this).addClass('is-radio-checked');
    });
}
function editBasic(data) {
  AjaxClient.post({
    url: URLS['route'].editBasic,
    data:data,
    dataType:'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      LayerConfig('success','编辑成功');
    },
    fail: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.message!=undefined&&rsp.message!=null){
        LayerConfig('fail',rsp.message)
      }
    },
    complete: function(){
      $('#route_basic_form .submit').removeClass('is-disabled');
    }
  },this)
}
function showSelectProcedureModal(flag,data) {
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
        content:`<form class="formModal" id="procedure_form" data-flag="${flag}" data-order="${data ? data.order:''}">
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
                                    <li data-id="0" class="el-select-dropdown-item" data-name="Required">必选</li>
                                    <li data-id="1" class="el-select-dropdown-item" data-name="Skippable">可跳过</li>
                                    <li data-id="2" class="el-select-dropdown-item" data-name="Selectable">可选择</li>
                                    <li data-id="3" class="el-select-dropdown-item" data-name="Skippable and Selectable">跳过并可选</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block"></p>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <!--<button type="button" class="el-button cancle">取消</button>-->
                        <button type="button" class="el-button el-button--primary submit procedure ${flag}">确定</button>
                    </div>
                </div>
        </form>`,
        success: function(layero,index){
            layerEle=layero;
            getLayerSelectPosition($(layerEle));
            getAllProcedure(data);
            if(data){
                $('.el-form-item.module').find('.el-select-dropdown-item[data-id='+data.pro_mode+']').click();
            }
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
                    $('.el-form-item.procedure').find('.el-select-dropdown-item[data-name='+val.pro_name+']').click();
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
                    lis+=`<li data-id="${item.oid}" data-name="${item.name}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.index-1}-${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" data-name="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.next_node').find('.el-select-dropdown-list').html(innerhtml);

            }
        },
    })
}
