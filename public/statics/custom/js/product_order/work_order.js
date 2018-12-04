var layerModal,
    layerLoading,
    pageNo = 1,
    itemPageNo = 1,
    pageNo1 = 1,
    pageNo2 = 1,
    status=1;
    pageSize = 20,
    work_order_code = '',
    e = {},
    ajaxData = {},
    checkMaterial = [],
    ajaxItemData = {};

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try {
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            delete ajaxData.status;
            delete ajaxData.work_order_code;
            pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
            status = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).status;
            work_order_code = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).work_order_code;
        } catch (e) {
            resetParam();
        }
    }
}

$(function () {
    setAjaxData();
    $('.el-tap[data-status='+status+']').addClass('active').siblings('.el-tap').removeClass('active');
    getWorkOrder(status);
    bindEvent();
    resetParamItem();

});

function bindPagenationClick(totalData, pageSize) {
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData: totalData,
        showData: pageSize,
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
            var status = $('.el-tap.active').attr('data-status');
            getWorkOrder(status);
        }
    });
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        work_order_number: '',
        work_task_number: '',
        production_order_number: '',
        sales_order_code: '',
        sales_order_project_code: '',
        order: 'desc',
        sort: 'id'
    };
}

//获取粗排列表
function getWorkOrder(status) {

    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
    AjaxClient.get({
        url: URLS['order'].workOrderList + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layerLoading = LayerConfig('load');
            }
            ajaxData.pageNo = pageNo;
            ajaxData.status = status;
            ajaxData.work_order_code = work_order_code;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));

            if (status == 0) {
                $(".declare").hide();
                var totalData = rsp.paging.total_records;
                var _html = createHtml(rsp);
                $('.table_page').html(_html);
                if (totalData > pageSize) {
                    bindPagenationClick(totalData, pageSize);
                } else {
                    $('#pagenation.unpro').html('');
                }
            } else if (status == 1) {
                $(".declare").show();
                var totalData = rsp.paging.total_records;
                var _shtml = createProducedHtml(rsp);
                $('.table_page').html(_shtml);
                if (totalData > pageSize) {
                    bindPagenationClick(totalData, pageSize);
                } else {
                    $('#pagenation.produce').html('');
                }
                checkMaterial = [];
                rsp.results.forEach(function (item) {
                    var material_arr = [];
                    if (JSON.parse(item.in_material).length > 0) {
                        for (var i in JSON.parse(item.in_material)) {
                            if (JSON.parse(item.in_material)[i].LGFSB != '') {
                                material_arr.push({
                                    material_id: JSON.parse(item.in_material)[i].material_id,
                                    line_depot: tansferNull(JSON.parse(item.in_material)[i].LGFSB),
                                    product_depot: tansferNull(JSON.parse(item.in_material)[i].LGPRO),
                                    qty: tansferNull(JSON.parse(item.in_material)[i].qty),
                                })
                            }

                        }

                    }
                    if (material_arr.length > 0) {
                        checkMaterial.push({
                            work_order_id: item.work_order_id,
                            sale_order_code: item.sales_order_code ? item.sales_order_code : '',
                            materials: material_arr,
                        });
                    }
                });
            } else if (status == 2) {
                $(".declare").show();
                var totalData = rsp.paging.total_records;
                var _schtml = createFineProducedHtml(rsp);
                $('.table_page').html(_schtml);

                if (totalData > pageSize) {
                    bindPagenationClick(totalData, pageSize);
                } else {
                    $('#pagenation.fineProduce').html('');
                }
                checkMaterial = [];
                rsp.results.forEach(function (item) {
                    var material_arr = [];
                    if (JSON.parse(item.in_material).length > 0) {
                        for (var i in JSON.parse(item.in_material)) {
                            if (JSON.parse(item.in_material)[i].LGFSB == '') {
                                break;
                            } else {
                                material_arr.push({
                                    material_id: JSON.parse(item.in_material)[i].material_id,
                                    line_depot: tansferNull(JSON.parse(item.in_material)[i].LGFSB),
                                    product_depot: tansferNull(JSON.parse(item.in_material)[i].LGPRO),
                                    qty: tansferNull(JSON.parse(item.in_material)[i].qty),
                                })
                            }
                        }

                    }
                    if (material_arr.length > 0) {
                        checkMaterial.push({
                            work_order_id: item.work_order_id,
                            materials: material_arr,
                        });
                    }
                });

            }
            if(work_order_code){
                $("#check_input_"+work_order_code).click();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取调拨单列表失败，请刷新重试', 9);
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    }, this)
}

//生成未排列表数据
function createHtml(data) {
    var viewurl = $('#workOrder_view').val();
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {
            temp = JSON.parse(item.out_material);

            trs += `
			<tr>
			
			<td>${tansferNull(item.sales_order_code)}</td>
			<td>${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td>${tansferNull(temp[0].name)}</td>
			<td>${tansferNull(item.total_workhour)}[s]</td>
			<td>${tansferNull(item.on_off==0?'订单关闭':'订单开启')}</td>
			<td class="right">
	         <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}">查看</a>
	        </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable" >
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">销售订单行项号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">产成品</th>
                        <th class="left nowrap tight">工时</th>
                        <th class="left nowrap tight">订单状态</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro" style="margin-top: 5px;"></div>`;
    $('#showPickingList').hide();
    return thtml;
}

//生成粗排列表数据
function createProducedHtml(data) {
    var viewurl = $('#workOrder_view').val();
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {
            temp = JSON.parse(item.out_material);
            var checkedHtml = '';
            if (work_order_code == item.wo_number) {
                checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input_${item.wo_number}" data-id="${item.wo_number}">
                    <span class="el-checkbox-outset"></span>
                </span>`
            } else {
                checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" id="check_input_${item.wo_number}" data-id="${item.wo_number}">
                    <span class="el-checkbox-outset"></span>
                </span>`
            }

            trs += `
			<tr>
		    <td>${checkedHtml}</td>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td width="200px;">${tansferNull(temp[0].name)}</td>
			<td>${tansferNull(item.work_center)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.work_station_time)}</td>
			<td>${tansferNull(item.up_time)}</td>
			<td>${tansferNull(item.down_time)}</td>
			<td>${tansferNull(item.total_workhour)}[s]</td>
			<td>${tansferNull(item.on_off==0?'订单关闭':'订单开启')}</td>
			<td class="showStatus center" id="showStatus${item.work_order_id}" style="display: none;"></td>
			<td class="right" style="width: 200px;">
			${item.on_off==1?`<div class="btn-group">
                <button type="button" class="button pop-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
                <ul class="dropdown-menu" style="right: 0;left: auto" role="menu">
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1">生成领料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=7">生成补料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturn" data-id="${item.work_order_id}">生成退料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturnWorkshop" data-id="${item.work_order_id}">生成车间退料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createWorkshopPickingList?id=${item.work_order_id}&type=7">生成车间补料单</a></li>
                </ul>
            </div>`:''}
			
	         <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}">查看</a>
	        </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="13" style="text-align: center;">暂无数据</td></tr>';
    }
    var thtml = `<div id="clearHeight" class="wrap_table_div" style="height: ${$(window).height() - 300}px; overflow: scroll;">
            <table id="worker_order_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th width="200px;" class="left nowrap tight">产成品</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">工厂</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">提前天数</th>
                    <th class="left nowrap tight">延迟天数</th>
                    <th class="left nowrap tight">工时</th>
                    <th class="left nowrap tight">订单状态</th>
                    <th class="center nowrap tight showStatus" style="display: none;">MES齐料</th>
                    <th width="200px;" class="right nowrap tight">操作</th>
                </tr>
                </thead>
                <tbody class="table_tbody_producted">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation" style="margin-top: 5px;"></div>`;
    $('#showPickingList').show();
    return thtml;

}

//生成细排列表数据
function createFineProducedHtml(data) {
    var viewurl = $('#workOrder_view').val();
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {
            temp = JSON.parse(item.out_material);

            switch (item.status) {
                case 2:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">等待处理</span>`;
                    break;
                case 3:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已被发布</span>`;
                    break;
                case 4:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">挂起</span>`;
                    break;
                case 5:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">操作异常</span>`;
                    break;
                case 6:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">设备异常</span>`;
                    break;
                case 7:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">物料异常</span>`;
                    break;
                case 8:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">工单变更</span>`;
                    break;
                case 9:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">工单取消</span>`;
                    break;
                case 10:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">完成工单</span>`;
                    break;
                case 11:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">暂停</span>`;
                    break;
                case 12:
                    condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">即将开始</span>`;
                    break;
            }
            var checkedHtml = '';
            console.log(work_order_code);
            console.log(item.wo_number);
            if (work_order_code == item.wo_number) {
                checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input_${item.wo_number}" data-id="${item.wo_number}">
                    <span class="el-checkbox-outset"></span>
                </span>`
            } else {
                checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" id="check_input_${item.wo_number}" data-id="${item.wo_number}">
                    <span class="el-checkbox-outset"></span>
                </span>`
            }
            trs += `
			<tr>
			<td>${checkedHtml}</td>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td>${tansferNull(temp[0].name)}</td>
			<td>${tansferNull(item.work_center)}</td>            
            <td>${tansferNull(item.work_shift_name)}</td>            
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.work_station_time)}</td>
			<td>${tansferNull(item.up_time)}</td>
			<td>${tansferNull(item.down_time)}</td>
			<td>${tansferNull(item.total_workhour)}[s]</td>
			<td>${tansferNull(item.on_off==0?'订单关闭':'订单开启')}</td>
			<!--<td>${tansferNull(condition)}</td>-->
			<td class="showStatus center" id="showStatus${item.work_order_id}" style="display: none;"></td>
			<td class="right">
			${item.on_off==1?`<div class="btn-group">
                <button type="button" class="button pop-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
                <ul class="dropdown-menu" style="right: 0;left: auto" role="menu">
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1">生成领料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=7">生成补料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturn" data-id="${item.work_order_id}">生成退料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturnWorkshop" data-id="${item.work_order_id}">生成车间退料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createWorkshopPickingList?id=${item.work_order_id}&type=7">生成车间补料单</a></li>
                </ul>
            </div>`:''}
	         <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}">查看</a>
	        </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="14" style="text-align:center">暂无数据</td></tr>';
    }
    var thtml = `<div id="clearHeight" class="wrap_table_div" style="height: ${$(window).height() - 300}px; overflow: scroll;">
            <table id="worker_order_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th class="left nowrap tight">产成品</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">工位号</th>
                    <th class="left nowrap tight">工厂</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">提前天数</th>
                    <th class="left nowrap tight">延迟天数</th>
                    <th class="left nowrap tight">工时</th>
                    <th class="left nowrap tight">订单状态</th>
                    <!--<th class="left nowrap tight">状态</th>-->
                    <th class="center nowrap tight showStatus" style="display: none;">MES齐料</th>
                    <th class="right nowrap tight">操作</th>
                </tr>
                </thead>
                <tbody class="table_tbody_fineProducted">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation fineProduce" style="margin-top: 5px;"></div>`;
    $('#showPickingList').show();
    return thtml;
}

function resetAll() {
    var parentForm = $('#searchForm');
    parentForm.find('#sales_order_code').val('');
    parentForm.find('#sales_order_project_code').val('');
    parentForm.find('#work_order_number').val('');
    parentForm.find('#work_task_number').val('');
    parentForm.find('#production_order_number').val('');
    pageNo = 1;
    resetParam();
}

function checkPickings() {
    AjaxClient.post({
        url: URLS['order'].checkApplyMes,
        data: {items: checkMaterial, _token: TOKEN},
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },

        success: function (rsp) {
            layer.close(layerLoading);
            $('.showStatus').show();
            rsp.results.forEach(function (item) {
                if (item.is_full == true) {
                    $('#showStatus' + item.work_order_id).html('');
                    $('#showStatus' + item.work_order_id).html(`<a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1"><span style="display:inline-block;border: 1px solid green;width: 60px;color: green;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">定额领料</span></a>`)
                }
            });
            $('.declare').removeClass('is-disabled');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('.declare').removeClass('is-disabled');
            layer.msg(rsp.message, {icon: 5, offset: '250px', time: 1500});

        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    }, this);
}


function bindEvent() {
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });
    //齐料检查
    $('body').on('click', '.declare:not(".is-disabled")', function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');
        checkPickings();
    })
    $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });

    $('body').on('click', '.el-select', function () {
        if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        } else {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });

    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var status = $(this).attr('data-status');
            ajaxData.pageNo = pageNo;
            ajaxData.status = status;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            $('#pageNnber').val(1)
            $('#status').val(status);
            if (status == 0) {
                $(".declare").hide();
            } else {
                $(".declare").show();
            }
            work_order_code = '';
            resetAll();
            getWorkOrder(status);
        }
    });
    $('body').on('click', '.creatReturn', function (e) {
        e.stopPropagation();
        getCreateReturnMaterial($(this).attr('data-id'));
    });

    $('body').on('click', '.creatReturnWorkshop', function (e) {
        e.stopPropagation();
        getCreateReturnWorkshopMaterial($(this).attr('data-id'));
    });

    $('body').on('click', '.check', function (e) {
        e.stopPropagation();
        checkItem($(this).attr('data-id'));

    });


    //搜索
    $('body').on('click', '#searchForm .submit', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('backageground', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if (!$(this).hasClass('is-disabled')) {
            $(this).addClass('is-disabled');
            var status = $('.el-tap.active').attr('data-status');
            var parentForm = $(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            ajaxData = {
                sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
                work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
                production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
                order: 'desc',
                sort: 'id'
            };
            pageNo = 1;
            getWorkOrder(status);
        }
    });
    //重置搜索框值
    $('body').on('click', '#searchForm .reset', function (e) {
        e.stopPropagation();
        resetAll();
        var status = $('.el-tap.active').attr('data-status');
        getWorkOrder(status);
    });

    //更多搜索条件下拉
    $('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that = $(this);
        that.addClass('noclick');
        if ($(this).find('.el-icon').hasClass('is-reverse')) {
            $('#searchForm .el-item-show').css('background', '#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400, function () {
                that.removeClass('noclick');
            });
        } else {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
                that.removeClass('noclick');
            });
        }
    });


    $('body').on('click', '.el-tap-wrap .el-item-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-item-tap').removeClass('active');
            var status = $(this).attr('data-status');

            ajaxItemData = {
                type: status,
                work_order_code: work_order_code
            };

            if (work_order_code == '') {
                layer.confirm('请选择一个工单！?', {
                    icon: 3, title: '提示', offset: '250px', end: function () {
                    }
                }, function (index) {
                    layer.close(index);
                });
            } else {
                getPickingList();

            }

        }
    });
    $('body').on('click', '.el-checkbox_input_check', function () {
        $(this).parent().parent().parent().find('.el-checkbox_input_check').each(function (k, v) {
            $(v).removeClass('is-checked');
        });
        $("#clearHeight").height($(window).height() - 500);
        $(this).addClass('is-checked');
        work_order_code = $(this).attr('data-id');
        ajaxData.pageNo = pageNo;
        ajaxData.work_order_code = work_order_code;
        window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
        ajaxItemData.work_order_code = work_order_code;
        if (work_order_code == '') {
            layer.confirm('请选择一个工单！?', {
                icon: 3, title: '提示', offset: '250px', end: function () {
                }
            }, function (index) {
                layer.close(index);
            });
        } else {
            getPickingList();

        }

    });

    $('body').on('click', '.item_submit', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');

        layer.confirm('您将执行推送操作！?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            submint(id, type);
        });

    });

    $('body').on('click', '.item_check', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            check(id);
        });

    });
    $('body').on('click', '.buste_submit', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行推送操作！?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            busteSubmint(id);
        });

    });
    $('body').on('click', '.buste_delete', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行删除操作！?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            deleteBusteItem(id);
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
function deleteItem(id) {
    AjaxClient.get({
        url: URLS['work'].delete +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','删除成功！');
            getPickingList();

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','删除失败！错误日志为：'+rsp.message)
        }
    }, this)
}

function busteSubmint(id) {
    AjaxClient.get({
        url: URLS['work'].submitBuste + "?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.RETURNCODE == 0) {
                LayerConfig('success', '成功！');
                getPickingList();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', rsp.message)
        }
    }, this)
}

function deleteBusteItem(id) {
    AjaxClient.get({
        url: URLS['work'].destroy + "?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);

            LayerConfig('success', '成功！');
            getPickingList();

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', rsp.message)
        }
    }, this)
}

function submint(id, type) {
    AjaxClient.get({
        url: URLS['work'].submit + "?" + _token + "&id=" + id + "&type=" + type,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.RETURNCODE == 0) {
                LayerConfig('success', '成功！');
                ajaxItemData = {
                    type: type,
                    work_order_code: work_order_code
                };
                getPickingList();

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', rsp.message);
            // layer.msg('获取工单详情失败，请刷新重试', 9);
        }
    }, this)
}

function checkItem(id) {
    AjaxClient.get({
        url: URLS['work'].checkWork + "?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results) {
                LayerConfig('success', '送检成功！')
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2, offset: '250px'});

            // layer.msg('获取工单详情失败，请刷新重试', 9);
        }
    }, this)
}

function getCreateReturnMaterial(id) {
    AjaxClient.get({
        url: URLS['work'].checkReturnMaterial + "?" + _token + "&work_order_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results) {
                window.location.href = "/WorkOrder/createPickingList?id=" + id + "&type=2";
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2, offset: '250px'});

            // layer.msg('获取工单详情失败，请刷新重试', 9);
        }
    }, this)
}

function getCreateReturnWorkshopMaterial(id) {
    AjaxClient.get({
        url: URLS['work'].checkWorkShopReturnMaterial + "?" + _token + "&work_order_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results) {
                window.location.href = "/WorkOrder/createWorkshopPickingList?id=" + id + "&type=2";
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2, offset: '250px'});

            // layer.msg('获取工单详情失败，请刷新重试', 9);
        }
    }, this)
}

function check(id) {
    AjaxClient.get({
        url: URLS['work'].check + "?" + _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results) {
                LayerConfig('success', '成功！');
                getPickingList();

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2, offset: '250px'});

            // layer.msg('获取工单详情失败，请刷新重试', 9);
        }
    }, this)
}


function bindItemPagenationClick(totalData, pageSize) {
    $('#item_pagenation').show();
    $('#item_pagenation').pagination({
        totalData: totalData,
        showData: pageSize,
        current: itemPageNo,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            itemPageNo = api.getCurrent();
            getPickingList();
        }
    });
}

//重置搜索参数
function resetParamItem() {
    ajaxItemData = {
        type: '',
        work_order_code: ''
    };
}

//获取粗排列表
function getPickingList() {
    var urlLeft = '';
    if (ajaxItemData.type == '') {
        ajaxItemData.type = '1';
    }

    if (ajaxItemData.type == 8) {
        urlLeft += "&workOrder_number=" + ajaxItemData.work_order_code + "&page_no=" + pageNo + "&page_size=" + pageSize;
        AjaxClient.get({
            url: URLS['work'].pageIndex + "?" + _token + urlLeft,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                if (layerModal != undefined) {
                    layerLoading = LayerConfig('load');
                }
                var totalData = rsp.paging.total_records;
                var _html = createBusteItemHtml(rsp);
                $('.show_item_table_page').html(_html);
                if (totalData > pageSize) {
                    bindItemPagenationClick(totalData, pageSize);
                } else {
                    $('#item_pagenation.unpro').html('');
                }

            },
            fail: function (rsp) {
                layer.close(layerLoading);
                noData('获取领料单列表失败，请刷新重试', 9);
            },
            complete: function () {
                $('#searchForm .submit').removeClass('is-disabled');
            }
        }, this)
    } else {
        for (var param in ajaxItemData) {
            urlLeft += `&${param}=${ajaxItemData[param]}`;
        }
        urlLeft += "&page_no=" + itemPageNo + "&page_size=" + pageSize;
        AjaxClient.get({
            url: URLS['work'].MaterialRequisition + "?" + _token + urlLeft,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                if (layerModal != undefined) {
                    layerLoading = LayerConfig('load');
                }
                var totalData = rsp.paging.total_records;
                var _html = createItemHtml(rsp);
                $('.show_item_table_page').html(_html);
                if (totalData > pageSize) {
                    bindItemPagenationClick(totalData, pageSize);
                } else {
                    $('#item_pagenation.unpro').html('');
                }

            },
            fail: function (rsp) {
                layer.close(layerLoading);
                noData('获取领料单列表失败，请刷新重试', 9);
            }

        }, this)
    }

}

//生成领料单列表数据
function createBusteItemHtml(data) {
    var viewurl = $('#workOrder_view').val();
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {

            trs += `
			<tr>
			<td >${tansferNull(item.production_order_code)}</td>
			<td >${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}</td>
			<td >${item.out[0].qty}</td>
			<td width="200px;">${item.out[0].name}</td>
			<td >${item.out[0].GMNGA}</td>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.ISDD + item.ISDZ)}</td>
			<td>${tansferNull(item.IEDD + item.IEDZ)}</td>
			<td>${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '报工完成' : (item.status == 3 || item.status == 4) ? 'SAP报错' : '')}</td>
			<td style="color: ${item.type == 1 ? '#00b3fb' : '#000'}">${tansferNull(item.type == 1 ? '委外报工' : '工单报工')}</td>
			<td class="right">
			${item.status != 2? `<button data-id="${item.id}" class="button pop-button buste_submit">推送</button>` : ''}
		    <a class="button pop-button view" href="/Buste/busteIndex?id=${item.id}&type=edit">查看</a>
			${item.status == 1 ? `<button data-id="${item.id}" class="button pop-button buste_delete">删除</button>` : ''}
	         
	        </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="11" class="center">暂无数据</td></tr>';
    }
    var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable  commontable">
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

//生成领料单列表数据
function createItemHtml(data) {
    var viewurl = $('#workOrderItem_view').val();
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {

            trs += `
			<tr>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
			<td>${tansferNull(item.workbench_code)}</td>
			<td>${tansferNull(item.line_depot_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.workbench_code)}</td>
		    <td>${item.push_type == 0 ?
                `<span style="display: inline-block;border: 1px solid red;color: red;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">线边</span>`
                : item.push_type == 1 ?
                    `<span style="display: inline-block;border: 1px solid green;color: green;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">SAP</span>`
                    : item.push_type == 2 ?
                        `<span style="display: inline-block;border: 1px solid #debf08;color: #debf08;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">车间</span>` :
                        ''
                }</td>
		    <td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.type == 2 ? checkReturnStatus(item.status) : checkPickingStatus(item.status))}</td>
			<td>${tansferNull(checkType(item.type))}</td>
            <td class="right">
	         ${item.status == 1 && item.push_type != 2 ? `<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button item_submit">推送</button>` : ''}
	         ${((item.status == 1) || ((item.status == 2||item.status == 1) && item.type == 2) ) ?`<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button delete">删除</button>`:''}        
             <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">操作</a>        
                    </td>
                    </tr>
`;
        })
    } else {
        trs = '<tr><td colspan="10" class="center">暂无数据</td></tr>';
    }
    var thtml = `<div class="wrap_table_div" style="height: 300px; overflow-y: auto; overflow-x: hidden;" >
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">发送至</th>
                        <th class="left nowrap tight">领料人</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="item_pagenation" class="pagenation unpro" style="margin-top: 5px;"></div>`;
    return thtml;
}

function checkType(type) {
    switch (type) {
        case 1:
            return '领料';
            break;
        case 2:
            return '退料';
            break;
        case 7:
            return '补料';
            break;
        default:
            break;
    }
}

function checkPickingStatus(status) {
    switch (status) {
        case 1:
            return '未发送';
            break;
        case 2:
            return '已推送';
            break;
        case 3:
            return '进行中';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}

function checkReturnStatus(status) {
    switch (status) {
        case 1:
            return '待推送';
            break;
        case 2:
            return '进行中';
            break;
        case 3:
            return '待出库';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}
