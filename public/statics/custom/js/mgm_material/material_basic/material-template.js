var layerLoading,
pageNo=1,
pageSize=20,
ajaxData={},
treeShowFlag=1,
viewurl,editurl;
$(function(){
    viewurl=$('#template_view').val();
    editurl=$('#template_edit').val();
    resetParam();
    getMaterielTemplateTree('table');
    bindEvent();
});

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
        getMaterielTemplate();
    }
});
}

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        name: '',
        label: '',
        parent_id: '',
        status: '',
        order: 'desc',
        sort: 'id'
    };
}

//获取物料模板树列表
function getMaterielTemplateTree(flag){
    if(flag=='table'){
        $('#table_template').hide();
        $('#table_template_tree').show().find('.table_tbody').html('');
        $('#pagenation').hide();
    }
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['template'].treeList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            dtd.resolve(rsp);
            if(flag=='table'){
                if(rsp.results&&rsp.results.length){
                    var parent_id=rsp.results[0].parent_id;
                    $('#table_template_tree').find('.table_tbody').html(treeHtml(rsp.results,parent_id,flag));
                }else{
                    noData('暂无数据',5);
                }   
            }else{
                var parentlis=`<div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">s
                                <input type="hidden" class="val_id" id="parent_id" value="">
                            </div>`;
                if(rsp&&rsp.results&&rsp.results.length){
                    parentlis=selectHtml(rsp.results,rsp.results[0].parent_id);
                }
                $('.el-form-item.parent').find('.el-select-dropdown-wrap').html(parentlis);
            } 
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(flag=='table'){
                noData('获取物料模板树列表失败，请刷新重试',5);
            }
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
//获取物料模板列表
function getMaterielTemplate(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('#pagenation').show();
    $('#table_template_tree').hide();
    $('#table_template').show().find('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['template'].list+"?"+_token+urlLeft,
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
                noData('暂无数据',6);                
            }  
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            } 
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取物料模板列表失败，请刷新重试',6);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}

//删除物料模板
function deleteMaterielTemplate(id,leftNum){
    AjaxClient.get({
        url: URLS['template'].delete+"?"+_token+"&template_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功啦');
            if(treeShowFlag){
                getMaterielTemplateTree('table');
            }else{
                if(leftNum==1){
                    pageNo--;
                    pageNo?null:(pageNo=1);
                }
                getMaterielTemplate();
            }   
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                if(treeShowFlag){
                    getMaterielTemplateTree('table');
                }else{
                    getMaterielTemplate();
                } 
            }
        }
    },this);
}
//生成select框数据
function selectHtml(fileData,parent_id){
    var innerhtml,selectVal,parent_id;
    var lis=treeHtml(fileData,parent_id,'select');
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="parent_id" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;
    itemSelect=[];
    return innerhtml;
}
//生成树结构
function   treeHtml(fileData, parent_id,flag) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
      var lastClass=index===children.length-1? 'last-tag' : '';
      var level = item.level;
      var distance,className,itemImageClass,tagI;
      var hasChild = hasChilds(fileData, item.id);
      hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
      flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`) : (distance=level * 20,tagI='');
      var selectedClass='';
      var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`: `${tagI}<span>${item.name}</span>`;
      if(flag==='table'){
          _html += `
            <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
              <td>${item.code}</td>
              <td>${span}</td>
              <td><div class="overflow" title="${item.label}">${item.label}</div></td>
              <td style="width: 70px;"><div class="status"><span class="el-tag ${item.status?'el-tag-success':'el-tag-danger'}">${item.status?'有效':'无效'}</span>${item.status?'':'<div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip">没有物料属性<i></i></span></div>'}</div></td>
              <td class="right">
                <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.id}"><button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button></a>
                <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.id}"><button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button></a>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button></td>
            </tr>
            ${treeHtml(fileData, item.id,flag)}
            `;
        }else{
            item.selected==1?(itemSelect.push(item),selectedClass='selected'):null;
            _html += `
            <li data-id="${item.id}" data-pid="${parent_id}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
            ${treeHtml(fileData, item.id, flag)}
            `;
        }
    });
    return _html;
  };

//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td><div class="overflow" title="${item.label}">${item.label}</div></td>
                <td>${item.parent==null?'':item.parent}</td>
                <td style="width: 70px;"><div class="status"><span class="el-tag ${item.status?'el-tag-success':'el-tag-danger'}">${item.status?'有效':'无效'}</span>${item.status?'':'<div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip">没有物料属性<i></i></span></div>'}</div></td>
                <td class="right">
                <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button edit">编辑</button></a>
                <button data-id="${item.id}" class="button pop-button delete">删除</button></td>
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
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#table_attr_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
          layer.close(index);
          deleteMaterielTemplate(id,num);
        });
    });
    //查看列表
    $('.actions .look_list').on('click',function(e){
        treeShowFlag=0;
        $(this).parent().hide().siblings('.actions').show();
        getMaterielTemplate(); 
        getMaterielTemplateTree('list');
        $('.searchItem').show().removeClass('hide');
    });
    //返回树形列表
    $('.actions .back').on('click',function(e){
        treeShowFlag=1;
        $('.searchItem').addClass('hide').hide();
        $(this).parent().hide().siblings('.actions').show();
        getMaterielTemplateTree('table');
    });
    //排序
    $('.sort-caret').on('click',function(e){
        e.stopPropagation();
        $('.el-sort').removeClass('ascending descending');
        if($(this).hasClass('ascending')){
            $(this).parents('.el-sort').addClass('ascending');
        }else{
            $(this).parents('.el-sort').addClass('descending');
        }
        $(this).attr('data-key');
        ajaxData.order=$(this).attr('data-sort');
        ajaxData.sort=$(this).attr('data-key');
        getMaterielTemplate();
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
    $('body').on('click','.el-select-dropdown-item',function(e){
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

    //搜索物料属性
    $('body').on('click','#searchForm .submit',function(e){
        e.stopPropagation();
        e.preventDefault();
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
                code: parentForm.find('#code').val().trim(),
                name: parentForm.find('#name').val().trim(),
                label: parentForm.find('#label').val().trim(),
                parent_id: parentForm.find('#parent_id').val(),
                status: parentForm.find('#status').val(),
                order: 'desc',
                sort: 'id'
            };
            getMaterielTemplate();
        }  
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#name').val('');
        parentForm.find('#label').val('');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#parent_id').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        pageNo=1;
        resetParam();
        getMaterielTemplate();
    });

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
}