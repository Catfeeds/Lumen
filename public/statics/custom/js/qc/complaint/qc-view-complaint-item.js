var complaint_id;
$(function(){
    complaint_id=getQueryString('id');
    bindEvent();
    showAllComplaint(complaint_id);
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
            $('#customer_name').val(rsp.results.base[0].customer_name);
            $('#complaint_code').val(rsp.results.base[0].complaint_code);
            $('#po_number').val(rsp.results.base[0].production_number);
            if(rsp.results.base[0].type==1){
                $('#number_type').attr("checked",'true');
                $('#material_number').val(rsp.results.base[0].material_name);
                $('#material_toggle').toggle();
                $('#po_toggle').toggle();
            }
            $('#received_date').val(rsp.results.base[0].received_date);
            $('#samples_received_date').val(rsp.results.base[0].samples_received_date);
            $('#defect_description').val(rsp.results.base[0].defect_description);
            $('#defect_material_batch').val(rsp.results.base[0].defect_material_batch);
            $('#defect_material_rejection_num').val(rsp.results.base[0].defect_material_rejection_num);
            $('#defect_rate').val(rsp.results.base[0].defect_rate);
            if(rsp.results.D3.length){
                $('#customer_stock_num').val(rsp.results.D3[0].customer_stock_num);
                $('#customer_stock_quality').val(rsp.results.D3[0].customer_stock_quality);
                $('#customer_stock_time').val(rsp.results.D3[0].customer_stock_time);
                $('#next_shipment_schedule_num').val(rsp.results.D3[0].next_shipment_schedule_num);
                $('#next_shipment_schedule_time').val(rsp.results.D3[0].next_shipment_schedule_time);
                $('#pay_for_other').val(rsp.results.D3[0].pay_for_other);
                $('#pay_for_rejected').val(rsp.results.D3[0].pay_for_rejected);
                $('#pay_for_travel').val(rsp.results.D3[0].pay_for_travel);
                $('#stock_num').val(rsp.results.D3[0].stock_num);
                $('#stock_quality').val(rsp.results.D3[0].stock_quality);
                $('#wip_num').val(rsp.results.D3[0].wip_num);
                $('#wip_quality').val(rsp.results.D3[0].wip_quality);
                if(rsp.results.D3[0].customer_stock==1){
                    $('#customer_stock').attr("checked",'true');
                }
                if(rsp.results.D3[0].next_shipment_schedule_flag==1){
                    $('#next_shipment_schedule_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].stock==1){
                    $('#stock').attr("checked",'true');
                }
                if(rsp.results.D3[0].stock_flag==1){
                    $('#stock_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].wip==1){
                    $('#wip').attr("checked",'true');
                }
                if(rsp.results.D3[0].wip_flag==1){
                    $('#wip_flag').attr("checked",'true');
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

function bindEvent() {
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
}
