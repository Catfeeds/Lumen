var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=10,
    layerEle,
    codeCorrect=!1,
    nameCorrect=!1,
    //负责人
    chargeData=[],
    ajaxData={};
    validatorToolBox={
        checkCode: function(name){
            // console.log(777);
            var value=$('#addSubarea_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"代码不能为空"),codeCorrect=!1,!1):
                    (codeCorrect=1,!0);
        },
        checkName: function(name){
            var value=$('#addSubarea_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckCode: function(flag,name){
            var value=$('#addSubarea_from').find('#'+name).val().trim();
            getUnique(name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    codeCorrect=1;
                }
            });
        },
        remoteCheckName: function(flag,name,id){
            var value=$('#addSubarea_from').find('#'+name).val().trim();
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
        storageNum: "checkCode",
        storageName: "checkName"
    },remoteValidatorConfig={
        storageNum: "remoteCheckCode",
        // storageName: "remoteCheckName"
    };

$(function () {
    resetParam();
    getSubareaData();
    getChargeData();
    bindEvent();
});

//重置搜索参数
function resetParam(){
    ajaxData={
        subarea_name: '',
        subarea_code:'',
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
            getSubareaData();
        }
    });
}

//显示错误信息
function showInvalidMessage(name,val){
    $('#addSubarea_from').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val);
    $('#addSubarea_from').find('.submit').removeClass('is-disabled');
}

//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';
    urlLeft=`&field=code&value=${value}`;
    var xhr=AjaxClient.get({
        url: URLS['subarea'].unique+_token+urlLeft,
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

//获取分区列表
function getSubareaData() {
    $('.table_tbody').html('');
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['subarea'].listpage+_token+urlLeft,
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
            noData('获取仓库分区列表失败，请刷新重试',9);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');    
        }
    },this)
}


//获得负责人
function getChargeData(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['subarea'].chargeShow+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);            
            chargeData=rsp.results;            
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);    
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}


//添加分区
function addStorageSubarea(data) {
    AjaxClient.post({
        url: URLS['subarea'].listAdd,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('updateSuccess','添加成功');
            layer.close(layerModal);
            getSubareaData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
           if(rsp.code==8108){
                layer.msg(rsp.message, {icon: 2,offset: '250px'});
            }
          
        },
    },this)

}


//查看分区
function viewStorageSubarea(id,flag){
    AjaxClient.get({
        url: URLS['subarea'].listShow+"id="+id+"&"+_token,
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
                getSubareaData();
            }
        }
    },this);
}

//编辑分区
function editStorageSubarea(data){
    AjaxClient.post({
        url: URLS['subarea'].listUpdate,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑成功', {icon: 1,offset: '250px',time: 1500});
            layer.close(layerModal);
            getSubareaData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addSubarea_from').removeClass('disabled').find('.submit').removeClass('is-disabled');  
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }  
        }
    },this);
}

//删除分区
function deleteStorageSubarea(id){
    AjaxClient.get({
        url: URLS['subarea'].listDel+"id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getSubareaData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getSubareaData();
            }
        }
    },this);
}


//获取仓库列表
function getDepot(data){
    AjaxClient.get({
        url: URLS['depot'].store+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var value='';
            if(data){
                value=data.depot_id;
            }
            var html=selectHtml(rsp.results,'depot_id',value);
            $('.el-form-item.depot .divwrap').html(html);
            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },200);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取部门列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

function createHtml(ele,data) {
   console.log(data);
  data.forEach(function (item,index) {
      var tr = `
             <tr>
               <td>${tansferNull(item.subarea_code)}</td>
               <td>${tansferNull(item.subarea_name)}</td>
               <td>${tansferNull(item.depot_name)}</td>
               <td>${tansferNull(item.employee_surname)}${tansferNull(item.employee_name)}</td>
               <td>${tansferNull(item.subarea_remark)}</td>
               <td class="right nowrap">
                <button data-id="${item.subarea_id}" class="button pop-button view">查看</button>
                <button data-id="${item.subarea_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.subarea_id}" class="button pop-button delete">删除</button></td>
             </tr>
      `;
      ele.append(tr);
      ele.find('tr:last-child').data("trData",item);
  })
}

//生成仓库列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==item.id){
            selectName=item.depot_name;
            selectId=item.id;
        }
        lis+=`<li data-id="${item.id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.depot_name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectName!=''?selectName:'--请选择--'}">
            <input type="hidden" class="val_id" id="${typeid}" value="${selectId!=''?selectId:''}">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
        return innerhtml;
}


function getFilterData(type,dataArr){
    return dataArr.filter(function (e) {
        var name=e.surname+e.name;
        return name.indexOf(type)>-1;
    });
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
        getSubareaData();
    });

     //搜索分区
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
                subarea_code: encodeURIComponent(parentForm.find('#storageNum').val().trim()),
                subarea_name: encodeURIComponent(parentForm.find('#storageName').val().trim()),
                order: 'desc',
                sort: 'id'
            }
            getSubareaData();
        }  
    });

     //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#storageNum').val('');
        parentForm.find('#storageName').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        // pageNo=1;
        resetParam();
        getSubareaData();
    });

    //更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#searchForm .el-item-show').css('background','#fff');
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
    $('body').on('click','.el-select-dropdown-item:not(disabled)',function(e){
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

    //添加分区页面
    $('body').on('click','#subarea_add.button_add',function(e){
        e.stopPropagation();
        Modal();
    });
    $('body').on('click','.addSubarea .el-radio-input:not(.view)',function(e){
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
    $('body').on('click','.addSubarea .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('body').on('click','.addSubarea .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addSubarea_from');
            var code = parentForm.find('#storageNum').val().trim(),
                name = parentForm.find('#storageName').val().trim(),
                id= parentForm.find('#itemId').val(),
                parentid = 0,
                sort = 0,
                depot_id = parentForm.find('#depot_id').val(),
                employee_id = parentForm.find('#storageCharge').attr('data-id'),
                remark = parentForm.find('#description').val().trim();
                // max_capacity = parentForm.find('#locateWeight').val().trim(),
                // hasshipp = parentForm.find('.is-radio-checked .is-packaging').val();
                if(code==""){
                    layer.msg('分区编码不可以为空', {icon: 2,offset: '250px'});
                }else if(code==""){
                    layer.msg('分区名称不可以为空', {icon: 2,offset: '250px'});
                }else if(name==""){
                    layer.msg('请填写分区名称', {icon: 2,offset: '250px'});
                }else if(depot_id==""&&employee_id==""){
                    layer.msg('请选择所属仓库和负责人', {icon: 2,offset: '250px'});
                }else if(depot_id==""){
                    layer.msg('请选择所属仓库', {icon: 2,offset: '250px'});
                }else if(employee_id==""){
                    layer.msg('负责人不能为空', {icon: 2,offset: '250px'});
                }
                    $(this).hasClass('edit')?(
                        editStorageSubarea({
                            id: id,
                            code: code,
                            name: name, 
                            parentid: parentid,
                            depot_id: depot_id,
                            employee_id: employee_id,
                            sort:sort,
                            remark:remark,
                            // max_capacity: max_capacity,
                            // hasshipp: hasshipp,
                            _token: TOKEN
                        })
                    ):(addStorageSubarea({
                        code: code,
                        name: name, 
                        parentid: parentid,
                        depot_id: depot_id,
                        employee_id: employee_id,
                        sort:sort,
                        remark:remark,
                        // max_capacity: max_capacity,
                        // hasshipp: hasshipp,
                        _token: TOKEN
                    }));
                }
                

        
    })


    //点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        console.log(666)
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
          layer.close(index);
          deleteStorageSubarea(id);
        });
    });

    //点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewStorageSubarea($(this).attr("data-id"),'edit');
    });
    //查看
    $('.uniquetable').on('click','.button.pop-button.view',function(){
        $(this).parents('tr').addClass('active');
        viewStorageSubarea($(this).attr("data-id"),'view');
    });

   
    //输入框的相关事件
    $('body').on('focus','#addSubarea_from .el-input:not([readonly])',function(){
        if($(this).attr('id')=='storageCharge'){
            var that=$(this);
            createStorage(that);
            $(this).parent().siblings('.el-select-dropdown').show();
        }else{
            $(this).parents('.el-form-item').find('.errorMessage').html("");
        }
    }).on('blur','#addSubarea_from .el-input:not([readonly])',function(){
        var flag=$('#addSubarea_from').attr("data-flag"),
        name=$(this).attr("id"),
        id=$('#itemId').val();
        // console.log(name);
        // console.log(888);
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
            // console.log(filterData);
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
    {subarea_id='',subarea_code='',subarea_name='',depot_name='',employee_id='',employee_surname='',employee_name='',subarea_maxcapacity='',subarea_remark=''}={};
    var title= '查看分区';
    var btnShow='btnShow';
    var readonly= '';
    var textareaplaceholder='';
    var none='';
    var noEdit='';
    if(data){
        ({subarea_id='',subarea_code='',subarea_name='',depot_name='',employee_id='',employee_surname='',employee_name='',subarea_maxcapacity='',subarea_remark=''}=data);
    }
    flag==='view'?(btnShow='btnHide',none='none',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述,最多只能输入500字符',flag==='edit'?(title='编辑分区',textareaplaceholder='',noEdit='readonly="readonly"'):title='添加分区');
    layerModal=layer.open({
        type: 1,
        title:title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content:`<form class="addSubarea formModal" id="addSubarea_from" data-flag="${flag}">
              <input type="hidden" id="itemId" value="${subarea_id}">
           <div class="el-form-item" >
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">分区编码<span class="mustItem">*</span></label>
                <input type="text" id="storageNum" ${readonly} ${noEdit} class="el-input" placeholder="请输入分区编码" value="${subarea_code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item" >
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">分区名称<span class="mustItem">*</span></label>
                <input type="text" id="storageName" ${readonly} class="el-input" placeholder="请输入分区名称" value="${subarea_name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
         

          <div class="el-form-item depot" >
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">所属仓库<span class="mustItem">*</span></label>
                <div class="divwrap" style="width: 100%;"><input type="text" id="storageDept" ${readonly} class="el-input" placeholder="请输入仓库名称" value="${depot_name}"></div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
         
         
          <div class="el-form-item charge" >
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">负责人<span class="mustItem">*</span></label>
                <div class="el-select-dropdown-wrap">
                    <input type="text" data-id="${employee_id}" id="storageCharge" ${readonly} class="el-input" autocomplete="off" placeholder="请输入负责人" value="${employee_surname}${employee_name}">
                    <div class="el-select-dropdown" style="position:absolute;">
                        <ul class="el-select-dropdown-list">
                        </ul>
                    </div>
                </div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
    
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                <textarea type="textarea" maxlength="500" id="description" ${readonly} rows="5" class="el-textarea">${subarea_remark}</textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
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
            if(flag!='view'){
                getDepot(data);
            }
            if(chargeData){
                var ul=selectHtml(chargeData,'id');
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
