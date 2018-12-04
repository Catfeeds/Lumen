var layerModal,
	layerLoading,
	pageNo=1,
	pageSize=50,
	ids=[],
	ajaxData={};
$(function(){
	resetParam();
	getInitData();
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
			getInitdata();

		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
		material_name: '',
		warehouse_keeper: '',
		starttime: '',
		endtime: '',
		material_item_no: '',
		sale_order_code:'',
		isaudit: ''
	};
}

//获取期初列表
function getInitData(){
	// $('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['storageInitial'].initialList+_token+urlLeft,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			if(layerModal!=undefined){
				layer.close(layerModal);
			}
			console.log(rsp.results);
			var totalData=rsp.paging.total_records;
			if(rsp.results && rsp.results.length){
				createHtml($('.table_tbody'),rsp.results)
			}else{
				noData('暂无数据',16)
			}
			if(totalData>pageSize){
				bindPagenationClick(totalData,pageSize);
			}else{
				$('#pagenation').html('');
			}
		},
		fail: function(rsp){
			layer.close(layerLoading);
			noData('获取期初列表失败，请刷新重试',9);
		},
		complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
	},this)
}

//删除仓库期初
function deleteStorageInit(id){
    AjaxClient.get({
		url: URLS['storageInitial'].initialDel+"id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getInitData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getInitData();
            }
        }
    },this);
}

//审核
function auditInitData(id){
	var data={
		id: id,
		_token: TOKEN
	};
	AjaxClient.post({
		url: URLS['storageInitial'].audit+_token,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getInitData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
			if(rsp.code==404){
				getInitData();
			}	
		}
	},this);
}
//反审
function reauditInitData(id){
	var data={
		id: id,
		_token: TOKEN
	};
	AjaxClient.post({
		url: URLS['storageInitial'].reaudit+_token,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getInitData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
			if(rsp.code==404){
				getInitData();
			}
		}
	},this)
}

//批量审核
function batchAuditInit(ids){
     var arr = [];
	 ids.forEach(function(item,index){
	 	arr.push({id:item})
     }) 
     var id = JSON.stringify(arr)
     var data = {
     	_token:TOKEN,
     	ids:id
     };
     console.log(data)
	AjaxClient.post({
		url: URLS['storageInitial'].batchAudit,
		data:data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getInitData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time:1500});
		}
	},this)
}

//导出Excel
function exportExcel(){
	location.href= URLS['storageInitial'].exportxls;
}

//生成列表数据
function createHtml(ele,data){
	var viewurl=$('#init_view').val();
	ele.html('');
    editurl=$('#init_edit').val();
	data.forEach(function(item,index){
		var tr = `
		       <tr>
		       <td class="left norwap">
		       <span class="el-checkbox_input " id="${item.id}">
		           <span class="el-checkbox-outset"></span>
		           </span>
               </span>
		       </td>
		       <td>${tansferNull(item.billdate)}</td>
		       <td>${tansferNull(item.material_number)}</td>
		       <td>${tansferNull(item.material_name)}</td>
		       <td>${tansferNull(item.sale_order_code)}</td>
		       <td>${tansferNull(item.po_number)}</td>
		       <td>${tansferNull(item.lot)}</td>
		       <td>${tansferNull(item.plant_name)}</td>
		       <td>${tansferNull(item.depot_name)}</td>
		       <td>${tansferNull(item.subarea_name)}</td>
		       <td>${tansferNull(item.bin_name)}</td>
		       <td>${tansferNull(item.quantity)}</td>
		       <td>${tansferNull(item.unit_text)}</td>
		       <td>${tansferNull(item.remark)}</td>
		       <td class="right nowrap">
		         <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
		         <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button edit">编辑</button></a>
		         <button data-id="${item.id}" class="button pop-button delete">删除</button>
		         <button data-id="${item.id}" class="button pop-button auditing">审核</button>
		         <button data-id="${item.id}" class="button pop-button reauditing">反审核</button></td>
		       </tr>
		`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData",item);
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
    //点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        // console.log(666)
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
          layer.close(index);
          deleteStorageInit(id);
        });
    });
    //点击审核
    $('.uniquetable').on('click','.button.pop-button.auditing',function(){
    	var id=$(this).attr("data-id");
    	console.log($(this).attr("data-id"));
    	layer.confirm('将执行审核操作?',{icon: 3, title:'提示',offset: '250px',end:function(){
    	}},function(index){
    		layer.close(index);
    		auditInitData(id);
    	})
    })
    //点击反审核
    $('.uniquetable').on('click','button.pop-button.reauditing',function(){
    	var id=$(this).attr("data-id");
    	layer.confirm('将执行反审操作?',{icon: 3, title:'提示',offset: '250px',end:function(){

    	}},function(index){
    		layer.close(index);
    		reauditInitData(id);
    	})
    })

    $('body').on('click','.el-checkbox_input',function(){
    	$(this).toggleClass('is-checked');
    	var id=$(this).attr("id")
    	if($(this).hasClass('is-checked')){
    		console.log($(this))
    		// ids.push($(this).attr("id"));	
    		if(ids.indexOf(id)==-1){
    			ids.push(id);
    		}	
	    }else{
	    	var index=ids.indexOf(id);
	    	ids.splice(index,1);
	    }
    })

	$("#storage_initial_auditing").click(function(){
	    console.log(ids);	
	    if(ids.length==0){
	    	console.log("请选择数据");
	    }
        batchAuditInit(ids);
    });
   
   $("#storage_initial_exportxls").click(function(){
	    console.log(ids);	
	    if(ids.length==0){
	    	console.log("请选择数据");
	    }
        exportExcel(ids);
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
        getInitData();
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
    			material_name: encodeURIComponent(parentForm.find('#material_name').val().trim()),
    			warehouse_keeper: encodeURIComponent(parentForm.find('#warehouse_keeper').val().trim()),
    			sale_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
    			starttime: encodeURIComponent(parentForm.find('#startTime').val().trim()),
    			endtime: encodeURIComponent(parentForm.find('#endTime').val().trim()),
    			material_item_no: encodeURIComponent(parentForm.find('#material_item_no').val().trim()),
    			isaudit: parentForm.find('#is_audited').val()
    		}
    		getInitData();

    	}
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
    	e.stopPropagation();
    	var parentForm=$(this).parents('#searchForm');
    	parentForm.find('#material_name').val('');
    	parentForm.find('#warehouse_keeper').val('');
    	parentForm.find('#sale_order_code').val('');
    	parentForm.find('#startTime').val('');
    	parentForm.find('#endTime').val('');
    	parentForm.find('#material_item_no').val('');
    	parentForm.find('#is_audited').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getInitData();
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

    $("#fileInput").on("change", function(){
      console.log(999);
	  var formData = new FormData();
	  var ele=$("#fileInput")[0];
	  if(ele.files&&ele.files[0]){
	  	formData.append("import_file", ele.files[0]);
	  	$.ajax({
	        type: "POST",
	        url: URLS['storageInitial'].import+"?"+ _token,
	        enctype: 'multipart/form-data',
	        data: formData,
	        cache: false,
	        contentType: false,
	        processData: false,
	        dataType: "json",
	        beforeSend: function(){
	        	layerLoading = LayerConfig('load');
	        },
	        success: function(data) {
		        layer.close(layerLoading);
		        LayerConfig('success','导入成功');	
		        getInitData();	        
	        },
	        error: function(data) {
	        	layer.close(layerLoading);
	        	noData('获取期初列表失败，请刷新重试',9);
	        }
	    	})
	  }
	});

}
