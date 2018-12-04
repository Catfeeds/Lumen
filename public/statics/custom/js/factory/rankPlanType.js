var pageNo=1,pageSize=20,ajaxData={},
    validatorWorkClassToolBox={
        checkName: function(name){
            var value = $('.addRankPlan').find('#'+name).val().trim();
            return $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkClassInvalidMessage(name,"班次类型名称不能为空"),!1):(!0);
        },
        checkFactory: function (name) {
            var value = $('.addRankPlan').find('#'+name).val().trim();
            return $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkClassInvalidMessage(name,"请选择工厂"),!1):(!0);
        }
    },

    validatorWorkClassConfig = {
        name:'checkName',
        factory_id: 'checkFactory'
    };


$(function () {
    getRankPlan();
    bindEvent();
})

function showWorkClassInvalidMessage(name,val){
    $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addRankPlan').find('.submit').removeClass('is-disabled');
}
function getWorkClassUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['rankPlanType'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}

function getRankPlan() {
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }

    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;

    AjaxClient.get({
        url: URLS['rankPlanType'].list+'?'+_token+urlLeft,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var pageTotal = rsp.paging.total_records;

            if(pageTotal>pageSize){
                bindPagenationClick(pageTotal,pageSize);
            }else{
                $('#pagenation').html('');
            }

            if(rsp.results && rsp.results.length){
                $('#table_rankType_table .table_tbody').html(createHtml(rsp.results))
            }else{
                noData('暂无数据',5);
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',4);
        }
    },this)
}

//分页
function bindPagenationClick(total,size) {
    $('.pagenation_wrap').show();
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
            getRankPlan();
        }
    });
}

function createHtml(data) {
    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${tansferNull(item.name)}</td>
                           <td>${tansferNull(item.code)}</td>
                           <td>${tansferNull(item.factory_name)}</td>
                           <td class="right nowrap">
                                <button data-id="${item.rankplantype_id}" class="button pop-button view">查看</button>
                                <button data-id="${item.rankplantype_id}" class="button pop-button edit">编辑</button>
                                <button data-id="${item.rankplantype_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return _html;
}

function bindEvent() {
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    //弹窗关闭
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
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
    $('body').on('click','.el-select-dropdown-item:not(.el-auto)',function(e){
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

    $('body').on('click','.actions #rankPlanType_add',function () {
        showWorkClassModal('add',0)
    })

    $('body').on('click','.addRankPlan .submit',function () {

        var correct=1;
        for (var type in validatorWorkClassConfig) {
            correct=validatorWorkClassConfig[type]&&validatorWorkClassToolBox[validatorWorkClassConfig[type]](type);
            if(!correct){
                break;
            }
        }
        if(correct) {
            if (!$(this).hasClass('is-disabled')) {
                $(this).addClass('is-disabled');
                var parentForm = $(this).parents('#addRankPlan_from'),
                    id = parentForm.find('#itemId').val();

                var name = parentForm.find('#name').val().trim(),
                    factory_id1 = parentForm.find('#factory_id').attr('data-id'),
                    code = parentForm.find('#code').val(),
                    factory_id = parentForm.find('#factory_id').val();
                $(this).hasClass('edit') ? (
                    editRankPlan({
                        name: name,
                        factory_id: factory_id1,
                        code: code,
                        rankplantype_id:id,
                        _token: TOKEN
                    })
                ) : (addRankPlan({
                    name: name,
                    factory_id: factory_id,
                    code: code,
                    _token: TOKEN
                }));
            }
        }
    })

    $('body').on('click','.table_tbody .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewRankPlan(id,'view');
        }else if($(this).hasClass('edit')){
            viewRankPlan(id,'edit');
        }else if($(this).hasClass('connect')){
            var name = $(this).attr('data-name');
            showRelationPeople(id,name);
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteRankPlan(id);
            });
        }
    })

    $('body').on('focus','#addRankPlan_from .el-input:not([readonly],.date)',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addRankPlan_from .el-input:not([readonly],.date)',function(){
        var flag=$('#addRankPlan_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addRankPlan_from #itemId').val();
        validatorWorkClassConfig[name]
        && validatorWorkClassToolBox[validatorWorkClassConfig[name]]
        && validatorWorkClassToolBox[validatorWorkClassConfig[name]](name);
    });
    //下拉框的相关事件
    $('body').on('focus','.el-select .el-input',function () {

        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-select .el-input',function () {
        var name=$(this).siblings('input').attr("id");

        var obj = $(this);

        setTimeout(function(){

            if(obj.siblings('input').val() == '') {

                validatorWorkClassConfig[name]
                && validatorWorkClassToolBox[validatorWorkClassConfig[name]]
                && validatorWorkClassToolBox[validatorWorkClassConfig[name]](name);

            }else{

                $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);

    });
}

//查看班次
function viewRankPlan(id,flag){
    AjaxClient.get({
        url: URLS['rankPlanType'].show+"?rankplantype_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showWorkClassModal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//编辑班次
function editRankPlan(data){
    console.log(data);
    AjaxClient.post({
        url: URLS['rankPlanType'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getRankPlan()
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if (rsp.code==1152){
                layer.msg(rsp.message, {icon: 2});
            }
            // layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addRankPlan_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showWorkClassInvalidMessage(rsp.field,rsp.message);
            }

        }
    },this);
}
//删除班次
function deleteRankPlan(id){
    AjaxClient.get({
        url: URLS['rankPlanType'].delete+"?rankplantype_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getRankPlan()
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
//添加班次
function addRankPlan(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['rankPlanType'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getRankPlan()
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp.field!==undefined){
                showWorkClassInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
        },
        complete: function(){
            $('.addRankPlan .submit').removeClass('is-disabled');
        }
    },this)

}

//班次
function showWorkClassModal(flag,ids,data) {
    console.log(data);
    var labelWidth=135, readonly= '',btnShow='btnShow',title= '查看班次类型',noEdit='',
        {rankplan_id='',name='',workcenter_name='',workcenter_id='',from='',to='',factory_name='',factory_id='',code=''}={};

    if(data){
        ({rankplan_id='',name='',workcenter_name='',workcenter_id='',from='',to='',factory_name='',factory_id='',code=''}=data);
    }
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑班次类型',noEdit='readonly="readonly"'):title='添加班次类型');
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content:`<form class="addRankPlan formModal" id="addRankPlan_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">班次类型名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly}  class="el-input" placeholder="请输入班次类型名称" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">班次编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} class="el-input" placeholder="班次编码" value="${code}">
                        </div>
                        <p class="errorMessage" id="startMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item factory_select">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工厂<span class="mustItem">*</span></label>
                            ${flag != 'add'? `<input type="text" id="factory_id" data-id="${factory_id}" readonly class="el-input" placeholder="" value="${factory_name}">`:
                             `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="factory_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                    </ul>
                                </div>
                            </div>`}
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
</form>`,
        success: function(layero,index){
            layerEle=layero;
            getFactorySelect(factory_id);
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

function getFactorySelect(val) {
    AjaxClient.get({
        url: URLS['source'].factory+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';

                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });

                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.factory_select').find('.el-select-dropdown-list').html(innerhtml);

                if(val){

                    $('.el-form-item.factory_select').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }

            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },200);
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    },this);
}