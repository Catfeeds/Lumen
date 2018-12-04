var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    deviceTypeList=[],
    typeCorrect=!1,
    materialCorrect=!1,
    routingCorrect=!1,
    validatorConfig = {
        part:'checkParts',
        require:'checkStandards'
    },
    validatorToolBox={
        checkType:function () {
            var value = $('#type').val().trim();
            return $('#type').parents('.el-form-item').find('.errorMessage').hasClass('active')?(typeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage('type',"请选择类型"),typeCorrect=!1,!1):
                (typeCorrect=1,!0);
        },
        checkParts:function (name) {
            var value = $('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(materialCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请输入保养部位"),materialCorrect=!1,!1):
                (materialCorrect=1,!0);
        },
        checkStandards:function(name){
            var value = $('#'+name).val().trim();

            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(routingCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请输入保养标准"),routingCorrect=!1,!1):
                    (routingCorrect=1,!0);
        }
    };
    //显示错误信息
    function showInvalidMessage(name,val) {
        $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).show();
        $('#'+name).parents('.el-form-item').find('.info').hide();
        // $('.btn-group').find('.submit.edit_upkee_require').addClass('is-disabled');
    }
    //输入框的相关事件
    $('body').on('focus','#addUpkeeRequire_from:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addUpkeeRequire_from:not(".disabled") .el-input:not([readonly])',function(){
        var name=$(this).attr("id");
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name);
    });
$(function(){
    resetParam();
    getUpkeeRequire();
    getSearch();
    bindEvent();
});

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
            getUpkeeRequire();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        type: '',
        upkee_part: '',
        upkee_require: '',
        order: 'desc',
        sort: 'id'
    };
}

//获取物料列表
function getUpkeeRequire(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['upkeeRequire'].pageIndex+"?"+_token+urlLeft,
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
            noData('获取列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}

//删除
function deleteUpkeeRequire(id,leftNum){
    AjaxClient.get({
        url: URLS['upkeeRequire'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getUpkeeRequire();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
            if(rsp.code==404){
                pageNo? null:pageNo=1;
                getUpkeeRequire();
            }
        }
    },this);
}

//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${item.devicetype_name}</td>
                <td>${item.part}</td>
                <td>${item.require}</td>
                <td class="right">
                <button data-id="${item.id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
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
            deviceTypeList=rsp.results;
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}


function getSearch(){
    $.when(getDeviceType())
        .done(function(deviceTypeRsp){
            var deviceTypelis='';
            if(deviceTypeRsp&&deviceTypeRsp.results&&deviceTypeRsp.results.length){
                deviceTypelis=selectHtml(deviceTypeRsp.results,deviceTypeRsp.results[0].parent_id);
                $('.el-form-item.deviceType').find('.el-select-dropdown-wrap').html(deviceTypelis);
            }

        }).fail(function(unitrsp,dataTypersp){
        console.log('获取设备类型失败');
    }).always(function(){
        layer.close(layerLoading);
    });
}

//生成下拉框数据
function selectHtml(fileData,parent_id,type){
    var innerhtml='';
    var lis=selecttreeHtml(fileData,parent_id);
    var typeName;
    deviceTypeList.forEach(function (item) {
        if(item.id==type){
            typeName = item.name;
        }
    });
    if(type){
        innerhtml=`<div class="el-form-item">
        <input type="text" readonly="readonly" class="el-input" value="${typeName}">
        <input type="hidden" class="val_id" id="type" value="${type}">
    </div>`;
    }else {
        innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="type" value="">
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
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#table_attr_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteUpkeeRequire(id,num);
        });
    });
    $('.uniquetable').on('click','.view',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        viewUpkeeRequire(id,'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        viewUpkeeRequire(id,'edit');
    });
    //排序
    // $('.sort-caret').on('click',function(e){
    //     e.stopPropagation();
    //     $('.el-sort').removeClass('ascending descending');
    //     if($(this).hasClass('ascending')){
    //         $(this).parents('.el-sort').addClass('ascending')
    //     }else{
    //         $(this).parents('.el-sort').addClass('descending')
    //     }
    //     $(this).attr('data-key');
    //     ajaxData.order=$(this).attr('data-sort');
    //     ajaxData.sort=$(this).attr('data-key');
    //     getMateriel();
    // });
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
    //搜索物料属性
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
                type: parentForm.find('#type').val().trim(),
                upkee_part: parentForm.find('#upkee_part').val().trim(),
                upkee_require: parentForm.find('#upkee_require').val().trim(),
                order: 'desc',
                sort: 'id'
            }
            getUpkeeRequire();
        }
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
        encodeURIComponent(parentForm.find('#upkee_part').val(''));
        encodeURIComponent(parentForm.find('#upkee_require').val(''));
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getUpkeeRequire();
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
    $('.button_check').on('click',function () {
        Model();
    });
    $('body').on('click','.button_add_details',function (e) {
        e.preventDefault();
        getDetailsList();
    });
    $('body').on('click','.inputupkeeRequireValue_table .delete',function () {
        $(this).parents().parents().eq(0).remove();
    });

    $('body').on('click','.add_upkee_require.submit:not(.is-disabled)',function (e) {
        e.preventDefault();
       
        var arr=[],_len = $('.inputupkeeRequireValue_table .table_tbody tr'),obj={},type = $('.formUpkeeRequire').find('#type').val();
       
        if(_len.length){
            $(_len).each(function (k,v) {
                if($(v).find('.part-count').val() != ''&&$(v).find('.require-count').val() != ''){
                    obj={
                        upkee_part:$(v).find('.part-count').val().trim(),
                        upkee_require:$(v).find('.require-count').val().trim(),
                    };
                    arr.push(obj)
                }

            });
        }
        if(arr.length){
            if(type){
                storeUpkeeRequire({
                    device_type:type,
                    sort:'',
                    _token:TOKEN,
                    items:JSON.stringify(arr)
                })
            }else {
                LayerConfig('fail','设备类型不能为空！');
            }
        }else {
            LayerConfig('fail','保养明细不能为空！');
            
        }


    });
    $('body').on('click','.edit_upkee_require.submit:not(.is-disabled)',function (e) {
        e.preventDefault();
       
        for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
        if(!materialCorrect || !routingCorrect) {
            return;
        }
        var parentForm = $('#addUpkeeRequire_from'),
            id = parentForm.find('#itemId').val().trim(),
            upkee_part = parentForm.find('#part').val().trim(),
            type = parentForm.find('#type').val().trim(),
            upkee_require = parentForm.find('#require').val().trim();
        editUpkeeRequire({
            id:id,
            sort:'',
            device_type:type,
            upkee_part:upkee_part,
            upkee_require:upkee_require,
            _token:TOKEN
        });

    })
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);

    });
}

function storeUpkeeRequire(data) {
    AjaxClient.post({
        url: URLS['upkeeRequire'].store,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getUpkeeRequire();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}
function editUpkeeRequire(data) {
    AjaxClient.post({
        url: URLS['upkeeRequire'].update,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getUpkeeRequire();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this);
}

function viewUpkeeRequire(id,flag) {
    AjaxClient.get({
        url: URLS['upkeeRequire'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            upkeeModal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该选型失败');
            if(rsp.code==404){
                getUpkeeRequire();
            }
        }
    },this);
}

function getDetailsList() {
    var tr=`<tr ">
        <td><input type="text" placeholder="请输入保养部位" class="part-count" value="" ></td>
        <td><input type="text" placeholder="请输入保养标准" class="require-count" value="" ></td>
        <td><i class="fa fa-minus-square oper_icon delete" title="删除" data-id=""></i></td>
    </tr>`;
    $('.inputupkeeRequireValue_table .table_tbody').append(tr)
}

function Model() {
    var labelWidth=50,
        title='添加保养要求';
        var typeHtml=selectHtml(deviceTypeList,deviceTypeList[0].parent_id);

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formUpkeeRequire" id="addUpkeeRequire_from" data-flag="">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">类型<span class="mustItem">*</span></label>
                <div class="el-select-dropdown-wrap">
                ${typeHtml}
                </div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>

          <div class="add_details_value">
             <div class="title">
                  <div style="color: #fff;background: #21A0FF;border: none;" class="button_add_details"><i class="fa fa-add"></i>添加明细</div>
             </div>
                <div class="inputupkeeRequireValue_table">
                   <table class="info_table">
                        <thead>
                          <tr class="th_table_tbody">
                                <th class="thead">保养部位</th>
                                <th class="thead">保养标准</th>
                                <th class="thead">操作</th>
                          </tr>
                        </thead>
                        <tbody class="table_tbody">

                        </tbody>
                   </table>
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>

          <div style="margin-top: 20px;" class="el-form-item btnShow">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit add_upkee_require">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
}

function upkeeModal(flag,data) {
    var {id='',part='',require='',type=''}={};
    if(data){
        ({id='',part='',require='',type=''}=data);
    }
    var labelWidth=100,
        btnShow='btnShow',
        title='查看保养要求',


        textareaplaceholder='',
        readonly='',
        typeHtml=selectHtml(deviceTypeList,deviceTypeList[0].parent_id,type),
        noEdit='';
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加保养要求':(title='编辑保养要求',textareaplaceholder='',noEdit='readonly="readonly"'));


    // var typeHtml=selectHtml(deviceTypeList,deviceTypeList[0].parent_id);

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formUpkeeRequire" id="addUpkeeRequire_from" data-flag="">
                    <input type="hidden" id="itemId" value="${id}">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">设备类型<span class="mustItem">*</span></label>
                <div class="el-select-dropdown-wrap">
                ${typeHtml}
                </div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>

          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">保养部位<span class="mustItem">*</span></label>
                <input type="text" id="part" ${readonly}  data-name="编码" class="el-input" placeholder="" value="${part}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>

          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">保养标准<span class="mustItem">*</span></label>
                <input type="text" id="require" ${readonly}  data-name="编码" class="el-input" placeholder="" value="${require}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>

          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit edit_upkee_require">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
}
