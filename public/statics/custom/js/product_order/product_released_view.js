var id,number,layerEle,
    calendar,
    lock=false,
    vdate=[],
    deleteFlag=false,
    opEvent=null,
    oriEvent=null,
    hasOPEvent=null,
    wolist=[],
    scrollTop=0,
    pageNo=1,
    pageSize=20,
    pagePoNo=1,
    pageWtNo=1,
    pageWoNo=1,
    pagePopWoNo=1,
    pagePopsetWoNo=1,
    pageWSize=5,
    taskid=0,
    ajaxOPData={
        factory_id: 0,
        factory_name: '',
        workshop_id: 0,
        workshop_name: '',
        workcenter_id: '',
        workcenter_name: ''
    },
    tops=[],
    ops=[],
    wtWos=[],
    wos=[],
    wts=[],
    lineurl='',
    calurl='',
    validEvents=[],
    basisHour=[],
    sameFlag=false;
var wheight=$(window).height()-200;

$(function(){
    lineurl=$('#fineLine').val();
    calendarurl=$('#calendarLine').val();
    id=getQueryString('production_order_id');
    number=getQueryString('number');
    initCalendar();
    // 将当前日历展示的时间从第一天到末尾之间的数天存入数组
    $('.fc-day.fc-widget-content').each(function(){
        var date=$(this).attr('data-date');
        if(date!=undefined){
            vdate.push($(this).attr('data-date'));
        }
    });
    // 进入po详情页隐藏左部菜单并重新计算资源日历的宽度
    if($('#sidebar-collapse #sidebar-toggle-icon').hasClass('fa-angle-double-left')){
        $('#sidebar-collapse').click();
        recountFW();
    }else{
        recountFW();
    }
    // 滑动页面的时候固定资源日历位置
    var oTop = $("#calendar-wrap").offset().top;
    var sTop = 0;
    $(window).scroll(function () {
        sTop = $(this).scrollTop();
        if (sTop >= 60) {
            $(".calendar-wrap").css({ "position": "fixed", "top": "0" });
        }else {
            $(".calendar-wrap").css({ "top": "70px" });
        }
    });
    // 将当前生产订单号显示出来
    $('#po_number').html('当前生产订单：'+number);
    bindEvent();
    setAjaxData();
});
// 浏览器返回的时候读取历史记录中的工序和已选车间
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ops = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).ops;
            ajaxOPData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).gongxu;
            tops=[];
            if(ops.length){
                // 获取工序名称
                var op_arr = [];
                ops.forEach(function (opitem) {
                    op_arr.push(opitem.opeartion_name)
                });
                // 重新渲染产能
                getCapacity(vdate[0],vdate[vdate.length-1]);

                $('.event-list.work-order .bom-tree').html('');
                getPo();
                //  显示已选车间和工作中心
                $('#PO-info').html('');
                var PO_info = `<table class=" sticky uniquetable commontable" style="border: 1px solid #eee;background: #fafbfc;margin-bottom: 10px;width: 99.9%;">
                <thead><tr><th>工厂</th><th>车间</th><th>工作中心</th><th>当前工序</th><th>当天标准工时[s]</th></tr></thead>
                <tbody><tr>
                <td>${ajaxOPData.factory_name}</td>
                <td>${ajaxOPData.workshop_name}</td>
                <td>${ajaxOPData.workcenter_name}</td>
                <td>${op_arr}</td>
                <td id="basis-hour"></td>
                </tr></tbody>
                </table>`;
                $('#PO-info').html(PO_info);
            }
        }catch (e) {
            ops = [];
            ajaxOPData={
                factory_id: 0,
                factory_name: '',
                workshop_id: 0,
                workshop_name: '',
                workcenter_id: '',
                workcenter_name: ''
            };
        }
    }else{
        // 重新渲染产能
        getCapacity(vdate[0],vdate[vdate.length-1]);
        $('.event-list.work-order .bom-tree').html('');
        getPo();
    }
}
// 分页
function bindPagenationClick(totalData,pageSize,pageno,flag){
    $('#pagenation.'+flag).show();
    $('#pagenation.'+flag).pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageno,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageno=api.getCurrent();
            if(flag=='op'){
                pageNo=pageno;
                getOP($('#selectOP .table_tbody'));
            }else if(flag=='opwo'){
                pagePopWoNo=pageno;
                getOPWo($('#editWO .el-panel.wo_from .table_tbody'),hasOPEvent.operation_id,getCurrentDate(new Date(hasOPEvent.start)));
            }else{
                pagePopsetWoNo=pageno;
                getPopWo($('#chooseWo #hasset .table_tbody'),taskid);
            }
        }
    });
}

//重新计算日历宽度
function recountFW(){
    var width=$('.placeholder').width()-420;
    $('.calendar-wrap').width(width);
}

//修改eventlist列表
function changeEventHeight(){
    var eheight=$('.event-list.work-order').height()+40;
    //$('#external-events').css('height',eheight+'px');
}

// 获取当前的时间:yyyy-mm-dd
function getCurrentDate(fdate){
    var date = fdate? fdate:new Date();
    var d = date.getDate();
    var m = date.getMonth()+1;
    var y = date.getFullYear();
    d<10?d='0'+d:null;
    m<10?m='0'+m:null;

    return y+'-'+m+'-'+d;
}

// 获取当前星期几:0,1,2,3,4,5,6
function getCurrentDateWeek(fdate){
    var date = fdate? fdate:new Date();
    var week = date.getDay();

    return week;
}

//资源日历初始化
function initCalendar(){
    calendar=$('#calendar').fullCalendar({
        height: wheight,
        buttonHtml: {
            prev: '<i class="ace-icon fa fa-chevron-left"></i>',
            next: '<i class="ace-icon fa fa-chevron-right"></i>'
        },
        fixedWeekCount : false,
        locale: 'zh-cn',
        header: {
            left: 'prev,next',
            center: 'title',
            right: 'month,basicWeek'
        },
        events: [],
        handleWindowResize: true,
        editable: false,
        droppable: true,
        firstDay: 0,
        // 将工单拖动到日程表上面的时候触发
        drop: function(date) { //只有日历外元素drop才会调用
            scrollTop=$('.fc-day-grid-container')[0].scrollTop;
            if(!$('#external-events .fc-event').length){
                $('#external-events .nodata').show();
            }
        },
        selectable: true,
        selectHelper: true,
        select: function(start, end, allDay) {

        },
        // 点击日历上的某一天的时候弹出信息
        dayClick: function(date,jsEvent,view){
            // console.log(date.format());
            createUrl(date.format());
        },
        eventAllow: function(dropInfo, draggedEvent){
        },
        // 点击日历中的某一日程时触发
        eventClick: function(calEvent, jsEvent, view) {
            // 弹出工单详细信息
            eventModal(calEvent);
        },
        eventMouseover: function(event, jsEvent, view){
            oriEvent=$.extend({}, event);
        },
        eventMouseout: function(event, jsEvent, view){
            //oriEvent=$.extend({}, event);
        },
        // 当日程事件渲染时触发事件
        eventRender: function(calEvent, element, view){
            // 当天标准工时获取
            if (new Date(calEvent.start).getTime() == new Date(getCurrentDate()).getTime()){
                basisHour = [];
                basisHour.push(calEvent.hour);
            }

            // 是否拖拽工单
            if (calEvent.drop == true) {
                if (ops.length) {
                    setTimeout(function () {
                        // 判断当前时间是否大于需要排的时间
                        var timeFlag = new Date(calEvent.start).getTime() >= new Date(getCurrentDate()).getTime() ? true : false;
                        // 判断当前拖动的时间是不是在今日之前
                        if (!timeFlag) {
                            LayerConfig('fail', '今天之前不可以再排！');
                            $('#calendar').fullCalendar('removeEvents');
                            $('#calendar').fullCalendar('renderEvents', validEvents);
                            return false;
                        }else{
                            if (oriEvent != null && timeFlag) {
                                if (calEvent.hour == 0){
                                    LayerConfig('fail', calEvent.start+'当前日期不可排！');
                                }else{
                                    // 将工单添加到工序
                                    actWDrag(oriEvent, calEvent);
                                }
                            } else {
                                if (oriEvent == null) {
                                    console.log(90909090);
                                }
                                $('#calendar').fullCalendar('removeEvents');
                                $('#calendar').fullCalendar('renderEvents', validEvents);
                            }
                        }

                    }, 0);
                    return false;
                }else{
                    LayerConfig('fail', '请选择工序！');
                    return false;
                }
            } else {

                var progressColor = '',
                    tip = '';
                if (calEvent.percent > 120) {
                    progressColor = 'danger';
                    tip = '<p class="dangertip">已超出最大生产能力</p>';
                } else if (calEvent.percent > 100) {
                    progressColor = 'palert';
                } else if (calEvent.percent > 0) {
                    progressColor = 'ori';
                } else {
                    progressColor = 'gray'
                }
                // var progressColor=calEvent.percent>120?'danger':calEvent.percent>100?'palert':'ori';
                var test = `
                    <div class="op-fc-wrap" data-hour="${calEvent.hour}" data-name="111">
                    <span>${calEvent.title}</span>
                    <div class="progress pos-rel ${progressColor}" data-percent="${calEvent.percent}%">
                        <div class="progress-bar" style="width:${calEvent.percent}%;"></div>
                    </div>
                    ${tip}
                    </div>`;
                $(element).find('.fc-content').html(test);
                if (calEvent.hour == 0) {
                    $(element).find('.fc-content').css('background', '#ccc');
                }
            }

        },
        eventAfterAllRender: function(view){
            setTimeout(function(){
                // 将得到的标准工时数组去重、去0
                var vasisArr = uniqueArry(basisHour);
                var index = vasisArr.indexOf(0);
                if (index > -1) {
                    vasisArr.splice(index, 1);
                }
                $('#basis-hour').html(vasisArr.join('|'));
                $('.fc-day-grid-container')[0].scrollTop=scrollTop;
            },0);
        }

    });
}

//获取生产订单
function getPo(fn){
    $('.event-list.work-order .bom-tree').html('');
    var ops_ids = JSON.stringify(getIds(ops))==='[]' ? '' : JSON.stringify(getIds(ops));
    AjaxClient.get({
        url: URLS['pro'].poinfo+"?page_no="+pageNo+"&page_size="+pageSize+"&sort=id&order=desc&operation_ids="+ops_ids+"&production_order_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                $('.event-list.work-order .bom-tree').html(createPro(rsp.results));
            }else{
                noData('暂无数据',10);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取待处理订单列表失败');
        }
    });
}

// 待选工单分页
function bindPagenationClickPo(totalData,pageSize,fn){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
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
            getPo(fn);
        }
    });
}

//获取生产任务
function getWt(ele,id,fn){
    var ops_ids = JSON.stringify(getIds(ops))==='[]' ? '' : JSON.stringify(getIds(ops));
    AjaxClient.get({
        url: URLS['pro'].wt+"?page_no="+pageWtNo+"&page_size="+pageWSize+"&sort=id&order=asc&"+_token+"&production_order_id="+id+"&operation_ids="+ops_ids,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // layer.close(layerLoading);
            var total_records=0;
            if(rsp&&rsp.paging){
                total_records=rsp.paging.total_records||0;
            }
            if(rsp.results && rsp.results.length){
                createWt(ele,rsp.results);
                var sele=ele.parent().siblings('.po-item');
                sele.find('.tree-folder-content').hide();
                sele.find('.expand-icon.pro').addClass('icon-plus').removeClass('icon-minus');
                if(total_records>pageWSize&&pageWtNo<Math.ceil(total_records/pageWSize)){
                    var more=`<div class="tree-folder wt-item more">
                       <div class="tree-folder-header">
                       <div class="flex-item">
                       <i class="expand-icon wt-more"></i>
                       <div class="tree-folder-name"><p class="item-name item-more item-wt-more" data-post-id="${id}">加载更多...</p></div></div></div>
                    </div> `;
                    ele.append(more);
                }
                setTimeout(function(){
                    changeEventHeight();
                },0);
            }else{
                // noData('暂无数据',6);
            }
            setTimeout(function(){
                fn&&typeof fn=='function'?fn():null;
            },20);
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('获取待处理任务列表失败');
        }
    });
}

//获取生产工单
function getWo(ele,id){
    AjaxClient.get({
        url: URLS['aps'].wo+"?page_no="+pageWoNo+"&page_size="+pageWSize+"&sort=id&order=asc&status=&"+_token+"&work_task_id="+id,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // layer.close(layerLoading);
            var total_records=0;
            if(rsp&&rsp.paging){
                total_records=rsp.paging.total_records||0;
            }
            if(rsp.results && rsp.results.length){
                createWo(ele,rsp.results,id);
                var sele=ele.parent().siblings('.wt-item');
                sele.find('.tree-folder-content').hide();
                sele.find('.expand-icon.wt').addClass('icon-plus').removeClass('icon-minus');
                if(total_records>pageWSize&&pageWoNo<Math.ceil(total_records/pageWSize)){
                    var more=`<div class="tree-item more">
                      <div class="flex-item">
                      <i class="expand-icon"></i>
                      <div class="tree-item-name"><p class="item-name item-more item-wo-more" data-post-id="${id}">加载更多...</p></div></div>  
                    </div>`;
                    ele.append(more);
                }
                setTimeout(function(){
                    changeEventHeight();
                },0);
            }else{
                LayerConfig('fail','请先拆单');
                $(this).addClass('icon-plus').siblings().find('.icon-minus').removeClass('.icon-minus');

                // 没有数据需要刷新wt
                // var pid=$('.expand-icon.pro.icon-minus').attr('data-id');
                // var pele=$('.expand-icon.pro.icon-minus').parents('.tree-folder-header').siblings('.tree-folder-content').html('');
                // pageWtNo=1;
                // getPo(pele);
            }
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('获取待处理任务列表失败');
        }
    });
}

//获取弹框生产工单
function getPopWo(ele,id) {
    AjaxClient.get({
        url: URLS['aps'].wo+"?page_no="+pagePopWoNo+"&page_size="+pageSize+"&sort=id&order=asc&status=0&"+_token+"&work_task_id="+id,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // layer.close(layerLoading);
            var totalData=rsp&&rsp.paging&&rsp.paging.total_records||0;
            createWOTable(ele,rsp&&rsp.results||[],0);
            if(totalData>pageSize&&pagePopWoNo<Math.ceil(totalData/pageSize)){
                $('#chooseWo .get-more').show();
            }else{
                $('#chooseWo .get-more').hide();
            }
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('获取待处理任务列表失败');
        }
    });
}

//获取弹框已排生产订单
function getPopsetWo(ele,id){
    AjaxClient.get({
        url: URLS['aps'].wo+"?page_no="+pagePopsetWoNo+"&page_size="+pageWSize+"&sort=id&order=asc&status=1&"+_token+"&work_task_id="+id,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // layer.close(layerLoading);
            var totalData=rsp&&rsp.paging&&rsp.paging.total_records||0;
            ele.html('');
            createWOTable(ele,rsp&&rsp.results||[],1);
            // if(totalData>pageSize){
            //     bindPagenationClick(totalData,pageSize,pagePopWoNo,'task');
            // }else{
            //     $('#pagenation.op').html('');
            // }
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('获取待处理任务列表失败');
        }
    });
}

//获取该天该工序下已排工单
function getOPWo(ele,opid,wst){
    AjaxClient.get({
        url: URLS['aps'].wo+"?page_no="+pagePopsetWoNo+"&page_size="+pageSize+"&sort=id&order=asc&status=1&"+_token+"&operation_id="+opid+"&work_station_time="+wst+"&work_shop_id="+ajaxOPData.workshop_id+"&work_center_id="+ajaxOPData.workcenter_id,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // layer.close(layerLoading);
            var totalData=rsp&&rsp.paging&&rsp.paging.total_records||0;
            ele.html('');
            createOPWoTable(ele,rsp&&rsp.results||[],1);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,pagePopsetWoNo,'opwo');
            }else{
                $('#pagenation.opwo').html('');
            }
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('获取待处理任务列表失败');
        }
    });
}

//粗排
function simplePlan(data,fn){
    AjaxClient.post({
        url: URLS['aps'].simplePlan,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                if (rsp.code == '200' && rsp.message == 'OK'){
                    LayerConfig('success','排产成功',function () {
                        layerEle=null;
                        hasOPEvent=null;
                        //重新渲染产能
                        getCapacity(vdate[0],vdate[vdate.length-1]);
                        calendar.fullCalendar('removeEvents');
                        $('#calendar').fullCalendar('renderEvents', validEvents);
                    });
                }
            }
            fn&&typeof fn=='function'?fn():null;
            var wtele=$('.tree-folder.wt-item[data-id='+data.work_task_id+']');
            if(!wtele.find('.icon-plus.expand-icon.wt').length){
                pageWoNo=1;
                wtele.find('.tree-folder-content').html('');
                getWo(wtele.find('.tree-folder-content'),data.work_task_id);
            }
            // $('#calendar').fullCalendar('removeEvents');
            // $('#calendar').fullCalendar('renderEvents', validEvents);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            calendar.fullCalendar('removeEvents');
            $('#calendar').fullCalendar('renderEvents', validEvents);
            console.log('排产失败');
            var message=rsp&&rsp.message?rsp.message:'排产失败,请重排';
            LayerConfig('fail',message);
        }
    });
}

//获取已用产能
function getCapacity(start,end){
    var urlLeft='&start='+start+'&end='+end+'&factory_id='+ajaxOPData.factory_id
        +'&work_shop_id='+ajaxOPData.workshop_id+'&work_center='+ajaxOPData.workcenter_id+"&operation_ids="+JSON.stringify(getIds(ops));
    AjaxClient.get({
        url: URLS['aps'].capacity+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // layer.close(layerLoading);
            calendar.fullCalendar( 'removeEvents');
            validEvents=createDateOp(ops,rsp&&rsp.results||[]);
            calendar.fullCalendar('renderEvents', validEvents);
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('获取待选工单列表失败');
        }
    });
}

//拆wo
function splitWo(data,taskid){
    AjaxClient.post({
        url: URLS['aps'].splitwo,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            // layer.close(layerLoading);
            layer.close(layerModal);
            //拆单成功，刷新wt
            pageWoNo=1;
            var ele=$('.tree-folder.wt-item[data-id='+taskid+']').find('.tree-folder-content').html('');
            getWo(ele,taskid);
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('排产失败');
            var message=rsp&&rsp.message?rsp.message:'拆单失败，请重拆';
            $('#split-input').parent().siblings('.errorMessage').html(message);
        }
    });
}

//删除已排工单
function deleteWo(id,fn){
    AjaxClient.get({
        url: URLS['aps'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            //删除成功
            fn&&typeof fn=='function'?fn():null;
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('删除工单失败');
            LayerConfig('fail','删除工单失败');
        }
    });
}

//获取工单详情
function getwoInfo(id,status){
    AjaxClient.get({
        url: URLS['aps'].woshow+"?"+_token+"&work_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                console.log(rsp.results);
                $('.wo-deinfo-wrap span.wt-number').html(rsp.results.wt_number);
                $('.wo-deinfo-wrap span.wt-input-number').val(rsp.results.wt_number);
                $('.wo-deinfo-wrap #workorder_time').html(dateFormat(rsp.results.work_station_time));
                $('.wo-deinfo-wrap #factory_name').html(rsp.results.factory_name);
                $('.wo-deinfo-wrap #workcenter_name').html(rsp.results.workcenter_name);
                $('.wo-deinfo-wrap #workshop_name').html(rsp.results.workshop_name);
                var indata=[],outdata=[];
                if(rsp.results.in_material){
                    indata=JSON.parse(rsp.results.in_material);
                }
                var inhtml=createwoDetail(indata,status);
                $('.basic-info.income .table_tbody').html(inhtml);
                if(rsp.results.out_material){
                    outdata=JSON.parse(rsp.results.out_material);
                }
                var outhtml=createwoDetail(outdata,status);
                $('.basic-info.outcome .table_tbody').html(outhtml);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取工单详情失败');
        }
    });
}


// 时间戳转换成指定格式日期
// dateFormat(11111111111111, 'Y年m月d日 H时i分')
function dateFormat (timestamp, formats) {
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

    var myDate = timestamp? new Date(timestamp*1000): new Date();

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

//生成订单列表
function createPro(data){
    var proele=$('.order-wrap');
    proele.find('.sales_order_code').html(data.sales_order_code);
    proele.find('.product').html(data.material_name);
    proele.find('.number').html(data.qty);
    proele.find('.scrap').html(data.scrap);
    proele.find('.start').html(dateFormat(data.start_date, 'Y-m-d'));
    proele.find('.end').html(dateFormat(data.end_date, 'Y-m-d'));
    var prohtml=`<div class="tree-folder po-item" data-id="${data.product_order_id}">
           <div class="tree-folder-header">
           <div class="flex-item">
           <i class="icon-minus expand-icon pro" data-id="${data.product_order_id}"></i>
           <div class="tree-folder-name"><p class="item-name has-child no-finish" data-post-id="${data.product_order_id}">${data.number}</p></div></div></div>
               <div class="tree-folder-content ">
               </div>
        </div> `;
    $('.event-list.work-order .bom-tree').html(prohtml);
    var pele=$('.tree-folder-header').siblings('.table_page .tree-folder-content').html('');
    createWt(pele,data.wt_info);
}

//生成任务列表
function createWt(ele,data){
    data.forEach(function(item,index){
        var wt_status = '',
            wt_color = '',
            wt_status1 = '';
        if(item.wt_status == 0){
            wt_status = '<span class="no-single-btn">未拆单</span>';
            wt_status1 = '未拆单';
            wt_color = 'no-single-btn';
        }else if(item.wt_status == 1){
            wt_status = '<span class="or-single-btn">已拆单</span>';
            wt_status1 = '已拆单';
            wt_color = 'or-single-btn';
        }else if(item.wt_status == 2){
            wt_status = '<span class="is-split-btn">已排完</span>';
            wt_status1 = '已排完';
            wt_color = 'is-single-btn';
        }
        var wtHtml=`<div class="tree-folder wt-item layer${item.level}" data-parent-code="${item.parent_code}" data-id="${item.wt_id}">
            <div class="tree-folder-header">
                <div class="flex-item">
                    <i class="icon-plus expand-icon wt" data-id="${item.wt_id}"></i>
                    ${item.wt_status == 1 ? '' : `<span class="wt-split" data-task-id="${item.wt_id}">拆</span>`}
                    <div class="tree-folder-name split-div" ${item.wt_status == 1 ? 'style="margin-left:0  !important;"' : ''}>
                        <p class="item-name has-child fc-event no-finish show_description" 
                            data-task-id="${item.wt_id}" 
                            data-post-id="${item.wt_id}" 
                            data-number="${item.number}"  
                            data-desc="
                            工单：${item.number}<br>
                            工序：${item.operation_name}<br>
                            出料编码：${item.item_no}<br>
                            出料名称：${item.out_material_name}<br>
                            数量：${item.qty}<br>
                            是否拆单：${wt_status1}<br>
                            已排完成度：${item.wt_completion}">
                                ${item.number}(${item.operation_name}) 
                                <span class="${wt_color}">已排完成度：${item.wt_completion}</span>
                                ${wt_status}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="tree-folder-content"></div>
                    </div> `;
        ele.append(wtHtml);
        ele.find('.tree-folder.wt-item:last-child').data('wtItem',item);
    });
    addWODrag(ele);
}

//生成生产工单
function createWo(ele,data,taskid){
    data.forEach(function(item){
        var woHtml=`<div class="tree-item" data-id="${item.work_order_id}">
            <div class="flex-item">
                <i class="item-dot expand-icon"></i>
                <span class="split ${item.status == 0 ? '' : `is-disabled`}" data-task-id="${taskid}" style="${item.status == 0 ? '' : `pointer-events: none;`}">拆</span>
                    <i class="fa fa-info-circle wo-deinfo"></i>
                    <div class="tree-item-name split-div">
                        <p class="item-name fc-event no-finish" 
                            data-task-id="${taskid}" 
                        data-post-id="${item.work_order_id}" 
                        data-number="${item.number}">
                        ${item.number}(数量:${item.qty}) 
                        <span class="right ${item.status == 0 ?`no-single`:`is-single`}">${item.status == 0 ?`未排`:`已排`}</span>
                    </p>
                </div>
            </div>  
        </div>`;
        ele.append(woHtml);
        ele.find('.tree-item:last-child').data('woItem',item);
    });
    addWODrag(ele);
}
//生成弹框生产工单
function createWOTable(ele,data,status){
    var woAllIds = [];
    if(data.length){
        // WT
        if(status==0){
            var noedit=$('#chooseWo .ability .el-radio-input.is-radio-checked').length||(!$('#chooseWo .ability .el-radio').length)?'':'noedit';
            data.forEach(function(item){
                var tr=`<tr class="tritem" data-id="${item.work_order_id}"  data-task-id="${item.work_task_id}">
                            <td>
                                <span class="el-checkbox_input woset ${noedit}">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </td>
                            <td>${item.number}</td>
                            <td>${item.qty}</td>
                        </tr>`;
                ele.append(tr);
                woAllIds.push(item.work_order_id);
                ele.find('tr:last-child').data('woItem',item);
            });
        }else{ //WO
            data.forEach(function(item){
                var tr=`<tr class="tritem" data-id="${item.work_order_id}"  data-task-id="${item.work_task_id}">
                            <td>${item.number}</td>
                            <td>${item.qty}</td>
                            <td>${item.operation_name}</td>
                            <td>${item.ability_name}</td>
                            <td>${item.total_workhour}</td>
                            <td>${item.qty*item.total_workhour}</td>
                        </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data('woItem',item);
            });
        }
    }else{
        var tr=`<tr class="tritem"><td colspan="${status==0?'3':'6'}">暂无数据</td></tr>`;
        ele.append(tr);
    }
}

//生成工序弹框里生产工单
function createOPWoTable(ele,data){
    var allWoTime = $('.wo-time').find('b').text();
    if(data.length){
        data.forEach(function(item){
            var tr=`<tr class="tritem" data-id="${item.work_order_id}" data-capacity="${item.total_workhour}">
                <td>${item.number}</td>
                <td>${item.qty}</td>
                <td>${item.ability_name}</td>
                <td>${item.total_workhour}</td>
                <td class="right">
                    <button class="el-button btn-wo-del" data-id="${item.work_order_id}">移除</button>
                </td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data('woItem',item);
        });
    }else{
        var tr=`<tr class="tritem"><td style="text-align: center;" colspan="6">暂无数据</td></tr>`;
        ele.append(tr);
    }
}
//获取工厂列表
function getFactory(){
    AjaxClient.get({
        url: URLS['aps'].factory+"?"+_token,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results && rsp.results.length){
                var lis=createLi(rsp.results);
                $('.el-form-item.factory .el-select-dropdown-list').append(lis);
            }
        },
        fail: function(rsp){
            console.log('获取工厂列表失败');
        }
    });
}

//获取车间列表
function getWorkShop(factoryid){
    AjaxClient.get({
        url: URLS['aps'].workshop+"?"+_token+"&factory_id="+factoryid,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results && rsp.results.length){
                var lis='<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>'+createLi(rsp.results);
                $('.el-form-item.workshop .el-select-dropdown-list').html(lis);
            }else{
                $('.el-form-item.workshop .el-select-dropdown-list').
                html('<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>');
            }
        },
        fail: function(rsp){
            console.log('获取车间列表失败');
        }
    });
}

//获取工作中心
function getWorkCenter(workshopid){
    AjaxClient.get({
        url: URLS['aps'].workcenter+"?"+_token+"&workshop_id="+workshopid,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results && rsp.results.length){
                var lis='<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>'+createLi(rsp.results);
                $('.el-form-item.workcenter .el-select-dropdown-list').html(lis);
            }else{
                $('.el-form-item.workcenter .el-select-dropdown-list').
                html('<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>');
            }
        },
        fail: function(rsp){
            console.log('获取车间列表失败');
        }
    });
}
//获取工序列表
function getOP(ele){
    var urlLeft='';
    for(var param in ajaxOPData){
        urlLeft+=`&${param}=${ajaxOPData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['aps'].newCapacity+"?"+_token+urlLeft,
        dataType: 'json',
        success:function (rsp) {
            var totalData=rsp&&rsp.paging&&rsp.paging.total_records||0;
            if(rsp&&rsp.results){
                createOps(ele,rsp.results);
            }else{
                //查询出错
                ele.html('<tr><td colspan="3" style="text-align: center;">查询出错，请重新搜索</td></tr>');
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,pageNo,'op');
            }else{
                $('#pagenation.op').html('');
            }
        },
        fail: function(rsp){
            console.log('获取车间列表失败');
            ele.html('<tr><td colspan="3" style="text-align: center;">查询出错，请重新搜索</td></tr>');
        }
    });
}

//生成li列表
function createLi(data){
    var lis='';
    if(data.length){
        data.forEach(function(item){
            lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        });
    }

    return lis;
}

//生成工序列表
function createOps(ele,data){
    ele.html('');
    if(data.length){
        data.forEach(function(item){
            var tr=`<tr class="op-item">
                <td>
                    <span class="el-checkbox_input op">
                        <span class="el-checkbox-outset"></span>
                    </span>
                </td>
                <td>${item.operation_code}</td>
                <td>${item.opeartion_name}</td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data('opItem',item);
        });
    }else{
        ele.html('<tr><td colspan="3" style="text-align: center;">暂无数据</td></tr>');
    }
}

//生成资源日历中所有的工序
function createDateOp(ops,res){
    var events=[];
    vdate.forEach(function(item){
        ops.forEach(function(pitem){
            var hour=0,
                usehour=0,
                copyAb=[],
                day=new Date(item).getDay();
            pitem.ability.forEach(function(aitem){
                hour+=aitem.capacity[day];
                aitem.todayCap=aitem.capacity[day];
            });
            var copyAbStr=JSON.stringify(pitem.ability);
            copyAb=JSON.parse(copyAbStr);
            if(res.length){
                res.forEach(function(ritem){
                    if(ritem.work_station_time==item&&ritem.operation_id==pitem.operation_id){
                        usehour+=ritem.power;
                        copyAb.forEach(function(pritem){
                            if(pritem.operation_to_ability_id==ritem.operation_ability_id){
                                pritem.usehour==undefined?pritem.usehour=0:null;
                                pritem.usehour+=ritem.power;
                                return false;
                            }
                        });
                    }
                });
            }
            var percent=hour==0?0:(usehour*100/hour).toFixed(2);
            var obj={
                id: pitem.operation_id,
                operation_id: pitem.operation_id,
                uniqueId: item+'-'+pitem.operation_id,
                title: pitem.opeartion_name,
                start: item,
                ability: copyAb,
                operation_code: pitem.operation_code,
                hour: hour,
                usehour: usehour,
                percent: percent
            };
            events.push(obj);
        });
    });
    return events;
}

//生成工时产能集合列表
function createTimeList(data){
    var trs=[];
    if(data.length){
        data.forEach(function(item){
            trs+=`<tr class="tritem" data-opa-id="${item.operation_to_ability_id}">
                <td>${item.ability_name}</td>
                <td>${item.todayCap}</td>
            </tr>`;
        });
    }

    return trs;
}

//生成工单树列表
function treeList(data,pid) {
    var bomTree = '';
    var children = getChildById(data, pid);
    children.forEach(function (item,index) {
        var hasChild = hasChilds(data, item.id);
        var eventClass=pid!=0?'fc-event':'';
        if(hasChild){
            bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
	           <div class="tree-folder-header">
	           <div class="flex-item">
	           <i class="icon-minus expand-icon"></i>
	           <div class="tree-folder-name"><p class="item-name has-child ${eventClass} no-finish" data-post-id="${item.id}">${item.name}</p></div></div></div>
	           <div class="tree-folder-content">
	             ${treeList(data, item.id)}
	           </div>
	        </div> `;
        }else{
            bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
	          <div class="flex-item">
	          <i class="item-dot expand-icon"></i>
	          <div class="tree-item-name"><p class="item-name ${eventClass} no-finish" data-post-id="${item.id}">${item.name}</p></div></div>  
	        </div>`;
        }
    });
    return bomTree;
}

//为工单添加拖拽事件
function addWODrag(ele){
    ele.find('.fc-event.no-finish').each(function() {
        var childFlag=false,data=null;
        if($(this).hasClass('has-child')){
            childFlag=true;
            data=$(this).parents('.tree-folder.wt-item').data('wtItem');
        }else{
            childFlag=false;
            data=$(this).parents('.tree-item').data('woItem');
        }
        $(this).data('event', {
            id: Number($(this).attr('data-post-id')),
            taskid: Number($(this).attr('data-task-id')),
            title: $.trim($(this).text()),
            operation_id: data.operation_id,
            group_step_withnames: data.group_step_withnames,
            operation_ability_pluck: data.operation_ability_pluck,
            operation_name: data.operation_name,
            qty: data.qty||0,
            hour: 40,
            hasChild: childFlag,
            allDay: false,
            drop: true,
            norender: true
        });
        /**
         * WT 或者 WO 已经排完的情况下禁止拖拽事件
         * WT 在没有拆单的情况下禁止拖动事件
         * WT 状态：
         *        wt_status: 0 (未拆单) 1（已拆完） 2（已排完）
         * WO 状态：
         *        status: 0（未排） 2（已排）
         */
        if($(this).hasClass('has-child')){
            if (data.wt_status == 1){
                $(this).draggable({
                    zIndex: 999,
                    revert: true,
                    revertDuration: 0,
                    start: function(event,ui){
                        oriEvent=null;
                    },
                    stop: function(event,ui){
                    }
                });
            }
        }else{
            if (data.status == 0){
                // 给 WO 元素添加拖拽事件
                $(this).draggable({
                    zIndex: 999,
                    revert: true,
                    revertDuration: 0,
                    start: function(event,ui){
                        oriEvent=null;
                    },
                    stop: function(event,ui){
                    }
                });
            }
        }

    });
}

//将工单添加到工序(直接或弹框)
function actWDrag(oriEvent,calEvent){
    if(oriEvent.hour == 0){
        LayerConfig('fail', oriEvent.uniqueId+'当前日期没有产能');
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('renderEvents', validEvents);
        return false;
    } else {
        var copyEvent = $.extend({}, oriEvent);
        if (calEvent.hasChild) {//拖拽的是生产任务(WT)，弹出工单选择弹框
            //相同工序才出弹框
            if (copyEvent.operation_id == calEvent.operation_id) {
                taskModal(copyEvent, calEvent);
            } else {//不同工序的提醒
                LayerConfig('fail', '当前工序不同');
                return false;
            }
        } else {//拖拽的是工单（WO）
            //validEvents 当前展示日历所有所有信息的集合
            validEvents.forEach(function (item) {
                if (item.uniqueId == oriEvent.uniqueId) {
                    if (item.operation_id == calEvent.operation_id) {//工序相同
                        var len = 0, arr_ability = [];
                        //判断calEvent的能力
                        if (calEvent.group_step_withnames) {
                            var group_step_withnames = JSON.parse(calEvent.group_step_withnames);
                            selectCapacity(arr_ability, group_step_withnames, oriEvent.ability, item, calEvent);
                        } else {
                            var operation_ability_id = 0,
                                abids = getUniqueId(item.ability, 'nouni'),
                                index = abids.indexOf(Number(arr_ability[0].operation_to_ability_id));
                            if (index == -1 || item.hour == 0 || item.ability[index].todayCap == 0) {
                                //不包含能力或总产能为0或对应能力产能为0
                                return false;
                            } else {
                                operation_ability_id = Number(arr_ability[0].operation_to_ability_id);
                            }
                            var ids = [],
                                id = calEvent.id;
                            ids.push(id);
                            var wowcid = $('#selectCapacity .woWcenter_from .woAbility').find('.el-radio-input.is-radio-checked'),
                                wowccheckid = wowcid.find('.wowkcapacity').val();
                            var postdata = {
                                _token: TOKEN,
                                ids: JSON.stringify(ids),
                                factory_id: ajaxOPData.factory_id,
                                work_shop_id: ajaxOPData.workshop_id,
                                work_center_id: ajaxOPData.workcenter_id,
                                operation_id: calEvent.operation_id,
                                operation_ability_id: wowccheckid,
                                work_station_time: getCurrentDate(new Date(calEvent.start)),
                                work_task_id: calEvent.taskid
                            };
                            simplePlan(postdata, function () {
                                item.ability.forEach(function (aitem) {
                                    if (aitem.operation_to_ability_id == arr_ability[0].operation_to_ability_id) {
                                        aitem.usehour == undefined ? aitem.usehour = 0 : null;
                                        aitem.usehour += arr_ability[0].hour * calEvent.qty;
                                        item.usehour += arr_ability[0].hour * calEvent.qty;
                                        item.percent = (item.usehour * 100 / item.hour).toFixed(2);
                                    }
                                    return false;
                                });
                                $('#calendar').fullCalendar('removeEvents');
                                $('#calendar').fullCalendar('renderEvents', validEvents);
                            });
                        }
                        // for(var type in ability){
                        //     len++;
                        //     var obj={
                        //         operation_to_ability_id: type,
                        //         ability_name: ability[type].name,
                        //         hour: ability[type].standard_working_hours
                        //     };
                        //     arr_ability.push(obj);
                        // }
                        // if(arr_ability.length>1){//大于一个出弹框
                        //     selectCapacity(arr_ability,group_step_withnames,oriEvent.ability,item,calEvent);
                        // }else if(arr_ability<1){//不包含能力出提醒
                        //     LayerConfig('fail','该工序不包含此能力，请先去添加');
                        //     $('#calendar').fullCalendar('removeEvents');
                        //     $('#calendar').fullCalendar('renderEvents', validEvents);
                        // }else{//直接判断该工序是否包含该能力，包含直接对应能力相加
                        //     var operation_ability_id=0,
                        //         abids=getUniqueId(item.ability,'nouni'),
                        //         index=abids.indexOf(Number(arr_ability[0].operation_to_ability_id));
                        //     if(index==-1||item.hour==0||item.ability[index].todayCap==0){
                        //         //不包含能力或总产能为0或对应能力产能为0
                        //         return false;
                        //     }else{
                        //         operation_ability_id=Number(arr_ability[0].operation_to_ability_id);
                        //     }
                        //     var ids=[],
                        //         id=calEvent.id;
                        //     ids.push(id);
                        //     var postdata={
                        //         _token: TOKEN,
                        //         ids: JSON.stringify(ids),
                        //         factory_id: ajaxOPData.factory_id,
                        //         work_shop_id: ajaxOPData.workshop_id,
                        //         work_center_id: ajaxOPData.workcenter_id,
                        //         operation_id: item.operation_id,
                        //         operation_ability_id: operation_ability_id,
                        //         work_station_time: getCurrentDate(new Date(copyEvent.start)),
                        //         work_task_id: calEvent.taskid
                        //     };
                        //     simplePlan(postdata,function(){
                        //         item.ability.forEach(function(aitem){
                        //             if(aitem.operation_to_ability_id==arr_ability[0].operation_to_ability_id){
                        //                 aitem.usehour==undefined?aitem.usehour=0:null;
                        //                 aitem.usehour+=arr_ability[0].hour*calEvent.qty;
                        //                 item.usehour+=arr_ability[0].hour*calEvent.qty;
                        //                 item.percent=(item.usehour*100/item.hour).toFixed(2);
                        //             }
                        //             return false;
                        //         });
                        //         $('#calendar').fullCalendar( 'removeEvents');
                        //         $('#calendar').fullCalendar('renderEvents', validEvents);
                        //     });
                        //     // $('.item-name.fc-event[data-post-id='+calEvent.id+']')
                        //     // .addClass('finish').removeClass('no-finish').draggable( "destroy" );
                        // }
                    } else {
                        LayerConfig('fail', '请选择相同的工序');
                        return false;
                    }
                    return false;
                }
            });

            //第二种，多调用eventRender一次
            // oriEvent.usehour+=calEvent.hour;
            // oriEvent.percent=(oriEvent.usehour*100/oriEvent.hour).toFixed(2);
            // calendar.fullCalendar( 'removeEvents',calEvent.id);
            // calendar.fullCalendar( 'updateEvent',oriEvent);
        }
    }
}

// WO 能力选择弹框
function selectCapacity(data,capacity,ability,item,calEvent){
    var height=($(window).height()-200)+'px',
        title=`<p class="wo-title">选择<span style="color: #21a0ff;font-size: 16px;">${item.title}</span>下的能力</p>`;
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '80px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="selectCapacity formModal formMateriel" id="selectCapacity">
            <input type="hidden" id="wtTaskId" />
            <div class="el-tap-wrap edit">
                <span data-item="woWcenter_from" class="el-tap active">工作中心</span>
                <span data-item="woAbs_from" class="el-tap">能力</span>
            </div>
            <div class="el-panel-wrap" style="margin-top: 20px;">
                <div class="el-panel woWcenter_from active">
                    <div class="woAbility"></div>
                </div>
                <div class="el-panel woAbs_from">
                    <div class="chooseWOAbility tabbable tabs-left">
                        <ul id="chooseWOCapacityTab" class="nav nav-tabs">
                        </ul> 
                        <div id="chooseWOCapacityPane" class="tab-content">
                        </div>
                    </div>
                </div>
            </div>
            <p class="errorMessage" style="text-align: right;display: block"></p>
            <div class="el-form-item btnShow">
                <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                    <button type="button" class="el-button el-button--primary submit capacity-submit">确定</button>
                </div>
            </div>   
        </form>` ,
        success: function(layero,index){
            layerEle=layero;
            var taskid=calEvent.taskid;
            $('#wtTaskId').val(taskid);
            // WO 工作中心下的能力列表
            if (ability.length){
                ability.forEach(function(item){
                    var wkdivs=`<div class="womodal-wrap">
                        <label class="el-radio">
                            <span class="el-radio-input">
                                <span class="el-radio-inner"></span>
                                <input class="wowkcapacity" type="hidden" value="${item.operation_to_ability_id}">
                            </span>
                            <span class="el-radio-label">${item.ability_name}</span>
                        </label></div>`;
                    $('#selectCapacity .woWcenter_from .woAbility').append(wkdivs);
                    $('#selectCapacity .woWcenter_from .woAbility').find('.el-radio:last-child').data('wccapacity',item);
                });
            }
            // WO 下面的工艺路线步骤列表
            if(capacity.length){
                capacity.forEach(function(bzwoitem,bzwoindex){
                    var stepsWOList = `
                            <li class="${(bzwoindex+1)==1?`active`:''}" data-base-step-id="${bzwoitem.base_step_id}"  data-op-id="${bzwoitem.operation_id}">
                                <a data-toggle="tab" href="#wobuzhou${bzwoindex}" aria-expanded="${(bzwoindex+1) == 1 ?true:false}">
                                <i class="item-dot expand-icon"></i>
                                ${bzwoitem.step_name}
                            </a>
                        </li>`;
                    $('#selectCapacity #chooseWOCapacityTab').append(stepsWOList);
                    $('#selectCapacity #chooseWOCapacityTab').find('.item-dot:last-child').data('stepsWOList',bzwoitem);

                    var stepsWOListAbility = bzwoitem.abilitys,
                        abWOList=[],abilityWOList='',tab_wocontent='';
                    // WO 组装能力数组
                    for (var woi in stepsWOListAbility){
                        var abWOObj = {
                            ability_id: woi,
                            ability_name: stepsWOListAbility[woi]
                        };
                        abWOList.push(abWOObj);
                    }
                    // WO 步骤下面的能力
                    if(abWOList.length){
                        abWOList.forEach(function (abwoitem,abwoindex) {
                            abilityWOList += `<div class="womodal-wrap">
                               <label class="el-radio">
                                    <span class="el-radio-input">
                                        <span class="el-radio-inner"></span>
                                        <input class="wocapacity_gxid" type="hidden" value="${bzwoitem.base_step_id}">
                                        <input class="wocapacity_id" type="hidden" value="${abwoitem.ability_id}">
                                    </span>
                                    <span class="el-radio-label">${abwoitem.ability_name}</span>
                                </label>
                             </div>`;
                        });
                    }
                    tab_wocontent = `<div id="wobuzhou${bzwoindex}" class="tab-pane ${(bzwoindex + 1) == 1 ?`active`:''}">${abilityWOList}</div>`;
                    $('#chooseWOCapacityPane').append(tab_wocontent);
                    $('#selectCapacity .woAbs_from #chooseWOCapacityPane').find('.modal-wrap:last-child').data('capacity',bzwoitem);
                });
            }
            // if(data){
            //     data.forEach(function(item){
            //         var divs=`<div class="capacity-wrap">
            //         <label class="el-radio">
            //             <span class="el-radio-input">
            //                 <span class="el-radio-inner"></span>
            //                 <input class="capacity" type="hidden" value="${item.operation_to_ability_id}">
            //             </span>
            //             <span class="el-radio-label">${item.ability_name}</span>
            //         </label>
            //     </div>`;
            //         $('#selectCapacity .woAbs_from .modal-wrap').append(divs);
            //         $('#selectCapacity .woAbs_from .modal-wrap').find('.capacity-wrap:last-child').data('capacity',item);
            //     });
            // }

            //确定工序下的能力
            $('.capacity-submit').off('click').on('click',function(e){
                e.stopPropagation();
                e.preventDefault();

                var workWOCenter = $('#selectCapacity .woWcenter_from .woAbility').find('.el-radio-input.is-radio-checked');
                var absWOChoose = $('#selectCapacity .woAbs_from .tab-pane').find('.el-radio-input.is-radio-checked');
                var absWOLastChoose = $('#selectCapacity .woAbs_from .tab-pane').last().find('.el-radio-input.is-radio-checked');
                // 判断工作中心选择能力
                if (workWOCenter.length){
                    var workWOCenterId = workWOCenter.find('.wowkcapacity').val();
                    console.log(workWOCenterId);
                }else{
                    $('#selectCapacity .errorMessage').text('请选择工作中心能力！');
                    return false;
                }
                // 判断多个步骤的能力选择（进料必须选择能力）
                if (absWOLastChoose.length){
                    // 将步骤中选中的能力添加到数组
                    // 将当前步骤中的步骤和能力添加到object对象中
                    var absWOChooseId_arr=[],absWOChooseId_Obj={};
                    absWOChoose.each(function (k,v) {
                        var absWOChooseGxId = $(v).find('.wocapacity_gxid').val();
                        var absWOChooseId = $(v).find('.wocapacity_id').val();
                        absWOChooseId_Obj[absWOChooseGxId] = absWOChooseId;
                        absWOChooseId_arr.push(absWOChooseId);
                    });
                    // 判断步骤中选择的能力是否相同
                    // for(var i=1,len=absWOChooseId_arr.length;i<len;i++) {
                    //     if (absWOChooseId_arr[i] !== absWOChooseId_arr[0]) {
                    //         $('#selectCapacity .errorMessage').text('请选择相同能力！')
                    //         return false;
                    //     }
                    // }
                }else{
                    $('#selectCapacity .errorMessage').text('出料的能力必须选择！');
                    return false;
                }
                var ids=[],
                    id=calEvent.id,
                    task_id=$('#wtTaskId').val();
                ids.push(id);

                // 判断工作中心和步骤中选择的能力是否相同
                if (workWOCenterId == absWOChooseId_arr[absWOChooseId_arr.length-1]){
                    var wopostdata={
                        _token: TOKEN,
                        ids: JSON.stringify(ids),
                        workshop_id: ajaxOPData.workshop_id,
                        workcenter_id: ajaxOPData.workcenter_id,
                        workcenter_operation_to_ability_id: workWOCenterId,
                        all_select_abilitys: JSON.stringify(absWOChooseId_Obj),
                        week_date: getCurrentDateWeek(new Date(calEvent.start))
                    };
                    checkCanPlan(wopostdata,calEvent,ids,absWOChooseId_Obj,workWOCenterId,task_id);
                    $('#calendar').fullCalendar('removeEvents');
                    $('#calendar').fullCalendar('renderEvents', calEvent);
                }else{
                    $('#selectCapacity .errorMessage').text('工作中心和步骤中出料选择的能力必须相同！');
                    return false;
                }

                var ele=$('#selectCapacity .el-radio-input.is-radio-checked');
                if(!ele.length){
                    $('#selectCapacity .errorMessage').show();
                    return false;
                }
                // var selectcap=ele.parents('.capacity-wrap').data('capacity');
                // var index=getUniqueId(validEvents,'unique').indexOf(item.uniqueId),
                //     abIds=getUniqueId(validEvents[index].ability,'notu'),
                //     abindex=abIds.indexOf(Number(selectcap.operation_to_ability_id));
                //
                // if(abindex==-1||validEvents[index].hour==0||validEvents[index].ability[abindex].todayCap==0){
                //     LayerConfig('fail','该工序不包含此能力或总产能为0或对应能力产能为0',function(){
                //         $('#calendar').fullCalendar('removeEvents');
                //         $('#calendar').fullCalendar('renderEvents', validEvents);
                //         layer.close(layerModal);
                //     });
                //     return false;
                // }
                // var ids=[],
                //     id=calEvent.id;
                // ids.push(id);
                // var postdata={
                //     _token: TOKEN,
                //     ids: JSON.stringify(ids),
                //     factory_id: ajaxOPData.factory_id,
                //     work_shop_id: ajaxOPData.workshop_id,
                //     work_center_id: ajaxOPData.workcenter_id,
                //     operation_id: calEvent.operation_id,
                //     operation_ability_id: selectcap.operation_to_ability_id,
                //     work_station_time: getCurrentDate(new Date(calEvent.start)),
                //     work_task_id: calEvent.taskid
                // };
                // simplePlan(postdata,function(){
                //     validEvents[index].ability.forEach(function(aitem){
                //         if(aitem.operation_to_ability_id==selectcap.operation_to_ability_id){
                //             aitem.usehour==undefined?aitem.usehour=0:null;
                //             aitem.usehour+=selectcap.hour*calEvent.qty;
                //             validEvents[index].usehour+=selectcap.hour*calEvent.qty;
                //             validEvents[index].percent=(validEvents[index].usehour*100/validEvents[index].hour).toFixed(2);
                //         }
                //         return false;
                //     });
                //     $('#calendar').fullCalendar('removeEvents');
                //     $('#calendar').fullCalendar('renderEvents', validEvents);
                // });
                layer.close(layerModal);
            });
        },
        cancel: function (layero, index) {//右上角关闭按钮
            layer.close(layerModal);
            layerEle=null;
            $('#calendar').fullCalendar('removeEvents');
            //$('#calendar').fullCalendar('renderEvents', calEvent);
            $('#calendar').fullCalendar('renderEvents', validEvents);
        },
        end: function(){
            layerEle=null;
            $('#calendar').fullCalendar('removeEvents');
            $('#calendar').fullCalendar('renderEvents', validEvents);
        }
    });
}

//生成工单详情表格
function createwoDetail(data,status){
    var trs='';
    if(data&&data.length){
        data.forEach(function (item) {
            var mattrs=item.material_attributes,
                opattr=item.operation_attributes,
                imgs=item.drawings,
                mattrhtml='',
                opattrhtml='',
                imghtml='';
            mattrs.length&&mattrs.forEach(function (k,v) {
                mattrhtml+=`<p><span>${k.name}: </span><span>${k.value}${k.unit?k.unit:''}</span></p>`;
            });
            opattr.length&&opattr.forEach(function (k,v) {
                opattrhtml+=`<p><span>${k.name}: </span><span>${k.value}${k.unit?k.unit:''}</span></p>`;
            });
            imgs.length&&imgs.forEach(function (k,v) {
                imghtml+=`<p attachment_id="${k.drawing_id}" data-creator="${k.creator_name}" data-ctime="${k.ctime}" data-url="${k.image_path}"  title="${k.name}"><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="80" height="40" src="/storage/${k.image_path}" data-src="/storage/${k.image_path}" alt="${k.name}"></p>`;
            });
            trs+=`<tr>
            <td>${item.item_no}</td>
            <td>${item.name}</td>
            <td>${item.qty} [${item.commercial}]</td>
            <td>${mattrhtml}</td>
            <td>${opattrhtml}</td>
            <td>${imghtml}</td>
            <td>${status == 0 ? `未排` : `已排`}</td>
        </tr>`;
        });
    }else{
        trs='<tr><td colspan="5">暂无数据</td></tr>';
    }
    return trs;
}

//工单详情弹框
function woInfoModal(data,wt_number) {
    var height=($(window).height()-250)+'px';
    var title=`工单${data.number}详情`;
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '80px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="wo-deinfo-wrap" style="max-height: ${height};overflow-y: auto;position: relative;">
        <div class="qrcode-conten">
            <div id="qrcode" style="width:100px; height:100px;">
                <div id="qrCodeIco"></div>
            </div>
        </div>
        <div class="block-div" style="height: 100px;">
            <div class="basic-infos">
                <p><span>&nbsp;&nbsp;工艺单号：<span class="highlight wt-number"></span><input type="hidden" class="wt-input-number"> </span></p>
                <p><span>&nbsp;&nbsp;数量：<span class="highlight">${data.qty}</span></span>&nbsp;&nbsp;&nbsp;&nbsp;<span>工序：<span class="highlight">${data.operation_name}</span></span></p>
            </div>
        </div>
        ${data.status == 1 ? `<div class="block-div">
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
        </div>`:''}
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
		                        <tr><td colspan="5">暂无数据</td></tr>
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
		                        <tr><td colspan="5">暂无数据</td></tr>
		                      </tbody>
		                    </table>
		                </div>
		          	</div>
            </div>
        </div>
    </div>` ,
        success: function(layero,index){
            getwoInfo(data.work_order_id,data.status);
            //二维码
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 100,
                height: 100,
            });
            //控制Logo图标的位置
            var margin = ($("#qrcode").height() - $("#qrCodeIco").height()) / 2;
            $("#qrCodeIco").css("margin", margin);
            var unit = $('.unit').text(),
                sale_to_num = $('.sales_order_code').text();
            makeCode(data.number, wt_number, sale_to_num, data.item_no, data.qty, qrcode);
        },
        cancel: function(index,layero){
        },
        end: function(){
        }
    });
}

//二维码
function makeCode(wo_number, wt_number, po_number, item_no, qty, qrcode) {
    var elText = "工单：" + wo_number + "\r\n 工艺单：" + wt_number + "\r\n 销售订单号：" + po_number + "\r\n 工单数量：" + qty;
    qrcode.makeCode(elText);
}
//工序选择弹框
function selectOPModal(){
    var height=($(window).height()-200)+'px';
    layerModal=layer.open({
        type: 1,
        title: '选择工序',
        offset: '100px',
        area: '750px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="selectOP formModal formMateriel" id="selectOP">
            <div class="search-wrap">
                <div class="searchItem">
                    <div class="el-form-item factory">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">工厂<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="factory_id" value="0">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="0" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item workshop">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">车间<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="workshop_id" value="0">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="0" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item workcenter">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 90px;">工作中心</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="workcenter_id" value="0">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="0" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item  btn-div">
                        <div class="el-form-item-div">
                            <button class="el-button el-button--primary btn-search-op">搜索</button>
                        </div>
                    </div>
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="modal-wrap">
                <div class="table_page">
                    <div id="pagenation" class="pagenation op"></div>
                    <div class="table-wrap" style="max-height: ${height};overflow-y: auto;">
                        <table class="sticky uniquetable commontable">
                          <thead>
                            <tr>
                              <th>选择</th>
                              <th>工序编码</th>
                              <th>工序名称</th>
                            </tr>
                          </thead>
                          <tbody class="table_tbody">
                            <tr>
                                <td colspan="3" style="text-align: center;">暂无数据，请搜索</td>
                            </tr>
                          </tbody>
                        </table>
                    </div>
                </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary submit op-submit is-disabled">确定</button>
            </div>
          </div>   
        </form>` ,
        success: function(layero,index){
            layerEle=layero;
            getLayerSelectPosition($(layero));
            getFactory();
        },
        end: function(){
            layerEle=null;
        }
    });
}

//生产任务弹框
function taskModal(copyEvent,task){
    var height=($(window).height()-250)+'px';
    var labelWidth=100,
        title=`选择${task.title}下的工单`;
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '80px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="chooseWO formModal formMateriel" id="chooseWo">
            <div class="page-content tap-wrap">
                <input type="hidden" id="copyEvent" />
                <input type="hidden" id="wtTaskId" />
                <div class="el-tap-wrap edit">
                    <span data-item="no_from" class="el-tap active">工作中心</span>
                    <span data-item="has_from" class="el-tap">能力</span>
                </div>
                <div class="el-panel-wrap" style="margin-top: 20px;">
                    <div class="el-panel no_from active">
                        <div class="ability-wrap"><div class="ability"></div></div>
                        <div class="table_page" style="display: none;">
                            <div class="table-wrap" style="max-height: ${height};overflow-y: auto;">
                                <table id="noset" class="sticky uniquetable commontable">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>工单编码</th>
                                            <th>数量</th>
                                        </tr>
                                    </thead>
                                    <tbody class="table_tbody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="el-panel has_from">
                        <div class="table_page">
                            <div class="table-wrap selectWTCapacity" style="max-height: ${height};overflow-y: auto;">
                                <div class="chooseWTAbility tabbable tabs-left">
                                    <ul id="chooseWTAbilityTab" class="nav nav-tabs">
                                        
                                    </ul> 
                                    <div id="chooseWTAbilityPane" class="tab-content">
        
                                    </div>
                                </div>
                                <div class="clearfix"></div>
                                
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="text-align: right;display:block;"></p> 
                </div>
                <div class="el-form-item btn-item">
                    <div class="el-form-item-div">
                        <button class="el-button el-button--primary choose-wo-ok">确定</button>
                    </div>
                </div>
            </div>
        </form>`,
        success: function(layero,index){
            if(task){
                // 工艺路线步骤
                var group_step_withnames = JSON.parse(task.group_step_withnames),
                    stepsList='';
                if(group_step_withnames.length){
                    group_step_withnames.forEach(function(bzitem,bzindex){
                        stepsList = `
                            <li class="${(bzindex+1)==1?`active`:''}" data-base-step-id="${bzitem.base_step_id}"  data-op-id="${bzitem.operation_id}">
                                <a data-toggle="tab" href="#buzhou${bzindex}" aria-expanded="${(bzindex+1) == 1 ?true:false}">
                                <i class="item-dot expand-icon"></i>
                                ${bzitem.step_name}
                            </a>
                        </li>`;
                        $('#chooseWTAbilityTab').append(stepsList);
                        $('#chooseWTAbilityTab').find('.item-dot:last-child').data('stepsList',bzitem);
                        // 工艺路线步骤下面能力
                        var stepsListAbility = bzitem.abilitys,
                            abList=[];
                        for (var i in stepsListAbility){
                            var abObj = {
                                ability_id: i,
                                ability_name: stepsListAbility[i]
                            };
                            abList.push(abObj);
                        }
                        var abilityList='',
                            tab_content='';
                        if(abList.length){
                            abList.forEach(function (abitem,abindex) {
                                abilityList += `<div class="modal-wrap">
                                       <label class="el-radio">
                                            <span class="el-radio-input">
                                                <span class="el-radio-inner"></span>
                                                <input class="capacity_id" type="hidden" value="${abitem.ability_id}">
                                                <input class="capacity_gxid" type="hidden" value="${bzitem.base_step_id}">
                                            </span>
                                            <span class="el-radio-label">${abitem.ability_name}</span>
                                        </label>
                                     </div>`;
                            });
                        }
                        tab_content = `<div id="buzhou${bzindex}" class="tab-pane ${(bzindex + 1) == 1 ?`active`:''}">${abilityList}</div>`;
                        $('#chooseWTAbilityPane').append(tab_content);
                    });
                }

                // var abs=[],
                //     ability=JSON.parse(task.operation_ability_pluck);
                // for(var type in ability){
                //     var obj={
                //         operation_to_ability_id: type,
                //         ability_name: ability[type].name,
                //         hour: ability[type].standard_working_hours
                //     };
                //     abs.push(obj);
                // }
                var sameAb=[];
                copyEvent.ability.forEach(function(item){//把工序和工单中相同的能力筛选出来
                    sameAb.push(item);
                });

                // 获取工作中心能力
                var divs='';
                if(sameAb.length){
                    sameAb.forEach(function(item){
                        divs += `<div class="modal-wrap">
                        <label class="el-radio">
                            <span class="el-radio-input">
                                <span class="el-radio-inner"></span>
                                <input class="capacity" type="hidden" value="${item.operation_to_ability_id}">
                            </span>
                            <span class="el-radio-label">${item.ability_name}</span>
                        </label></div>`;

                        $('#chooseWo .no_from .ability-wrap .ability').find('.el-radio:last-child').data('capacity',item);
                    });
                    $('#chooseWo .no_from .ability-wrap .ability').html(divs);
                    taskid=task.id;
                    $('#wtTaskId').val(taskid);
                    getPopWo($('#chooseWo #noset .table_tbody'),task.id);
                }else{
                    //工序相同，但工单和日历中的工序能力不同，请为该工序添加能力
                    $('#error').html('工序相同，但工单和日历中的工序能力不同，请为该工序添加能力');
                }
            }
            getPopsetWo($('#chooseWo #hasset .table_tbody'),taskid);
            opEvent=copyEvent;
            var newEvent=$.extend(true,{},copyEvent);
            $('#copyEvent').data('opEvent',newEvent);
        },
        cancel: function(index,layero){
            calendar.fullCalendar( 'removeEvents');
            $('#calendar').fullCalendar('renderEvents', validEvents);
        },
        end: function(){
            opEvent=null;
            pagePopWoNo=1;
            pagePopsetWoNo=1;
            wtWos=[];
            taskid=0;
            var iconele=$('.expand-icon.pro.icon-minus');
            if(iconele.length){
                var opid=iconele.attr('data-id');
                var pele=iconele.parents('.tree-folder-header').siblings('.tree-folder-content').html('');
                pageWtNo=1;
                getWt(pele,opid,function(){
                    if(!pele.find('.tree-folder.wt-item').length){
                        $('.event-list.work-order .bom-tree').html('');
                        pagePoNo++;
                        getPo();
                    }
                });
            }
        }
    });
}

//编辑工序下工单弹框
function eventModal(calEvent){
    hasOPEvent=$.extend(true,{},calEvent);
    var height=($(window).height()-200)+'px';
    var labelWidth=100,
        title=`<p class="wo-title"><span>${calEvent.title}</span>
        <span>(${calEvent.operation_code})</span>
        <span class="wo-time">标准工时: <b>${calEvent.hour}</b>[s]</span>
        <span class="wo-percent">占用比: <b>${calEvent.percent}%</b></span></p>`;
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '700px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="editWO formModal formMateriel" id="editWO">
      		<div class="el-tap-wrap edit">
	            <span data-item="wo_from" class="el-tap active">已排工单</span>
	            <span data-item="time_from" class="el-tap">工时产能集合</span>
	        </div>
            <div class="modal-wrap">
            <div class="el-panel-wrap" style="margin-top: 20px;">
            	<div class="el-panel wo_from active">
            		<div class="table_page">
                        <div id="pagenation" class="pagenation opwo"></div>
		                <div class="table-wrap" style="max-height: ${height};overflow-y: auto;">
		                    <table class="sticky uniquetable commontable">
		                      <thead>
		                        <tr>
		                          <th>工单号</th>
                                  <th>数量[PCS]</th>
                                  <th>所排能力</th>
                                  <th>所占产能[s]</th>
		                          <th class="right">操作</th>
		                        </tr>
		                      </thead>
		                      <tbody class="table_tbody">
		                      </tbody>
		                    </table>
		                </div>
		          	</div>
            	</div>
            	<div class="el-panel time_from">
            		<div class="table_page">
		                <div class="table-wrap" style="max-height: ${height};overflow-y: auto;">
		                    <table class="sticky uniquetable commontable">
		                      <thead>
		                        <tr>
		                          <th>能力</th>
                                  <th>时长[s]</th>
		                        </tr>
		                      </thead>
		                      <tbody class="table_tbody">${createTimeList(calEvent.ability)}</tbody>
		                    </table>
		                </div>
		          	</div>
            	</div>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            layerEle=layero;
            getOPWo($('#editWO .el-panel.wo_from .table_tbody'),calEvent.operation_id,getCurrentDate(new Date(calEvent.start)));
        },
        end: function(){
            layerEle=null;
            hasOPEvent=null;
            if(deleteFlag){// 有工单删除了，刷新待选工单并重新渲染产能
                // 刷新待选工单
                // 不改变树结构模式
                var treeObj={};
                $('.expand-icon.pro.icon-minus').length?treeObj.proId=$('.expand-icon.pro.icon-minus').attr('data-id'):null;
                $('.expand-icon.wt.icon-minus').length?treeObj.wtId=$('.expand-icon.wt.icon-minus').attr('data-id'):null;
                $('#external-events .bom-tree').html('');
                getPo(function(){
                    if(treeObj.proId!=undefined&&$('.tree-folder.po-item[data-id='+treeObj.proId+']').length){
                        var ele=$('.tree-folder.po-item[data-id='+treeObj.proId+']');
                        pele=ele.find('.tree-folder-content').html('');
                        ele.find('.expand-icon.pro').addClass('icon-minus').removeClass('icon-plus');
                        getWt(pele,treeObj.proId,function(){
                            if(treeObj.wtId!=undefined&&$('.tree-folder.wt-item[data-id='+treeObj.wtId+']').length){
                                var ele=$('.tree-folder.wt-item[data-id='+treeObj.wtId+']');
                                pele=ele.find('.tree-folder-content').html('');
                                ele.find('.expand-icon.wt').addClass('icon-minus').removeClass('icon-plus');
                                getWo(pele,treeObj.wtId);
                            }
                        });
                    }
                });
                //重新渲染产能
                getCapacity(vdate[0],vdate[vdate.length-1]);
            }
            deleteFlag=false;
        }
    });
}
//拆单
function splitModal(data){
    var height=($(window).height()-200)+'px';
    layerModal=layer.open({
        type: 1,
        title: '拆单',
        offset: '100px',
        area: '350px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="splitwo formModal formMateriel" id="splitwo">
            <div class="modal-wrap" style="max-height: ${height};overflow-y: auto;">
                <div class="woinfo">
                    <p><span>工单号：<span class="highlight">${data.number}</span></span></p>
                    <p><span>数量：<span class="highlight">${data.qty}</span></span>&nbsp;&nbsp;&nbsp;&nbsp;<span>工序：<span class="highlight">${data.operation_name}</span></span></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: 76px;flex: none;">拆出数量<span class="mustItem">*</span></label>
                        <input type="number" data-qty="${data.qty}" id="split-input" class="el-input" value="">
                    </div>
                    <p class="errorMessage" style="display: block;"></p>
                </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" data-id="${data.work_order_id}" data-task-id="${data.work_task_id}" class="el-button el-button--primary submit wo-split-submit">确定</button>
            </div>
          </div>   
        </form>` ,
        success: function(layero,index){
            layerEle=layero;
        },
        end: function(){
            layerEle=null;
        }
    });
}
//生产进度订单
function orderModal(){
    var height=$(window).height()<770?'500px':'650px';
    layerModal=layer.open({
        type: 1,
        title: '查看订单生产排程',
        area: ['1240px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<div class="gantt-all-wrap">
      <div class="tophead clearfix">
		<div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label">时间筛选</label>
                <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
            </div>
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label">订单编码</label>
                <input type="text" class="el-input"  placeholder="订单编码" />
            </div>
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div">
                <button class="el-button el-button--primary">搜索</button>
            </div>
        </div>
      </div>
      <div class="gantt-div-wrap">
      	<div class="GanttWrap" style="height: ${height};"></div>
      	</div>
      </div>` ,
        success: function(layero,index){
            // 当前日期开始时间和结束时间（vdate[0],vdate[vdate.length-1]
            var ganttChart = function() {
                $(".GanttWrap").GanttTool({
                    'startDate': vdate[0],
                    'endDate': vdate[vdate.length-1],
                    'ajaxUrl': null,
                    'arrdata': json,
                    'layer': layero,
                    'parameters': {}, //其他参数
                    'fn': null //回调方法
                });
            };
            ganttChart();
        },
        end: function(){
        }
    });
}

function fullscreen(){
    var fsElement = document.getElementById('all-wrap');
    if (fsElement.requestFullscreen) { //w3c
        fsElement.requestFullscreen();
    }else if (fsElement.webkitRequestFullScreen) { //chrome
        fsElement.webkitRequestFullScreen();
    }else if (fsElement.mozRequestFullScreen) { //firefox
        fsElement.mozRequestFullScreen();
    }else if (fsElement.msRequestFullscreen) { //ie
        fsElement.msRequestFullscreen();
    }
}

function getUniqueId(data,flag){
    var ids=[];
    if(flag=='unique'){
        data.forEach(function(item){
            ids.push(item.uniqueId);
        });
    }else if(flag=='wo'){
        data.forEach(function(item){
            ids.push(item.work_order_id);
        });
    }else{
        data.forEach(function(item){
            ids.push(item.operation_to_ability_id);
        });
    }

    return ids;
}

function getIds(data){
    var ids=[];
    data.forEach(function(item){
        ids.push(item.operation_id);
    });

    return ids;
}

function createUrl(date){
    var urlLeft='&factory_id='+ajaxOPData.factory_id+'&workshop_id='+ajaxOPData.workshop_id+
        '&workcenter_id='+ajaxOPData.workcenter_id+'&time='+date;
    window.location.href=lineurl+'?'+urlLeft;
}

// 数组去重方法
function uniqueArry(arr){
    //Set数据结构，它类似于数组，其成员的值都是唯一的
    return Array.from(new Set(arr)); // 利用Array.from将Set结构转换成数组
}

function bindEvent(){
    //resize事件
    $(window).resize(function(){
        recountFW();
    });
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    //工单详情按钮
    $('body').on('click','.wo-deinfo',function () {
        var data=$(this).parents('.tree-item').data('woItem');
        var wt_number = $(this).parents('.wt-item').find('.tree-folder-header .item-name').attr('data-number');
        if(data){
            woInfoModal(data,wt_number);
        }
    });
    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //工厂，车间，工作中心下拉框点击事件
    $('body').on('click','.searchItem .el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        if(ele.find('.val_id').attr('id')=='factory_id'){//工厂选择
            if(idval!='0'){
                getWorkShop(idval);
                $('.el-form-item.workshop').find('.el-input').val('--请选择--').siblings('.val_id').val('0');
                $('.el-form-item.workcenter').find('.el-input').val('--请选择--').siblings('.val_id').val('0');
                $('.el-form-item.workcenter .el-select-dropdown-list').
                html('<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>');
            }else{
                $('.el-form-item.workshop').find('.el-input').val('--请选择--').siblings('.val_id').val('0');
                $('.el-form-item.workcenter').find('.el-input').val('--请选择--').siblings('.val_id').val('0');
                $('.el-form-item.workshop .el-select-dropdown-list,.el-form-item.workcenter .el-select-dropdown-list').
                html('<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>');
            }
        }else if(ele.find('.val_id').attr('id')=='workshop_id'){//车间选择
            if(idval!='0'){
                getWorkCenter(idval);
                $('.el-form-item.workcenter').find('.el-input').val('--请选择--').siblings('.val_id').val('0');
            }else{
                $('.el-form-item.workcenter').find('.el-input').val('--请选择--').siblings('.val_id').val('0');
                $('.el-form-item.workcenter .el-select-dropdown-list').
                html('<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>');
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

    //树加载更多
    $('body').on('click','.item-name.item-more',function(){
        if($(this).hasClass('item-po-more')){//po
            pagePoNo++;
            getPo();
            $(this).parents('.tree-folder.more').remove();
        }else if($(this).hasClass('item-wt-more')){//wt
            pageWtNo++;
            getWt($(this).parents('.tree-folder-content'),$(this).attr('data-post-id'));
            $(this).parents('.tree-folder.more').remove();
        }else if($(this).hasClass('item-wo-more')){//wo
            pageWoNo++;
            getWo($(this).parents('.tree-item.more').parent(),$(this).attr('data-post-id'));
            $(this).parents('.tree-item.more').remove();
        }
    });
    //弹出工序弹框
    $('.btn-choose-op').on('click',function(){
        tops=[];
        selectOPModal();
    });
    //搜索工序
    $('body').on('click','.btn-search-op',function(e){
        e.preventDefault();
        e.stopPropagation();
        var factory_id=$('#factory_id').val(),
            factory_name=$('#factory_id').parent().find('.el-input').val(),
            workshop_id=$('#workshop_id').val(),
            workshop_name=$('#workshop_id').parent().find('.el-input').val(),
            workcenter_id=$('#workcenter_id').val(),
            workcenter_name=$('#workcenter_id').parent().find('.el-input').val();
        if(factory_id==0||workshop_id==0){
            $('.search-wrap .errorMessage').html('工厂和车间为必填搜索项');
        }else{
            $('.search-wrap .errorMessage').html('');
            ajaxOPData={
                factory_id: factory_id,
                factory_name: factory_name,
                workshop_id: workshop_id,
                workshop_name: workshop_name,
                workcenter_id: workcenter_id,
                workcenter_name: workcenter_name
            };

            getOP($('#selectOP .table_tbody'));
        }
    });
    //选择工序
    $('body').on('click','.op-submit:not(.is-disabled)',function(e){
        layer.close(layerModal);
        ops=tops;
        tops=[];
        if(ops.length){
            var op_arr = [];
            ops.forEach(function (opitem) {
                op_arr.push(opitem.opeartion_name)
            });
            getCapacity(vdate[0],vdate[vdate.length-1]);
            getPo();
            $('#PO-info').html('');
            var PO_info = `<table class=" sticky uniquetable commontable" style="border: 1px solid #eee;background: #fafbfc;margin-bottom: 10px;width: 99.9%;">
                <thead><tr><th>工厂</th><th>车间</th><th>工作中心</th><th>当前工序</th><th>当天标准工时[s]</th></tr></thead>
                <tbody><tr>
                <td>${ajaxOPData.factory_name}</td>
                <td>${ajaxOPData.workshop_name}</td>
                <td>${ajaxOPData.workcenter_name}</td>
                <td>${op_arr}</td>
                <td id="basis-hour"></td>
                </tr></tbody>
            </table>`;
            $('#PO-info').html(PO_info);
        }
        // var gongxu = [];
        // gongxu.push(ajaxOPData);
        var history_obj = {
            ops: ops,
            gongxu: ajaxOPData
        };
        window.location.href = '#' + encodeURIComponent(JSON.stringify(history_obj));
    });

    // WT 弹框 选择工作中心能力
    $('body').on('click','#chooseWo .ability-wrap .el-radio-input',function(){
        $('#chooseWo .ability-wrap .el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
        $('#chooseWo .errorMessage').html('');
        $('#chooseWo').find('.el-checkbox_input.woset').removeClass('noedit');
    });
    // WT 弹框 选择步骤中的能力
    $('body').on('click','#chooseWo #chooseWTAbilityPane .tab-pane.active .el-radio-input',function(){
        $('#chooseWo #chooseWTAbilityPane .tab-pane.active .el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
        $('#chooseWo #chooseWTAbilityPane .errorMessage').html('');
        $('#chooseWo').find('.el-checkbox_input.woset').removeClass('noedit');
    });

    // WO 弹框 选择工作中心能力
    $('body').on('click','#selectCapacity .woAbility .el-radio-input',function(){
        $('#selectCapacity .woAbility .el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
        $('#selectCapacity .errorMessage').html('');
    });

    // WO 弹框 选择步骤中的能力
    $('body').on('click','#selectCapacity #chooseWOCapacityPane .tab-pane.active .el-radio-input',function(){
        $('#selectCapacity #chooseWOCapacityPane .tab-pane.active .el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
        $('#selectCapacity .errorMessage').html('');
    });

    //删除工序下的工单
    $('body').on('click','.btn-wo-del',function(e){
        //将该工单变为可选工单，并发送异步
        e.stopPropagation();
        e.preventDefault();
        deleteFlag=true;
        var id=$(this).attr('data-id');
        var that=$(this);
        deleteWo(id,function(){
            var usehour=Number(that.parents('tr').attr('data-capacity'));
            hasOPEvent.usehour-=usehour;
            hasOPEvent.percent=(hasOPEvent.usehour*100/hasOPEvent.hour).toFixed(2);
            $('.wo-percent b').html(hasOPEvent.percent);
            that.parents('tr').remove();
            if(!$('#editWO .wo_from .table_tbody tr').length){//暂无数据
                $('#editWO .wo_from .table_tbody').html('<tr class="tritem"><td colspan="5" style="text-align: center;">暂无数据</td></tr>')
            }
        });
    });
    //树形表格展开收缩
    $('body').on('click','.bom-tree .expand-icon:not(.pro)',function(e){
        if($(this).hasClass('icon-minus')){
            $(this).addClass('icon-plus').removeClass('icon-minus');
            $(this).parents('.tree-folder-header').siblings('.tree-folder-content').hide();
        }else {
            $(this).addClass('icon-minus').removeClass('icon-plus');
            var pele=$(this).parents('.tree-folder-header').siblings('.tree-folder-content').html('');
            var id=$(this).attr('data-id');
            if($(this).hasClass('wt')){//生产任务
                pageWoNo=1;
                getWo(pele,id);
            }
            pele.show();
        }
    });
    //拆单
    $('body').on('click','.flex-item .split',function(){
        var wodata=$(this).parents('.tree-item').data('woItem');
        splitModal(wodata);
    });
    //拆单文本框输入
    $('body').on('focus','#split-input',function(){
        var maxQty=Number($(this).attr('data-qty'))-1;
        $(this).parent().siblings('.errorMessage').html('最大输入数量：'+maxQty);
    }).on('blur','#split-input',function(){
        var maxQty=Number($(this).attr('data-qty'))-1;
        if($(this).val()>maxQty){
            $(this).val(maxQty);
        }
        $(this).parent().siblings('.errorMessage').html('');
    });
    // WO - 拆单提交
    $('body').on('click','.wo-split-submit',function(){
        var qty=$('#split-input').val();
        if(qty){
            $(this).addClass('is-disabled');
            $(this).css('pointer-events','none');
            var data={
                _token: TOKEN,
                id: $(this).attr('data-id'),
                qty: qty
            };
            splitWo(data,$(this).attr('data-task-id'));
        }else{
            $('#split-input').parent().siblings('.errorMessage').html('数量必填');
        }

    });
    //tap切换按钮
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var form=$(this).attr('data-item');
            $('.el-panel.'+form).addClass('active').siblings('.el-panel').removeClass('active');
            if(form=='no_from'){//未排
                // getPopWo($('#chooseWo #noset .table_tbody'),taskid);
            }else if(form=='has_from'){//已排
                // getPopsetWo($('#chooseWo #hasset .table_tbody'),taskid);
            }
        }
    });
    //wo的hover事件
    $('body').on('mouseover','.wo-mark',function(e){
        var ele=$(this).parent().find('.wo-info'),
            offset=$(layerEle).offset();
        var newOffset={
            top: e.clientY - offset.top,
            left: e.clientX - offset.left
        };
        ele.css({'left':(newOffset.left+10)+'px','top':(newOffset.top-10)+'px'});
        ele.css("display","block");
    }).on('mouseout','.wo-mark',function(e){
        var ele=$(this).parent().find('.wo-info');
        ele.css("display","none");
    });
    $('body').on('click','#start_time',function(e){
        e.stopPropagation();
        var that=$(this);
        var max=$('#end_time_input').text()?$('#end_time_input').text():getCurrentDate();
        start_time=laydate.render({
            elem: '#start_time_input',
            max: max,
            show: true,
            closeStop: '#start_time',
            done: function(value, date, endDate){
                that.val(value);
            }
        });
    });
    $('body').on('click','#end_time',function(e){
        e.stopPropagation();
        var that=$(this);
        var min=$('#start_time_input').text()?$('#start_time_input').text():'2018-1-20';
        end_time=laydate.render({
            elem: '#end_time_input',
            min: min,
            max: getCurrentDate(),
            show: true,
            closeStop: '#end_time',
            done: function(value, date, endDate){
                that.val(value);
            }
        });
    });
    //查看生产进度
    $('.btn-look-order').on('click',function(){
        orderModal();
    });
    //细排
    $('.btn-fine-line').on('click',function(){
        createUrl('');
    });
    //全屏展示
    $('.btn-full-screen').on('click',function(){
        // fullscreen();
        if($('#sidebar-collapse #sidebar-toggle-icon').hasClass('fa-angle-double-left')){
            $('#sidebar-collapse').click();
            recountFW();
        }else{
            recountFW();
        }
    });
    $('body').on('click','#sidebar-toggle-icon',function(){
        setTimeout(function(){
            recountFW();
        },20);
    });

    // 点击左部菜单空白处重新计算资源日历的长度
    $('#sidebar-collapse').on('click',function () {
        if($('#sidebar-collapse #sidebar-toggle-icon').hasClass('fa-angle-double-left')){
            $('#sidebar-collapse').click();
            recountFW();
        }else{
            recountFW();
        }
    });
    $('body').on('click','#sidebar-collapse',function(){
        setTimeout(function(){
            recountFW();
        },20);
    });
    $(document).on('keydown',function(event){
        if (event.keyCode == 13 && event.ctrlKey) {
            event.preventDefault();
            fullscreen();
        }
    });
    //checkbox点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        if($(this).hasClass('woset')){
            var wele=$(this).parents('.tritem').data('woItem');
            console.log(wele);
            var elerd=$('#chooseWo .el-radio-input.is-radio-checked');
            if(!$(this).hasClass('is-checked')){
                $(this).addClass('is-checked');
                //计算工时
                if(elerd.length){
                    var abData=elerd.parent().data('capacity');
                    var hour=wele.qty*abData.hour;
                    var woboj={
                        hour: hour,
                        operation_id: wele.operation_id,
                        operation_to_ability_id: abData.operation_to_ability_id,
                        work_order_id: wele.work_order_id,
                        work_task_id: wele.work_task_id
                    };
                    wtWos.push(woboj);
                    opEvent.usehour+=hour;
                    $('.usehour').html(opEvent.usehour);
                }
            }else{
                $(this).removeClass('is-checked');
                //计算工时
                var ids=getUniqueId(wtWos||[],'wo'),
                    index=ids.indexOf(wele.work_order_id);
                index==-1?null:wtWos.splice(index,1);
                if(elerd.length){
                    var abData=elerd.parent().data('capacity'),
                        hour=wele.qty*abData.hour;
                    opEvent.usehour-=hour;
                    $('.usehour').html(opEvent.usehour);
                }
            }
        }else if($(this).hasClass('op')){
            $(this).toggleClass('is-checked');
            var data=$(this).parents('.op-item').data('opItem'),
                ids=getIds(tops),
                index=ids.indexOf(data.operation_id);
            if($(this).hasClass('is-checked')){
                if(index==-1){
                    tops.push(data);
                }
            }else{
                tops.splice(index,1);
            }
            if(tops.length){
                $('.op-submit').removeClass('is-disabled');
            }else{
                $('.op-submit').addClass('is-disabled');
            }
        }
    });
    //未排工单加载更多
    $('body').on('click','#chooseWo .get-more',function(e){
        e.stopPropagation();
        e.preventDefault();
        pagePopWoNo++;
        getPopWo($('#chooseWo #noset .table_tbody'),taskid);
    });
    //批量选择
    $('body').on('click','.multi-choose',function(e){
        e.preventDefault();
        //可能要发异步
        $('.el-checkbox_input.woset').removeClass('is-checked');
        opEvent.usehour=$('#copyEvent').data('opEvent').usehour;
        $('.el-checkbox_input.woset').each(function(){
            $(this).click();
        });
    });
    //确定选择WT下的工单
    $('body').on('click','.choose-wo-ok',function(e){
        e.stopPropagation();
        e.preventDefault();
        // 获取当前 WT 下面的所有 WO 的id
        var woAllIds_arr=[],
            woAllIds = $('#chooseWo .no_from .table_tbody').find('tr');
        if (woAllIds.length){
            woAllIds.each(function () {
                woAllIds_arr.push($(this).attr('data-id'));
            });
        }
        var workCenter = $('#chooseWo .ability-wrap').find('.el-radio-input.is-radio-checked'),
            absChoose = $('#chooseWo #chooseWTAbilityPane .tab-pane').find('.el-radio-input.is-radio-checked'),
            absLastChoose = $('#chooseWo #chooseWTAbilityPane .tab-pane').last().find('.el-radio-input.is-radio-checked');
        // 判断工作中心选择能力
        if (workCenter.length){
            var workCenterId = workCenter.find('.capacity').val();
        }else{
            $('#chooseWo .errorMessage').text('请选择工作中心能力！');
            return false;
        }
        // 判断多个步骤的能力选择（进料必须选择能力）
        if (absLastChoose.length){
            // 将步骤中选中的能力添加到数组
            var absChooseId_arr=[],allAbsObj={};
            absChoose.each(function (k,v) {
                var absChooseGxId = $(v).find('.capacity_gxid').val();
                var absChooseId = $(v).find('.capacity_id').val();
                allAbsObj[absChooseGxId] = absChooseId;
                absChooseId_arr.push(absChooseId);
            });
        }else{
            $('#chooseWo .errorMessage').text('出料步骤的能力必须选择！');
            return false;
        }
        console.log(getCurrentDateWeek(new Date(opEvent.start)));
        var wt_task_id = $('#wtTaskId').val();
        // 判断工作中心和步骤中选择的能力是否相同
        if (workCenterId == absChooseId_arr[absChooseId_arr.length-1]){
            var wtpostdata={
                _token: TOKEN,
                ids: JSON.stringify(woAllIds_arr),
                //factory_id: ajaxOPData.factory_id,
                workshop_id: ajaxOPData.workshop_id,
                workcenter_id: ajaxOPData.workcenter_id,
                workcenter_operation_to_ability_id: workCenterId,
                all_select_abilitys: JSON.stringify(allAbsObj),
                week_date: getCurrentDateWeek(new Date(opEvent.start))
            };
            checkCanPlan(wtpostdata,opEvent,woAllIds_arr,allAbsObj,workCenterId,wt_task_id);
        }else{
            $('#chooseWo .errorMessage').text('工作中心和步骤中的进料选择的能力必须相同！');
            return false;
        }

        // if(wtWos.length){
        //     var index=getUniqueId(validEvents,'unique').indexOf(opEvent.uniqueId);
        //     var oab=wtWos[0].operation_to_ability_id,usehour=0,ids=[];
        //     wtWos.forEach(function(woitem){
        //         usehour+=woitem.hour;
        //         ids.push(woitem.work_order_id);
        //     });
        //     console.log(validEvents[index]);
        //     var abindex=getUniqueId(validEvents[index].ability,'notu').indexOf(Number(oab));
        //     if(validEvents[index].hour==0||validEvents[index].ability[abindex].todayCap==0){
        //         //总产能为0或对应能力产能为0
        //         $('#error').html('总产能为0或对应能力产能为0');
        //         return false;
        //     }
        //     var postdata={
        //         _token: TOKEN,
        //         ids: JSON.stringify(ids),
        //         factory_id: ajaxOPData.factory_id,
        //         work_shop_id: ajaxOPData.workshop_id,
        //         work_center_id: ajaxOPData.workcenter_id,
        //         operation_id: wtWos[0].operation_id,
        //         operation_ability_id: oab,
        //         work_station_time: getCurrentDate(new Date(opEvent.start)),
        //         work_task_id: wtWos[0].work_task_id
        //     };
        //     console.log(postdata);
        //     simplePlan(postdata,function(){
        //         validEvents[index].ability.forEach(function(aitem){
        //             if(aitem.operation_to_ability_id==oab){
        //                 aitem.usehour==undefined?aitem.usehour=0:null;
        //                 aitem.usehour+=usehour;
        //                 validEvents[index].usehour+=usehour;
        //                 validEvents[index].percent=(validEvents[index].usehour*100/validEvents[index].hour).toFixed(2);
        //             }
        //             return false;
        //         });
        //         $('#calendar').fullCalendar('removeEvents');
        //         $('#calendar').fullCalendar('renderEvents', validEvents);
        //         wtWos=[];
        //     });
        // }
        layer.close(layerModal);
    });
    //日期向前
    $('body').on('click','.fc-prev-button.fc-button',function(){
        vdate=[];
        $('.fc-day.fc-widget-content').each(function(){
            var date=$(this).attr('data-date');
            if(date!=undefined){
                vdate.push($(this).attr('data-date'));
            }
        });
        if(ops.length){
            getCapacity(vdate[0],vdate[vdate.length-1]);
        }
    });
    //日期向后
    $('body').on('click','.fc-next-button.fc-button',function(){
        vdate=[];
        $('.fc-day.fc-widget-content').each(function(){
            var date=$(this).attr('data-date');
            if(date!=undefined){
                vdate.push($(this).attr('data-date'));
            }
        });
        if(ops.length){
            getCapacity(vdate[0],vdate[vdate.length-1]);
        }
    });
    //点击月
    $('body').on('click','.fc-month-button.fc-button',function(){
        vdate=[];
        $('.fc-day.fc-widget-content').each(function(){
            var date=$(this).attr('data-date');
            if(date!=undefined){
                vdate.push($(this).attr('data-date'));
            }
        });
        if(ops.length){
            getCapacity(vdate[0],vdate[vdate.length-1]);
        }
    });
    //点击周
    $('body').on('click','.fc-basicWeek-button.fc-button',function(){
        vdate=[];
        $('.fc-day.fc-widget-content').each(function(){
            var date=$(this).attr('data-date');
            if(date!=undefined){
                vdate.push($(this).attr('data-date'));
            }
        });
        if(ops.length){
            getCapacity(vdate[0],vdate[vdate.length-1]);
        }
    });
    // WT 鼠标over和out是显示详细信息
    var desc_show='';
    $('body').on('mouseenter', '.wt-item .flex-item .item-name.has-child', function () {
        var msg = $(this).attr('data-desc');
        if(msg!=''){
            desc_show = layer.tips(msg, this,
                {
                    tips: [2, '#20A0FF'], time: 0
                });
        }
    }).on('mouseleave', '.wt-item .flex-item .item-name.has-child', function () {
        layer.close(desc_show);
    })

    // WT 点击拆单
    $('body').on('click','.flex-item .wt-split',function(){
        var wodata=$(this).parents('.tree-folder.wt-item').data('wtItem');
        createWOList(wodata);
        $('.action2').hide();
        $('.el-button.split').removeClass('is-disabled');
    });
    //单选按钮点击事件
    $('body').on('click','.wt-waps .el-radio-input',function(e){
        if(lock){
            LayerConfig('fail','请先确认已拆的工单');
            return false;
        }
        $('.wt-waps .action').show();
        wt=[];
        wos=[];
        $('.wt-item.noedit').removeClass('noedit');
        $('#wt-input').val('');
        $('.active.hide').removeClass('hide');
        //$('.split-wrap').hide();
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
        $('.wt-item.active').removeClass('active');
        if($(this).find('.status').hasClass('yes')){//等分
            $('.el-button.split').addClass('btn-equal').removeClass('btn-noequal');

            sameFlag=true;
        }else{//非等分
            $('.el-button.split').addClass('btn-noequal').removeClass('btn-equal');
            $('.el-checkbox_input').addClass('hide').removeClass('is-checked');
            sameFlag=false;
        }
    });

    // 拆单input数量
    $('#wt-input').on('focus',function(){
        var val='';
        if($('.el-checkbox_input.is-checked').length){
            var qty=getWtId(wt).qty;
            minQty=Math.min.apply(Math,qty);
        }else if($('.wt-item.active').length){
            if($('.status.no').parent().hasClass('is-radio-checked')){//不同数量
                var allqty=Number($('.wt-item.active').attr('data-qty'));
                if($('.wo-item').length){
                    $('.wo-item').each(function(){
                        allqty-=Number($(this).attr('data-qty'));
                    });
                }
                minQty=allqty;
                if(minQty==0){
                    $('.el-button.split').addClass('is-disabled');
                }else{
                    $('.el-button.split').removeClass('is-disabled');
                }
            }else{
                minQty=$('.wt-item.active').attr('data-qty');
            }
        }
        val='最大输入值为：'+minQty;
        $(this).siblings('.info').html(val);
    }).on('blur',function(){
        if($(this).val()>Number(minQty)){
            $(this).val(Number(minQty));
        }
        $(this).siblings('.info').html('');
    });

    //拆单
    $('body').on('click','.split:not(.is-disabled)',function(){
        lock=true;
        if($(this).hasClass('btn-equal')){//等分提交
            $(this).addClass('is-disabled');
            var num=$('.equal .el-input').val();
            var flag=$('.el-checkbox_input.is-checked').length? 'multi':'single';
            createSameWo(num,flag);
        }else{//非等分提交
            var num=$('.equal .el-input').val(),
                data=$('.wt-item.active').parent().data('wtItem');
            var allqty=Number($('#wt_number').val());
            if($('.wo-item').length){
                $('.wo-item').each(function(){
                    allqty-=Number($(this).attr('data-qty'));
                });
            }
            if(Number(num)>allqty){
                num=allqty;
                $('.equal .el-input').val(num);
                num==0&&$(this).addClass('is-disabled');
            }
            num>0&&createDiverseWo(num);
        }
        if($('.action2').is(':hidden')){
            $('.action2').show();
        }
    });

    //拆单确认
    $('body').on('click','.split-submit',function(){
        layer.close(layerModal);
        lock=false;
        xhrs=[];
        if(wos.length&&sameFlag){
            wos.forEach(function(item){
                xhrs.push(postSplit(item));
            });
        }else if(sameFlag==false){
            var data=$('.wt-item.active').parent().data('wtItem'),
                split_rules=[],
                qty_wt = $('#wt_number').val(),
                id = $('#wt_number').attr('data-id');
            $('.table-wrap .wo-item').each(function(){
                split_rules.push(Number($(this).attr('data-qty')));
            });
            var allqty=split_rules.reduce(function(prev, curr, idx, arr){
                return prev + curr;
            });
            if(data.qty!=allqty){
                LayerConfig('fail','拆单后的总量与原单总量不符合');
                lock=true;
                return false;
            }
            var woobj={
                _token: TOKEN,
                operation_order_id: id,
                split_rules: JSON.stringify(split_rules)
            };
            xhrs.push(postSplit(woobj));

        }
    });
    //重拆
    $('body').on('click','.split-again',function(){
        $('#wt-input').val('').siblings('.info').html('');
        $('.wo-wrap').html('');
        $('.action2').hide();
        $('.el-button.split').removeClass('is-disabled');
        lock=false;
    });
}

// 拖动工单选择能力之后进行排产
function checkCanPlan(data,calEvent,ids,all_select_abilitys,operation_ability_id,work_task_id) {
    var urlLeft = '';
    AjaxClient.post({
        url: URLS['aps'].checkCanPlan,
        data:data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if (rsp.results){
                var tips = '';
                rsp.results.forEach(function (item,index) {
                    tips  += `<p>${index+1}. ${item}</p>`;
                });
                layer.confirm(tips, {
                    title: '是否继续排产？', offset: '250px', btn: ['是','否']
                }, function (e) {
                    layer.close(e);
                    var postdata={
                        _token: TOKEN,
                        ids: JSON.stringify(ids),
                        factory_id: ajaxOPData.factory_id,
                        work_shop_id: ajaxOPData.workshop_id,
                        work_center_id: ajaxOPData.workcenter_id,
                        operation_id: calEvent.operation_id,
                        operation_ability_id: operation_ability_id,
                        work_station_time: getCurrentDate(new Date(calEvent.start)),
                        work_task_id: work_task_id,
                        all_select_abilitys: JSON.stringify(all_select_abilitys)
                    };
                    simplePlan(postdata);
                },function (e) {
                    layer.close(e);
                });
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
            console.log(rsp.message);

        }
    });

}

// 点击WT的时候弹出拆单弹框
function createWOList(data) {
    console.log(data);
    var wwidth=$(window).width()-80,
        wheight=$(window).height()-80,
        mwidth=wwidth+'px',
        mheight=wheight+'px',
        wt_info = JSON.stringify(data);
    var taps='';
    var title = "工单" + data.number + "拆单";
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '40px',
        area: ['500px','500px'],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content:`<div class="wt-splits">
            <input type="hidden" id="wt_info">
            <input type="hidden" id="wt_number" data-qty="${data.qty}" data-id="${data.wt_id}" data-number="${data.number}" value="${data.qty}">
            <div class="wt-waps">
                <div class="woinfo">
                    <p>
                        <span>工单号：<span class="highlight">${data.number}</span></span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span>数量：<span class="highlight">${data.qty}</span></span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span>工序：<span class="highlight">${data.operation_name}</span></span>
                    </p>
                </div>
                <div class="el-radio-group">
                    <label class="el-radio">
                        <span class="el-radio-input">
                            <span class="el-radio-inner"></span>
                            <input class="status yes" type="hidden" value="1">
                        </span>
                        <span class="el-radio-label">相同数量</span>
                    </label>
                    <label class="el-radio">
                        <span class="el-radio-input">
                            <span class="el-radio-inner"></span>
                            <input class="status no" type="hidden" value="0">
                        </span>
                        <span class="el-radio-label">不同数量</span>
                    </label>
                    <div class="tipinfo">
                        <i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i>
                        <span class="tip">相同数量是指拆的每个工单数量相同<br/>不同数量是指工单数量不全相同<i></i></span>
                    </div>
                </div>
                <div class="action" style="display: none; margin-top: 15px;">
                    <div class="equal">
                        <input type="number" class="el-input" id="wt-input" onkeyup="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}else{this.value=this.value.replace(/\\D/g,'')}" onafterpaste="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}else{this.value=this.value.replace(/\\D/g,'')}" placeholder="请输入数量">
                        <button class="el-button el-button--primary split" style="    color: #fff;background-color: #20a0ff; border-color: #20a0ff;height: 22px;line-height: 22px;font-size:14px;">拆</button>
                        <p class="info"></p>
                    </div>
                </div>
            </div>
            <div class="split-wrap">
                
                <div class="wo-wrap"></div>
                <div class="action2">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <button class="el-button split-again">重拆</button>
                            <button class="el-button el-button--primary split-submit">确认</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
        success: function(){
            if($('.el-tap-preview-wrap .el-tap').length){
                $('.el-tap-preview-wrap .el-tap').eq(0).click();
            }
            var wtinfo = [];
            wtinfo.push(data);
            $('#wt_info').attr('data-wtinfo',wtinfo);
        },
        end: function(){
        }
    })
}

//生成相同数量wo列表
function createSameWo(val,flag){
    wos=[];
    var wowrap='',wo='',num=0;
    if(flag=='multi'){
        $('.wt-item.active').each(function(){
            var wt_qty=$('#wt_number').val(),
                woNum=Math.ceil(wt_qty/Number(val));
            var woobj={
                _token: TOKEN,
                operation_order_id: $('#wt_number').attr('data-id')
            },split_rules=[];
            for(var i=0;i<woNum;i++){
                var woNumber=val;
                if(i==(woNum-1)){
                    var left=wt_qty%Number(val);
                    if(left!=0){
                        woNumber=left;
                    }
                }
                split_rules.push(Number(woNumber));
                wo+=`<tr class="wo-item"><td><span>${i+1+num}</span></td><td>${wt_qty}</td><td><span>WO</span></td><td>数量：${woNumber}</td></tr>`;
            }
            num+=woNum;
            woobj.split_rules=JSON.stringify(split_rules);
            wos.push(woobj);
        });
    }else{
        var wt_qty=$('#wt_number').val(),
            woNum=Math.ceil(wt_qty/Number(val)),
            id = $('#wt_number').attr('data-id');
        var woobj={
            _token: TOKEN,
            operation_order_id: id
        },split_rules=[];
        num=woNum;
        for(var i=0;i<woNum;i++){
            var woNumber=val;
            if(i==(woNum-1)){
                var left=wt_qty%Number(val);
                if(left!=0){
                    woNumber=left;
                }
            }
            split_rules.push(Number(woNumber));
            wo+=`<tr class="wo-item"><td><span>${i+1}</span></td><td>${wt_qty}</td><td><span>WO</span></td><td>数量：${woNumber}</td></tr>`;
        }
        woobj.split_rules=JSON.stringify(split_rules);
        wos.push(woobj);
    }

    wowrap=`<div class="table-wrap"><table class="table-wrap">
	<tbody>${wo}</tbody>
	</table></div>
	<p>一共<span class="wo-num">${num}</span>个工单</p>`;
    $('.wo-wrap').html(wowrap);
    // var woWrap=`<div class="wo-wrap">${wo}</div>`;
}

//生成不同数量wo列表
function createDiverseWo(val){
    if($('.wo-item').length){
        var len=$('.wo-item').length;
        var tr=`<tr class="wo-item" data-qty="${val}"><td><span>${len+1}</span></td><td><span>WO</span></td><td>数量：${val}</td></tr>`;
        $('.table-wrap tbody').append(tr);
        $('.table-wrap').siblings('p').find('span').html(len+1);
    }else{
        var wrap=`<div class="table-wrap"><table>
		<tbody><tr class="wo-item" data-qty="${val}"><td><span>1</span></td><td><span>WO</span></td><td>数量：${val}</td></tr></tbody>
		</table></div><p>一共<span class="wo-num">1</span>个工单</p>`;
        $('.wo-wrap').html(wrap);
    }
}

// WT 拆单WO列表提交
function postSplit(data){
    console.log(data);
    var xhr=AjaxClient.post({
        url: URLS['aps'].split,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            xhrAction();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            xhrAction();
            console.log('拆单失败');
        }
    });

    return xhr;
}

function xhrAction(){
    var xhrFlag=xhrOut();
    if(xhrFlag){
        var id=$('.pro-item.selected').attr('data-id');
        var xhrErrorNum=0;
        for(var i=0;i<xhrs.length;i++){
            if(xhrs[i].status!=200||xhrs[i].responseJSON.code!=200){
                xhrErrorNum++;
            }
        }
        if(xhrErrorNum!=0){
            LayerConfig('fail',xhrErrorNum+'个wt拆单失败,请重拆',function(){
                resetSplit();
                $('.wts-wrap .wts').html('');
                getWt(id);
            });
        }else{
            console.log('拆单成功');
            LayerConfig('success','拆单成功',function(){
                resetSplit();
                $('.wts-wrap .wts').html('');
                getPo();
            });
        }
    }
    wt=[];
}
//所有的拆wt都返回结果
function xhrOut(){
    var xhrFlag=true;
    for(var i=0;i<xhrs.length;i++){
        if(xhrs[i].readyState != 4){
            xhrFlag=false;
            break;
        }
    }
    return xhrFlag;
}
//重置split-wrap
function resetSplit(){
    $('#wt-input').val('').siblings('.info').html('');
    $('.wo-wrap').html('');
    $('.action2').hide();
    $('.el-button.split').removeClass('is-disabled');
    $('.split-wrap').hide();
}