var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=10,
    layerEle,
    codeCorrect=!1,
    nameCorrect=!1,
    mobileCorrect=!1,
    emailCorrect=!1,
    //负责人
    chargeData=[],
    relateDepartments=[],
    ajaxData={};
    validatorToolBox={
        checkCustomerCode: function(name){
            var value=$('#addCustomer_form').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                !Validate.checkUpperCase(value)?(showInvalidMessage(name,"编码由1-10位大写字母组成"),codeCorrect=!1,!1):
                    (codeCorrect=1,!0);
        },
        checkName: function(name){
            var value=$('#addCustomer_form').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        },
        checkMobile: function(name){
            var value=$('#addCustomer_form').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"手机号不能为空"),codeCorrect=!1,!1):
                !Validate.checkMobile(value)?(showInvalidMessage(name,"手机号码格式不正确"),codeCorrect=!1,!1):
                    (codeCorrect=1,!0);
        },
        checkEmail: function(name){
            var value=$('#addCustomer_form').find('#'+name).val().trim();
            return !Validate.checkEmail(value)?(showInvalidMessage(name,"邮箱格式不正确"),emailCorrect=!1,!1):
                    (emailCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckCustomerCode: function(flag,name,id){
            var value=$('#addCustomer_form').find('#'+name).val().trim();

            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                    console.log('已注册');
                    // console.log(id)
                }else{
                    codeCorrect=1;
                }
            });
        },
        remoteCheckName: function(flag,name,id){
            var value=$('#addCustomer_form').find('#'+name).val().trim();
        },
        remoteCheckMobile: function(flag,name,id){
            var value=$('#addCustomer_form').find('#'+name).val().trim();
        },
        remoteCheckEmail: function(flag,name,id){
            var value=$('#addCustomer_form').find('#'+name).val().trim();
        }
    },
    validatorConfig = {
        customerNum: "checkCustomerCode",
        customerName: "checkName",
        phonenum: "checkMobile",
        email: "checkEmail",
    },remoteValidatorConfig={
        customerNum: "remoteCheckCustomerCode",
        customerName: "remoteCheckName",
        phonenum: "remoteCheckMobile",
        email: "remoteCheckEmail"
    };

$(function () {
    getCustomerData();
    resetParam();
    bindEvent();
});

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        name: '',
        create_name:'',
        order: 'desc',
        sort: 'id',
    };
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
            getCustomerData();
        }
    });
}

//显示错误信息
function showInvalidMessage(name,val){
    $('#addCustomer_form').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val);
    $('#addCustomer_form').find('.submit').removeClass('is-disabled');
}

//检测唯一性
function getUnique(flag,field,value,id,fn){
    var urlLeft='';
       if(flag==='edit'){
        urlLeft=`field=code&value=${value}&id=${id}`;
        }else{
            urlLeft=`field=code&value=${value}`;
        }
    var xhr=AjaxClient.get({
        url: URLS['customer'].unique+urlLeft+"&"+_token,
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

//获取客户列表
function getCustomerData() {
    $('.table_tbody').html('');
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize+"&sort=id&order=desc";
    AjaxClient.get({
        url: URLS['customer'].list+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',9)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取仓库列表失败，请刷新重试',9);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    },this)
}

//添加客户
function addCustomer(data) {
    AjaxClient.post({
        url: URLS['customer'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('updateSuccess','添加成功');
            layer.close(layerModal);
            getCustomerData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
    },this)

}
//查看客户
function viewCustomer(id,flag){
    console.log(id);
    AjaxClient.get({
        url: URLS['customer'].show+_token+"&"+"customer_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Modal(flag,[],rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
            if(rsp.code==404){
                getCustomerData();
            }
        }
    },this);
}
//编辑客户
function editCustomer(data){
    AjaxClient.post({
        url: URLS['customer'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑成功', {icon: 1,offset: '250px',time: 1500});
            layer.close(layerModal);
            getCustomerData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addCustomer_form').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//删除客户
function deleteCustomer(id){
    AjaxClient.get({
        url: URLS['customer'].del+_token+"&"+"customer_id="+id,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getCustomerData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getCustomerData();
            }
        }
    },this);
}

//生成列表数据
function createHtml(ele,data) {
  data.forEach(function (item,index) {
      var tr = `
             <tr>
               <td>${tansferNull(item.code)}</td>
               <td>${tansferNull(item.name)}</td>
               <td>${tansferNull(item.company)}</td>
               <td>${tansferNull(item.mobile)}</td>
               <td>${tansferNull(item.create_name)}</td>
               <td>${tansferNull(item.ctime)}</td>
               <td class="right nowrap">
                <button data-id="${item.customer_id}" class="button pop-button view">查看</button>
                <button data-id="${item.customer_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.customer_id}" class="button pop-button delete">删除</button></td>
             </tr>
      `;
      ele.append(tr);
      ele.find('tr:last-child').data("trData",item);
  })
}

function bindEvent() {
    //点击弹框内部关闭
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            // $('.el-select-dropdown').slideUp();
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
            }
            if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    //排序
    $('.sort-caret').on('click',function(e){
        e.stopPropagation();
        $('.el-sort').removeClass('ascending descending');
        if($(this).hasClass('ascending')){
            $(this).parents('.el-sort').addClass('ascending')
        }else{
            $(this).parents('.el-sort').addClass('descending')
        }
        $(this).attr('data-key');
        ajaxData.order=$(this).attr('data-sort');
        ajaxData.sort=$(this).attr('data-key');
        getCustomerData();
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
            // pageNo=1;
            ajaxData={
                code: encodeURIComponent(parentForm.find('#customerNum').val().trim()),
                name: encodeURIComponent(parentForm.find('#customerName').val().trim()),
                create_name: encodeURIComponent(parentForm.find('#create_name').val().trim()),
                order: 'desc',
                sort: 'id',
            }
            getCustomerData();
        }
    });

     //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#customerNum').val('');
        parentForm.find('#customerName').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        // pageNo=1;
        resetParam();
        getCustomerData();
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

    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        if($(this).parents('.value_wrap').length&&$(this).find('.el-input-icon.is-reverse').length){
            var width=$(this).width();
            var offset=$(this).offset();
            $(this).siblings('.el-select-dropdown').width(width).css({top: 0,left: 0}).offset({top: offset.top+30,left: offset.left});
        }
        $(this).siblings('.el-select-dropdown').toggle();
    });

       //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item:not(disabled,.dept_tree_item)',function(e){
        e.stopPropagation();
        // console.log(899);
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('el-auto')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-input');
            var idval=$(this).attr('data-id');
            ele.val($(this).text()).attr('data-id',idval);
        }else{
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            var idval=$(this).attr('data-id');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val(idval);
        }
        $(this).parents('.el-select-dropdown').hide();
    });

    //添加页面
    $('body').on('click','#customer_add.button_add',function(e){
        e.stopPropagation();
        Modal();
    });

    //单选框
    $('body').on('click','.addCustomer .el-radio-input:not(.view)',function(e){
        $('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });

    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });

    //关闭弹窗
    $('body').on('click','.addCustomer .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });


    $('body').on('click','.addCustomer .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addCustomer_form');
            var code = parentForm.find('#customerNum').val().trim(),
                name = parentForm.find('#customerName').val().trim(),
                id= parentForm.find('#itemId').val(),
                company = parentForm.find('#company').val().trim(),
                position = parentForm.find('#position').val().trim(),
                mobile = parentForm.find('#phonenum').val(),
                email = parentForm.find('#email').val().trim(),
                address = parentForm.find('#address').val().trim(),
                label = parentForm.find('#lable').val().trim();
                $(this).hasClass('edit')?(
                    editCustomer({
                        customer_id: id,
                        code: code,
                        name: name,
                        position: position,
                        company: company,
                        mobile: mobile,
                        email: email,
                        address: address,
                        label: label,
                        _token: TOKEN

                    })
                ):(addCustomer({
                    code: code,
                    name: name,
                    position: position,
                    company: company,
                    mobile: mobile,
                    email: email,
                    address: address,
                    label: label,
                    _token: TOKEN
                }));

        }
    })

    //点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
          layer.close(index);
          deleteCustomer(id);
        });
    });

    //点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewCustomer($(this).attr("data-id"),'edit');
    });
    //查看
    $('.uniquetable').on('click','.button.pop-button.view',function(){
        $(this).parents('tr').addClass('active');
        viewCustomer($(this).attr("data-id"),'view');
    });

//输入框的相关事件
    $('body').on('focus','#addCustomer_form .el-input:not([readonly])',function(){
        if($(this).attr('id')=='storageCharge'){
            var that=$(this);
            createStorage(that);
            $(this).parent().siblings('.el-select-dropdown').show();
        }else{
            $(this).parents('.el-form-item').find('.errorMessage').html("");
        }
    }).on('blur','#addCustomer_form .el-input:not([readonly])',function(){
        var flag=$('#addCustomer_form').attr("data-flag"),
        name=$(this).attr("id"),
        id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name,id);
    }).on('input','#storageCharge',function(){
        var that=$(this);
        createStorage(that);
    });
}

function createStorage(that){
    var currentVal = that.val().trim();
    setTimeout(function(){
        var val=that.val().trim();
        if(currentVal==val){
            var filterData=getFilterData(val,chargeData);
            var lis='';
            if (filterData.length > 0) {
                for (var i = 0; i < filterData.length; i++) {
                    lis+=`<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].surname}${filterData[i].name}</span></li>`;
                }
            } else {
                lis='<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
            }
            $('.el-form-item.charge').find('.el-select-dropdown-list').html(lis);
            if ($('.el-form-item.charge').find('.el-select-dropdown').is(":hidden")) {
                $('.el-form-item.charge').find('.el-select-dropdown').slideDown("200");
            }
        }
    },1000);
}




function Modal(flag,dedata,data) {
    var labelWidth=100,
    {id='',code='',name='',position='',company='',mobile='',email='',address='',label='',create_id='',ctime=''}={};
    var is_packaging = 0;
    var title= '查看客户';
    var btnShow='btnShow';
    var readonly= '';
    var textareaplaceholder='';
    var none='';
    var noEdit='';
    var ralate,dehtml='';
    if(data){
        ({id='',code='',name='',position='',company='',mobile='',email='',address='',label='',create_id='',ctime=''}=data);
        console.log(data)
    }
    flag==='view'?(btnShow='btnHide',none='none',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述,最多只能输入500字符',flag==='edit'?(title='编辑客户',textareaplaceholder='',noEdit='readonly="readonly"'):title='添加客户');
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addCustomer formModal" id="addCustomer_form" data-flag="${flag}">
              <input type="hidden" id="itemId" value="${id}"> 
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">客户编码<span class="mustItem">*</span></label>
                <input type="text" id="customerNum" ${readonly} ${noEdit} class="el-input" placeholder="请输入客户编码" value="${code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">客户名称<span class="mustItem">*</span></label>
                <input type="text" id="customerName" ${readonly} class="el-input" placeholder="请输入客户名称" value="${name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">公司</label>
                <input type="text" id="company" ${readonly} class="el-input" placeholder="请输入公司名称" value="${company}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">职位</label>
                <input type="text" id="position" ${readonly} class="el-input" placeholder="请输入职位" value="${position}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">手机号<span class="mustItem">*</span></label>
                <input type="text" id="phonenum" ${readonly} class="el-input" placeholder="请输入手机号" value="${mobile}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱</label>
                <input type="text" id="email" ${readonly} class="el-input" placeholder="请输入邮箱" value="${email}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">地址</label>
                <input type="text" id="address" ${readonly} class="el-input" placeholder="请输入地址" value="${address}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">标签</label>
                <input type="text" id="lable" ${readonly} class="el-input" placeholder="请输入标签" value="${label}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
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
            // if(flag!='view'){
            //     // getDepartments(data);
            //     // getDeptSource(department_id);
            //     // getDeplants(data);
            // }
            if(chargeData){
                // var ul=selectHtml(chargeData,'id');
            }
            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },20);
        },
        end: function(){
             layerEle='';
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}

