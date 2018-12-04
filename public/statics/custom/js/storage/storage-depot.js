var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=10,
    layerEle,
    codeCorrect=!1,
    nameCorrect=!1,
    phoneCorrect=!1,
    chargeCorrect=!1,
    departmentCorrect=!1,
    plantCorrect=!1,
    //负责人
    chargeData=[],
    relateDepartments=[],
    ajaxData={};
    validatorToolBox={
        checkCode: function(name){
            var value=$('#addStorage_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"代码不能为空"),codeCorrect=!1,!1):
                    (codeCorrect=1,!0);
        },
        checkName: function(name){
            var value=$('#addStorage_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        },
        checkDepartment: function(name){
            var value=$('#addStorage_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"所属部门不能为空"),nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        },
        checkCharge: function(name){
            var value=$('#addStorage_from').find('#'+name).val().trim();
            return Validate.checkNull(value)?(showInvalidMessage(name,"负责人不能为空"),chargeCorrect=!1,!1):
                (departmentCorrect=1,!0);
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
    },
    remoteValidatorToolbox={
        remoteCheckCode: function(flag,name){
            var value=$('#addStorage_from').find('#'+name).val().trim();
            getUnique(name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                    console.log('已注册');
                }else{
                    codeCorrect=1;
                }
            });
        },
        remoteCheckName: function(flag,name,id){
            var value=$('#addStorage_from').find('#'+name).val().trim();
            // getUnique(flag,name,value,id,function(rsp){
            //     if(rsp.results&&rsp.results.exist){
            //         nameCorrect=!1;
            //         var val='已注册';
            //         showInvalidMessage(name,val);
            //     }else{
            //         nameCorrect=1;
            //     }
            // });
        }
    },
    validatorConfig = {
        storageNum: "checkCode",
        storageName: "checkName",
        storageTele:'checkPhone',
        department_id:'checkDepartment'

    },remoteValidatorConfig={
        storageNum: "remoteCheckCode",
        // storageName: "remoteCheckName"
    };

$(function () {
    resetParam();
    getDepotData();
    getChargeData();
    bindEvent();
});

//重置搜索参数
function resetParam(){
    ajaxData={
        depot_code: '',
        depot_name: '',
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
            getDepotData();
        }
    });
}

//显示错误信息
function showInvalidMessage(name,val){
    $('#addStorage_from').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val);
    $('#addStorage_from').find('.submit').removeClass('is-disabled');
}

//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';
        urlLeft=`&field=code&value=${value}`;
    var xhr=AjaxClient.get({
        url: URLS['depot'].unique+_token+urlLeft,
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

//获取仓库列表
function getDepotData() {
    $('.table_tbody').html('');
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['depot'].list+_token+urlLeft,
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


//获得负责人
function getChargeData(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['depot'].chargeShow+_token,
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

//添加仓库
function addStorageDepot(data) {
    AjaxClient.post({
        url: URLS['depot'].storeAdd,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('updateSuccess','添加成功');
            layer.close(layerModal);
            getDepotData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
             if(rsp.code==8004){
                layer.msg(rsp.message, {icon: 2,offset: '250px'});
            }
            
        },
    },this)

}
//查看仓库
function viewStorageDepot(id,flag){
    AjaxClient.get({
        url: URLS['depot'].depotShow+"id="+id+"&"+_token,
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
                getDepotData();
            }
        }
    },this);
}
//编辑仓库
function editStorageDepot(data){
    AjaxClient.post({
        url: URLS['depot'].depotUpdate,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑成功', {icon: 1,offset: '250px',time: 1500});
            layer.close(layerModal);
            getDepotData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addStorage_from').removeClass('disabled').find('.submit').removeClass('is-disabled');  
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }  
        }
    },this);
}
//删除仓库
function deleteStorageDepot(id){
    AjaxClient.get({
        url: URLS['depot'].del+"id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getDepotData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getDepotData();
            }
        }
    },this);
}
// //获取部门列表
// function getDepartments(data){
//     AjaxClient.get({
//         url: URLS['depot'].departmentsSelect+_token,
//         dataType: 'json',
//         beforeSend: function(){
//             layerLoading = LayerConfig('load');
//         },
//         success: function(rsp){
//             layer.close(layerLoading);
//             var value='';
//             if(data){
//                 value=data.department_id;
//             }
//             var html=selectDeHtml(rsp.results,'department_id',value);
//             $('.el-form-item.department .divwrap').html(html);
//             setTimeout(function(){
//                 getLayerSelectPosition($(layerEle));
//             },200);
//         },
//         fail: function(rsp){
//             layer.close(layerLoading);
//             layer.msg('获取部门列表失败', {icon: 5,offset: '250px',time: 1500});
//         }
//     },this);
// }

function getDeptSource(val) {
    AjaxClient.get({
        url: URLS['depot'].departmentsSelect+_token,
        async: false,
        dataType: 'json',
        success:function (rsp) {

            if(rsp.results&&rsp.results.length){
                $('.el-select-dropdown-wrap.dept_tree').html(deptHtml(rsp.results));

                if(val){
                   $('.el-form-item.department_id').find('.el-select-dropdown-item.dept_flag[data-id='+val+']').click()
                }
            }

        },
        fail:function (rsp) {

            noData('获取部门失败，请刷新重试',4);

        }
    },this)
}

//获取厂区列表
function getDeplants(data){
    var urlLeft='&sort=id&order=asc';

    urlLeft+="&page_no="+1+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['depot'].plants+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var value='';
            if(data){
                value=data.plant_id;
            }
            var html=selectHtml(rsp.results,'plant_id',value);
            $('.el-form-item.plant .divwrap').html(html);
            setTimeout(function(){
                getLayerSelectPosition($(layerEle));
            },200);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取厂区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//生成列表数据
function createHtml(ele,data) {
  data.forEach(function (item,index) {
      var tr = `
             <tr>
               <td>${tansferNull(item.code)}</td>
               <td>${tansferNull(item.depot_name)}</td>
               <td>${tansferNull(item.department_name)}</td>
               <td>${tansferNull(item.plant_name)}</td>
               <td>${tansferNull(item.employee_surname)}${tansferNull(item.employee_name)}</td>
               <td>${tansferNull(item.phone)}</td>
               <td>${tansferNull(item.address)}</td>
               <td>${tansferNull(item.remark)}</td>
               <td class="right nowrap">
                <button data-id="${item.id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" class="button pop-button delete">删除</button></td>
             </tr>
      `;
      ele.append(tr);
      ele.find('tr:last-child').data("trData",item);
  })
}
// //生成部门列表
// function selectDeHtml(fileData,typeid,value){
//     var innerhtml,lis='',selectName='',selectId='';
//    fileData.forEach(function(item){
//         if(value!=undefined&&value==item.id){
//             selectName=item.name;
//             selectId=item.id;
//         }
//         lis+=`<li data-id="${item.id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.name}</li>`;
//     });
//     innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
//             <i class="el-input-icon el-icon el-icon-caret-top"></i>
//             <input type="text" readonly="readonly" class="el-input" value="${selectName!=''?selectName:'--请选择--'}" style="width:100%">
//             <input type="hidden" class="val_id" id="${typeid}" value="${selectId!=''?selectId:''}">
//         </div>
//         <div class="el-select-dropdown">
//             <ul class="el-select-dropdown-list">
//                 <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
//                 ${lis}
//             </ul>
//         </div></div>`;
//         return innerhtml;
// }

function deptHtml(data) {

    var _select = '',lis='',loopList='';
    if(data&&data.length){
        data.forEach(function (item) {
            loopList = deptTreeCopy(item.factory,1);
            lis+=`<li class="el-select-dropdown-item dept_tree_item company_flag" data-name="${item.company_name}" data-id="${item.company_id}" data-company-id="${item.company_id}">${item.company_name}</li>
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
                    <input type="hidden" class="val_id" id="product_id" value="">
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

        _html += `<li class="el-select-dropdown-item" data-name="${item.name}"
                        data-flag="${item.flag}"
                        data-id="${item.id}" 
                        data-company-id="${item.company_id}"
                        data-factory-id="${item.factory_id}"
                        data-workshop-id="${item.workshop_id}">${span}</li>
                  ${item.child&&item.child.length ?treeCopyHtml(item.child) : ''}`;
    });

    return _html;
}

//生成厂区列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==item.factory_id){
            selectName=item.factory_name;
            selectId=item.factory_id;
        }
        lis+=`<li data-id="${item.factory_id}" class="el-select-dropdown-item ${value!=undefined&&item.factory_id==value?'selected':''}" class=" el-select-dropdown-item">${item.factory_name}</li>`;
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
        getDepotData();
    });

    //搜索仓库
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
                depot_code: encodeURIComponent(parentForm.find('#storageNum').val().trim()),
                depot_name: encodeURIComponent(parentForm.find('#storageName').val().trim()),
                parentid: 0,
                order: 'desc',
                sort: 'id',
            }
            getDepotData();
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
        getDepotData();
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
        console.log(899);
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

    //添加仓库页面
    $('body').on('click','#storage_add.button_add',function(e){
        e.stopPropagation();
        Modal();
    });
    
    //单选框
    $('body').on('click','.addStorage .el-radio-input:not(.view)',function(e){
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
    $('body').on('click','.addStorage .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
  
    $('body').on('click','.addStorage .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addStorage_from');
            var code = parentForm.find('#storageNum').val().trim(),
                name = parentForm.find('#storageName').val().trim(),
                id= parentForm.find('#itemId').val(),
                parentid = 0,
                sort = 0,
                department_id = parentForm.find('#department_id').val(),
                employee_id = parentForm.find('#storageCharge').attr('data-id'),
                plant_id = parentForm.find('#plant_id').val(),
                remark = parentForm.find('#description').val().trim(),
                phone = parentForm.find('#storageTele').val().trim(),
                address = parentForm.find('#storageAddress').val().trim(),
                is_line_depot = parentForm.find('#is_line_depot').is(':checked')?1:0,
                sap_depot_code = parentForm.find('#sap_depot_code').val().trim();
                if(code==""){
                    layer.msg('仓库编码不能为空', {icon: 2,offset: '250px'});
                }else if(name==""){
                    layer.msg('仓库名称不能为空', {icon: 2,offset: '250px'});
                }else if(department_id==""&&plant_id==""&&employee_id==""){
                    layer.msg('请选择所属部门、厂区、负责人', {icon: 2,offset: '250px'});
                }else if(department_id==""){
                    layer.msg('请选择所属部门', {icon: 2,offset: '250px'});
                }else if(plant_id==""){
                    layer.msg('请选择所属厂区', {icon: 2,offset: '250px'});
                }
                else if(employee_id==""){
                    layer.msg('负责人不能为空', {icon: 2,offset: '250px'});
                }

                if(phoneCorrect){
                    $(this).hasClass('edit')?(
                        editStorageDepot({
                            id: id,
                            code: code,
                            name: name,
                            parentid: parentid,
                            department_id: department_id,
                            plant_id: plant_id,
                            employee_id: employee_id,
                            phone: phone,
                            sort:sort,
                            address: address,
                            remark: remark,
                            is_line_depot: is_line_depot,
                            sap_depot_code: sap_depot_code,
                            _token: TOKEN
    
                        })
                    ):(addStorageDepot({
                        code: code,
                        name: name,
                        parentid: parentid,
                        department_id: department_id,
                        plant_id: plant_id,
                        employee_id: employee_id,
                        phone: phone,
                        sort:sort,
                        address: address,
                        remark: remark,
                        is_line_depot: is_line_depot,
                        sap_depot_code: sap_depot_code,
                        _token: TOKEN
                    }));
                }
    
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
          deleteStorageDepot(id);
        });
    });

    //点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewStorageDepot($(this).attr("data-id"),'edit');
    });
    //查看
    $('.uniquetable').on('click','.button.pop-button.view',function(){
        $(this).parents('tr').addClass('active');
        viewStorageDepot($(this).attr("data-id"),'view');
    });

//输入框的相关事件
    $('body').on('focus','#addStorage_from .el-input:not([readonly])',function(){
        if($(this).attr('id')=='storageCharge'){
            var that=$(this);
            createStorage(that);
            $(this).parent().siblings('.el-select-dropdown').show();
        }else{
            $(this).parents('.el-form-item').find('.errorMessage').html("");
        }
    }).on('blur','#addStorage_from .el-input:not([readonly])',function(){
        var flag=$('#addStorage_from').attr("data-flag"),
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
    var labelWidth=150,
    {depot_id='',depot_code='',depot_name='',employee_id='',department_id='',department_name='',plant_name='',employee_surname='',employee_name='',depot_phone='',depot_address='',depot_remark='',sap_depot_code='',is_line_depot=''}={};
    var is_packaging = 0;
    var title= '查看仓库';
    var btnShow='btnShow';
    var readonly= '';
    var textareaplaceholder='';
    var none='';
    var noEdit='';
    var disable='';
    var ralate,dehtml='';
    if(data){
        ({depot_id='',depot_code='',depot_name='',department_id='',employee_id='',department_name='',plant_name='',employee_surname='',employee_name='',depot_phone='',depot_address='',depot_remark='',sap_depot_code='',is_line_depot=''}=data);
    }
    var ckecked='';
    is_line_depot==1?ckecked = 'checked="checked"':''
    flag==='view'?(btnShow='btnHide',none='none',readonly='readonly="readonly"',disable='disabled="disabled"'):(textareaplaceholder='请输入描述,最多只能输入500字符',flag==='edit'?(title='编辑仓库',textareaplaceholder='',noEdit='readonly="readonly"'):title='添加仓库');
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: ['500px','600px'],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content:`<form class="addStorage formModal" id="addStorage_from" data-flag="${flag}">
              <input type="hidden" id="itemId" value="${depot_id}"> 
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">仓库编码<span class="mustItem">*</span></label>
                <input type="text" id="storageNum" ${readonly} ${noEdit} class="el-input" placeholder="请输入仓库编码" value="${depot_code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">仓库名称<span class="mustItem">*</span></label>
                <input type="text" id="storageName" maxlength="11" ${readonly} class="el-input" placeholder="请输入仓库名称" value="${depot_name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item department_id">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">所属部门<span class="mustItem">*</span></label>
                <div class="el-select-dropdown-wrap dept_tree">
                <input type="text" id="storageName" ${readonly} class="el-input" placeholder="" value="${department_name}"> 
                </div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item plant" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">厂区<span class="mustItem">*</span></label>
                <div class="divwrap" style="width: 100%;"><input type="text" id="storageplant" ${readonly} class="el-input" placeholder="请输入厂区名称" value="${plant_name}"></div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item charge">
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
                <label class="el-form-item-label" style="width: ${labelWidth}px;">仓库电话<span class="mustItem">*</span></label>
                <input type="text" id="storageTele"  ${readonly} class="el-input" placeholder="请输入仓库电话" value="${depot_phone}">
            </div>
            <p class="errorMessage storageTeleMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">仓库地址</label>
                <input type="text" id="storageAddress" ${readonly} class="el-input" placeholder="请输入仓库地址" value="${depot_address}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">是否线边仓</label>
                <li class="tg-list-item" style="display:inline-block;width:100%;">
                    <input class="tgl tgl-flat" id="is_line_depot" type="checkbox" ${disable} ${ckecked}>
                    <label class="tgl-btn" for="is_line_depot"></label>
                 </li>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item" style="margin-bottom: 12px;">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">SAP仓库编码</label>
                <input type="text" id="sap_depot_code" ${readonly} class="el-input" placeholder="请输入SAP仓库编码" value="${sap_depot_code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                <textarea type="textarea" maxlength="500" id="description" ${readonly} rows="5" class="el-textarea">${depot_remark}</textarea>
            </div>
            <p class="info" style="padding-left: ${labelWidth}px;display: block;"></p>
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
                // getDepartments(data);
                getDeptSource(department_id);
                getDeplants(data);
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

 