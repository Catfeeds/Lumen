var creator_token = '',
    preview='',
    employeeId='',
    adminData={},
    layerLoading;
var sourceData = {
    adminData: [{name: '是', flag: 'admin',tip:'adminTrue', value: 1}, {name: '否', flag: 'admin',tip:'adminFalse', value: 0}],
    sexSource: [{name: '男', flag: 'male',tip:'male', value: 1}, {name: '女', flag: 'male',tip:'female', value: 2}],
    currentStateSource: [{name: '在职', flag: 'job', id: 1}, {name: '离职', flag: 'quit', id: 2}, {
        name: '试用',
        flag: 'probation',
        id: 3
    }, {name: '等待入职', flag: 'waiting', id: 4}],
    employeeTypeSource: [{name: '全职', flag: 'fulltime', id: 1}, {name: '兼职', flag: 'parttime', id: 2}],
    recruitingSource: [{name: '内部推荐', flag: 'recommend', id: 1}, {name: '网招', flag: 'netEmployee', id: 2}]
};

var pageItem = [
    // {label:'卡号',key:'id',flag:'input',disabled:true},
    {label: '身份证号', key: 'ID_number', flag: 'input'},
    {label: '姓名', key: 'name', flag: 'input', must: true},
    {label: '头像', key: 'icon', flag: 'icon'},
    {label: '部门', key: 'department_id', flag: 'select', source: [], must: true},
    {label: '生产单元', key: 'product_id', flag: 'select', source:[]},
    {label: '角色', key: 'position_id', flag: 'select', source: [], must: true},
    {label: '当前状态', key: 'status', flag: 'select', source: sourceData['currentStateSource'], must: true},
    {label: '手机', key: 'phone', flag: 'input'},
    {label: '是否为管理员', key: 'is_admin', flag: 'radio',source: sourceData['adminData']},
    {label: '性别', key: 'sex', flag: 'radio', source: sourceData['sexSource']},
    {label: '邮箱', key: 'email', flag: 'input'},
    {label: '学历', key: 'education_degree_id', flag: 'select', source: []},
    {label: '生日', key: 'birthday', flag: 'input', type: 'date'},
    // {label: '分配角色', key: 'role_id', flag: 'select', source: []},
    {label: '员工卡号', key: 'card_id', flag: 'input', must: true},
    {label: '密码', key: 'password', flag: 'input', must: true},
    {label: '省籍', key: 'native_province', flag: 'select', source: []},
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
    // getDeptSource();
    creator_token = '88t8r9m70r2ea5oqomfkutc753';

    employeeId = getQueryString('id');

    employeeId!=undefined?getEmployeeData(employeeId,pageItem):LayerConfig('fail','url链接缺少id参数，请给到id参数');

    showEmployeePage(pageItem);

});

function showEmployeePage(data) {
    $('.employeeContainer .employeeLeft').html("");
    $('.employeeContainer .employeeRight').html("");

    data.forEach(function (item,index) {

        var formItem = '',mustFlag = '';

        if(item.must == true){
            mustFlag = `<span class="mustItem">*</span>`
        }

        switch (item.flag){
            case 'input':

                formItem = `<div class="em-div"><div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                <input type="text" id="${item.key}" class="el-input" readonly>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left:140px;"></p></div>`;
                break;
            case 'select':
                formItem = `<div class="em-div"><div class="el-form-item ${item.key}">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                 <input type="text" id="${item.key}" class="el-input" readonly>  
                            </div> 
                        </div><p class="errorMessage" style="padding-left:140px;"></p></div>`;
                break;

            case 'textarea':
                formItem = `<div class="em-div"><div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                <textarea type="textarea" maxlength="500" id="${item.key}" readonly rows="5" class="el-textarea"></textarea>
                            </div>
                        </div><p class="errorMessage" style="padding-left:140px;"></p></div>`;
                break;
            case 'radio':

                var radioData = '';
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
                                <label class="el-form-item-label"></label>
                                 <span class="mustItem">*</span>
                                <input type="text" value="" id="admin_username" readonly class="el-input" placeholder="请输入管理员用户名">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left:140px;"></p></div>
                        <div class="em-div admin_user"><div class="el-form-item">
                            <div class="el-form-item-div"> 
                                <label class="el-form-item-label"></label>
                                 <span class="mustItem">*</span>
                                <input type="text" value="" id="admin_password" readonly class="el-input" placeholder="请输入管理员密码">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left:140px;"></p></div>`: ''}`;
                break;
            case 'icon':
                formItem = `<div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" data-id="${item.key}">${item.label}</label>
                                <div class="avatar-user" style="width: 120px;height: 120px;"></div>
                            </div>
                        </div>`;
                break;
            case 'treeSelect':
                formItem = `<div class="em-div"><div class="el-form-item ${item.key}">
                                <div class="el-form-item-div">
                                <label class="el-form-item-label">${item.label}${mustFlag}</label>
                                <div class="el-select-dropdown-wrap ${item.key=='product_id'? 'department_tree': 'dept_tree'}">
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

    });

}

function getEmployeeData(id,pageItem) {
    AjaxClient.get({
        url: URLS['employee'].employeeShow+"?"+_token+'&employee_id='+id,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                fullEmployeeData(rsp.results,pageItem);

                getDeptSource(rsp.results.department_id);
                getProceUnitSource(rsp.results.company_id,rsp.results);
                // getRoleSource(rsp.results.role_id);
                getPositionSource(rsp.results.position_id);
                getEducationSource(rsp.results.education_degree_id);
                getProvinceSource(rsp.results.native_province);
            }
        },
        fail: function(rsp){

            console.log('获取员工详细信息失败');
        }
    },this);
}

function getDeptSource(id) {

    AjaxClient.get({
        url: URLS['employee'].getDept+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {

            if(rsp.results&&rsp.results.length){

                rsp.results.forEach(function (item,index) {
                    if(item.id==id){
                        $('.el-form-item.department_id').find('#department_id').val(item.name);
                    }
                })
            }else{
                $('.el-form-item.department_id').find('#department_id').val();
            }
        },
        fail:function (rsp) {

            noData('获取部门失败，请刷新重试',4);

        }
    },this)

}
function getProceUnitSource(id,data) {
    AjaxClient.get({
        url: URLS['employee'].factoryTree+'?'+_token+'&company_id='+id,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results&&rsp.results.length){
                var arr=[],str='';
                treeHtml(rsp.results,arr);
                if(arr.length){
                    console.log(arr)
                    arr.forEach(function (item) {
                        if(data.factory_id==0&&data.workshop_id == 0&&data.workcenter_id == 0){
                            return false;
                        }else{
                            if(data.factory_id ==0 &&item.id==data.company_id&&item.flag==1){
                                str=item.name;
                            }else if(data.workshop_id == 0&&item.id==data.factory_id&&item.flag==2){
                                str=item.name;
                            }else if(data.workcenter_id == 0&&item.id==data.workshop_id&&item.flag==3){
                                str=item.name;
                            }else if(item.id==data.workcenter_id&&item.flag==4){
                                str=item.name;
                            }
                        }
                    })
                }else{
                    str=''
                }
                $('.el-form-item.product_id').find('#product_id').val(str);
            }else{
                $('.el-form-item.product_id').find('#product_id').val();
            }
        },
        fail:function (rsp) {
            noData('获取生产单元失败，请刷新重试',4);
        }
    },this)
}
function treeHtml(data,arr) {

    data.forEach(function (item, index){
        var obj={
            id:item.id,
            name:item.name,
            flag:item.flag
        };
        arr.push(obj);
        if(item.child&&item.child.length){
            treeHtml(item.child,arr)
        }
    });
}
function getRoleSource(id) {
    AjaxClient.get({
        url: URLS['employee'].getRole+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results&&rsp.results.length){

                rsp.results.forEach(function (item,index) {
                    if(item.id==id){

                        $('.el-form-item.role_id').find('#role_id').val(item.name);
                    }
                })
            }else{
                $('.el-form-item.role_id').find('#role_id').val();
            }
        },
        fail:function (rsp) {
            noData('获取角色部门失败，请刷新重试',4);

        }
    },this)

}
function getPositionSource(id) {
    AjaxClient.get({
        url: URLS['employee'].getPosition+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results&&rsp.results.length){

                rsp.results.forEach(function (item,index) {
                    if(item.id==id){

                        $('.el-form-item.position_id').find('#position_id').val(item.name);
                    }
                })
            }else{
                $('.el-form-item.position_id').find('#position_id').val();
            }
        },
        fail:function (rsp) {
            noData('获取角色失败，请刷新重试',4);

        }
    },this)

}
function getEducationSource(id) {
    AjaxClient.get({
        url: URLS['employee'].getEducation+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results&&rsp.results.length){

                rsp.results.forEach(function (item,index) {
                    if(item.id==id){

                        $('.el-form-item.education_degree_id').find('#education_degree_id').val(item.name);
                    }
                })
            }else{
                $('.el-form-item.education_degree_id').find('#education_degree_id').val();
            }
        },
        fail:function (rsp) {
            noData('获取学历失败，请刷新重试',4);

        }
    },this)

}
function getProvinceSource(id) {
    AjaxClient.get({
        url: URLS['employee'].getProvince+'?'+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {
            if(rsp.results&&rsp.results.length){

                rsp.results.forEach(function (item,index) {
                    if(item.id==id){

                        $('.el-form-item.native_province').find('#native_province').val(item.name);
                    }
                })
            }else{
                $('.el-form-item.native_province').find('#native_province').val();
            }
        },
        fail:function (rsp) {
            noData('获取省籍失败，请刷新重试',4);

        }
    },this)

}

function fullEmployeeData(data,pageItem) {

    pageItem.forEach(function (item,index) {

        if(item.flag == 'input'|| item.flag== 'textarea'){

           $('#'+item.key).val(data[item.key]);
        }

    });
    $('.em-div.admin_user').find('#admin_username').val(data.admin_username);
    $('.em-div.admin_user').find('#admin_password').val('******');

    var _status = sourceData.currentStateSource,_type = sourceData.employeeTypeSource,_recruit = sourceData.recruitingSource;

    _status.forEach(function (item,index) {
        if(item.id == data.status_id){
            $('.el-form-item.status').find('#status').val(item.name);
        }
    });

    _type.forEach(function (item,index) {
        if(item.id == data.employee_type_id){
            $('.el-form-item.employee_type').find('#employee_type').val(item.name);
        }
    });

    _recruit.forEach(function (item,index) {
        if(item.id == data.recruiting_source_id){
            $('.el-form-item.recruiting_source').find('#recruiting_source').val(item.name);
        }
    });

    data.gender == 1 ? ($('.el-radio-input.male').addClass('is-radio-checked'),$('.el-radio-input.female').removeClass('is-radio-checked'))
        : ($('.el-radio-input.female').addClass('is-radio-checked'),$('.el-radio-input.male').removeClass('is-radio-checked'));

    data.is_admin == 1 ? ($('.el-radio-input.adminTrue').addClass('is-radio-checked'),$('.el-radio-input.adminFalse').removeClass('is-radio-checked'), $('.em-div.admin_user').show())
        : ($('.el-radio-input.adminFalse').addClass('is-radio-checked'),$('.el-radio-input.adminTrue').removeClass('is-radio-checked'), $('.em-div.admin_user').hide());

    var urls='/storage/'+data.attachment_url,preview='';

    preview=`<img src="${urls}" width="120" height="120" data-url="${data.attachment_url}" attachment_id="${data.attachment_id}" title="">`;

    $('.avatar-user').html(preview)
}

