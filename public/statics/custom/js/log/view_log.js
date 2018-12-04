var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={};
$(function(){
    resetParam();
    getLog();
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
            getLog();
        }
    });
}
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

//重置搜索参数
function resetParam(){
    ajaxData={
        start_time: '',
        end_time: '',
        keyword: ''
    };
}

//获取物料列表
function getLog(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['log'].pageIndex+"?"+_token+urlLeft,
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
            noData('获取日志列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}

function html2Escape(sHtml) {
    return sHtml.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
}
//生成列表数据
function createHtml(ele,data){

    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td style="width: 300px;">${item.sourceSysName}</td>
                <td>${item.targetSysName}</td>
                <td>${item.returnCode==0?'成功':'失败'}</td>
                <td>
                    <button data-content="${html2Escape(item.return_json)}" class="button pop-button view">查看</button>
                </td>
                <td>
                    <button data-content="${html2Escape(item.data_json)}" class="button pop-button view">查看</button>
                </td>
                <td>${item.ctime}</td> 
               
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
    //查看
    $('body').on('click','.view',function (e) {
        e.stopPropagation();
        var data = $(this).attr('data-content');
        viewContent(data);
    })
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
                keyword: encodeURIComponent(parentForm.find('#keyword').val().trim()),
                start_time: parentForm.find('#start_time').val(),
                end_time: parentForm.find('#end_time').val(),
            }
            getLog();
        }
    });

    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
        start_time = laydate.render({
            elem: '#start_time_input',
            max: max,
            type: 'datetime',
            show: true,
            closeStop: '#start_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('#end_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
        end_time = laydate.render({
            elem: '#end_time_input',
            min: min,
            max: getCurrentDate(),
            type: 'datetime',
            show: true,
            closeStop: '#end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
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
        parentForm.find('#keyword').val('');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        pageNo=1;
        resetParam();
        getLog();
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

function reconvert(str){
    str = str.replace(/(\\u)(\w{1,4})/gi,function($0){
        return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g,"$2")),16)));
    });
    str = str.replace(/(&#x)(\w{1,4});/gi,function($0){
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g,"$2"),16));
    });
    str = str.replace(/(&#)(\d{1,6});/gi,function($0){
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2")));
    });

    return str;
}

function viewContent(data) {
    var result = JSON.stringify(JSON.parse(data), null, 4);

    var title = '查看';
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="chooseAttr formModal formMateriel" id="chooseAttr_from" style="text-align: center;">
           <textarea name="" id="textarea" cols="60" rows="25" style="margin: auto;">${reconvert(result)}</textarea>
        </form>`,
        success: function (layero, index) {
        },
        end: function () {
        }
    });
}




