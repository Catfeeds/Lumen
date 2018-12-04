var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    codeCorrect=!1,
    emailCorrect=!1,
    phoneCorrect=!1,
    nameCorrect=!1,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                    (nameCorrect=1,!0);
        },
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                    !Validate.checkPartnerCode(value)?(showInvalidMessage(name,"加工商编码只能为1-10位数字"),codeCorrect=!1,!1):
                        (codeCorrect=1,!0);
        },
        checkEmail: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(emailCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"邮箱不能为空"),emailCorrect=!1,!1):
                    !Validate.checkEmail(value)?(showInvalidMessage(name,"邮箱不符合规范"),emailCorrect=!1,!1):
                        (emailCorrect=1,!0);
        },
        checkPhone: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(phoneCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"手机不能为空"),phoneCorrect=!1,!1):
                    !Validate.checkMobile(value)?(showInvalidMessage(name,"手机填写不符合规范"),phoneCorrect=!1,!1):
                        (phoneCorrect=1,!0);
        },

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
        },
        remoteCheckCode: function(name,flag,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage($('#'+name),val);
                }else{
                    codeCorrect=1;
                }
            });
        },
    },
    validatorConfig = {
        name: "checkName",
        code: "checkCode",
        email: "checkEmail",
        phone: "checkPhone",
    },remoteValidatorConfig={
        name: "remoteCheckName",
        code: "remoteCheckCode"
    };
$(function(){
    resetParam();
    getPartner();
    bindEvent();
});
//检测唯一性
function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['partner'].unique+"?"+_token+urlLeft,
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

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addPartner_from').find('.submit').removeClass('is-disabled');
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
            getPartner();
        }
    });
}


//重置搜索参数
function resetParam(){
    ajaxData={
        name:'',
        code:'',
    };
}

//获取物料列表
function getPartner(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['partner'].pageIndex+"?"+_token+urlLeft,
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
            noData('获取日志列表失败，请刷新重试',10);
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
                <td style="width: 300px;">${item.name}</td>
                <td style="width: 300px;">${item.code}</td>
                <td style="width: 300px;">${item.ceo}</td>
                <td style="width: 300px;">${item.web}</td>
                <td style="width: 300px;">${item.email}</td>
                <td style="width: 300px;">${item.phone}</td>
                <td style="width: 300px;">${item.fax}</td>
                <td style="width: 300px;">${item.address}</td>
                <td style="width: 300px;">${item.info}</td>
                <td class="right">
                    ${item.has_admin==0?`<button data-id="${item.id}" class="button pop-button upgradeAadmin">升为管理员</button>`:''}  
                    <button data-id="${item.id}" class="button pop-button view">查看</button>
                    <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                    <button data-id="${item.id}" class="button pop-button delete">删除</button>
                </td> 
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
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
                name: encodeURIComponent(parentForm.find('#search_name').val().trim()),
                code: encodeURIComponent(parentForm.find('#search_code').val().trim()),
            };
            getPartner();
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
        parentForm.find('#searck_name').val('');
        parentForm.find('#search_code').val('');
        pageNo=1;
        resetParam();
        getPartner();
    });

    //弹窗取消
    $('body').on('click','.formPartner:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewPartner($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewPartner($(this).attr("data-id"),'edit');
    });
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deletePartner(id);
        });
    });
    $('.uniquetable').on('click','.upgradeAadmin',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将升为管理员操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            upgradeAadmin(id);
        });
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
    //输入框的相关事件
    $('body').on('focus','.formPartner:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formPartner:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addPartner_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });

    $('body').on('click','.button_add',function (e) {
        e.stopPropagation();
        modal('add');
    });
    //添加和编辑的提交
    $('body').on('click','.formPartner:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addPartner_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);};
            console.log(nameCorrect);
            console.log(codeCorrect);
            console.log(emailCorrect);
            console.log(phoneCorrect);
            if(nameCorrect&&codeCorrect&&emailCorrect&&phoneCorrect){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var name=parentForm.find('#name').val().trim(),
                    code=parentForm.find('#code').val().trim(),
                    ceo=parentForm.find('#ceo').val().trim(),
                    web=parentForm.find('#web').val().trim(),
                    email=parentForm.find('#email').val().trim(),
                    phone=parentForm.find('#phone').val().trim(),
                    fax=parentForm.find('#fax').val().trim(),
                    address=parentForm.find('#address').val().trim(),
                    info = parentForm.find('#info').val().trim();
                $(this).hasClass('edit')?(
                    editPartner({
                        id: id,
                        name: name,
                        code:code,
                        ceo: ceo,
                        web: web,
                        email: email,
                        phone: phone,
                        fax: fax,
                        address: address,
                        info: info,
                        is_customer: 0,
                        is_vendor: 0,
                        is_process: 1,
                        _token: TOKEN
                    })
                ):(
                    addPartner({
                        name: name,
                        code:code,
                        ceo: ceo,
                        web: web,
                        email: email,
                        phone: phone,
                        fax: fax,
                        address: address,
                        info: info,
                        is_customer: 0,
                        is_vendor: 0,
                        is_process: 1,
                        _token: TOKEN
                    })
                )
            }
        }
    });

}
//删除往来用户
function upgradeAadmin(id){
    AjaxClient.get({
        url: URLS['partner'].upgradeAadmin+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('您已成为管理员！', {
                icon: 1,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
                getPartner();
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getPartner();
            }
        }
    },this);
}
//删除往来用户
function deletePartner(id){
    AjaxClient.get({
        url: URLS['partner'].delete+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('删除成功！', {
                icon: 1,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
                getPartner();
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getPartner();
            }
        }
    },this);
}
//查看往来用户
function viewPartner(id,flag){
    AjaxClient.get({
        url: URLS['partner'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            modal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    },this);
}
//编辑往来用户
function editPartner(data){
    AjaxClient.post({
        url: URLS['partner'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getPartner();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
//添加往来用户
function addPartner(data){
    AjaxClient.post({
        url: URLS['partner'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getPartner();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}


function modal(flag,data) {

    var {id='',code='',name='',description='',ceo='',web='',email='',fax='',phone='',address='',info=''}={};
    if(data){
        ({id='',code='',name='',description='',ceo='',web='',email='',fax='',phone='',address='',info=''}=data);
    }
    var labelWidth=100,
        btnShow='btnShow',
        title='查看往来用户',
        textareaplaceholder='',
        readonly='',
        noEdit='';


    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加往来用户':(title='编辑往来用户',textareaplaceholder='',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formPartner" id="addPartner_from" data-flag="${flag}">
            <input type="hidden" id="itemId" value="${id}">
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                <input type="text" id="code"  ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="2-50位字母数字下划线中划线组成" value="${code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">公司名称<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入公司名称" value="${name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">CEO</label>
                <input type="text" id="ceo" ${readonly} data-name="CEO" class="el-input" placeholder="请输入CEO" value="${ceo}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">网址</label>
                <input type="text" id="web" ${readonly} data-name="网址" class="el-input" placeholder="请输入网址" value="${web}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱<span class="mustItem">*</span></label>
                <input type="text" id="email" ${readonly} data-name="邮箱" class="el-input" placeholder="请输入邮箱" value="${email}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">手机<span class="mustItem">*</span></label>
                <input type="text" id="phone" ${readonly} data-name="手机" class="el-input" placeholder="请输入手机" value="${phone}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">传真</label>
                <input type="text" id="fax" ${readonly} data-name="传真" class="el-input" placeholder="请输入传真" value="${fax}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">地址</label>
                <input type="text" id="address" ${readonly} data-name="地址" class="el-input" placeholder="请输入地址" value="${address}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">信息</label>
                <input type="text" id="info" ${readonly} data-name="信息" class="el-input" placeholder="请输入信息" value="${info}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
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

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}





