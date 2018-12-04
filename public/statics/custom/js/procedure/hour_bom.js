var layerLoading,layerModal,
pageNo=1,
pageSize=20,
ajaxData={},
editurl='';
$(function () {
    resetParam();

    setAjaxData();
    getBOMGroup();
    getBOMProcess();
    bindEvent();
    $('#item_material_id').autocomplete({
        url: URLS['bomAdd'].materialList+"?"+_token+"&page_no=1&page_size=10"
    });
    $('#replace_material_id').autocomplete({
        url: URLS['bomAdd'].materialList+"?"+_token+"&page_no=1&page_size=10"
    });


    var serech = localStorage.getItem('param');
    if(serech){
        var arr1 = serech.split('&'),param01 = {};
        arr1.forEach(function (item) {
            var arr = item.split('=');
            param01[arr[0]]  =  arr[1];
        });
        if(param01.code){
            $('#searchForm').find('#code').val(param01.code);
        }
        if(param01.name){
            $('#searchForm').find('#name').val(param01.name);
        }
        if(param01.creator_name){
            $('#searchForm').find('#creator_name').val(param01.creator_name);
        }
        if(param01.bom_group_id){
            $('#searchForm').find('#bom_group_id').val(param01.bom_group_id);
        }
        if(param01.item_material_id){
            AjaxClient.get({
                url:URLS['bomAdd'].materialShow+"?"+_token+"&material_id="+param01.item_material_id,
                dataType:'json',
                success:function(rsp){
                    $('#searchForm').find('#item_material_id').val(rsp.results.name).data('inputItem',rsp.results).blur();

                },
                fail:function(rsp){
                }
            },this)
        }
        if(param01.replace_material_id){
            AjaxClient.get({
                url:URLS['bomAdd'].materialShow+"?"+_token+"&material_id="+param01.replace_material_id,
                dataType:'json',
                success:function(rsp){
                    $('#searchForm').find('#replace_material_id').val(rsp.results.name).data('inputItem',rsp.results).blur();

                },
                fail:function(rsp){
                }
            },this)
        }
        if(param01.bom_process_id){
            AjaxClient.get({
                url:URLS['bomAdd'].practiceList+"?"+_token+"&operation_id="+param01.bom_process_id,
                dataType:'json',
                success:function(rsp){
                    console.log(rsp);
                    $('#searchForm').find('#bom_process_id').val(rsp.results.id).siblings('.el-input').val(rsp.results.name);
                },
                fail:function(rsp){
                }
            },this)
        }

        if(param01.has_workhour){
            $('#searchForm').find('#has_workhour').val(param01.has_workhour);
            if (param01.has_workhour==1){
                $('#searchForm').find('.checks_workhour .el-input').val('是');
            }else if(param01.has_workhour==0){
                $('#searchForm').find('.checks_workhour .el-input').val('否');
            }else {
                $('#searchForm').find('.checks_workhour .el-input').val('--请选择--');
            }
        }
        pageNo = param01.page_no;
        ajaxData={
            code: param01.code,
            name: param01.name,
            item_material_id: param01.item_material_id,
            replace_material_id: param01.replace_material_id,
            // condition: param01.condition,
            bom_group_id: param01.bom_group_id,
            bom_process_id: param01.bom_process_id,
            // operation_id: param01.operation_id,
            has_workhour: param01.has_workhour,
            creator_name: param01.creator_name,
            order: 'asc',
            sort: 'code'
        };

        getBomList();
    }else {
        getBomList();
    }

});

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
        }catch (e) {
            ajaxData = {};
        }
    }
}
//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        name: '',
        item_material_id: '',
        replace_material_id: '',
        condition: '',
        bom_group_id: '',
        bom_process_id: '',
        has_workhour: '',
        creator_name: '',
        order: 'asc',
        sort: 'code'
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
            getBomList();
        }
    });
}

function getBomList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    localStorage.setItem('param',urlLeft);
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['bomList'].list+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
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
            noData('获取物料清单列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchBomAttr_from .submit,#searchBomAttr_from .reset').removeClass('is-disabled');
        }
    },this);
}

//删除Bom
function deleteBOM(id,leftNum){
    AjaxClient.get({
        url: URLS['bomList'].bomDelete+"?"+_token+"&bom_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getBomList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
            if(rsp.code==404){
                pageNo? null:pageNo=1;
                getBomList();
            }
        }
    },this);
}

//获取bom分组
function getBOMGroup(){
    AjaxClient.get({
        url: URLS['bomGroup'].select+"?"+_token,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.bom_group_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.bom_group').find('.el-select-dropdown-list').html(innerhtml);
            }    
        },
        fail: function(rsp){
            console.log('获取物料清单分组失败');
        }
    },this);
}
//获取工序
function getBOMProcess(){
    AjaxClient.get({
        url:URLS['bomList'].bomProcess+"?"+_token,
        dataType:'json',
        success:function(res){
            if(res.results&&res.results.list.length){
                var lis='',innerhtml='',lisName='--请选择--';
                var serech = localStorage.getItem('param');
                var arr1 = serech.split('&'),param01 = {};
                arr1.forEach(function (item) {
                    var arr = item.split('=');
                    param01[arr[0]]  =  arr[1];
                });
                res.results.list.forEach(function(item){
                    if (param01.operation_id==item.id){
                        lisName = item.name;
                    }
                    lis+=`<li data-id="${item.id}" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                    ${lis}`;
                $('.el-form-item.bom_process').find('.el-input').val(lisName);
                $('.el-form-item.bom_process').find('.el-select-dropdown-list').html(innerhtml);
            }
        },
        fail:function(res){
            console.log('获取bom工序失败');
        }
    },this)
}
//生成列表数据
function createHtml(ele,data){
    var editurl=$('#bom_edit').val();
    data.forEach(function(item,index){
        var condition='',release_id = '';

        if(item.release_version != ''){
            condition=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
        }else{
            condition=`<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未发布</span>`;
        }
        if(item.release_version_bom_id == ""){
            release_id = item.bom_id;
        }else{
            release_id = item.release_version_bom_id;
        }
        var tr=`
            <tr class="tritem" data-id="${item.bom_id}">
                <td>${item.code}</td>
                <td>${item.bom_name}</td>
                <td>${item.bom_no}</td>
                <td>${item.qty}</td>
                <td>${tansferNull(item.bom_group_name)}</td>
                <td>${condition}</td>
                <td>${item.release_version!=''?'<span class="el-status el-status-success">'+item.release_version+'.0</span>':''}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${item.ctime}</td>
                <td class="right">
                    <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${release_id}"><button data-id="${item.bom_id}" class="button pop-button edit">编辑工时</button></a>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

function bindEvent() {
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
    //下拉框点击事件
    $('body').on('click','.el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
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
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#table_bom_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
          deleteBOM(id,num);
          layer.close(index);
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
    //搜索bom
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
            var $itemMaterial=parentForm.find('#item_material_id');
                // console.log($itemMaterial.data('inputItem'));
            var item_material_id=$itemMaterial.data('inputItem')==undefined||$itemMaterial.data('inputItem')==''?'':
            $itemMaterial.data('inputItem').name==$itemMaterial.val().trim()?$itemMaterial.data('inputItem').material_id:'';
            // console.log(item_material_id);
            var $replaceMaterial=parentForm.find('#replace_material_id');
            // console.log($replaceMaterial.data('inputItem'));
            var replace_material_id=$replaceMaterial.data('inputItem')==undefined||$replaceMaterial.data('inputItem')==''?'':
            $replaceMaterial.data('inputItem').name==$replaceMaterial.val().trim()?$replaceMaterial.data('inputItem').material_id:'';
            ajaxData={
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                name: encodeURIComponent(parentForm.find('#name').val().trim()),
                creator_name: encodeURIComponent(parentForm.find('#creator_name').val().trim()),
                item_material_id: item_material_id,
                replace_material_id: replace_material_id,
                // condition: parentForm.find('#condition').val(),
                bom_group_id: encodeURIComponent(parentForm.find('#bom_group_id').val()),
                // operation_id:parentForm.find('#bom_process_id').val(),
                bom_process_id:encodeURIComponent(parentForm.find('#bom_process_id').val()),
                has_workhour:encodeURIComponent(parentForm.find('#has_workhour').val()),
                order: 'asc',
                sort: 'code'
            }
            if(parentForm.find('#has_workhour').val()!=''){
                ajaxData.has_workhour=parentForm.find('#has_workhour').val();
            }

            getBomList();

            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));

        }  
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400);
        setTimeout(function(){
            $('#searchForm .el-item-show').css('background','transparent');
        },400);
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#name').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#item_material_id').val('').data('inputItem','').siblings('.el-select-dropdown').find('ul').empty();
        parentForm.find('#replace_material_id').val('').data('inputItem','').siblings('.el-select-dropdown').find('ul').empty();
        parentForm.find('#bom_group_id').val('').siblings('.el-input').val('--请选择--');
        // parentForm.find('#condition').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#bom_process_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#has_workhour').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getBomList();
    });
}
