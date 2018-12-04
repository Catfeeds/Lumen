var creator_token = '',
    submitData = {},
    codeCorrect=!1,
    nameCorrect=!1,
    adminCorrect=!1,
    adminPass=!1,
    IDNumberCorrect=!1,
    deptCorrect=!1,
    departmentCorrect=!1,
    positionCorrect=!1,
    statusCorrect=!1,
    provinceCorrect=!1,
    addressCorrect=!1,
    roleCorrect=!1,
    // cardNumberCorrect=!1,
    // passwordCorrect=!1,
    nowAddressCorrect=!1,
    phoneCorrect=!1,
    emailCorrect=!1,
    itemActionFlag='',
    employeeId = '',
    layerModal,
    layerLoading,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                    (nameCorrect=1,!0);
        },
        checkAdminName:function (name) {
            var value=$('#'+name).val().trim();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(adminCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"系统用户名不能为空"),adminCorrect=!1,!1):
                    (adminCorrect=1,!0);
        },
        checkAdminPass:function (name) {
            var value=$('#'+name).val().trim();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(adminPass=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"系统用户密码不能为空"),adminPass=!1,!1):
                    (adminPass=1,!0);
        },
        checkIDnumber: function (name) {
            var value=$('#'+name).val().trim();
            if(value == ""){
                return IDNumberCorrect=1 ;
            }else{
                return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(IDNumberCorrect=!1,!1):
                    !Validate.checkIDNumber(value) ? (showInvalidMessage(name,"身份证格式不正确"),IDNumberCorrect=!1,!1):
                        (IDNumberCorrect=1,!0);
            }
        },
        checkProductId: function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(deptCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择生产单元"),deptCorrect=!1,!1):
                    (deptCorrect=1,!0);
        },
        checkDepartment:function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(departmentCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择部门"),departmentCorrect=!1,!1):
                    (departmentCorrect=1,!0);
        },
        checkPosition:function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(positionCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择角色"),positionCorrect=!1,!1):
                    (positionCorrect=1,!0);
        },
        checkStatus:function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(statusCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择状态"),statusCorrect=!1,!1):
                    (statusCorrect=1,!0);
        },
        checkProvince:function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(provinceCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择省籍"),provinceCorrect=!1,!1):
                    (provinceCorrect=1,!0);
        },
        checkAddress:function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(addressCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择地址"),addressCorrect=!1,!1):
                    (addressCorrect=1,!0);
        },
        // checkCardId: function (name) {
        //     var value=$('#'+name).val().trim();
        //
        //     return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(cardNumberCorrect=!1,!1):
        //         Validate.checkNull(value)?(showInvalidMessage(name,"员工卡号不能为空"),cardNumberCorrect=!1,!1):
        //             !Validate.checkCardId(value) ? (showInvalidMessage(name,"卡号由1-50位字母数字组成"),cardNumberCorrect=!1,!1):
        //             (cardNumberCorrect=1,!0);
        // },
        // checkCardPassword: function (name) {
        //     var value=$('#'+name).val().trim();
        //
        //     return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(passwordCorrect=!1,!1):
        //         Validate.checkNull(value)?(showInvalidMessage(name,"密码不能为空"),passwordCorrect=!1,!1):
        //             !Validate.checkCardPassword(value) ? (showInvalidMessage(name,"密码由4-6位数字组成"),passwordCorrect=!1,!1):
        //                 (passwordCorrect=1,!0);
        //
        // },
        checkNowAddress:function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(nowAddressCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择居住地址"),nowAddressCorrect=!1,!1):
                    (nowAddressCorrect=1,!0);
        },
        checkPhone:function (name) {
            var value=$('#'+name).val();

            if(value == ""){
                return phoneCorrect=1;
            }else{
                return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(phoneCorrect=!1,!1):
                        !Validate.checkMobile(value) ? (showInvalidMessage(name,"手机格式不正确"),phoneCorrect=!1,!1):
                            (phoneCorrect=1,!0);
            }
        },
        checkEmail:function (name) {
            var value=$('#'+name).val();
            if(value == ""){

                return emailCorrect=1 ;
            }else{
                return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(emailCorrect=!1,!1):
                    !Validate.checkEmail(value)?(showInvalidMessage(name,"邮箱不正确"),emailCorrect=!1,!1):(emailCorrect=1,!0);
            }
        },
        checkRole:function (name) {
            var value=$('#'+name).val();

            return $('#'+name).parents('.em-div').find('.errorMessage').hasClass('active')?(roleCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"请选择角色"),roleCorrect=!1,!1):
                    (roleCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckName: function(name){
            var value=$('#'+name).val().trim();
            getUnique(name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    adminCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    adminCorrect=1;
                }
            });
        },
    },
    validatorConfig = {
        name: "checkName",
        admin_username:'checkAdminName',
        admin_password:'checkAdminPass',
        ID_number: "checkIDnumber",
        // workcenter_id:"checkProductId",q
        department_id:"checkDepartment",
        position_id: "checkPosition",
        status:"checkStatus",
        // native_province:'checkProvince',
        // address:"checkAddress",
        // card_id:"checkCardId",
        // password:"checkCardPassword",
        // now_address:"checkNowAddress",
        phone:"checkPhone",
        email:"checkEmail",
        // role_id:"checkRole"
    },
    remoteValidatorConfig={
        admin_username: 'remoteCheckName'
    };

var sourceData = {
    adminData: [{name: '是', flag: 'admin',tip:'adminTrue', value: 1}, {name: '否', flag: 'admin',tip:'adminFalse', value: 0}],
    sexSource: [{name: '男', flag: 'male',tip:'male', value: 1}, {name: '女', flag: 'male',tip:'female', value: 2}],
    currentStateSource: [{name: '在职', flag: 'job', id: 1},
                        {name: '离职', flag: 'quit', id: 2},
                        {name: '试用', flag: 'probation', id: 3},
                        {name: '等待入职', flag: 'waiting', id: 4}],
    employeeTypeSource: [{name: '全职', flag: 'fulltime', id: 1}, {name: '兼职', flag: 'parttime', id: 2}],
    recruitingSource: [{name: '内部推荐', flag: 'recommend', id: 1}, {name: '网招', flag: 'netEmployee', id: 2}]
};

var pageItem=[
    {label: '身份证号', key: 'ID_number', flag: 'input'},
    {label: '姓名', key: 'name', flag: 'input', must: true},
    {label: '头像', key: 'icon', flag: 'icon'},
    {label: '部门', key: 'department_id', flag: 'treeSelect', source:[], must: true},
    {label: '生产单元', key: 'workcenter_id', flag: 'treeSelect', source:[]},
    {label: '角色', key: 'position_id', flag: 'select', source: [], must: true},
    {label: '当前状态', key: 'status', flag: 'select', source: sourceData['currentStateSource'], must: true},
    {label: '手机', key: 'phone', flag: 'input'},
    {label: '是否系统用户', key: 'is_admin', flag: 'radio',source: sourceData['adminData']},
    {label: '性别', key: 'sex', flag: 'radio', source: sourceData['sexSource']},
    {label: '邮箱', key: 'email', flag: 'input'},
    {label: '生日', key: 'birthday', flag: 'input', type: 'date'},
    {label: '学历', key: 'education_degree_id', flag: 'select', source:[]},
    // {label: '分配角色', key: 'role_id', flag: 'select', source:[],must:true},
    {label: '员工卡号', key: 'card_id', flag: 'input'},
    {label: '密码', key: 'password', flag: 'input',value:'000000'},
    {label: '省籍', key: 'native_province', flag: 'select', source:[]},
    {label: '地址', key: 'address', flag: 'textarea', placeholder: '请输入户籍地址'},
    {label: '居住', key: 'now_address', flag: 'textarea', placeholder: '请输入居住地址'},
    {label: '入职日期', key: 'entry_date', flag: 'input', type: 'date'},
    {label: '离职日期', key: 'resignation_date', flag: 'input', type: 'date'},
    {label: '员工类型', key: 'employee_type', flag: 'select', source: sourceData['employeeTypeSource']},
    {label: '招聘来源', key: 'recruiting_source', flag: 'select', source: sourceData['recruitingSource']},
    {label: '工龄', key: 'workYear', flag: 'number'},
    {label: '描述', key: 'description', flag: 'textarea', placeholder: '请输入描述，最多能输入500个字符'},
];

$(function () {
    // getRoleSource();
    getPositionSource();
    getEducationSource();
    getProvinceSource();

    creator_token = '88t8r9m70r2ea5oqomfkutc753';
    // creator_token=getCookie("session_emi2c_mlily_demo");
    var url=window.location.pathname.split('/');

    if(url.indexOf('employeeEdit')>-1){

        itemActionFlag='edit';

        employeeId = getQueryString('id');

        pageItem.unshift({label:'卡号',key:'id',flag:'input',disabled:true});

        employeeId!=undefined?getEmployeeInfo(employeeId,pageItem):LayerConfig('fail','url链接缺少id参数，请给到id参数');
        showEmployeePage(pageItem);

        $('.el-radio.male .el-radio-input').removeClass('is-radio-checked')

    }else{
        itemActionFlag = 'add';
        showEmployeePage(pageItem);
        fileinit([],[]);

    }
    getDeptSource();
    bindEvent(pageItem);
});
//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.em-div').find('.errorMessage').html(val).addClass('active');
    $('#employee_form').find('.submit').removeClass('is-disabled');
}
//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';
    urlLeft=`&field=name&value=${value}`;
    // if(flag==='edit'){
    //     urlLeft=`&field=${field}&value=${value}&id=${id}`;
    // }else{
    //     urlLeft=`&field=${field}&value=${value}`;
    // }
    var xhr=AjaxClient.get({
        url: URLS['employee'].unique+"?"+_token+urlLeft,
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

function getEmployeeInfo(id,pageItem) {

    AjaxClient.get({
        url: URLS['employee'].employeeShow+"?"+_token+'&employee_id='+id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            if(rsp.results){
                fileEmployeeData(rsp.results,pageItem);
                setTimeout(function () {
                    var data = rsp.results;
                    if(data.factory_id==0&&data.workshop_id == 0&&data.workcenter_id == 0){
                        layer.close(layerLoading);
                        return false;
                    }else{
                        $('.el-form-item.workcenter_id').find('.el-select-dropdown-item');
                        if(data.factory_id ==0){
                            $('.el-form-item.workcenter_id').find('.el-select-dropdown-item.1[data-id='+data.company_id+']').click();
                        }else if(data.workshop_id == 0){
                            $('.el-form-item.workcenter_id').find('.el-select-dropdown-item.2[data-id='+data.factory_id+']').click();
                        }else if(data.workcenter_id == 0){
                            $('.el-form-item.workcenter_id').find('.el-select-dropdown-item.3[data-id='+data.workshop_id+']').click();
                        }else {
                            $('.el-form-item.workcenter_id').find('.el-select-dropdown-item.4[data-id='+data.workcenter_id+']').click();
                        }
                        layer.close(layerLoading);
                    }

                },2000)
            }
        },
        fail: function(rsp){

            console.log('获取员工详细信息失败');
        }
    },this);
}
//获取生产单元列表
function getProceUnitSource(val) {
    if(val == ''|| val==undefined){
        $('.el-select-dropdown-wrap.department_tree').html(`<div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="workcenter_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                        </ul>
                                    </div>`)
    }else{
        AjaxClient.get({
            url: URLS['employee'].factoryTree+'?'+_token+'&company_id='+val,
            dataType: 'json',
            success:function (rsp) {
                if(rsp.results&&rsp.results.length){
                    $('.el-select-dropdown-wrap.department_tree').html(treeHtml(rsp.results));
                }
            },
            fail:function (rsp) {
                noData('获取生产单元失败，请刷新重试',4);
            }
        },this)
    }
}
function getDeptSource() {
    AjaxClient.get({
        url: URLS['employee'].deptTree+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results&&rsp.results.length){
                $('.el-select-dropdown-wrap.dept_tree').html(deptHtml(rsp.results));
            }
        },
        fail:function (rsp) {

            noData('获取部门失败，请刷新重试',4);

        }
    },this)
}
function deptHtml(data) {

    var _select = '',lis='',loopList='';
    if(data&&data.length){
        data.forEach(function (item) {
            loopList = deptTreeCopy(item.factory,1);
            lis+=`<li class="el-select-dropdown-item company_flag department_item_tree" data-name="${item.company_name}" data-id="${item.company_id}" data-company-id="${item.company_id}">${item.company_name}</li>
                    ${loopList}`
        })
    }
    _select = `<div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="department_id" value="">
                </div>
                <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                         ${lis}
                    </ul>
                    </div>
                </div>`;

    return _select;
}
function deptTreeCopy(data,level) {
    var _html='';

    if(data&&data.length){
        data.forEach(function (item,index) {

            var lastClass=index===data.length-1? 'last-tag' : '',span='';

            span=`<div style="padding-left:${20*level}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`;

            _html+= `<li class="el-select-dropdown-item dept_flag" data-company-id="${item.company_id}" data-forfather="${item.forefathers}" data-name="${item.name}" data-id="${item.id}">${span}</li>
                    ${deptTreeCopy(item.children,level+1)}`
        })
    }
    return _html;
}

function treeHtml(data) {
    var _select = '',lis='';
    if(data&&data.length){
        lis=treeCopyHtml(data);
    }
     _select = `<div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="workcenter_id" value="">
                </div>
                <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                        ${lis}
                    </ul>
                    </div>
                </div>`;
    return _select;
}
function treeCopyHtml(data) {
    var _html = '';
    data.forEach(function (item, index){
        var lastClass=index===data.length-1? 'last-tag' : '',span='',distance;
        span=item.flag ? `<div style="padding-left:${item.flag*20}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>` :
            `<span>${item.name}</span>`;
        _html += `<li class="el-select-dropdown-item ${item.flag}" data-name="${item.name}"
                        data-flag="${item.flag}"
                        data-id="${item.id}" 
                        data-company-id="${item.company_id}"
                        data-factory-id="${item.factory_id}"
                        data-workshop-id="${item.workshop_id}">${span}</li>
                  ${item.child&&item.child.length ?treeCopyHtml(item.child) : ''}`;
    });

    return _html;
}

function getRoleSource() {
    AjaxClient.get({
        url: URLS['employee'].getRole+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
            pageItem.forEach(function (item,index) {

                if(item.key == 'role_id'){
                    item.source = rsp.results;
                }
            })
        },
        fail:function (rsp) {
            noData('获取角色部门失败，请刷新重试',4);

        }
    },this)

}
function getPositionSource() {
    AjaxClient.get({
        url: URLS['employee'].getPosition+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
           // positionSource = rsp.results;
            pageItem.forEach(function (item,index) {

                if(item.key == 'position_id'){
                    item.source = rsp.results;
                }
            })
        },
        fail:function (rsp) {
            noData('获取角色失败，请刷新重试',4);

        }
    },this)

}
function getEducationSource() {
    AjaxClient.get({
        url: URLS['employee'].getEducation+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
           // educationSource = rsp.results;
            pageItem.forEach(function (item,index) {

                if(item.key == 'education_degree_id'){
                    item.source = rsp.results;
                }
            })
        },
        fail:function (rsp) {
            noData('获取学历失败，请刷新重试',4);

        }
    },this)

}
function getProvinceSource() {
    AjaxClient.get({
        url: URLS['employee'].getProvince+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
          // provinceSource = rsp.results;
            pageItem.forEach(function (item,index) {

                if(item.key == 'native_province'){
                    item.source = rsp.results;
                }
            });
        },
        fail:function (rsp) {
            noData('获取省籍失败，请刷新重试',4);

        }
    },this)

}

//附件初始化
function fileinit(preUrls,preothers){

    $("#avatar-2").fileinput({
        uploadAsync: true,
        language: 'zh',
        'uploadUrl': URLS['employee'].uploadAttachment,
        uploadExtraData: function (previewId, index) {
            var obj = {};
            obj.flag = 'personnel';
            obj._token = TOKEN;
            obj.creator_token = creator_token;
            return obj;
        },
        overwriteInitial: true,
        defaultPreviewContent: '<img src="/statics/custom/img/avatar.png" alt=""><h6 class="text-muted">点击上传</h6>',
        initialPreview: preUrls,
        initialPreviewConfig:preothers,
        showCaption: false,//隐藏标题
        showClose: false, //关闭按钮
        showBrowse:false,//浏览按钮
        browseOnZoneClick: true, //点击上传
        maxFileSize: 1500,
        layoutTemplates: {main2: '{preview}'},
        msgErrorClass: 'alert alert-block alert-danger',
        allowedFileExtensions: ["jpg", "png", "gif"],
    }).on('fileselect', function(event, numFiles, label) {

        $(this).fileinput("upload");
    }).on('fileloaded', function (event, file, previewId, index, reader) {
        $('#' + previewId).attr('data-preview', 'preview-' + file.lastModified);
    }).on('fileuploaded', function (event, data, previewId, index) {
        console.log('附件上传成功');
        var result = data.response,
            file = data.files[0];

        if (result.code == '200') {
            $('.file-preview-frame[data-preview=preview-'+file.lastModified+']').addClass('uploaded').
            attr({
                'data-url':result.results.path,
                'attachment_id': result.results.attachment_id
            });
        }

    }).on('filebeforedelete', function (event, key, data) {

        console.log('附件删除');
    })
}


function showEmployeePage(data) {
    $('.employeeContainer .employeeLeft').html("");
    $('.employeeContainer .employeeRight').html("");
    $('#employee_form .employeeBtn').html("");

    data.forEach(function (item,index) {
        var status=1,yes='',no='';
        
        var formItem = '',mustFlag = '';

        if(item.must == true){
            mustFlag = `<span class="mustItem">*</span>`
        }

        switch (item.flag){
            case 'input':

                var readonly = '';

                item.disabled == true ? readonly='readonly="readonly"' : '';

                formItem = `<div class="em-div"><div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                <input type="text" value="${item.value? item.value: ''}" id="${item.key}" class="el-input" placeholder="请输入${item.label}" ${readonly}>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left:140px;"></p></div>`;
                break; 
            case 'select':
                var selectData = '';
                if(item.source.length){
                    item.source.forEach(function (citem,index) {
                        selectData += `<li data-id="${citem.id}" data-name="${citem.name}" class=" el-select-dropdown-item">${citem.name}</li>`
                    })
                }

                formItem = `<div class="em-div"><div class="el-form-item ${item.key}">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="${item.key}" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            ${selectData}
                                        </ul>
                                    </div>
                                </div>
                            </div> 
                        </div><p class="errorMessage" style="padding-left:140px;"></p></div>`;
                break;

            case 'textarea':
                formItem = `<div class="em-div"><div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                <textarea type="textarea" maxlength="500" id="${item.key}" rows="5" class="el-textarea" placeholder="${item.placeholder}"></textarea>
                            </div>
                        </div><p class="errorMessage" style="padding-left:140px;"></p></div>`;
                break;
            case 'radio':
                // status==1?yes='is-radio-checked':no='is-radio-checked';

                var radioData = '',_select_admin=[],_readonly='';
                if(item.source.length){
                    item.source.forEach(function (citem,index) {

                        radioData += `<label class="el-radio">
                                        <span class="el-radio-input ${citem.tip} ${citem.value == 1 ? 'is-radio-checked' : ''}">
                                            <span class="el-radio-inner"></span>
                                            <input class="${citem.flag} ${item.value==1 ? 'yes' : 'no'}" type="hidden" value="${citem.value}">
                                        </span>
                                        <span class="el-radio-label">${citem.name}</span>
                                    </label>`;
                    })
                }

                formItem = `<div class="el-form-item ${item.key}">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}</label>
                                <div class="el-radio-group">
                                   ${radioData}
                                   <!-- -->${item.key== 'is_admin'? `
                                        <!--<div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i>-->
                                        <!--<span class="tip">请前往个人中心修改用户名和密码<i></i></span>-->
                                        <!--</div>-->`:''}
							     </div>  
                            </div>  
                        </div>${item.key== 'is_admin'?`<div class="em-div admin_user"><div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">系统用户名</label>
                                 <span class="mustItem">*</span>
                                <input type="text" value="" id="admin_username" class="el-input" placeholder="请输入系统用户名">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left:140px;"></p></div>
                        <div class="em-div admin_user"><div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">系统用户密码</label>
                                 <span class="mustItem">*</span>
                                <input type="text" value="" id="admin_password" class="el-input" placeholder="请输入系统用户密码">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left:140px;"></p></div>`: ''}`;
                break;
            case 'icon':
                formItem = `<div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" data-id="${item.key}">${item.label}</label>
                                <div class="kv-avatar">
                                    <div class="file-loading">
                                        <input id="avatar-2" name="attachment" type="file" required data-preview-file-type="image">
                                    </div>
                                </div>
                                 <div id="kv-avatar-errors-2" class="center-block" style="width:800px;display:none"></div>
                            </div>
                        </div>`;
                break;
            case 'treeSelect':
                formItem = `<div class="em-div"><div class="el-form-item ${item.key}">
                                <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                <div class="el-select-dropdown-wrap ${item.key=='workcenter_id'? 'department_tree': 'dept_tree'}">
                                   <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="${item.key}" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                        </ul>
                                    </div>
                                </div></div>
                        </div><p class="errorMessage" style="padding-left:140px;"></p></div>`;
                break;
            default:
                formItem = '';
        }

        if(index <= 11){
            $('.employeeContainer .employeeLeft').append(formItem)
        }else{
            $('.employeeContainer .employeeRight').append(formItem)
        }

        if(item.type=='date'){

            showLayDate(item.key)
        }

    });

    $('#employee_form .employeeBtn').append(`<div class="el-form-item btnShow">
            <div class="el-form-item-div">
                <button type="button" class="el-button el-button--primary submit">提交</button>
            </div>
        </div>`)
}

function bindEvent(pageItem) {
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    //下拉框点击事件
    $('body').on('click', '.el-select:not(.noedit)', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //下拉框item点击事件
    $('body').on('click', '.el-select-dropdown-item:not(.el-auto,.department_item_tree)', function (e) {
        $('#department_id').parents('.em-div').find('.errorMessage').removeClass('active').html("");
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
            var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }

        if($(this).parents('.el-form-item.department_id').find('.el-select-dropdown-wrap').hasClass('dept_tree')){
            var _sel = $(this).parent().find('.el-select-dropdown-item.selected').attr('data-company-id');
            getProceUnitSource(_sel);
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    //单选按钮点击事件
    $('body').on('click','.el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');

        if($(this).parents('.el-form-item').hasClass('is_admin')){
            var parentEle = $(this).parents('.el-form-item.is_admin');
            if(parentEle.find('.el-radio-input.adminFalse').hasClass('is-radio-checked')){
                $('.em-div.admin_user').hide();
            }else{
                $('.em-div.admin_user').show();
            }
        }

       // if(itemActionFlag=='edit'){
       //     $('.em-div.admin_user').find('#admin_username').attr('readonly','readonly');
       //     $('.em-div.admin_user').find('#admin_password').attr('readonly','readonly')
       // }

    });

    $('body').on('click','.employeeForm .submit:not(.is-disabled)',function (e) {
        e.stopPropagation();

        var parentForm = $(this).parents('#employee_form');
        for (var type in validatorConfig){validatorConfig[type]&& validatorToolBox[validatorConfig[type]](type);}

        if(nameCorrect&&IDNumberCorrect&&departmentCorrect&&positionCorrect&&
            statusCorrect&&phoneCorrect&&emailCorrect){

                if(!$(this).hasClass('is-disabled')){
                    $(this).addClass('is-disabled');
                    pageItem.forEach(function (item,index) {
                        if(item.flag == 'input'|| item.flag== 'textarea'){
                            submitData[item.key]= $('#'+item.key).val();
                        }else if(item.flag == 'select'){
                            submitData[item.key]= $('#'+item.key).val();

                        }else if(item.flag == 'radio'){
                            var _checkedSex = parentForm.find('.is-radio-checked .male').val();
                            var _checkAdmin = parentForm.find('.is-radio-checked .admin').val();

                            submitData.gender = _checkedSex;
                            submitData.is_admin = _checkAdmin;
                        }else if(item.flag == 'treeSelect'){
                            var ele=$('.el-select-dropdown-wrap.department_tree').find('.el-select-dropdown-item.selected');
                            switch (ele.attr('data-flag')){
                                case '1':
                                    submitData.company_id=ele.attr('data-id');
                                    break;
                                case '2':
                                    submitData.company_id=ele.attr('data-company-id');
                                    submitData.factory_id=ele.attr('data-id');
                                    break;
                                case '3':
                                    submitData.company_id=ele.attr('data-company-id');
                                    submitData.factory_id=ele.attr('data-factory-id');
                                    submitData.workshop_id=ele.attr('data-id');
                                    break;
                                case '4':
                                    submitData.company_id=ele.attr('data-company-id');
                                    submitData.factory_id=ele.attr('data-factory-id');
                                    submitData.workshop_id=ele.attr('data-workshop-id');
                                    submitData.workcenter_id=ele.attr('data-id');
                                    break;
                            }

                            var elDom = $('.el-select-dropdown-wrap.dept_tree').find('.el-select-dropdown-item.selected'),
                                dept_id =elDom.parents('.el-select-dropdown').siblings('.el-select').find('#department_id').val(),
                                dep_company_id = elDom.attr('data-company-id');
                            submitData.department_id = dept_id;
                            submitData.dep_company_id = dep_company_id;
                        }
                    });

                    var iconAvatar=$('#employee_form .file-preview-frame.file-preview-success,#employee_form .file-preview-frame.file-preview-initial img');

                    if(iconAvatar.attr('attachment_id') != undefined){
                        submitData.attachment_id = iconAvatar.attr('attachment_id');
                    }

                    submitData._token = TOKEN;
                    submitData.cookie = creator_token;
                    if(submitData.is_admin==1){
                        if(adminCorrect&&adminPass){
                            submitData.admin_username = $('#admin_username').val().trim();

                            if(itemActionFlag=='edit'){
                                $('#admin_password').val().trim() == '******'? delete submitData.admin_password :submitData.admin_password=$('#admin_password').val().trim();
                            }else{
                                submitData.admin_password = $('#admin_password').val().trim();
                            }
                            console.log(submitData);
                            itemActionFlag == 'edit' ? employeeEdit(submitData) : employeeAdd(submitData)
                        }
                    }else{
                        console.log(submitData);
                        itemActionFlag == 'edit' ? employeeEdit(submitData) : employeeAdd(submitData)
                    }

                    }
                }

    });

    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly]),.el-textarea',function(){
        $('#employee_form').find('.submit').removeClass('is-disabled');
        $(this).parents('.em-div').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-input:not([readonly]),.el-textarea',function(){
        var name=$(this).attr("id"),flag='',id='';
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });

    //下拉框的相关事件
    $('body').on('focus','.el-select .el-input',function () {

        $(this).parents('.em-div').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-select .el-input',function () {
        var name=$(this).siblings('input').attr("id");

        var obj = $(this);

        setTimeout(function(){

            if(obj.siblings('input').val() == '') {

                validatorConfig[name]
                && validatorToolBox[validatorConfig[name]]
                && validatorToolBox[validatorConfig[name]](name);

            }else{

                $('#'+name).parents('.em-div').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);

    });

}

function showLayDate(flag) {
        laydate.render({
            elem: `#${flag}`,
            max: getCurrentDate()
        });

}

function getCurrentDate() {
    var curDate = new Date();

    var  _year = curDate.getFullYear(),
        _month = curDate.getMonth()+1,
        _day = curDate.getDate();

    return _year + '-' + _month + '-'+ _day
}

//填充员工信息
function fileEmployeeData(data,pageItem) {

    pageItem.forEach(function (item,index) {
        if(item.flag == 'input'|| item.flag== 'textarea'){
           $('#'+item.key).val(data[item.key]);
        }
    });
    
    $('.em-div.admin_user').hide();
    $('.em-div.admin_user').find('#admin_username').val(data.admin_username);

    $('.el-form-item.department_id').find('.el-select-dropdown-item[data-id='+data.department_id+']').click();
    $('.el-form-item.role_id').find('.el-select-dropdown-item[data-id='+data.role_id+']').click();
    $('.el-form-item.position_id').find('.el-select-dropdown-item[data-id='+data.position_id+']').click();
    $('.el-form-item.education_degree_id').find('.el-select-dropdown-item[data-id='+data.education_degree_id+']').click();
    $('.el-form-item.native_province').find('.el-select-dropdown-item[data-id='+data.native_province+']').click();

    $('.el-form-item.status').find('.el-select-dropdown-item[data-id='+data.status_id+']').click();
    $('.el-form-item.employee_type').find('.el-select-dropdown-item[data-id='+data.employee_type_id+']').click();
    $('.el-form-item.recruiting_source').find('.el-select-dropdown-item[data-id='+data.recruiting_source_id+']').click();

    data.gender == 1 ? ($('.el-radio-input.male').addClass('is-radio-checked'),$('.el-radio-input.female').removeClass('is-radio-checked'))
        : ($('.el-radio-input.female').addClass('is-radio-checked'),$('.el-radio-input.male').removeClass('is-radio-checked'));

    data.is_admin == 1 ? ($('.el-radio-input.adminTrue').addClass('is-radio-checked'),$('.el-radio-input.adminFalse').removeClass('is-radio-checked'))
        : ($('.el-radio-input.adminFalse').addClass('is-radio-checked'),$('.el-radio-input.adminTrue').removeClass('is-radio-checked'));

    if(data.is_admin == 1){
        $('.em-div.admin_user').show();
        $('.em-div.admin_user').find('#admin_password').val('******');
    }else{
        $('.em-div.admin_user').find('#admin_password').val('');
    }
    if(data.attachment_url != ''){
        var preurls=[],preOther=[];
        var urls='/storage/'+data.attachment_url,preview='';

        preview=`<img src="${urls}" width="160" height="160" data-url="${data.attachment_url}" attachment_id="${data.attachment_id}">`;
        var pitem={
            url:URLS['employee'].employeeList+'?page_no=1&page_size=5'
        };

        preurls.push(preview);
        preOther.push(pitem);
        fileinit(preurls,preOther);

    }else{
        fileinit([],[]);
    }

}

function employeeAdd(data) {
    AjaxClient.post({
        url:URLS['employee'].employeeAdd,
        dataType:'json',
        data:data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            $('body').find('#employee_form .submit').removeClass('is-disabled');

            LayerConfig('success','添加成功',function(){

                submitData = {};
                $(window).scrollTop(0);
                window.location.reload();
            });

        },
        fail:function (rsp) {

            layer.close(layerLoading);

            $('body').find('#employee_form .submit').removeClass('is-disabled');

            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this)
}

function employeeEdit(data) {

    data.employee_id= data.id;
    delete data.id;

    AjaxClient.post({
        url:URLS['employee'].employeeUpdate,
        dataType:'json',
        data:data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            $('body').find('#employee_form .submit').removeClass('is-disabled');

            LayerConfig('success','编辑成功',function(){

                $(window).scrollTop(0);
            });

        },
        fail:function (rsp) {

            layer.close(layerLoading);

            $('body').find('#employee_form .submit').removeClass('is-disabled');

            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this)
}