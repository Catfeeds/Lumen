var json=[{
    "uid":"01",
    "name": "台板1",
    "taskList": [{
        "Subject": "任务21111111",
        "StartDate": "2018-03-11 09:07:00",
        "time": 45,
        "AuthorName": 'wmm',
        "DoneRatio": '60%'
    },{
        "Subject": "任务1",
        "StartDate": "2018-03-11 09:54:00",
        "time": 77,
        "AuthorName": 'wmm',
        "DoneRatio": '60%'
    },{
        "Subject": "任务1",
        "StartDate": "2018-03-11 15:00:00",
        "time": 150,
        "AuthorName": 'wmm',
        "DoneRatio": '60%'
    },
    {
        "Subject": "任务1",
        "StartDate": "2018-03-11 23:08:00",
        "time": 50,
        "AuthorName": 'wmm',
        "DoneRatio": '60%'
    }]
}, {
    "uid":"02",
    "name": "台板2",
    "taskList": [{
        "Subject": "任务1",
        "StartDate": "2018-03-11 11:05:00",
        "time": 67,
        "AuthorName": 'wmm',
        "DoneRatio": '60%'
    }]
},{
    "uid":"03",
    "name": "台板3",
    "taskList": [{
        "Subject": "任务1",
        "StartDate": "2018-03-11 09:23:00",
        "time": 45,
        "AuthorName": 'wmm',
        "DoneRatio": '60%'
    }]
}];
var layerLoading,layerModal,startTimeCorrect=!1,layerEle,pageOrderNo=1,pageOrderSize=50;
$(function () {
    getThinOrderProduct();
    getFactorySource();
    bindEvent();
    getLaydate('search_date');
    var ganttwidth=$('.thinProduction_wrap .thinCalendar').width()-20;
    $('.gantt-div-wrap,.gantt-div-wrap .GanttWrap').width(ganttwidth);
    var ganttChart = function() {
        $(".GanttWrap").GanttTool({
            'startDate': '2016-10-01',
            'endDate': '2016-12-02',
            'ajaxUrl': null,
            'arrdata': json,
            'layer': null,
            'parameters': {}, //其他参数
            'fn': null //回调方法
        });
    };
    ganttChart();
});

function getThinOrderProduct() {
    AjaxClient.get({
        url: URLS['thinPro'].woList + '?' + _token+'&status=1&order=asc&sort=id&page_no='+pageOrderNo+'&page_size='+pageOrderSize,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var obj = {},temp=[],data=rsp.results;
            if(data&&data.length){

                for(var i=0;i<data.length;i++){
                    var list = data[i];

                    if(!obj[list.operation_id]){
                        temp.push({
                            id:list.operation_id,
                            name: list.operation_name,
                            data: [list]
                        });
                        obj[list.operation_id] = list
                    }else{
                        for(var j = 0;j<temp.length;j++){
                            var jList = temp[j];
                            if(jList.id == list.operation_id){
                                jList.data.push(list);
                                break;
                            }
                        }
                    }
                }
                showThinOrderList($('.thinProduction_wrap .thinWorkOrderList'),temp);

            }else{
                $('.thinProduction_wrap .thinWorkOrderList').html('暂无数据')
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    })
}
function showThinOrderList(ele,data) {
    var _chtml='';
    data.forEach(function (item) {
        if(item.data.length){
            item.data.forEach(function (ritem) {
                _chtml += `<li class="order_item is-disabled" data-id="${ritem.work_order_id}" data-item="">${ritem.number}</li>`;
            })
        }
        var _html= `<div data-id="${item.id}" class="thin_order_block">
                     <div class="order_title"><h6>工序：${item.name}</h6></div>
                     <div class="order_list"><ul>${_chtml}</ul></div>
                </div>`;
        ele.append(_html);
        ele.find('.order_list .order_item').data('thinItem',item);
    })
}
function bindEvent() {
    $('body').on('click','.order_list .order_item:not(.is-disabled)',function (e) {
        var work_order_id = $(this).attr('data-id'),list =$(this).data('thinItem');
        list.data.forEach(function (item) {
            if(item.work_order_id == work_order_id){
                showThinOrderModal(item)
            }
        })

    })

    //弹窗关闭
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    //下拉框点击事件
    $('body').on('click','.el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto,.factory_item_tree)',function(e){
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

    $('body').on('click','.formModal .submit:not(.is-disabled)',function (e) {
        if($(this).hasClass('saveRelation_bench')){
            var parentForm =$('#addThinProduction_form'),
                work_task_id = parentForm.attr('data-task-id'),
                id=parentForm.find('#itemId').val(),
                ability_value = parentForm.attr('data-abilityValue');
            var ele = $('.el-form-item.factory .el-select-dropdown').find('.el-select-dropdown-item.selected')
            if(startTimeCorrect){
                var factory_id = ele.attr('data-factory-id'),
                    work_shop_id = ele.attr('data-workshop-id'),
                    work_center_id = ele.attr('data-id'),
                    work_shift_id = parentForm.find('#work_bench_id').val(),
                    plan_start_time = parentForm.find('#date').val();

                var str_date_time = plan_start_time.split(' '),
                    str_mm_time = str_date_time[1].split(':');

                var _time = str_mm_time[0]*3600000+str_mm_time[1]*60000,_ability = ability_value*60000;

                var _value = formatDuring(_time+_ability),plan_end_time=str_date_time[0]+' '+_value;

                saveThinData({
                    ids:JSON.stringify([id]),
                    work_center_id:work_center_id,
                    plan_start_time:plan_start_time,
                    plan_end_time:plan_end_time,
                    work_task_id:work_task_id,
                    work_shift_id:work_shift_id,
                    factory_id:factory_id,
                    work_shop_id:work_shop_id,
                    _token: TOKEN
                })
            }

        }
    })
}

function formatDuring(data) {
    var hours = parseInt((data % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((data % (1000 * 60 * 60)) / (1000 * 60));
    if(minutes>=0&&minutes<=9){
        minutes = '0'+minutes
    }
    return hours + ":" + minutes;
}

function showThinOrderModal(data) {
    var abilityValue;
    if(data){
        ({work_order_id='',work_task_id='',number='',operation_name='',qty='',operation_ability_pluck = ''}=data)
    }
    var labelWidth=100,readonly='readonly',btnShow='btnShow',_hours='';

    if(operation_ability_pluck != '{}'){
        var ability =JSON.parse(operation_ability_pluck);

        for(var i in ability){
            _hours = `${ability[i].name}(${ability[i].standard_working_hours}[min])`;
            abilityValue = ability[i].standard_working_hours*qty;
        }
    }
    layerModal = layer.open({
        type: 1,
        title: '关联台板',
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: true,
        content:`<form class="addThinProduction formModal" id="addThinProduction_form" data-abilityValue="${abilityValue}" data-task-id="${work_task_id}">
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
                                       <span>${qty}</span>
                                    </div>
                                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                               </div>
                                 <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: ${labelWidth}px;">能力</label>
                                        <span>${_hours}</span>
                                    </div>
                                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                               </div>
                           
                           </div>
                        </div>
                    </div>
                    <div class="work_order_condition">
                      <div class="title"><h5>选择台板</h5></div>
                      <div class="search_info">
                          <div class="el-form-item bench">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">台板</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="work_bench_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                           
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>
                         <div class="el-form-item select_date">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">时间</label>
                                <input type="text" id="date" class="el-input" placeholder="选择时间" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>
                      </div>
                    </div>
                     <div class="el-form-item ${btnShow}">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button cancle">取消</button>
                                <button type="button" class="el-button el-button--primary submit saveRelation_bench">确定</button>
                            </div>
                     </div>
</form>`,
        success:function (layero,index) {
            layerEle = layero;
            getAllWorkBench();
            // console.log(abilityValue);
            var ele =$('#search_date').val();
            getLaydate('date',ele,abilityValue);
        }
    })
}

function getAllWorkBench() {
    AjaxClient.get({
        url: URLS['thinPro'].benchList+'?'+_token+'&status=1&workcenter_id=4',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis='',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });

                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.bench').find('.el-select-dropdown-list').html(innerHtml);
            }

            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },200);

        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取台板列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

function _getCurrentDate(flag) {
    var date = new Date();
    if(flag == 'date'){
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
        var current_date = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();

        return current_date;
    }else{
        var _current = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
        return _current
    }

}

function getLaydate(flag,normal,val) {
    if(flag == 'date'){
        var currentDate = _getCurrentDate(flag);

        $('.el-form-item.select_date').find('.errorMessage').hide().html('');
        var minRange = normal +' 00:00',
            maxRange = normal + ' 23:59';
        laydate.render({
            elem: '#'+flag,
            type: 'datetime',
            format:'yyyy-MM-dd HH:mm',
            position: 'fixed',
            min:currentDate,
            done:function (value) {
               var reg = value.split(' ');
                if(reg[0] == normal){
                    var formatTimeS = new Date(value).getTime(),
                        formatTimeMin = new Date(minRange).getTime(),
                        formatTimeMax = new Date(maxRange).getTime(),
                        _time =formatTimeS+(val*60000);

                    if(_time>formatTimeMin && _time<formatTimeMax){
                        $('.el-form-item.select_date').find('.errorMessage').hide().html('');
                        startTimeCorrect = 1;
                        console.log(value)
                    }else{
                        $('.el-form-item.select_date').find('.errorMessage').show().html('超出产能时间，请重新拆单');
                        // console.log('超出产能时间，请重新拆单')
                    }
                }else{
                    $('.el-form-item.select_date').find('.errorMessage').show().html('时间范围不正确');
                    // console.log('时间范围不正确')
                }
            }
        });
    }else{
        var _date = _getCurrentDate(flag);
        laydate.render({
            elem: '#'+flag,
            min:_date,
            done:function (value) {
                if(value){
                    $('.order_item').removeClass('is-disabled');
                }else{
                    $('.order_item').addClass('is-disabled');
                }
            }
        });
    }

}

function getFactorySource() {
    AjaxClient.get({
        url: URLS['thinPro'].factoryTree+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results&&rsp.results.length){
                $('.el-select-dropdown-wrap.factory_tree').html(FactoryTreeHtml(rsp.results));
            }
        },
        fail:function (rsp) {

            noData('获取工厂失败，请刷新重试',4);

        }
    },this)
}

function FactoryTreeHtml(data) {
    var _select = '',lis='';
    lis=treeSelectHtml(data);

    _select = `<div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="factory_id" value="">
                </div>
                <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                        <li data-id="" class="el-select-dropdown-item kong factory_item_tree" data-name="--请选择--">--请选择--</li>
                        ${lis}
                    </ul>
                </div>`;
    return _select;
}

function treeSelectHtml(data) {
    var _html='';
    if(data&&data.length){
        data.forEach(function (item, index) {//工厂
            var lastClass=index===data.length-1? 'last-tag' : '';
            var span=`<span class="tag-prefix ${lastClass}"></span>`;

            _html += `<li class="el-select-dropdown-item factory_item_tree">${item.name}</li>`;

            if(item.child&&item.child.length){//车间
                item.child.forEach(function (citem,cindex) {
                    _html += `<li class="el-select-dropdown-item factory_item_tree" style="padding-left: 20px;">${span}${citem.name}</li>`;

                    if(citem.child&&citem.child.length){//工作中心
                        citem.child.forEach(function (rcitem,rcindex) {

                            var centerLastClass=rcindex===citem.child.length-1? 'last-tag' : '';

                            _html += `<li class="el-select-dropdown-item workCenter" style="padding-left: 40px;"
                                            data-name="${rcitem.name}" data-id="${rcitem.id}" data-factory-id="${item.id}" data-workshop-id="${citem.id}"><span class="tag-prefix ${centerLastClass}"></span>${rcitem.name}</li>`;
                        })
                    }
                })
            }

        })
    }
    return _html;
}

function saveThinData(data) {
    AjaxClient.post({
        url: URLS['thinPro'].store,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}