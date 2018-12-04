var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={};
$(function () {
    setAjaxData();
    getBusteList();
    bindEvent();
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
        }catch (e) {
            resetParam();
        }
    }
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
            getBusteList();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        production_number: '',
        workOrder_number: ''
    };
}

//获取粗排列表
function getBusteList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            ajaxData.pageNo=pageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation.unpro').html('');
            }
            uniteTdCells('work_order_table');

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',9);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    },this)
}

//生成未排列表数据
function createHtml(data){
    var viewurl=$('#workOrder_view').val();
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){

            trs+= `
			<tr>
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.production_order_code)}</td>
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}</td>
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${item.out[0].qty}</td>
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}" width="200px;">${item.out[0].name}</td>
			<td >${item.out[0].GMNGA}</td>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.ISDD + item.ISDZ)}</td>
			<td>${tansferNull(item.IEDD + item.IEDZ)}</td>
			<td>${tansferNull(formatTime(item.ctime))}</td>
			<td>${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '报工完成' : (item.status == 3 || item.status == 4) ? 'SAP报错' : '')}</td>
			<td style="color: ${item.type == 1 ? '#00b3fb' : '#000'}">${tansferNull(item.type == 1 ? '委外报工' : '工单报工')}</td>
			<td class="right">
			${item.status != 2 ? `<button data-id="${item.id}" class="button pop-button item_submit">推送</button>` : ''}
		    <a class="button pop-button view" href="${viewurl}?id=${item.id}&type=edit">查看</a>
			${item.status == 1 ? `<button data-id="${item.id}" class="button pop-button delete">删除</button>` : ''}
	         
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable   table-bordered">
                <thead>
                    <tr>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">计划数量</th>
                        <th class="left nowrap tight">产出品</th>
                        <th class="left nowrap tight">产出品数量</th>
                        <th class="left nowrap tight">报工单号</th>
                        <th class="left nowrap tight">开始执行</th>
                        <th class="left nowrap tight">执行结束</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">报工类型</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;


}


function uniteTdCells(tableId) {
    var table = document.getElementById(tableId);
    for (let i = 0; i < table.rows.length; i++) {
        for(let c = 0; c < 4; c++){
            for (let j = i + 1; j < table.rows.length; j++) {
                let cell1 = table.rows[i].cells[c].getAttribute('data-content');
                let cell2 = table.rows[j].cells[c].getAttribute('data-content');
                if (cell1 == cell2) {
                    table.rows[j].cells[c].style.display = 'none';
                    table.rows[j].cells[c].style.verticalAlign = 'middle';
                    table.rows[i].cells[c].rowSpan++;

                    // table.rows[i].style.backgroundColor='#ddeaf98a';
                    // table.rows[j].style.backgroundColor='#ddeaf98a';
                    table.rows[i].cells[c].style.backgroundColor='#eef1f6';
                    table.rows[j].cells[c].style.backgroundColor='#eef1f6';
                    // table.rows[i].style.borderTop="2px solid #ccc";
                    // table.rows[i].style.borderLeft="2px solid #ccc";
                    // table.rows[i].style.borderRight="2px solid #ccc";
                    // table.rows[i].cells[c].style.borderBottom="2px solid #ccc";
                    // table.rows[j].style.borderBottom="2px solid #ccc";
                    // table.rows[j].style.borderRight="2px solid #ccc";
                    // table.rows[j].cells[c].style.borderTop="2px solid #ccc";
                } else {
                    table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
                    break;
                };
            }
        }

    }
};

function submint(id) {
    AjaxClient.get({
        url: URLS['work'].submitBuste +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','成功！');
                getBusteList();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}

function deleteItem(id) {
    AjaxClient.get({
        url: URLS['work'].destroy +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);

                LayerConfig('success','成功！');
                getBusteList();

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
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


    //搜索
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
            ajaxData={
                production_number: encodeURIComponent(parentForm.find('#code').val().trim()),
                workOrder_number: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
            };
            pageNo=1;
            getBusteList();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        resetParam();
        getBusteList();
    });
    $('body').on('click','.item_submit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id);
        });

    });
    $('body').on('click','.delete',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            deleteItem(id);
        });

    });



}
