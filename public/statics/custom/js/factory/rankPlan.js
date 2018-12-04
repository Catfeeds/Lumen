var pageNo = 1, pageSize = 20, ajaxData = {},
    validatorWorkClassToolBox = {
        checkName: function (name) {
            var value = $('.addRankPlan').find('#' + name).val();
            return $('.addRankPlan').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showWorkClassInvalidMessage(name, "班次名称不能为空"), !1) : (!0);
        },
        checkFrom: function (name) {
            var value = $('.addRankPlan').find('#' + name).val().trim();
            return $('.addRankPlan').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showWorkClassInvalidMessage(name, "开始工作时间不能为空"), !1) : (!0);
        },
        checkTo: function (name) {
            var value = $('.addRankPlan').find('#' + name).val().trim();
            return $('.addRankPlan').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showWorkClassInvalidMessage(name, "结束工作时间不能为空"), !1) : (!0);
        },
        checkRestTime: function () {
            var ele = $('#restTimeWrap').find('.validator');
            selectCorrect = 1;
            if (ele.length) {
                ele.each(function (index, item) {
                    if (Validate.checkNull($(item).find('input[name=rest_from]').val().trim()) || Validate.checkNull($(item).find('input[name=rest_to]').val().trim())) {
                        selectCorrect = !1;
                        $('#restTimeWrap .item-wrap').find('.errorMessage').html('时间不能为空').show();
                        return false;
                    }
                });
            }
            return selectCorrect;
        },
        checkType: function (name) {
            var value = $('.addRankPlan').find('#' + name).val().trim();
            return $('.addRankPlan').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showWorkClassInvalidMessage(name, "请选择班次类型"), !1) : (!0);
        }
    },
    remoteWorkClassValidatorToolbox = {
        remoteCheckName: function (flag, name, id) {
            var value = $('#' + name).val().trim();
            getWorkClassUnique(flag, name, value, id, operationId.id, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    var val = '已注册';
                    showWorkClassInvalidMessage(name, val);
                }
            });
        }
    },
    validatorWorkClassConfig = {
        name: 'checkName',
        from: 'checkFrom',
        to: 'checkTo',
        // rest_time:'checkRestTime',
        type_id: 'checkType'
    },
    remoteWorkClassValidatorConfig = {
        name: 'remoteCheckName',
    };

$(function () {
    getRankPlan();
    bindEvent()
})

function showWorkClassInvalidMessage(name, val) {
    $('.addRankPlan').find('#' + name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.addRankPlan').find('.submit').removeClass('is-disabled');
}

function getWorkClassUnique(flag, field, value, id, workshop_id, fn) {
    var urlLeft = '';
    if (flag === 'edit') {
        urlLeft = `&field=${field}&value=${value}&id=${id}&workshop_id=${workshop_id}`;
    } else {
        urlLeft = `&field=${field}&value=${value}&workshop_id=${workshop_id}`;
    }
    var xhr = AjaxClient.get({
        url: URLS['rankPlan'].unique + "?" + _token + urlLeft,
        dataType: 'json',
        success: function (rsp) {
            fn && typeof fn === 'function' ? fn(rsp) : null;
        },
        fail: function (rsp) {
            console.log('唯一性检测失败');
        }
    }, this);
}

function getRankPlan() {
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }

    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;

    AjaxClient.get({
        url: URLS['list'].workClassList + '?' + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var pageTotal = rsp.paging.total_records;

            if (pageTotal > pageSize) {
                bindPagenationClick(pageTotal, pageSize);
            } else {
                $('#pagenation').html('');
            }

            if (rsp.results && rsp.results.length) {
                $('#table_rankplan_table .table_tbody').html(createHtml(rsp.results))
            } else {
                noData('暂无数据', 5);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试', 4);
        }
    }, this)
}

//分页
function bindPagenationClick(total, size) {
    $('.pagenation_wrap').show();
    $('#pagenation').pagination({
        totalData: total,
        showData: size,
        current: pageNo,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            pageNo = api.getCurrent();
            getRankPlan();
        }
    });
}
function timeToSec (timeval) {
    var alltimes = '';
    var hour = timeval.split(':')[0];
    var min = timeval.split(':')[1];
    var sec = timeval.split(':')[2];
    alltimes = Number(hour*3600) + Number(min*60) + Number(sec);
    return alltimes;
}
function createHtml(data) {
    console.log(data);
    var _html = '';

    if (data.length) {
        data.forEach(function (item) {
            _html += ` <tr>
                           <td>${item.type_name}</td>
                           <td>${item.from}</td>
                           <td>${item.to}</td>
                           <td class="right nowrap">
                                <button data-id="${item.rankplan_id}" class="button pop-button view">查看</button>
                                <button data-id="${item.rankplan_id}" class="button pop-button edit">编辑</button>
                                <button data-id="${item.rankplan_id}" class="button pop-button delete">删除</button></td>
                       </tr>`
        })
    }
    return _html;
}

function bindEvent() {
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click', '.el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    //弹窗关闭
    $('body').on('click', '.formModal .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
    //下拉框点击事件
    $('body').on('click', '.el-select', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //下拉框item点击事件
    $('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
            var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }

        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

    //checkbox 点击
    $('body').on('click', '.el-checkbox_input:not(.noedit)', function (e) {
        e.preventDefault();

        if ($('.work_date').hasClass('view')) {
            return false;
        }
        $(this).toggleClass('is-checked');
        if ($(this).hasClass('is-checked')) {
            $('.addRankPlan').find('.el-form-item.w_date .errorMessage').removeClass('active').html('');
        }

    });

    $('body').on('click', '.actions #rankPlan_add', function () {
        showWorkClassModal('add', 0)
    })

    $('body').on('click', '.addRankPlan .submit:not(.is-disabled)', function () {
        var correct = 1, w_date = 1, rest_flag = 1, date_flag = 1;
        for (var type in validatorWorkClassConfig) {
            correct = validatorWorkClassConfig[type] && validatorWorkClassToolBox[validatorWorkClassConfig[type]](type);
            if (!correct) {
                break;
            }
        }
        /*工作日校验*/
        var _works = $('.work_date .el-checkbox_input.is-checked'), work_date = [], rest_from = [];
        $(_works).each(function (k, v) {
            work_date.push($(v).attr('data-checkId'))
        })
        if (work_date.length) {
            w_date = 1;
            $('.addRankPlan').find('.el-form-item.w_date .errorMessage').removeClass('active').html('');
        } else {
            w_date = !1;
            $('.addRankPlan').find('.el-form-item.w_date .errorMessage').addClass('active').html('请选择工作日');
        }
        //休息时间校验
        $('#restTimeWrap .select-item').each(function (k, v) {
            if ($(v).find('input[name=rest_from]').val() == "" || $(v).find('input[name=rest_to]').val() == "") {
                date_flag = !1;
                $('#restTimeWrap .item-wrap').find('.errorMessage').addClass('active').html('时间不能为空');
            } else {

                date_flag = 1;
                $('#restTimeWrap .item-wrap').find('.errorMessage').addClass('active').html('');
                var obj = {
                    rest_from: $(v).find('input[name=rest_from]').val(),
                    rest_to: $(v).find('input[name=rest_to]').val(),
                    comment: $(v).find('input[name=comment]').val(),
                }
                rest_from.push(obj);
            }
        });


        if (correct && w_date && date_flag) {
            if (!$(this).hasClass('is-disabled')) {
                $(this).addClass('is-disabled');
                var parentForm = $(this).parents('#addRankPlan_from'),
                    id = parentForm.find('#itemId').val();

                var from = parentForm.find('#from').val(),
                    to = parentForm.find('#to').val(),
                    type_id = parentForm.find('#type_id').val();

                $(this).hasClass('edit') ? (
                    editRankPlan({
                        rest_time: JSON.stringify(rest_from),
                        from: from,
                        to: to,
                        type_id: type_id,
                        rankplan_id: id,
                        work_date: JSON.stringify(work_date),
                        _token: TOKEN
                    })
                ) : (addRankPlan({
                    from: from,
                    to: to,
                    type_id: type_id,
                    work_date: JSON.stringify(work_date),
                    rest_time: JSON.stringify(rest_from),
                    _token: TOKEN
                }));
            }
        }
        //休息时间
        var startTime = $(".startTime").val();
        var endTime = $(".endTime").val();
        //开始和结束时间
        var startFrom = $("#from").val();
        var toTime = $("#to").val();
        if (startFrom == toTime) {
            $("#toMessage").text("开始时间和结束时间不能相同");
        } else if (startTime == endTime) {
            $("#messageTime").text("开始时间和结束时间不能相同");
        }
        if (startTime == "" && endTime == "") {
            $("#messageTime").text("");
        }
        if (startTime == "" || endTime == "") {
            $("#messageTime").text("");
        }

        if (startFrom == "" && toTime == "") {
            $("#toMessage").text("");
        }
        if (startFrom == "" || toTime == "") {
            $("#toMessage").text("");
        }
        //休息时间
        var hour = startTime.split(':')[0];
        var min = startTime.split(':')[1];
        var sec = startTime.split(':')[2];
        var start = Number(hour * 3600) + Number(min * 60) + Number(sec);
        var hour1 = endTime.split(':')[0];
        var min1 = endTime.split(':')[1];
        var sec1 = endTime.split(':')[2];
        var end = Number(hour1 * 3600) + Number(min1 * 60) + Number(sec1);
        if (start > end) {
            $("#messageTime").text("结束时间要大于开始时间");
        }
       //开始和结束时间
        var h = startFrom.split(':')[0];
        var m = startFrom.split(':')[1];
        var s = startFrom.split(':')[2];
        var st = Number(h * 3600) + Number(m * 60) + Number(s);
        var h1 = toTime.split(':')[0];
        var m1 = toTime.split(':')[1];
        var s1 = toTime.split(':')[2];
        var ed = Number(h1 * 3600) + Number(m1 * 60) + Number(s1);
        if (st > ed) {
                $("#toMessage").text("结束时间要大于开始时间");
                $("#startMessage").text("");
            }


    })

    $('body').on('click', '.table_tbody .pop-button', function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if ($(this).hasClass('view')) {
            viewRankPlan(id, 'view');
        } else if ($(this).hasClass('edit')) {
            viewRankPlan(id, 'edit');
        } else if ($(this).hasClass('connect')) {
            var name = $(this).attr('data-name');
            showRelationPeople(id, name);
        } else {

            layer.confirm('将执行删除操作?', {
                icon: 3, title: '提示', offset: '250px', end: function () {
                    $('.uniquetable tr.active').removeClass('active');
                }
            }, function (index) {
                layer.close(index);
                deleteRankPlan(id);
            });
        }
    })

    //添加休息时间
    $('body').on('click', '.rest-item-add', function () {
        var rest_additem = $('#restTimeWrap .item-select-wrap').find('.select-item'),
            last_val = '',
            flag = $('#addRankPlan_from').attr('data-flag'),
            s_val = rest_additem.last().find('.startTime').val(),
            e_val = rest_additem.last().find('.endTime').val();
        if(rest_additem.length){
            if (s_val!=''&&e_val!=''&&s_val!=undefined&&e_val!=undefined){
                if (s_val!=undefined&&e_val!=undefined&&s_val == e_val){
                    rest_additem.last().find('.errorMessage').text('开始和结束时间不能相等');
                    console.log('开始和结束时间');
                }else{
                    var time_to_start = timeToSec(s_val);
                    var time_to_end = timeToSec(e_val);
                    if (time_to_start>time_to_end){
                            rest_additem.last().find('.errorMessage').text('开始时间不能大于结束时间');
                        }else {
                        $('#dataType_item_add').siblings('.errorMessage').removeClass('active').html('');
                        var len = $('#restTimeWrap').find('.select-item').length + 1,
                            index_len = $('#restTimeWrap').find('.select-item').length;
                        if (index_len > 0) {
                            var time_id = $('#restTimeWrap .select-item').last().find('.startTime').attr('data-index');
                            len = parseInt(time_id) + 1;
                        }
                        $('#restTimeWrap .item-select-wrap').append(createRestOptionHtml(len));
                        if (rest_additem && rest_additem.length >= 1) {
                            last_val = rest_additem.last().find('.endTime').val();
                        } else {
                            last_val = "00:00:00";
                        }
                        renderLayDate(['#rest_from' + len, '#rest_to' + len], flag, last_val);
                    }
                }
            }else{
                rest_additem.last().find('.errorMessage').text('请填写开始和结束时间');
            }
        }else{
            $('#restTimeWrap .item-select-wrap').append(createRestOptionHtml(1));
            renderLayDate(['#rest_from1', '#rest_to1'], flag,'00:00:00');
        }
    })

    //删除休息时间
    $('body').on('click', '.rest-item-delete', function () {
        $(this).parents('.select-item').remove();
        $('#restTimeWrap').find('.errorMessage').html('').show();

    })

    $('body').on('focus', '#addRankPlan_from .el-input:not([readonly],.date)', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '#addRankPlan_from .el-input:not([readonly],.date)', function () {
        var flag = $('#addRankPlan_from').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#addRankPlan_from #itemId').val();
        validatorWorkClassConfig[name]
        && validatorWorkClassToolBox[validatorWorkClassConfig[name]]
        && validatorWorkClassToolBox[validatorWorkClassConfig[name]](name)
        && remoteWorkClassValidatorConfig[name]
        && remoteWorkClassValidatorToolbox[remoteWorkClassValidatorConfig[name]]
        && remoteWorkClassValidatorToolbox[remoteWorkClassValidatorConfig[name]](flag, name, id);

    });
    $('body').on('blur', '#addRankPlan_from  #to', function () {
        $('#toMessage').text("");
    })

    //下拉框的相关事件
    $('body').on('focus', '.el-select .el-input', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.el-select .el-input', function () {
        var name = $(this).siblings('input').attr("id");

        var obj = $(this);

        setTimeout(function () {

            if (obj.siblings('input').val() == '') {

                validatorWorkClassConfig[name]
                && validatorWorkClassToolBox[validatorWorkClassConfig[name]]
                && validatorWorkClassToolBox[validatorWorkClassConfig[name]](name);

            } else {

                $('.addRankPlan').find('#' + name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);

    });
}

//查看班次
function viewRankPlan(id, flag) {
    AjaxClient.get({
        url: URLS['rankPlan'].show + "?rankplan_id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            showWorkClassModal(flag, id, rsp.results);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5, offset: '250px', time: 1500});
        }
    }, this);
}

//编辑班次
function editRankPlan(data) {
    AjaxClient.post({
        url: URLS['rankPlan'].update,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getRankPlan()
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp.code == 1163) {
                layer.msg(rsp.message, {icon: 2});
            } else if (rsp.code == 1161) {
                layer.msg(rsp.message, {icon: 2});
            }
            // layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addRankPlan_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if (rsp.field !== undefined) {
                showWorkClassInvalidMessage(rsp.field, rsp.message);

            }
        }
    }, this);
}

//删除班次
function deleteRankPlan(id) {
    AjaxClient.get({
        url: URLS['rankPlan'].delete + "?rankplan_id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            getRankPlan()
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            } else {
                layer.msg('删除失败', {icon: 2, offset: '250px', time: 1500});
            }
        }
    }, this);
}

//添加班次
function addRankPlan(data) {
    AjaxClient.post({
        url: URLS['rankPlan'].add,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = layer.load(2, {shade: false, offset: '300px'});
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getRankPlan()
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp.field !== undefined) {
                showWorkClassInvalidMessage(rsp.field, rsp.message);
            }
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message)
            }
        },
        complete: function () {
            $('.addRankPlan .submit').removeClass('is-disabled');
        }
    }, this)

}

//班次
function showWorkClassModal(flag, ids, data) {
    var labelWidth = 135, readonly = '', btnShow = 'btnShow', title = '查看班次', noEdit = '',code='',
        {rankplan_id = '', type_name = '', workcenter_name = '', workcenter_id = '', from = '', to = '', work_date = [],code=''} = {};

    if (data) {
        ({
            rankplan_id = '',
            type_name = '',
            workcenter_name = '',
            workcenter_id = '',
            from = '',
            to = '',
            work_date = []
        } = data);
    }
    flag === 'view' ? (btnShow = 'btnHide', readonly = 'readonly="readonly"') : (flag === 'edit' ? (title = '编辑班次', noEdit = 'readonly="readonly"') : title = '添加班次');
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '90px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        // move: false,
        content: `<form class="addRankPlan formModal" id="addRankPlan_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="el-form-item rankType_select">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">班次类型<span class="mustItem">*</span></label>
                            ${flag == 'add' ? `<div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="type_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                    </ul>
                                </div>
                            </div>` : `<input type="text" id="type_id" readonly class="el-input" placeholder="" value="${type_name}">`}
                            
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">开始时间<span class="mustItem">*</span></label>
                            <input type="text" id="from" ${readonly} class="el-input date" placeholder="请选择开始时间" value="${from}">
                        </div>
                        <p class="errorMessage" id="startMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">结束时间<span class="mustItem">*</span></label>
                            <input type="text" id="to" ${readonly} class="el-input date" placeholder="请选择结束时间" value="${to}">
                        </div>
                        <p class="errorMessage " id="toMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item w_date">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 110px;">工作日<span class="mustItem">*</span></label>
                            <div class="work_date ${flag}"></div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item restTimeWrap" id="restTimeWrap">
                            
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
</form>`,
        success: function (layero, index) {
            layerEle = layero;

            getRankPlanType();

            if (flag != 'add' && work_date != '') {
                var obj = JSON.parse(work_date);
                showWorkDate(obj);
            } else {
                showWorkDate();
            }

            $('#restTimeWrap').html(createRestHtml(data, flag));
            var ele = ['#from', '#to'];
            if (flag == 'edit') {
                if (data && data !== null && data !== "null") {
                    var jsonData = JSON.parse(data.rest_time);
                    if (jsonData && jsonData.length) {
                        $.each(jsonData, function (k, v) {
                            ele.push('#rest_from' + (k + 1));
                            ele.push('#rest_to' + (k + 1));
                        })
                    }
                }
            }
            var rest_additem = $('#restTimeWrap .item-select-wrap').find('.select-item');
            if (rest_additem&&rest_additem.length>1){
                var last_val = rest_additem.eq(-2).find('.endTime').val();
            }else{
                var last_val = "00:00:00";
            }
            renderLayDate(ele, flag, last_val);
        },
        end: function () {
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

function getRankPlanType() {
    AjaxClient.get({
        url: URLS['rankPlan'].type + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);

            if (rsp.results && rsp.results.length) {
                var lis = '', innerhtml = '';

                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });

                innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.rankType_select').find('.el-select-dropdown-list').html(innerhtml);
            }

            setTimeout(function () {
                getLayerSelectPosition($(layerEle));
            }, 200);
        },
        fail: function (rsp) {
            layer.close(layerLoading);

        }
    }, this);
}

function showWorkDate(work_date) {
    var weekDay = [ '周日','周一', '周二', '周三', '周四', '周五', '周六'];
    var _box = '';
    for (var i in weekDay) {
        _box += `<span class="el-checkbox_input" data-checkId="${i}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">${weekDay[i]}</span>
                     </span>`;
    }

    $('.work_date').html(_box);

    if (work_date) {
        for (var j in work_date) {
            $('.work_date').find('.el-checkbox_input[data-checkId=' + work_date[j] + ']').addClass('is-checked')
        }
    }

}

function createRestHtml(data, flag) {
    var sehtml = '', addBtn = '';
    if (data && data !== null && data !== "null") {
        var jsonData = JSON.parse(data.rest_time);
        if (jsonData && jsonData.length) {
            $.each(jsonData, function (k, v) {
                sehtml += createRestOptionHtml(k + 1, v, flag);
            })
        }
    }
    if (flag != 'view') {
        addBtn = `<div class="el-form-item">
            <div class="el-form-item-div" id="dataType_item_add">
                <label class="el-form-item-label" style="width: 107px;">休息时间<span class="mustItem">*</span></label>
                <button type="button" class="el-button rest-item-add">添加项</button>
            </div>
            <p class="errorMessage" style="padding-left: 84px;"></p>
        </div>`;
    } else {
        addBtn = `<div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 107px;">休息时间<span class="mustItem">*</span></label>
            </div>`
    }
    var selectHtml = `${addBtn}
    <div class="item-wrap" style="margin-left: 100px"> 
        <div class="item-select-wrap">
            ${sehtml}
        </div>
        <p class="errorMessage" style="padding-left: 84px;"></p>
    </div>`;
    return selectHtml;
}

function createRestOptionHtml(index, item, flag) {
    var displaySty = '', readonly = '';
    flag == 'view' ? (displaySty = 'none', readonly = 'readonly') : '';
    var itemDelete = `<div calss="el-item-wrap">
                    <i class="fa fa-minus-circle rest-item-delete ${displaySty}"></i> 
            </div>`;
    var itemHtml = `<div class="el-form-item select-item">
        <div class="el-form-item-div">
            <div class="el-item-wrap validator" style="margin-left: 5px;">
                 <input type="text" style="width: 30%" name="rest_from" id="rest_from${index}" data-index="${index}" ${readonly}  class="el-input date startTime" placeholder="开始时间" value="${item ? item.rest_from : ''}"> -
                 <input type="text" style="width: 30%" name="rest_to" id="rest_to${index}" data-index="${index}" ${readonly}  class="el-input date endTime" placeholder="结束时间" value="${item ? item.rest_to : ''}">
                 <input type="text" style="width: 30%" name="comment" ${readonly} class="el-input" placeholder="请输入注释" value="${item ? item.comment : ''}">
                 <p class="errorMessage " id="messageTime"style="padding-left: 84px;padding-top: 8px;"></p>
            </div>
           
            ${itemDelete}
        </div>        
    </div>`;

    return itemHtml;
}

function renderLayDate(ele, flag, last_val) {
    if (flag == 'view') {
        return false;
    }
    ele.forEach(function (item) {
        laydate.render({
            elem: item,
            type: 'time',
            min: last_val,
            change: function (value) {
                $('#restTimeWrap .item-wrap').find('.errorMessage').addClass('active').html('');
                $('.addRankPlan').find('#from').parents('.el-form-item').find('.errorMessage').removeClass('active').html('');
            }
        });
    })
}