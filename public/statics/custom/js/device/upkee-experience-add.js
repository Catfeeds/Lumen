var layerModal,
    experienceId,
    currentFlag,
    layerLoading,
    pageNo=1,
    deviceTypeList,
    faultTypeList,
    repairRangeList,
    pageSize=20,
    ajaxData={},
    sparePartsList=[],
    items = [],
experienceType=["维修经验", "保养经验"];
$(function(){
    experienceId=getQueryString('id');
    currentFlag=getQueryString('flag');

    if(currentFlag=='view'){
        $('#title').html('查看维保经验');
        $('#addSpareParts').hide();
        $('#save').hide();

    }
    if(currentFlag=='edit'){
        $('#title').html('编辑维保经验')
    }
    if(experienceId&&currentFlag){
        $('#itemId').val(experienceId);

        showExperience(currentFlag)
    }else {
        getSearch();
    }
    bindEvent();


});

function showExperience(flag) {
    AjaxClient.get({
        url: URLS['upkeeExpreience'].show+"?"+_token+"&id="+experienceId,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSearch(rsp.results[0])
            if(flag=='view'){
                $('#experience').find('.experience_wrap').html(`
                                                                <div class="el-select">
                                                                    <input type="text" readonly="readonly"  id="experience_type_name" class="el-input" value="${experienceType[rsp.results[0].experience_type]}">
                                                                    <input type="hidden" class="val_id" id="experience_type" value="${rsp.results[0].experience_type}">
                                                                </div>
                                                            `);
                $('#device').find('.device_wrap').html(`
                                                                <div class="el-select">
                                                                    <input type="text" readonly="readonly"  id="device_name" class="el-input" value="${rsp.results[0].device_name}">
                                                                    <input type="hidden" class="val_id" id="device_id" value="${rsp.results[0].device_id}">
                                                                </div>
                                                            `);

                $('#repairRange').find('.repairRange_wrap').html(`
                                                                <div class="el-select">
                                                                    <input type="text" readonly="readonly"  id="repairRange_name" class="el-input" value="${rsp.results[0].repairdegree_name}">
                                                                    <input type="hidden" class="val_id" id="repairRange_id" value="${rsp.results[0].repairdegree_id}">
                                                                </div>
                                                            `);
                $('#fault_remark').html(`${rsp.results[0].fault_describe}`);
                $('#fault_remark').attr('readonly','readonly');
                $('#repair_remark').html(`${rsp.results[0].repair_remark}`);
                $('#repair_remark').attr('readonly','readonly');

                createSpareHtml($('.info_table .table_tbody'),rsp.results[0].groups);
            };
            if(flag=='edit'){
                $('#experience_type_name').val(experienceType[rsp.results[0].experience_type]);
                $('#experience_type').val(rsp.results[0].experience_type);
                $('#device_name').val(rsp.results[0].device_name);
                $('#device_id').val(rsp.results[0].device_id);
                $('#repairRange_name').val(rsp.results[0].repairdegree_name);
                $('#repairRange_id').val(rsp.results[0].repairdegree_id);
                $('#fault_remark').html(`${rsp.results[0].fault_describe}`);
                $('#repair_remark').html(`${rsp.results[0].repair_remark}`);
                rsp.results[0].groups.forEach(function (item) {
                    items.push(item.spare_id);
                });
                sparePartsList = rsp.results[0].groups;
                createSpareHtml($('.info_table .table_tbody'),rsp.results[0].groups);
            }


        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取失败');
            if(rsp.code==404){
                getUpkeeExperience();
            }
        }
    },this);
}

function bindPagenationClick(totalData,pageSize){
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
            getSparePatrs();
        }
    });
};



function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    $('body').on('click','.spareParts:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $("#save").on('click',function (e) {
        e.stopPropagation();
        $(this).addClass('active');
        var parentForm = $('#addExperience_from'),
            id=parentForm.find('#itemId').val(),
            experience_type=parentForm.find('#experience_type').val(),
            device_id=parentForm.find('#device_id').val(),
            deviceType_id=parentForm.find('#deviceType_id').val(),
            faultType_id=parentForm.find('#faultType_id').val(),
            fault_remark=parentForm.find('#fault_remark').val(),
            repairRange_id=parentForm.find('#repairRange_id').val(),
            repair_remark=parentForm.find('#repair_remark').val();
        var arr=[],_len = $('.inputOperationValue_table .table_tbody tr'),obj={};
        if(_len.length){
            $(_len).each(function (k,v) {
                if($(v).attr('data-id') != '' ){
                    obj={
                        spare_id:$(v).attr('data-spareid').trim()?$(v).attr('data-spareid').trim():"",
                        id:currentFlag==null?"":$(v).attr('data-id').trim(),
                    };
                    arr.push(obj)
                }
            });
        };
        if(currentFlag==null){
            addUpkeeExpreience({
                sort:'',
                device_type:deviceType_id,
                device_id:device_id,
                experience_type:experience_type,
                upkee_require:'',
                upkee_degree:'',
                upkee_remark:'',
                fault_type:faultType_id,
                repair_degree:repairRange_id,
                fault_describe:fault_remark,
                repair_remark:repair_remark,
                items:JSON.stringify(arr),
                _token:TOKEN
            })
        }
        if(currentFlag=='edit'){
            editUpkeeExpreience({
                id:id,
                sort:'',
                device_type:deviceType_id,
                device_id:device_id,
                experience_type:experience_type,
                upkee_require:'',
                upkee_degree:'',
                upkee_remark:'',
                fault_type:faultType_id,
                repair_degree:repairRange_id,
                fault_describe:fault_remark,
                repair_remark:repair_remark,
                items:JSON.stringify(arr),
                _token:TOKEN
            })
        }


    })

    //弹窗下拉
    $('body').on('click','.formExperience:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //下拉选择
    $('body').on('click','.formExperience:not(".disabled") .el-select-dropdown-item',function(e){
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

    $('#addSpareParts').on('click',function (e) {
        e.stopPropagation();
        Modal();
    });
    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).toggleClass('is-checked');
        var item=$(this).attr("data-item")
        if($(this).hasClass('is-checked')){
            if(items.indexOf(item)==-1){
                items.push(item);
            }
        }else{
            var index=items.indexOf(item);
            items.splice(index,1);
        }
    });
    $('body').on('click','.procedure_ability',function () {
        layer.close(layerModal);
        var spare=[];
        sparePartsList.forEach(function (item) {
            items.forEach(function (id) {
                if(item.spare_id==id){
                    spare.push(item);
                }
            })
        });

        createSpareHtml($('.info_table .table_tbody'),spare)
    });
    $('body').on('click','.info_table .table_tbody .delete',function () {
        // layer.close(layerModal);
        var tId = $(this).attr('data-id');
        items.splice($.inArray(tId, items), 1);
        var spare=[];
        sparePartsList.forEach(function (item) {
            items.forEach(function (id) {
                if(item.spare_id==id){
                    spare.push(item);
                }
            })
        });
        createSpareHtml($('.info_table .table_tbody'),spare);
    })
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);

    });

};

function addUpkeeExpreience(data) {
    AjaxClient.post({
        url: URLS['upkeeExpreience'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('保存成功', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('#save').removeClass('active');
            }}, function(index){
                layer.close(index);
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addExperience_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
function editUpkeeExpreience(data) {
    AjaxClient.post({
        url: URLS['upkeeExpreience'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('保存成功', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('#save').removeClass('active');
            }}, function(index){
                layer.close(index);
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addExperience_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
function createSpareHtml(ele,data){
    ele.html('')
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-spareid="${item.spare_id}" data-id="${item.id}">
                
                <td>${item.spare_name}</td>
                <td>${item.spare_code}</td>
                <td>${item.spare_spec}</td>
                <td class="left norwap" style="text-align: center;">
                 ${currentFlag=='view'?``:`<i class="fa fa-trash-o oper_icon delete" title="删除" data-id="${item.id}"></i>`}
		        </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};

function getSparePatrs() {
    var urlLeft;
    urlLeft="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['spareParts'].sparelist+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('#spareParts_from .table_tbody'),rsp.results);
                sparePartsList=rsp.results;
            }else{
                noData('暂无数据',10);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
        }
    },this);
}

//生成列表数据
function createHtml(ele,data){
    ele.html('');
        if(items.length){
            data.forEach(function(item,index) {
                var tr;

                for(var i = 0; i < items.length; i++){
                    if (item.id == items[i]) {
                        tr = `
                        <tr class="tritem" data-id="${item.id}">
                            <td class="left norwap">
                                 <span class="el-checkbox_input el-checkbox_input_check is-checked" data-item="${item.id}">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </td>
                            <td>${item.spare_name}</td>
                            <td>${item.spare_code}</td>
                            <td>${item.spare_spec}</td>
                        </tr>
                    `;
                        break;
                    }else{
                        tr = `
                        <tr class="tritem" data-id="${item.id}">
                            <td class="left norwap">
                                 <span class="el-checkbox_input el-checkbox_input_check" data-item="${item.id}">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </td>
                            <td>${item.spare_name}</td>
                            <td>${item.spare_code}</td>
                            <td>${item.spare_spec}</td>
                        </tr>
                    `;
                    }
                }


                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);
            });

        }else {
            data.forEach(function(item,index) {
                var tr = `
                        <tr class="tritem" data-id="${item.id}">
                            <td class="left norwap">
                                 <span class="el-checkbox_input el-checkbox_input_check" data-item="${item.id}">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </td>
                            <td>${item.spare_name}</td>
                            <td>${item.spare_code}</td>
                            <td>${item.spare_spec}</td>
                        </tr>
                    `;

                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);

            });

        }




};

//生成下拉框数据
function selectHtml(fileData,parent_id,flag,name='',id=''){
    var innerhtml,selectVal,parent_id;
    var lis=selecttreeHtml(fileData,parent_id);
    if(currentFlag=='edit'){
        innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="${name}">
        <input type="hidden" class="val_id" id="${flag}" value="${id}">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;
    }
    if(currentFlag=='view'){
        innerhtml=`<div class="el-select">
        <input type="text" readonly="readonly" class="el-input" value="${name}">
        <input type="hidden" class="val_id" id="${flag}" value="${id}">
    </div>`
   
    }
    if(currentFlag==null){
        innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="${flag}" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;
    }

    itemSelect=[];
    return innerhtml;
}
//获取设备类型列表
function getDeviceType(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['deviceType'].treeIndex+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
            deviceTypeList=rsp.results;
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
// 获取故障类型列表
function getFaultType(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['faultType'].treeIndex+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
            faultTypeList = rsp.results;
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
// 获取故障类型列表
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
            faultTypeList = rsp.results;
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
function getDevice(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['device'].list+'?'+_token,
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

function getSearch(item=''){
    $.when(getDeviceType(),getFaultType(),getRepairRange(),getDevice())
        .done(function(deviceTypeRsp,faultTypeRsp,repairRangeRsp,deviceRsp){
            var deviceTypelis='',faultTypelis='',repairRangelis='',devicelis='',innerHtml,innerHtml1;
            if(deviceTypeRsp&&deviceTypeRsp.results&&deviceTypeRsp.results.length){
                deviceTypelis=selectHtml(deviceTypeRsp.results,deviceTypeRsp.results[0].parent_id,"deviceType_id",item.devicetype_name,item.devicetype_id);
                $('#deviceType').find('.el-select-dropdown-wrap').html(deviceTypelis);
            }
            if(faultTypeRsp&&faultTypeRsp.results&&faultTypeRsp.results.length){
                faultTypelis=selectHtml(faultTypeRsp.results,faultTypeRsp.results[0].parent_id,"faultType_id",item.faultype_name,item.faultype_id);
                $('#faultType').find('.el-select-dropdown-wrap').html(faultTypelis);
            }
            if(repairRangeRsp&&repairRangeRsp.results&&repairRangeRsp.results.length){
                if(repairRangeRsp.results&&repairRangeRsp.results.length){
                    repairRangeRsp.results.forEach(function(item){
                        repairRangelis+=`<li data-id="${item.option_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.option_name}</li>`;
                    });
                    innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${repairRangelis}`;
                    $('#repairRange .repairRange_wrap').find('.el-select-dropdown-list').html(innerHtml);
                }

            }
            if(deviceRsp&&deviceRsp.results&&deviceRsp.results.length){
                if(deviceRsp.results&&deviceRsp.results.length){
                    deviceRsp.results.forEach(function(item){
                        devicelis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.device_name}</li>`;
                    });
                    innerHtml1=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${devicelis}`;
                    $('#device .device_wrap').find('.el-select-dropdown-list').html(innerHtml1);
                }

            }

        }).fail(function(unitrsp,dataTypersp){
        console.log('获取设备类型失败');
    }).always(function(){
        layer.close(layerLoading);
    });
};

function Modal() {

    var labelWidth=120,btnShow='btnShow';


    layerModal=layer.open({
        type: 1,
        title: '添加备件',
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="spareParts formModal" id="spareParts_from">
                    <div class="procedure_wrap" >
                       <div class="procedure_ability_value">
                           <div class="inputOperationValue_table">
                            <table class="info_table">
                                <thead>
                                  <tr class="th_table_tbody">
                                        <th class="thead">选择</th>
                                        <th class="thead">名称</th>
                                        <th class="thead">编号</th>
                                        <th class="thead">规格型号</th>
                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                  
                                </tbody>
                            </table>
                          </div>
                       </div>
                       <div id="pagenation" class="pagenation bottom-page"></div>
                    </div>
                    
                    <div class="el-form-item ${btnShow}" style="margin-top: 20px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit procedure_ability">确定</button>
                        </div>
                    </div>
                    
</form>`,
        success:function (layero,index) {
            getLayerSelectPosition($(layero));
            getSparePatrs();

        },
        end:function () {
        }
    })
}

