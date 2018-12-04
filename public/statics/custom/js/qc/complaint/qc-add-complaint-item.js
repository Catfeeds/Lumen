var complaint_id,
    codeCorrect=!1,
    validatorToolBox={
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1): (codeCorrect=1,!0);
        }

    },
    remoteValidatorToolbox={
        remoteCheckCode: function(name){
            var value=$('#'+name).val().trim();
            getUnique(name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    codeCorrect=1;
                }
            });
        },
    },
    validatorConfig = {
        complaint_code: "checkCode",
    },remoteValidatorConfig={
        complaint_code: "remoteCheckCode"
    };
//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addDeviceList_form').find('.submit').removeClass('is-disabled');
}
//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';

        urlLeft=`&field=${field}&value=${value}`;

    var xhr=AjaxClient.get({
        url: URLS['complaint'].unique+"?"+_token+urlLeft,
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
$(function(){
    bindEvent();
    laydate.render({
        elem: '#NNC_received_date',
        done: function (value, date, endDate) {

        }
    });
    laydate.render({
        elem: '#samples_received_date',
        done: function (value, date, endDate) {

        }
    });
    laydate.render({
        elem: '#time_maintain_production',
        done: function (value, date, endDate) {

        }
    });
    laydate.render({
        elem: '#plan_date',
        done: function (value, date, endDate) {

        }
    });
    $('#po_number').autocomplete({
        url: URLS['complaint'].dimPonumber+"?"+_token
    });



});


function bindEvent() {
    //输入框的相关事件
    $('body').on('focus', '#complaint_code', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '#complaint_code', function () {
        var flag = $('#addDeviceList_form').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
    });
    //tap切换按钮
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){

        if(!$(this).hasClass('active')){
            if($(this).hasClass('el-ma-tap')){//替代物料相互切换
                $(this).addClass('active').siblings('.el-tap').removeClass('active');

            }else{
                var formerForm=$(this).siblings('.el-tap.active').attr('data-item');
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var form=$(this).attr('data-item');
                $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');

            }
        }
    });
    //上一步按钮
    $('body').on('click','.el-button.prev',function(){
        var prevPanel=$(this).attr('data-prev');

        $(this).parents('.el-panel').removeClass('active').siblings('.'+prevPanel).addClass('active');
        $('.el-tap[data-item='+prevPanel+']').addClass('active').siblings().removeClass('active');

    });
    //下一步按钮
    $('body').on('click','.el-button.next:not(.is-disabled)',function(){
        var nextPanel=$(this).attr('data-next');
        $(this).parents('.el-panel').removeClass('active').siblings('.'+nextPanel).addClass('active');
        $('.el-tap[data-item='+nextPanel+']').addClass('active').siblings().removeClass('active');

    });


    //弹窗下拉
    $('body').on('click','.addPlan_form .el-select',function(e){
        e.stopPropagation();
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.addPlan_form .el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.val_id').attr('data-code',$(this).attr('data-code'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

    $('body').on('click','#number_type',function () {
        var number_type =  $('#number_type').is(':checked')?1:0;

        if(number_type==1){
            $('#material_number').autocomplete({
                url: URLS['complaint'].dimMaterial+"?"+_token
            });

        }else {
            $('#po_number').autocomplete({
                url: URLS['complaint'].dimPonumber+"?"+_token
            });
        };
        $('#material_toggle').toggle();
        $('#po_toggle').toggle();
    });

    //basic提交
    $('body').on('click','.basic_save',function (e) {
        e.stopPropagation();
        var customer_name = $('#customer_name').val().trim(),
            complaint_code = $('#complaint_code').val().trim(),
            type = $('#number_type').is(':checked')?1:0,

            NNC_received_date = $('#NNC_received_date').val().trim(),
            samples_received_date = $('#samples_received_date').val().trim(),
            defect_rate = $('#defect_rate').val().trim(),
            defect_material_batch = $('#defect_material_batch').val().trim(),
            defect_material_rejection_num = $('#defect_material_rejection_num').val().trim(),
            defect_description = $('#defect_description').val().trim();
            if(type==0){
                var $itemPo=$('#po_number');
                var po_number=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
                    $itemPo.data('inputItem').name==$itemPo.val().trim()?$itemPo.data('inputItem').id:'';
            }else {
                var $itemMaterial=$('#material_number');
                var material=$itemMaterial.data('inputItem')==undefined||$itemMaterial.data('inputItem')==''?'':
                    $itemMaterial.data('inputItem').name==$itemMaterial.val().trim()?$itemMaterial.data('inputItem').id:'';

            }
        if(codeCorrect && (po_number || material)){
                submitBasic({
                    customer_name:customer_name,
                    complaint_code:complaint_code,
                    type:type,
                    po_id:po_number?po_number:'',
                    material_id:material?material:'',
                    received_date:NNC_received_date,
                    samples_received_date:samples_received_date,
                    defect_rate:defect_rate,
                    defect_material_batch:defect_material_batch,
                    defect_material_rejection_num:defect_material_rejection_num,
                    defect_description:defect_description,
                    _token:TOKEN
                });
            }else {
                if(!(po_number || material)){
                    layer.confirm('生产单或物料填写不正确！', {icon: 3, title:'提示',offset: '250px',end:function(){
                    }}, function(index){
                        layer.close(index);

                    });
                }

            }


    })
    $('#stock').on('click',function (e) {
        e.stopPropagation();
        $('.stock').toggle();
    });
    $('#wip').on('click',function (e) {
        e.stopPropagation();
        $('.wip').toggle();
    });
    $('#customer_stock').on('click',function (e) {
        e.stopPropagation();
        $('.customer_stock').toggle();
    });
    $('#exist_require').on('click',function (e) {
        e.stopPropagation();
        $('.require_toggle').toggle();
    });
    //material提交
    $('body').on('click','.material_save',function (e) {
        e.stopPropagation();
    })
    //plan提交
    $('body').on('click','.plan_save',function (e) {
        e.stopPropagation();
        var stock = $('#stock').is(':checked')?1:0,
            stock_num = $('#stock_num').val().trim(),
            stock_quality = $('#stock_quality').val().trim(),
            stock_flag = $('#stock_flag').is(':checked')?1:0,
            wip = $('#wip').is(':checked')?1:0,
            wip_num = $('#wip_num').val().trim(),
            wip_quality = $('#wip_quality').val().trim(),
            wip_flag = $('#wip_flag').is(':checked')?1:0,
            customer_stock = $('#customer_stock').is(':checked')?1:0,
            exist_require = $('#exist_require').is(':checked')?1:0,
            require = $('#require').val().trim(),
            customer_stock_num = $('#customer_stock_num').val().trim(),
            customer_stock_quality = $('#customer_stock_quality').val().trim(),
            rejected_handle = $('#rejected_handle').val().trim(),
            customer_stock_time = $('#customer_stock_time').val().trim(),
            plan_date = $('#plan_date').val().trim(),
            next_shipment_schedule_num = $('#next_shipment_schedule_num').val().trim(),
            rejected_effect = $('#rejected_effect').val().trim(),
            pay_for_rejected = $('#pay_for_rejected').val().trim(),
            pay_for_travel = $('#pay_for_travel').val().trim(),
            pay_for_other = $('#pay_for_other').val().trim(),
            next_shipment_schedule_flag = $('#next_shipment_schedule_flag').is(':checked')?1:0;
        submitPlan({
            customer_complaint_id:complaint_id,
            stock:stock,
            stock_num:stock_num,
            stock_quality:stock_quality,
            stock_flag:stock_flag,
            wip:wip,
            wip_num:wip_num,
            wip_quality:wip_quality,
            wip_flag:wip_flag,
            customer_stock:customer_stock,
            customer_stock_num:customer_stock_num,
            customer_stock_quality:customer_stock_quality,
            rejected_handle:rejected_handle,
            customer_stock_time:customer_stock_time,
            next_shipment_schedule_time:plan_date,
            next_shipment_schedule_num:next_shipment_schedule_num,
            next_shipment_schedule_flag:next_shipment_schedule_flag,
            exist_require:exist_require,
            require:require,
            rejected_effect:rejected_effect,
            pay_for_rejected:pay_for_rejected,
            pay_for_travel:pay_for_travel,
            pay_for_other:pay_for_other,
            _token:TOKEN
        });
    })
}
function submitBasic(data) {
    AjaxClient.post({
        url: URLS['complaint'].addbasic,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            complaint_id = rsp.results;
            layer.confirm('保存成功！', {icon: 3, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
                $('.submit_plan').each(function (k,v) {
                    $(v).css('visibility','visible');
                })
                $('#submit_plan').css('display','block');

                if(!$('#show_addPlan_form').hasClass('active')){
                    if($('#show_addPlan_form').hasClass('el-ma-tap')){
                        $('#show_addPlan_form').addClass('active').siblings('.el-tap').removeClass('active');

                    }else{
                        var formerForm=$('#show_addPlan_form').siblings('.el-tap.active').attr('data-item');
                        $('#show_addPlan_form').addClass('active').siblings('.el-tap').removeClass('active');
                        var form=$('#show_addPlan_form').attr('data-item');
                        $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');

                    }
                }
            });


        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                if(rsp.field == 'complaint_code'){
                    codeCorrect=!1;
                    showInvalidMessage(rsp.field,'已注册！');

                }
                // LayerConfig('fail',rsp.message);
            }

        },
        complete: function(){

        }
    },this);
}
function submitPlan(data) {
    AjaxClient.post({
        url: URLS['complaint'].addPlan,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('保存成功！', {icon: 3, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

        },
        complete: function(){

        }
    },this);
}

