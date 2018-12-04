var layerLoading,layerModal,layerEle,
    pageNo=1,
    pageSize=10,
    pageProcedureNo=1,
    pageProcedureSize=8,
    pageAllProcedureNo=1,
    hasSelect =0,
    centerSelect=0,
    procedureAbility=[],
    centerOperation=[],
    relationRank = [],
    abilitySource = [],
    procedureArr = [],
    procedureBZArr = [],
    procedureBZArr_JSON = [],
    operationId={},
    validatorFactoryToolBox={
        checkCode: function(name){
            var value = $('.addFactory').find('#'+name).val().trim();

            return $('.addFactory').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showFactoryInvalidMessage(name,"工厂编码不能为空"),!1):
                    !Validate.checkFactoryCode(value)?(showFactoryInvalidMessage(name,"工厂编码由1-20位字母下划线数字组成,字母开头"),!1):(!0)
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
                Validate.checkNull(value)?(showFactoryInvalidMessage(name,"请选择部门"),!1):(!0);
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
        remoteCheckName: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getWorkShopUnique(flag,name,value,id,function(rsp){
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
        remoteCheckName: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getWorkBenchUnique(flag,name,value,id,function(rsp){
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
        name: "remoteCheckName"
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
                Validate.checkNull(value)?(showWorkMachineInvalidMessage(name,"IP地址不能为空"),!1):(!0);
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
    },
    validatorWorkClassToolBox={
        checkName: function(name){
            var value = $('.addRankPlan').find('#'+name).val().trim();
            return $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkClassInvalidMessage(name,"班次名称不能为空"),!1):(!0);
        },
        checkFrom: function(name){
            var value = $('.addRankPlan').find('#'+name).val().trim();
            return $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkClassInvalidMessage(name,"开始工作时间不能为空"),!1):(!0);
        },
        checkTo: function(name){
            var value = $('.addRankPlan').find('#'+name).val().trim();
            return $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showWorkClassInvalidMessage(name,"结束工作时间不能为空"),!1):(!0);
        },
        checkRestTime:function(){
            var ele=$('#restTimeWrap').find('.validator');
            selectCorrect=1;
            if(ele.length){
                ele.each(function(index,item){
                    if(Validate.checkNull($(item).find('input[name=rest_from]').val().trim()) || Validate.checkNull($(item).find('input[name=rest_to]').val().trim())){
                        selectCorrect=!1;
                        $('#restTimeWrap').find('.errorMessage').html('时间不能为空').show();
                        return false;
                    }
                });
            }
            return selectCorrect;
        }
    },
    remoteWorkClassValidatorToolbox={
        remoteCheckName: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getWorkClassUnique(flag,name,value,id,operationId.id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showWorkClassInvalidMessage(name,val);
                }
            });
        }
    },
    validatorWorkClassConfig = {
        name:'checkName',
        from:'checkFrom',
        to:'checkTo',
        rest_time:'checkRestTime',
    },
    remoteWorkClassValidatorConfig={
        name:'remoteCheckName',
    },
    // validatorAbilityToolBox = {
    //     checkValue: function () {
    //         $('input.ability_value').each(function(k,v){
    //             var value = $(v).val();
    //             return $(v).find('.errorMessage').hasClass('active')?(!1):
    //                 Validate.checkNull(value)?($(v).find('.errorMessage').addClass('active').html('值不能为空'),!1):(!0);
    //         });
    //     }
    // },
    // validatorAbilityConfig= {
    //     ability_value: 'checkValue'
    // },
    validatorBenchOperationToolBox = {
        checkValue: function(name){
            var value = $('.addWorkBenchOperation').find('#'+name).val().trim();
            return $('.addWorkBenchOperation').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showBenchOperationInvalidMessage(name,"值不能为空"),!1):(!0);
        },
    },
    validatorBenchOperationConfig = {
        ability_value: 'checkValue'
    };

$(function () {
    getCompanySource();
    bindEvent()
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
function showWorkMachineInvalidMessage(name,val){
    $('.addWorkMachine').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addWorkMachine').find('.submit').removeClass('is-disabled');
}
function showWorkClassInvalidMessage(name,val){
    $('.addRankPlan').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addRankPlan').find('.submit').removeClass('is-disabled');
}
function showBenchOperationInvalidMessage(name,val){
    $('.addWorkBenchOperation').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addWorkBenchOperation').find('.submit').removeClass('is-disabled');
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
function getWorkShopUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
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
function getWorkBenchUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
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
function getWorkClassUnique(flag,field,value,id,workshop_id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}&workshop_id=${workshop_id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}&workshop_id=${workshop_id}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['rankPlan'].unique+"?"+_token+urlLeft,
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
    $('body').on('click','.el-select-dropdown-item:not(.el-auto,.route-ability-item)',function(e){
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

    //能力描述展示全
    var desc_show='';
    $('body').on('mouseenter', '.show_description', function () {
        var msg = $(this).attr('data-desc');
        if(msg!=''){
            desc_show = layer.tips(msg, this,
                {
                    tips: [2, '#20A0FF'], time: 0
                });
        }
    }).on('mouseleave', '.show_description', function () {
        layer.close(desc_show);
    })

    //单选按钮点击事件
    $('body').on('click','.radioCheck .el-radio-input',function(e){
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

        if($(this).hasClass('workCenter')&&operationId.centerId == undefined){
            operationId.centerId=$(this).attr('data-id');
        }
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
            operationId.centerId = id;
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

            if($(this).hasClass('workCenter')){
                operationId.centerId=id;
            }
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
        }else if($(this).hasClass('workclass_add')){
            showWorkClassModal('add',0)
        }else if($(this).hasClass('select_procedure')){
            showRelationProcedureModal()
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

        if(correct){
            if(!$(this).hasClass('is-disabled')) {
                var parentForm = $(this).parents('#addWorkBench_from'),
                    id= parentForm.find('#itemId').val();
                $(this).addClass('is-disabled');
                var code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    desc = parentForm.find('#desc').val().trim();
                $(this).hasClass('edit')?(
                    editWorkBench({
                        workbench_id: id,
                        name: name,
                        desc:desc,
                        _token: TOKEN

                    })
                ):(addWorkBench({
                    code: code,
                    name: name,
                    workcenter_id:operationId.id,
                    desc:desc,
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

    $('body').on('click','.addWorkBenchOperation .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addWorkBenchOperation_from');
            var value = parentForm.find('#ability_value').val().trim(),
                id= parentForm.find('#itemId').val();
            var correct=1;
            for (var type in validatorBenchOperationConfig) {
                correct=validatorBenchOperationConfig[type]&&validatorBenchOperationToolBox[validatorBenchOperationConfig[type]](type);
                if(!correct){
                    break;
                }
            }
            if(correct){
                editWorkBenchOperation({
                    workbench_operation_id: id,
                    value: value,
                    _token: TOKEN
                })
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
        }else if($(this).hasClass('workClassRelation')){
            var name = $(this).attr('data-name');
            showClassRelationModal(id,name)

        }else if($(this).hasClass('workProcedureRelation')){
            procedureArr=[];
            procedureBZArr=[];
            procedureBZArr_JSON=[];
            showProcedureRelationModal(id)
        }else{

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteWorkCenter(id);
            });
        }
    });
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

    //  关联工序中的选择能力
    $('body').on('click', '.el-checkbox_input.route-ab-check', function () {
        var operationtab = $(this).parents('#relationProcedure_from .procedure_table .t-body'),
            operationele = $(this).parents('.oper_ability_wrap'),
            ids = operationele.find('.operation_val_id').val().trim() ? operationele.find('.operation_val_id').val().trim().split(',') : [],
            abjson = [],opjson=[],abname=[];
        if (operationtab.attr('data-ajson')) {
            abjson = JSON.parse(operationtab.attr('data-ajson'));
        }
        $(this).toggleClass('is-checked');
        var id = $(this).attr('data-checkid'),
            aid = $(this).attr('data-aid'),
            oid = $(this).attr('data-oid'),
            cname = $(this).attr('data-checkname');

        if ($(this).hasClass('is-checked')) {
            var obj_abs = {
                operation_id: oid,
                step_id: id
            };
            abjson.push(obj_abs);
            ids.push(id);
        }else {
            var index = ids.indexOf(id);
            ids.splice(index, 1);
            abjson.splice(index, 1);
            procedureBZArr_JSON.splice(index, 1);
        }
        operationele.find('.operation_val_id').val(ids.join(','));
        operationtab.attr('data-ajson', JSON.stringify(abjson));

        //console.log(procedureBZArr_JSON);
        // var operationele = $(this).parents('.oper_ability_wrap'),
        //     ids = operationele.find('.operation_val_id').val().trim() ? operationele.find('.operation_val_id').val().trim().split(',') : [],
        //     abjson = [],opjson=[],abname=[];
        // if (operationele.attr('data-ajson')) {
        //     abjson = JSON.parse(operationele.attr('data-ajson'));
        // } else {
        //     abjson = [];
        // }
        // if (operationele.attr('data-ojson')) {
        //     opjson = JSON.parse(operationele.attr('data-ojson'));
        // } else {
        //     opjson = [];
        // }
        // $(this).toggleClass('is-checked');
        // var id = $(this).attr('data-checkid'),
        //     aid = $(this).attr('data-aid'),
        //     oid = $(this).attr('data-oid'),
        //     cname = $(this).attr('data-checkname');
        //
        // if ($(this).hasClass('is-checked')) {
        //     var obj_abs = {
        //         operation_id: oid,
        //         operation_to_ability_id: aid
        //     };
        //     abjson.push(obj_abs);
        //     ids.push(id);
        // }else {
        //     var index = ids.indexOf(id);
        //     ids.splice(index, 1);
        //     abjson.splice(index, 1);
        // }
        // operationele.find('.operation_val_id').val(ids.join(','));
        // operationele.attr('data-ajson', JSON.stringify(abjson));
        if (ids.length) {
            operationele.find('.poerationel-input').val(ids.length + '项被选中');
        } else {
            operationele.find('.poerationel-input').val('--请选择--');
        }
    });

    $('body').on('click','.info_table.workbench .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewWorkBench(id,'view');
        }else if($(this).hasClass('edit')){
            viewWorkBench(id,'edit');
        }else if($(this).hasClass('relation_people')){
            relationPeopleModal(id)
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

    $('body').on('click','.info_table.workclass .pop-button',function () {
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

    $('body').on('click','.info_table.procedure_table .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewWorkOperation(id,'view');
        }else if($(this).hasClass('edit')){
            viewWorkOperation(id,'edit');
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteWorkBenchOperation(id);
            });
        }
    })


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
        && remoteWorkShopValidatorToolbox[remoteWorkShopValidatorConfig[name]](flag,name,id);
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
            id=$('#addWorkBench_from #itemId').val();
        validatorWorkBenchConfig[name]
        && validatorWorkBenchToolBox[validatorWorkBenchConfig[name]]
        && validatorWorkBenchToolBox[validatorWorkBenchConfig[name]](name)
        && remoteWorkBenchValidatorConfig[name]
        && remoteWorkBenchValidatorToolbox[remoteWorkBenchValidatorConfig[name]]
        && remoteWorkBenchValidatorToolbox[remoteWorkBenchValidatorConfig[name]](flag,name,id);
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

    $('body').on('focus','#addRankPlan_from .el-input:not([readonly],.date)',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addRankPlan_from .el-input:not([readonly],.date)',function(){
        var flag=$('#addRankPlan_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addRankPlan_from #itemId').val();
        validatorWorkClassConfig[name]
        && validatorWorkClassToolBox[validatorWorkClassConfig[name]]
        && validatorWorkClassToolBox[validatorWorkClassConfig[name]](name)
        && remoteWorkClassValidatorConfig[name]
        && remoteWorkClassValidatorToolbox[remoteWorkClassValidatorConfig[name]]
        && remoteWorkClassValidatorToolbox[remoteWorkClassValidatorConfig[name]](flag,name,id);
    });

    $('body').on('focus','#addWorkBenchOperation_from .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','#addWorkBenchOperation_from .el-input:not([readonly])',function(){
        var flag=$('#addWorkBenchOperation_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#addWorkBenchOperation_from #itemId').val();
        validatorBenchOperationConfig[name]
        && validatorBenchOperationToolBox[validatorBenchOperationConfig[name]]
        && validatorBenchOperationToolBox[validatorBenchOperationConfig[name]](name);
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
    //添加休息时间
    $('body').on('click','.rest-item-add',function(){
        var len=$('#restTimeWrap').find('.select-item').length+1;
        $('#restTimeWrap .item-select-wrap').append(createRestOptionHtml(len));
        renderLayDate(['#rest_from'+len,'#rest_to'+len]);
    })
    //删除休息时间
    $('body').on('click','.rest-item-delete',function(){
        $(this).parents('.select-item').remove();
        $('#restTimeWrap').find('.errorMessage').html('').show();
    })
    //checkbox 工序checkbox点击
    $('body').on('click','.procedure_table .tdleft .el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        $(this).toggleClass('is-checked');
        $(this).parents('tr').toggleClass('selected');
        var _val = $('.relation_procedure_wrap .title h5 span').text();
        // console.log(procedureArr);
        var _parentForm = $('#relationProcedure_from'),
            id = _parentForm.attr('data-id');
        var _proce = _parentForm.find('.procedure_table .el-checkbox_input.procedure_relation.is-checked');

        if($(this).hasClass('is-checked')){
            var lingArr = procedureArr?procedureArr:[];
            var id = parseInt($(this).attr('data-id'));
            lingArr.push(id);
            hasSelect = Number(_val)+1;
        }else{
            var reArr = [];
            reArr = procedureArr;
            var id = parseInt($(this).attr('data-id'));
            var index = $.inArray(id,procedureArr);
            if (index > -1) {
                procedureArr.splice(index, 1);
            }
            hasSelect = Number(_val)-1;
            $(this).parents('tr.tritem').find('.oper_ability_wrap .el-select-dropdown-wrap .poerationel-input').val('--请选择--');
            $(this).parents('tr.tritem').find('.oper_ability_wrap .el-select-dropdown-wrap .operation_val_id').val('');
            $(this).parents('tr.tritem').find('.oper_ability_wrap .el-select-dropdown-list .el-checkbox_input.route-ab-check').removeClass('is-checked');
        }
        console.log(procedureArr);
        $('.relation_procedure_wrap .title h5').html(`已选&nbsp;<span>${hasSelect}</span>&nbsp;项`);
    });

    $('body').on('click','.selectOperationAbility_table .el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        $(this).toggleClass('is-checked');
        var _data = $(this).parents('.tritem').data('materItem');
        if($(this).hasClass('is-checked')){
            procedureAbility.push(_data);
            getProcedureAbilitySource(procedureAbility);
        }else{

            for(var i=0;i<procedureAbility.length;i++){
                if(_data.id==procedureAbility[i].id){
                    procedureAbility.splice(i,1);
                    getProcedureAbilitySource(procedureAbility)
                }
            }
        }
    })

    $('body').on('click','.center_relation_table .el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        $(this).toggleClass('is-checked');
        var _val = $('.relation_rankPlan_wrap .title h5 span').text();
        if($(this).hasClass('is-checked')){
            centerSelect = Number(_val)+1;
        }else{
            centerSelect = Number(_val)-1;
        }
        $('.relation_rankPlan_wrap .title h5').html(`已选&nbsp;<span>${centerSelect}</span>&nbsp;项`);
    });

    $('body').on('click','.relation_person_tr .el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        $(this).toggleClass('is-checked');
    })
    // $('body').on('click', '.oper_ability_wrap .el-select-dropdown-item', function (e) {
    //
    // });
    //提交
    $('body').on('click','.submit:not(.disabled)',function () {
        if($(this).hasClass('procedure_ability')){//工序能力提交
            var parentForm = $('#relationWorkClass_from');
            var _len = parentForm.find('.procedure_ability_value .ability_value'),arr=[];
            if(_len.length){
                $(_len).each(function (k,v) {
                    var obj = {
                        operation_to_ability_id:$(v).attr('data-id'),
                        value:$(v).val()
                    };
                    arr.push(obj);
                })
            }else{
                correct = !1;
                $('span.errorMessage').html('请选择工序！');
                return false;
            }
            var correct = checkParam(arr);
            if(correct){
                var data = {
                    workbench_id : operationId.id,
                    operation_to_ability : JSON.stringify(arr),
                    _token : TOKEN,
                };
                saveWorkBenchOperation(data);
            }

        }else if($(this).hasClass('procedure_relation')){//关联工序提交
            var _parentForm = $('#relationProcedure_from'),
                id = _parentForm.attr('data-id');

            var _proce = _parentForm.find('.procedure_table .el-checkbox_input.procedure_relation.is-checked'),
                _temp=[],
                _ope_info=[],
                _abs_info=[],
                ab_arr1='',
                aid_arr='',
                oid_arr='', obj_abs={},obj_op={}
            ;
            //var op_arr = $(v).parents('tr').find('.oper_ability_wrap').attr('data-ojson');
            // 根据当前的选择工序获取选择的能力并添加数组
            $(_proce).each(function (k,v) {
                aid_arr = $(v).parents('tr').find('.oper_ability_wrap .route-ab-check.is-checked').attr('data-checkid');
                oid_arr = $(v).parents('tr').find('.oper_ability_wrap .route-ab-check.is-checked').attr('data-oid');
                if (aid_arr&&aid_arr.length){
                    $(v).parents('tr').find('.oper_ability_wrap .route-ab-check.is-checked').each(function(k,v){
                        obj_abs = {
                            operation_id: $(v).attr('data-oid'),
                            step_id: $(v).attr('data-checkid')
                        };
                        _abs_info.push(obj_abs);
                    });
                }
                _temp.push($(v).attr('data-id'));
            })
            var abs_json = $('#relationProcedure_from .procedure_table .t-body').attr('data-ajson');
            if (abs_json){
                _abs_info = procedureBZArr_JSON.concat(JSON.parse(abs_json))
            }else{
                _abs_info = procedureBZArr_JSON;
            }
            //console.log(_abs_info);
            procedureArr.forEach(function (item) {
                obj_op = {
                    operation_id: item
                };
                _ope_info.push(obj_op);
            });
            var prodata = {
                workcenter_id: id,
                operations: JSON.stringify(_temp),
                operation_info: JSON.stringify(_ope_info),
                step_info: JSON.stringify(_abs_info),
                _token: TOKEN
            }
            saveRelationProcedure(prodata);
        }else if($(this).hasClass('relation_workclass')){//关联班次提交

            var rankParentForm = $('#relationWorkClass_from'),
                rankId = rankParentForm.attr('data-id');
            var _rankLen = $('.center_relation_table .el-checkbox_input.is-checked'),_rankArr=[];

            $(_rankLen).each(function (k,v) {
                _rankArr.push($(v).attr('data-id'))
            })

            var _rankData = {
                workcenter_id: rankId,
                rankplans: JSON.stringify(_rankArr),
                _token: TOKEN
            }

            saveCenterRankPlan(_rankData)
        }else if($(this).hasClass('rankPlan_people')){//关联人员提交
            var rank_check = $('.relation_personnel_table'),
                person_id =$('#relationPeople_from').attr('data-id');

            var check_id = rank_check.find('.el-checkbox_input.is-checked'),personArr=[];

            if(check_id.length){
                $(check_id).each(function (k,v) {
                    var rankObj = {
                        rankplan_id:$(v).attr('data-checkId'),
                        emplyee_id:$(v).parents('.relation_person_tr').attr('data-id'),
                    }
                    personArr.push(rankObj)
                })

                var person_data = {
                    workbench_id: person_id,
                    rankpan_emplyees: JSON.stringify(personArr),
                    _token: TOKEN
                }

                saveRelationPerson(person_data)
            }
        }
    })

}

//验证参数
function checkParam(arr){
    var correct=1;
    if(arr.length){
        arr.forEach(function (item,index) {
            if(item.value == ''){
                correct = !1;
                $('span.errorMessage').html('值不能为空')
            }else{
                correct=1;
                $('span.errorMessage').html(' ')
            }
        })
    }
    return correct;
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
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
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

//查看工序
function viewWorkOperation(id,flag){
    AjaxClient.get({
        url: URLS['workBenchOperation'].show+"?workbench_operation_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showProcedureModal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//编辑工序
function editWorkBenchOperation(data){
    AjaxClient.post({
        url: URLS['workBenchOperation'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workBench');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addWorkBenchOperation_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showBenchOperationInvalidMessage(rsp.field,rsp.message)
            }
        }
    },this);
}
//删除工序
function deleteWorkBenchOperation(id){
    AjaxClient.get({
        url: URLS['workBenchOperation'].delete+"?workbench_operation_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSourceDetail(operationId.id,'workBench');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
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
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
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

//工序
function showProcedureModal(flag,ids,data) {
    var labelWidth=110,
        {workbench_operation_id='',operation_code='',opeartion_name='',ability_name='',value='',company_name='',factory_name='',workshop_name='',workcenter_name='',workbench_name='',company_id=0,factory_id=0,workshop_id=0,workcenter_id='',workbench_id='',preparation_hour='',ability_value='',rated_value=''}={};
    var is_packaging = 0;
    // var flag = 'add';
    var title= '查看工序';
    var btnShow='btnShow';
    var readonly= '';
    // var textareaplaceholder='';
    var none='';
    var noEdit='';
    // var ralate,dehtml='';
    if(data){
        ({workbench_operation_id='',operation_code='',opeartion_name='',ability_name='',value='',company_name='',factory_name='',workshop_name='',workcenter_name='',workbench_name='',company_id=0,factory_id=0,workshop_id=0,workcenter_id='',workbench_id='',preparation_hour='',ability_value='',rated_value=''}=data);
    }
    flag==='view'?(btnShow='btnHide',none='none',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑工位机',noEdit='readonly="readonly"',readonly='readonly="readonly"'):title='添加工位机');
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content:`<form class="addWorkBenchOperation formModal" id="addWorkBenchOperation_from" data-flag="${flag}">
              <input type="hidden" id="itemId" value="${workbench_operation_id}"> 
           <div class="el-form-item" >
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">工序编码<span class="mustItem">*</span></label>
                <input type="text" id="operation_code" ${readonly} ${noEdit} class="el-input" placeholder="" value="${operation_code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">工序名称<span class="mustItem">*</span></label>
                <input type="text" id="opeartion_name" ${readonly}${noEdit} class="el-input" placeholder="" value="${opeartion_name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">能力<span class="mustItem">*</span></label>
                <input type="text" id="ability_name" ${readonly}${noEdit} class="el-input" placeholder="" value="${ability_name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">准备工时<span class="mustItem">*</span></label>
                <input type="number" id="preparation_hour" ${readonly} class="el-input" placeholder="" value="${preparation_hour}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">标准工时<span class="mustItem">*</span></label>
                <input type="number" id="rated_value" ${readonly} class="el-input" placeholder="" value="${rated_value}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">倍数值<span class="mustItem">*</span></label>
                <input type="number" id="ability_value" ${readonly} class="el-input" placeholder="" value="${ability_value}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
         </form>
         `,
        success: function(layero,index){
            layerEle=layero;

            if(flag=='add'){
                getCompanyData(2);
                getFactoryData(2);
                getWorkShopData(2);
                getWorkCenterData(2);
                getWorkBenchData(2);
            }else{
                var companyele=$(layero).find('.el-form-item.companyele');
                companyele.find('.el-input-icon').remove();
                companyele.find('.el-select').addClass('noedit').find('.el-input').addClass('readonly');
                var factoryele=$(layero).find('.el-form-item.factoryele');
                factoryele.find('.el-input-icon').remove();
                factoryele.find('.el-select').addClass('noedit').find('.el-input').addClass('readonly');
                var workShopele=$(layero).find('.el-form-item.workShopele');
                workShopele.find('.el-input-icon').remove();
                workShopele.find('.el-select').addClass('noedit').find('.el-input').addClass('readonly');
                var workCenterele=$(layero).find('.el-form-item.workCenterele');
                workCenterele.find('.el-input-icon').remove();
                workCenterele.find('.el-select').addClass('noedit').find('.el-input').addClass('readonly');
                var workBenchele=$(layero).find('.el-form-item.workBenchele');
                workBenchele.find('.el-input-icon').remove();
                workBenchele.find('.el-select').addClass('noedit').find('.el-input').addClass('readonly');
            }
            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },100);
        },
        end: function(){
            layerEle='';
            $('.uniquetable tr.active').removeClass('active');
        }
    });
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
        content:`<form class="addFactory formModal" id="addFactory_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工厂编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工厂名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} class="el-input" placeholder="请输入工厂名称" value="${factory_name}">
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
        content:`<form class="addWorkShop formModal" id="addWorkShop_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">车间编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">车间名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} class="el-input" placeholder="请输入车间名称" value="${workshop_name}">
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
        content:`<form class="addWorkCenter formModal" id="addWorkCenter_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工作中心编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
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

    var labelWidth=135, readonly= '',btnShow='btnShow',title= '查看工作台',noEdit='',
        {workbench_id='',code='',workbench_name='',desc=''}={};
    if(data){
        ({workbench_id='',code='',workbench_name='',desc=''}=data);
    }
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑工作台',noEdit='readonly="readonly"'):title='添加工作台');

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content:`<form class="addWorkBench formModal" id="addWorkBench_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工作台编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                      <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工作台名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} class="el-input" placeholder="请输入车间名称" value="${workbench_name}">
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
        content:`<form class="addWorkMachine formModal" id="addWorkMachine_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item" >
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工位机编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} ${noEdit} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${code}">
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
                            <input type="text" id="compose_type_no" ${readonly} class="el-input" placeholder="由1-20位字母下划线数字组成,字母开头" value="${compose_type_no}">
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
                    _this.parents('.tree-folder-header').siblings('.tree-folder-content').html(treeList(rsp.results,'workBench',id))
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

function treeList(data,flag,id) {
    var treeHtml="";
    if(data.length){
        if(flag == 'workMachine'){
            data.forEach(function (item) {
                treeHtml+=`<div class="tree-folder ${flag}" data-id="${item.id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="item-dot expand-icon ${flag}" data-id="${item.id}"></i>
                   <div class="tree-folder-name"><p class="item-name company-tree-item ${flag}" data-pid="${item.id}" data-id="${item.id}" data-flag="${flag}" data-name="${item.name}">${item.name}</p></div></div></div>
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
                   <div class="tree-folder-name"><p class="item-name company-tree-item ${flag}" data-pid="${id}" data-id="${item.id}" data-flag="${flag}">${item.name}</p></div></div></div>
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
        $('.basic_work_class').html('');
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
        $('.basic_work_class').html('');
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
                // var totalData = rsp.paging.total_records;
                //
                // if(totalData>pageSize){
                //     bindPagenationClick(totalData,pageSize,id,'factory');
                // }else{
                //     $('#pagenation').html('');
                // }
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

                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkShopTable(rsp.results))
                }
                var totalData = rsp.paging.total_records;

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
        $('.basic_work_class').html('');
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
                // var totalData = rsp.paging.total_records;
                //
                // if(totalData>pageSize){
                //     bindPagenationClick(totalData,pageSize,id,'workShop');
                // }else{
                //     $('#pagenation').html('');
                // }
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

                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkCenterTable(rsp.results))
                }
                var totalData = rsp.paging.total_records;

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
        // AjaxClient.get({
        //     url: URLS['list'].workClassList+'?'+_token+"&page_no=1&page_size=10&workshop_id="+id,
        //     dataType:'json',
        //     beforeSend:function () {
        //         layerLoading = LayerConfig('load');
        //     },
        //     success:function (rsp) {
        //         layer.close(layerLoading);
        //
        //         $('.basic_work_class').html(showWorkClassTable(rsp.results))
        //     },
        //     fail:function (rsp) {
        //         layer.close(layerLoading);
        //     }
        // },this)
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
                    $('.basic_form').html(showWorkCenterInfo(rsp.results))
                }
                // var totalData = rsp.paging.total_records;
                //
                // if(totalData>pageSize){
                //     bindPagenationClick(totalData,pageSize,id,'workCenter');
                // }else{
                //     $('#pagenation').html('');
                // }
            },
            fail:function (rsp) {
                layer.close(layerLoading);
            }
        },this)
        AjaxClient.get({
            url: URLS['list'].workBenchList+'?'+_token+"&page_no="+pageNo+"&page_size="+pageSize+"&workcenter_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkBenchTable(rsp.results));

                }
                var totalData = rsp.paging.total_records;

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
        getRankRelation(operationId.id,'list')

    }else if(flag=='workBench'){

        AjaxClient.get({
            url: URLS['show'].workbenchShow+'?'+_token+"&page_no="+pageNo+"&page_size="+pageSize+"&workbench_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);

                if(rsp&&rsp.results){
                    $('.basic_form').html(showWorkBenchInfo(rsp.results))
                }
                else{

                }
                // var totalData = rsp.paging.total_records;
                //
                // if(totalData>pageSize){
                //     bindPagenationClick(totalData,pageSize,id,'workBench');
                // }else{
                //     $('#pagenation').html('');
                // }
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

                if(rsp&&rsp.results){
                    $('.basicChildInfo').html(showWorkMachineTable(rsp.results))
                }
                var totalData = rsp.paging.total_records;

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
        AjaxClient.get({
            url: URLS['workBenchOperation'].list+'?'+_token+"&page_no=1&page_size=100&workbench_id="+id,
            dataType:'json',
            beforeSend:function () {
                layerLoading = LayerConfig('load');
            },
            success:function (rsp) {
                layer.close(layerLoading);
                if(rsp&&rsp.results){
                    $('.basic_work_class').html(showRelationProcedure(rsp.results));
                }
                // var totalData = rsp.paging.total_records;
                //
                // if(totalData>pageSize){
                //     bindPagenationClick(totalData,pageSize,id,'workBench');
                // }else{
                //     $('#pagenation').html('');
                // }
            },
            fail:function (rsp) {
                layer.close(layerLoading);

            }
        },this)
    }else if(flag=='workMachine'){
        $('.basic_work_class').html('');
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
                           <!--<td class="right nowrap">-->
                                <!--<button data-id="${item.factory_id}" class="button pop-button view">查看</button>-->
                                <!--<button data-id="${item.factory_id}" class="button pop-button edit">编辑</button>-->
                                <!--<button data-id="${item.factory_id}" class="button pop-button delete">删除</button></td>-->
                       </tr>`
        })
    }
    return `<h3>工厂</h3>
            <!--<div class="operation_wrap"><button class="button button-define factory_add">添加工厂</button></div>-->
            <div class="table-container">
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
                               <!--<th class="thead"></th>-->
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
                           <!--<td class="right nowrap">-->
                                <!--<button data-id="${item.workshop_id}" class="button pop-button view">查看</button>-->
                                <!--<button data-id="${item.workshop_id}" class="button pop-button edit">编辑</button>-->
                                <!--<button data-id="${item.workshop_id}" class="button pop-button delete">删除</button></td>-->
                       </tr>`
        })
    }
    return `<h3>车间</h3>
            <!--<div class="operation_wrap"><button class="button button-define workshop_add">添加车间</button></div>-->
            <div class="table-container">
                <table class="info_table workshop">
                        <thead>
                           <tr>
                               <th class="thead">编码</th>
                               <th class="thead">名称</th>
                               <th class="thead">位置</th>
                               <th class="thead">创建时间</th>
                               <!--<th class="thead"></th>-->
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
                            <button data-id="${item.workcenter_id}" data-name="${item.workcenter_name}" class="button pop-button workClassRelation">关联班次</button>
                            <button data-id="${item.workcenter_id}" class="button pop-button workProcedureRelation">关联工序&做法字段</button>
                            <!--<button data-id="${item.workcenter_id}" class="button pop-button view">查看</button>-->
                            <!--<button data-id="${item.workcenter_id}" class="button pop-button edit">编辑</button>-->
                            <!--<button data-id="${item.workcenter_id}" class="button pop-button delete">删除</button></td>-->
                       </tr>`
        })
    }
    return `
<h3>工作中心</h3>
                <!--<div class="operation_wrap"><button class="button button-define workcenter_add">添加工作中心</button></div>-->
                <div class="table-container workcenter">
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
function showWorkClassTable(data) {

    var _html = '';

    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${item.name}</td>
                           <td>${item.from}</td>
                           <td>${item.to}</td>
                           <td class="right nowrap">
                                <button data-id="${item.rankplan_id}" data-name="${item.name}" class="button pop-button connect">关联人员</button>
                                <button data-id="${item.rankplan_id}" class="button pop-button view">查看</button>
                                <!--<button data-id="${item.rankplan_id}" class="button pop-button edit">编辑</button>-->
                                <button data-id="${item.rankplan_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return `
<h3>班次</h3><div class="operation_wrap">
                <button class="button button-define workclass_add">添加班次</button>
            </div><div class="table-container">
            <table class="info_table workclass">
                    <thead>
                       <tr>
                           <th class="thead">名称</th>
                           <th class="thead">开始时间</th>
                           <th class="thead">结束时间</th>
                           <th class="thead"></th>
                       </tr>
                    </thead>
                    <tbody class="t-body">
                      ${_html}
                    </tbody>
             </table></div>`;
}

function showWorkCenterInfo(data) {
    var _html ="";

    _html=`<div>
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
                            <button data-id="${item.workbench_id}" class="button pop-button relation_people">关联人员</button></td>
                       </tr>`
        })
    }
    return `<h3>工作台</h3>
<!--<div class="operation_wrap"><button class="button button-define workbench_add">添加工作台</button></div>-->
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

function showWorkBenchInfo(data) {
    var _html ="";

    _html=`<div>
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
                           <!--<td class="right nowrap">-->
                                <!--<button data-id="${item.workmachine_id}" class="button pop-button view">查看</button>-->
                                <!--<button data-id="${item.workmachine_id}" class="button pop-button edit">编辑</button>-->
                                <!--<button data-id="${item.workmachine_id}" class="button pop-button delete">删除</button></td>-->
                       </tr>`
        })
    }
    return `<h3>工位机</h3>
<!--<div class="operation_wrap"><button class="button button-define workmachine_add">添加工位机</button></div>-->
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
                           <!--<th class="thead"></th>-->
                       </tr>
                    </thead>
                    <tbody class="t-body">
                      ${_html}
                    </tbody>
             </table>`;
}

function showWorkMachineInfo(data) {
    var _html ="";
    $('#pagenation').css('display','none');
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
                           <label class="el-form-item-label">工作台名称</label>
                           <span class="el-input-span">${data.workbench_name}</span>
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
             `;
    return _html
}

//<!-------------------分割线----------------------->

//关联班次
function showClassRelationModal(ids,name) {
    var labelWidth=120,btnShow='btnShow';

    layerModal=layer.open({
        type: 1,
        title: '关联班次',
        offset: '90px',
        area: '700px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<form class="relationWorkClass formModal" id="relationWorkClass_from" data-id="${ids}">
                    <div class="relation_rankPlan_wrap">
                         <div class="title"><h5></h5></div>
                         <div class="center_relation_table" style="margin-bottom: 10px">
                            <div class="table-container">
                                <table class="info_table center_relation_table">
                                        <thead>
                                           <tr>
                                               <th class="thead">选择</th>
                                               <th class="thead">班次类型</th>
                                               <th class="thead">开始时间</th>
                                               <th class="thead">结束时间</th>
                                               <th class="thead">工作日</th>
                                           </tr>
                                        </thead>
                                        <tbody class="t-body">
                                        </tbody>
                                 </table>
                            </div>
                         </div>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit relation_workclass">确定</button>
                        </div>
                    </div>
                    
</form>`,
        success:function (layero,index) {
            getRankRelation(ids,'center')
            // getRankPlanSource()
        }
    })
}
//获取工作中心关联的班次
function getRankRelation(id,flag) {
    AjaxClient.get({
        url: URLS['centerOperation'].rankPlanRelation+'?'+_token+"&workcenter_id="+id,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(flag == 'center'){
                var arr =[];
                if(rsp.results&&rsp.results.length){
                    rsp.results.forEach(function (item,index) {
                        arr.push(item.rankplan_id);
                    });
                }
                getRankPlanSource(arr);
            }else if(flag == 'list'){
                $('.basic_work_class').html(showCenterRankPlan(rsp.results));
            }else{
                if(rsp.results&&rsp.results.length){
                    relationRank = rsp.results
                }
                setTimeout(function () {
                    getLayerSelectPosition(layerEle)
                },200)
            }


        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this);
}
//获取所有班次
function getRankPlanSource(arr) {
    AjaxClient.get({
        url: URLS['source'].workClass+'?'+_token,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results&&rsp.results.length){
                createCenterOperation($('.center_relation_table .t-body'),rsp.results,arr)
            }else{
                var tr=`<tr>
                            <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
                        </tr>`;
                $('.center_relation_table .t-body').html(tr);
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this)
}
//关联班次表格
function createCenterOperation(ele,data,arr) {

    $('.relation_rankPlan_wrap .title h5').html(`已选&nbsp;<span>${arr.length}</span>&nbsp;项`);
    data.forEach(function(item,index){

        var _check='';
        for(var x in arr){
            if(item.id == arr[x]){
                _check = 'is-checked'
            }
        }

        var _checkbox=`<span class="el-checkbox_input center_relation ${_check}" data-id="${item.id}">
                    <span class="el-checkbox-outset"></span>
                </span>`;
        var _week = ['周日','周一','周二','周三','周四','周五','周六'],_workDate = JSON.stringify(item.work_date),str=[];

        for(var i =0;i<_workDate.length;i++){
            for(var j=0;j<_week.length;j++){
                if(_workDate[i] == j){
                    str.push(_week[j])
                }
            }
        }

        var tr=`<tr class="tritem" data-id="${item.id}">
                <td class="tdleft" style="text-align: center">${_checkbox}</td>
                <td>${item.type_name}</td>
                <td>${item.from}</td>
                <td>${item.to}</td>
                <td>${str.join(',')}</td>
            </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data('centerItem',item);
    });
}
//保存关联班次
function saveCenterRankPlan(data) {
    AjaxClient.post({
        url: URLS['centerOperation'].store,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workShop');
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}

//关联人员
function relationPeopleModal(ids) {
    var labelWidth=120,btnShow='btnShow';

    layerModal=layer.open({
        type: 1,
        title: '关联人员',
        offset: '90px',
        area: '700px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<form class="relationPeople formModal" id="relationPeople_from" data-id="${ids}">
                       <div class="relation_rank_wrap">
                        <div class="table-container" style="margin-bottom: 10px">
                           <table class="info_table relation_personnel_table">
                                <thead>
                                    <tr>
                                       <th class="thead">姓名</th>
                                       <th class="thead">工作时间</th>
                                    </tr>
                                </thead>
                                <tbody class="t-body">
                                    
                                </tbody>
                           </table>
                        </div>
                       </div>
                       <div class="el-form-item ${btnShow}">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button el-button--primary submit rankPlan_people">确定</button>
                            </div>
                       </div>
                    
</form>`,
        success:function (layero,index) {
            layerEle = layero;
            getExitRankPerson(ids);

            getRankRelation(operationId.id,'bench')
        }
    })
}
//获取填充人员已选班次
function getExitRankPerson(id) {
    AjaxClient.get({
        url: URLS['centerOperation'].rankRelationPerson+'?'+_token+"&workbench_id="+id,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var arr =[];
            if(rsp.results&&rsp.results.length){

                rsp.results.forEach(function (item,index) {

                    var obj = {
                        rankplan_id: item.rankplan_id,
                        emplyee_id:item.emplyee_id
                    }
                    arr.push(obj);
                });
            }
            getRelationPeopleSource(arr);
            // getAllProcedure(arr);
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this);
}

//展示工作中心关联的班次表格
function showCenterRankPlan(data) {
    var _html = '';
    if(data.length){
        data.forEach(function (item) {
            var _week = ['周日','周一','周二','周三','周四','周五','周六'],_workDate = JSON.stringify(item.work_date),str=[];
            for(var i =0;i<_workDate.length;i++){
                for(var j=0;j<_week.length;j++){
                    if(_workDate[i] == j){
                        str.push(_week[j])
                    }
                }
            }
            _html+=` <tr>
                           <td>${item.type_name}</td>
                           <td>${item.from}</td>
                           <td>${item.to}</td>
                           <td>${str.join(',')}</td>
                       </tr>`
        })
    }
    return `<h3>关联班次</h3>
            <div class="table-container"><table class="info_table center">
                    <thead>
                       <tr>
                           <th class="thead">班次类型</th>
                           <th class="thead">开始时间</th>
                           <th class="thead">结束时间</th>
                           <th class="thead">工作日</th>
                       </tr>
                    </thead>
                    <tbody class="t-body">
                      ${_html}
                    </tbody>
             </table></div>`;
}
//获取工作中心人员
function getRelationPeopleSource(arr) {
    AjaxClient.get({
        url: URLS['centerOperation'].employee+'?'+_token+"&workcenter_id="+operationId.id,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results&&rsp.results.length){
                showRelationPeopleTable($('.relationPeople .t-body'),rsp.results,arr);
            }else{
                var tr=`<tr class="nowrap" style="text-align: center;">暂无数据</tr>`;

                $('.relationPeople .t-body').html(tr);
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this)
}
//工作中心人员表格
function showRelationPeopleTable(ele,data,arr) {


    data.forEach(function (item,index) {

        var _select = `<ul class="relation_rank"></ul>`;

        var tr=` <tr class="relation_person_tr" id="relation_person_${item.id}" data-id="${item.id}">
                   <td>${item.name}</td>
                   <td>${_select}</td>
               </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data('personnelItem',item);

        setTimeout(function () {
            if(relationRank.length){
                var li = '', _check = '';
                relationRank.forEach(function (ritem) {

                    li += `<li><span class="el-checkbox_input ${_check}" data-checkId="${ritem.rankplan_id}">
                     <span class="el-checkbox-outset"></span>
                     <span class="el-checkbox__label">${ritem.type_name}&nbsp;(${ritem.from}~${ritem.to})</span>
                 </span></li>`;
                });

                $('ul.relation_rank').html(li)
            }
        },10)

        setTimeout(function () {
            for(var x = 0;x<arr.length;x++){
                $('.relation_person_tr[data-id='+arr[x].emplyee_id+']').find('.el-checkbox_input[data-checkId='+arr[x].rankplan_id+']').addClass('is-checked');
            }
        },100)
    });

}
//保存关联工作中心
function saveRelationPerson(data) {
    AjaxClient.post({
        url: URLS['centerOperation'].relationPerson,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workCenter');
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}

//工序能力列表
function showRelationProcedure(data) {
    var _html = '';
    if(data.length){
        data.forEach(function (item) {
            _html+=` <tr>
                           <td>${item.operation_code}</td>
                           <td>${item.opeartion_name}</td>
                           <td>${item.ability_name}</td>
                           <td>${item.preparation_hour}</td>
                           <td>${item.rated_value}</td>
                           <td>${item.ability_value}</td>
                           <td class="right nowrap">
                                <button data-id="${item.workbench_operation_id}" class="button pop-button view">查看</button>
                                <!--<button data-id="${item.workbench_operation_id}" class="button pop-button edit">编辑</button>-->
                                <button data-id="${item.workbench_operation_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }


    return `<h3>工序</h3><div class="operation_wrap">
                <button class="button button-define select_procedure">选择能力</button>
            </div><div class="table-container">
            <table class="info_table procedure_table">
                    <thead>
                       <tr>
                           <th class="thead">工序编码</th>
                           <th class="thead">工序名称</th>
                           <th class="thead">能力</th>
                           <th class="thead">准备工时</th>
                           <th class="thead">标准工时</th>
                           <th class="thead">倍数值</th>
                           <th class="thead"></th>
                       </tr>
                    </thead>
                    <tbody class="t-body">
                     ${_html}
                    </tbody>
             </table></div>`;
}
//关联工序能力
function showRelationProcedureModal() {
    procedureAbility=[];
    var labelWidth=120,btnShow='btnShow';

    layerModal=layer.open({
        type: 1,
        title: '关联工序能力',
        offset: '50px',
        area: '1100px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<form class="relationWorkClass formModal" id="relationWorkClass_from">
                    <div class="procedure_wrap" >
                       <div class="procedure_select">
                         <div class="title"><h5>可选工序</h5></div>
                         <div class="selectOperationAbility_table table_page">
                            <!--<div id="pagenation" class="pagenation"></div>-->
                            <table class="info_table">
                                <thead>
                                  <tr>
                                        <th class="thead">选择</th>
                                        <th class="thead">工序编码</th>
                                        <th class="thead">工序名称</th>
                                        <th class="thead">能力</th>
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
                           <div class="title"><h5>已选工序</h5><span class="errorMessage"></span></div>
                           <div class="inputOperationValue_table">
                            <table class="info_table">
                                <thead>
                                  <tr>
                                        <th class="thead">工序编码</th>
                                        <th class="thead">工序名称</th>
                                        <th class="thead">能力</th>
                                        <th class="thead">准备工时</th>
                                        <th class="thead">标准工时</th>
                                        <th class="thead">倍数值</th>
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
                            <button type="button" class="el-button el-button--primary submit procedure_ability">确定</button>
                        </div>
                    </div>
                    
</form>`,
        success:function (layero,index) {
            getProcedureSource();
        }
    })
}
//获取所有工序能力
function getProcedureSource() {
    $('.selectOperationAbility_table .table_tbody').html('');
    var urlLeft='';
    operationId.centerId = $('.company_tree').find('.workBench.selected').attr('data-pid');
    urlLeft+="&page_no="+pageProcedureNo+"&page_size=200&workbench_id="+operationId.id+"&workcenter_id="+operationId.centerId;
    AjaxClient.get({
        url: URLS['other'].operationList+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // var totalData=rsp.paging.total_records;
            //console.log(rsp.results);
            if(rsp.results&&rsp.results.length){
                createOperationTable($('.selectOperationAbility_table .table_tbody'),rsp.results);
            }else{
                var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
                $('.selectOperationAbility_table .table_tbody').html(tr);
            }

            // if(totalData>pageProcedureSize){
            //     bindPagenationClick(totalData,pageProcedureSize);
            // }else{
            //     $('.procedure_select #pagenation').html('');
            // }
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    },this);
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
//生成工序列表
function createOperationTable(ele,data){

    data.forEach(function(item,index){
        _checkbox=`<span class="el-checkbox_input" data-id="${item.id}">
                    <span class="el-checkbox-outset"></span>
                </span>`;
        var tr=`<tr class="tritem" data-id="${item.id}">
                <td class="tdleft" style="text-align: center">${_checkbox}</td>
                <td>${item.operation_code}</td>
                <td>${item.operation_name}</td>
                <td>${item.ability_name}</td>            
            </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data('materItem',item);
    });
}
//工序能力表格
function getProcedureAbilitySource(data) {
    $('.procedure_ability_value .table_tbody').html('');
    if(data.length){
        data.forEach(function (item,index) {
            var tr = `<tr data-id="${item.id}">
                        <td>${item.operation_code}</td>
                        <td>${item.operation_name}</td>
                        <td>${item.ability_name}</td>
                        <td><div class="el-form-item">
                              <input type="number" id="preparation_hour" class="el-input preparation_hour"  value="${item.preparation_hour}" readonly data-id="${item.id}" >
                           </div>
                        </td>
                        <td><div class="el-form-item">
                              <input type="number" id="rated_value" class="el-input rated_value" value="${item.rated_value}" readonly data-id="${item.id}" >
                           </div>
                        </td>
                        <td><div class="el-form-item">
                              <input type="number" id="ability_value" class="el-input ability_value" value="${item.ability_value}" readonly data-id="${item.id}">
                           </div>
                        </td>
                    </tr>`;
            $('.procedure_ability_value .table_tbody').append(tr);
        })
    }
}
//保存工序能力
function saveWorkBenchOperation(data) {
    AjaxClient.post({
        url: URLS['workBenchOperation'].store,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getSourceDetail(operationId.id,'workBench');
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}

//关联工序
function showProcedureRelationModal(id) {
    var labelWidth=120,btnShow='btnShow';

    layerModal=layer.open({
        type: 1,
        title: '关联工序&做法字段',
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<form class="formTemplate relationProcedure formModal" id="relationProcedure_from" data-id="${id}">
                    <div class="relation_procedure_wrap">
                         <div class="title"><h5></h5></div>
                         <div class="procedure_table" style="margin-bottom: 10px">
                            <div class="table-container">
                            <div class="table_page">
                                <table class="info_table procedure_table">
                                        <thead>
                                           <tr>
                                               <th class="thead">选择</th>
                                               <th class="thead">工序编码</th>
                                               <th class="thead">工序名称</th>
                                               <th class="thead">做法字段</th>
                                           </tr>
                                        </thead>
                                        <tbody class="t-body">
                                        </tbody>
                                 </table><div id="pagenationBZ" class="pagenation bottom-page"></div>
                             </div>
                                 
                            </div>
                         </div>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group" style="max-width: 450px;">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit procedure_relation">确定</button>
                        </div>
                    </div>
                    
</form>`,
        success:function (layero,index) {
            getCenterProcedure(id);

        }
    })
}
//获取工作中心关联的工序
function getCenterProcedure(id) {
    AjaxClient.get({
        url: URLS['centerOperation'].list+'?'+_token+"&workcenter_id="+id,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            var arr =[],abss_obj={},abss_arr=[],ope_obj={};
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function (item,index) {
                    ope_obj = {
                        operation_id: item.operation_id,
                    };
                    arr.push(item.operation_id);
                    console.log(item);
                    var index = $.inArray(item.operation_id,procedureArr);
                    if(index == -1){
                        procedureArr.push(item.operation_id);
                    }
                    if(item.steps&&item.steps.length){
                        item.steps.forEach(function (absitem) {
                            abss_obj={
                                operation_id: absitem.operation_id,
                                step_id: absitem.step_id
                            };
                            abss_arr.push(abss_obj);
                            procedureBZArr.push(abss_obj);
                            if(JSON.stringify(procedureBZArr_JSON).indexOf(JSON.stringify(abss_obj))==-1){
                                procedureBZArr_JSON.push(abss_obj);
                            }
                        });
                    }
                });
                console.log(arr);
            }
            getAllProcedure(id,arr,abss_arr);
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this);
}

//获取所有工序
function getAllProcedure(id,arr,abss_arr) {
    var urlLeft='';
    $('#relationProcedure_from .procedure_table .t-body').html('');
    urlLeft+="&page_no="+pageProcedureNo+"&page_size="+pageProcedureSize;
    AjaxClient.get({
        url: URLS['workCenter'].allProcedure+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);

            var totalData=rsp.paging.total_records;
            if(rsp.results){
                createAllOperationTable($('.procedure_table .t-body'),JSON.stringify(rsp.results),arr,abss_arr);
            }else{
                var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
                $('.procedure_table .t-body').html(tr);
            }

            if(totalData>pageProcedureSize){
                bindBZPagenationClick(totalData,pageProcedureSize,id);
            }else{
                $('.procedure_select #pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    },this);

}
//生成所有工序表格
function createAllOperationTable(ele,data,arr,abss_arr) {
    var dataall = JSON.parse(data);
    console.log(procedureArr);
    $('.relation_procedure_wrap .title h5').html(`已选&nbsp;<span>${procedureArr.length}</span>&nbsp;项`);
    $.each(dataall,function(index,item){
        var _check='',abs='',abch_arr=[];
        // for(var i in arr){
        //     if(item.operation_id == arr[i]){
        //         _check = 'is-checked';
        //
        //     }
        // }
        procedureArr.forEach(function(val,i){
            if(val == item.operation_id){
                _check = 'is-checked';
            }
        })

        // 获取关联工序的能力
        if (item.steps.length){
            item.steps.forEach(function(aitem,indexs){
                abs += `<li data-id="${aitem.step_id}" data-code="${aitem.code}"  data-oid="${aitem.operation_id}" data-name="${aitem.name}" class="el-select-dropdown-item route-ability-item">
                           <span class="el-checkbox_input route-ab-check " data-checkid="${aitem.step_id}" data-checkname="${aitem.name}"  data-code="${aitem.code}"  data-oid="${aitem.operation_id}">
                             <span class="el-checkbox-outset"></span>
                             <span class="el-checkbox__label show_description" data-desc="${aitem.description}">${aitem.name}</span>
                           </span>
                        </li>`;
            });
        }
        var _checkbox=`<span class="el-checkbox_input procedure_relation ${_check}" data-id="${item.operation_id}">
                    <span class="el-checkbox-outset"></span>
                </span>`;
        var tr=`<tr class="tritem" data-id="${item.operation_id}">
                <td class="tdleft" style="text-align: center">${_checkbox}</td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>
                    <div class="el-form-item oper_ability_wrap" style="max-width: 160px;margin: 0 auto;">
                        <p class="abs-name"></p>
                        <div class="el-form-item-div" style="max-width: 160px;">
                            <div class="el-select-dropdown-wrap" style="pointer-events: auto;">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="poerationel-input" style="background: #fff;" value="--请选择--">
                                    <input type="hidden" class="operation_val_id" value="">
                                </div>
                                <div class="el-select-dropdown ability" style="display: none;max-width: 160px;text-align:left;">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                        ${abs}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>`;
        ele.append(tr);
        for (var j in abss_arr){
            if(item.operation_id == abss_arr[j].operation_id){
                if(item.steps&&item.steps.length){
                    item.steps.forEach(function (ablitem) {
                        if (ablitem.step_id == abss_arr[j].step_id){
                            abch_arr.push(abss_arr[j].step_id);
                            $('#relationProcedure_from .t-body tr[data-id='+ abss_arr[j].operation_id +']').find('.oper_ability_wrap .operation_val_id').val(abch_arr);
                            $('#relationProcedure_from').find('.oper_ability_wrap .el-checkbox_input.route-ab-check[data-checkid=' + abss_arr[j].step_id + ']').addClass('is-checked');
                        }
                    });
                }
                $('#relationProcedure_from .t-body tr[data-id='+ abss_arr[j].operation_id +']').find('.poerationel-input').val(abch_arr.length+'项被选中');
            }
        }
        ele.find('tr:last-child').data('procedureItem',item);
    });
}
//保存关联工序
function saveRelationProcedure(data) {
    AjaxClient.post({
        url: URLS['workCenter'].procedureStore,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            if (rsp && rsp.code == '200'){
                LayerConfig('success','关联成功！');
            }
            getSourceDetail(operationId.id,'workShop');
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}
function bindBZPagenationClick(total,size,id){
    $('#pagenationBZ').show();
    $('#pagenationBZ').pagination({
        totalData:total,
        showData:size,
        current: pageProcedureNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageProcedureNo=api.getCurrent();
            getCenterProcedure(id);

        }
    });
}