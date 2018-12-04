var layerModal,
    ajaxData={},
    employee_list=[],
    loadedObj={},
    pageNo=1,
    ids=[],
    complaint_id=0,
    employees=[],
    employeeLists=[],
    currentPageNo=1,
    pageSize=8;

$(function(){
    complaint_id=getQueryString('id');
    bindEvent();
    resetParam();
    showAlreadySendEmployee();

});
//重置搜索参数
function resetParam(){
    ajaxData={
        department_id: '',
    };
}
function showAlreadySendEmployee() {

    AjaxClient.get({
        url: URLS['complaint'].showSendAll+"?"+_token+"&customer_complaint_id="+complaint_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);

            if(rsp.results){
                if(rsp.results.O1){
                    createEmployTable($('.basictable .table_tbody'),rsp.results.O1)
                }
                if(rsp.results.O2){
                    createEmployTable($('.outflowtable .table_tbody'),rsp.results.O2)
                }
                if(rsp.results.O3){
                    createEmployTable($('.improvetable .table_tbody'),rsp.results.O3)
                }
                if(rsp.results.O4){
                    createEmployTable($('.processtable .table_tbody'),rsp.results.O4)
                }
                if(rsp.results.O5){
                    createEmployTable($('.trackingtable .table_tbody'),rsp.results.O5)
                }
                if(rsp.results.O6){
                    createEmployTable($('.leaningtable .table_tbody'),rsp.results.O6)
                }
                if(rsp.results.O7){
                    createEmployTable($('.recurringtable .table_tbody'),rsp.results.O7)
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

function createEmployTable(ele,value) {
    ele.html('');
    $.each(value,function (k,v) {
        var tr=`<tr class="tritem" data-id="${v.id}">
                <td>${v.department_name}</td>
                <td>${v.responsible_person_name}</td>
                <td class="right">
                <button data-employee="${v.responsible_person_id}" data-order="${v.order}" class="button pop-button back">打回</button>
                <button data-employee="${v.responsible_person_id}" data-order="${v.order}" class="button pop-button delete">删除</button>
                 </td>
                            </tr>`;
        ele.append(tr);
        ele.find("tr:last-child").data('tritem',v);
    })

}


function bindEvent() {
    $('.add').on('click',function (e) {
        e.stopPropagation();
        Modal($(this).eq(0)[0].id);
    });
    $('body').on('click','.el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });
    $('body').on('click','.el-select-dropdown-item',function(e){
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

    //搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            // $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                department_id: parentForm.find('#department_id').val().trim(),
            };
            $('.inputOperationValue_table .table_tbody').html('');
            getEmployeeByDepartment();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        // $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#department_id').val('').siblings('.el-input').val('--请选择--');

        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        $('.inputOperationValue_table .table_tbody').html('');
        pageNo=1;
        resetParam();
        getEmployeeByDepartment();
    });

    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("id");
        if($(this).hasClass('is-checked')){
            if(ids.indexOf(id)==-1){
                ids.push(id);
                employee_list.forEach(function (item) {
                    if(item.id==id){
                        employeeLists.push(item);
                    }
                })
            }
        }else{
            var index=ids.indexOf(id);
            ids.splice(index,1);
            employeeLists.forEach(function (item,index) {
                if(item.id==id){
                    employeeLists.splice(index,1);
                }
            })
        };

        showEmployeeList($('.inputOperationValue_table .info_table .table_tbody'))
    });

    $('body').on('click','.inputOperationValue_table .delete',function () {
        var id = $(this).attr('data-id');
        var index=ids.indexOf(id);
        ids.splice(index,1);
        employeeLists.forEach(function (item,index) {
            if(item.id==id){
                employeeLists.splice(index,1);
            }
        });
        $('body').find('.el-checkbox_input_check.is-checked').each(function () {
            if($(this).attr('id')==id){
                $(this).removeClass('is-checked')
            }
        })
        $(this).parents().parents().eq(0).remove();
    });
    //弹窗取消
    $('body').on('click','.formReport:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('body').on('click','.wrap_table_div .delete',function () {
        var employee_id = $(this).attr('data-employee'),
            order = $(this).attr('data-order');
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteSendEmployee(employee_id,order);
        });

    });

    $('body').on('click','.wrap_table_div .back',function () {
        var employee_id = $(this).attr('data-employee'),
            order = $(this).attr('data-order');
        showBackModal(employee_id,order);
        // $(this).parents('tr').addClass('active');
        // layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
        //     $('.uniquetable tr.active').removeClass('active');
        // }}, function(index){
        //     layer.close(index);
        //     deleteSendEmployee(employee_id,order);
        // });

    });

    $('body').on('click','.formReport:not(".disabled") .submit.report',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addReport_from'),
                add_type=parentForm.find('#add_type').val(),
                sendItem=[];
            // complaint_id
            if(add_type=='basic_add'){
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:1,
                        responsible_person_id:item.id
                    });
                })
            }
            if(add_type=='outflow_add'){
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:2,
                        responsible_person_id:item.id
                    });
                });
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:3,
                        responsible_person_id:item.id
                    });
                });

            }
            if(add_type=='improve_add'){
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:4,
                        responsible_person_id:item.id
                    });
                });

                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:9,
                        responsible_person_id:item.id
                    });
                });

                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:10,
                        responsible_person_id:item.id
                    });
                });

            }
            if(add_type=='process_add'){
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:5,
                        responsible_person_id:item.id
                    });
                });

                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:6,
                        responsible_person_id:item.id
                    });
                });

                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:7,
                        responsible_person_id:item.id
                    });
                });

                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:8,
                        responsible_person_id:item.id
                    });
                });

            }
            if(add_type=='tracking_add'){
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:11,
                        responsible_person_id:item.id
                    });
                });

                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:12,
                        responsible_person_id:item.id
                    });
                });

                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:13,
                        responsible_person_id:item.id
                    });
                });

            }
            if(add_type=='leaning_add'){
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:14,
                        responsible_person_id:item.id
                    });
                });

            }
            if(add_type=='recurring_add'){
                employeeLists.forEach(function (item) {
                    sendItem.push({
                        customer_complaint_id:complaint_id,
                        question_id:15,
                        responsible_person_id:item.id
                    });
                });

            }
            send({
                sendItem:JSON.stringify(sendItem),
                _token:TOKEN
            })

        };
    });
    $('body').on('click','.formBack:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#back_from'),
                employee=parentForm.find('#employee').val(),
                order=parentForm.find('#order').val(),
                description=parentForm.find('#description').val();

            sendBack({
                customer_complaint_id:complaint_id,
                order:order,
                judge_message:description,
                responsible_person_id:employee,
                _token:TOKEN

            });


        };
    })

}

function sendBack(data) {
    AjaxClient.post({
        url: URLS['complaint'].back,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            showAlreadySendEmployee();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                showAlreadySendEmployee();
            }

        }
    },this);
}

// //显示错误信息
// function showInvalidMessage(name,val){
//     $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
//     $('#addDevice_from').find('.submit').removeClass('is-disabled');
// }

function showBackModal(employee,order) {

    var labelWidth=100,
        btnShow='btnShow',
        title='打回信息',
        textareaplaceholder='打回信息';
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formBack" id="back_from" >
            <input type="hidden" id="employee" value="${employee}">
            <input type="hidden" id="order" value="${order}">
         
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">打回信息</label>
                <textarea type="textarea"  maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${textareaplaceholder}"></textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>
          <div class="el-form-item ">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}
function deleteSendEmployee(employee,order) {
    var data = {
        sendItem:JSON.stringify([{
            customer_complaint_id:complaint_id,
            order:order,
            responsible_person_id:employee,
        }]),
        _token:TOKEN
    };

    AjaxClient.post({
        url: URLS['complaint'].delete,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showAlreadySendEmployee();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                showAlreadySendEmployee();
            }

        }
    },this);

}
function send(data) {
    AjaxClient.post({
        url: URLS['complaint'].send,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            employee_list=[];
                ids=[];
                employees=[];
                employeeLists=[];
            showAlreadySendEmployee();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);

            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

        }
    },this);
}

function showEmployeeList(ele) {
    ele.html('');
    employeeLists.forEach(function (item) {
        var tr=`<tr class="tritem" data-id="${item.id}">
                <td>${item.department_name}</td>
                <td>${item.name}</td>
                <td> <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="${item.id}" style="color: #20a0ff;margin-left: 15px;"></i></td>
                            </tr>`;
        ele.append(tr);
        ele.find("tr:last-child").data('tritem',item);
    })

}
function bindPagenationClick(total,size){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:total,
        showData:size,
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
            showEmployeeByDepartment();
        }
    });
}
function getEmployeeByDepartment() {
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&sort=id&order=desc&page_no="+pageNo+"&page_size="+pageSize;

    $('.selectOperationAbility_table .info_table .table_tbody').html('');

    AjaxClient.get({
        url: URLS['abnormal'].employee+"?"+_token+urlLeft,
        // url: URLS['workhour'].materialList+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            employee_list = rsp.results;

            showEmployeeByDepartment();
            if(loadedObj.mLoaded){
                setTimeout(function () {
                    var _len = $('.selectOperationAbility_table.table_page .table_tbody');
                    if(_len.find('tr').length) {
                        _len.find('tr.tritem[data-id='+loadedObj.mLoaded+'] .el-radio-input').click();
                    }
                },100)
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);

            var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
            $('.selectOperationAbility_table .table_tbody').html(tr);
        },
        complete: function(){

        }
    },this);
}
function showEmployeeByDepartment() {
    var totalData=employee_list.length;
    if(employee_list&&employee_list.length){
        createMaterialTable($('.selectOperationAbility_table .info_table .table_tbody'),employee_list.slice((pageNo-1)*pageSize,pageNo*pageSize),ids);
    }else{
        var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('.selectOperationAbility_table .table_tbody').html(tr);
    }
    if(totalData>pageSize){
        bindPagenationClick(totalData,pageSize);
    }else{
        $('#pagenation').html('');
    }
}
function createMaterialTable(ele,data,sma){
    ele.html('');
    // var viewurl=$('#bom_view').val();
    data.forEach(function (item) {
        var tr ;

        if(sma.length){
            for(var i = 0; i < sma.length; i++){

                if (item.id == sma[i]) {

                    tr=`<tr class="tritem" data-id="${item.id}">
                <td class="tdleft"><span class="el-checkbox_input el-checkbox_input_check material-check is-checked" id="${item.id}"  data-name="${item.name}">
                <span class="el-checkbox-outset"></span>
            </span></td>
                <td>${item.department_name}</td>
                <td>${item.name}</td>
            </tr>`;
                    break;
                }else{

                    tr=`<tr class="tritem" data-id="${item.id}">
                <td class="tdleft"><span class="el-checkbox_input el-checkbox_input_check material-check" id="${item.id}"  data-name="${item.name}">
                <span class="el-checkbox-outset"></span>
            </span></td>
                <td>${item.department_name}</td>
                <td>${item.name}</td>
                            </tr>`;

                }
            }
        }else {
            tr=`<tr class="tritem" data-id="${item.id}">
                <td class="tdleft"><span class="el-checkbox_input el-checkbox_input_check material-check" id="${item.id}"  data-name="${item.name}">
                <span class="el-checkbox-outset"></span>
            </span></td>
                <td>${item.department_name}</td>
                <td>${item.name}</td>
                            </tr>`;
        }


        ele.append(tr);
        ele.find("tr:last-child").data('tritem',item);
    })
}


function Modal(add_type) {
    var labelWidth=150,
        btnShow='btnShow',
        title='发送相关部门',
        readonly='',
        department_id='';



    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formReport" id="addReport_from" data-flag="">
                <input type="hidden" id="add_type" value="${add_type}">
            <div class="el-form-item procedure_wrap" >
                       <div class="procedure_select material">
                         <div class="title"><h5>选择员工</h5></div>
                         <div class="searchItem" id="searchForm">
                            <div class="searchMAttr searchModal formModal" id="searchMAttr_from">
                                <div class="el-item">
                                    <div class="el-item-show" style="width: 400px;">
                                        <div class="el-item-align">
                                            <div class="el-form-item department" style="width: 100%;">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label" style="width: 80px;">部门</label>
                                                    <div class="el-select-dropdown-wrap">
                                                        <div class="el-select">
                                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                            <input type="hidden" class="val_id" id="department_id" value="">
                                                        </div>
                                                        <div class="el-select-dropdown">
                                                            <ul class="el-select-dropdown-list">
                                                                <li data-id="" data-pid="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                            </ul>
                                                        </div>
                                                    </div>                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                                            <button type="button" class="el-button reset">重置</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div class="selectOperationAbility_table table_page">
                            <div id="pagenation" class="pagenation"></div>
                            <table class="info_table uniquetable commontable">
                                <thead>
                                  <tr>
                                    <th class="thead">选择</th>
                                    <th class="thead">部门</th>
                                    <th class="thead">员工</th>
                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                   
                                </tbody>
                            </table>
                         </div>
                       </div>
                       <div class="procedure_btn">
                           <span>&gt;</span>
                        </div>
                       <div class="procedure_ability_value">
                           <div class="title"><h5>选中员工</h5><span class="errorMessage"></span></div>
                           <div class="inputOperationValue_table">
                            <table class="info_table">
                                <thead>
                                  <tr class="th_table_tbody">
                                        <th class="thead">部门</th>
                                        <th class="thead">员工</th>
                                        <th class="thead">操作</th>

                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                  
                                </tbody>
                            </table>
                          </div>
                       </div>
                    </div>
            
          
            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit report">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            // getLayerSelectPosition($(layero));
            getDepartment(department_id);

        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
}



function getDepartment(val) {
    AjaxClient.get({
        url: URLS['abnormal'].department+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var innerhtml,lis='',parent_id='';

            if(rsp.results&&rsp.results.length){

                    parent_id=rsp.results[0].parent_id;
                    lis=treeHtml(rsp.results,parent_id);


                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.department').find('.el-select-dropdown-list').html(innerhtml);

                if(val){//工序编辑
                    $('.el-form-item.department').find('.el-select-dropdown-item[data-id='+val+']').click();
                    $('.procedure_select.material #searchForm').find('.submit').click();
                }

            }
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    },this);
};

function treeHtml(fileData, parent_id) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        distance=level * 20,tagI='',itemcode=''
        var distance,className,itemImageClass,tagI,itemcode='';
        distance=level * 20,tagI='',itemcode=''

        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`: `<span>${item.name}</span> `;

        _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${encodeURI(item.name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id)}
	        `;

    });
    return _html;
};
