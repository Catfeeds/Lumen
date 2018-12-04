var layerLoading,
layerModal,
pageNo=1,
pageSize=20,
ajaxData={};
$(function(){
	resetParam();
	getInventoryData();
	bindEvent();
});

function bindPagenationClick(totalData,pageSize){
	$('#pagenation').show();
	$('#pagenation').pagination({
		totalData: totalData,
		showData:pageSize,
		current: pageNo,
		isHide: true,
		coping: true,
		homePage:'首页',
		endpage: '末页',
		prevContent:'上页',
		nextContent:'下页',
		jump: true,
		callback:function(api){
			pageNo=api.getCurrent();
			getInventoryData();
		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
		material_item_no:'',
		material_name:'',
        wo_number:'',
		plant_name:'',
        sale_order_code:'',
        po_number:'',
		depot_name:'',
		subarea_name:'',
		bin_name:''
	};
}

//获取实时库存列表
function getInventoryData(){
     $('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;	
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['inve'].list+_token+urlLeft,
		dataType:'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',14)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
		fail:function(rsp){
			layer.close(layerLoading);
            noData('获取期初列表失败，请刷新重试',14);
		},
		complete:function(){
			$('#searchForm .submit').removeClass('is-disabled');			
		}
	},this);
}

//生成列表数据
function createHtml(ele,data){
	data.forEach(function(item,index){
		var tr=`
		    <tr>
                <td></td>
                <td>${tansferNull(item.sale_order_code)}</td>
                <td>${tansferNull(item.po_number)}</td>
                <td>${tansferNull(item.wo_number)}</td>
                <td>${tansferNull(item.material_item_no)}</td>
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.quantity)}</td>
                <td>${tansferNull(item.unit_text)}</td>
                <td>${tansferNull(item.lot)}</td>
                <td>${tansferNull(item.plant_name)}</td>
                <td>${tansferNull(item.depot_name)}</td>
                <td>${tansferNull(item.subarea_name)}</td>
                <td>${tansferNull(item.bin_name)}</td>
                <td>${tansferNull(item.lock_status?'已锁库存':'未锁库存')}</td>
                <td>${tansferNull(item.inve_age)}</td>
                <td>${tansferNull(item.remark)}</td>
		        <td></td>
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

	//搜索期初数据
    $('body').on('click','#searchForm .submit',function(e){
    	e.stopPropagation();
    	e.preventDefault();
    	$('#searchForm .el-item-hide').slideUp(400,function(){
    		$('#searchForm .el-item-show').css('backageground','transparent');
    	});
    	$('.arrow .el-input-icon').removeClass('is-reverse');
    	if(!$(this).hasClass('is-disabled')){
    		$(this).addClass('is-disabled');
    		var parentForm=$(this).parents('#searchForm');
    		$('.el-sort').removeClass('ascending descending');
    		pageNo=1;
    		ajaxData={
                sale_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
                po_number: encodeURIComponent(parentForm.find('#po_number').val().trim()),
                wo_number: encodeURIComponent(parentForm.find('#wo_number').val().trim()),
    			material_item_no: encodeURIComponent(parentForm.find('#material_item_no').val().trim()),
    			material_name:encodeURIComponent(parentForm.find('#material_name').val().trim()),
    			plant_name: encodeURIComponent(parentForm.find('#plant_name').val().trim()),
    			depot_name: encodeURIComponent(parentForm.find('#depot_name').val().trim()),
    			subarea_name: encodeURIComponent(parentForm.find('#subarea_name').val().trim()),
    			bin_name: encodeURIComponent(parentForm.find('#bin_name').val().trim()),	
    		}
    		getInventoryData();

    	}
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
    	e.stopPropagation();
    	var parentForm=$(this).parents('#searchForm');
    	parentForm.find('#material_item_no').val('');
        parentForm.find('#po_number').val('');
        parentForm.find('#wo_number').val('');
        parentForm.find('#sale_order_code').val('');
    	parentForm.find('#material_name').val('');
    	parentForm.find('#plant_name').val('');
    	parentForm.find('#depot_name').val('');
    	parentForm.find('#subarea_name').val('');
    	parentForm.find('#bin_name').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getInventoryData();
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

