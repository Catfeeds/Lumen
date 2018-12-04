var layerModal,
    ajaxData={},
    pageNo=1,
    pageNo1=1,
    pageSize=5,
    materialData=[],
    itemChildData={},
    categoryData=[],
    selectDate=[],
    locationData=[],
    ids=[];

validatorToolBox={
    checkCusNum: function (name) {
        var value = $('.basic_info').find('#' + name).val().trim();
        return Validate.checkNull(value) ? (showInvalidMessage(name, "编码不能为空"), cusNumCorrect = !1, !1) :
            (cusNumCorrect = 1, !0);
    },
    checkCode: function(name){
        var value=$('.basic_info').find('#'+name).val().trim();
        return Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                (codeCorrect=1,!0);
    },
    checkNum: function(name){
        var value=$('.basic_info').find('#'+name).val().trim();
        return Validate.checkNull(value)?(LayerConfig('fail','数量不能为空'), numCorrect=!1,!1):
            (numCorrect=1,!0);
    },
    checkEndDate: function(name){
        var value=$('.basic_info').find('.'+name).val().trim();
        return Validate.checkNull(value)?(LayerConfig('fail','日期不能为空'), endDateCorrect=!1,!1):
            (endDateCorrect=1,!0);
    },

},
    remoteValidatorToolbox={
        remoteCheckCode: function(name,id){
            var value=$('.basic_info').find('#'+name).val();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                    console.log('已注册');
                }else{
                    codeCorrect=1;
                }
            });
        }
    },
    validatorConfig = {
        customerNum: "checkCusNum",
        code: "checkCode",
        usage_number: "checkNum",
        end_time: "checkEndDate"

    },remoteValidatorConfig={
    code: "remoteCheckCode",
};

$(function(){
    getCustomerData();
    getSelectDate(selectDate);
    bindEvent();
    id=getQueryString('id');
    if(id!=undefined){
        getSellsOrderView(id);
    }else{
        layer.msg('url链接缺少参数，请给到id参数',{
            icon: 5,
            offset: '250px'
        });
    }
});

//分页
function bindPagenationClick(totalData,pageSize){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNo,
        isHide: true,
        coping:true,
        homepage:'首页',
        endpage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNo=api.getCurrent();
            getMaterialList();
            getCustomerData();
        }
    });
}

//显示错误信息
function showInvalidMessage(name,val){
    $('.basic_info').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val);
    $('.basic_info').find('.submit').removeClass('is-disabled');
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
        url: URLS['sellsOrder'].unique+_token+urlLeft,
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

//查看销售订单
function getSellsOrderView(id){
    console.log(id=getQueryString('id'));
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['sellsOrder'].show+_token+"&sellorder_id="+id+urlLeft,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            // viewCustomer(rsp.results.custormer_id);
            $('.customer.choose-material').data('customerData',rsp.results.customer_id);
            $('#customerNum').val(rsp.results.customer_code);
            $('#customerName').val(rsp.results.customer_name);
            $('#company').val(rsp.results.company);
            $('#position').val(rsp.results.position);
            $('#phonenum').val(rsp.results.mobile);
            $('#email').val(rsp.results.email);
            $('#address').val(rsp.results.address);
            $('#lable').val(rsp.results.lable);
            $('#code').val(rsp.results.code);
            $('#remark').val(rsp.results.comment);
            createHtml( $('.storage_blockquote .item_table .t-body'),rsp.results.productList);
            // showAddItem(rsp.results.productList);
            materialData=rsp.results.productList;
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            layer.msg("获取信息失败",{icon:5,offset:'250px'});
        }
    },this);
}

//添加项
function showAddItem(data) {
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html('');
    if(data.length){
        data.forEach(function(item,index){
            var delBtn=`<button type="button" id="edit-bom-btn" data-id="" class="bom-info-button bom-info-del bom-item-del bom-del">删除</button>`,
                editBtnFlag = '',
                editStyleFlag = '';
            var tr = `
            <tr class="tr-item" data-mid="${item.material_id}">
            <td>${tansferNull(item.code)}</td>
            <td>${tansferNull(item.name)}</td>
            <td><input type="number" class="bom-ladder-input usage_number" id="usage_number" style="width: 100px;" value="${tansferNull(item.num)}"></td>
            <td>${tansferNull(item.unit_text)}</td>
            <td><input type="" class="bom-ladder-input end_time" style="width: 100px;" value="${tansferNull(item.end_time)}"></td>
            <td><input class="el-textarea bom-textarea remark"  name id cols="30" rows="3" value="${tansferNull(item.comment)}"></td>
              <td class="tdright">
              ${delBtn}
              </td>
            </tr>
            `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        });
    }else{
        var tr = `<tr>
                       <td class="nowrap" colspan="10" style="text-align: center;">暂无数据</td>
                  </tr>`;
        ele.append(tr);
    }
}


//获取客户列表
function getCustomerData() {
    $('.table_tbody').html('');
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['customer'].list+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createModalHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',9)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }

            console.log($('.customer.choose-material').data('customerData'))
            if($('.customer.choose-material').data('customerData')){
                var val = $('.customer.choose-material').data('customerData');
                $('.table_tbody').find('.tritem[data-id='+val+']').find('.el-checkbox_input').click();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取客户列表失败，请刷新重试',9);
        },
        // complete: function(){
        //     $('#searchForm .submit').removeClass('is-disabled');
        // }
    },this)
}

//获取物料分类
function getCategory(){
    AjaxClient.get({
        url: URLS['sellsOrder'].category+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                var catehtml=treeList(rsp.results,rsp.results[0].parent_id,'fake');
                $('.selectMaterial_tree .bom-tree').html(catehtml);
                setTimeout(function(){//填充数据
                    ajaxData.material_category_id!=undefined&&
                    ajaxData.material_category_id!=''?$('.selectMaterial_tree .bom-tree').
                    find('.item-name[data-post-id='+ajaxData.material_category_id+']').addClass('selected'):null;
                    $('.selectMaterial_table').find('#item_no').val(ajaxData.item_no);
                    $('.selectMaterial_table').find('#name').val(ajaxData.name);
                    if(ajaxData.material_attributes){
                        var m_attr = JSON.parse(ajaxData.material_attributes),
                            template_id = $('.selectMaterial_tree .bom-tree').find('.item-name.selected').attr('data-template-id');
                        getMaterialTemplate(template_id,m_attr);
                    }
                },100);
            }else{
                console.log('获取物料分类失败');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取物分类失败');
        }
    },this);
}


//获取物料列表
function getMaterialList(bom_material_id){
    var urlLeft='';
    urlLeft+="&page_no="+pageNo1+"&page_size=6&bom_material_id="+bom_material_id;
    $('.selectMaterial_table .table-container .table_tbody').html('');
    AjaxClient.get({
        url: URLS['sellsOrder'].bomMother+"?"+_token+urlLeft,
        data: ajaxData,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(totalData!=0&&pageNo1>Math.ceil(totalData/6)){
                pageNo1=1;
                getMaterialList(bom_material_id);
                return;
            }
            if(rsp.results&&rsp.results.length){
                createMaterialTable($('.selectMaterial_table .table_tbody'),rsp.results);
            }else{
                var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
                $('.selectMaterial_table .table-container .table_tbody').html(tr);
            }
            if(totalData>5){
                bindPagenationClick(totalData,6,pageNo1);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
            $('.selectMaterial_table .table-container .table_tbody').html(tr);
        },
        complete: function(){
            // $('#searchMAttr_from .submit').removeClass('is-disabled');
        }
    },this);
}

//获取bom树
function getBomTree(id,version) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomTree+"?"+_token+'&bom_material_id='+id+'&version='+version+'&bom_item_qty_level=1&replace=1',
        dataType: 'json',
        success: function(rsp){
            if(rsp.results){
                var ids=getIds(materialData,'material');
                var index=ids.indexOf(Number(id));
                materialData[index].children=rsp.results.children;
                if($('.matritem-[data-id='+id+']').length){
                    $('.ma-tritem[data-id='+id+']').data('matableItem').children=rsp.results.children;
                }
            }
        },
        fail: function(rsp){
            console.log('获取bom树失败');
        }
    },this);
}

//查看客户
function viewCustomer(id){
    // console.log(id);
    AjaxClient.get({
        url: URLS['customer'].show+_token+"&"+"customer_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp.results)
            $('.customer.choose-material').data('customerData',rsp.results.id)
            $('#customerNum').val(rsp.results.code);
            $('#customerName').val(rsp.results.name);
            $('#company').val(rsp.results.company);
            $('#position').val(rsp.results.position);
            $('#phonenum').val(rsp.results.mobile);
            $('#email').val(rsp.results.email);
            $('#address').val(rsp.results.address);
            $('#lable').val(rsp.results.lable);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//编辑销售单
function editSellsOrder(data){
    AjaxClient.post({
        url: URLS['sellsOrder'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','编辑成功');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('编辑入库失败');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
    },this);
}

//获取id
function getIds(data,flag){
    var ids=[];
    if(flag=='material'){
        data.forEach(function(item){
            ids.push(item.id);
        });
    }else{
        data.forEach(function(item){
            ids.push(item.customer_id);
        });
    }
    return ids;
}

//操作数组
function actArray(data,flag,id){
    var ids=getIds(data,flag);
    var index=ids.indexOf(Number(id));
    data.splice(index,1);
}

//扩展物料结构树
function treeList(data,pid,flag) {
    var bomTree = '';
    var children = getChildById(data, pid);
    children.forEach(function (item,index) {
        var hasChild = hasChilds(data, item.id);
        if(hasChild){
            bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name"><p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}">${item.name}</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id,flag)}
                   </div>
                </div> `;
        }else{
            bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}">${item.name}</p></div></div>  
                </div>`;
        }
    });
    return bomTree;
}



//获取物料模板属性
function getMaterialTemplate(id,val) {

    if(id == 0 || id==undefined){
        var ele = $('.el-form-item.template_attr .template_attr_wrap');
        ele.html('');
        return false;
    }
    AjaxClient.get({
        url: URLS['sellsOrder'].materialTempAttr+'?'+_token+'&template_id='+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.self){
                var data = rsp.results.self;
                if(data.material_attributes&&data.material_attributes.length){
                    var ele = $('.el-form-item.template_attr .template_attr_wrap');
                    ele.html(' ');
                    data.material_attributes.forEach(function (item,index) {
                        var li = `<div class="attr_item" data-id="${item.attribute_definition_id}"><span>${item.name}</span><input type="text" value=""/></div>`;
                        ele.append(li)
                    });

                    if(val){

                        setTimeout(function () {
                            val.forEach(function (item) {
                                $('.template_attr_wrap .attr_item[data-id='+item.attribute_definition_id+']').find('input').val(item.value);
                            });
                        },100)
                    }

                }else{
                    var ele = $('.el-form-item.template_attr .template_attr_wrap');
                    ele.html('')
                }
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}


//生成物料列表
function createMaterialTable(ele,data){
    ele.html('');
    // var chooseIds=[],
    // editurl=$('#sellOrder_edit').val();
    // chooseIds=getIds(materialData,'material');
    data.forEach(function(item,index){
        // checkbox=`<span class="el-checkbox_input material-check">
        //                 <span class="el-checkbox-outset"></span>
        //             </span>`,
        maName=item.name;
        // has_bom=`<td>
        //         ${item.has_bom>0?'是':'否'}
        //       </td>`;
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td class="left norwap">
                <span class="el-checkbox_input material-check">
                <span class="el-checkbox-outset"></span>
                </span>
                </td>
                <td>${item.item_no}</td>
                <td>${maName}</td>
                <td>${item.creator_name}</td>
                <td>${item.material_category_name==null?'':item.material_category_name}</td>             
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data('trData',item);
    });
}

//操作物料分类
function findLeaf(data,id,selectedId){
    var returnId=0;
    if(hasChilds(data,id)){
        var children=getChildById(data,id);
        findLeaf(data,children[0].only_id,selectedId);
    }else{
        $('.bom-tree').find('.item-name[data-post-id='+id+']').addClass('selected');
        var selectItem=categoryData.filter(function(e){
            return e.only_id==id;
        });
        console.log(selectItem);
        var mid=$('#mid').val();
        getAncestorsData(selectItem[0].id,selectItem[0].level,mid);
        console.log(selectItem[0].id);
    }
}

//选择日期
function getSelectDate(ele) {
    ele.forEach(function (item,index) {
        laydate.render({
            elem: `#${item}`,
            done: function(value, date, endDate){
                console.log(value)
            }
        });
    })
}

//添加项信息
function addinformation(){
    var array = [];
    $('.tr-item').each(function(item){
        var data=$(this).data('trData');
        console.log(data)
        var obj = {
            // id : null,
            material_id : data.material_id,
            code: data.item_no,
            num: $(this).find('.usage_number').val().trim(),
            end_time: $(this).find('.end_time').val().trim(),
            // remark: $(this).find('.remark').val().trim(),
            name: data.name,
            unit_id: data.unit_id,
            comment: $(this).find('.remark').val().trim(),
        }
        array.push(obj);
    });
    return array;
}

//清空所有数据
function resetAllData(){
    //常规信息
    var basicForm = $('#addSBasic_form');
    basicForm.find('#code').val('');
    basicForm.find('#personInCharge').val('');
    basicForm.find('#workorder_code').val('');
    basicForm.find('#indent_code').val('');
    basicForm.find('#ownerval').val('--请选择--');
    basicForm.find('#remark').val('');
    basicForm.find('.storage_table.item_table .t-body').
    html(`<tr>
      <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
    </tr>`);
    basicForm.find('.storage-add-new-item').addClass('is-disabled');
}

function createModalHtml(ele,data){
    ele.html('');
    data.forEach(function (item,index) {
        var tr = `
             <tr class="tritem" data-id="${item.customer_id}">
               <td class="left norwap">
              <span class="el-checkbox_input customer-check">
              <span class="el-checkbox-outset"></span>
              </span>
              </td>
               <td>${tansferNull(item.code)}</td>
               <td>${tansferNull(item.name)}</td>
               <td>${tansferNull(item.company)}</td>
               <td>${tansferNull(item.mobile)}</td>
               <td>${tansferNull(item.create_name)}</td>
             </tr>
      `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })
}

function createHtml(ele,data){
    ele.html('');
    if(data.length){
        data.forEach(function(item,index){
            var delBtn=`<button type="button" id="edit-bom-btn" data-id="" class="bom-info-button bom-info-del bom-item-del bom-del">删除</button>`,
                editBtnFlag = '',
                editStyleFlag = '';
            var datestr='end_date_'+index;
            var endTime=item.end_time?item.end_time.split(' ')[0]:'';
            var tr = `
            <tr class="tr-item" data-mid="${item.material_id}">
            <td>${tansferNull(item.item_no)}</td>
            <td>${tansferNull(item.name)}</td>
            <td><input type="number" class="el-input bom-ladder-input usage_number" id="usage_number" style="width: 100px;" value="${tansferNull(item.num)}"></td>
            <td>${tansferNull(item.unit_text)}</td>
            <td><input type="text" class="el-input bom-ladder-input end_time" id="${datestr}" style="width: 110px;" placeholder="请选择截止日期" value="${endTime}"></td>
            <td><input class="el-textarea bom-textarea remark"  name id cols="30" rows="3" value="${tansferNull(item.comment)}"></td>
              <td class="tdright">
              ${delBtn}
              </td>
            </tr>
            `;

            selectDate.push(datestr);
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        });
        getSelectDate(selectDate);
    }else{
        var tr = `<tr>
                       <td class="nowrap" colspan="10" style="text-align: center;">暂无数据</td>
                  </tr>`;
        ele.append(tr);
    }
}



function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    $('body').on('click','.selectMaterial_table .arrow:not(.noclick)',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $(this).find('.el-icon').removeClass('is-reverse');
            $('#searchForm .el-item-show').css('background','#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400,function(){
                that.removeClass('noclick');
            });
        }else{
            $(this).find('.el-icon').addClass('is-reverse');
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
                that.removeClass('noclick');
            });
        }
    });
    $('body').on('click','.el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //树形表格展开收缩
    $('body').on('click','.bom-tree .expand-icon',function(e){
        if($(this).hasClass('icon-minus')){
            $(this).addClass('icon-plus').removeClass('icon-minus');
            $(this).parents('.tree-folder-header').siblings('.tree-folder-content').hide();
        }else {
            $(this).addClass('icon-minus').removeClass('icon-plus');
            $(this).parents('.tree-folder-header').siblings('.tree-folder-content').show();
        }
    });
    //树中节点点击
    $('body').on('click','.item-name:not(.noedit)',function(){
        var parele=$(this).parents('.bom_tree_container');
        var material_category_id='';
        if($(this).hasClass('selected')){
            parele.find('.item-name').removeClass('selected');
            $(this).removeClass('selected');
        }else{
            parele.find('.item-name').removeClass('selected');
            $(this).addClass('selected');
            material_category_id=$(this).attr('data-post-id');
            //获取模板
            getMaterialTemplate($(this).attr('data-template-id'))
        }
        var parentForm=$('.addBomItem');

        var ele = $('.template_attr_wrap .attr_item'),_temp=[];
        if(ele.length){
            $(ele).each(function (key,value) {
                if($(value).find('input').val() != ''){
                    var obj = {
                        attribute_definition_id:$(value).attr('data-id'),
                        value:$(value).find('input').val()
                    };
                    _temp.push(obj);
                }
            })
        }

        if(!$(this).hasClass('selected')){
            template_ids = [];
            $('.template_attr_wrap').html('')
        }
        pageNo1=1;
        ajaxData={
            material_category_id: material_category_id,
            item_no: parentForm.find('#item_no').val(),
            name: parentForm.find('#name').val(),
            material_attributes:JSON.stringify(_temp),
            has_bom: parentForm.find('#has_bom').val(),
            order: 'desc',
            sort: 'id'
        };
        getMaterialList(0);

    });

    //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item:not(disabled)',function(e){
        e.stopPropagation();
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

    //单选框
    $('body').on('click','.el-radio-input:not(.view)',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });

    //添加项
    $('body').on('click','.storage-add-item:not(.is-disabled)',function () {
        var ele=$('.storage_table.item_table .t-body');
        materialData.forEach(function(item){
            var id=item.material_id,
                trele=ele.find('.tr-item[data-mid='+id+']');
            item.quantity=trele.find('.usage_number').val();
            item.remark=trele.find('.el-textarea').val();
            item.lock_status=trele.find('.el-radio-input.is-radio-checked .is-packaging').val();
        });
        addSellsItemModal();
    });

    //选择客户
    $('body').on('click','.choose-material.customer',function () {
        var mid=$(this).attr('data-mid');
        console.log(mid)
        customerChooseModal();
    });

    //删除项
    $('body').on('click','.bom-del',function(){
        var that=$(this);
        layer.confirm('将删除项?',{icon: 3,title:'提示',offset: '250px',end:function(){
        }},function(index){
            if(that.hasClass('bom-item-del')){
                var ele=that.parents('.tr-item'),
                    id=that.attr('data-id');
                $(this).remove();
                ele.remove();
                actArray(materialData,'material',id);
            }
            layer.close(index);
        });
    });
    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly])',function(){
        if($(this).attr('id')=='personInCharge'){
            var that=$(this);
            createStorage(that);
            $(this).parent().siblings('.el-select-dropdown').show();
        }else{
            $(this).parents('.el-form-item').find('.errorMessage').html("");
        }
    }).on('blur','.basic_info .el-input:not([readonly])',function(){
        var name=$(this).attr('id'),
            id=$('itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,id);
    }).on('input','#personInCharge',function(){
        var that=$(this);
        createStorage(that);
    });

    $('body').on('click','.submit.save',function () {
        for (var type in validatorConfig) {
            validatorConfig[type] && validatorToolBox[validatorConfig[type]](type);
        }
        var usageCorrect=1;
        dateCorrect=1;

        $('.tr-item').each(function (k,v) {

            if($(v).find('.usage_number').val() == ''){
                usageCorrect=!1;
                LayerConfig('fail','请填写数量');
            }else{
                usageCorrect=1;
            }

            if($(v).find('.end_time').val() == ''){
                dateCorrect=!1;
                LayerConfig('fail','请填写日期');
            }else{
                dateCorrect=1;
            }

        });
        console.log(usageCorrect)
        if (cusNumCorrect&&codeCorrect&&dateCorrect&&usageCorrect) {
        if(!$(this).hasClass('is-disabled')) {
            var parentForm = $('#addSBasic_form');

                var code = parentForm.find('#code').val().trim(),
                    sellorder_id = getQueryString('id');
                    comment = parentForm.find('#remark').val().trim(),
                    customer_id = $('.customer.choose-material').data('customerData');
                editSellsOrder({
                    sellorder_id: sellorder_id,
                    code: code,
                    comment: comment,
                    customer_id: customer_id,
                    productList: JSON.stringify(addinformation()),
                    _token: TOKEN
                });
            }
        }
    })


    //checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        if($(this).hasClass('material-check')){//物料
            // $(this).toggleClass('is-checked');
            $(this).addClass('is-checked').parents('tr').siblings('').find('.el-checkbox_input').removeClass('is-checked');
            var ids=getIds(materialData,'material');
            var data=$(this).parents('tr').data('trData');
            // console.log(data)
            if($(this).hasClass('is-checked')){
                materialData.push(data);
            }else{
                var index=ids.indexOf(Number(data.id));
                index>-1?materialData.splice(index,1):null;
            }
        }else{//客户
            $(this).addClass('is-checked').parents('tr').siblings('').find('.el-checkbox_input').removeClass('is-checked');
            var data=$(this).parents('tr').data('trData');
            if($(this).hasClass('is-checked')){
                // console.log(data)
                itemChildData=data;
            }else{
                itemChildData={};
            }
        }
    });



    //搜索按钮物料
    $('body').on('click','.choose-search',function(){
        if($(this).hasClass('choose-material')){
            var parentForm=$('.addOtherInstoreItem');
            pageNo1=1;
            ajaxData={
                item_no: parentForm.find('#material_item_no').val(),
                name: parentForm.find('#material_name').val(),
            };
            getMaterialList();
        }
    });

    //添加物料
    $('body').on('click','.submit',function () {
        if($(this).hasClass('ma-item-ok')){
            console.log(materialData);
            createHtml($('.storage_table.item_table .t-body'),materialData);//添加项
            layer.close(layerModal);
        }
    });

    //添加客户
    $('body').on('click','.submit',function () {
        if($(this).hasClass('customer-item')){
            // console.log(itemChildData)
            var ele = $('#addCustomerItem .tritem').find('.el-checkbox_input.is-checked');
            if(ele.length){
                console.log(itemChildData)
                viewCustomer(itemChildData.customer_id);
            }else{
                console.log(itemChildData)
                itemChildData={}
            }
            // console.log(materialData);
            // console.log(materialData[0].code);
            // console.log(materialData[0].customer_id)
            // viewCustomer(itemChildData.customer_id);
            layer.close(layerModal);
            // $('#customerNum').val(materialData[0].code);
            // $('#customerName').val(materialData[0].name);
            // $('#company').val(materialData[0].company);
            // $('#company').val(materialData[0].company);

        }
    });

    $('body').on('click','.tree_submit',function (){
        if($(this).hasClass('ma-item-ok')){
            var mid=$('#mid').val(),
                trele=$('.tr-item[data-mid='+mid+']'),
                trData=trele.data('trData');
            trele.find('td.plant').html(trData.plant_name);
            trele.find('td.depot').html(trData.depot_name);
            trele.find('td.subarea').html(trData.subarea_name);
            trele.find('td.bin .bom-ladder-input.bin').val(trData.bin_name);
            layer.close(layerModal);
        }
    });
}

//生成客户选择弹层
function customerChooseModal(){
    var width = 33;
    layerModal = layer.open({
        type: 1,
        title: '选择客户',
        offset: '100px',
        area: '800px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`
    <form class="addCustomerItem formModal" id="addCustomerItem">
          <div class="selectMaterial_container">
            <div class="selectMaterial_table">
               <ul class="query-item">
                    <li>
                        <div class="el-form-item" style="width: 40%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 92px;">客户编码</label>
                                <input type="text" id="customerNum"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: 40%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 90px;">客户名称</label>
                                <input type="text" id="material_name"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: 20%;">
                            <div class="el-form-item-div btn-group">
                                <button style="margin-top: 5px;" type="button" class="el-button choose-search choose-material">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
               <div class="table-container select_table_margin">
                  <div class="table-container table_page">
                        <div id="pagenation" class="pagenation" style="border: hidden;"></div>
                        <table class="bom_table">
                          <thead>
                            <tr>
                              <th class="thead">选择</th>
                              <th class="thead">客户编码</th>
                              <th class="thead">客户名称</th>
                              <th class="thead">公司</th>
                              <th class="thead">手机号</th>
                              <th class="thead">创建人</th>
                            </tr>
                          </thead>
                          <tbody class="table_tbody">
                          </tbody>
                        </table>
                  </div>
               </div>
            </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary customer-item submit">确定</button>
            </div>
          </div>       
    </form>`,
        success: function(layero, index){
            getCustomerData();
        },
        end: function(){
        }
    })
}

//添加项弹层
function addSellsItemModal(){
    var width=33;
    layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '1100px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addBomItem formModal" id="">
                      <div class="selectMaterial_container">
                        <div class="selectMaterial_tree">
                          <div class="bom_tree_container">
                              <div class="bom-tree"></div>
                          </div>
                        </div>
                        <div class="selectMaterial_table">
                          <div class="searchItem" id="searchForm">
                               <form class="searchMAttr searchModal formModal" id="searchBomAttr_from">
                                    <div class="el-item">
                                        <div class="el-item-show">
                                            <div class="el-item-align">
                                                <div class="el-form-item" style="">
                                                    <div class="el-form-item-div">
                                                        <label class="el-form-item-label" style="width: 109px;">物料编码</label>
                                                        <input type="text" id="item_no"  class="el-input" placeholder="" value="">
                                                    </div>
                                                </div>
                                                <div class="el-form-item" style="">
                                                    <div class="el-form-item-div">
                                                        <label class="el-form-item-label" style="width: 109px;">名称</label>
                                                        <input type="text" id="name"  class="el-input" placeholder="" value="">
                                                    </div>
                                                </div>
                                            </div>
                                            <ul class="el-item-hide">
                                                <li>
                                                    <div class="el-form-item template_attr" style="">
                                                        <div class="el-form-item-div">
                                                            <label class="el-form-item-label" style="width: 109px;">物料模板属性</label>
                                                            <div class="template_attr_wrap clearfix">
                                                              
                                                            </div>
                                                            <!--<input type="text" id="material_attr_id"  class="el-input" placeholder="" value="">-->
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="el-form-item">
                                            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                                <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                                <button type="button" class="el-button choose-search choose-material">搜索</button>
                                            </div>
                                        </div>
                                    </div>
                               </form>
                          </div>
                          <div class="table-container select_table_margin">
                              <div class="table-container table_page">
                                    <div id="pagenation" class="pagenation"></div>
                                    <table class="bom_table">
                                      <thead>
                                        <tr>
                                          <th class="thead">选择</th>
                                          <th class="thead">物料编码</th>
                                          <th class="thead">名称</th>
                                          <th class="thead">创建人</th>
                                          <th class="thead">物料分类</th>
                                        </tr>
                                      </thead>
                                      <tbody class="table_tbody">
                                      </tbody>
                                    </table>
                              </div>
                           </div>
                        </div>
                      </div>
                      <div class="el-form-item" style="margin-bottom: 10px;margin-right: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
                        </div>
                      </div>  
                </form>`,
        success: function(layero, index){
            getCategory();
            getMaterialList();
        },
        end: function(){
        }

    })

}



