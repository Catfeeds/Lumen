var complaint_id;
$(function () {
    complaint_id=getQueryString('id');
    // bindEvent();
    viewComplaintDetails();
});
function viewComplaintDetails() {
    AjaxClient.get({
        url: URLS['complaint'].viewComplaint+"?"+_token+"&customer_complaint_id="+complaint_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp);
            var trueHtml = `<span style="position: relative;bottom: 4px;">有</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check is-check">
                <span class="el-checkbox-outset"></span>
            </span><span style="position: relative;bottom: 4px;">无</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check">
                <span class="el-checkbox-outset"></span>
            </span>`,falseHtml = `<span style="position: relative;bottom: 4px;">有</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check">
                <span class="el-checkbox-outset"></span>
            </span><span style="position: relative;bottom: 4px;">无</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check is-check">
                <span class="el-checkbox-outset"></span>
            </span>`;
            $('#customer_name').text(rsp.results.base[0].customer_name);
            $('#complaint_code').text(rsp.results.base[0].complaint_code);
            $('#received_date').text(rsp.results.base[0].received_date);
            $('#target_respond_date').text(rsp.results.base[0].target_respond_date);
            $('#samples_received_date').text(rsp.results.base[0].samples_received_date);
            $('#actual_respond_date').text(rsp.results.base[0].actual_respond_date);
            if(rsp.results.D3.length){
                rsp.results.D3[0].stock==1?$('#stock').html(trueHtml):$('#stock').html(falseHtml);
                $('#stock_num').text(rsp.results.D3[0].stock_num);
                $('#stock_quality').text(rsp.results.D3[0].stock_quality);
                rsp.results.D3[0].stock_flag==1?$('#stock_flag').html(trueHtml):$('#stock_flag').html(falseHtml);
                rsp.results.D3[0].wip==1?$('#wip').html(trueHtml):$('#wip').html(falseHtml);
                $('#wip_num').text(rsp.results.D3[0].wip_num);
                $('#wip_quality').text(rsp.results.D3[0].wip_quality);
                rsp.results.D3[0].wip_flag==1?$('#wip_flag').html(trueHtml):$('#wip_flag').html(falseHtml);
                rsp.results.D3[0].customer_stock==1?$('#customer_stock').html(trueHtml):$('#customer_stock').html(falseHtml);
                $('#customer_stock_num').text(rsp.results.D3[0].customer_stock_num);
                $('#customer_stock_quality').text(rsp.results.D3[0].customer_stock_quality);
                $('#customer_stock_time').text(rsp.results.D3[0].customer_stock_time);
                $('#next_shipment_schedule_time').text(rsp.results.D3[0].next_shipment_schedule_time);
                $('#next_shipment_schedule_num').text(rsp.results.D3[0].next_shipment_schedule_num);
                rsp.results.D3[0].next_shipment_schedule_flag==1?$('#next_shipment_schedule_flag').html(trueHtml):$('#next_shipment_schedule_flag').html(falseHtml);
                var rejected_handle_html = `<span style="position: relative;bottom: 4px;">退回公司返工</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check ${rsp.results.D3[0].rejected_handle==1?'is-check':''}">
                <span class="el-checkbox-outset"></span>
            </span><span style="position: relative;bottom: 4px;">客户本地报废</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check ${rsp.results.D3[0].rejected_handle==2?'is-check':''}">
                <span class="el-checkbox-outset"></span>
            </span><span style="position: relative;bottom: 4px;">委托客户处理</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check ${rsp.results.D3[0].rejected_handle==3?'is-check':''}">
                <span class="el-checkbox-outset"></span>
            </span><span style="position: relative;bottom: 4px;">由公司报废（不可选择第五项）</span><span class="el-checkbox_input_complaint el-checkbox_input_check material-check ${rsp.results.D3[0].rejected_handle==4?'is-check':''}">
                <span class="el-checkbox-outset"></span>
            </span>`
                $('#rejected_handle').html(rejected_handle_html);
                $('#employee_name').text(rsp.results.D3[0].employee_name);
                $('#status').text(rsp.results.D3[0].status==1?'已完成':'未完成');
                $('#create_time').text(rsp.results.D3[0].create_time);

            }
            var basic = [],
                improve = [],
                overflow = [],
                lesson = [],
                aggin_reason = [];


            if(rsp.results.D4D8.length){
                rsp.results.D4D8.forEach(function (item) {
                    if(item.question_id==1){
                        $('#basicCasue').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        basic.push(item);
                    }
                    if(item.question_id==2){
                        $('#escapedProcess').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        basic.push(item);
                    }
                    if(item.question_id==3){
                        $('#escapedOutgoing').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        // basic.push(item);
                    }
                    if(item.question_id==4){
                        $('#recurrence').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        improve.push(item);
                    }
                    if(item.question_id==5){
                        $('#is_update').append(item.question_value==1?trueHtml:falseHtml);
                        improve.push(item);
                    }
                    if(item.question_id==6){
                        $('#update_date').text(item.question_value);
                        // improve.push(item);
                    }
                    if(item.question_id==7){
                        $('#execute_update').text(item.question_value);
                        // improve.push(item);
                    }
                    if(item.question_id==8){
                        $('#check_result').text(item.question_value);
                        // improve.push(item);
                    }
                    if(item.question_id==9){
                        $('#method').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        // improve.push(item);
                    }
                    if(item.question_id==10){
                        $('#improveDate').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        // improve.push(item);
                    }
                    if(item.question_id==11){
                        $('#follow_number').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        // overflow.push(item);
                    }
                    if(item.question_id==12){
                        $('#follow_method').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        // overflow.push(item);
                    }
                    if(item.question_id==13){
                        $('#follow_effect').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        // overflow.push(item);
                    }
                    if(item.question_id==14){
                        $('#learning').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        lesson.push(item);
                    }
                    if(item.question_id==15){
                        $('#repeat_reason').append(item.question_value?`<p style="margin-left: 20px;">${item.question_value};</p>`:``);
                        aggin_reason.push(item);
                    }
                })
                basic.forEach(function (item) {
                    console.log(item);
                    $('#basic_employee_name').append(`<p>${item.responsible_person_id}</p>`);
                    $('#basic_status').append(`<p>${item.status==2?'已完成':'未完成'}</p>` );
                    $('#basic_create_time').append(`<p>${item.create_time}</p>`);
                });
                improve.forEach(function (item) {
                    $('#improve_employee_name').append(`<p>${item.responsible_person_id}</p>`);
                    $('#improve_status').append(`<p>${item.status==2?'已完成':'未完成'}</p>`);
                    $('#improve_create_time').append(`<p>${item.create_time}</p>`);
                });
                overflow.forEach(function (item) {
                    $('#overflow_employee_name').append(`<p>${item.responsible_person_id}</p>`);
                    $('#overflow_status').append(`<p>${item.status==2?'已完成':'未完成'}</p>`);
                    $('#overflow_create_time').append(`<p>${item.create_time}</p>`);
                });
                lesson.forEach(function (item) {
                    $('#lesson_employee_name').append(`<p>${item.responsible_person_id}</p>`);
                    $('#lesson_status').append(`<p>${item.status==2?'已完成':'未完成'}</p>`);
                    $('#lesson_create_time').append(`<p>${item.create_time}</p>`);
                });
                aggin_reason.forEach(function (item) {
                    $('#repeat_employee_name').append(`<p>${item.responsible_person_id}</p>`);
                    $('#repeat_status').append(`<p>${item.status==2?'已完成':'未完成'}</p>`);
                    $('#repeat_create_time').append(`<p>${item.create_time}</p>`);
                });
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