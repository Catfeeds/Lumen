var layerLoading, layerModal, startTimeCorrect = !1, benchCorrect = !1, equipCorrect = !1, layerEle, pageOrderNo = 1, pageOrderSize = 50, tdHeight = 100, workCenterPlan;

var validatorToolBox = {
    checkWorkBench: function (name) {
        var value = $('#' + name).val().trim();
        return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (benchCorrect = !1, !1) :
            Validate.checkNull(value) ? (showInvalidMessage(name, "*请选择工作台板"), benchCorrect = !1, !1) :
                (benchCorrect = 1);
    },
    checkWorkEquipment: function (name) {
        var value = $('#' + name).val().trim();

        return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (equipCorrect = !1, !1) :
            Validate.checkNull(value) ? (showInvalidMessage(name, "*请选择设备"), equipCorrect = !1, !1) :
                (equipCorrect = 1, !0);
    },
},
    validatorConfig = {
        workBench: "checkWorkBench",
        workEquipment: 'checkWorkEquipment'
    };

//显示错误信息
function showInvalidMessage(name, val) {
    $('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addThinProduction_form').find('.submit').removeClass('is-disabled');
}
$(function () {
    var factory_id = getQueryString('factory_id'),
        //workshop_id = getQueryString('workshop_id'),
        //workcenter_id = getQueryString('workcenter_id'),
        production_no = $('#production_order_no').val(),
        operation_order_no = $('#operation_order_no').val();
    _time = getQueryString('time');
    getLaydate('search_date');
    var currentDate = _getCurrentDate('currentDate');
    if (currentDate != null) {
        getWorkOrdersByDate(currentDate, production_no, operation_order_no);
    }
    initOrderShow();
    // if (workcenter_id != 0 && factory_id != null) {
    //     getFactorySource(workcenter_id);
    // } else {
    //     getFactorySource();
    // }
    // if (workcenter_id != 0 && _time != null && _time != '') {
    //     getcarefulPlan(workcenter_id, _time);
    // }
    // if (_time != null && _time != '') {
    //      $('#search_date').val(_time);
    // }
    bindEvent();
});

//取消工单搜索错误提示
$(function () {
    $('#production_order_no').on('input propertychange', function () {
        $('.searchWo').find('.errorMessage').hide().html('');
    })
})
$(function () {
    $('#operation_order_no').on('input propertychange', function () {
        $('.searchWo').find('.errorMessage').hide().html('');
    })
})

//获取当前排产开始时间
function getcarefulPlanEndTime(wcid, time) {
    var factory_id = $('#factory_id').val(),
        workshop_id = $('#workshop_id').val();
    var wbid = $('#work_bench_id').val();
    var endTime;
    var data = {
        _token: TOKEN,
        work_center_id: wcid,
        factory_id: factory_id,
        //work_shop_id: workshop_id,
        time: time
    };
    AjaxClient.post({
        url: URLS['thinPro'].carefulPlan,
        data: data,
        async: false,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            var data = rsp.results;
            var arrLength = '';
            data.forEach(function (val, i) {
                if (val.work_bench_id == wbid) {
                    var arrLength = val.task_list.length;
                    if (arrLength) {
                        endTime = val[arrLength - 1].plan_end_time
                    }
                }
            })
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    })
    return endTime;
}

//获取已经排产的工单
function getcarefulPlan(wcid, time) {
    var factory_id, work_shop_id;
    var data = {
        _token: TOKEN,
        work_center_id: wcid,
        factory_id: factory_id,
        work_shop_id: work_shop_id,
        time: time
    };
    AjaxClient.post({
        url: URLS['thinPro'].carefulPlan,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            var data = rsp.results;
            var arrLength = '';
            data.forEach(function (val, i) {
                if (arrLength == '') {
                    arrLength = val.task_list.length;
                } else {
                    if (arrLength < val.task_list.length) {
                        arrLength = val.task_list.length;
                    }
                }
            })
            if (arrLength <= 4) {
                tdHeight = 100;
            } else {
                tdHeight = (arrLength - 4) * 25 + 100;
            }
            layer.close(layerLoading);
            var ganttwidth = $('.thinProduction_wrap .thinCalendar').width() - $('.wrap .work-order-wrap').width() - 30;
            $('.gantt-div-wrap,.gantt-div-wrap .GanttWrap').width(ganttwidth);//width(ganttwidth);           
            $('.gantt-div-wrap .GanttWrap').html('');
            if (rsp && rsp.results && rsp.results.length) {
                var ganttChart = function () {
                    $(".GanttWrap").GanttTool({
                        'startDate': time,
                        'ajaxUrl': null,
                        'arrdata': rsp.results,
                        'layer': null,
                        'parameters': {}, //其他参数
                        'fn': null //回调方法
                    });
                };
                ganttChart();
            }
            var theight = $('.GanttTitle').find('tbody').height();
            $('.GanttTaskWrap .GanttTaskDiv').height(theight + 60);
            //激活拖动事件
            $('.GanttTask').drag({
                isLimit: true,
                boundaryElem: '.GanttTaskDiv'
            });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    })
}

//初始化左边栏工单
function initOrderShow(factory_id, operation_id) {
    //设置select默认选中项
    if (factory_id && factory_id != undefined) {
        $('#factory_list').val(factory_id);
    }
    var operaItemList = $("#factory_order .operation_list .operation_item");
    var selected_factory_id = $('#factory_list').find('option:selected').attr('data-id');
    var operaList = $("#factory_order .operation_list");
    for (var i = 0; i < operaList.length; i++) {
        if (factory_id && factory_id != undefined) {
            if (operaList[i].dataset.factoryId != factory_id) {
                operaList[i].style.display = 'none'
            } else {
                operaList[i].style.display = 'block'
            }
        } else {
            if (operaList[i].dataset.factoryId != selected_factory_id) {
                operaList[i].style.display = 'none'
            } else {
                operaList[i].style.display = 'block'
            }
        }
        //根据操作中心显示
        if (operation_id && operation_id != undefined) {
            if (operaItemList[i].dataset.operationId != operation_id) {
                operaItemList[i].children[1].style.display = 'none'
            } else {
                operaItemList[i].children[1].style.display = 'block'
            }
        } else {
            $('.operation_list .order_list').not(':first').hide();
        }
    }
}

$('body').on('change', '#factory_list', function () {
    initOrderShow();
})

$('body').on('click', '.operation_list .operation_title', function () {
    $('.operation_list .order_list').not($(this).next()).hide(500);
    $(this).next().slideToggle(500);
})


//悬浮显示工作中心全称
$('body').on('mouseenter', '.search-submit', function () {
    var msg = $(this).html();
    if (msg != '') {
        desc_show = layer.tips(msg, this,
            {
                tips: [2, '#20A0FF'], time: 0
            });
    }
}).on('mouseleave', '.search-submit', function () {
    layer.close(desc_show);
})

//分拆工单modal
$('body').on('click', '.wo_partition', function () {
    var list = $(this).attr('data-content');
    list = JSON.parse(list);
    layerModal = layer.open({
        type: 1,
        title: '拆单',
        offset: '100px',
        area: '350px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: '.layui-layer-title',
        content: `<form class="splitwo formModal formMateriel" id="splitWO" >
        <div class="modal-wrap" style="max-height: 400px;overflow-y: auto;">
            <div class="woinfo">
                <p><span>工单号：<span class="highlight">${list.number}</span></span></p>
                <p><span>数量[<span>${list.commercial}</span>]:<span class="highlight" id="qtyNum">${list.qty}</span></span></p>
                <p><span>工作中心：<span class="highlight" v-text="woSplitData.operation_name">${list.work_center_name}</span></span><p>
                <input type="hidden" id="work_order_id" value="${list.work_order_id}"/>
                <input type="hidden" id="factory_id" value="${list.factory_id}"/>
                <input type="hidden" id="operation_id" value="${list.operation_id}"/>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <span style="width: 134px;flex: none;">拆出数量[<span>${list.commercial}</span>]：<span class="mustItem">*</span></span>
                    <input type="number" min="1" step="1" id="splitNum" class="el-input" value="" >
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary submit split-submit">确定</button>
            </div>
        </div>   
    </form>`})
})
//获取当天时间的数据
function getWorkOrdersByDate(time, production_no, order_number) {
    AjaxClient.get({
        url: URLS['aps'].getWorkOrdersByDate + '?' + _token + '&work_station_time=' + time + '&production_order_number=' + production_no + '&work_order_number=' + order_number,
        dataType: 'json',
        async: false,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            var _html = $(`<div data-id="" class="thin_order_block thin_work-order-block">                               
                                <select name="factory_list" id="factory_list" class="factory_list" style="width:98%;">
                                </select>
                                <div id="factory_order" style="height:500px;overflow-y:auto;">                            
                                </div>
                            </div>`);
            if (data && data.length) {
                data.forEach(function (item) {
                    ulhtml = _html.find('.factory_list');
                    var _chtml = `<option class="factory_item" value="${item.factory_id}" data-id="${item.factory_id}">${item.factory_name}</option>`;
                    ulhtml.append(_chtml);
                    fohtml = _html.find('#factory_order');
                    var operation_date = item.operations;
                    operation_date.forEach(function (oitem) {
                        var operation_html = $(
                            `<div data-factory-id='${item.factory_id}' class='operation_list'>                            
                                <div class="operation_item" data-operation-id="${oitem.operation_id}" style="position: relative">
                                    <div class="operation_title" style="color:#000;font-size:14px;cursor:pointer;border-bottom:1px solid #ccc;margin:5px 10px 5px 0px;">
                                        <span style="margin-right:6px;color:#333333;font-size:">${oitem.operation_name}
                            
                                        </span>
                                        <span style="position: absolute;right: 10px;color:#666666">    
                                            <i class="glyphicon glyphicon-menu-down"></i>
                                        </span>
                                     </div>
                                    <div class="order_list"><ul></ul></div>
                                </div>
                            </div>
                            `
                        )
                        //添加工单数据
                        _whtml = operation_html.find('ul');
                        workorder_data = oitem.work_orders;
                        workorder_data.forEach(function (witem) {
                            var _wrhtml = '';
                            //添加操作名称
                            witem.operation_name = oitem.operation_name;
                            //添加操作中心id
                            witem.operation_id = oitem.operation_id;
                            if (witem.status == 1 && witem.qty > 1) {
                                _wrhtml = $(`<li style="margin:0 10px 0 0;text-decoration: none;border-bottom:1px dashed #ccc;">
                                    <span class="wo_detail" data-id="${witem.work_order_id}" data-status="${witem.status}" data-commercial="${witem.commercial}" style="background: #53D3DE; color: rgb(255, 255, 255);height:16px;line-height:16px;padding:0 3px; border-radius: 3px;">详</span>
                                    <span class="wo_partition fa" data-content='${JSON.stringify(witem)}' style="background: rgb(0, 157, 240); color: rgb(255, 255, 255);height:16px;line-height:16px;padding:0 3px; border-radius: 3px;">拆</span>
                                    <span class="order_item" data-content='${JSON.stringify(witem)}' data-id="${witem.work_center_id}" data-item="">${witem.number}</span>
                                    <span style="color:#000;">&nbsp;&nbsp;(${witem.qty}[${witem.commercial}])</span>                                
                                    <span data-id="${witem.work_center_id}" data-content='${JSON.stringify(witem)}' class="search-submit" style="background:rgb(91, 155, 213);color: #fff;cursor: pointer;border-radius: 3px;text-align:center;float:right;height: 20px;line-height:20px;margin-top:2px;margin-right:2px;">${witem.work_center_name}</span>
                                 </li>`);
                            } else if (witem.status == 2) {
                                _wrhtml = $(`<li style="margin:0 10px 0 0;text-decoration: none;border-bottom:1px dashed #ccc;">
                                    <span class="wo_detail" data-id="${witem.work_order_id}" data-status="${witem.status}" data-commercial="${witem.commercial}" style="background: #53D3DE; color: rgb(255, 255, 255);height:16px;line-height:16px;padding:0 3px; border-radius: 3px;">详</span>
                                    <span class="wo_number" style="margin-left:19px;color:#666666;" data-id="${witem.work_order_id}" data-item="">${witem.number}</span>
                                    <span style="color:#000;">&nbsp;&nbsp;(${witem.qty}[${witem.commercial}])</span>
                                    <span data-id="${witem.work_center_id}" data-content='${JSON.stringify(witem)}' class="search-submit" style="background:rgb(91, 155, 213);color: #fff;border-radius: 3px;text-align:center;float:right;height: 20px;line-height:20px;margin-top:2px;margin-right:2px;">${witem.work_center_name}</span>
                                </li>`);
                            } else if (witem.status == 1 && witem.qty == 1) {
                                _wrhtml = $(`<li style="margin:0 10px 0 0;text-decoration: none;border-bottom:1px dashed #ccc;">
                                    <span class="wo_detail" data-id="${witem.work_order_id}" data-status="${witem.status}" data-commercial="${witem.commercial}" style="background: #53D3DE; color: rgb(255, 255, 255);height:16px;line-height:16px;padding:0 3px; border-radius: 3px;">详</span>
                                    <span class="order_item" style="margin-left:19px;" data-content='${JSON.stringify(witem)}' data-id="${witem.work_center_id}" data-item="">${witem.number}</span>
                                    <span style="color:#000;">&nbsp;&nbsp;(${witem.qty}[${witem.commercial}])</span>                                
                                    <span data-id="${witem.work_center_id}" data-content='${JSON.stringify(witem)}' class="search-submit" style="background:rgb(91, 155, 213);color: #fff;border-radius: 3px;text-align:center;float:right;height: 20px;line-height:20px;margin-top:2px;margin-right:2px;">${witem.work_center_name}</span>
                                 </li>`);
                            }
                            _whtml.append(_wrhtml);
                        })
                        fohtml.append(operation_html);
                    })
                })
            } else {
                _html = $(`<div data-id="" class="thin_order_block">暂无数据</div>`);
            }
            $('.wrap .work-order-wrap').html(_html);
            //$('.operation_list .order_list').not(':first').hide();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    })
}

//注册左右移动事件
$.fn.extend({
    drag: function (options) {
        var dragStart, dragMove, dragEnd,
            $boundaryElem, b_width,
            limitObj, diffX,
            win_width = $(window).width();

        function _initOptions() {
            var noop = function () { }, defaultOptions;

            defaultOptions = {          // 默认配置项
                boundaryElem: 'body',   // 边界容器
                isLimit: false          // 是否限制拖动范围
            };
            options = $.extend(defaultOptions, options || {});

            // 边界元素及其宽高
            $boundaryElem = $(options.boundaryElem);
            b_width = $boundaryElem.innerWidth();
            b_height = $boundaryElem.innerHeight();

            dragStart = options.dragStart || noop,
                dragMove = options.dragMove || noop,
                dragEnd = options.dragEnd || noop;
        }

        function _drag(e) {
            var clientX, offsetLeft, width, height,
                $target = $(this), self = this;

            // 记录鼠标按下时的位置及拖动元素的相对位置
            clientX = e.clientX;
            offsetLeft = this.offsetLeft;

            width = $target.outerWidth();
            height = $target.outerHeight();

            limitObj = {
                _left: 0,
                _right: (b_width || win_width) - width
            };

            // 拖动元素是否超出了限制边界
            isBeyound = width > b_width && height > b_height;
            if (isBeyound) {
                diffX = b_width - width;
            }

            dragStart.apply(this, arguments);
            $(document).bind('mousemove', moveHandle)
                .bind('mouseup', upHandle);

            // 鼠标移动事件处理
            function moveHandle(e) {

                var e_diffX = e.clientX - clientX,
                    x = e_diffX + offsetLeft;

                if (options.isLimit && !isBeyound) {
                    x = Math.max(Math.min(x, limitObj._right), limitObj._left);
                }

                if (options.isLimit && isBeyound) {
                    x = e_diffX < 0 ? Math.max(x, diffX) : Math.min(x, 0);
                }

                $('.GanttTask,.GanttTaskFixed').css({
                    left: x + 'px'
                });

                dragMove.apply(self, arguments);
                // 阻止浏览器默认行为(鼠标在拖动图片一小段距离，会出现一个禁止的小提示，即：图片不能再拖动)
                e.preventDefault();
            }

            // 鼠标弹起事件处理
            function upHandle(e) {
                $(document).unbind('mousemove', moveHandle);
                dragEnd.apply(self, arguments);
            }
        }

        _initOptions(); // 初始化配置对象

        $(this)
            .css({ position: 'absolute' })
            .each(function () {
                $(this).bind('mousedown', function (e) {
                    if ($(this).data('data-resize')) {
                        return;
                    }
                    _drag.apply(this, [e]);
                    // 阻止区域文字被选中 for chrome firefox ie9
                    e.preventDefault();
                    // for firefox ie9 || less than ie9
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                });
            });
        return this;
    }
});

//合并排班夜班时间
function mergePlanTime(data) {
    var currentDate = $("#search_date").val();
    //当前搜索日期的开始和结束时间
    var search_start_date = currentDate + " 00:00:00";
    var search_end_date = currentDate + " 23:59:59";
    search_date_start_ms = new Date(search_start_date).getTime();
    search_date_end_ms = new Date(search_end_date).getTime();
    //当天夜班时间
    var real_work_start_time = currentDate + " " + data[0].work_time_start;
    var real_work_end_time = currentDate + " " + data[data.length - 1].work_time_end;
    real_work_start_ms = new Date(real_work_start_time).getTime();
    real_work_end_ms = new Date(real_work_end_time).getTime();
    for (var i = 0; i < data.length; i++) {
        if (data[i].name == "夜班") {
            new Date(currentDate + " " + data[i].work_time_start).getTime()
        }
    }
}

//获取工作中心绑定的排班
//添加排班时间休息时间
function showWorkCenterRankPlan(id, time, end_time) {
    var str_date_time = time.split(' ');
    var _time = formatDuring(end_time);
    AjaxClient.get({
        url: URLS['thinPro'].rankPlan + '?' + _token + '&work_center_id=' + id + '&work_station_time=' + str_date_time[0],
        dataType: 'json',
        async: false,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            //console.log(rsp);
            var data = rsp.results;
            var restTime = [];
            var html = `<div style="height:35px;line-height:35px;color:#000;">班次时间: `;
            var rhtml = `<div style="height:35px;line-height:35px;color:#000;">休息时间: `;
            var bgc = '';
            if (data && data.length) {
                workCenterPlan = data;
                data.forEach(function (val, i) {
                    if(i == 0){
                        bgc = '#FAF2EB';
                    }else if(i == 1){
                        bgc = '#EBFAEF';
                    }else if(i == 2){
                        bgc = '#FFF1F8';
                    }
                    restTime.push({ 'rest_time_start': val.rest_time_start, 'rest_time_end': val.rest_time_end });
                    html += `<span style="background:${bgc};margin-left: 10px">${val.name}:&nbsp;&nbsp;${val.work_time_start} ~ ${val.work_time_end}</span>`;
                    rhtml += `<span style="background-color:#F0F0F0;margin-left:10px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${val.rest_time_start} ~ ${val.rest_time_end}</span>`;
                })
                html += `</div>`
                rhtml += `</div>`
                $("#work-center-rank-plan").html(html);
                $("#work-center-rank-plan").append(rhtml);
                //班次结束时间
                var work_time_end = "23:59:59";
                work_time_end_arr = work_time_end.split(':');
                var work_order_end_time = work_time_end_arr[0] * 3600000 + work_time_end_arr[1] * 60000 + work_time_end_arr[2] * 1000;
                if (end_time && restTime && restTime.length) {
                    restTime.forEach(function (val, i) {
                        var rest_time_start_arr = val.rest_time_start.split(':');
                        var rest_time_end_arr = val.rest_time_end.split(':');
                        var time_diff = (rest_time_end_arr[0] * 3600000 + rest_time_end_arr[1] * 60000 + rest_time_end_arr[2] * 1000) - (rest_time_start_arr[0] * 3600000 + rest_time_start_arr[1] * 60000 + rest_time_start_arr[2] * 1000);
                        //排班开始时间毫秒数
                        var work_time_start_arr = str_date_time[1].split(':');
                        var work_time_start_ms = work_time_start_arr[0] * 3600000 + work_time_start_arr[1] * 60000 + work_time_start_arr[2] * 1000;
                        //开始休息时间毫秒数
                        var rest_time_start_arr_ms = rest_time_start_arr[0] * 3600000 + rest_time_start_arr[1] * 60000 + rest_time_start_arr[2] * 1000;
                        //if (rest_time_start_arr_ms > work_time_start_ms && rest_time_start_arr_ms < end_time) {
                        //如果排班包含休息时间，加休息时间
                        //end_time += time_diff;
                        if (work_order_end_time < end_time) {
                            end_time = work_order_end_time;
                            _time = formatDuring(end_time);
                            //break;
                        } else {
                            _time = formatDuring(end_time);
                        }
                        //}
                    })

                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    })
    return _time;
}

function getThinOrderProduct(_time, production_order_number, operation_order_number) {
    $('.thinProduction_wrap .thinWorkOrderList').html('');
    var workcenter = $('#workcenter_id').val();
    var urlLeft = '';
    if (_time) {
        urlLeft += '&status=1&order=asc&sort=id&page_no=' + pageOrderNo + '&page_size=' + pageOrderSize + '&work_station_time=' + _time + '&work_center_id=' + workcenter
    } else {
        urlLeft += '&status=1&order=asc&sort=id&page_no=' + pageOrderNo + '&page_size=' + pageOrderSize
    }
    if (production_order_number != undefined && operation_order_number != undefined) {
        urlLeft += '&production_order_number=' + production_order_number + '&operation_order_number=' + operation_order_number
    }
    AjaxClient.get({
        url: URLS['thinPro'].woList + '?' + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var obj = {}, temp = [], data = rsp.results;
            if (data && data.length) {

                for (var i = 0; i < data.length; i++) {
                    var list = data[i];

                    if (!obj[list.operation_id]) {
                        temp.push({
                            id: list.operation_id,
                            name: list.operation_name,
                            data: [list]
                        });
                        obj[list.operation_id] = list
                    } else {
                        for (var j = 0; j < temp.length; j++) {
                            var jList = temp[j];
                            if (jList.id == list.operation_id) {
                                jList.data.push(list);
                                break;
                            }
                        }
                    }
                }
                showThinOrderList($('.thinProduction_wrap .thinWorkOrderList'), temp);

            } else {
                $('.thinProduction_wrap .thinWorkOrderList').html('暂无数据')
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    })
}

function showThinOrderList(ele, data) {
    data.forEach(function (item) {
        var _html = $(`<div data-id="${item.id}" class="thin_order_block">
                     <div class="order_title"><h6>工序：${item.name}</h6></div>
                     <div class="order_list"><ul></ul></div>
                </div>`),
            ulhtml = _html.find('ul');
        if (item.data.length) {
            item.data.forEach(function (ritem) {
                var _chtml = `<li style="text-decoration: none;">
                                <span class="order_item" data-id="${ritem.work_order_id}" data-item="">${ritem.number}</span>
                                  <span class="wo_detail" data-id="${ritem.work_order_id}" data-commercial="${ritem.commercial}" style="margin-left:10px;background:#73d348;color: #fff;cursor: pointer;border-radius: 3px;padding: 0 3px;">
                                    详情
                                  </span>
                             </li>`;
                ulhtml.append(_chtml);
                ulhtml.find('li:last-child span.order_item').data('thinItem', ritem);
            })
        }
        ele.append(_html);
    })
}

//获取工单详情
function woDetail(id, commercial, status) {
    var url = `/WorkOrder/show` + '?' + _token;
    var data = {
        work_order_id: id
    }
    AjaxClient.get({
        url: url,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            // console.log(rsp);
            layer.close(layerLoading);
            var data = rsp.results;
            var operation_name = $('.order_title h6').html();
            // console.log(data);
            if (rsp) {
                // $('.wo-deinfo-wrap span.wt-number').html(rsp.results.wt_number);
                // $('.wo-deinfo-wrap span.wt-input-number').val(rsp.results.wt_number);
                // $('.wo-deinfo-wrap #workorder_time').html(dateFormat(rsp.results.work_station_time));
                // $('.wo-deinfo-wrap #factory_name').html(rsp.results.factory_name);
                // $('.wo-deinfo-wrap #workcenter_name').html(rsp.results.workcenter_name);
                // $('.wo-deinfo-wrap #workshop_name').html(rsp.results.workshop_name);
                var indata = [], outdata = [];

                // rsp.workOrderList = res.data.results;
                // rsp.inMaterialList = JSON.parse(this.workOrderList.in_material);
                // rsp.outMaterialList = JSON.parse(this.workOrderList.out_material);
                var _this = rsp;
                var height = ($(window).height() - 200) + 'px';
                var title = `工单${data.wo_number}详情`;
                layerModal = layer.open({
                    type: 1,
                    title: title,
                    offset: '80px',
                    area: '1000px',
                    shade: 0.1,
                    shadeClose: true,
                    resize: false,
                    content: `
    <div class="wo-deinfo-wrap" style="max-height: ${height};overflow-y: auto;position: relative;">
        <div class="qrcode-conten">
            <div id="qrcode" style="width:100px; height:100px;float:right;border:1px solid #ccc;">
                <div id="qrCodeIco"></div>
            </div>
        </div>
        <div class="block-div" style="height: 100px;">
            <div class="basic-infos" style="margin-top: 10px;">
                <p><span>&nbsp;&nbsp;工单号：<span class="highlight">${data.wo_number}</span><input type="hidden" class="wt-input-number">&nbsp;&nbsp&nbsp;&nbsp;<span class="highlight">${status == 1 ? `未排` : `已排`}</span></p>
                <p><span>&nbsp;&nbsp;数量：<span class="highlight">${data.qty}(${commercial})</span></span>&nbsp;&nbsp;&nbsp;&nbsp;</p>
                <p><span>&nbsp;&nbsp;工作中心：<span class="highlight">${data.workcenter_name}</span></span></p>
                <p><span>&nbsp;&nbsp;总工时：<span class="highlight">${data.total_workhour}s</span></span></p>
            </div>
        </div>
        ${status == 2 ? `<div class="block-div">
            <h4>排单详情</h4>
            <div class="basic_info yipai_info">
                <div class="table-wrap">
                    <table class="sticky uniquetable commontable">
                      <thead>
                        <tr>
                          <th>排单日期</th>
                          <th>工厂</th>
                          <th>车间</th>
                          <th>工作中心</th>
                        </tr>
                      </thead>
                      <tbody class="table_tbody">
                        <tr>
                            <td><span id="workorder_time"></span></td>
                            <td><span id="factory_name"></span></td>
                            <td><span id="workcenter_name"></span></td>
                            <td><span id="workshop_name"></span></td>
                        </tr>
                      </tbody>
                    </table>
                </div>
            </div>
        </div>`: ''}
        <div class="block-div">
            <h4>进料</h4>
            <div class="basic-info income">
                <div class="table_page">
		                <div class="table-wrap">
		                    <table class="sticky uniquetable commontable">
		                      <thead>
		                        <tr>
		                          <th>编码</th>
                              <th>名称</th>
                              <th>数量</th>
                              <th>物料属性</th>
                              <th>工艺属性</th>
                              <th>图纸</th>
                              <th>是否排单</th>
		                        </tr>
		                      </thead>
		                      <tbody class="table_tbody">
		                        <tr><td colspan="7">暂无数据</td></tr>
		                      </tbody>
		                    </table>
		                </div>
		          	</div>
            </div>
        </div>
        <div class="block-div">
            <h4>出料</h4>
            <div class="basic-info outcome">
                <div class="table_page">
		                <div class="table-wrap">
		                    <table class="sticky uniquetable commontable">
		                      <thead>
		                        <tr>
		                          <th>编码</th>
                              <th>名称</th>
                              <th>数量</th>
                              <th>物料属性</th>
                              <th>工艺属性</th>
                              <th>图纸</th>
                              <th>是否排单</th>
		                        </tr>
		                      </thead>
		                      <tbody class="table_tbody">
		                        <tr><td colspan="7">暂无数据</td></tr>
		                      </tbody>
		                    </table>
		                </div>
		          	</div>
                </div>
            </div>
        </div>`,

                    success: function (layero, index) {
                        $("#qrcode").html('');
                        //二维码
                        var qrcode = new QRCode(document.getElementById("qrcode"), {
                            width: 100,
                            height: 100,
                        });

                        makeCode(data.po_number, data.sales_order_code, data.wt_number, data.qty, qrcode);
                        $('.wo-deinfo-wrap span.wt-number').html(rsp.results.wt_number);
                        $('.wo-deinfo-wrap span.wt-input-number').val(rsp.results.wt_number);
                        $('.wo-deinfo-wrap #workorder_time').html(dateFormat(rsp.results.work_station_time));
                        $('.wo-deinfo-wrap #factory_name').html(rsp.results.factory_name);
                        $('.wo-deinfo-wrap #workcenter_name').html(rsp.results.workcenter_name);
                        $('.wo-deinfo-wrap #workshop_name').html(rsp.results.workshop_name);
                    },
                    end: function () {
                        $("#qrCodeIco11").html('');
                    }
                });
                if (data.in_material) {
                    indata = JSON.parse(data.in_material);
                }
                var inhtml = createwoDetail(indata, status);
                $('.basic-info.income .table_tbody').html(inhtml);
                if (data.out_material) {
                    outdata = JSON.parse(data.out_material);
                }
                var outhtml = createwoDetail(outdata, status);
                $('.basic-info.outcome .table_tbody').html(outhtml);

            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工单详情失败');
        }
    })
}

// 时间戳转换成指定格式日期
// dateFormat(11111111111111, 'Y年m月d日 H时i分')
function dateFormat(timestamp, formats) {
    // formats格式包括
    // 1. Y-m-d
    // 2. Y-m-d H:i:s
    // 3. Y年m月d日
    // 4. Y年m月d日 H时i分
    formats = formats || 'Y-m-d';

    var zero = function (value) {
        if (value < 10) {
            return '0' + value;
        }
        return value;
    };

    var myDate = timestamp ? new Date(timestamp * 1000) : new Date();

    var year = myDate.getFullYear();
    var month = zero(myDate.getMonth() + 1);
    var day = zero(myDate.getDate());

    var hour = zero(myDate.getHours());
    var minite = zero(myDate.getMinutes());
    var second = zero(myDate.getSeconds());

    return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
        return ({
            Y: year,
            m: month,
            d: day,
            H: hour,
            i: minite,
            s: second
        })[matches];
    });
};

//生成工单详情页二维码
function makeCode(po_number, sales_order_code, wt_number, qty, qrcode) {
    var elText = "生产订单号：" + po_number + "\r\n销售订单号：" + sales_order_code + "\r\n工单：" + wt_number + "\r\n工单数量[PCS]：" + qty;
    qrcode.makeCode(elText);
}
$('body').on('click', '.wo_detail', function () {
    var id = $(this).attr('data-id'), commercial = $(this).data('commercial'), status = $(this).attr('data-status');
    woDetail(id, commercial, status);
    // 二维码
});

//点击获取当前工作中心排班
$('body').on('click', '.search-submit', function () {
    var time = $('#search_date').val();
    var id = $(this).attr('data-id');
    var list = $(this).attr('data-content');
    list = JSON.parse(list);
    $("#work-center-name").html(list.work_center_name);
    $("#work-center-id").val(list.work_center_id);
    if (time != '') {
        getcarefulPlan(id, time);
        showWorkCenterRankPlan(id, time);
    }
});

//生成工单详情表格
function createwoDetail(data, status) {
    var trs = '';
    if (data && data.length) {
        data.forEach(function (item) {
            var mattrs = item.material_attributes,
                opattr = item.operation_attributes,
                imgs = item.drawings,
                mattrhtml = '',
                opattrhtml = '',
                imghtml = '';
            mattrs.length && mattrs.forEach(function (k, v) {
                mattrhtml += `<p><span>${k.name}: </span><span>${k.value}${k.unit ? k.unit : ''}</span></p>`;
            });
            opattr.length && opattr.forEach(function (k, v) {
                opattrhtml += `<p><span>${k.name}: </span><span>${k.value}${k.unit ? k.unit : ''}</span></p>`;
            });
            imgs.length && imgs.forEach(function (k, v) {
                imghtml += `<p attachment_id="${k.drawing_id}" data-creator="${k.creator_name}" data-ctime="${k.ctime}" data-url="${k.image_path}"  title="${k.name}"><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="80" height="40" src="/storage/${k.image_path}" data-src="/storage/${k.image_path}" alt="${k.name}"></p>`;
            });
            trs += `<tr>
            <td>${item.item_no}</td>
            <td>${item.name}</td>
            <td>${item.qty} [${item.bom_commercial}]</td>
            <td>${mattrhtml}</td>
            <td>${opattrhtml}</td>
            <td>${imghtml}</td>
            <td>${status == 1 ? `未排` : `已排`}</td>
        </tr>`;
        });
    } else {
        trs = '<tr><td colspan="7">暂无数据</td></tr>';
    }
    return trs;
}

//点击工单
function bindEvent() {
    $('body').on('click', '.order_list .order_item:not(.is-disabled)', function (e) {
        var wo_work_center_id = $(this).attr('data-id'), list = $(this).attr('data-content');
        list = JSON.parse(list);
        var work_center_id = $('.gantt-div-wrap .workcenter #work-center-id').val();
        //if (wo_work_center_id == work_center_id) {
        $('.el-form-item.workcenter').find('.errorMessage').hide().html(' ');
        var time = $('#search_date').val();
        var id = $(this).attr('data-id');
        $("#work-center-name").html(list.work_center_name);
        $("#work-center-id").val(list.work_center_id);
        //获取排班
        if (time != '') {
            getcarefulPlan(id, time);
            showWorkCenterRankPlan(id, time);
        }
        //显示modal
        showThinOrderModal(list);
        //} else {
        //LayerConfig('fail', '请点击工作中心获取新的排班！');//(, { title: false, icon: 5 });
        //}
    })

    //弹窗关闭
    $('body').on('click', '.formModal .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });

    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click', '.el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    //下拉框点击事件
    $('body').on('click', '.el-select', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //下拉框item点击事件
    $('body').on('click', '.el-select-dropdown-item:not(.el-auto,.factory_item_tree,.kong)', function (e) {
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').hide().html(' ');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
            var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }

        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

    //置空信息
    // $(function () {
    //     $('#factory_id').prev().val('--请选择--');
    //     $('#workshop_id').prev().val('--请选择--');
    //     $('#workcenter_id').prev().val('--请选择--');
    //     $('#search_date').val('');
    //     $('#production_order_no').val('');
    //     $('#operation_order_no').val('');
    // })

    $('body').on('click', '.submit:not(.is-disabled)', function (e) {
        //工单排班确定按钮
        if ($(this).hasClass('saveRelation_bench')) {
            for (var type in validatorConfig) { validatorConfig[type] && validatorToolBox[validatorConfig[type]](type); }
            var parentForm = $('#addThinProduction_form'),
                work_task_id = parentForm.attr('data-task-id'),
                id = parentForm.find('#itemId').val(),
                production_no = $('#production_order_no').val(),
                operation_order_no = $('#operation_order_no').val(),
                ability_value = parentForm.attr('data-abilityValue'),
                currentTime = $('#date').val(),
                currentDate = $('#search_date').val(),
                rank_plan_id = 0,
                rank_plan_type_id = 0;
            workCenterPlan.every(function (_value) {
                if (currentTime != '') {
                    //休息时间判断，转为时间戳
                    var currentTimeDate = currentDate + ' ' + currentTime;
                    var restTimeStartDate = currentDate + ' ' + _value.rest_time_start;
                    var restTimeEndDate = currentDate + ' ' + _value.rest_time_end;
                    var workTimeStartDate = currentDate + ' ' + _value.work_time_start;
                    var workTimeEndDate = currentDate + ' ' + _value.work_time_end;
                    currentTimeDate_ms = new Date(currentTimeDate).getTime();
                    restTimeStartDate_ms = new Date(restTimeStartDate).getTime();
                    restTimeEndDate_ms = new Date(restTimeEndDate).getTime();
                    workTimeStartDate_ms = new Date(workTimeStartDate).getTime();
                    workTimeEndDate_ms = new Date(workTimeEndDate).getTime();
                    if (currentTimeDate_ms >= workTimeStartDate_ms && currentTimeDate_ms < workTimeEndDate_ms) {
                        rank_plan_id = _value.rank_plan_id;
                        rank_plan_type_id = _value.rank_plan_type_id;
                    }
                    if (currentTimeDate_ms >= restTimeStartDate_ms && currentTimeDate_ms <= restTimeEndDate_ms) {
                        $('.el-form-item.select_date').find('.errorMessage').show().html('当前所选为休息时间，请重新选择');
                        startTimeCorrect = !1;
                        return false;
                    } else {
                        $('.el-form-item.select_date').find('.errorMessage').hide().html('');
                        startTimeCorrect = 1;
                        return true;
                    }
                } else {
                    $('.el-form-item.select_date').find('.errorMessage').show().html('*请选择时间');
                    startTimeCorrect = !1;
                }
            })
            var list = $(this).attr('data-content');
            list = JSON.parse(list);
            work_shift_id = parentForm.find('#work_bench_id').val();
            if (benchCorrect && equipCorrect && startTimeCorrect) {
                var factory_id = list.factory_id,
                    work_center_id = list.work_center_id,
                    work_shop_id = list.work_shop_id,
                    operation_id = list.operation_id;
                var select_date = $('#search_date').val();
                var plan_start_time = select_date + " " + parentForm.find('#date').val();
                var str_date_time = plan_start_time.split(' '),
                    str_mm_time = str_date_time[1].split(':');
                var work_equip_id = $("#work_equip_id").val();
                var _time = str_mm_time[0] * 3600000 + str_mm_time[1] * 60000 + ability_value * 1000;
                end_time = $('#search_date').val() + " " + showWorkCenterRankPlan(work_center_id, plan_start_time, _time);
                if (end_time != undefined) {
                    saveThinData({
                        ids: JSON.stringify([id]),
                        work_center_id: work_center_id,
                        plan_start_time: plan_start_time,
                        plan_end_time: end_time,
                        work_task_id: work_task_id,
                        work_shift_id: work_shift_id,
                        work_device_id: work_equip_id,
                        factory_id: factory_id,
                        work_shop_id: work_shop_id,
                        rank_plan_id: rank_plan_id,
                        rank_plan_type_id: rank_plan_type_id,
                        _token: TOKEN
                    })
                    getcarefulPlan(work_center_id, plan_start_time);
                    getWorkOrdersByDate(select_date, production_no, operation_order_no);
                    initOrderShow(factory_id, operation_id);
                }
                //initOrderShow(factory_id);
            }
        } else if ($(this).hasClass('searchWo-submit')) {
            //工单搜索按钮
            var time = $('#search_date').val(),
                production_no = $('#production_order_no').val(),
                operation_order_no = $('#operation_order_no').val();
            $('#work-center-name').html('');
            $('#work-center-id').val('');
            //清空gantt图
            $('.GanttWrap').html('<span style="margin-left:10px;">暂无数据</span>');
            $('#work-center-rank-plan').html('');
            if (time != '') {
                $('.el-form-item').find('.errorMessage').html('');
                getWorkOrdersByDate(time, production_no, operation_order_no);
                initOrderShow();
                // var selected_factory_id = $('#factory_list').find('option:selected').attr('data-id');
                // $("#" + selected_factory_id).show().siblings().hide();
            } else {
                if (time == '') {
                    $('.el-form-item.search_date').find('.errorMessage').show().html('请选择时间');
                }
            }
        } else if ($(this).hasClass('split-submit')) {
            var proNum = parseInt($('#qtyNum')[0].innerHTML);
            var splitNum = parseInt($('.el-form-item-div #splitNum')[0].value);
            var production_no = $('#production_order_no').val(),
                operation_order_no = $('#operation_order_no').val(),
                factory_id = $('#factory_id').val(),
                operation_id = $('#operation_id').val();
            var splitStatus = 0;
            if (splitNum < proNum && splitNum >= 1) {
                $('.splitwo').find('.errorMessage').html('');
                splitStatus = 1;
            } else {
                $('.splitwo').find('.errorMessage').html('输入1~' + (proNum - 1) + '之间的数值');
                splitStatus = 0;
            }
            var select_date = $('#search_date').val();
            if (splitStatus == 1 && splitStatus) {
                AjaxClient.post({
                    url: URLS['aps'].splitwo,
                    data: {
                        _token: TOKEN,
                        id: $('#work_order_id').val(),
                        qty: splitNum
                    },
                    dataType: 'json',
                    beforeSend: function () {
                        layerLoading = LayerConfig('load');
                    },
                    success: function (rsp) {
                        LayerConfig('success', '拆单成功');
                        layer.close(layerModal);
                        layer.close(layerLoading);
                        getWorkOrdersByDate(select_date, production_no, operation_order_no);
                        initOrderShow(factory_id, operation_id);
                    },
                    fail: function (rsp) {
                        LayerConfig('fail', '拆单失败');
                        layer.close(layerModal);
                        layer.close(layerLoading);
                    }
                })
            } else {
                return;
            }
        }
    })
}

function formatDuring(data) {
    var hours = parseInt((data % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((data % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = parseInt((data % (1000 * 60)) / 1000);
    if (minutes >= 0 && minutes <= 9) {
        minutes = '0' + minutes
    }
    if (seconds >= 0 && seconds <= 9) {
        seconds = '0' + seconds
    }

    return hours + ":" + minutes + ":" + seconds;
}

//关联台板页
function showThinOrderModal(data) {
    var abilityValue, commercial;
    if (data) {
        ({ work_order_id='', work_task_id='', number='', operation_name='', qty='', operation_ability_pluck = '', group_step_withnames =[] } = data)
    }
    var labelWidth = 100, readonly = 'readonly', btnShow = 'btnShow', _hours = '';
    // if (group_step_withnames){
    //     var steps =JSON.parse(group_step_withnames);
    //     console.log(steps);
    //     steps.forEach(function (aitem,aindex) {
    //         var ability =aitem.abilitys;
    //         for(var i in ability){
    //             /**
    //              * TODO 这边缺少单个能力的工时和总的产能
    //              * @type {string}
    //              * @private
    //              */
    //             // _hours += `<p>${ability[i]}(${i}[s])</p>`;
    //             abilityValue = 10;
    //         }
    //     });
    // }
    _hours = `<span>${data.ability_name}</span>`;
    abilityValue = data.total_workhour;
    commercial = data.commercial;
    work_center_id = data.work_center_id;
    // if(operation_ability_pluck != '{}'){
    //   hours = `${ability[i].name}(${ability[i].standard_working_hours}[min])`;
    //   abilityValue = ability[i].standard_working_hours*qty;
    // }
    layerModal = layer.open({
        type: 1,
        title: '关联台板',
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        move: false,
        resize: false,
        content: `<form class="addThinProduction formModal" id="addThinProduction_form" data-abilityValue="${abilityValue}" data-task-id="${work_task_id}">
           <input type="hidden" id="itemId" value="${work_order_id}"/>
            <div class="work_order_info">
                <div class="title"><h5>工单信息</h5></div>
                <div class="info_wrap">
                   <div>
                         <div class="el-form-item">
                         <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工单号</label>
                            <span>${number}</span>
                         </div>
                         <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">工序</label>
                                <span>${operation_name}</span>
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>
                   </div>
                   <div>
                       <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">基础数量</label>
                               <span>${qty}(${commercial})</span>
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                       </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">能力</label>
                                ${_hours}
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                       </div>
                   </div>
                </div>
            </div>
            <div class="work_order_condition">
              <div class="title"><h5>选择台板</h5></div>
              <div class="search_info">
                  <div class="el-form-item bench" style="height:58px;">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">台板</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="workBench" class="el-input" placeholder="--请选择--">
                                <input type="hidden" class="val_id" id="work_bench_id" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list" id="select-work-bench">
                                   
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                 </div>
                 <div class="el-form-item equipment" style="height:58px;">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">设备</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="workEquipment" class="el-input" placeholder="--请选择--">
                                <input type="hidden" class="val_id" id="work_equip_id" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list">
                                   
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                 </div>
                 <div class="el-form-item select_date" style="height:58px;">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">开始时间</label>
                        <input type="text" id="date" class="el-input" placeholder="选择时间" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                 </div>
              </div>
            </div>
             <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" data-content=${JSON.stringify(data)} class="el-button el-button--primary submit saveRelation_bench">确定</button>
                    </div>
             </div>
        </form>`,
        success: function (layero, index) {
            layerEle = layero;
            getAllWorkBench(work_center_id);
            $('body').on('click', '.el-select-dropdown #select-work-bench .el-select-dropdown-item', function (e) {
                e.stopPropagation()
                var work_bench_id = $("#work_bench_id").val()
                getAllWorkEquip(work_bench_id);
            })
            //输入框的相关事件
            // $('body').on('focus', '.addThinProduction:not(".disabled") .el-input', function () {
            //     $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            // }).on('blur', '.addThinProduction:not(".disabled") .el-input', function () {
            //     var name = $(this).attr("id");
            //     validatorConfig[name]
            //         && validatorToolBox[validatorConfig[name]]
            //         && validatorToolBox[validatorConfig[name]](name)
            // })
            // console.log(abilityValue);
            var ele = $('#search_date').val();
            getLaydate('date', ele, abilityValue);
        }
    })
}

//关联台板页获取所有台板列表
function getAllWorkBench(wcid) {
    //var id = $('#workcenter_id').val();
    AjaxClient.get({
        url: URLS['thinPro'].benchList + '?' + _token + '&status=1&workcenter_id=' + wcid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var lis = '', innerHtml = '';
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                //<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                innerHtml = `${lis}`;
                $('.el-form-item.bench').find('.el-select-dropdown-list').html(innerHtml);
            }

            setTimeout(function () {
                getLayerSelectPosition($(layerEle));
            }, 200);

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取台板列表失败', { icon: 5, offset: '250px', time: 1500 });
        }
    }, this);
}

//关联台板页获取所选设备列表
function getAllWorkEquip(weid) {
    //var id = $('#workcenter_id').val();
    AjaxClient.get({
        url: URLS['thinPro'].equipList + '?' + _token + '&workbench_id=' + weid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var lis = '', innerHtml = '';
            var data = rsp.results
            if (data && data.items.length) {
                data.items.forEach(function (item) {
                    lis += `<li data-id="${item.device_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.device_name}</li>`;
                });
                //<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                innerHtml = `${lis}`;
                $('.el-form-item.equipment').find('.el-select-dropdown-list').html(innerHtml);
            }

            setTimeout(function () {
                getLayerSelectPosition($(layerEle));
            }, 200);

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取台板列表失败', { icon: 5, offset: '250px', time: 1500 });
        }
    }, this);
}

//获取当前格式化时间
function _getCurrentDate(flag, normal) {
    var date = new Date();
    if (flag == 'date') {
        var seperator1 = "-";
        var seperator2 = ":";

        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }

        var _date = date.getFullYear() + seperator1 + month + seperator1 + strDate;

        if (_date == normal) {
            // console.log('fff')
            return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        } else {
            return false;
        }
    } else {
        var _month = date.getMonth() + 1;
        var _date = date.getDate();
        if (_month >= 1 && _month <= 9) {
            _month = '0' + _month
        }
        if (_date >= 1 && _date <= 9) {
            _date = '0' + _date
        }
        var _current = date.getFullYear() + '-' + _month + '-' + _date;
        return _current;
    }
}

//时间组件
function getLaydate(flag, normal, val) {
    if (flag == 'date') {
        var currentDate = _getCurrentDate(flag, normal);
        $('.el-form-item.select_date').find('.errorMessage').hide().html('');
        var startDate = workCenterPlan[0].work_time_start;
        var endDate = workCenterPlan[workCenterPlan.length - 1].work_time_end;
        //排班开始时间毫秒数
        var startDateMs = new Date(normal + " " + startDate).getTime();
        //排班结束时间毫秒数
        var startMs = new Date(normal + ' 00:00:00').getTime();
        var minRange = startDateMs > startMs ? normal + " " + startDate : normal + ' 00:00:00',
            maxRange = normal + " " + endDate;
        laydate.render({
            elem: '#' + flag,
            type: 'time',
            format: 'HH:mm:ss',
            position: 'fixed',
            min: startDate,
            max: endDate,
            done: function (value) {
                var str = normal + " " + value, reg = str.split(' ');
                if (reg[0] == normal) {
                    var formatTimeS = new Date(str).getTime(),
                        formatTimeMin = new Date(minRange).getTime(),
                        formatTimeMax = new Date(maxRange).getTime(),
                        _time = formatTimeS + (val * 1000);
                    if (_time > formatTimeMin && _time < formatTimeMax) {
                        $('.el-form-item.select_date').find('.errorMessage').hide().html('');
                        startTimeCorrect = 1;
                    } else {
                        $('.el-form-item.select_date').find('.errorMessage').show().html('超出产能时间，点击确定按钮强制排单');
                    }
                } else {
                    $('.el-form-item.select_date').find('.errorMessage').show().html('时间范围不正确');
                    // console.log('时间范围不正确')
                }
                $('.search_date').find('.errorMessage').hide().html('');
            }
        });
    } else {
        var _date = _getCurrentDate(flag);
        laydate.render({
            elem: '#' + flag,
            min: _date,
            value: _date,
            done: function (value) {
                $('.search_date').find('.errorMessage').hide().html('');
            }
        });
    }

}

//获取工厂的值
function getFactorySource(val) {
    AjaxClient.get({
        url: URLS['thinPro'].getFactoryTree + '?' + _token,
        async: false,
        dataType: 'json',
        success: function (rsp) {
            factorys = rsp && rsp.results || [];
            var factoryLis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
            if (factorys) {
                factorys.forEach(function (item) {
                    var factoryMsg = JSON.stringify(item.workshops);
                    factoryLis += `<li data-json='${factoryMsg}' data-id="${item.factory_id}"  class="el-select-dropdown-item show_description" data-desc="${item.factory_name}" >${item.factory_name}</li>`
                })
            }
            $('.el-select-dropdown-list-factory').html(factoryLis);
            $('body').on('click', '.el-select-dropdown-list-factory .el-select-dropdown-item', function (e) {
                e.stopPropagation();
                if (!$(this).attr('data-json') == '') {
                    var workshopMsg = JSON.parse($(this).attr('data-json'));
                    var factoryId = $(this).attr('data-id');
                    workshops = workshopMsg || [];
                    var lis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
                    if (workshops) {
                        workshops.forEach(function (item) {
                            var workcenterArray = JSON.stringify(item.workcenters);
                            lis += `<li data-json='${workcenterArray}'  data-id="${item.workshop_id}" data-factoryId="${factoryId}" class="el-select-dropdown-item show_description" data-desc="${item.workshop_name}">${item.workshop_name}</li>`;
                        });
                    }
                    $('.el-select-dropdown-list-workshop').html(lis);
                } else {
                    $('.el-select-dropdown-list-workcenter').html('<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>');
                }
                $('.el-select-dropdown-list-workshop li:first-child').click();
            })

            $('body').on('click', '.el-select-dropdown-list-workshop .el-select-dropdown-item', function (e) {
                e.stopPropagation();
                if (!$(this).attr('data-json') == '') {
                    var workcenterMsg = JSON.parse($(this).attr('data-json'));
                    var workshopId = $(this).attr('data-id');
                    var factoryID = $(this).attr('data-factoryId');
                    // console.log(routeMsg);
                    var workcenterLis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
                    workcenterMsg.forEach(function (val, i) {
                        workcenterLis += `<li data-id="${val.workcenter_id}" data-workshopId="${workshopId}" data-factoryID="${factoryID}" class="el-select-dropdown-item show_description" data-desc="${val.workcenter_name}">${val.workcenter_name}</li>`;
                    })
                    $('.el-select-dropdown-list-workcenter').html(workcenterLis);
                } else {
                    $('.el-select-dropdown-list-workcenter').html('<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>');
                }
                $('.el-select-dropdown-list-workcenter li:first-child').click();
            })
        },
        fail: function (rsp) {
            noData('获取工厂失败，请刷新重试', 4);
        }
    }, this)
}


function saveThinData(data) {

    AjaxClient.post({
        url: URLS['thinPro'].store,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            var str = data.plan_start_time.split(' ');
            getcarefulPlan(data.work_center_id, str[0])
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
        }

    }, this)
}

//tips提示
var desc_show = '';
$('body').on('mouseenter', '.show_description', function () {
    var msg = $(this).attr('data-desc');
    if (msg != '') {
        desc_show = layer.tips(msg, this,
            {
                tips: [2, '#20A0FF'], time: 0
            });
    }
}).on('mouseleave', '.show_description', function () {
    layer.close(desc_show);
})

var show_desc = '';
$('body').on('mouseenter', '.show_desc', function () {
    var msg = $(this).parent().next().find('li.selected').attr('data-desc');
    if (msg != '' && msg != undefined) {
        show_desc = layer.tips(msg, this,
            {
                tips: [2, '#20A0FF'], time: 0
            });
    }
}).on('mouseleave', '.show_desc', function () {
    layer.close(show_desc);
})