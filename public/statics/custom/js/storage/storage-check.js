var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=50,
    ids=[],
    ajaxData={};
$(function(){
	resetParam();
	getCheckData();
	bindEvent();
})

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
			getCheckData();
		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
		material_item_no: '',
		material_name: '',
		isaudit: '',
	}
}

function bindPagenationClick(totalData,pageSize){
	$('pagenation').show();
	$('pagenation').pagination({
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
		callback: function(api){
			pageNo=api.getCurrent();
			getCheckData();
		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
		material_name: '',
		material_item_no: '',
		isaudit: '',
	}
}

//获取盘点列表
function getCheckData(){
     $('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;	
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['check'].list+_token+urlLeft,
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
            noData('获取盘点列表失败，请刷新重试',13);		
		},
		complete:function(){
			$('#searchForm .submit').removeClass('is-disabled');			
		}
	},this);
}

//审核
function auditCheckData(id){
	var data={
		id: id,
		_token: TOKEN
	};
	AjaxClient.post({
		url: URLS['check'].audit+_token,
		data: data,
		dataType: 'json',
		beforeSned: function(){
			later.close(layerLoading);
		},
		success:function(rsp){
			layer.close(layerLoading);
			getCheckData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
			if(rsp.code==404){
				getCheckData();
			}
		}
	},this);
}

//反审
function reauditCheckData(id){
	var data={
		id: id,
		_token: TOKEN
	};
	AjaxClient.post({
		url: URLS['check'].reaudit+_token,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getCheckData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
			if(rsp.code==404){
				getCheckData();
			}
		}
	},this)
}

//批量审核
function batchAuditCheck(ids){
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
		url: URLS['check'].batchAudit,
		data:data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getCheckData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time:1500});
		}
	},this)
}

//生成列表数据
function createHtml(ele,data){
	var viewurl=$('#check_view').val();
	editurl=$('#check_edit').val();
	ele.html('');
	data.forEach(function(item,index){
	var tr=`
		    <tr>
                <td class="left norwap">
		        <span class="el-checkbox_input " id="${item.check_id}">
		           <span class="el-checkbox-outset"></span>
		           </span>
                </span>
		        </td>
                <td>${tansferNull(item.createtime)}</td>
                <td>${tansferNull(item.customcode)}</td>
                <td>${tansferNull(item.material_item)}</td>
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.unit_text)}</td>
                <td>${tansferNull(item.oquantity)}</td>
                <td>${tansferNull(item.nquantity)}</td>
                <td>${tansferNull(item.bquantity)}</td>
                <td>${tansferNull(item.sign)}</td>
                <td>${tansferNull(item.lock_status?'已锁库':'未锁库存')}</td>
                <td class="right nowrap">
		         <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.check_id}"><button data-id="${item.check_id}" class="button pop-button view">查看</button></a>
		         <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.check_id}"><button data-id="${item.check_id}" class="button pop-button edit">编辑</button></a>
		         <button data-id="${item.check_id}" class="button pop-button auditing">审核</button>
		         <button data-id="${item.check_id}" class="button pop-button reauditing">反审核</button></td>
		        
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

    //点击审核
    $('.uniquetable').on('click','.button.pop-button.auditing',function(){
    	var id=$(this).attr("data-id");
    	console.log($(this).attr("data-id"));
    	layer.confirm('将执行审核操作?',{icon: 3, title:'提示',offset: '250px',end:function(){
    	}},function(index){
    		layer.close(index);
    		auditCheckData(id);
    	})
    })
    //点击反审核
    $('.uniquetable').on('click','button.pop-button.reauditing',function(){
    	var id=$(this).attr("data-id");
    	layer.confirm('将执行反审操作?',{icon: 3, title:'提示',offset: '250px',end:function(){

    	}},function(index){
    		layer.close(index);
    		reauditCheckData(id);
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

	$("#storage_check_auditing").click(function(){
	    console.log(ids);	
	    if(ids.length==0){
	    	console.log("请选择数据");
	    }
        batchAuditCheck(ids);
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
        getCheckData();
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
    			material_name: parentForm.find('#material_name').val().trim(),
    			material_item_no: parentForm.find('#material_item_no').val().trim(),
    			isaudit: parentForm.find('#is_audited').val()
    		}
    		getCheckData();

    	}
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
    	e.stopPropagation();
    	var parentForm=$(this).parents('#searchForm');
    	parentForm.find('#material_name').val('');
    	parentForm.find('#material_item_no').val('');
    	parentForm.find('#is_audited').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getCheckData();
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

}

