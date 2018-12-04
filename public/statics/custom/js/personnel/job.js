var layerModal,
    layerLoading,
    nameCorrect=!1,
    codeCorrect=!1,
    pageNo=1,
    pageSize=50,
    pageRoleNo=1,
    shoose_arr=[],
    pageRoleSize=20,
    hasSelect=0,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                    (nameCorrect=1,!0);
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
    name:'checkName'
},
    remoteValidatorConfig = {
        name: 'remoteCheckName'
    };

$(function () {
    getJobData();
    bindEvent();
})

//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addJobModal_form').find('.submit').removeClass('is-disabled');
}

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['job'].jobUnique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            // if(rsp.results && rsp.results.exist){
            //     editUnique = true;
            // }
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');

        }
    },this);
}

function getJobData() {

    $('#table_job_table .table_tbody').html("");

    var urlLeft = "&sort=id&order=asc&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['job'].jobList+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);


            if(rsp.results && rsp.results.length){
                createTableHtml($('#table_job_table .table_tbody'),rsp.results)
            }else{
                noData('暂无数据',4);
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取岗位列表失败，请刷新重试',10);

        }
    },this)
}

function createTableHtml(ele,data) {

        data.forEach(function (item,index) {
            var tr = `<tr>
                        <td>${item.name}</td>
                        <td>${item.abbreviation}</td>
                        <td>${item.description}</td>
                        <td class="right">
                            <button data-id="${item.employee_position_id}" class="button pop-button role">关联功能</button>
                            <button data-id="${item.employee_position_id}" class="button pop-button view">查看</button>
                            <button data-id="${item.employee_position_id}" class="button pop-button edit">编辑</button>
                            <button data-id="${item.employee_position_id}" class="button pop-button delete">删除</button>
                        </td>
                      </tr>`;

            ele.append(tr)
        })
}

function bindEvent() {

    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('#job_add').on('click',function () {
        nameCorrect=!1;
        codeCorrect=!1;
        jobAddModal(0,'add');
    });

    $('body').on('click','#table_job_table .table_tbody .pop-button',function () {

        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){

            viewJobData(id,'view');
        }else if($(this).hasClass('edit')){
            nameCorrect=!1;
            codeCorrect=!1;
            viewJobData(id,'edit');

        }else if($(this).hasClass('role')){//分配角色
            shoose_arr=[];
            pageRoleNo=1;
            getRoleModal(id);
        }else{

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteJobData(id);
            });
        }

    })

    $('body').on('click','.addJobModal:not(".disabled") .submit',function () {

        var parentForm = $(this).parents('#addJobModal_form'),
            id=parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag");

        for (var type in validatorConfig){validatorToolBox[validatorConfig[type]](type,flag,id)}

        if(nameCorrect){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');

                var name = parentForm.find('#name').val().trim(),
                    abbr = parentForm.find('#abbr').val().trim(),
                    description = parentForm.find('#description').val().trim();

                $(this).hasClass('edit') ? editJobData({
                    employee_position_id:id,
                    name : name,
                    abbreviation: abbr,
                    description: description,
                    _token:TOKEN
                }) :
                    addJobData({
                        name : name,
                        abbreviation: abbr,
                        description: description,
                        _token:TOKEN
                    })
            }
        }
    })
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        var id = $(this).attr('data-id');
        $(this).toggleClass('is-checked');
        var _val = $('.role_wrap .title h5 span').text();

        if($(this).hasClass('is-checked')){
            shoose_arr.push(Number(id))
            hasSelect = Number(_val)+1;
        }else{
            var index=shoose_arr.indexOf(Number(id));
            shoose_arr.splice(index,1);
            hasSelect = Number(_val)-1;
        }
        shoose_arr = Array.from(new Set(shoose_arr)) ;
        hasSelect = shoose_arr.length;
        $('.role_wrap .title h5').html(`已选&nbsp;<span>${hasSelect}</span>&nbsp;项`);
    });
    $('body').on('click','#relationRoleModal_form .submit:not(.is-disabled)',function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#relationRoleModal_form'),
            id=parentForm.find('#itemId').val();
        saveRelationRole({
            position_id:id,
            role_ids:JSON.stringify(shoose_arr),
            _token:TOKEN
        })

    });

    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addJobModal_form').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });

    //搜索
    $('body').on('click','#searchForm:not(".is-disabled") .ability_submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var name = $("#searchForm").find("#name").val();
            pageRoleNo=1;
            getRoleData(name)
        }
    })
    $('body').on('click','#searchForm .reset',function (e) {
        e.stopPropagation();
        $("#searchForm").find("#name").val('');
        pageRoleNo=1;
        getRoleData('')
    });
}
function bindPagenationClick(totalData,pageSize)
{
    $('#nopagenation').show();
    $('#nopagenation').pagination({
        totalData:totalData,//数据总条数
        showData:pageSize,//每页显示的条数
        current: pageRoleNo,//当前第几页
        isHide: true,//总页数为0或1时隐藏分页控件
        coping:true,//是否开启首页和末页
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,//是否开启跳转到指定页数
        callback:function(api){
            pageRoleNo=api.getCurrent();//当用户点击分页按钮的时候,获取当前页,并改变变量pageNo的值
            getRoleData('');
        }
    });
}
function getRoleData(name) {
    var url = '';
    if(name){
        url = URLS['job'].roleList+'?'+_token+'&sort=id&order=desc&status=1&page_no='+pageRoleNo+'&page_size='+pageRoleSize+"&name="+name;
    }else {
        url = URLS['job'].roleList+'?'+_token+'&sort=id&order=desc&status=1&page_no='+pageRoleNo+'&page_size='+pageRoleSize;
    }
    AjaxClient.get({
        url:url,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);


            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $("#ability_list").html(_html);
            if(totalData>pageRoleSize){
                bindPagenationClick(totalData,pageRoleSize);
            }else{
                $('#pagenation.unpro').html('');
            }
            setTimeout(function () {
                showShoose();
            },200);
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp.code==404){
                getJobData();
            }
        }
    },this);
}

function createHtml(data){
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){
            var _checkbox=`<span class="el-checkbox_input role_relation" data-id="${item.role_id}">
                            <span class="el-checkbox-outset"></span>
                        </span>`;
            trs+= `<tr class="tritem" data-id="${item.role_id}">
                        <td>${_checkbox}</td>
                        <td data-id="${item.role_id}">${item.name}</td>
                        <td>${item.status==1? '激活':'停用'}</td>
                        <td>${item.created_at}</td>
                    </tr>`;
        })
    }else{
        trs='<tr><td colspan="4" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div table_page">
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchBomAttr_from">
            <div class="el-item">
                <div class="el-item-show" style="width: 400px;">
                    <div class="el-item-align" >
                        <div class="el-form-item" style="width: 100%;">
                            <div class="el-form-item-div" >
                                <label class="el-form-item-label">功能名称</label>
                                <input type="text" id="name" class="el-input" placeholder="请输入功能名称" value="">
                            </div>
                        </div>
                        
                    </div>
                </div>

                <div class="el-form-item">
                    <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                        <button type="button" class="el-button el-button--primary ability_submit">搜索</button>
                        <button type="button" class="el-button reset">重置</button>
                    </div>
                </div>
            </div>
        </form>
    </div>

            <table id="work_order_table" class="sticky uniquetable  table-bordered">
                <thead>
                    <tr>
                        <th class="thead">选择</th>
                         <th class="thead">功能名称</th>
                         <th class="thead">状态</th>
                         <th class="thead">创建时间</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
            <div id="nopagenation" class="pagenation unpro"></div>
        </div>
        `;
    return thtml;


}

function getRoleModal(id) {



    layerModal=layer.open({
        type: 1,
        title: '关联功能',
        offset: '100px',
        area: '700px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="relationRoleModal formModal formMateriel" id="relationRoleModal_form">
                        <input type="hidden" id="itemId" value="${id}">
                        <div class="role_wrap">
                            <div class="title"><h5></h5></div>
                            <div class="relation_role_wrap" style="margin-bottom: 10px" id="ability_list">
                                
                            </div>
                        </div>
                        
                     <div class="el-form-item">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
                        </div>
                     </div> 
            </form>`,
        success:function (layero,index) {
            getExitRole(id);
            setTimeout(function () {
                getRoleData('');
            }, 200);

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}
function getExitRole(id) {
    AjaxClient.get({
        url:URLS['job'].roleExit+'?'+_token+'&position_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.length){
                rsp.results.forEach(function (item) {
                    shoose_arr.push(item.role_id);
                })
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
        }
    },this);
}
function showShoose() {
    shoose_arr = Array.from(new Set(shoose_arr)) ;
    hasSelect = shoose_arr.length;
    if(shoose_arr.length){
        console.log(hasSelect);
        shoose_arr.forEach(function (item) {
            $('.relation_role_wrap').find('.tritem[data-id='+item+'] .role_relation').click();
        })
        $('.role_wrap .title h5').html(`已选&nbsp;<span>${hasSelect}</span>&nbsp;项`);
    }else{
        $('.role_wrap .title h5').html(`已选&nbsp;<span>0</span>&nbsp;项`);
    }
}
function saveRelationRole(data) {
    AjaxClient.post({
        url: URLS['job'].roleStore,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getJobData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }

    },this)
}

function addJobData(data) {

    AjaxClient.post({
        url: URLS['job'].jobAdd,
        dataType: 'json',
        data: data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getJobData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addJobModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }

        }
    },this)
}

function editJobData(data) {
    AjaxClient.post({
        url:URLS['job'].jobUpdate,
        data:data,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function () {
            layer.close(layerLoading);
            layer.close(layerModal);
            getJobData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addJobModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this)
}

function viewJobData(id,flag) {

    AjaxClient.get({
        url:URLS['job'].jobShow+'?'+_token+'&employee_position_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {

            layer.close(layerLoading);
            jobAddModal(id,flag,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp.code==404){
                getJobData();
            }
        }
    },this);

}

function deleteJobData(id) {
    AjaxClient.get({
        url: URLS['job'].jobDelete+'?'+_token+"&employee_position_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getJobData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getJobData();
            }
        }

    },this)
}

function jobAddModal(ids,flag,data) {

    var {id='',abbreviation='',name='',description=''} = {};
    if(data){
        ({id='',abbreviation='',name='',description=''}=data);
    }

    var title = '查看岗位',labelWidth=100,readonly = '',btnShow='btnShow',placeholder="请输入描述，最多能输入500个字符";

    flag=='view' ? (readonly='readonly="readonly"',btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加岗位' : (title = '编辑岗位'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="addJobModal formModal formMateriel" id="addJobModal_form" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
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
                            <input type="text" id="abbr"  ${readonly} data-name="缩写" class="el-input" placeholder="请输入缩写" value="${abbreviation}">
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

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}
