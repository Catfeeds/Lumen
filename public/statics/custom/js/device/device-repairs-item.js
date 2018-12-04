var layerModal,
    supplier_id,
    flag,
    layerLoading;
$(function(){
    getRepairItem();
    bindEvent();
    getSearch();
    flag='add'
    selectvendor(supplier_id,flag);
    laydate.render({
        elem: '#happen_date',
        done: function (value, date, endDate) {

        }
    });
    registeredEvents();


});
function registeredEvents(){
    $('#device').autocomplete({
        url: URLS['device'].selects+"?"+_token+"&page_no=1&page_size=10",
        param:'name'
    });
    $('#employee').autocomplete({
        url: URLS['repairs'].employee+"?"+_token+"&page_no=1&page_size=10",
        param:'name'
    });
}

function getRepairItem() {

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

    //弹窗下拉
    $('body').on('click','.addBBasic_from .el-select',function(e){
        e.stopPropagation();
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.addBBasic_from .el-select-dropdown-item',function(e){
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
    //提交
    $('body').on('click','.basic_save',function (e) {
        e.stopPropagation();
        var  parentForm = $('#addBBasic_from'),
            faulty_range= parentForm.find('#faulty_range').val(),
            faulty_type= parentForm.find('#faulty_type').val(),
            repair_group= parentForm.find('#repair_group').val(),
            priority_rang= parentForm.find('#priority_rang').val(),
            happen_date= parentForm.find('#happen_date').val(),
            remark= parentForm.find('#remark').val();
        var $device=$('#device');
        var device=$device.data('inputItem')==undefined||$device.data('inputItem')==''?'':
            $device.data('inputItem').name==$device.val().replace(/\（.*?）/g,"").trim()?$device.data('inputItem').id:'';
        var $employee=$('#employee');
        var employee=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
            $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').id:'';

        var data = {
            device_id:device,
            is_outsource:'',
            proposer:'',
            application_cause:'',
            happen_time:new Date(happen_date).getTime(),
            fault_type:faulty_type,
            fault_grade:faulty_range,
            urgency_degree:priority_rang,
            fault_department:repair_group,
            fault_describe:'',
            use_employee:employee,
            remark:remark,
            _token:TOKEN
        };
        addRepairs(data);
    })

}

function addRepairs(data) {
    AjaxClient.post({
        url: URLS['repairs'].store,
        data:data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！')
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}

function getSearch() {
    $.when(getFaultyType(),getRepairRange(),getPriority())
        .done(function(faultyTypeRsp,repairRangeRsp,priorityRsp){
            var faultyTypelis='',repairRangelis='',prioritylis='';
            if(faultyTypeRsp&&faultyTypeRsp.results&&faultyTypeRsp.results.length){
                faultyTypelis=selectHtml(faultyTypeRsp.results,faultyTypeRsp.results[0].parent_id);
                $('#faultyType').find('.el-select-dropdown-wrap').html(faultyTypelis);
            }
            if(repairRangeRsp&&repairRangeRsp.results&&repairRangeRsp.results.length){
                if(repairRangeRsp.results&&repairRangeRsp.results.length){
                    repairRangeRsp.results.forEach(function(item){
                        repairRangelis+=`<li data-id="${item.option_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.option_name}</li>`;
                    });
                    var innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${repairRangelis}`;
                    $('#repairRange .repairRange_wrap').find('.el-select-dropdown-list').html(innerHtml);
                }

            }
            if(priorityRsp&&priorityRsp.results&&priorityRsp.results.length){
                if(priorityRsp.results&&priorityRsp.results.length){
                    priorityRsp.results.forEach(function(item){
                        prioritylis+=`<li data-id="${item.option_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.option_name}</li>`;
                    });
                    var innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${prioritylis}`;
                    $('#priority .priority_wrap').find('.el-select-dropdown-list').html(innerHtml);
                }

            }

        }).fail(function(faultyTypeRsp,repairRangeRsp,priorityRsp){
            if(!faultyTypeRsp.results){
                console.log('获取故障类型失败');
            }
            if(!repairRangeRsp.results){
                console.log('获取故障等级失败');
            }
            if(!faultyTypeRsp.results){
                console.log('获取紧急程度失败');
            }
    }).always(function(){
        layer.close(layerLoading);
    });
}
//
function getPriority(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['otherOption'].select+'?'+_token+'&category_id=3',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}//
function getRepairRange(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['otherOption'].select+'?'+_token+'&category_id=3',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
//获取故障类型列表
function getFaultyType(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['faultType'].treeIndex+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

//生成下拉框数据
function selectHtml(fileData,parent_id){
    var innerhtml,parent_id;
    var lis=selecttreeHtml(fileData,parent_id);
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="faulty_type" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;


    itemSelect=[];
    return innerhtml;
}
function selectvendor(val,flag) {
    AjaxClient.get({
        url: URLS['device'].getpartners+'?'+_token+'&is_vendor=1',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                    if(val && flag == 'view'){
                        if(val == item.id){
                            $('#provider_view').val(item.name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.provider').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.provider').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

