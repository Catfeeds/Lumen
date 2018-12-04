
var selectDate = ['start_date','end_date'],
    noEditField = ['material_id','qty','scrap','start_date','end_date','routing_id'],
    pageNo=1,pageSize=6,
    ajaxData={
        order: 'desc',
        sort: 'id'
    },
    submitData={},
    materialCorrect=!1,
    routingCorrect=!1,
    qtyCorrect=!1,
    customerCodeCorrect=!1,
    priorityCorrect=!1,
    itemAddFlag=1,
    scrapCorrect=!1,
    materialCheck={},
    materialData=[],
    productOrderId='',
    validatorToolBox={
        checkMaterial:function (name) {
            var val = $('#'+name).data('materialCheck');

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(materialCorrect=!1,!1):
                val==undefined||val!=undefined&&val.material_id==undefined?(showInvalidMessage(name,"请选择物料"),materialCorrect=!1,!1):
                (materialCorrect=1,!0);
        },
        checkRouting:function(name){
            var value = $('#'+name).val().trim();

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(routingCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"工艺路线不能为空"),routingCorrect=!1,!1):
                    (routingCorrect=1,!0);
        },

        checkQty:function (name) {
            var value = $('#'+name).val().trim();

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(qtyCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"数量不能为空"),qtyCorrect=!1,!1):
                    (qtyCorrect=1,!0);
        },
        checkScrap:function (name) {
            var value = $('#'+name).val().trim();

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(scrapCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"废料不能为空"),scrapCorrect=!1,!1):
                    (scrapCorrect=1,!0);
        },
        checkCustomerCode: function(name){
            var value=$('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"销售订单号不能为空"),codeCorrect=!1,!1):
                !Validate.checkCustomerCode(value)?(showInvalidMessage(name,"编码由1-20位字母数字下划线组成"),codeCorrect=!1,!1):
                    (customerCodeCorrect=1,!0);
        },
        checkNumber: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(qtyCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"优先级不能为空"),qtyCorrect=!1,!1):
                    (priorityCorrect=1,!0);
        },

    },
    remoteValidatorToolbox={
        remoteCheckCustomerCode: function(name,id){
            var value=$('#'+name).val().trim();
            getUnique(name,value,id,function(rsp){
                console.log(rsp.results.exist);
                if(rsp.results&&rsp.results.exist){
                    customerCodeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                    console.log('已注册');
                    // console.log(id)
                }else{
                    customerCodeCorrect=1;
                }
            });
        }
    },
    validatorConfig = {
        material_id:'checkMaterial',
        routing_id:'checkRouting',
        qty:'checkQty',
        scrap:'checkScrap',
        sales_order_code:'checkCustomerCode',
        priority_id:'checkNumber'
    },remoteValidatorConfig={
        sales_order_code: "remoteCheckCustomerCode"
    };
$('body').on('click','ul.el-select-dropdown-list li:not(:first-child)',function(){
    $('#routing_id').parents('.el-form-item').find('.errorMessage').html('');
})
$(function () {
    var url=window.location.pathname.split('/');
    if(url.indexOf('productOrderEdit')>-1){
        productOrderId=getQueryString('id');
        productOrderId!=undefined?getProductOrderInfo(productOrderId):LayerConfig('fail','url链接缺少id参数，请给到id参数');

        $('.tap-btn-wrap .el-tap[data-item=orderPic_from]').removeClass('none');
        $('.tap-btn-wrap .el-tap[data-item=orderFile_from]').removeClass('none');
        $('.tap-btn-wrap .el-tap[data-item=orderInfo_from]').removeClass('none');
        $('.choose-product').hide();
        noEditField.forEach(function (item,index) {
            $('#'+item).attr('readonly','readonly');
        })
    }else{
        getSelectDate(selectDate);
    }
    bindEvent();
})

//检测销售订单号的唯一性
function getUnique(field,value,id,fn){
    var urlLeft='';
    // if(flag==='edit'){
    //     urlLeft=`field=sales_order_code&value=${value}&id=${id}`;
    // }else{
        urlLeft=`field=code&value=${value}`;
    //}
    var xhr=AjaxClient.get({
        url: URLS['customer'].unique+urlLeft+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
            // layer.close(layerLoading);
        }
    },this);
}

//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).show();
    $('#'+name).parents('.el-form-item').find('.info').hide();
    $('.saveBtn').find('.submit.save').removeClass('is-disabled');
}
function resetSubmitData() {
    submitData ={};
    ajaxData={
        order: 'desc',
        sort: 'id'
    };
    var parentForm = $('#orderBasic_from');

    parentForm.find('#qty').val('');
    parentForm.find('#scrap').val('');
    parentForm.find('#start_date').val('');
    parentForm.find('#material_id').val('').data('materialCheck',{}).attr('data-id','');
    parentForm.find('#end_date').val('');
    parentForm.find('#sales_order_code').val('');
    parentForm.find('#priority_id').val('');
    parentForm.find('#remark').val('');
}

function getProductOrderInfo(id) {
    AjaxClient.get({
        url: URLS['order'].orderShow+"?"+_token+'&product_order_id='+id,
        dataType: 'json',
        success: function(rsp){
            console.log(rsp.results)
            if(rsp.results){

                var order = rsp.results.order,bom = rsp.results.bom;

                if(order){
                    showOrderBasicInfo(order);
                }
                if(bom){
                    showProductBomInfo(bom);
                    getBOMGroupData(bom.bom_group_id);
                    var obj = JSON.parse(bom.bom_tree);
                    getProcedureData(obj.item_no);
                }
            }
        },
        fail: function(rsp){

            console.log('获取生产订单详细信息失败');
        }
    },this);
}

function getBOMGroupData(val) {

    AjaxClient.get({
        url: URLS['order'].bomGroupSelect+"?"+_token,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.bom_group_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.bom_group').find('.el-select-dropdown-list').html(innerhtml);
                if(val){
                    $('.el-form-item.bom_group').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            console.log('获取物料清单分组失败');
        }
    },this);
}

function getProcedureData(id) {
    AjaxClient.get({
        url:URLS['order'].workMaterialNo+'?'+_token+'&material_no='+id,
        dataType: 'json',
        success:function (rsp) {
            var ele = $('.operation-wrap .el-select-dropdown');
            ele.html('');

            var data = rsp.results;
            if(data&&data.length){
                var li = '';
                data.forEach(function (item,index) {
                    li+=`<li data-id="${item.operation_id}" data-name="${item.operation_name}" class=" el-select-dropdown-item">${item.operation_name}</li>`;
                });

                ele.html(`<ul class="el-select-dropdown-list">
                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                ${li}
                            </ul>`);
//TODO::
                // if(val){
                //     $('.el-form-item.operation-wrap').find('.el-select-dropdown-item[data-id='+val+']').click();
                // }

            }else{
                ele.html(`<ul class="el-select-dropdown-list">
                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>   
                            </ul>`)
            }
        },
        fail:function (rsp) {
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}

function showOrderBasicInfo(data) {

    var basicForm = $('#orderBasic_from');
    noEditField.forEach(function (item,index) {
        basicForm.find('#'+item).val(data[item]);
    });
    basicForm.find('#material_id').val(data.material_name).attr('data-id',data.product_id);
}

function showProductBomInfo(data) {
    // console.log(data)
    // var objStr=JSON.stringify(data.bom_tree);
    // console.log(data)
    var productBomData=JSON.parse(data.bom_tree);
    console.log(productBomData)
    // bomShowData=JSON.parse(objStr);
    // topMaterial=JSON.parse(objStr);
    var basicForm=$('#orderInfo_from');
    basicForm.find('#code').val(data.code).attr('readonly','readonly');
    basicForm.find('#name').val(data.name);
    basicForm.find('#loss_rate').val(data.loss_rate);
    basicForm.find('#bomQty').val(data.qty);
    basicForm.find('#description').val(data.description);
    basicForm.find('#bom_material_id').val(productBomData.name);

    materialData=[];
    if(productBomData.children&&productBomData.children.length){
        productBomData.children.forEach(function (item) {
            materialData.push(item);
            if(item.replace&&item.replace.length){
                item.replaces.forEach(function(reitem){
                    reitem.replaceItemId=item.material_id;
                    materialData.push(reitem);
                });
            }
        })
    }
    createMaterialItem(materialData);
    //     .data('topMaterial',topMaterial).attr('readonly','readonly').
    // siblings('label').addClass('mater-active').siblings('.choose-material').hide();
    // basicForm.find('.bom-add-new-item').removeClass('is-disabled');
    // basicForm.find('.el-form-item.version').show();
    // basicForm.find('#version').val(data.version);
    // basicForm.find('#version_description').val(data.version_description);
}

function createMaterialItem(data) {
    var ele = $('.bom_table.item_table .t-body');
    ele.html('');
    if(data.length){
        // var editInputFlag = '',
        //     editBtnFlag   = '',
        //     editStyleFlag   = '',
        //     assemblyFlag = '';
        // if(noEditFlag=='edit'){
        //     editInputFlag = 'readonly',editBtnFlag = 'disabled',editStyleFlag='editDisabled',assemblyFlag='noedit'
        // }else{
        //     editInputFlag = '',editBtnFlag = '',editStyleFlag = '',assemblyFlag = '';
        // }

        data.forEach(function (item) {
            var replaceBtn=`<button type="button" data-id="${item.material_id}" id="edit-replace-btn" class="bom-info-button bom-add-item bom-item-replace">替换物料</button>`,
                delBtn=`<button type="button" id="edit-bom-btn" data-id="${item.material_id}" class="bom-info-button bom-info-del bom-item-del bom-del">删除</button>`,
                replacetr='',
                replacetrId='';
            var tr = `
                    <tr class="ma-tritem ${replacetr} ${item.is_assembly>0?'is-version-tr':''}" data-id="${item.material_id}" ${replacetrId}>
                      <td><p class="show-material" data-version="${item.version}" data-has-bom="${item.has_bom>0?'1':'0'}" data-id="${item.material_id}">${item.item_no}</p></td>
                      <td>${item.name}</td>
                      <td><input type="number" step="0.01" value="${item.loss_rate!=undefined?item.loss_rate:'0.00'}" class="el-input bom-ladder-input loss_rate"></td>
                      <td class="assemblyBom">
                          <span class="el-checkbox_input assembly-check ${item.is_assembly!=undefined&&item.is_assembly?'is-checked':''} ${item.has_bom?'':'noedit'}" data-id="${item.material_id}" data-has-bom="${item.has_bom}" data-version="${item.version||0}">
                              <span class="el-checkbox-outset"></span>
                          </span>
                      </td>
                      <td><input type="number" value="${item.usage_number!=undefined?item.usage_number:''}" id="edit-usage-num" class="bom-ladder-input usage_number"></td>
                      <td><textarea class="el-textarea bom-textarea comment" name="" id="" cols="30" rows="3">${item.comment!=undefined?item.comment:''}</textarea></td>
                      <td class="tdright">
                        ${replaceBtn}
                        ${delBtn}
                      </td>
                    </tr>
                    `;
            ele.append(tr);
            ele.find('tr:last-child').data('matableItem',item);
        })
    }else{
        var tr=`<tr>
                <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
            </tr>`;
        ele.append(tr);
    }
}

//获取bom工艺路线集合
function getBomRouteLine(bid) {
  AjaxClient.get({
    url: URLS['order'].getBomRoute + '?' +_token+'&bom_id='+bid,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      console.log(rsp);
      var lis='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
      if(rsp&&rsp.results&&rsp.results.length){
        rsp.results.forEach(function (ritem) {
          lis+=`<li data-id="${ritem.routing_id}" class="el-select-dropdown-item">${ritem.name}</li>`;
        });
      }
      $('.el-form-item.route-line .el-select-dropdown-list').html(lis);
    },
    fail:function (rsp) {
      layer.close(layerLoading);
      console.log('获取bom工艺路线集合失败');
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
            var idval=$(this).attr('data-id');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            $(this).parents('.priority-list').find('.errorMessage').html('');
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    $('body').on('click','.orderBasic_from .choose-product',function () {
          showSelectMaterialModal()
    });
    //搜索按钮物料
    $('body').on('click','.choose-search',function(){
        if($(this).hasClass('choose-material')){
            var parentForm=$('.addBomItem');
            ajaxData={
                item_no: parentForm.find('#item_no').val(),
                name: parentForm.find('#name').val()
            };
            getMaterialList();
        }
    });
    //checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();

        if($(this).hasClass('material-check')){//顶级物料

            $(this).addClass('is-checked').parents('.tritem').siblings('.tritem').find('.el-checkbox_input:not(.noedit)').removeClass('is-checked');
            $('.el-button.el-button--primary.ma-item-ok.submit').removeClass('is-disabled').css('pointer-events','auto');

            if($(this).hasClass('is-checked')){
                materialCheck = $(this).parents('.tritem').data('materItem');
            }
        }else if($(this).hasClass('assembly-check')){//组装
            $(this).toggleClass('is-checked');
            var id=$(this).attr('data-id');
            if($(this).hasClass('is-checked')) {//选择组装
                getBomTree(id,$(this).attr('data-version'));
            }else{
                var ids=getIds(materialData,'material');
                var index=ids.indexOf(Number(id));
                materialData[index].children=[];
                $(this).parents('.ma-tritem').data('matableItem').children=[];
            }
        }

    });

    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var form=$(this).attr('data-item');
            $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
        }
    });

    //添加
    $('body').on('click','.bom-add-item:not(.is-disabled)',function () {
        if($(this).hasClass('choose-material')){
            itemAddFlag=3;
        }else{
            var ele=$('.bom_table.item_table .t-body');
            materialData.forEach(function(item){
                var id=item.material_id,
                    trele=ele.find('.ma-tritem[data-id='+id+']');
                item.loss_rate=trele.find('.loss_rate').val().trim();
                item.usage_number=trele.find('.usage_number').val().trim();
                item.comment=trele.find('.el-textarea').val();
                item.is_assembly=trele.find('.assembly-check.is-checked').length;
            });
            if($(this).hasClass('bom-button')){//添加项
                itemAddFlag=1;
            }else{//添加替换物料
                itemAddFlag=2;
                replaceId=$(this).attr('data-id');
            }
        }
        addBomItemModal();
    });

    $('body').on('click','.ma-item-ok.submit',function () {
        $('#material_id').parents('.el-form-item').find('.errorMessage').html('')
        console.log(materialCheck);
        $('#routing_id').val('').siblings('.el-input').val('--请选择--');
        getBomRouteLine(materialCheck.bom_id);
        $('#material_id').val(materialCheck.name).
        attr('data-id',materialCheck.material_id).data('materialCheck',materialCheck);
        getEcm(materialCheck.material_id);
        layer.close(layerModal);
    });

    //验证物料是否为ECM
    function getEcm(mid){
        AjaxClient.get({
            url: URLS['order'].isEcm+"?"+_token+'&material_id='+mid,
            dataType: 'json',
            success: function(rsp){
                if(rsp.results == true){
                    showInvalidMessage('material_id','不能添加基于ECM BOM的生产订单');
                    $('.el-button.el-button--primary.submit.save').css('pointer-events','none');
                    $('.el-button.el-button--primary.submit.save').css({"background":"#ddd","border-color":"#ddd"});
                }else{
                    showInvalidMessage('material_id','');
                    $('.el-button.el-button--primary.submit.save').css('pointer-events','auto');
                    $('.el-button.el-button--primary.submit.save').css({"background":"#20a0ff","border-color":"#20a0ff"});
                }
            },
            fail: function(rsp){
                console.log('验证ECM失败');
            }
        },this);
    }
    
    $('body').on('click','.saveBtn .submit.save:not(".is-disabled")',function () {
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm = $('#orderBasic_from'),
                id = parentForm.find('#material_id').attr('data-id');
               var startCorrect = !1,endCorrect=!1;

            if($('#start_date').val()==""){
                startCorrect = !1;
                $('#start_date').parents('.el-form-item').find('.errorMessage').addClass('active').html("请选择开始日期").show();
            }else{
                startCorrect=1;
                $('#start_date').parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }

            if($('#end_date').val()==""){
                endCorrect=!1;
                $('#end_date').parents('.el-form-item').find('.errorMessage').addClass('active').html("请选择结束日期").show();
            }else{
                endCorrect=1;
                $('#end_date').parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }

            for (var type in validatorConfig){validatorToolBox[validatorConfig[type]](type,id)}

            var correct=validatorToolBox[validatorConfig['material_id']]('material_id');
            if(correct){
                $('#material_id').parents('.el-form-item').find('.errorMessage').html('');
            }
            if(qtyCorrect&&scrapCorrect&&correct&&startCorrect&&endCorrect&&routingCorrect&&customerCodeCorrect&&priorityCorrect){
                var qty = parentForm.find('#qty').val().trim(),
                    scrap = parentForm.find('#scrap').val().trim(),
                    start_date = parentForm.find('#start_date').val().trim(),
                    end_date = parentForm.find('#end_date').val().trim(),
                    sales_order_code = parentForm.find('#sales_order_code').val().trim(),
                    priority_id = parentForm.find('#priority_id').val().trim(),
                    remark = parentForm.find('#remark').val().trim();

                submitData = {
                    product_id:id,
                    routing_id: $('#routing_id').val(),
                    qty:qty,
                    scrap:scrap,
                    start_date:start_date,
                    end_date:end_date,
                    sales_order_code: sales_order_code,
                    priority: priority_id,
                    remark: remark,
                    _token:TOKEN
                };
                addProductOrder();
            }
        }
    })
    //输入框的相关事件
    $('body').on('focus','.formTemplate:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formTemplate:not(".disabled") .el-input:not([readonly])',function(){
        var name=$(this).attr("id");
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name);
    });
    //输入框的相关事件
    // $('body').on('focus','#sales_order_code.el-input:not([readonly])',function(e){
    //     //e.target.value = e.target.value.replace(/[^\a-\z\A-\Z0-9]/g,'');
    //
    // }).on('blur','#sales_order_code.el-input:not([readonly])',function(){
    //     var name=$(this).attr('id'),
    //         id=$(this).val();
    //     console.log(name);
    //     console.log(id);
    //     remoteValidatorToolbox[remoteValidatorConfig[name]]
    //     && remoteValidatorToolbox[remoteValidatorConfig[name]](name,id);
    // });
}

//获取id
function getIds(data,flag){
    var ids=[];
    data.forEach(function(item){
        ids.push(item.material_id);
    });
    // if(flag=='material'){
    //     data.forEach(function(item){
    //         ids.push(item.material_id);
    //     });
    // }else{
    //     data.forEach(function(item){
    //         ids.push(item.attribute_definition_id);
    //     });
    // }
    return ids;
}
//获取bom树
function getBomTree(id,version) {
    AjaxClient.get({
        url: URLS['order'].bomTree+"?"+_token+'&bom_material_id='+id+'&version='+version+'&bom_item_qty_level=1&replace=1',
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                var ids=getIds(materialData,'material');
                var index=ids.indexOf(Number(id));
                materialData[index].children=rsp.results.children;
                if($('.ma-tritem[data-id='+id+']').length){
                    $('.ma-tritem[data-id='+id+']').data('matableItem').children=rsp.results.children;
                }
            }
        },
        fail: function(rsp){
            console.log('获取失败');
        }
    },this);
}

//选择日期
function getSelectDate(ele) {
    ele.forEach(function (item,index) {
        laydate.render({
            elem: `#${item}`,
            min:minDate(),
            done: function(value, date, endDate){
                console.log(value)
            }
        });
    })
}
function minDate(){
    var now = new Date();
    return now.getFullYear()+"-" + (now.getMonth()+1) + "-" + now.getDate();
}
//选择物料弹窗
function showSelectMaterialModal() {
    var width=33;

    layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '950px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addBomItem formModal" id="">
          <div class="selectMaterial_container">
            <!--<div class="selectMaterial_tree">-->
              <!--<div class="bom_tree_container">-->
                  <!--<div class="bom-tree"></div>-->
              <!--</div>-->
            <!--</div>-->
            <div class="selectMaterial_table">
               <ul class="query-item">
                    <li>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                                <input type="text" id="item_no"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 90px;">名称</label>
                                <input type="text" id="name"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: 10%;">
                            <div class="el-form-item-div btn-group">
                                <button style="margin-top: 5px;" type="button" class="el-button choose-search choose-material">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
               <div class="table-container select_table_margin">
                  <div class="table-container table_page">
                        <div id="pagenation" class="pagenation"></div>
                        <table class="bom_table">
                          <thead>
                            <tr>
                              <th class="thead">选择</th>
                              <th class="thead">物料编码</th>
                              <th class="thead">名称</th>
                              <th class="thead">创建人</th>
                              <th class="thead">物料分类</th>
                            </tr>
                          </thead>
                          <tbody class="table_tbody">
                          </tbody>
                        </table>
                  </div>
               </div>
            </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary ma-item-ok submit is-disabled" style="pointer-events: none">确定</button>
            </div>
          </div>       
    </form>`,
        success: function(layero, index){
            // getCategory();
            getMaterialList();
        },
        cancel: function(layero, index){//右上角关闭按钮
            materialCheck=$('#material_id').data('materialCheck')||{};
        },
        end: function(){

        }

    })
}

//获取物料列表
function getMaterialList(){
    var urlLeft='';
    urlLeft+="&sort=id&order=desc&page_no="+pageNo+"&page_size="+pageSize;

    $('.selectMaterial_table .table-container .table_tbody').html('');

    AjaxClient.get({
        url: URLS['order'].materialList+"?"+_token+urlLeft,
        data:ajaxData,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;

            if(rsp.results&&rsp.results.length){
                createMaterialTable($('.selectMaterial_table .table_tbody'),rsp.results);
            }else{
                var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
                $('.selectMaterial_table .table-container .table_tbody').html(tr);
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
            var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
            $('.selectMaterial_table .table-container .table_tbody').html(tr);
        },
        complete: function(){
            $('#searchMAttr_from .submit').removeClass('is-disabled');
        }
    },this);
}
//生成物料列表
function createMaterialTable(ele,data){

    data.forEach(function(item,index){
        _checkbox=`<span class="el-checkbox_input material-check" data-no="${item.item_no}" data-name="${item.name}">
                    <span class="el-checkbox-outset"></span>
                </span>`;
        var tr=`<tr class="tritem" data-id="${item.material_id}">
                <td>${_checkbox}</td>
                <td>${item.item_no}</td>
                <td>${item.name}</td>
                <td>${item.creator_name}</td>
                <td>${item.material_category_name==null?'':item.material_category_name}</td>             
            </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data('materItem',item);
    });
}
function bindPagenationClick(total,size){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:total,
        showData:size,
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
            getMaterialList();
        }
    });
}

//添加生产订单
function addProductOrder() {

    if(submitData.start_date<=submitData.end_date){
        AjaxClient.post({
            url: URLS['order'].orderAdd,
            data:submitData,
            dataType:'json',
            beforeSend: function(){
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                $('.submit.save').removeClass('is-disabled');
                LayerConfig('success','添加成功',function(){
                    // resetSubmitData()
                    var viewUrl = $('#order_edit').val();
                    window.location.href = viewUrl+'?id='+rsp.results.product_order_id;
                });
            },
            fail: function(rsp){
                layer.close(layerLoading);
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail','该工艺路线'+rsp.message)
                }
                $('body').find('.submit.save').removeClass('is-disabled');

                if(rsp&&rsp.field!==undefined){
                    showInvalidMessage(rsp.field,rsp.message);
                }

            }
        },this)
    }else{
        LayerConfig('fail','开始日期应早于结束日期');
        $('body').find('.submit.save').removeClass('is-disabled');
    }
}

//数量不为小数，废料小数点后最多保留两位验证
$('body').on('input','#qty',function(event){
    event.target.value = event.target.value.replace( /[.]/im,"");
});

$("#scrap").keyup(function(){
    var reg = /^\d+\.?(\d{1,2})?$/;
    while (!reg.test($(this).val()) && $(this).val() != "") {
        $(this).val(checkStr($(this).val()));
    }
});
function checkStr(str) {
    str = str.substring(0,str.length-1);
    return str;
}