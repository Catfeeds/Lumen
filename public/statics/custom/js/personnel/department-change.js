var layerLoading,layerEle,layerModal,
    nameCorrect=!1,
    codeCorrect=!1,
    phoneCorrect=!1,
    faxCorrect=!1,
    emailCorrect=!1,
    companyId,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                    (nameCorrect=1,!0);
        },
        checkPhone: function (name) {
            var value=$('#'+name).val().trim();

            if(value == ""){

                return phoneCorrect=1 ;
            }else{
                return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(phoneCorrect=!1,!1):
                    !Validate.checkMobile(value)?(showInvalidMessage(name,"手机号不正确"),phoneCorrect=!1,!1):(phoneCorrect=1,!0);
            }

        },
        checkFax: function (name) {
            var value=$('#'+name).val().trim();

            if(value == ""){

                return faxCorrect=1 ;
            }else{
                return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(faxCorrect=!1,!1):
                    !Validate.checkFax(value)?(showInvalidMessage(name,"传真格式不正确"),faxCorrect=!1,!1):(faxCorrect=1,!0);
            }
        },
        checkEmail: function (name) {
            var value=$('#'+name).val().trim();

            if(value == ""){

                return emailCorrect=1 ;
            }else{
                return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(emailCorrect=!1,!1):
                    !Validate.checkEmail(value)?(showInvalidMessage(name,"邮箱格式不正确"),emailCorrect=!1,!1):(emailCorrect=1,!0);
            }
        }
    },
    remoteValidatorToolbox={
        remoteCheckName: function(name,flag,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){

                if(rsp.results&&rsp.results.exist){
                    nameCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    nameCorrect=1;
                }
            });
        }
    },
    validatorConfig = {
        name:'checkName',
        phone: 'checkPhone',
        fax: 'checkFax',
        email: 'checkEmail'
    },
    remoteValidatorConfig = {
        name: 'remoteCheckName'
    };
$(function () {
    getCompanySource();
    bindEvent();
})
//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addDeptModal_form').find('.submit').removeClass('is-disabled');
}

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['dept'].deptUnique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results && rsp.results.exist){
                editUnique = true;
            }
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');

        }
    },this);
}

function getCompanySource() {
    AjaxClient.get({
        url: URLS['dept'].treeList + '?' + _token,
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
          </div>`
        })

    }

    return _html;
}

function bindEvent() {
    //弹窗关闭
    $('body').on('click','#materialModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    //树形表格展开收缩
    $('body').on('click','.company_tree .expand-icon',function(e){
        if($(this).hasClass('company')){
            if($(this).hasClass('icon-minus')){
                $(this).addClass('icon-plus').removeClass('icon-minus');
                $(this).parents('.tree-folder-header').siblings('.tree-folder-content').hide();
            }else {
                $(this).addClass('icon-minus').removeClass('icon-plus');
                var id = $(this).attr('data-id'),
                    flag = $(this).attr('data-flag');
                companyId=id;
                getTreeList(id,$(this));
            }
        }else{
            if($(this).hasClass('icon-minus')){
                $(this).addClass('icon-plus').removeClass('icon-minus');
                $(this).parents('.tree-folder-header').siblings('.tree-folder-content').hide();
            }else {
                $(this).addClass('icon-minus').removeClass('icon-plus');
                $(this).parents('.tree-folder-header').siblings('.tree-folder-content').show();
            }
        }

    });
    //弹窗关闭
    $('body').on('click','.formModal .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    //树结构名称
    $('body').on('click','.company_tree .item-name',function () {
        var parent=$(this).parents('.company_tree_container');
        if($(this).hasClass('selected')){
            return false;
        }
        parent.find('.item-name').removeClass('selected');
        $(this).addClass('selected');
        var flag = $(this).attr('data-flag'),
            id= $(this).attr('data-id'),
            cid=$(this).attr('data-cid');
        if($(this).hasClass('company')){
            companyId=id;
            getCompanyDetail(id);
            getSourceDetail(id,'company');
        }else{
            getCompanyDetail(cid);
            getSourceDetail(id,'dept');
        }
    })
    
    $('body').on('click','.operation_wrap .button-define.dept_add',function (e) {
        var id = $(this).attr('data-id'),
            flag = $(this).attr('data-flag'),
            c_id=$(this).attr('data-company-id');

        if(flag=='company'){
            showDeptModal(0,'add',c_id,flag);
        }else{
            showDeptModal(0,'add',id,flag);
        }
    });
    $('body').on('click','.addDeptModal:not(".disabled") .submit',function (e) {
        e.stopPropagation();

        var parentForm = $(this).parents('#addDeptModal_form'),
            id=parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag");

        var c_pid = parentForm.find('#parentId').attr('data-com-pid'),
            p_id= parentForm.find('#parentId').attr('data-pid'),
            p_flag=parentForm.find('#parentId').attr('data-flag');

        // console.log(c_pid,p_id,p_flag);


        for (var type in validatorConfig){validatorToolBox[validatorConfig[type]](type,flag,id)}

        if(nameCorrect&&phoneCorrect&&faxCorrect&&emailCorrect){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');

                var name = parentForm.find('#name').val().trim(),
                    abbr = parentForm.find('#abbr').val().trim(),
                    description = parentForm.find('#description').val().trim(),
                    fax = parentForm.find('#fax').val().trim(),
                    parent_id,
                    company_id,
                    phone = parentForm.find('#phone').val().trim(),
                    email = parentForm.find('#email').val().trim();

                c_pid == ''? (parent_id=p_id,company_id=companyId) : (parent_id=0,company_id=c_pid);

                $(this).hasClass('edit') ? editDeptData({
                    name:name,
                    abbreviation:abbr,
                    description:description,
                    department_id:id,
                    company_id:company_id,
                    parent_id:parent_id,
                    fax:fax,
                    phone:phone,
                    email:email,
                    _token:TOKEN
                },p_flag) :
                    addDeptData({
                        name:name,
                        abbreviation:abbr,
                        description:description,
                        fax:fax,
                        company_id:company_id,
                        parent_id:parent_id,
                        phone:phone,
                        email:email,
                        _token:TOKEN
                    },p_flag)
            }
        }
    });
    $('body').on('click','.info_table .t-body .pop-button',function () {

        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id'),
            flag=$(this).attr('data-flag'),
            pid=$(this).attr('data-pid');

        if($(this).hasClass('view')){

            viewDeptData(id,'view',pid,flag);
        }else if($(this).hasClass('edit')){
            nameCorrect=!1;
            codeCorrect=!1;
            viewDeptData(id,'edit',pid,flag);
            // viewDeptData(id,'edit');

        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteDeptData(id,flag,pid);
            });
        }

    })

    //树形表格展开收缩
    $('body').on('click','.treeNode .itemIcon',function(){
        if($(this).parents('.treeNode').hasClass('collasped')){
            $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
            showChildren($(this).parents('.treeNode').attr("data-id"));
        }else{
            $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
            hideChildren($(this).parents('.treeNode').attr("data-id"));
        }
    });
    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addDeptModal_form').attr("data-flag"),
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

function getTreeList(id,_this){
    AjaxClient.get({
        url: URLS['dept'].compTreeList+'?'+_token+"&company_id="+id,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp&&rsp.results){
                _this.parents('.tree-folder-header').siblings('.tree-folder-content').show();
                _this.parents('.tree-folder-header').siblings('.tree-folder-content').html(comtreeList(rsp.results,id,'factory'))
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this)
}

function comtreeList(data,cid,flag) {

    var treeHtml="";
    if(data&&data.length){
        data.forEach(function (item) {
            treeHtml+=`<div class="tree-folder ${flag}" data-id="${item.id}">
               <div class="tree-folder-header">
               <div class="flex-item">
               <i class="icon-minus expand-icon ${flag}" data-id="${item.id}"></i>
               <div class="tree-folder-name"><p class="item-name company-tree-item ${flag}" data-cid="${cid}" data-id="${item.id}" data-flag="${flag}" data-pid="${item.parent_id}">${item.name}</p></div></div></div>
               <div class="tree-folder-content">
                  ${comtreeList(item.children,cid,flag)}
               </div>
            </div>`
        })
    }
    return treeHtml;
}

function getCompanyDetail(id) {
    AjaxClient.get({
        url: URLS['dept'].show + '?' + _token+'&company_id='+id,
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
}

function getSourceDetail(pid,flag) {
    var urlLeft='';

    flag == 'company' ? urlLeft=`&company_id=${pid}`:urlLeft=`&parent_id=${pid}`;

    AjaxClient.get({
        url: URLS['dept'].nextDept+'?'+_token+urlLeft,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var _table='';
            if(rsp.results&&rsp.results.length){

                var parent_id=rsp.results[0].parent_id;
                _table=`<h3>下级部门</h3>
                        <div class="operation_wrap">
                        <button data-id="${pid}" data-company-id="${flag=='company'? pid: ''}" data-flag="${flag}" class="button button-define dept_add">添加</button></div>
                        <div class="table-container">
                            <table class="info_table dept">
                                <thead>
                                   <tr>
                                       <th class="thead" style="text-align: left">名称</th>
                                       <th class="thead">缩写</th>
                                       <th class="thead">电话</th>
                                       <th class="thead">传真</th>
                                       <th class="thead">邮箱</th>
                                       <th class="thead">描述</th>
                                       <th class="thead"></th>
                                   </tr>
                                </thead>
                                <tbody class="t-body">
                                  ${showFactoryTable(rsp.results,parent_id,1,flag)}
                                </tbody>
                             </table>
                        </div>`;

            }else{
                _table=`<h3>下级部门</h3><div class="operation_wrap"><button data-id="${pid}" data-company-id="${flag=='company'? pid: ''}" data-flag="${flag}" class="button button-define dept_add">添加</button></div><div class="table-container">
                <table class="info_table dept">
                        <thead>
                           <tr>
                               <th class="thead left" style="text-align: left">名称</th>
                               <th class="thead">缩写</th>
                               <th class="thead">电话</th>
                               <th class="thead">传真</th>
                               <th class="thead">邮箱</th>
                               <th class="thead">描述</th>
                               <th class="thead"></th>
                           </tr>
                        </thead>
                        <tbody class="t-body">
                         
                        </tbody>
                 </table>
            </div>`;
            }
            $('.basicChildInfo').html(_table);
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this)


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
function showFactoryTable(data,parent_id,level,flag) {

    var _html = '';
    var children = getChildById(data, parent_id);
    children.forEach(function (item,index) {

            var lastClass=index===children.length-1? 'last-tag' : '';
            var hasChild = hasChilds(data, item.department_id);

            var distance,className,itemImageClass,tagI,itemcode='' ;
            hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
            tagI=`<i class="tag-i ${itemImageClass}"></i>`;

            var span=`<div style="padding-left: ${level*30}px;text-align: left"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`;

            _html+=` <tr data-id="${item.department_id}" data-pid="${item.parent_id}" class="${className}">
                           <td>${flag == 'company'? span : item.name}</td>
                           <td>${item.abbreviation}</td>
                           <td>${item.phone}</td>
                           <td>${item.fax}</td>
                           <td>${item.email}</td>
                           <td>${item.description}</td>
                           <td class="right nowrap">
                                <button data-id="${item.department_id}" data-pid="${flag=='company'? companyId: parent_id}" data-flag="${flag}" class="button pop-button view">查看</button>
                                <button data-id="${item.department_id}" data-pid="${flag=='company'? companyId: parent_id}" data-flag="${flag}" data-flag="${flag}" class="button pop-button edit">编辑</button>
                                <button data-id="${item.department_id}" data-pid="${flag=='company'? companyId: parent_id}" data-flag="${flag}" data-flag="${flag}" class="button pop-button delete">删除</button></td>
                       </tr>${showFactoryTable(data,item.department_id,level+1,flag)}`
        })

    return _html;
}

function addDeptData(data,flag) {
console.log(data,flag)
    AjaxClient.post({
        url: URLS['dept'].deptAdd,
        dataType: 'json',
        data: data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            if(flag == 'company'){
                getSourceDetail(data.company_id,flag);
            }else{
                getSourceDetail(data.parent_id,flag);
            }
            // getCompanyDetail(data.company_id);
            $('.company-tree-item.item-name.company[data-id='+data.company_id+']').parent().siblings('.expand-icon').click();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addDeptModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }

        }
    },this)
}
function deleteDeptData(id,flag,pid) {
    AjaxClient.get({
        url: URLS['dept'].deptDelete+'?'+_token+"&department_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getSourceDetail(pid,flag);
            $('.company-tree-item.item-name.company[data-id='+pid+']').parent().siblings('.expand-icon').click();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}
function viewDeptData(id,flag,pid,tips) {
    AjaxClient.get({
        url:URLS['dept'].deptShow+'?'+_token+'&department_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {

            layer.close(layerLoading);
            showDeptModal(id,flag,pid,tips,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
function editDeptData(data,flag) {
console.log(data,flag)
    AjaxClient.post({
        url:URLS['dept'].deptUpdate,
        data:data,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function () {
            layer.close(layerLoading);
            layer.close(layerModal);
            if(flag == 'company'){
                getSourceDetail(data.company_id,flag);
            }else{
                getSourceDetail(data.parent_id,flag);
            }
            $('.company-tree-item.item-name.company[data-id='+data.company_id+']').parent().siblings('.expand-icon').click();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addDeptModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this)
}
function showDeptModal(ids,flag,pid,tips,data) {

    var title = '查看部门',labelWidth=100,readonly = '',btnShow='btnShow',placeholder="请输入描述，最多能输入500个字符",noEdit = '';

    flag=='view' ? (readonly='readonly="readonly"',btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加部门' : (title = '编辑部门',noEdit='readonly="readonly"'));

    var {department_id='',abbreviation='',name='',parent_id='',description='',fax='',phone='',email=''} = {};

    if(data){
        ({department_id='',abbreviation='',name='',parent_id='',description='',fax='',phone='',email=''}=data);
    }
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '50px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: true,
        move: false,
        content: `<form class="addDeptModal formModal formMateriel" id="addDeptModal_form" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <input type="hidden" id="parentId" data-com-pid="${tips=='company'? pid: ''}" data-pid="${pid}" data-flag="${tips}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">缩写</label>
                            <input type="text" id="abbr" value="${abbreviation}" ${readonly} data-name="缩写" class="el-input" placeholder="请输入缩写">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div> 
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">电话</label>
                            <input type="text" id="phone" value="${phone}" ${readonly} data-name="电话" class="el-input" placeholder="请输入电话">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">传真</label>
                            <input type="text" id="fax" value="${fax}" ${readonly} data-name="传真" class="el-input" placeholder="请输入传真">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱</label>
                            <input type="text" id="email" value="${email}" ${readonly} data-name="邮箱" class="el-input" placeholder="请输入邮箱">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${description}</textarea>
                        </div>
                        <p class="errorMessage"></p>
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
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}