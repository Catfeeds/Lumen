var complaint_id,laydate;
$(function(){
    complaint_id=getQueryString('id');
    bindEvent();
    showAllComplaint(complaint_id);
    laydate.render({
        elem: '#received_date',
        done: function (value, date, endDate) {

        }
    });
    laydate.render({
        elem: '#samples_received_date',
        done: function (value, date, endDate) {

        }
    });

    laydate.render({
        elem: '#next_shipment_schedule_time',
        done: function (value, date, endDate) {

        }
    });
});
function showAllComplaint(id) {
    AjaxClient.get({
        url: URLS['complaint'].viewAllComplaint+"?"+_token+"&id="+complaint_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp);
            $('#customer_name').val(rsp.results.base[0].customer_name);
            $('#complaint_code').val(rsp.results.base[0].complaint_code);
            $('#po_number').val(rsp.results.base[0].production_number).data('inputItem',{id:rsp.results.base[0].po_id,name:rsp.results.base[0].production_number}).blur();
            if(rsp.results.base[0].type==1){
                $('#number_type').attr("checked",'true');
                $('#material_toggle').toggle();
                $('#po_toggle').toggle();
                $('#material_number').val(rsp.results.base[0].material_name).data('inputItem',{id:rsp.results.base[0].material_id,name:rsp.results.base[0].material_name}).blur();
            }
            $('#received_date').val(rsp.results.base[0].received_date.substr(0,10));
            $('#samples_received_date').val(rsp.results.base[0].samples_received_date.substr(0,10));
            $('#defect_description').val(rsp.results.base[0].defect_description);
            $('#defect_material_batch').val(rsp.results.base[0].defect_material_batch);
            $('#defect_material_rejection_num').val(rsp.results.base[0].defect_material_rejection_num);
            $('#defect_rate').val(rsp.results.base[0].defect_rate);
            if(rsp.results.base[0].type==1){
                $('#material_number').autocomplete({
                    url: URLS['complaint'].dimMaterial+"?"+_token
                });

            }else {
                $('#po_number').autocomplete({
                    url: URLS['complaint'].dimPonumber+"?"+_token
                });
            };
            if(rsp.results.D3.length){
                $('#customer_stock_num').val(rsp.results.D3[0].customer_stock_num);
                $('#customer_stock_quality').val(rsp.results.D3[0].customer_stock_quality);
                $('#customer_stock_time').val(rsp.results.D3[0].customer_stock_time);
                $('#next_shipment_schedule_num').val(rsp.results.D3[0].next_shipment_schedule_num);
                $('#next_shipment_schedule_time').val(rsp.results.D3[0].next_shipment_schedule_time.substr(0,10));
                $('#pay_for_other').val(rsp.results.D3[0].pay_for_other);
                $('#pay_for_rejected').val(rsp.results.D3[0].pay_for_rejected);
                $('#pay_for_travel').val(rsp.results.D3[0].pay_for_travel);
                $('#stock_num').val(rsp.results.D3[0].stock_num);
                $('#stock_quality').val(rsp.results.D3[0].stock_quality);
                $('#wip_num').val(rsp.results.D3[0].wip_num);
                $('#wip_quality').val(rsp.results.D3[0].wip_quality);
                $('#require').val(rsp.results.D3[0].require);
                $('#plan_id').val(rsp.results.D3[0].id);
                if(rsp.results.D3[0].customer_stock==1){
                    $('.customer_stock').toggle();
                    $('#customer_stock').attr("checked",'true');
                }
                if(rsp.results.D3[0].next_shipment_schedule_flag==1){
                    $('#next_shipment_schedule_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].stock==1){
                    $('.stock').toggle();
                    $('#stock').attr("checked",'true');
                }
                if(rsp.results.D3[0].stock_flag==1){
                    $('#stock_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].wip==1){
                    $('.wip').toggle();
                    $('#wip').attr("checked",'true');
                }
                if(rsp.results.D3[0].wip_flag==1){
                    $('#wip_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].exist_require==1){
                    $('.require_toggle').toggle();
                    $('#exist_require').attr("checked",'true');
                }
                if(rsp.results.D3[0].rejected_handle==1){
                    $('#rejected_handle').parent().find('.el-input').val('退回公司返工');
                }
                if(rsp.results.D3[0].rejected_handle==2){
                    $('#rejected_handle').parent().find('.el-input').val('客户本地报废');
                }
                if(rsp.results.D3[0].rejected_handle==3){
                    $('#rejected_handle').parent().find('.el-input').val('委托客户处理');
                }
                if(rsp.results.D3[0].rejected_handle==4){
                    $('#rejected_handle').parent().find('.el-input').val('由公司报废');
                }
                if(rsp.results.D3[0].rejected_effect==1){
                    $('#rejected_effect').parent().find('.el-input').val('客户丢失');
                }
                if(rsp.results.D3[0].rejected_effect==2){
                    $('#rejected_effect').parent().find('.el-input').val('客户订单比例转移');
                }
                if(rsp.results.D3[0].rejected_effect==3){
                    $('#rejected_effect').parent().find('.el-input').val('客户抱怨');
                }
                if(rsp.results.D3[0].rejected_effect==4){
                    $('#rejected_effect').parent().find('.el-input').val('客户满意度下降');
                }
            }



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
function updateBasic(data) {
    AjaxClient.post({
        url: URLS['complaint'].updatebasic,
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
function updatePlan(data) {
    AjaxClient.post({
        url: URLS['complaint'].updatePlan,
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
function bindEvent() {
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
    //basic提交
    $('body').on('click','.basic_save',function (e) {
        e.stopPropagation();
        var customer_name = $('#customer_name').val().trim(),
            complaint_code = $('#complaint_code').val().trim(),
            type = $('#number_type').is(':checked')?1:0,
            received_date = $('#received_date').val().trim(),
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
        updateBasic({
            id:complaint_id,
            customer_name:customer_name,
            complaint_code:complaint_code,
            type:type,
            po_id:po_number?po_number:'',
            material_id:material?material:'',
            received_date:received_date,
            samples_received_date:samples_received_date,
            defect_rate:defect_rate,
            defect_material_batch:defect_material_batch,
            defect_material_rejection_num:defect_material_rejection_num,
            defect_description:defect_description,
            _token:TOKEN
        });

    });
    //material提交
    $('body').on('click','.material_save',function (e) {
        e.stopPropagation();
    })
    //plan提交
    $('body').on('click','.plan_save',function (e) {
        e.stopPropagation();
        var stock = $('#stock').is(':checked')?1:0,
            plan_id = $('#plan_id').val().trim(),
            stock_num = $('#stock_num').val().trim(),
            stock_quality = $('#stock_quality').val().trim(),
            stock_flag = $('#stock_flag').is(':checked')?1:0,
            wip = $('#wip').is(':checked')?1:0,
            wip_num = $('#wip_num').val().trim(),
            wip_quality = $('#wip_quality').val().trim(),
            wip_flag = $('#wip_flag').is(':checked')?1:0,
            exist_require = $('#exist_require').is(':checked')?1:0,
            require = $('#require').val().trim(),
            customer_stock = $('#customer_stock').is(':checked')?1:0,
            customer_stock_num = $('#customer_stock_num').val().trim(),
            customer_stock_quality = $('#customer_stock_quality').val().trim(),
            rejected_handle = $('#rejected_handle').val().trim(),
            customer_stock_time = $('#customer_stock_time').val().trim(),
            plan_date = $('#next_shipment_schedule_time').val().trim(),
            next_shipment_schedule_num = $('#next_shipment_schedule_num').val().trim(),
            rejected_effect = $('#rejected_effect').val().trim(),
            pay_for_rejected = $('#pay_for_rejected').val().trim(),
            pay_for_travel = $('#pay_for_travel').val().trim(),
            pay_for_other = $('#pay_for_other').val().trim(),
            next_shipment_schedule_flag = $('#next_shipment_schedule_flag').is(':checked')?1:0;
        if(plan_id){
            updatePlan({
                id:plan_id,
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
                rejected_effect:rejected_effect,
                exist_require:exist_require,
                require:require,
                pay_for_rejected:pay_for_rejected,
                pay_for_travel:pay_for_travel,
                pay_for_other:pay_for_other,
                _token:TOKEN
            });
        }else {
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
        }

    })
}
