var layerLoading,
layerModal,
pageNo=1,
pageSize=50,
ajaxData={};
viewurl='',
editurl='',
$(function(){
	resetParam();
	getSellsOrderList();
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
            getSellsOrderList();
        }
    });
}

//重置搜索参数
function resetParam(){
	ajaxData={
		code:'',
        creater_name: '',
        customer_name:''
	};
}

//获取销售单列表
function getSellsOrderList(){
     $('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;	
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['sellsOrder'].list+_token+urlLeft,
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
                noData('暂无数据',9)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
		fail:function(rsp){
			layer.close(layerLoading);
            noData('获取销售列表失败，请刷新重试',9);		
		},
		complete:function(){
			$('#searchForm .submit').removeClass('is-disabled');			
		}
	},this);
}

//删除销售单
function deleteSellsOrder(id){
    AjaxClient.get({
        url: URLS['sellsOrder'].del+"sellorder_id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getSellsOrderList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getSellsOrderList();
            }
        }
    },this);
}

//生成生产单
function createPo(id){
    var data={
        sellorder_id: id,
        _token: TOKEN
    };
    AjaxClient.get({
        url: URLS['sellsOrder'].create,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layer.close(layerLoading);
        },
        success: function(rsp){
            layer.close(layerLoading);
            getSellsOrderList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getSellsOrderList();
            }   
        }
    },this);
}

//生成列表数据
function createHtml(ele,data){
	var viewurl=$('#sellOrder_view').val(),
	editurl=$('#sellOrder_edit').val();
	data.forEach(function(item,index){
	    var pubBtn='';
        switch(item.release_status){
        case 1:
        status=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">未生成生产单</span>`;
        pubBtn = `<button data-id="${item.sellorder_id}" class="button pop-button auditing">生成</button>`;
        break;
        case 2:
        status=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已生成生产单</span>`;
        pubBtn = '';
        break;
    }
		var tr=`
		    <tr class="tritem" data-id="${item.sellorder_id}">
                <td>${tansferNull(item.ctime)}</td>
                <td>${tansferNull(item.code)}</td>
                <td>${tansferNull(item.creater_name)}</td>
                <td>${tansferNull(item.customer_name)}</td>>
                <td>${tansferNull(item.remark)}</td>	
                <td>${tansferNull(status)}</td>	        
		        <td class="right nowrap">
		            ${pubBtn}
                    <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.sellorder_id}"><button data-id="${item.sellorder_id}" class="button pop-button view">查看</button></a>
                    <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.sellorder_id}"><button data-id="${item.sellorder_id}" class="button pop-button edit">编辑</button></a>
                    <button data-id="${item.sellorder_id}" class="button pop-button delete">删除</button>
                 </td>
	        </tr>
		`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData",item);
	});
}

function bindEvent() {
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
            deleteSellsOrder(id);
        });
    });
    //点击审核
    $('.uniquetable').on('click','.button.pop-button.auditing',function(){
        var id=$(this).attr("data-id");
        console.log($(this).attr("data-id"));
        layer.confirm('将执行生成操作?',{icon: 3, title:'提示',offset: '250px',end:function(){
        }},function(index){
            layer.close(index);
            createPo(id);
        })
    })
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
        getOtherInstoreList();
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

    //搜索数据
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
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                creater_name: encodeURIComponent(parentForm.find('#creater_name').val().trim()),
                customer_name: encodeURIComponent(parentForm.find('#customer_name').val().trim())
            }
            getSellsOrderList();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#creater_name').val('');
        parentForm.find('#customer_name').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getSellsOrderList();
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

