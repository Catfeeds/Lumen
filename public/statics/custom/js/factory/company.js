var layerLoading,pageNo=1,pageSize=20,layerEle,
    codeCorrect=!1,
    nameCorrect=!1,
    validatorToolBox= {
        checkName: function (name) {
            var value = $('#' + name).val().trim();
            return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (nameCorrect = !1, !1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), nameCorrect = !1, !1) :
                    (nameCorrect = 1, !0);
        },
        checkCode: function (name) {
            var value = $('#' + name).val().trim();
            return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (codeCorrect = !1, !1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "编码不能为空"), codeCorrect = !1, !1) :
                    !Validate.checkMaterialClass(value) ? (showInvalidMessage(name, "编码由1-20位字母数字下划线中划线组成"), codeCorrect = !1, !1) :
                        (codeCorrect = 1, !0);
        },
        checkPhone: function (name) {
            var value = $('.addCompany').find('#' + name).val().trim();

            return $('.addCompany').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (!0) :
                    !Validate.checkPhone(value) ? (showInvalidMessage(name, "电话格式不正确"), !1) : (!0);
        },
        checkFax: function (name) {
            var value = $('.addCompany').find('#' + name).val().trim();
            return $('.addCompany').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (!0) :
                    Validate.checkFax(value) ? (!0) : (showInvalidMessage(name, "传真格式不正确"), !1);
        },
        checkEmail: function(name){
            var value = $('.addCompany').find('#'+name).val().trim();
            return $('.addCompany').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(!0):
                    Validate.checkEmail(value)?(!0):(showInvalidMessage(name,"邮箱格式不正确"),!1);
        },
    },
    remoteValidatorToolbox = {

        remoteCheckName: function(name,flag,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showInvalidMessage(name,val);
                }
            });
        },

    },
    validatorConfig = {
        name: "checkName",
        code: "checkCode",
        phone: 'checkPhone',
        fax:'checkFax',
        email:'checkEmail',
    },remoteValidatorConfig={
        name: "remoteCheckName",
        code: "remoteCheckName"
    };

$(function () {
    getCompany();
    bindEvent();
})

//显示错误信息
function showInvalidMessage(name,val){
    $('.addCompany').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addCompany_from').find('.submit').removeClass('is-disabled');
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
        url: URLS['company'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('唯一性检测失败');
        }
    },this);
}
function getCompany() {
    $('#table_company_table .table_tbody').html('');
    AjaxClient.get({
        url: URLS['company'].list + '?' + _token+'&page_no='+pageNo+'&page_size='+pageSize,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results && rsp.results.length){
                createHtml($('#table_company_table .table_tbody'),rsp.results)
            }else{
                noData('暂无数据',9)
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    })
}

function createHtml(ele,data) {
    data.forEach(function (item,index) {
        var tr = `
             <tr>
               <td>${item.company_name}</td>
               <td>${item.abbreviation}</td>
               <td>${item.country_name}</td>
               <td>${item.phone}</td>c
               <td>${item.fax}</td>
               <td>${item.address}</td>
               <td>${item.web}</td>
               <td>${item.email}</td>
               <td>${item.ctime}</td>
               <td class="right nowrap">
                <button data-id="${item.company_id}" class="button pop-button view">查看</button>
                <button data-id="${item.company_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.company_id}" class="button pop-button delete">删除</button></td>
             </tr>
      `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })
}

function bindEvent() {

    //弹窗关闭
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });


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
    $('body').on('click','.actions #company_add',function () {
        companyModal(0,'add');
    })

    $('body').on('click','#table_company_table .pop-button',function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){
            viewCompany(id,'view');
        }else if($(this).hasClass('edit')){
            viewCompany(id,'edit');
        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteCompany(id);
            });
        }
    })

    $('body').on('click','.addCompany .submit:not(".is-disabled")',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $('#addCompany_from'),
                id= parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}

            if(nameCorrect&&codeCorrect){
                var name = parentForm.find('#name').val().trim(),
                    code =  parentForm.find('#code').val().trim(),
                    abbreviation = parentForm.find('#abbreviation').val().trim(),
                    country_id = parentForm.find('#country_id').val(),
                    phone = parentForm.find('#phone').val().trim(),
                    fax= parentForm.find('#fax').val().trim(),
                    address = parentForm.find('#address').val().trim(),
                    email = parentForm.find('#email').val().trim(),
                    web = parentForm.find('#web').val().trim(),
                    tax_no = parentForm.find('#tax_no').val().trim(),
                    ceo = parentForm.find('#ceo').val().trim(),
                    register = parentForm.find('#register').val().trim(),
                    desc = parentForm.find('#desc').val().trim();

                $(this).hasClass('edit') ?
                    editCompany({
                        company_id:id,
                        name: name,
                        abbreviation: abbreviation,
                        country_id: country_id,
                        phone: phone,
                        fax: fax,
                        address: address,
                        email: email,
                        web: web,
                        tax_no: tax_no,
                        ceo: ceo,
                        register: register,
                        desc: desc,
                        _token: TOKEN
                    }):
                    addCompany({
                        name: name,
                        code:code,
                        abbreviation: abbreviation,
                        country_id: country_id,
                        phone: phone,
                        fax: fax,
                        address: address,
                        email: email,
                        web: web,
                        tax_no: tax_no,
                        ceo: ceo,
                        register: register,
                        desc: desc,
                        _token: TOKEN
                    })
            }
        }
    })
    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addCompany_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });
}

function addCompany(data) {
    AjaxClient.post({
        url: URLS['company'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getCompany();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.addCompany .submit').removeClass('is-disabled');
        }
    },this)
}

function viewCompany(id,flag) {
    AjaxClient.get({
        url: URLS['company'].show+"?company_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            companyModal(id,flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
            if(rsp.code==404){
                getCompany();
            }
        }
    },this);
}

function editCompany(data){
    AjaxClient.post({
        url: URLS['company'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getCompany();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addCompany_from').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
function deleteCompany(id) {
    AjaxClient.get({
        url: URLS['company'].delete+"?company_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getCompany();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}

function companyModal(ids,flag,data) {
    var labelWidth=120,btnShow='btnShow',readonly='',noEdit='',title='查看公司',
        {code='',company_name='',abbreviation='',country_id='',country_name='',phone='',fax='',address='',web='',email='',desc=''}={};

    if(data){
        ({code='',company_name='',abbreviation='',country_id='',country_name='',phone='',fax='',address='',web='',email='',desc=''}=data);
    }

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑公司',noEdit='readonly="readonly"'):title='添加公司');

    layerModal=layer.open({
        type: 1,
        title:title,
        offset: '50px',
        area: '950px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content: `<form class="addCompany formModal formMateriel" id="addCompany_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="company_add_left">
                        <div class="el-form-item" >
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">公司编码<span class="mustItem">*</span></label>
                                <input type="text" id="code" ${readonly} ${noEdit} class="el-input"  maxlength="20" value="${code}" placeholder="编码由1-20位字母数字下划线中划线组成" >
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item" >
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">公司名称<span class="mustItem">*</span></label>
                                <input type="text" id="name" ${readonly} class="el-input" placeholder="公司名称" value="${company_name}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">缩写</label>
                                <input type="text" id="abbreviation" ${readonly} class="el-input" placeholder="请输入缩写" value="${abbreviation}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item country">
                            <div class="el-form-item-div">
                                 <label class="el-form-item-label" style="width: ${labelWidth}px;">国家<span class="mustItem">*</span></label>
                                 ${flag == 'view' ? `<input type="text" id="country_name" readonly class="el-input" value="${country_name}">` :
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
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">电话</label>
                                <input type="text" id="phone" ${readonly} class="el-input" placeholder="区号+号码" value="${phone}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">传真</label>
                                <input type="text" id="fax" ${readonly} class="el-input" placeholder="请输入传真" value="${fax}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">地址</label>
                                <textarea type="textarea" maxlength="500" ${readonly} id="address" rows="5" class="el-textarea" placeholder="${flag=='view'?'':'请输入地址'}">${address}</textarea>
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                    </div>
                    <div class="company_add_right">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">网站</label>
                                <input type="text" id="web" ${readonly} class="el-input" placeholder="请输入网站" value="${web}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱</label>
                                <input type="text" id="email" ${readonly} class="el-input" placeholder="请输入邮箱" value="${email}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">税号</label>
                                <input type="text" id="tax_no" ${readonly} class="el-input" placeholder="请输入税号" value="${email}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">负责人姓名</label>
                                <input type="text" id="ceo" ${readonly} class="el-input" placeholder="请输入负责人姓名" value="${email}">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">法人姓名</label>
                                <input type="text" id="register" ${readonly} class="el-input" placeholder="请输入法人姓名" value="${email}">
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
                    </div>
</form>`,
        success:function (layero,index) {
            layerEle = layero;
            getCountryData(country_id);
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

//获取国家列表
function getCountryData(val){
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
                $('.el-form-item.country').find('.el-select-dropdown-list').html(innerHtml);

                if(val){
                    $('.el-form-item.country').find('.el-select-dropdown-item[data-id='+val+']').click()
                }
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