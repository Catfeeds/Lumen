var layerModal,
layerLoading,
pageNo=1,
pageSize=50,
ids=[],
ajaxData={};
$(function(){
	resetParam();
	getAllocateData();
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
			getAllocateData();
		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
		plant_name: '',
		depot_name: '',
		subarea_name: '',
		bin_name: '',
		isaudit:''
	};
}

//获取调拨列表
function getAllocateData(){
	$('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['allocate'].allocateList+_token+urlLeft,
		dataType: 'json',
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
				noData('暂无数据',9)
			}
			if(totalData>pageSize){
				bindPagenationClick(totalData,pageSize);
			}else{
				$('#pagenation').html('');
			}
		},
		fail: function(rsp){
			layer.close(layerLoading);
			noData('获取调拨单列表失败，请刷新重试',9);
		},
		complete: function(){
			$('#searchForm .submit').removeClass('is-disabled');	
		}
	},this)
}

//删除调拨单
function deleteAllocate(id){
	AjaxClient.get({
		url: URLS['allocate'].allocateDel+"id="+id+"&"+_token,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
			getAllocateData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
			if(rsp.code==404){
				getAllocateData();
			}
		}
	},this);
}

//审核
function auditAllocate(id){
	var data={
		id: id,
		_token: TOKEN
	};
	AjaxClient.post({
		url: URLS['allocate'].audit+_token,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getAllocateData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
			if(rsp.code==404){
				getAllocateData();
			}
		}
	},this);
}

//批量审核
function batchAuditAllocate(ids){
	var arr = [];
	ids.forEach(function(item,index){
		arr.push({id:item})
	})
	var id = JSON.stringify(arr)
	var data = {
		_token: TOKEN,
		ids: id
	};
	console.log(data)
	AjaxClient.post({
		url: URLS['allocate'].batchAudit,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getAllocateData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time:1500});
		}
	},this)
}

//获取厂区列表
function getDeplants(data){
	var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['depot'].plants+_token,
        dataType: 'json',
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.plant_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.plant').find('.el-select-dropdown-list').html(innerhtml);
                if(val){
                  $('.el-form-item.plant').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }   
        },
        fail: function(rsp){
            layer.msg('获取厂区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//获取仓库列表
function getDepot(val){
    AjaxClient.get({
        url: URLS['depot'].store+_token,
        dataType: 'json',
		success: function(rsp){
		        layer.close(layerLoading);
		        if(rsp.results&&rsp.results.length){
		            var lis='',innerhtml='';
		            rsp.results.forEach(function(item){
		                lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.depot_name}</li>`;
		            });
		            innerhtml=`
		                    <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
		                    ${lis}`;
		            $('.el-form-item.depot').find('.el-select-dropdown-list').html(innerhtml);
		            if(val){
		              $('.el-form-item.depot').find('.el-select-dropdown-item[data-id='+val+']').click();
		            }
		        }   
		    },
        fail: function(rsp){
            layer.msg('获取部门列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//获取分区列表
function getSubarea(val){
    AjaxClient.get({
        url: URLS['subarea'].list+_token,
        dataType: 'json',
        success: function(rsp){
		        layer.close(layerLoading);
		        if(rsp.results&&rsp.results.length){
		            var lis='',innerhtml='';
		            rsp.results.forEach(function(item){
		                lis+=`<li data-id="${item.subarea_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.subarea_name}</li>`;
		            });
		            innerhtml=`
		                    <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
		                    ${lis}`;
		            $('.el-form-item.subarea').find('.el-select-dropdown-list').html(innerhtml);
		            if(val){
		              $('.el-form-item.subarea').find('.el-select-dropdown-item[data-id='+val+']').click();
		            }
		        }   
		    },
        fail: function(rsp){
            layer.msg('获取分区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//获取仓位档案列表
function getLocateBin(val) {
    AjaxClient.get({
        url: URLS['locate'].bin+_token,
        dataType: 'json',
        success: function(rsp){
	        layer.close(layerLoading);
	        if(rsp.results&&rsp.results.length){
	            var lis='',innerhtml='';
	            rsp.results.forEach(function(item){
	                lis+=`<li data-id="${item.bin_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.bin_name}</li>`;
	            });
	            innerhtml=`
	                    <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
	                    ${lis}`;
	            $('.el-form-item.bin').find('.el-select-dropdown-list').html(innerhtml);
	            if(val){
	              $('.el-form-item.bin').find('.el-select-dropdown-item[data-id='+val+']').click();
	            }
	        }   
	    },
        fail: function (rsp) {
            layer.msg('获取仓位档案列表失败，请刷新重试', {icon: 2,offset: '250px'});
        }
    },this)
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

//生成仓位列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==bin.id){
            selectName=item.bin_name;
            selectId=item.bin_id;
        }
        lis+=`<li data-id="${item.bin_id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.bin_name}</li>`;
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


//生成列表数据
function createHtml(ele,data){
	var viewurl=$('#allocate_view').val();
	ele.html('');
	editurl=$('#allocate_edit').val();
	data.forEach(function(item,index){
		var tr = `
		<tr>
		<td class="left norwap">
		<span class="el-checkbox_input " id="${item.id}">
           <span class="el-checkbox-outset"></span>
           </span>
       </span>
		</td>
		<td>${tansferNull(item.code)}</td>
		<td>${tansferNull(item.plant_name)}</td>
		<td>${tansferNull(item.depot_name)}</td>
		<td>${tansferNull(item.subarea_name)}</td>
		<td>${tansferNull(item.bin_name)}</td>
		<td>${tansferNull(item.remark)}</td>
		<td class="right nowrap">
         <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
         <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button edit">编辑</button></a>
         <button data-id="${item.id}" class="button pop-button delete">删除</button>
         <button data-id="${item.id}" class="button pop-button auditing">审核</button></td>
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
		var id = $(this).attr("data-id");
		$(this).parents('tr').addClass('active');
		layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
			$('.uniquetable tr .active').removeClass('active');
		}},function(index){
			layer.close(index);
			deleteAllocate(id);
		});
	});
	//点击审核
    $('.uniquetable').on('click','.button.pop-button.auditing',function(){
    	var id=$(this).attr("data-id");
    	console.log($(this).attr("data-id"));
    	layer.confirm('将执行审核操作?',{icon: 3, title:'提示',offset: '250px',end:function(){
    	}},function(index){
    		layer.close(index);
    		auditAllocate(id);
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
        batchAuditAllocate(ids);
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
	//搜索调拨单数据
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
    			plant_name: encodeURIComponent(parentForm.find('#plant_name').val().trim()),
    			depot_name: encodeURIComponent(parentForm.find('#depot_name').val().trim()),
    			subarea_name: encodeURIComponent(parentForm.find('#subarea_name').val().trim()),
    			bin_name: encodeURIComponent(parentForm.find('#bin_name').val().trim()),
    			isaudit: parentForm.find('#is_audited').val()
    		}
    		getAllocateData();
    	}
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
    	e.stopPropagation();
    	var parentForm=$(this).parents('#searchForm');
    	parentForm.find('#plant_name').val('');
    	parentForm.find('#depot_name').val('');
    	parentForm.find('#subarea_name').val('');
    	parentForm.find('#bin_name').val('');
    	parentForm.find('#is_audited').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getAllocateData();
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
