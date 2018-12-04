var layerLoading,layerModal,layerEle,pageNo=1,factory_id=0,layerOffset,seleNum = 11,scrollTop=0,
    pageDeviceNo=1,
    deviceData=[],
    ajaxDeviceData={
        code: '',
        name: '',
        order: 'asc',
        sort: 'node'
    },
    pageSize=10,
    operationId={},
    validatorFactoryToolBox={
        checkCode: function(name){
            var value = $('.addFactory').find('#'+name).val().trim();

            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showFactoryInvalidMessage(name,"工厂编码不能为空"),!1):
                !Validate.checkFactoryCode(value)?(showFactoryInvalidMessage(name,"工厂编码由1-20位字母下划线数字组成"),!1):(!0)
        },
        checkName: function(name){
            var value = $('.addFactory').find('#'+name).val().trim();
            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showFactoryInvalidMessage(name,"工厂名称不能为空"),!1):(!0);
        },
        checkPhone:function (name) {
            var value=$('.addFactory').find('#'+name).val().trim();

            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(!0):
                !Validate.checkPhone(value) ? (showFactoryInvalidMessage(name,"电话格式不正确"),!1):(!0);
        },
        checkMobile: function(name){
            var value = $('.addFactory').find('#'+name).val();
            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(!0):
                !Validate.checkMobile(value)?(showFactoryInvalidMessage(name,"手机格式不正确"),!1):(!0);
        },
        checkFax: function(name){
            var value = $('.addFactory').find('#'+name).val().trim();
            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(!0):
                    Validate.checkFax(value)?(!0):(showFactoryInvalidMessage(name,"传真格式不正确"),!1);
        },
        checkEmail: function(name){
            var value = $('.addFactory').find('#'+name).val().trim();
            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(!0):
                    Validate.checkEmail(value)?(!0):(showFactoryInvalidMessage(name,"邮箱格式不正确"),!1);
        },
        checkCountry:function (name) {
            var value = $('.addFactory').find('#'+name).val();

            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showFactoryInvalidMessage(name,"请选择国家"),!1):(!0);
        }
    },
    remoteFactoryValidatorToolbox={
        remoteCheckName: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getFactoryUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showFactoryInvalidMessage(name,val);
                }
            });
        }
    },
    validatorFactoryConfig={
        code: "checkCode",
        name: "checkName",
        email:'checkEmail',
        fax:'checkFax',
        mobile : 'checkMobile',
        phone: 'checkPhone',
        country_id: 'checkCountry'
    },
    remoteFactoryValidatorConfig={
        code: "remoteCheckName",
        name: "remoteCheckName"
    },
    validatorWorkShopToolBox={
        checkCode: function(name){
            var value = $('.addWorkShop').find('#'+name).val().trim();
            return $('.addWorkShop').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkShopInvalidMessage(name,"车间编码不能为空"),!1):
                !Validate.checkFactoryCode(value)?(showWorkShopInvalidMessage(name,"车间编码由1-20位字母下划线数字组成,字母开头"),!1):(!0)
        },
        checkName: function(name){
            var value = $('.addWorkShop').find('#'+name).val().trim();
            return $('.addWorkShop').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkShopInvalidMessage(name,"名称不能为空"),!1):(!0);
        }
    },
    remoteWorkShopValidatorToolbox={
        remoteCheckName: function(flag,name,id,factory_id){
            var value=$('#'+name).val().trim();
            getWorkShopUnique(flag,name,value,id,factory_id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showWorkShopInvalidMessage(name,val);
                }
            });
        }
    },
    validatorWorkShopConfig={
        code: "checkCode",
        name: "checkName"
    },
    remoteWorkShopValidatorConfig={
        code: "remoteCheckName",
        name: "remoteCheckName"
    },
    validatorWorkCenterToolBox={
        checkCode: function(name){
            var value = $('.addWorkCenter').find('#'+name).val().trim();
            return $('.addWorkCenter').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkCenterInvalidMessage(name,"编码不能为空"),!1):
                !Validate.checkFactoryCode(value)?(showWorkCenterInvalidMessage(name,"编码由1-20位字母下划线数字组成,字母开头"),!1):(!0)
        },
        checkName: function(name){
            var value = $('.addWorkCenter').find('#'+name).val().trim();
            return $('.addWorkCenter').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkCenterInvalidMessage(name,"名称不能为空"),!1):(!0);
        },
    },
    remoteWorkCenterValidatorToolbox={
        remoteCheckName: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getWorkCenterUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showWorkCenterInvalidMessage(name,val);
                }
            });
        }
    },
    validatorWorkCenterConfig = {
        code: "checkCode",
        name: "checkName"
    },
    remoteWorkCenterValidatorConfig={
        code: "remoteCheckName",
        name: "remoteCheckName"
    },
    validatorWorkBenchToolBox={
        checkCode: function(name){
            var value = $('.addWorkBench').find('#'+name).val().trim();
            return $('.addWorkBench').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value) ? (showWorkBenchInvalidMessage(name, "编码不能为空"), !1) :
                !Validate.checkFactoryCode(value)?(showWorkBenchInvalidMessage(name,"编码由1-20位字母下划线数字组成,字母开头"),!1):(!0)
        },
        checkName: function(name) {
            var value = $('.addWorkBench').find('#' + name).val().trim();
            return $('.addWorkBench').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showWorkBenchInvalidMessage(name, "名称不能为空"), !1) : (!0);
        }
    },
    remoteWorkBenchValidatorToolbox={
        remoteCheckName: function(flag,name,id,workCenterId){
            var value=$('#'+name).val().trim();
            getWorkBenchUnique(flag,name,value,id,workCenterId,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showWorkBenchInvalidMessage(name,val);
                }
            });
        }
    },
    validatorWorkBenchConfig = {
        code: "checkCode",
        name: "checkName"
    },
    remoteWorkBenchValidatorConfig={
        code: "remoteCheckName",
    },
    validatorWorkMachineToolBox={
        checkCode: function(name){
            var value = $('.addWorkMachine').find('#'+name).val().trim();
            return $('.addWorkMachine').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkMachineInvalidMessage(name,"编码不能为空"),!1):
                !Validate.checkFactoryCode(value)?(showWorkMachineInvalidMessage(name,"编码由1-20位字母下划线数字组成,字母开头"),!1):(!0)
        },
        checkName: function(name){
            var value = $('.addWorkMachine').find('#'+name).val().trim();
            return $('.addWorkMachine').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkMachineInvalidMessage(name,"名称不能为空"),!1):(!0);
        },
        checkCompose_type_no: function(name){
            var value = $('.addWorkMachine').find('#'+name).val().trim();
            return $('.addWorkMachine').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkMachineInvalidMessage(name,"排版号不能为空"),!1):
                !Validate.checkFactoryCode(value)?(showWorkMachineInvalidMessage(name,"排版号由1-20位字母下划线数字组成,字母开头"),!1):(!0)
        },
        checkIp: function(name){
            var value = $('.addWorkMachine').find('#'+name).val().trim();
            return $('.addWorkMachine').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkMachineInvalidMessage(name,"IP地址不能为空"),!1):
                    !Validate.checkIp(value)?(showWorkMachineInvalidMessage(name,"IP地址格式不正确"),!1):(!0);
        },
    },
    remoteWorkMachineValidatorToolbox={
        remoteCheckName: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getWorkMachineUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showWorkMachineInvalidMessage(name,val);
                }
            });
        }
    },
    validatorWorkMachineConfig = {
        code: "checkCode",
        name: "checkName",
        compose_type_no:'checkCompose_type_no',
        ip_address:'checkIp'
    },
    remoteWorkMachineValidatorConfig={
        code: "remoteCheckName",
        name: "remoteCheckName",
        compose_type_no:'remoteCheckName',
    };

$(function () {
    getCompanySource();
    bindEvent();
})

//显示错误信息
function showFactoryInvalidMessage(name,val){
    $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addFactory').find('.submit').removeClass('is-disabled');
}
function showWorkShopInvalidMessage(name,val){
    $('.addWorkShop').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addWorkShop').find('.submit').removeClass('is-disabled');
}
function showWorkCenterInvalidMessage(name,val){
    $('.addWorkCenter').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addWorkCenter').find('.submit').removeClass('is-disabled');
}
function showWorkBenchInvalidMessage(name,val){
    $('.addWorkBench').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addWorkBench').find('.submit').removeClass('is-disabled');
}
function showWorkBenchInvalidMessage2(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#'+name).parents('.el-form-item').find('.submit').removeClass('is-disabled');
}
function showWorkMachineInvalidMessage(name,val){
    $('.addWorkMachine').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addWorkMachine').find('.submit').removeClass('is-disabled');
}
function showWorkClassInvalidMessage(name,val){
    $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addRankPlan').find('.submit').removeClass('is-disabled');
}

function getCompanySource() {
    AjaxClient.get({
        url: URLS['company'].source + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                $('.company_wrap h3').removeClass('none');
                $('.company_tree').html(companyList(rsp.results,'company'));
                setTimeout(function(){
                    $('.company_tree_container .company_tree').find('.item-name.company-tree-item').eq(0).click();
                },200);
            }else{
                $('.company_wrap').html(`<div class="no_infotip">用户暂无公司信息</div>`)
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('.company_wrap').html(`<div class="no_infotip">用户暂无公司信息</div>`)
        }
    })
}
//唯一性检测
function getFactoryUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['factory'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}
function getWorkShopUnique(flag,field,value,id,factory_id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}&factory_id=${factory_id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}&factory_id=${factory_id}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['workShop'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}
function getWorkCenterUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['workCenter'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}
function getWorkBenchUnique(flag,field,value,id,workCenterId,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}&workCenterId=${workCenterId}`;
    }else{
        urlLeft=`&field=${field}&value=${value}&workCenterId=${workCenterId}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['workBench'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}
function getWorkMachineUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['workMachine'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}

//顶级公司信息
function companyList(data,flag) {
    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html += `<div class="tree-folder ${flag}" data-id="${item.company_id}" data-flag="${flag}">
             <div class="tree-folder-header">
             <div class="flex-item">
             <i class="icon-plus expand-icon ${flag}" data-id="${item.company_id}" data-flag="${flag}"></i>
             <div class="tree-folder-name"><p class="company-tree-item top-item item-name ${flag}" data-flag="${flag}" data-id="${item.company_id}">${item.company_name}</p></div></div></div>
             <div class="tree-folder-content">
               
             </div>
          </div> `
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
    //单选按钮点击事件
    $('body').on('click','.radioCheck .el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });
    $('body').on('click','.status .el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });
    //弹窗关闭
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    //树形表格展开收缩
    $('body').on('click','.company_tree .expand-icon',function(e){
        pageNo=1;
        if($(this).hasClass('icon-minus')){
            pageNo=1;
            $(this).addClass('icon-plus').removeClass('icon-minus');
            $(this).parents('.tree-folder-header').siblings('.tree-folder-content').hide();
        }else {
            pageNo=1;
            $(this).addClass('icon-minus').removeClass('icon-plus');
            var id = $(this).attr('data-id'),
                flag = $(this).attr('data-flag');
            getTreeList(id,$(this));
        }
    });
    //树结构名称
    $('body').on('click','.company_tree .item-name',function () {
        var parent=$(this).parents('.company_tree_container');
        if($(this).hasClass('company-tree-item')){
            if($(this).hasClass('selected')){
                return false;
            }
            parent.find('.item-name').removeClass('selected');
            $(this).addClass('selected');
            var flag = $(this).attr('data-flag'),
                id= $(this).attr('data-id');
            operationId.id=id;
            getSourceDetail(id,flag);
        }
    })
    //添加弹窗
    $('body').on('click','.operation_wrap .button-define',function () {
         if($(this).hasClass('factory_add')){
             showFactoryModal('add',0);
         } else if($(this).hasClass('workshop_add')){
             showWorkShopModal('add',0);
         }else if($(this).hasClass('workcenter_add')) {
             showWorkCenterModal('add',0);
         }else if($(this).hasClass('workbench_add')){
             showWorkBenchModal('add',0);
         }else if($(this).hasClass('workmachine_add')){
             showWorkMachineModal('add',0)
         }else if($(this).hasClass('worknumber_add')){
             showWorkNumberModal('select',0)
         }
    })

    $('body').on('click','.addFactory .submit',function () {

        var correct=1;
        for (var type in validatorFactoryConfig) {
            correct=validatorFactoryConfig[type]&&validatorFactoryToolBox[validatorFactoryConfig[type]](type);
            if(!correct){
                break;
            }
        }

        if(correct){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                var parentForm = $(this).parents('#addFactory_from'),
                    id= parentForm.find('#itemId').val();

                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    mobile = parentForm.find('#mobile').val(),
                    phone = parentForm.find('#phone').val().trim(),
                    address = parentForm.find('#address').val().trim(),
                    fax = parentForm.find('#fax').val(),
                    country_id = parentForm.find('#country_id').val(),
                    email = parentForm.find('#email').val();

                $(this).hasClass('edit')?(
                    editFactory({
                        factory_id: id,
                        code: code,
                        name: name,
                        phone:phone,
                        address: address,
                        mobile:mobile,
                        email:email,
                        fax:fax,
                        _token: TOKEN

                    })
                ):(addFactory({
                    code: code,
                    name: name,
                    company_id: operationId.id,
                    address: address,
                    phone: phone,
                    mobile:mobile,
                    fax: fax,
                    country_id:country_id,
                    email: email,
                    _token: TOKEN
                }));
            }
        }


    })

    $('body').on('click','.addWorkShop .submit',function () {
        var correct=1;
        for (var type in validatorWorkShopConfig) {
            correct=validatorWorkShopConfig[type]&&validatorWorkShopToolBox[validatorWorkShopConfig[type]](type);
            if(!correct){
                break;
            }
        }
        if(correct){
            if(!$(this).hasClass('is-disabled')){
                var parentForm = $(this).parents('#addWorkShop_from'),
                    id= parentForm.find('#itemId').val();
                $(this).addClass('is-disabled');
                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    address = parentForm.find('#address').val().trim(),
                    desc = parentForm.find('#desc').val().trim();

                $(this).hasClass('edit')?(
                    editWorkShop({
                        workshop_id: id,
                        code: code,
                        name: name,
                        address: address,
                        desc:desc,
                        _token: TOKEN

                    })
                ): addWorkShop({
                    code: code,
                    name: name,
                    factory_id: operationId.id,
                    address: address,
                    desc:desc,
                    _token: TOKEN
                })
            }
        }
    })

    $('body').on('click','.addWorkCenter .submit',function () {
        var correct=1;
        for (var type in validatorWorkCenterConfig) {
            correct=validatorWorkCenterConfig[type]&&validatorWorkCenterToolBox[validatorWorkCenterConfig[type]](type);
            if(!correct){
                break;
            }
        }

        if(correct){
            if(!$(this).hasClass('is-disabled')) {
                var parentForm = $(this).parents('#addWorkCenter_from'),
                    id= parentForm.find('#itemId').val();
                $(this).addClass('is-disabled');
                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    desc = parentForm.find('#desc').val().trim();
                $(this).hasClass('edit')?(
                    editWorkCenter({
                        workcenter_id: id,
                        code: code,
                        name: name,
                        desc:desc,
                        _token: TOKEN
                    })
                ):(addWorkCenter({
                    code: code,
                    name: name,
                    workshop_id:  operationId.id,
                    desc:desc,
                    _token: TOKEN
                }));
            }
        }
    })

    $('body').on('click','.addWorkBench .submit',function () {
        var correct=1;
        for (var type in validatorWorkBenchConfig) {
            correct=validatorWorkBenchConfig[type]&&validatorWorkBenchToolBox[validatorWorkBenchConfig[type]](type);
            if(!correct){
                break;
            }
        }
        var items = []
        $('#addWorkBench .workBenchTable .table_tbody tr').each(function (k,v) {
            if($(v).attr('data-id')!=undefined&&$(v).attr('data-id')!=''&&$(v).attr('data-id')!='null'){
                items.push({
                    id:$(v).attr('data-bench')?$(v).attr('data-bench'):'',
                    device_id:$(v).attr('data-id')?$(v).attr('data-id'):''
                })
            }

        });



        if(correct){
            if(!$(this).hasClass('is-disabled')) {
                var parentForm = $(this).parents('#addWorkBench_from'),
                    id= parentForm.find('#itemId').val();
                $(this).addClass('is-disabled');
                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    status = parentForm.find('.status .is-radio-checked .status_bench').val(),
                    desc = parentForm.find('#desc').val().trim();
                $(this).hasClass('edit')?(
                    editWorkBench({
                        workbench_id: id,
                        name: name,
                        desc:desc,
                        status:status,
                        items:JSON.stringify(items),
                        _token: TOKEN

                    })
                ):(addWorkBench({
                    code: code,
                    name: name,
                    workcenter_id:operationId.id,
                    status:status,
                    desc:desc,
                    items:JSON.stringify(items),
                    _token: TOKEN
                }));
            }
        }
    })

    $('body').on('click','.addWorkMachine .submit',function () {
        var correct=1;
        for (var type in validatorWorkMachineConfig) {
            correct=validatorWorkMachineConfig[type]&&validatorWorkMachineToolBox[validatorWorkMachineConfig[type]](type);
            if(!correct){
                break;
            }
        }

        if(correct) {
            if (!$(this).hasClass('is-disabled')) {
                var parentForm = $(this).parents('#addWorkMachine_from'),
                    id = parentForm.find('#itemId').val();
                $(this).addClass('is-disabled');
                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    compose_type_no = parentForm.find('#compose_type_no').val(),
                    ip_address = parentForm.find('#ip_address').val(),
                    status = parentForm.find('.statusele .is-radio-checked .using').val(),
                    online_status = parentForm.find('.online_statusele .is-radio-checked .online_status').val();
                $(this).hasClass('edit') ? (
                    editWorkMachine({
                        workmachine_id: id,
                        name: name,
                        compose_type_no: compose_type_no,
                        status: status,
                        ip_address: ip_address,
                        online_status: online_status,
                        _token: TOKEN

                    })
                ) : (addWorkMachine({
                    code: code,
                    name: name,
                    workbench_id: operationId.id,
                    compose_type_no: compose_type_no,
                    status: status,
                    ip_address: ip_address,
                    online_status: online_status,
                    _token: TOKEN
                }));
            }
        }

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
                    from = parentForm.find('#from').val(),
                    to = parentForm.find('#to').val(),
                    rest_from = [];
                $('#restTimeWrap .select-item').each(function (k, v) {
                    var obj = {
                        rest_from: $(v).find('input[name=rest_from]').val(),
                        rest_to: $(v).find('input[name=rest_to]').val(),
                        comment: $(v).find('input[name=comment]').val(),
                    }
                    rest_from.push(obj);
                });
                $(this).hasClass('edit') ? (
                    editRankPlan({
                        rest_time: JSON.stringify(rest_from),
                        name: name,
                        from: from,
                        to: to,
                        rankplan_id: id,
                        workshop_id: operationId.id,
                        _token: TOKEN
                    })
                ) : (addRankPlan({
                    name: name,
                    workshop_id: operationId.id,
                    from: from,
                    to: to,
                    rest_time: JSON.stringify(rest_from),
                    _token: TOKEN
                }));
            }
        }
    })

    $('body').on('click','.info_table.workshop .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewWorkShop(id,'view');
        }else if($(this).hasClass('edit')){
            viewWorkShop(id,'edit');
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteWorkShop(id);
            });
        }
    })

    $('body').on('click','.info_table.workcenter .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewWorkCenter(id,'view');
        }else if($(this).hasClass('edit')){
            viewWorkCenter(id,'edit');
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteWorkCenter(id);
            });
        }
    })

    $('body').on('click','.info_table.workbench .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewWorkBench(id,'view');
        }else if($(this).hasClass('edit')){
            viewWorkBench(id,'edit');
        }else if($(this).hasClass('procedure')){

        } else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteWorkBench(id);
            });
        }
    })

    $('body').on('click','.info_table.workmachine .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewWorkMachine(id,'view');
        }else if($(this).hasClass('edit')){
            viewWorkMachine(id,'edit');
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteWorkMachine(id);
            });
        }
    })

    $('body').on('click','.info_table.factory .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewFactory(id,'view');
        }else if($(this).hasClass('edit')){
            viewFactory(id,'edit');
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteFactory(id);
            });
        }
    })

    //输入框的相关事件
    $('body').on('focus','#addFactory_from .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addFactory_from .el-input:not([readonly])',function(){
        var flag=$('#addFactory_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addFactory_from #itemId').val();
        validatorFactoryConfig[name]
        && validatorFactoryToolBox[validatorFactoryConfig[name]]
        && validatorFactoryToolBox[validatorFactoryConfig[name]](name)
        && remoteFactoryValidatorConfig[name]
        && remoteFactoryValidatorToolbox[remoteFactoryValidatorConfig[name]]
        && remoteFactoryValidatorToolbox[remoteFactoryValidatorConfig[name]](flag,name,id);
    });

    $('body').on('focus','#addWorkShop_from .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addWorkShop_from .el-input:not([readonly])',function(){
        var flag=$('#addWorkShop_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addWorkShop_from #itemId').val();
        validatorWorkShopConfig[name]
        && validatorWorkShopToolBox[validatorWorkShopConfig[name]]
        && validatorWorkShopToolBox[validatorWorkShopConfig[name]](name)
        && remoteWorkShopValidatorConfig[name]
        && remoteWorkShopValidatorToolbox[remoteWorkShopValidatorConfig[name]]
        && remoteWorkShopValidatorToolbox[remoteWorkShopValidatorConfig[name]](flag,name,id,factory_id);
    });

    $('body').on('focus','#addWorkCenter_from .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addWorkCenter_from .el-input:not([readonly])',function(){
        var flag=$('#addWorkCenter_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addWorkCenter_from #itemId').val();
        validatorWorkCenterConfig[name]
        && validatorWorkCenterToolBox[validatorWorkCenterConfig[name]]
        && validatorWorkCenterToolBox[validatorWorkCenterConfig[name]](name)
        && remoteWorkCenterValidatorConfig[name]
        && remoteWorkCenterValidatorToolbox[remoteWorkCenterValidatorConfig[name]]
        && remoteWorkCenterValidatorToolbox[remoteWorkCenterValidatorConfig[name]](flag,name,id);
    });

    $('body').on('focus','#addWorkBench_from .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addWorkBench_from .el-input:not([readonly])',function(){
        var flag=$('#addWorkBench_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addWorkBench_from #itemId').val(),
            workCenterId=$('#workCenterId').val();
        validatorWorkBenchConfig[name]
        && validatorWorkBenchToolBox[validatorWorkBenchConfig[name]]
        && validatorWorkBenchToolBox[validatorWorkBenchConfig[name]](name)
        && remoteWorkBenchValidatorConfig[name]
        && remoteWorkBenchValidatorToolbox[remoteWorkBenchValidatorConfig[name]]
        && remoteWorkBenchValidatorToolbox[remoteWorkBenchValidatorConfig[name]](flag,name,id,workCenterId);
    });

    $('body').on('focus','#addWorkMachine_from .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addWorkMachine_from .el-input:not([readonly])',function(){
        var flag=$('#addWorkMachine_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addWorkMachine_from #itemId').val();
        validatorWorkMachineConfig[name]
        && validatorWorkMachineToolBox[validatorWorkMachineConfig[name]]
        && validatorWorkMachineToolBox[validatorWorkMachineConfig[name]](name)
        && remoteWorkMachineValidatorConfig[name]
        && remoteWorkMachineValidatorToolbox[remoteWorkMachineValidatorConfig[name]]
        && remoteWorkMachineValidatorToolbox[remoteWorkMachineValidatorConfig[name]](flag,name,id);
    });

    //下拉框的相关事件
    $('body').on('focus','.el-select .el-input',function () {

        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-select .el-input',function () {
        var name=$(this).siblings('input').attr("id");

        var obj = $(this);

        setTimeout(function(){

            if(obj.siblings('input').val() == '') {

                validatorFactoryConfig[name]
                && validatorFactoryToolBox[validatorFactoryConfig[name]]
                && validatorFactoryToolBox[validatorFactoryConfig[name]](name);

            }else{

                $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);

    });
    $('body').on('click','#addWorkBench .add',function () {
        seleNum++
        var tr = `<tr data-bench="">
                        <td>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" class="el-input device_code" id="device_code${seleNum}" placeholder="请输入设备编号" value="">
                            </div>
                        </td>
                        <td>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" class="el-input device_name" id="device_name${seleNum}" placeholder="请输入设备名称" value="">
                            </div>
                        </td>
                        <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="device_spec center"></div></td>
                        <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="devtype_name center"></div></td>
                        <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="remark center"></div></td>
                        <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="status_name center"></div></td>
                        <td class="right">
                            <i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                            <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i>
                        </td>
                    </tr>`;
        $(this).parent().parent().parent().append(tr);


        $('#device_code'+seleNum).autocomplete({
            url: URLS['workBench'].deviceselect+"?"+_token,
            param:'device_code',
            showCode:'device_code'
        });
        $('#device_name'+seleNum).autocomplete({
            url: URLS['workBench'].deviceselect+"?"+_token,
            param:'device_name',
            showCode:'device_name'
        });

    });

    $('body').on('click','.device_name,.device_code',function (e) {
        e.stopPropagation();
        var scrollTop = $(document).scrollTop();
        var that = $(this);
        var width=$(this).width();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width+10).css({top: offset.top-60-scrollTop,left: offset.left-256})
    });
    $('body').on('click','#addWorkBench .delete',function () {
        $(this).parents().parents().eq(0).remove();
    });

    $('body').on('click','.workBenchTable .el-select-dropdown-item',function(e){
        e.stopPropagation();
        var $itemPo=$(this).parent().parent().prev();
        var po_number=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').name==$itemPo.val().trim()?$itemPo.data('inputItem').id:'';
        $(this).parent().parent().parent().parent().parent().find('.device_spec').text(tansferNull($itemPo.data('inputItem').device_spec));
        $(this).parent().parent().parent().parent().parent().find('.devtype_name').text(tansferNull($itemPo.data('inputItem').devtype_name));
        $(this).parent().parent().parent().parent().parent().find('.remark').text(tansferNull($itemPo.data('inputItem').remark));
        $(this).parent().parent().parent().parent().parent().find('.status_name').text(tansferNull($itemPo.data('inputItem').status_name));
        $(this).parent().parent().parent().parent().parent().find('.device_code').val($itemPo.data('inputItem').device_code).data('inputItem',$itemPo.data('inputItem')).blur()
        $(this).parent().parent().parent().parent().parent().find('.device_name').val($itemPo.data('inputItem').device_name).data('inputItem',$itemPo.data('inputItem')).blur()
        $(this).parent().parent().parent().parent().parent().eq(0).attr('data-id',$itemPo.data('inputItem').id)
    });
}

//查看工厂
function viewFactory(id,flag){
    AjaxClient.get({
        url: URLS['factory'].show+"?factory_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showFactoryModal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//编辑工厂
function editFactory(data){
    AjaxClient.post({
        url: URLS['factory'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'company');
            if($('.company_tree .tree-folder-name .company-tree-item.company').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.company').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addFactory_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showFactoryInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//删除工厂
function deleteFactory(id){
    AjaxClient.get({
        url: URLS['factory'].delete+"?factory_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSourceDetail(operationId.id,'company');
            if($('.company_tree .tree-folder-name .company-tree-item.company').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.company').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
//添加工厂
function addFactory(data) {
    AjaxClient.post({
        url: URLS['factory'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'company');
            if($('.company_tree .tree-folder-name .company-tree-item.company').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.company').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.addFactory .submit').removeClass('is-disabled');
        }
    },this)
}

//查看车间
function viewWorkShop(id,flag){
    AjaxClient.get({
        url: URLS['workShop'].show+"?workshop_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showWorkShopModal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//编辑车间
function editWorkShop(data){
    AjaxClient.post({
        url: URLS['workShop'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'factory');
            if($('.company_tree .tree-folder-name .company-tree-item.factory').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.factory').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addWorkShop_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//删除车间
function deleteWorkShop(id){
    AjaxClient.get({
        url: URLS['workShop'].delete+"?workshop_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSourceDetail(operationId.id,'factory');
            if($('.company_tree .tree-folder-name .company-tree-item.factory').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.factory').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
//添加车间
function addWorkShop(data) {
    AjaxClient.post({
        url: URLS['workShop'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'factory');
            if($('.company_tree .tree-folder-name .company-tree-item.factory').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.factory').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.addWorkShop .submit').removeClass('is-disabled');
        }
    },this)

}

//查看工作中心
function viewWorkCenter(id,flag){
    AjaxClient.get({
        url: URLS['workCenter'].show+"?workcenter_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showWorkCenterModal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//编辑工作中心
function editWorkCenter(data){
    AjaxClient.post({
        url: URLS['workCenter'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workShop');

            if($('.company_tree .tree-folder-name .company-tree-item.workShop').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workShop').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addWorkCenter_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//删除工作中心
function deleteWorkCenter(id){
    AjaxClient.get({
        url: URLS['workCenter'].delete+"?workcenter_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSourceDetail(operationId.id,'workShop');

            if($('.company_tree .tree-folder-name .company-tree-item.workShop').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workShop').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
//添加工作中心
function addWorkCenter(data) {
    AjaxClient.post({
        url: URLS['workCenter'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workShop');

            if($('.company_tree .tree-folder-name .company-tree-item.workShop').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workShop').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.addWorkCenter .submit').removeClass('is-disabled');
        }
    },this)

}

//查看工作台
function viewWorkBench(id,flag){
    AjaxClient.get({
        url: URLS['workBench'].show+"?workbench_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showWorkBenchModal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//编辑工作台
function editWorkBench(data){
    AjaxClient.post({
        url: URLS['workBench'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workCenter');
            if($('.company_tree .tree-folder-name .company-tree-item.workCenter').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workCenter').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addWorkBench_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//删除工作台
function deleteWorkBench(id){
    AjaxClient.get({
        url: URLS['workBench'].delete+"?workbench_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSourceDetail(operationId.id,'workCenter');
            if($('.company_tree .tree-folder-name .company-tree-item.workCenter').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workCenter').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
//添加工作台
function addWorkBench(data) {
    AjaxClient.post({
        url: URLS['workBench'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workCenter');
            if($('.company_tree .tree-folder-name .company-tree-item.workCenter').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workCenter').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.addWorkBench .submit').removeClass('is-disabled');
        }
    },this)

}

//查看工位机
function viewWorkMachine(id,flag){

    AjaxClient.get({
        url: URLS['workMachine'].show+"?workmachine_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showWorkMachineModal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//编辑工位机
function editWorkMachine(data){
    AjaxClient.post({
        url: URLS['workMachine'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workBench');
            if($('.company_tree .tree-folder-name .company-tree-item.workBench').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workBench').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addWorkMachine_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            console.log(rsp.field);
            console.log(rsp.message);
            if(rsp.field!==undefined){
                showWorkBenchInvalidMessage2(rsp.field,'排版号由1-20位字母下划线数字组成,字母开头');
            }
        }
    },this);
}
//删除工位机
function deleteWorkMachine(id){
    AjaxClient.get({
        url: URLS['workMachine'].delete+"?workmachine_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSourceDetail(operationId.id,'workBench');
            if($('.company_tree .tree-folder-name .company-tree-item.workBench').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workBench').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
//添加工位机
function addWorkMachine(data) {
    AjaxClient.post({
        url: URLS['workMachine'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workBench');
            if($('.company_tree .tree-folder-name .company-tree-item.workBench').hasClass('selected')){
                $('.company_tree .tree-folder-name .company-tree-item.workBench').parents('.flex-item').find('.expand-icon').click()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.addWorkMachine .submit').removeClass('is-disabled');
        }
    },this)

}

//查看班次
function viewRankPlan(id,flag){
    AjaxClient.get({
        url: URLS['rankPlan'].show+"?rankplan_id="+id+"&"+_token,
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
    AjaxClient.post({
        url: URLS['rankPlan'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workShop');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addRankPlan_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//删除班次
function deleteRankPlan(id){
    AjaxClient.get({
        url: URLS['rankPlan'].delete+"?rankplan_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSourceDetail(operationId.id,'workShop');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
//添加班次
function addRankPlan(data) {
    AjaxClient.post({
        url: URLS['rankPlan'].add,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workShop');
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

//获取国家列表
function getCountryData(){
    AjaxClient.get({
        url: URLS['factory'].country+'?'+_token,
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
                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.countryele').find('.el-select-dropdown-list').html(innerHtml);
            }

            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },200);

        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取国家列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//工厂
function showFactoryModal(flag,ids,data) {
    var labelWidth=100, readonly= '',btnShow='btnShow',title= '查看工厂',noEdit='',
    {factory_id='',code='',factory_name='',address='',phone='',mobile='',fax='',email='',country_id='',country_name=''}={};

    if(data){
        ({factory_id='',code='',factory_name='',address='',phone='',mobile='',fax='',email='',country_id='',country_name=''}=data);
    }
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑工厂',noEdit='readonly="readonly"'):title='添加工厂');
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content:`<form class="addFactory formModal" id="addFactory_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工厂编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" maxlength="20" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工厂名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" maxlength="20" ${readonly} class="el-input" placeholder="请输入工厂名称" value="${factory_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item countryele">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">国家<span class="mustItem">*</span></label>
                             ${flag != 'add'? `<input type="text" id="country_id" readonly class="el-input" value="${country_name}">`:
                              `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="country_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list country">
                                       
                                    </ul>
                                </div>
                            </div>`}
                           
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">电话</label>
                            <input type="text" id="phone" ${readonly} class="el-input" placeholder="区号+号码" value="${phone}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">地址</label>
                            <input type="text" id="address" ${readonly} class="el-input" placeholder="请输入工厂地址" value="${address}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">手机</label>
                            <input type="text" id="mobile" ${readonly} class="el-input" placeholder="请输入工厂手机" value="${mobile}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">传真</label>
                            <input type="text" id="fax" ${readonly} class="el-input" placeholder="请输入工厂传真" value="${fax}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱</label>
                            <input type="text" id="email" ${readonly} class="el-input" placeholder="请输入工厂邮箱" value="${email}">
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
            getCountryData();
        }
    })
}
//车间
function showWorkShopModal(flag,ids,data) {

    var labelWidth=100, readonly= '',btnShow='btnShow',title= '查看车间',noEdit='',
        {workshop_id='',code='',workshop_name='',address='',desc=''}={};

    if(data){
        ({workshop_id='',code='',workshop_name='',address='',desc=''}=data);
    }

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑车间',noEdit='readonly="readonly"'):title='添加车间');

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content:`<form class="addWorkShop formModal" id="addWorkShop_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">车间编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" maxlength="20" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">车间名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} maxlength="20" class="el-input" placeholder="请输入车间名称" value="${workshop_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">车间位置</label>
                            <input type="text" id="address" ${readonly} class="el-input" placeholder="请输入车间位置" value="${address}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" maxlength="500" ${readonly} id="desc" rows="5" class="el-textarea" placeholder="${flag=='view'?'':'请输入注释，最多只能输入500字'}">${desc}</textarea>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
</form>`
    })
}
//工作中心
function showWorkCenterModal(flag,ids,data) {

    var labelWidth=135, readonly= '',btnShow='btnShow',title= '查看工作中心',noEdit='',
        {workcenter_id='',code='',workcenter_name='',desc=''}={};
    if(data){
        ({workcenter_id='',code='',workcenter_name='',desc=''}=data);
    }
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑工作中心',noEdit='readonly="readonly"'):title='添加工作中心');

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content:`<form class="addWorkCenter formModal" id="addWorkCenter_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工作中心编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" maxlength="20" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工作中心名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} class="el-input" placeholder="请输入车间名称" value="${workcenter_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div> 
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" maxlength="500" ${readonly} id="desc" rows="5" class="el-textarea" placeholder="${flag=='view'?'':'请输入注释，最多只能输入500字'}">${desc}</textarea>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
</form>`
    })
}
//工作台
function showWorkBenchModal(flag,ids,data) {
    seleNum = 11;

    var labelWidth=135, readonly= '',btnShow='btnShow',title= '查看工作台',noEdit='',tableHeight='500px',
        {workbench_id='',code='',workbench_name='',desc='',status=1,items=[]}={};
    if(data){
        ({workbench_id='',code='',workbench_name='',desc='',status=1,items=[]}=data);
    }
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑工作台',noEdit='readonly="readonly"'):title='添加工作台');

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: ['1400px','600px'],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content:`<form class="addWorkBench formModal" id="addWorkBench_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="workBench_wrap">
                        <div class="workBench_left">
                            <div class="el-form-item" >
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">工作台编码<span class="mustItem">*</span></label>
                                    <input type="text" id="code" maxlength="20" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">工作台名称<span class="mustItem">*</span></label>
                                    <input type="text" id="name" ${readonly} class="el-input" placeholder="请输入工作台名称" value="${workbench_name}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                           <div class="el-form-item ${flag == 'view' ? '': 'status'}">
                               <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 106px;">状态</label>
                                <div class="el-radio-group">
                                   <label class="el-radio">
                                        <span class="el-radio-input ${status == 1 ? 'is-radio-checked' : ''}">
                                            <span class="el-radio-inner"></span>
                                            <input class="status_bench" type="hidden" value="1">
                                        </span>
                                        <span class="el-radio-label">启用</span>
                                    </label>
                                    <label class="el-radio">
                                        <span class="el-radio-input ${status == 0 ? 'is-radio-checked' : ''}">
                                            <span class="el-radio-inner"></span>
                                            <input class="status_bench" type="hidden" value="0">
                                        </span>
                                        <span class="el-radio-label">禁用</span>
                                    </label>
                                 </div>  
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                                    <textarea type="textarea" maxlength="500" ${readonly} id="desc" rows="5" class="el-textarea" placeholder="${flag=='view'?'':'请输入注释，最多只能输入500字'}">${desc}</textarea>
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                            </div>
                        </div>
                        <div class="workBench_btn">
                            <span></span>
                        </div>
                        <div class="workBench_right" id="addWorkBench">
                        
                           
                            <div class="table_page">
                                <div id="pagenation" class="pagenation workBench"></div>
                                <div class="table-wrap" id="table_wrap_bench" style="max-height: ${tableHeight};overflow-y: auto;">
                                    <table class="sticky uniquetable commontable workBenchTable">
                                      <thead>
                                        <tr>
                                          <th class="center">设备编号</th>
                                          <th class="center">设备名称</th>
                                          <th class="center">规格型号</th>
                                          <th class="center">设备类别</th>
                                          <th class="center">设备描述</th>
                                          <th class="center">使用状况</th>
                                          <th class="right">操作</th>
                                        </tr>
                                      </thead>
                                      <tbody class="table_tbody">
                                        <tr data-bench="">
                                            <td>
                                                <div class="el-select-dropdown-wrap">
                                                    <input type="text" class="el-input device_code" id="device_code11" placeholder="请输入设备编号" value="">
                                                </div>
                                            </td>
                                            <td>
                                                <div class="el-select-dropdown-wrap">
                                                    <input type="text" class="el-input device_name" id="device_name11" placeholder="请输入设备名称" value="">
                                                </div>
                                            </td>
                                            <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="device_spec center"></div></td>
                                            <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="devtype_name center"></div></td>
                                            <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="remark center"></div></td>
                                            <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="status_name center"></div></td>
                                            <td class="right">
                                                <i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                                                <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i>
                                            </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                </div>
                            </div>
                        
                        </div>
                    </div>
                    
                    
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
        </form>`,
        success: function(layero, index){
            getLayerSelectPosition($(layero));
            layerOffset = $(layero).offset();

            if(flag=='add'){
                $('#device_code11').autocomplete({
                    url: URLS['workBench'].deviceselect+"?"+_token,
                    param:'device_code',
                    showCode:'device_code'
                });
                $('#device_name11').autocomplete({
                    url: URLS['workBench'].deviceselect+"?"+_token,
                    param:'device_name',
                    showCode:'device_name'
                });

            }else {
                if(items.length>0){
                    creatHtml($('#addWorkBench .table_tbody'),items)

                }else {
                    $('#device_code11').autocomplete({
                        url: URLS['workBench'].deviceselect+"?"+_token,
                        param:'device_code',
                        showCode:'device_code'
                    });
                    $('#device_name11').autocomplete({
                        url: URLS['workBench'].deviceselect+"?"+_token,
                        param:'device_name',
                        showCode:'device_name'
                    });


                }
            }

         },
    })
}
function creatHtml(ele,data) {
    ele.html('');
    data.forEach(function (item) {
        seleNum++;
        var tr = `<tr data-id="${item.device_id}" data-bench="${item.id}">
                    <td>
                        <div class="el-select-dropdown-wrap">
                            <input type="text" class="el-input device_code" id="device_code${seleNum}" placeholder="请输入设备编号" value="${item.device_code}">
                        </div>
                    </td>
                    <td>
                        <div class="el-select-dropdown-wrap">
                            <input type="text" class="el-input device_name" id="device_name${seleNum}" placeholder="请输入设备名称" value="${item.device_name}">
                        </div>
                    </td>
                    <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="device_spec center">${tansferNull(item.device_spec)}</div></td>
                    <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="devtype_name center">${tansferNull(item.devtype_name)}</div></td>
                    <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="remark center">${tansferNull(item.remark)}</div></td>
                    <td><div style="width:100px;word-wrap: break-word;" nowrap="nowrap" class="status_name center">${tansferNull(item.status_name)}</div></td>
                    <td class="right">
                        <i class="fa fa-plus-square oper_icon add" title="添加" data-id=""></i>
                        <i class="fa fa-minus-square oper_icon delete" title="删除" data-id="" style="margin-right: 10px;color: #20a0ff"></i>
                    </td>
                </tr>`;
        ele.append(tr);

        $('#device_code'+seleNum).autocomplete({
            url: URLS['workBench'].deviceselect+"?"+_token,
            param:'device_code',
            showCode:'device_code'
        });
        $('#device_name'+seleNum).autocomplete({
            url: URLS['workBench'].deviceselect+"?"+_token,
            param:'device_name',
            showCode:'device_name'
        });


    })

}



//工位机
function showWorkMachineModal(flag,ids,data) {
    var labelWidth=135, readonly= '',btnShow='btnShow',title= '查看工位机',noEdit='',
    {workmachine_id='',code='',workmachine_name='',compose_type_no='',status=0,ip_address='',online_status=0}={};

    if(data){
        ({workmachine_id='',code='',workmachine_name='',compose_type_no='',status=0,ip_address='',online_status=0}=data);
    }
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑工位机',noEdit='readonly="readonly"'):title='添加工位机');


    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content:`<form class="addWorkMachine formModal" id="addWorkMachine_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工位机编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" maxlength="20" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工位机名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} class="el-input" placeholder="请输入工位机名称" value="${workmachine_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">排版号<span class="mustItem">*</span></label>
                            <input type="text" id="compose_type_no" maxlength="20" ${readonly} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${compose_type_no}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">ip地址<span class="mustItem">*</span></label>
                            <input type="text" id="ip_address" ${readonly} class="el-input" placeholder="请输入ip地址" value="${ip_address}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item online_statusele ${flag == 'view' ? '': 'radioCheck'}">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 108px;">是否在线</label>
                            <div class="el-radio-group">
                                <label class="el-radio">
                                    <span class="el-radio-input ${online_status==1? 'is-radio-checked' :''}">
                                        <span class="el-radio-inner"></span>
                                        <input class="online_status yes" type="hidden" value="1">
                                    </span>
                                    <span class="el-radio-label">在线</span>
                                </label>
                                <label class="el-radio">
                                    <span class="el-radio-input ${online_status==0? 'is-radio-checked' :''}">
                                        <span class="el-radio-inner"></span>
                                        <input class="online_status no" type="hidden" value="0">
                                    </span>
                                    <span class="el-radio-label">离线</span>
                                </label>
							</div>
                        </div>
                    </div>
                    <div class="el-form-item statusele ${flag == 'view' ? '': 'radioCheck'}">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 108px;">是否在使用</label>
                            <div class="el-radio-group">
                                <label class="el-radio">
                                    <span class="el-radio-input ${status == 1 ? 'is-radio-checked' : ''}">
                                        <span class="el-radio-inner"></span>
                                        <input class="using yes" type="hidden" value="1">
                                    </span>
                                    <span class="el-radio-label">是</span>
                                </label>
                                <label class="el-radio">
                                    <span class="el-radio-input ${status == 0 ? 'is-radio-checked':''}">
                                        <span class="el-radio-inner"></span>
                                        <input class="using no" type="hidden" value="0">
                                    </span>
                                    <span class="el-radio-label">否</span>
                                </label>
							</div>
                        </div>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
</form>`
    })
}
//班次
function showWorkClassModal(flag,ids,data) {
    var labelWidth=135, readonly= '',btnShow='btnShow',title= '查看班次',noEdit='',
    {rankplan_id='',name='',workcenter_name='',workcenter_id='',from='',to=''}={};

    if(data){
        ({rankplan_id='',name='',workcenter_name='',workcenter_id='',from='',to=''}=data);
    }
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑班次',noEdit='readonly="readonly"'):title='添加班次');
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content:`<form class="addRankPlan formModal" id="addRankPlan_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">班次名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} class="el-input" placeholder="请输入班次名称" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">开始时间<span class="mustItem">*</span></label>
                            <input type="text" id="from" ${readonly} class="el-input date" placeholder="请选择开始时间" value="${from}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">结束时间<span class="mustItem">*</span></label>
                            <input type="text" id="to" ${readonly} class="el-input date" placeholder="请选择开始时间" value="${to}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item restTimeWrap" id="restTimeWrap">
                            
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
            $('#restTimeWrap').html(createRestHtml(data,flag));
            var ele = ['#from','#to'];
            if(flag == 'edit'){
                if(data&&data!==null&&data!=="null"){
                    var jsonData=JSON.parse(data.rest_time);
                    if(jsonData&&jsonData.length){
                        $.each(jsonData,function(k,v){
                            ele.push('#rest_from'+(k+1));
                            ele.push('#rest_to'+(k+1));
                        })
                    }
                }
            }

            renderLayDate(ele,flag);
        }
    })
}
function createRestHtml(data,flag){
    var sehtml='',addBtn='';
    if(data&&data!==null&&data!=="null"){
        var jsonData=JSON.parse(data.rest_time);
        if(jsonData&&jsonData.length){
            $.each(jsonData,function(k,v){
                sehtml+=createRestOptionHtml(k+1,v,flag);
            })
        }
    }
    if(flag!='view'){
        addBtn=`<div class="el-form-item">
            <div class="el-form-item-div" id="dataType_item_add">
                <label class="el-form-item-label" style="width: 107px;">休息时间<span class="mustItem">*</span></label>
                <button type="button" class="el-button rest-item-add">添加项</button>
            </div>
        </div>`;
    }else{
        addBtn = `<div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 107px;">休息时间<span class="mustItem">*</span></label>
            </div>`
    }
    var selectHtml=`${addBtn}
    <div class="item-wrap" style="margin-left: 100px"> 
        <div class="item-select-wrap">
            ${sehtml}
        </div>
        <p class="errorMessage" style="padding-left: 84px;"></p>
    </div>`;
    return selectHtml;
}
function createRestOptionHtml(index,item,flag){
    var displaySty='',readonly='';
    flag == 'view' ? (displaySty='none',readonly='readonly'):'';

    var itemDelete=`<div calss="el-item-wrap">
                    <i class="fa fa-minus-circle rest-item-delete ${displaySty}"></i> 
            </div>`;
    var itemHtml=`<div class="el-form-item select-item">
        <div class="el-form-item-div">
            <div class="el-item-wrap validator" style="margin-left: 5px;">
                 <input type="text" style="width: 30%" name="rest_from" id="rest_from${index}" ${readonly}  class="el-input date" placeholder="开始时间" value="${item?item.rest_from:''}"> -
                 <input type="text" style="width: 30%" name="rest_to" id="rest_to${index}" ${readonly}  class="el-input date" placeholder="结束时间" value="${item?item.rest_to:''}">
                 <input type="text" style="width: 30%" name="comment" ${readonly} class="el-input" placeholder="请输入注释" value="${item?item.comment:''}">
            </div>
            ${itemDelete}
        </div>        
    </div>`;

    return itemHtml;
}
function renderLayDate(ele,flag){
    if(flag == 'view'){
       return false;
    }
    ele.forEach(function(item){
        laydate.render({
            elem: item,
            type: 'time',
            change:function (value) {
                // console.log(value)
            }
        });
    })
}

function showRelationPeople(id,name) {
    var readonly = 'readonly',labelWidth=100,btnShow='btnShow';

    layerModal = layer.open({
        type: 1,
        title: '关联人员',
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content:`<form class="addRelationPeople formModal" id="addRelationPeople_from">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">班次名称</label>
                            <input type="text" id="workclassName" ${readonly} data-name="班次名称" data-id="${id}" class="el-input" placeholder="" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item peopleRelSelect">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">关联人员<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <div class="selectValue"></div>
                                    <input type="hidden" class="val_id" id="nextProcedure" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit">确定</button>
                        </div>
                    </div>
        </form>`,
        success:function (layero,index) {
            getLayerSelectPosition($(layero));
              // getEmployeeSelect();
            // getRelationPeopleData(id);
        }
    })
}

function getTreeList(id,_this) {
    if(_this.hasClass('company')){
        AjaxClient.get({
            url: URLS['source'].factory+'?'+_token+"&company_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').show();
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').html(treeList(rsp.results,'factory'))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }else if(_this.hasClass('factory')){
        AjaxClient.get({
            url: URLS['source'].workShop+'?'+_token+"&factory_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                if(rsp&&rsp.results){
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').show();
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').html(treeList(rsp.results,'workShop'))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }else if(_this.hasClass('workShop')){
        AjaxClient.get({
            url: URLS['source'].workCenter+'?'+_token+"&workshop_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').show();
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').html(treeList(rsp.results,'workCenter'))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)

    }else if(_this.hasClass('workCenter')){
        AjaxClient.get({
            url: URLS['source'].workBench+'?'+_token+"&workcenter_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                if(rsp&&rsp.results){
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').show();
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').html(treeList(rsp.results,'workBench'))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }else if(_this.hasClass('workBench')){
        AjaxClient.get({
            url: URLS['source'].workMachine+'?'+_token+"&workbench_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').show();
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').html(treeList(rsp.results,'workMachine'))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }
}

function treeList(data,flag) {
    var treeHtml="";
    if(data.length){

        if(flag == 'workMachine'){
            data.forEach(function (item) {
                treeHtml+=`<div class="tree-folder ${flag}" data-id="${item.id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="item-dot expand-icon ${flag}" data-id="${item.id}"></i>
                   <div class="tree-folder-name"><p class="item-name company-tree-item ${flag}" data-id="${item.id}" data-flag="${flag}" data-name="${item.name}">${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                   
                   </div>
                </div>`
            })
        }else{
            data.forEach(function (item) {
                treeHtml+=`<div class="tree-folder ${flag}" data-id="${item.id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-plus expand-icon ${flag}" data-id="${item.id}"></i>
                   <div class="tree-folder-name"><p class="item-name company-tree-item ${flag}" data-id="${item.id}" data-flag="${flag}">${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                   
                   </div>
                </div>`
            })
        }
    }
    return treeHtml;
}

function getSourceDetail(id,flag) {
    if(flag == 'company'){
        AjaxClient.get({
            url: URLS['list'].factoryList+'?'+_token+"&page_no="+pageNo+"&page_size="+pageSize+"&company_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                var totalData = rsp.paging.total_records;
                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showFactoryTable(rsp.results))
                }
                if(totalData>pageSize){
                    bindPagenationClick(totalData,pageSize,id,'company');
                }else{
                    $('#pagenation').html('');
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
        AjaxClient.get({
            url: URLS['company'].show + '?' + _token+'&company_id='+id,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                if (rsp && rsp.results) {
                    $('.basic_form').html(showCompanyInfo(rsp.results));
                }
            },
            fail: function (rsp) {
                layer.close(layerLoading);
            }
        })
    } else if(flag == 'factory'){
        factory_id=id;
        AjaxClient.get({
            url: URLS['show'].factoryShow+'?'+_token+"&factory_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    $('.basic_form').html(showFactoryInfo(rsp.results))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this);
        AjaxClient.get({
            url: URLS['list'].workShopList+'?'+_token+"&page_no="+pageNo+"&page_size="+pageSize+"&factory_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                var totalData = rsp.paging.total_records;
                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkShopTable(rsp.results))
                }
                if(totalData>pageSize){
                    bindPagenationClick(totalData,pageSize,id,'factory');
                }else{
                    $('#pagenation').html('');
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }else if(flag=='workShop'){
        AjaxClient.get({
            url: URLS['show'].workshopShow+'?'+_token+"&workshop_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    $('.basic_form').html(showWorkShopInfo(rsp.results))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
        AjaxClient.get({
            url: URLS['list'].workCenterList+'?'+_token+"&page_no="+pageNo+"&page_size="+pageSize+"&workshop_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                var totalData = rsp.paging.total_records;
                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkCenterTable(rsp.results))
                }
                if(totalData>pageSize){
                    bindPagenationClick(totalData,pageSize,id,'workShop');
                }else{
                    $('#pagenation').html('');
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }else if(flag=='workCenter'){
        AjaxClient.get({
            url: URLS['show'].workcenterShow+'?'+_token+"&workcenter_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    getWorkcenterJobType(rsp.results,id);


                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this);
        AjaxClient.get({
            url: URLS['list'].workBenchList+'?'+_token+"&page_no="+pageNo+"&page_size="+pageSize+"&workcenter_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                var totalData = rsp.paging.total_records;
                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkBenchTable(rsp.results),id)
                }
                if(totalData>pageSize){
                    bindPagenationClick(totalData,pageSize,id,'workCenter');
                }else{
                    $('#pagenation').html('');
                }

            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }else if(flag=='workBench'){
        AjaxClient.get({
            url: URLS['show'].workbenchShow+'?'+_token+"&workbench_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    $('.basic_form').html(showWorkBenchInfo(rsp.results))
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);

            }
        },this)
        AjaxClient.get({
            url: URLS['list'].workMachineList+'?'+_token+"&page_no="+pageNo+"&page_size="+pageSize+"&workbench_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                var totalData = rsp.paging.total_records;
                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkMachineTable(rsp.results))
                }
                if(totalData>pageSize){
                    bindPagenationClick(totalData,pageSize,id,'workBench');
                }else{
                    $('#pagenation').html('');
                }
            },
            fail:function (rsp) {
                layer.close(layerLoading);

            }
        },this)
    }else if(flag=='workMachine'){
        $('.basicChildInfo').html('');
        AjaxClient.get({
            url: URLS['show'].workmachineShow+'?'+_token+"&workmachine_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    $('.basic_form').html(showWorkMachineInfo(rsp.results));
                }

            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
    }
}


function getWorkcenterJobType(data,id) {
    AjaxClient.get({
        url: URLS['workCenter'].workcenter+"?"+_token+"&workcenter_id="+id,
        dataType: 'json',
        success:function (rsp) {
            $('.basic_form').html(showWorkCenterInfo(data,rsp.results,id))
        },
        fail: function(rsp){
            console.log('获取车间列表失败');
        }
    });
}

function bindPagenationClick(total,size,id,flag){
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
            getSourceDetail(id,flag);
        }
    });
}

function showCompanyInfo(data) {
    var _html ="";

    _html=`<div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">公司编码</label>
                           <span class="el-input-span">${data.code}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">地址</label>
                           <span class="el-input-span">${data.address}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">传真</label>
                           <span class="el-input-span">${data.fax}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">缩写</label>
                           <span class="el-input-span">${data.abbreviation}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">公司名称</label>
                           <span class="el-input-span">${data.company_name}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">国家</label>
                           <span class="el-input-span">${data.country_name}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">邮箱</label>
                           <span class="el-input-span">${data.email}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">电话</label>
                           <span class="el-input-span">${data.phone}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">网站</label>
                           <span class="el-input-span">${data.web}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">税号</label>
                           <span class="el-input-span">${data.tax_no}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">法人</label>
                           <span class="el-input-span">${data.register}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">描述</label>
                           <span class="el-input-span">${data.desc}</span>
                       </div>
                   </div>
               </div>
               `;

    return _html
}

function showFactoryTable(data) {
    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${item.code}</td>
                           <td>${item.factory_name}</td>
                           <td>${item.phone}</td> 
                           <td>${item.mobile}</td>
                           <td>${item.fax}</td>
                           <td>${item.email}</td>
                           <td>${item.ctime}</td>
                           <td class="right nowrap">
                                <button data-id="${item.factory_id}" class="button pop-button view">查看</button>
                                <button data-id="${item.factory_id}" class="button pop-button edit">编辑</button>
                                <button data-id="${item.factory_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return `<h3>工厂</h3><div class="operation_wrap"><button class="button button-define factory_add">添加工厂</button></div><div class="table-container">
                <table class="info_table factory">
                        <thead>
                           <tr>
                               <th class="thead">编码</th>
                               <th class="thead">名称</th>
                               <th class="thead">电话</th>
                               <th class="thead">手机</th>
                               <th class="thead">传真</th>
                               <th class="thead">邮箱</th>
                               <th class="thead">创建时间</th>
                               <th class="thead"></th>
                           </tr>
                        </thead>
                        <tbody class="t-body">
                          ${_html}
                        </tbody>
                 </table>
            </div>`;
}

function showFactoryInfo(data) {
   var _html ="";

       _html=`<div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工厂编码</label>
                           <span class="el-input-span">${data.code}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">公司名称</label>
                           <span class="el-input-span">${data.company_name}</span>
                       </div>
                       <p class="errorMessage" style="padding-left: 30px;"></p>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工厂名称</label>
                           <span class="el-input-span">${data.factory_name}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">国家</label>
                           <span class="el-input-span">${data.country_name}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">电话</label>
                           <span class="el-input-span">${data.phone}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">手机</label>
                           <span class="el-input-span">${data.mobile}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">传真</label>
                           <span class="el-input-span">${data.fax}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">邮箱</label>
                           <span class="el-input-span">${data.email}</span>
                       </div>
                   </div>
               </div>`;

    return _html

}
function showWorkShopTable(data) {
    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${item.code}</td>
                           <td>${item.workshop_name}</td>
                           <td>${item.address}</td>
                           <td>${item.ctime}</td>
                           <td class="right nowrap">
                                <button data-id="${item.workshop_id}" class="button pop-button view">查看</button>
                                <button data-id="${item.workshop_id}" class="button pop-button edit">编辑</button>
                                <button data-id="${item.workshop_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return `<h3>车间</h3><div class="operation_wrap"><button class="button button-define workshop_add">添加车间</button></div><div class="table-container">
                <table class="info_table workshop">
                        <thead>
                           <tr>
                               <th class="thead">编码</th>
                               <th class="thead">名称</th>
                               <th class="thead">位置</th>
                               <th class="thead">创建时间</th>
                               <th class="thead"></th>
                           </tr>
                        </thead>
                        <tbody class="t-body">
                          ${_html}
                        </tbody>
                 </table>
            </div>`;
}

function showWorkShopInfo(data) {
    var _html ="";

    _html=`<div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">车间编码</label>
                           <span class="el-input-span">${data.code}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">车间位置</label>
                           <span class="el-input-span">${data.address}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">车间名称</label>
                           <span class="el-input-span">${data.workshop_name}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">公司名称</label>
                           <span class="el-input-span">${data.company_name}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工厂名称</label>
                           <span class="el-input-span">${data.factory_name}</span>
                       </div>
                   </div> 
               </div>`;

    return _html
}
function showWorkCenterTable(data) {
    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${item.code}</td>
                           <td>${item.workcenter_name}</td>
                           <td>${item.ctime}</td>
                           <td class="right nowrap"> 
                            <!--<button data-id="${item.workcenter_id}" class="button pop-button procedure">关联工序</button>-->
                            <button data-id="${item.workcenter_id}" class="button pop-button view">查看</button>
                            <button data-id="${item.workcenter_id}" class="button pop-button edit">编辑</button>
                            <button data-id="${item.workcenter_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return `
<h3>工作中心</h3><div class="operation_wrap">
                <button class="button button-define workcenter_add">添加工作中心</button>
            </div><div class="table-container workcenter">
            <table class="info_table workcenter">
                    <thead>
                       <tr>
                           <th class="thead">编码</th>
                           <th class="thead">名称</th>
                           <th class="thead">创建时间</th>
                           <th class="thead"></th>
                       </tr>
                    </thead>
                    <tbody class="t-body">
                      ${_html}
                    </tbody>
             </table></div>`;
}

function showWorkCenterInfo(data,workCenterType,id) {
    var workCenterHtml='';

    workCenterType.forEach(function (item) {
        workCenterHtml += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}（${item.code}）</span>`;
    })

    var _html ="";
    _html=`<div>
            <input type="hidden" id="workCenterId" value="${id}">
               <div class="el-form-item">
                   <div class="el-form-item-div">
                       <label class="el-form-item-label">工作中心编码</label>
                       <span class="el-input-span">${data.code}</span>
                   </div>
               </div>
               <div class="el-form-item">
                   <div class="el-form-item-div">
                       <label class="el-form-item-label">工厂名称</label>
                       <span class="el-input-span">${data.factory_name}</span>
                   </div>
               </div>
           </div>
           <div>
               <div class="el-form-item">
                   <div class="el-form-item-div">
                       <label class="el-form-item-label">工作中心名称</label>
                       <span class="el-input-span">${data.workcenter_name}</span>
                   </div>
               </div>
               <div class="el-form-item">
                   <div class="el-form-item-div">
                       <label class="el-form-item-label">公司名称</label>
                       <span class="el-input-span">${data.company_name}</span>
                   </div>
               </div>
           </div>
           <div>
               <div class="el-form-item">
                   <div class="el-form-item-div">
                       <label class="el-form-item-label">车间名称</label>
                       <span class="el-input-span">${data.workshop_name}</span>
                   </div>
               </div> 
           </div>
           <div>
                <div class="el-form-item">
                   <div class="el-form-item-div">
                       <label class="el-form-item-label">作业类型</label>
                       <div style="width: 300px;">${workCenterHtml}</div>
                   </div>
               </div> 
            
           </div>`;

    return _html
}
function showWorkBenchTable(data) {
    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${item.code}</td>
                           <td>${item.workbench_name}</td>
                           <td>${item.ctime}</td>
                           <td class="right nowrap">
                            <!--<button data-id="${item.workbench_id}" class="button pop-button ability">关联能力</button>-->
                            <button data-id="${item.workbench_id}" class="button pop-button view">查看</button>
                            <button data-id="${item.workbench_id}" class="button pop-button edit">编辑</button>
                            <button data-id="${item.workbench_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return `<h3>工作台</h3><div class="operation_wrap"><button class="button button-define workbench_add">添加工作台</button></div>
            <div class="table-container"><table class="info_table workbench">
                    <thead>
                       <tr>
                           <th class="thead">编码</th>
                           <th class="thead">名称</th>
                           <th class="thead">创建时间</th>
                           <th class="thead"></th>
                       </tr>
                    </thead>
                    <tbody class="t-body">
                      ${_html}
                    </tbody>
             </table></div>`;
}

function showWorkBenchInfo(data,id) {
    var _html ="";

    _html=`<div>
<input type="hidden" id="workCenterId" value="${id}">
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工作台编码</label>
                           <span class="el-input-span">${data.code}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工厂名称</label>
                           <span class="el-input-span">${data.factory_name}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工作台名称</label>
                           <span class="el-input-span">${data.workbench_name}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工作中心名称</label>
                           <span class="el-input-span">${data.workcenter_name}</span>
                       </div>
                   </div> 
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">车间名称</label>
                           <span class="el-input-span">${data.workshop_name}</span>
                       </div>
                   </div>
                    
               </div>`;

    return _html
}
function showWorkMachineTable(data) {
    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${item.code}</td>
                           <td>${item.workmachine_name}</td>
                           <td>${item.compose_type_no}</td>
                           <td>${item.ip_address}</td>
                           <td>${item.online_status == 0 ? '离线' : '在线'}</td>
                           <td>${item.status == 0 ? '否' : '是'}</td>
                           <td>${item.ctime}</td>
                           <td class="right nowrap">
                                <button data-id="${item.workmachine_id}" class="button pop-button view">查看</button>
                                <button data-id="${item.workmachine_id}" class="button pop-button edit">编辑</button>
                                <button data-id="${item.workmachine_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return `<h3>工位机</h3><div class="operation_wrap"><button class="button button-define workmachine_add">添加工位机</button></div>
                 <div class="table-container"><table class="info_table workmachine">
                    <thead>
                       <tr>
                           <th class="thead">编码</th>
                           <th class="thead">名称</th>
                           <th class="thead">排版号</th>
                           <th class="thead">ip地址</th>
                           <th class="thead">是否在线</th>
                           <th class="thead">是否在使用</th>
                           <th class="thead">创建时间</th>
                           <th class="thead"></th>
                       </tr>
                    </thead>
                    <tbody class="t-body">
                      ${_html}
                    </tbody>
             </table>`;
}

function showWorkMachineInfo(data) {
    var _html ="";

    _html=`<div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工位机编码</label>
                           <span class="el-input-span">${data.code}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工厂名称</label>
                           <span class="el-input-span">${data.factory_name}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工位机名称</label>
                           <span class="el-input-span">${data.workmachine_name}</span>
                       </div>
                   </div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">公司名称</label>
                           <span class="el-input-span">${data.company_name}</span>
                       </div>
                   </div>
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">车间名称</label>
                           <span class="el-input-span">${data.workshop_name}</span>
                       </div>
                   </div>
                     <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工作中心名称</label>
                           <span class="el-input-span">${data.workcenter_name}</span>
                       </div>
                   </div> 
               </div>
               <div>
                   <div class="el-form-item">
                       <div class="el-form-item-div">
                           <label class="el-form-item-label">工作台名称</label>
                           <span class="el-input-span">${data.workbench_name}</span>
                       </div>
                   </div> 
               </div>`;
    return _html
}