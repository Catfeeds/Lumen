var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    categoryList={},
    start_time = '',
    end_time = '',
    check_start_time = '',
    check_end_time = '',
    codeCorrect=!1,
    validatorToolBox={

        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1): (codeCorrect=1,!0);
        },

    },
    remoteValidatorToolbox={

        remoteCheckCode: function(name,flag,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    codeCorrect=1;
                }
            });
        },
    },
    validatorConfig = {
        code: "checkCode"
    },remoteValidatorConfig={
        code: "remoteCheckCode"
    };
$(function(){
    resetParam();
    getPlan();
    bindEvent();

    // typeList();

});
//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addPlan_from').find('.submit').removeClass('is-disabled');
}
//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        arrive_start_time: '',
        arrive_end_time: '',
        test_start_time: '',
        test_end_time: '',
        order: 'asc',
        sort: 'id'
    };
}
//检测唯一性
function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['plan'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
            // layer.close(layerLoading);
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
            getPlan();
        }
    });
};

//获取异常单列表
function getPlan(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['plan'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
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
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取物料列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}
//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${item.code}</td>
                <td>${item.partner_name}</td>
                <td>${item.material_name}</td>
                <td>${item.qty}</td>
                <td>${item.lot}</td>
                <td>${item.arrive_time?timestampToTime(item.arrive_time):''}</td>
                <td>${item.test_time?timestampToTime(item.test_time):''}</td>
                <td>${item.remark.length>30?item.remark.substring(0,30)+'...':item.remark}</td> 
                <td class="right">
                <button data-id="${item.id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
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
    //输入框的相关事件
    $('body').on('focus', '.formPlan:not(".disabled") .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.formPlan:not(".disabled") .el-input:not([readonly])', function () {
        var flag = $('#addPlan_from').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
    });

//搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                arrive_start_time: parentForm.find('#start_time').val(),
                arrive_end_time: parentForm.find('#end_time').val(),
                test_start_time: parentForm.find('#check_start_time').val() ,
                test_end_time: parentForm.find('#check_end_time').val(),
                code: parentForm.find('#bin_code').val().trim(),
                order: 'asc',
                sort: 'id'
            }
            getPlan();
        }
    });
    $('body').on('click','#searchForm .el-select',function(){
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

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#check_start_time_input').text('');
        parentForm.find('#check_end_time_input').text('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getPlan();
    });
    //添加
    $('.button_check').on('click',function(){
        getPartner('add');

    });
    $('.table_tbody').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewPlan($(this).attr("data-id"),'view');
    });
    $('.table_tbody').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewPlan($(this).attr("data-id"),'edit');
    });
    $('.table_tbody').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deletePlan(id);
        });
    });
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);

    });

    //弹窗下拉
    $('body').on('click','.formPlan:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#end_time_input').text() ? $('#end_time_input').text() : '2099-12-30 23:59:59';
        start_time = laydate.render({
            elem: '#start_time_input',
            max: max,
            type: 'datetime',
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
        var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2016-1-1 00:00:00';
        end_time = laydate.render({
            elem: '#end_time_input',
            min: min,
            max: '2099-12-30 23:59:59',
            type: 'datetime',
            show: true,
            closeStop: '#end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('#check_start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#check_end_time_input').text() ? $('#check_end_time_input').text() : '2099-12-30 23:59:59';
        check_start_time = laydate.render({
            elem: '#check_start_time_input',
            max: max,
            type: 'datetime',
            show: true,
            closeStop: '#check_start_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('#check_end_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var min = $('#check_start_time_input').text() ? $('#check_start_time_input').text() : '2016-1-1 00:00:00';
        check_end_time = laydate.render({
            elem: '#check_end_time_input',
            min: min,
            max: '2099-12-30 23:59:59',
            type: 'datetime',
            show: true,
            closeStop: '#check_end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    //下拉选择
    $('body').on('click','.formPlan:not(".disabled") .el-select-dropdown-item',function(e){
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
    //更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#searchForm .el-item-show').css('background','#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400,function(){
                that.removeClass('noclick');
            });
        }else{
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
                that.removeClass('noclick');
            });
        }
    });

// //检验单下拉筛选
//     $('body').on('click','.search-span',function () {
//         var code = $('#searchVal').val();
//         var ele=$(this).siblings('.el-input');
//         getSearchCode(ele,code);
//     });
    //添加和编辑的提交
    $('body').on('click','.formPlan:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addPlan_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            $(this).addClass('is-disabled');
            parentForm.addClass('disabled');
            var partner=parentForm.find('#partner').val().trim(),
                code=parentForm.find('#code').val().trim(),
                remark=parentForm.find('#remark').val(),
                qty=parentForm.find('#qty').val(),
                arrive_time=parentForm.find('#arrive_time').val(),
                lot=parentForm.find('#lot').val(),
                test_time=parentForm.find('#test_time').val();
            var $itemMaterial=$('#material_number');
            var material=$itemMaterial.data('inputItem')==undefined||$itemMaterial.data('inputItem')==''?'':
                $itemMaterial.data('inputItem').name==$itemMaterial.val().trim()?$itemMaterial.data('inputItem').id:'';
            for (var type in validatorConfig) {
                validatorToolBox[validatorConfig[type]](type);
            }

                if ( codeCorrect){

                    $(this).hasClass('edit')?(
                        editPlan({
                            id:id,
                            material:material,
                            supplier:partner,
                            code:code,
                            qty:qty,
                            arrive_time:Date.parse(new Date(arrive_time))/1000,
                            test_time:Date.parse(new Date(test_time))/1000,
                            lot:lot,
                            remark:remark,
                            _token:TOKEN
                        })

                    ):(
                        addPlan({
                                material:material,
                                supplier:partner,
                                code:code,
                                qty:qty,
                                arrive_time:Date.parse(new Date(arrive_time))/1000,
                                test_time:Date.parse(new Date(test_time))/1000,
                                lot :lot,
                                remark:remark,
                                _token:TOKEN
                        })

                    )
                }
            // }else {
            //     $(this).removeClass('is-disabled');
            //     parentForm.removeClass('disabled');
            //     layer.confirm('类型不能为空！', {icon: 3, title:'提示',offset: '250px',end:function(){
            //
            //     }}, function(index){
            //         layer.close(index);
            //     });
            // }



        }
    });
};

function deletePlan(id) {

    AjaxClient.get({
        url: URLS['plan'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getPlan();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getPlan();
            }
        }
    },this);
}

//查看其他选型
function viewPlan(id,flag){
    AjaxClient.get({
        url: URLS['plan'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getPartner(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该选型失败');
            if(rsp.code==404){
                getPlan();
            }
        }
    },this);
}

function editPlan(data) {
    AjaxClient.post({
        url: URLS['plan'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getPlan();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addOtherOption_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
function addPlan(data) {
    AjaxClient.post({
        url: URLS['plan'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getPlan();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addOtherOption_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}






function Modal(flag,data,formDate){

    var {id='',code='',material='',material_name='',supplier='',partner_name='',qty='',lot='',arrive_time='',test_time='',remark=''}={};
    if(data){
        ({id='',code='',material='',material_name='',supplier='',partner_name='',qty='',lot='',arrive_time='',test_time='',remark=''}=data);
    }

    var labelWidth=150,
        btnShow='btnShow',
        title='查看计划',


        textareaplaceholder='',
        readonly='',
        partnerHtml= selectHtml(formDate,flag,data),
        noEdit='';
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加计划':(title='编辑计划',textareaplaceholder='',noEdit='readonly="readonly"'));


    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formPlan" id="addPlan_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${id}">
         
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">单据编号<span class="mustItem">*</span></label>
                <input type="text" id="code" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="请输入编码" value="${code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">供应商</label>
                ${partnerHtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
              <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: ${labelWidth}px;">物料名称</label>
                  <div class="el-select-dropdown-wrap">
                      <input type="text" id="material_number" ${readonly} class="el-input" autocomplete="off" placeholder="物料名称" value="">
                  </div>
              </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">预计到货时间</label>
                    <input type="text" id="arrive_time" ${readonly}  data-name="预计到货时间" class="el-input" placeholder="预计到货时间" value="${timestampToTime(arrive_time)}">
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">检验时间</label>
                    <input type="text" id="test_time" ${readonly}  data-name="检验时间" class="el-input" placeholder="检验时间" value="${timestampToTime(test_time)}">
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">数量</label>
                    <input type="number" min="0" id="qty" ${readonly} data-name="数量" onblur="value=value.replace(/\\-/g,'')" class="el-input" placeholder="数量" value="${qty}">
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
             </div>  
             
             <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">批号</label>
                    <input type="text" id="lot" ${readonly}  data-name="批号"  class="el-input" placeholder="批号" value="${lot}">
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
             </div>
             
           
            
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                    <textarea type="textarea" ${readonly} maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="${textareaplaceholder}">${remark}</textarea>
                </div>
                <p class="errorMessage" style="display: block;"></p>
             </div>
          
          

          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            if(flag!='view'){
                $('#material_number').autocomplete({
                    url: URLS['complaint'].dimMaterial+"?"+_token
                });
                $('#material_number').each(function(item){
                    var width=$(this).parent().width();
                    $(this).siblings('.el-select-dropdown').width(width);

                });
                laydate.render({
                    elem: '#arrive_time'
                    ,done: function(value, date, endDate){

                    }
                });
                laydate.render({
                    elem: '#test_time'
                    ,done: function(value, date, endDate){

                    }
                });
            }
            if(data){
                $('#material_number').val(data.material_name).data('inputItem',{id:data.material,name:data.material_name}).blur();
            }


        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};

function getPartner(flag,planData) {
    AjaxClient.get({
        url:URLS['plan'].getpartners+"?"+_token,
        dataType:'json',
        beforeSend:function () {
            layerLoading =  LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            Modal(flag,planData,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading) ;
            layer.msg('获取类别失败', {icon: 5,offset: '250px',time: 1500});

        }
    },this);
}

function selectHtml(formData,flag,data) {
    var elSelect,innerhtml,lis='';

    formData.forEach(function (item) {
        lis+= `
    		<li data-id="${item.id}"  class="el-select-dropdown-item ">${item.name}</li>
	        `;
    })

    if(flag==='view'){
        innerhtml=`<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${data.partner_name}">
			<input type="hidden" class="val_id" data-code="" id="partner" value="${data.supplier}">
		</div>`;
    }else if(flag==='edit') {
        innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="${data.partner_name}">
			<input type="hidden" class="val_id" data-code="" id="partner" value="${data.supplier}">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="" data-pid="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }else {
        innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="partner" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="" data-pid="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }

    elSelect=`<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    return elSelect;
}

function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate());

    return Y+M+D;
}