var layerLoading,
layerModal,
pageNo=1,
pageSize=50,
ajaxData={};
$(function(){
	resetParam();
    getOwner();
	getOutstoreData();
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
			getOutstoreData();
		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
		category_id: '',
        sale_order_code:'',
        wo_number:'',
        po_number:'',
		plant_name:'',
		depot_name:'',
		subarea_name:'',
		bin_name:'',
		material_name:'',
		item_no:'',
		start_time:'',
		end_time:'',
		own_id:''
	};
}

//获取入库单列表
function getOutstoreData(){
     $('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;	
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['outstore'].list+_token+urlLeft,
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
                noData('暂无数据',15)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
		fail:function(rsp){
			layer.close(layerLoading);
            noData('获取期初列表失败，请刷新重试',15);
		},
		complete:function(){
			$('#searchForm .submit').removeClass('is-disabled');			
		}
	},this);
}

//获得所属者
function getOwner(val){
  AjaxClient.get({
    url: URLS['otherOutstore'].owner+_token,
    dataType: 'json',
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp.results&&rsp.results.length){
        var lis='',innerhtml='';
        rsp.results.forEach(function(item){
          lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`
        });
        innerhtml=`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                   ${lis}`;
         $('.el-form-item.owner').find('.el-select-dropdown-list').html(innerhtml);
         if(val){
            $('.el-form-item.owner').find('.el-select-dropdown-item[data-id='+val+']').click();
        }
      }
    },
    fail: function(rsp){
      layer.msg('获取所有者列表失败', {icon: 5,offset: '250px',time: 1500});
    }
  },this)
}

//生成所属者列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==item.id){
            selectName=item.name;
            selectId=item.id;
        }
        lis+=`<li data-id="${item.id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.name}</li>`;
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

//出库类别
function getIncategory(val){
    AjaxClient.get({
        url: URLS['outstore'].category+_token,
        dataType: 'json',
        success: function(rsp){
            layer.close(layerLoading);
              if(rsp.results){
                var lis='',innerhtml='';
                for(var type in rsp.results){
                    lis+=`<li data-id="${type}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${rsp.results[type]}</li>`
                }
                innerhtml=`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                           ${lis}`;
                 $('.el-form-item.category').find('.el-select-dropdown-list').html(innerhtml);
                 if(val){
                    $('.el-form-item.category').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
              }         
        },
        fail: function(rsp){
            layer.msg('获取类别列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this)
}

//生成列表数据
function createHtml(ele,data){
	data.forEach(function(item,index){
		var tr=`
		    <tr>
                <td>${tansferNull(item.sale_order_code)}</td>
                <td>${tansferNull(item.po_number)}</td>
                <td>${tansferNull(item.wo_number)}</td>
                <td>${tansferNull(item.createdate)}</td>
                <td>${tansferNull(item.category)}</td>
                <td>${tansferNull(item.item_no)}</td>
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.unit_text)}</td>
                <td>${tansferNull(item.quantity)}</td>
                <td>${tansferNull(item.plant_name)}</td> 
                <td>${tansferNull(item.depot_name)}</td> 
                <td>${tansferNull(item.subarea_name)}</td>
                <td>${tansferNull(item.bin_name)}</td>
                <td>${tansferNull(item.owner_name)}</td>
                <td>${tansferNull(item.lock_status?'已锁库存':'未锁库存')}</td>
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
                category_id: parentForm.find('#category').val(),
                sale_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
                wo_number: encodeURIComponent(parentForm.find('#wo_number').val().trim()),
                po_number: encodeURIComponent(parentForm.find('#po_number').val().trim()),
                plant_name: encodeURIComponent(parentForm.find('#plant').val().trim()),
                depot_name:encodeURIComponent(parentForm.find('#depot').val().trim()),
                subarea_name: encodeURIComponent(parentForm.find('#subarea').val().trim()),
                bin_name: encodeURIComponent(parentForm.find('#bin').val().trim()),
                material_name: encodeURIComponent(parentForm.find('#material').val().trim()),
                item_no: encodeURIComponent(parentForm.find('#material_no').val().trim()),
                start_time: parentForm.find('#startTime').val().trim(),
                end_time: parentForm.find('#endTime').val().trim(),
                own_id: parentForm.find('#owner_id').val(), 
            }
            getOutstoreData();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#category').val('');
        parentForm.find('#wo_number').val('');
        parentForm.find('#sale_order_code').val('');
        parentForm.find('#po_number').val('');
        parentForm.find('#plant').val('');
        parentForm.find('#depot').val('');
        parentForm.find('#subarea').val('');
        parentForm.find('#bin').val('');
        parentForm.find('#material').val('');
        parentForm.find('#material_no').val('');
        parentForm.find('#startTime').val('');
        parentForm.find('#endTime').val('');
        parentForm.find('#own_id').val('');      
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getOutstoreData();
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
