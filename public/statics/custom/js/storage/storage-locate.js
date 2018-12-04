var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=50,
    layerEle,
    codeCorrect=!1,
    nameCorrect=!1,
    chargeData=[],
    ajaxData={};
    validatorToolBox={
        checkCode: function(name){
            var value=$('#addLocateStorage_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"代码不能为空"),codeCorrect=!1,!1):
                    (codeCorrect=1,!0);
        },
        checkName: function(name){
            var value=$('#addLocateStorage_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckCode: function(flag,name,id){
            var value=$('#addLocateStorage_from').find('#'+name).val().trim();
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
            var value=$('#addLocateStorage_from').find('#'+name).val().trim();
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
        locateNum: "checkCode",
        locateName: "checkName"
    },remoteValidatorConfig={
        locateNum: "remoteCheckCode",
        // locateName: "remoteCheckName"
    };
$(function () {
    resetParam();
    getLocateBin();
    getChargeData();
    // getDepot();
    // getSubarea();
    bindEvent();
});

//重置搜索参数
function resetParam(){
    ajaxData={
        bin_code:'',
        bin_name:''    
    };
}

function bindPagenationClick(totalData,size){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:size,
        current:pageNo,
        isHide:true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNo=api.getCurrent();
            getLocateBin();
        }
    });
}

//显示错误信息
function showInvalidMessage(name,val){
    $('#addLocateStorage_from').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).show();
    $('#addLocateStorage_from').find('.submit').removeClass('is-disabled');
}

//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';
        urlLeft=`&field=code&value=${value}`;
    var xhr=AjaxClient.get({
        url: URLS['locate'].unique+_token+urlLeft,
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

//获取仓位档案列表
function getLocateBin(){
    $('.table_tbody').html('');
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['locate'].binList+_token+urlLeft,
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
            layer.msg('获取仓位档案列表失败，请刷新重试', {icon: 2,offset: '250px'});
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
        url: URLS['locate'].chargeShow+_token,
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

//添加仓位档案
function addStorageBin(data){
    AjaxClient.post({
        url:URLS['locate'].binAdd,
        data:data,
        dataType:'json',
        beforeSend:function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success:function(rsp){
            layer.close(layerLoading);
            LayerConfig('updateSuccess','添加成功');
            layer.close(layerModal);
            getLocateBin();
        },
        fail:function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败，请重试',{icon:2,offset:'250px'});
        },
    },this)
}
//查看仓位
function viewStorageBin(id,flag){
    AjaxClient.get({
        url: URLS['locate'].binShow+"id="+id+"&"+_token,
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
                getLocateBin();
            }
        }
    },this);
}
//编辑仓位
function editStorageBin(data){
    console.log(data)
    AjaxClient.post({
        url: URLS['locate'].binUpdate,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑成功', {icon: 1,offset: '250px',time: 1500});
            layer.close(layerModal);
            getLocateBin();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addLocateStorage_from').removeClass('disabled').find('.submit').removeClass('is-disabled');  
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }  
        }
    },this);
}
//删除仓位档案
function deleteStorageBin(id) {
    AjaxClient.get({
        url: URLS['locate'].binDel + "id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1, offset: '250px', time: 1500});
            getLocateBin();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2, offset: '250px', time: 1500});
            if (rsp.code == 404) {
                getLocateBin();
            }
        }
    }, this);
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

//获取分区列表
function getSubarea(id,data){
    AjaxClient.get({
        url: URLS['subarea'].list+_token+'&depot_id='+id,
        // url: URLS['subarea'].list+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var value='';
            if(data){
                value=data.subarea_id;
            }
            var html=selectHtml(rsp.results,'subarea_id',value);
            $('.el-form-item.subarea .divwrap').html(html);
            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },200);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取分区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//先选择分区
function getFirstSubarea(data){
    AjaxClient.get({
        url: URLS['subarea'].list+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var value='';
            if(data){
                value=data.subarea_id;
            }
            var html=selectHtml(rsp.results,'subarea_id',value);
            $('.el-form-item.subarea .divwrap').html(html);
            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },200);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取分区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);

}




function createHtml(ele,data) {
    console.log(data)
    data.forEach(function (item,index) {
        var tr = `
        <tr>
        <td>${tansferNull(item.bin_code)}</td>
        <td>${tansferNull(item.bin_name)}</td>
        <td>${tansferNull(item.depot_name)}</td>
        <td>${tansferNull(item.subarea_name)}</td>
        <td>${tansferNull(item.employee_surname)}${tansferNull(item.employee_name)}</td>
        <td>${tansferNull(item.bin_remark)}</td>
        <td class="right nowrap">
        <button data-id="${item.bin_id}" class="button pop-button view">查看</button>
        <button data-id="${item.bin_id}" class="button pop-button edit">编辑</button>
        <button data-id="${item.bin_id}" class="button pop-button delete">删除</button></td>
        </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);

    })
}

//生成仓库、仓区列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(typeid=='subarea_id'){
            if(value!=undefined&&value==item.subarea_id){
                selectName=item.subarea_name;
                selectId=item.subarea_id;
            }
            lis+=`<li data-id="${item.subarea_id}" class="el-select-dropdown-item ${value!=undefined&&item.subarea_id==value?'selected':''}" class=" el-select-dropdown-item">${item.subarea_name}</li>`;
        }else{
            if(value!=undefined&&value==item.id){
                selectName=item.depot_name;
                // selectId=item.depot_id;
                selectId=item.id;
            }
            lis+=`<li data-id="${item.id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.depot_name}</li>`;
        }
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectName!=''?selectName:'--请选择--'}" style="width:100%">
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


//负责人
function getFilterData(type,dataArr){
    return dataArr.filter(function (e) {
        var name=e.surname+e.name;
        return name.indexOf(type)>-1;
    });
}

function bindEvent() {
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
        getLocateBin();
    });
    //搜索仓区
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
                bin_code: encodeURIComponent(parentForm.find('#storageNum').val().trim()),
                bin_name: encodeURIComponent(parentForm.find('#storageName').val().trim()),
                parentid: 0,
                order: 'desc',
                sort: 'id'
            }
            getLocateBin();
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
        getLocateBin();       
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
            // if(ele.find('.val_id').attr('id')=='depot_id'){
            //     if(idval!=''||idval!=0){
            //         getSubarea(idval);
            //     }
            // }
            if(ele.find('.val_id').attr('id')=='depot_id'){
                if(idval!=''||idval!=0){
                    getSubarea(idval);
                }else{
                    getFirstSubarea(data);
                }
            }

        }
        $(this).parents('.el-select-dropdown').hide();
    });

    //添加分区页面
    $('body').on('click','#storage_locate_add.button_add',function(e){
        e.stopPropagation();
        Modal();
    });
    $('body').on('click','.addLocateStorage .el-radio-input:not(.view)',function(e){
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
    $('body').on('click','.addLocateStorage .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

 $('body').on('click','.addLocateStorage .submit',function () {
    if(!$(this).hasClass('is-disabled')){
        var parentForm = $(this).parents('#addLocateStorage_from');
        var code = parentForm.find('#locateNum').val().trim(),
        name = parentForm.find('#locateName').val().trim(),
        id = parentForm.find('#itemId').val(),
        parentid = 0,
        sort = 0,
        employee_id = parentForm.find('#storageCharge').attr('data-id'),
        depot_id = parentForm.find('#depot_id').val(),
        subarea_id = parentForm.find('#subarea_id').val(),
        // is_using = parentForm.find('.is-radio-checked .is-packaging').val().trim(),
        remark = parentForm.find('#description').val().trim();
        // max_capacity = parentForm.find('#maxCapacity').val().trim();
        $(this).hasClass('edit')?(
            editStorageBin({
                id: id,
                code: code,
                name: name, 
                parentid: parentid,
                employee_id: employee_id,
                depot_id: depot_id,
                sort:sort,
                subarea_id:subarea_id,
                // is_using:is_using,
                remark:remark,
                // max_capacity: max_capacity,
                _token: TOKEN
            })
        ):(addStorageBin({
                code: code,
                name: name, 
                parentid: parentid,
                employee_id: employee_id,
                depot_id: depot_id,
                sort:sort,
                subarea_id:subarea_id,
                // is_using:is_using,
                remark:remark,
                // max_capacity: max_capacity,
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
          deleteStorageBin(id);
        });
    });


    //点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewStorageBin($(this).attr("data-id"),'edit');
    });
    //查看
    $('.uniquetable').on('click','.button.pop-button.view',function(){
        $(this).parents('tr').addClass('active');
        viewStorageBin($(this).attr("data-id"),'view');
    });


    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").hide();
    }).on('blur','.el-input:not([readonly])',function(){
        var flag=$('#addLocateStorage_from').attr("data-flag"),
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
    {bin_id='',bin_name='',bin_code='',subarea_id='',subarea_name='',employee_id='',bin_remark='',employee_surname='',employee_name='',plant_name='',depot_name=''}={};
    var is_packaging = 0;
    var title= '查看仓位';
    var btnShow='btnShow';
    var readonly= '';
    var textareaplaceholder='';
    var none='';
    var noEdit='';
     if(data){
        ({bin_id='',bin_name='',bin_code='',subarea_id='',subarea_name='',employee_id='',bin_remark='',employee_surname='',employee_name='',plant_name='',depot_name=''}=data);        
    }
    flag==='view'?(btnShow='btnHide',none='none',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述,最多只能输入500字符',flag==='edit'?(title='编辑仓位',textareaplaceholder='',noEdit='readonly="readonly"'):title='添加仓位');
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addLocateStorage formModal" id="addLocateStorage_from" data-flag="${flag}">
               <input type="hidden" id="itemId" value="${bin_id}"> 
           <div class="el-form-item" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">仓位编码<span class="mustItem">*</span></label>
                <input type="text" id="locateNum" ${readonly} ${noEdit} class="el-input" placeholder="请输入仓位编码" value="${bin_code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>

          <div class="el-form-item" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">仓位名称<span class="mustItem">*</span></label>
                <input type="text" id="locateName" ${readonly} class="el-input" placeholder="请输入仓位名称" value="${bin_name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>

           <div class="el-form-item depot" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">所属仓库<span class="mustItem">*</span></label>
                <div class="divwrap" style="width: 100%;"><input type="text" id="storageDept" ${readonly} class="el-input" placeholder="请输入仓库名称" value="${depot_name}"></div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>

          <div class="el-form-item subarea" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">分区名称</label>
                <div class="divwrap" style="width: 100%;"><input type="text" id="subarea_id" ${readonly} class="el-input" placeholder="请输入分区名称" value="${subarea_name}"></div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>

          <div class="el-form-item charge" style="margin-bottom: 12px;">
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
            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
          </div>

        
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                <textarea type="textarea" maxlength="500" id="description" ${readonly} rows="5" class="el-textarea">${bin_remark}</textarea>
            </div>
            <p class="errorMessage"></p>
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
                getFirstSubarea(data);
                // getSubarea(data);
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
