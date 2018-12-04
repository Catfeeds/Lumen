var layerModal,
layerLoading,
pageNo=1,
pageRoleNo=1,
roleData=[],
pageSize=20,
ajaxData={
    order: 'desc',
    sort: 'id'
},
ajaxRoleData={
    sort: 'id',
    order: 'desc'
},
modalForm='#addAdmin_from',
layerEle='',
validatorToolBox={
    checkName: function(name){
        var value=$(modalForm).find('#'+name).val().trim();
        return $(modalForm).find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"账户名不能为空"),!1):
        (!0);
    },
    checkPassword: function(name){
        var value=$(modalForm).find('#'+name).val().trim();
        return $(modalForm).find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        !Validate.checkPassword(value)?(showInvalidMessage(name,"密码由6-18位字符组成"),!1):
        (!0);
    },
    checkRealName: function(name){
        var value=$(modalForm).find('#'+name).val().trim();
        return $(modalForm).find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(!0):
        !Validate.checkRealName(value)?(showInvalidMessage(name,"姓名至少两位，或含有非法字符，或长度不正确"),!1):(!0);
    },
    checkMobile: function(name){
        var value=$(modalForm).find('#'+name).val().trim();
        return $(modalForm).find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(!0):
        !Validate.checkMobile(value)?(showInvalidMessage(name,"手机号不正确"),!1):(!0);
    },
    checkEmail: function(name){
        var value=$(modalForm).find('#'+name).val().trim();
        return $(modalForm).find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(!0):
        value.length>500?(showInvalidMessage(name,"邮箱不能超过500个字符"),!1):
        !Validate.checkEmail(value)?(showInvalidMessage(name,"邮箱不正确"),!1):(!0);
    }
},
remoteValidatorToolbox={
    remoteCheck: function(flag,name){
        var value=$(modalForm).find('#'+name).val().trim();
        if(value.length){
            getUnique(flag,name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showInvalidMessage(name,val);
                }
            });
        }
    }
},
validatorConfig = {
    name: "checkName",
    password: "checkPassword",
    cn_name: "checkRealName",
    mobile: "checkMobile",
    email: "checkEmail"
},remoteValidatorConfig={
    name: "remoteCheck",
    password: "remoteCheck",
    mobile: "remoteCheck",
    email: "remoteCheck"
};
$(function(){
    resetParam();
	getAdminList();
	bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#addAdmin_from').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addAdmin_from').find('.submit').removeClass('is-disabled');
}

function bindPagenationClick(totalData,pageSize,pageno,flag){
    $('#pagenation.'+flag).show();
    $('#pagenation.'+flag).pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageno,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageno=api.getCurrent();
            if(flag=='role'){
                pageRoleNo=pageno;
                getRoleList();
            }else{
                pageNo=pageno;
                getAdminList();
            }
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        order: 'desc',
        sort: 'id'
    };
}

//获取管理员列表
function getAdminList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
	AjaxClient.get({
		url: URLS['admin'].list+"?"+_token+urlLeft,
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
                noData('暂无数据',8);                
            }  
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,pageNo,'admin');
            }else{
                $('#pagenation.admin').html('');
            }   
		},
		fail: function(rsp){
			layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
			noData('获取物料属性列表失败，请刷新重试',8);
		},
        complete: function(){
            $('#searchRole_from .submit,#searchRole_from .reset').removeClass('is-disabled');
        }
	},this);
}

//添加管理员
function addAdmin(data){
    AjaxClient.post({
        url: URLS['admin'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getAdminList();
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            $('#addAdmin_from').find('.submit').removeClass('is-disabled');
        }
    },this);
}
//查看管理员
function getAdmin(id,flag){
    AjaxClient.get({
        url: URLS['admin'].show+"?"+_token+"&admin_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            AdminModal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取管理员详情失败');
        }
    },this);
}

//编辑管理员
function editAdmin(data){
    AjaxClient.post({
        url: URLS['admin'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getAdminList();
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            $('#addAdmin_from').find('.submit').removeClass('is-disabled');
        }
    },this);
}
//删除管理员
function deleteAdmin(id){
    AjaxClient.get({
        url: URLS['admin'].delete+"?"+_token+"&admin_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getAdminList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
            if(rsp.code==404){
                getAdminList();
            }
        }
    },this);
}
//获取角色列表
function getRoleList(){
    var urlLeft='';
    for(var param in ajaxRoleData){
        urlLeft+=`&${param}=${ajaxRoleData[param]}`;
    }
    urlLeft+="&page_no="+pageRoleNo+"&page_size=10";
    AjaxClient.get({
        url: URLS['role'].list+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            createRoleHtml(rsp);
            if(totalData>10){
                bindPagenationClick(totalData,10,pageRoleNo,'role');
            }else{
                $('#pagenation.role').html('');
            }   
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('#addRole .table_tbody').html('<tr><td colspan="3" style="text-align: center;">获取角色列表失败</td></tr>');
        },
        complete: function(){
            $('#addRole .choose-role').removeClass('is-disabled');
        }
    },this);
}

//获取选中
function getRoleSelected(id){
    AjaxClient.get({
        url: URLS['admin'].selectdRole+"?"+_token+"&admin_id="+id,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                roleData=rsp.results;
            }else{
                roleData=[];
            }
            getRoleList();
        },
        fail: function(rsp){
            console.log('获取选中的角色失败');
        }
    },this);
}

//保存角色
function saveRole(data){
    AjaxClient.post({
        url: URLS['admin'].saveRole,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            console.log('赋予角色失败');
        },
    },this)
}

//检测唯一性
function getUnique(flag,field,value,fn){
    var urlLeft='';
    if(flag==='edit'){
        var id=$('#itemId').val();
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['admin'].unique+"?"+_token+urlLeft,
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

function createRoleHtml(rsp){
    var ele=$('#addRole .table_tbody');
    ele.html('');
    if(rsp&&rsp.results&&rsp.results.length){
        rsp.results.forEach(function(item,index){
            var status=item.status==1?'<span class="el-status el-status-success">已激活</span>':
            '<span class="el-status">已停用</span>',
            checkbox=`<span class="el-checkbox_input ${roleData.indexOf(item.role_id)>-1?'is-checked':''}">
                        <span class="el-checkbox-outset"></span>
                    </span>`;
            var tr=`
                <tr class="tritem" data-id="${item.role_id}">
                    <td>${item.name}</td>
                    <td>${status}</td>
                    <td class="right">${checkbox}</td>
                </tr>
            `;
            ele.append(tr);
            ele.find('tr:last-child').data("roleData",item);
        });
    }else{
        var tr=`<tr><td colspan="3" style="text-align: center;">暂无数据</td></tr>`;
        ele.append(tr);
    }
}

//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var status=item.status==1?'<span class="el-status el-status-success">已激活</span>':
        '<span class="el-status">已关闭</span>',
        superman=item.superman==1?'<span class="superman">超级</span>':'',
        header_photo=item.header_photo?window.storage+item.header_photo:'/statics/custom/img/user_32x32.png';
        var tr=`
            <tr class="tritem" data-id="${item.admin_id}">
                <td><img width="32" height="32" src="${header_photo}" alt="" /></td>
                <td><div style="position: relative;"><span class="overflow" style="max-width: 120px;display: inline-block;" title="${item.name}">${item.name}</span>${superman}</div></td>
                <td><div class="overflow" style="max-width: 120px;" title="${tansferNull(item.cn_name)}">${tansferNull(item.cn_name)}</div></td>
                <td style="word-break: break-all;max-width: 200px;">${tansferNull(item.email)}</td>
                <td>${tansferNull(item.mobile)}</td>
                <td>${tansferNull(item.last_login_at)}</td>
                <td style="width: 55px;">${status}</td>
                <td class="right" style="width: 240px;">
                <button data-id="${item.admin_id}" class="button pop-button choose-role">分配角色</button>
                <button data-id="${item.admin_id}" class="button pop-button view">查看</button>
                <button data-id="${item.admin_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.admin_id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

//弹层
function AdminModal(flag,data){
    var height=($(window).height()-200)+'px';
    var {admin_id='',name='',password='',cn_name='',mobile='',email='',superman=0,status=1}={};
    if(data){
        ({admin_id='',name='',password='',cn_name='',mobile='',email='',superman=0,status=1}=data);
    }
    var labelWidth=90,
        btnShow='btnShow',
        title='查看管理员',
        statusYes='',
        statusNo='',
        supermanYes='',
        supermanNo='',
        readonly='';
    flag==='view'?(btnShow='btnHide'):(flag==='add'?title='添加管理员':(title='编辑管理员',readonly='readonly="readonly"'));
    status==1?statusYes='is-radio-checked':statusNo='is-radio-checked';
    superman==1?supermanYes='is-radio-checked':supermanNo='is-radio-checked';
    layerModal=layer.open({
      type: 1, 
      title: title,
      offset: '100px',
      area: '500px',
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: false,
      content: `<form id="addAdmin_from" class="formModal formMateriel" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${admin_id}">
                <div class="modal-wrap" style="max-height: ${height}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">账户名<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} autocomplete="off" class="el-input" placeholder="由2-50位字母下划线数字组成,字母开头" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item" style="display: ${flag=='add'?'':'none'}">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">密码<span class="mustItem">*</span></label>
                            <input type="text" id="password" autocomplete="off" class="el-input" placeholder="6-18位任意字符" value="${password}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">真实姓名</label>
                            <input type="text" id="cn_name" class="el-input" placeholder="${flag=='view'?'':'2-15位'}" value="${cn_name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">手机号码</label>
                            <input type="text" id="mobile" class="el-input" placeholder="${flag=='view'?'':'请输入手机号码'}" value="${tansferNull(mobile)}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱</label>
                            <input type="text" id="email" class="el-input" placeholder="${flag=='view'?'':'请输入邮箱'}" value="${tansferNull(email)}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>  
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">详细地址</label>
                            <input type="text" id="address" class="el-input" placeholder="${flag=='view'?'':'请输入详细地址'}" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">超级管理员<span class="mustItem">*</span></label>
                            <div class="el-radio-group">
                                <label class="el-radio">
                                    <span class="el-radio-input ${supermanYes}">
                                        <span class="el-radio-inner"></span>
                                        <input class="superman yes" type="hidden" value="1">
                                    </span>
                                    <span class="el-radio-label">是</span>
                                </label>
                                <label class="el-radio">
                                    <span class="el-radio-input ${supermanNo}">
                                        <span class="el-radio-inner"></span>
                                        <input class="superman no" type="hidden" value="0">
                                    </span>
                                    <span class="el-radio-label">否</span>
                                </label>
                            </div>    
                        </div>
                        <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">状态<span class="mustItem">*</span></label>
                            <div class="el-radio-group">
                                <label class="el-radio">
                                    <span class="el-radio-input ${statusYes}">
                                        <span class="el-radio-inner"></span>
                                        <input class="status yes" type="hidden" value="1">
                                    </span>
                                    <span class="el-radio-label">激活</span>
                                </label>
                                <label class="el-radio">
                                    <span class="el-radio-input ${statusNo}">
                                        <span class="el-radio-inner"></span>
                                        <input class="status no" type="hidden" value="0">
                                    </span>
                                    <span class="el-radio-label">停用</span>
                                </label>
                            </div>    
                        </div>
                        <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
                    </div>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button el-button--primary submit add">确定</button>
                    </div>
                </div>
            </form>` ,
        success: function(layero,index){
            layerEle=layero;
            if(flag=='view'){
                $(layero).find('.el-input').attr('readonly','readonly');
                $(layero).find('.el-radio-input').addClass('noedit');
            }
        },
        end: function(){
            layerEle='';
            $('.uniquetable tr.active').removeClass('active');
        }
    }); 
}

function addRoleModal(id) {
    var tableHeight=$(window).height()-280;
    layerModal = layer.open({
        type: 1,
        title: '选择角色',
        offset: '100px',
        area: '650px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addRole formModal chooseModal" id="addRole">
        <input type="hidden" id="adminId" value="${id}">
           <ul class="query-item">
                <li>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">角色名称</label>
                            <input type="text" id="name" class="el-input" placeholder="请输入角色名称" value="">
                        </div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">状态</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="status" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                        <li data-id="1" class=" el-select-dropdown-item"><span>已激活</span></li>
                                        <li data-id="0" class=" el-select-dropdown-item"><span>已停用</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item" style="width: 10%;">
                        <div class="el-form-item-div btn-group">
                            <button style="margin-top: 5px;" type="button" class="el-button choose-search choose-role">搜索</button>
                        </div>
                    </div>
                </li>
            </ul>
           <div class="table_page">
                <div id="pagenation" class="pagenation role"></div>
                <div class="table-wrap" style="max-height: ${tableHeight}px;overflow-y: auto;">
                    <table class="sticky uniquetable commontable">
                      <thead>
                        <tr>
                          <th>角色名称</th>
                          <th>角色状态</th>
                          <th class="right">选择</th>
                        </tr>
                      </thead>
                      <tbody class="table_tbody">
                      </tbody>
                    </table>
                </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
            </div>
          </div>       
    </form>`,
    success: function(layero, index){
        getLayerSelectPosition($(layero));
        getRoleSelected(id);
    },
    cancel: function(layero, index){//右上角关闭按钮
    },
    end: function(){
        pageRoleNo=1;
        ajaxRoleData={
            sort: 'id',
            order: 'desc'
        };
        roleData=[];
    }

    })
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
        getAdminList();
    });
    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
	});

	$('body').on('click','.el-select-dropdown-item',function(e){
		e.stopPropagation();
		$(this).parent().find('.el-select-dropdown-item').removeClass('selected');
		$(this).addClass('selected');
		var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val($(this).attr('data-id'));
		$(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
	});

	//搜索管理员
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
    	e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                name: parentForm.find('#name').val().trim(),
                cn_name: parentForm.find('#cn_name').val().trim(),
                status: parentForm.find('#status').val().trim(),
                order: 'desc',
                sort: 'id'
            }
            getAdminList();
        }  
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#name').val('');
        parentForm.find('#cn_name').val('');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getAdminList();
    });

    //checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        $(this).toggleClass('is-checked');
        var data=$(this).parents('.tritem').data('roleData'),
        index=roleData.indexOf(data.role_id);
        if($(this).hasClass('is-checked')){
            if(index==-1){
                roleData.push(data.role_id);
            }
        }else{
            roleData.splice(index,1);
        }
    });

    $('body').on('click','.pop-button.choose-role',function(){
        var id=$(this).attr('data-id');
        addRoleModal(id);
    });

    //搜索角色
    $('body').on('click','#addRole .choose-role',function () {
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var ele=$('#addRole');
            ajaxRoleData.name=ele.find('#name').val().trim();
            ajaxRoleData.status=ele.find('#status').val();
            pageRoleNo=1;
            getRoleList();
        }
    });

    //选择角色
    $('body').on('click','#addRole .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var roleids=roleData.length?roleData:'';
            var data={
                admin_id: $('#adminId').val(),
                role_ids: roleids,
                _token: TOKEN
            }
            saveRole(data);
        }
    });

    //添加
    $('body').on('click','.button_add',function(){
        AdminModal('add');
    });

    //输入框的相关事件
    $('body').on('focus','.formMateriel .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
    }).on('blur','.formMateriel .el-input:not([readonly])',function(){
        var flag=$(modalForm).attr('data-flag'),
        name=$(this).attr("id");
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name);
    });

    //单选按钮点击事件
    $('body').on('click','.el-radio-input:not(.noedit)',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');     
    });

    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        getAdmin($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        $(this).parents('tr').addClass('active');
        getAdmin($(this).attr("data-id"),'edit');
    });
    //删除管理员
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        //判断用户是否为超级管理员，是不可删除，否可删除
        var superman=$(this).parents('tr').find('.superman').length;
        if(superman==0){
            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                deleteAdmin(id);
                layer.close(index);
            });
        }else{
            layer.confirm('超级管理员不可删除!', {icon: 2, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
            });
        }
    });
    //添加按钮点击
    $('body').on('click','.formMateriel .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addAdmin_from'),
            flag=parentForm.attr('data-flag');
            var correct=1;
            for (var type in validatorConfig) {
                if(flag=='edit'&&(type=='name'||type=='password')){
                    correct=1;
                }else{
                    correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                }
                if(!correct){
                    break;
                }
            }
            if (correct) {
                $(this).addClass('is-disabled');
                var id=parentForm.find('#itemId').val(),
                 name= parentForm.find('#name').val().trim(),
                 password = parentForm.find('#password').val(),
                 cn_name = parentForm.find('#cn_name').val(),
                 mobile = parentForm.find('#mobile').val(),
                 email = parentForm.find('#email').val(),
                 superman = parentForm.find('.is-radio-checked .superman').val(),
                 status = parentForm.find('.is-radio-checked .status').val();
                flag=='add'?
                addAdmin({
                    name: name,
                    password: password,
                    cn_name: cn_name,
                    mobile: mobile,
                    email: email,
                    superman: superman,
                    status: status,
                    _token: TOKEN
                }):
                editAdmin({
                    cn_name: cn_name,
                    mobile: mobile,
                    email: email,
                    superman: superman,
                    status: status,
                    _token: TOKEN,
                    admin_id: id
                })

            }
        }

        })
}