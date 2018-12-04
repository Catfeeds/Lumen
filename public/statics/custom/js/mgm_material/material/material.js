var layerModal,
layerLoading,
pageNo=1,
pageSize=20,
ajaxData={},
viewurl='',
editurl='';
$(function(){
    resetParam();
	getMateriel();
    getSearch();
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
        getMateriel();
    }
});
}

//重置搜索参数
function resetParam(){
    ajaxData={
        item_no: '',
        name: '',
        creator_name: '',
        template_id: '',
        material_category_id: '',
        order: 'desc',
        sort: 'id'
    };
}

//获取物料列表
function getMateriel(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
	AjaxClient.get({
		url: URLS['material'].list+"?"+_token+urlLeft,
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
			noData('获取物料列表失败，请刷新重试',10);
		},
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
	},this);
}

//删除物料
function deleteMateriel(id,leftNum){
    AjaxClient.get({
        url: URLS['material'].delete+"?"+_token+"&material_id="+id,
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
            getMateriel();
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
                getMateriel();
            }
        }
    },this);
}

//生成列表数据
function createHtml(ele,data){
    var viewurl=$('#material_view').val(),
    editurl=$('#material_edit').val();
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.material_id}">
                <td>${item.item_no}</td>
                <td>${item.name}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${tansferNull(item.material_category_name)}</td>
                <td>${tansferNull(item.template_name)}</td>
                <td>${item.ctime}</td> 
                <td>${item.mtime}</td>
                <td class="right">
                <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.material_id}"><button data-id="${item.material_id}" class="button pop-button view">查看</button></a>
                <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.material_id}"><button data-id="${item.material_id}" class="button pop-button edit">编辑</button></a>
                <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.material_id}&copy=1"><button data-id="${item.material_id}" class="button pop-button edit">复制</button></a>
                <button data-id="${item.material_id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

//获取物料分类列表
function getCategories(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['category'].selectList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

//获取物料模板列表
function getMaterielTemplateTree(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['template'].treeList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp); 
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}

function getSearch(){
    $.when(getCategories(),getMaterielTemplateTree())
    .done(function(categoryrsp,templatersp){
        var categorylis='',templatelis='';
        if(categoryrsp&&categoryrsp.results&&categoryrsp.results.length){
            categorylis=selectHtml(categoryrsp.results,categoryrsp.results[0].parent_id,'category');
            $('.el-form-item.category').find('.el-select-dropdown-wrap').html(categorylis);
        }
        if(templatersp&&templatersp.results&&templatersp.results.length){
            templatelis=selectHtml(templatersp.results,templatersp.results[0].parent_id,'template');
            $('.el-form-item.template').find('.el-select-dropdown-wrap').html(templatelis);
        }
    }).fail(function(unitrsp,dataTypersp){
        console.log('获取物料分类或物料模板失败');
    }).always(function(){
        layer.close(layerLoading);
    });
}

//生成下拉框数据
function selectHtml(fileData,parent_id,flag){
    var innerhtml,selectVal,parent_id;
    var lis=selecttreeHtml(fileData,parent_id);
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="${flag=='category'?'material_category_id':'template_id'}" value="">
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

//生成分组列表
function operationHtml(data){
    var lis='';
    data.forEach(function(item){
        lis+=`<input type="checkbox" class="op-input" id="${item.code}_${item.id}" name="${item.name}" value="${item.id}">
            <label class="op-label" for="${item.code}_${item.id}">${item.name}</label>`;
    });
    return lis;
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
		  deleteMateriel(id,num);
		});
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
        getMateriel();
    });
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
                item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
                name: encodeURIComponent(parentForm.find('#name').val().trim()),
                creator_name: encodeURIComponent(parentForm.find('#creator_name').val().trim()),
                material_category_id: parentForm.find('#material_category_id').val(),
                template_id: parentForm.find('#template_id').val(),
                order: 'desc',
                sort: 'id'
            }
            getMateriel();
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
        parentForm.find('#item_no').val('');
        parentForm.find('#name').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#material_category_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#template_id').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getMateriel();
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
