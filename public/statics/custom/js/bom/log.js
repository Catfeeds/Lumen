var logId,logListData = {},pageLogNo=1, pageLogSize=10;

$(function () {

    resetLogParam();

    logEvent();


    var _height = $(".logWrap").height()-100-$('.log-modifier-user').outerHeight();

    $('.log-item-container').css({height:_height+'px'});

    //日期选择器
    laydate.render({
        elem: '#log-date',
        type: 'year',
        min: getYear()+'-1-1',
        max: getYear()+7+'-12-31',
        done: function(value, date, endDate){

            logListData.year = value;

            getLogList(logListData);
        }
    });
});

function resetLogParam() {
    logListData = {};
}

function getYear() {
    var date=new Date;
    var _year=date.getFullYear();

    return _year;
}

//分页
function bindLogPagenationClick(total,size) {
    $('.log-pagenation-wrap').show();
    $('#log-pagenation').pagination({
        totalData:total,
        showData:size,
        current: pageLogNo,
        isHide: true,
        coping:false,
        count:1,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageLogNo=api.getCurrent();
            getLogList(logListData);
        }
    });
}

function logEvent() {

    $('body').on('click','.logBtnWrap #showLog',function (evt) {
        $('.logWrap').addClass('open');
        $('.log-container .title .close').addClass('active');

        logId=$('.bom-tree-item.item-name.allBOM.selected').attr('data-bom-id')|| id;
        if(logId!=undefined){
            logListData = {
                year :getYear(),
                owner_type: 'ruis_bom',
                owner_id: logId,
                sort : 'id',
                order : 'desc'
            };
            getUser(logId);
            getLogList(logListData);
        }else{
            layer.msg('url链接缺少id参数，请给到id参数', {icon: 5
                ,offset: '250px'});
        }

    });

    $('body').on('click','.logWrap .logClose',function () {
        $('.logWrap').removeClass('open');
        $('#log-pagenation').hide();
        $('.log-container .title .close').removeClass('active');
    })

    $('body').on('click','#userBtn',function () {
        $(this).toggleClass('selected');

        if($(this).hasClass('selected')){
            $(this).siblings().removeClass('selected');
            var operationId = $(this).attr('data-id');
            logListData.operation_id = operationId;
            pageLogNo=1;
            getLogList(logListData);
        }else{
            if(logListData.operation_id != undefined){
                delete logListData.operation_id
            }
            getLogList(logListData)
        }
    });
}

function getUser(id) {

    var data = {
        year :getYear(),
        owner_type: 'ruis_bom',
        owner_id: id
    }

    var logParam = '';

    for(var param in data){
        logParam += `&${param}=${data[param]}`
    }


    AjaxClient.get({
        url: URLS['log'].operator+ '?'+_token +logParam,
        dataType:'json',
        beforeSend:function () {

        },
        success:function (rsp) {

            getUserData(rsp.results);
        },
        fail:function (err) {
            $('#log .log-modifier-user').html('加载失败')
        }
    },this)
}

function getLogList(data) {

    var logParam = '';

    for(var param in data){
        logParam += `&${param}=${data[param]}`
    }
    logParam+="&page_no="+pageLogNo+"&page_size="+pageLogSize;

    AjaxClient.get({
        url:URLS['log'].logList + '?'+_token+logParam,
        dataType:'json',
        beforeSend:function () {

        },
        success:function (rsp) {

            var pageTotal = rsp.paging.total_records;

            if(pageTotal>pageLogSize){
                bindLogPagenationClick(pageTotal,pageLogSize);
            }else{
                $('#log-pagenation').html('');
            }


            getLogData(rsp.results);
        },
        fail:function (err) {
            $('#log .log-item-ul').html('加载失败')

        }
    },this)
}

function getUserData(data) {
    var ele = $('#log .log-modifier-user');
    ele.html('');

    if(data&&data.length){
        data.forEach(function (item,index) {

            var list = `<span id="userBtn" data-id="${item.operation_id}">${item.operation_name}</span>`;

            ele.append(list);
        })
    }else{
        var list = `<p class="noData">暂无操作用户</p>`;
        ele.append(list);
    }
}

function getLogData(data) {
    var ele = $('#log .log-item-ul');

    ele.html('');

    if(data&&data.length){
        data.forEach(function (item,index) {

            var message = '';

            if(item.events && item.events.length){
                item.events.forEach(function (list) {
                    var style = '',text = '',attachment = '',fileName = '',filePath = '',thumbnail = '',imgPath = '';
                    switch(list.action){
                        case "add":
                            style = "#20a0ff";
                            text = '添加';
                            break;
                        case "delete" :
                            style = '#f00';
                            text = '删除';
                            break;
                        case "update" :
                            style = '#449d44';
                            text = '更新';
                            break;
                        default:
                            style = '#333';
                            text = '';
                    }

                    if(list.field == 'attachment_id'){

                        if(list.extra != ''){
                            fileName = list.extra.filename;
                            filePath = list.extra.path;
                            imgPath = '/'+filePath;

                            var extension =list.extra.extension.toLowerCase();

                            if(extension== 'jpg'|| extension == 'jpeg' || extension == 'png'){
                                thumbnail = `<img width="12" height="12" src="${imgPath}"/>`
                            }
                        }

                        attachment = `<a download="${fileName}" href="/storage/${filePath}"><i class="fa fa-cloud-download log-file-download"></i></a>`
                    }


                    message += `
                                <li><span class="log-operation" style="color:${style}">${text}</span>
                                    <span class="log-message">${list.desc}${attachment}${thumbnail}</span>
                                </li>
                            `
                })
            }

            var li = `<li>
                        <div class="log-info clearfix">
                            <div class="log-item-user">
                                <i class="fa fa-info-circle log-icon"></i>
                                <span class="log-username">${item.operation_name}</span>
                            </div>
                            <div class="log-detail"><ul class="list_item">${message}</ul></div>
                        </div>
                        <p class="log-time">${item.ctime}</p>
                    </li>`;

            ele.append(li);
        })
    }else{
        var li = `<p class="noData">暂无数据</p>`;
        ele.append(li);
    }
}