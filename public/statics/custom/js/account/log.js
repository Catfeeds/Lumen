var layerModal,
layerLoading,
pageNo=1,
pageSize=20,
ajaxData={},
layerEle='';
$(function(){
    resetParam();
	getLoginLog();
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
            getLoginLog();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        login_status: 1,
        admin_name: '',
        order: 'desc',
        sort: 'id'
    };
}

//获取登录轨迹列表
function getLoginLog(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
	AjaxClient.get({
		url: URLS['log'].list+"?"+_token+urlLeft,
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
                noData('暂无数据',4);                
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
			noData('获取登录轨迹失败，请刷新重试',4);
		},
        complete: function(){
            $('#searchLoginLog_from .submit,#searchLoginLog_from .reset').removeClass('is-disabled');
        }
	},this);
}


//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.admin_id}">
                <td>${item.admin_name}</td>
                <td>${item.login_ip}</td>
                <td>${item.login_time}</td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

function bindEvent(){
	//搜索登录轨迹
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
    	e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            pageNo=1;
            ajaxData={
            	login_status: 1,
                admin_name: parentForm.find('#admin_name').val().trim(),
                order: 'desc',
                sort: 'id'
            }
            getLoginLog();
        }  
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#admin_name').val('');
        pageNo=1;
        resetParam();
        getLoginLog();
    });
}