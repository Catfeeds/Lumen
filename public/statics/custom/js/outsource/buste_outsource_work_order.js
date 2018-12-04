var in_flag=1,out_flag=1,id=0,type='',production_id=0,sub_id=0,scrollTop=0,picking_id=0,operation_order_code='',routing_node_id;
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    if(type=='add'){
        getBusteOutsourceForm(id);
        getOldBusteOutsourceForm(id);
    }
    $('#work_order_form').focus();
    $('#start_time').val(getCurrentDateZore);
    $('#end_time').val(getCurrentTime);
    $('#start_time_input').text(getCurrentDateZore);
    $('#end_time_input').text(getCurrentTime);
    bindEvent();

});



function getOldBusteOutsourceForm(id) {
    AjaxClient.get({
        url: URLS['outsource'].getDeclareByPr+"?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.dropdown-menu').html('');
            rsp.results.forEach(function (item) {
                var _li = `<li class="${item.status==2?'disabled':''} creatReturn" data-id="${item.id}" style="cursor: pointer;"><a>${item.code}</a></li>`
                $('.dropdown-menu').append(_li);
                $('.dropdown-menu').find('li:last-child').data("liData", item);
            });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('fail','获取历史报工单失败，请刷新重试')
        }
    }, this)
}
function getBusteOutsourceForm(id) {
    AjaxClient.get({
        url: URLS['outsource'].getFlowItems+"?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);

            production_id = rsp.results.production_id;
            routing_node_id = rsp.results.routing_node_id;
            operation_order_code = rsp.results.operation_order_code;
            sub_id = rsp.results.sub_id;
            picking_id = rsp.results.picking_id;
            getWorkcenter(rsp.results.work_center_id);
            showInItem(rsp.results.in_list);
            showOutItem(rsp.results.out_list);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','获取报工单详情失败，请刷新重试')
        }
    }, this)
}

function getWorkcenter(id) {
    AjaxClient.get({
        url: URLS['outsource'].workcenter+"?"+_token+"&workcenter_id="+id,
        dataType: 'json',
        success:function (rsp) {
            var workCenterHtml=''
            rsp.results.forEach(function (item) {
                if(item.code =='ZPP001' || item.code=='ZPP002'){
                }else {
                    workCenterHtml+= `<div class="work_center_item" data-id="${item.param_item_id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
                }            });
            $('#show_workcenter').html(workCenterHtml);
            $('#show_workcenter').show();
        },
        fail: function(rsp){
            console.log('获取工作中心作业量失败！');
        }
    });
}
function bindEvent() {
    $("body").on('blur','.consume_num',function (e) {
        e.stopPropagation();
        $(this).parent().parent().find('.difference_num').val($(this).val()-$(this).parent().parent().find('.qty').text());

    });
    $('body').on('click','.submit',function (e) {
        e.stopPropagation();
        if(type=='add'){
            addBuste();
        }
    });
    $(window).scroll(function() {
        scrollTop = $(document).scrollTop();
        $('.line_depot,.depot').each(function (k,v) {
            var that = $(v);
            var width=$(v).width();
            var offset=$(v).offset();
            $(v).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
        })
    });

    $('body').on('click','.creatReturn:not(.disabled)',function (e) {
        e.stopPropagation();
        var id  = $(this).attr('data-id')
        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id);
        });

    });

    $('body').on('click','.line_depot,.depot',function (e) {
        e.stopPropagation();
        var that = $(this);
        var width=$(this).width();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
    });
    $('body').on('click','.table_tbody .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
        start_time = laydate.render({
            elem: '#start_time_input',
            max: max,
            format:'yyyy-MM-dd HH:mm:ss',
            type: 'time',
            show: true,
            closeStop: '#start_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('#end_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
        end_time = laydate.render({
            elem: '#end_time_input',
            min: min,
            format:'yyyy-MM-dd HH:mm:ss',
            max: getCurrentDate(),
            type: 'time',
            show: true,
            closeStop: '#end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });


}
function submint(thisid) {
    AjaxClient.get({
        url: URLS['outsource'].submitBuste +"?"+ _token + "&id=" + thisid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','推送成功！');
                getOldBusteOutsourceForm(id);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
function getCurrentDateZore() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 00:00:00';
}
function getCurrentTime() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate(),
        _h = curDate.getHours(),
        _m = curDate.getMinutes(),
        _s = curDate.getSeconds();
    return _year + '-' + _month + '-' + _day +' ' + _h +':' + _m +':' + _s;
}


function addBuste() {
    var in_materials=[],out_materials=[];
    $('#show_in_material .table_tbody tr').each(function (k,v) {
        in_materials.push({
            id:'',
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            GMNGA:$(v).find('.consume_num').val(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            material_spec:'',
            qty:$(v).find('.qty').text(),
            expend:$(v).find('.expend').text(),
            line_depot_id:'',
            line_depot_code:'',
            MKPF_BKTXT:$(v).find('.MKPF_BKTXT').val(),
            MSEG_ERFMG:$(v).find('.difference_num').val(),
            is_spec_stock:'',
        })
    });
    $('#show_out_material .table_tbody tr').each(function (k,v) {
        out_materials.push({
            id:'',
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            line_depot_id:$(v).attr('data-line')?$(v).attr('data-line'):'',
            line_depot_code:$(v).attr('data-line_code')?$(v).attr('data-line_code'):'',
            GMNGA:$(v).find('.consume_num').val(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            material_spec:'',
            qty:$(v).find('.qty').text(),
            MKPF_BKTXT:'',
            MSEG_ERFMG:'',
            is_spec_stock:'',
        })
    });
    var workCenter = $('#show_workcenter .work_center_item');
    var workCenterArr=[];
    workCenter.each(function (k,v) {
        workCenterArr.push({
            id:'',
            standard_item_id:$(v).attr('data-id'),
            standard_item_code:$(v).attr('data-code'),
            value:$(v).find('.workValue').val()?$(v).find('.workValue').val():'',
        })
    });


    var data = {
        production_id:production_id,
        operation_order_code:operation_order_code,
        routing_node_id:routing_node_id,
        sub_id:sub_id,
        start_time: $('#start_time').val(),
        end_time: $('#end_time').val(),
        picking_id:picking_id,
        picking_line_id:id,
        in_materials:JSON.stringify(in_materials),
        out_materials:JSON.stringify(out_materials),
        stands:JSON.stringify(workCenterArr),
        _token:TOKEN
    };
    AjaxClient.post({
        url: URLS['outsource'].WorkDeclareOrder,
        data:data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.submit').hide();
            getOldBusteOutsourceForm(id);
            LayerConfig('success','保存成功！');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','保存失败！错误日志为：'+rsp.message);

        }
    }, this)
}

//出料
function showOutItem(data) {
    var ele = $('#show_out_material .table_tbody');
    ele.html("");
    data.forEach(function (item, index) {
        var tr = `
	<tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-line="${item.line_depot_id}" data-line_code="${item.line_depot_code}">
	<td>${tansferNull(item.material_code)}</td>
	<td>${tansferNull(item.material_name)}</td>
	<td class="qty">${tansferNull(item.rated)}</td>
	<td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
	<td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
	<td  class="firm" style="padding: 3px;">
        <div class="el-select-dropdown-wrap">
                <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库"  style="line-height:20px;width: 100px;font-size: 10px;">
        </div>
    </td>
    <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
	</tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);

        // if(item.depot_name){
        //     $('#line_depot'+out_flag).val(item.depot_name+'（'+item.line_depot_code+'）').data('inputItem',{id:item.line_depot_id,depot_name:item.depot_name,code:item.line_depot_code}).blur();
        // }
        // $('#line_depot'+out_flag).autocomplete({
        //     url: URLS['outsource'].storageSelete+"?"+_token+"&is_line_depot=1",
        //     param:'depot_name',
        //     showCode:'depot_name'
        // });
        // out_flag++;
    })
}



//进料
function showInItem(data) {
    var ele = $('#show_in_material .table_tbody');
    ele.html("");
    data.forEach(function (item, index) {
        var tr = `
	<tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
	<td>${tansferNull(item.material_code)}</td>
	<td>${tansferNull(item.material_name)}</td>
	<td class="qty">${tansferNull(item.rated)}</td>
	<td class="expend">${tansferNull(item.expend)}</td>
	<td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
	<td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
	
	<td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
	<td  class="firm" style="padding: 3px;"><textarea name="" id="" class="MKPF_BKTXT" cols="20" rows="3"></textarea></td>
	<td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
	</tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);

        $('#depot'+in_flag).autocomplete({
            url: URLS['outsource'].storageSelete+"?"+_token+"&is_line_depot=1",
            param:'depot_name',
            showCode:'depot_name'
        });
        in_flag++;

    })

}
