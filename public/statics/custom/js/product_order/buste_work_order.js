var wo_number,work_order_id,in_flag=1,out_flag=1,id=0,edit='',production_order_id=0,operation_order_id=0,scrollTop=0;
var print_str='',print_str_qrcode='',line_depot_id,line_depot_code,depot_name;
var new_in_material = [];
var item_no = [];
var in_material={};
var out_material={},
    sales_order_code,
    sales_order_project_code ,
    routing_node_id ,
    po_number,
    factory_id,
    pageNo=1,
    pageSize=20,
    pageNoItem=1,
    pageSizeItem=50,
    depot_id;
$(function () {
    id = getQueryString('id');
    edit = getQueryString('type');
    if(id==null){
        $('#work_order_form').focus();
        $('#start_time').val(getCurrentDateZore);
        $('#end_time').val(getCurrentTime);
        $('#start_time_input').text(getCurrentDateZore);
        $('#end_time_input').text(getCurrentTime);


    }else {
        getBusteWorkForm(id);
    }
    bindEvent();

});
function gitArr() {
    var arr = $('#work_order_form').val();
    wo_number = arr.substr(arr.indexOf('WO'),15);
    $('#JsBarcode').JsBarcode(wo_number);
    return wo_number

}
function getSearch(){
    $.when(gitArr())
        .done(function(gitArr){
            if(gitArr){
                getWorkOrderform(wo_number)

            }
        }).fail(function(gitArr){
    }).always(function(){
    });
}

function getBusteWorkForm(id) {
    AjaxClient.get({
        url: URLS['work'].show+"?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            work_order_id = rsp.results[0].workOrder_id;
            production_order_id = rsp.results[0].production_id;
            operation_order_id = rsp.results[0].operation_id;
            routing_node_id = rsp.results[0].routing_node_id;
            line_depot_id=rsp.results[0].line_depot_id;
            $('#work_order_form').attr("readonly","readonly");
            $('.storage').hide();
            if(rsp.results[0].type==1){
                $('#work_order_form').hide()
            }
            if(rsp.results[0].status==2){
                $('.submit').hide();
                $('.submit_SAP').hide();
                $('.print').show();
            }
            if(rsp.results[0].status==1){
                $('.submit').hide();
                $('.submit_SAP').show();
            }
            var arr = [];
            if(rsp.results[0].is_teco==1){
                $('#is_teco').addClass('is-checked')
            }


            rsp.results[0].out_materials.forEach(function (item) {
                arr.push({
                    "CHARG":item.lot,
                    "BATHN":item.GMNGA
                })
            });
            if(rsp.results[0].sales_order_code==''){
                print_str_qrcode = {
                    "HEADER":{
                        "SURNO":rsp.results[0].code,
                        "SURST":"01",
                        "CDAT":rsp.results[0].ctime.substr(0,10),
                        "WERKS":rsp.results[0].planfactory_code,
                        "INTYP":"E"
                    },
                    "LINE":{
                        "PNO":rsp.results[0].production_number,
                        "PLN":"",
                        "LGORT":rsp.results[0].plan_LGPRO,
                        "MATNR":rsp.results[0].out_materials[0].material_item_no,
                        "PLNTN":rsp.results[0].out_materials[0].GMNGA,
                        "MEINS":rsp.results[0].out_materials[0].commercial,
                        "BATLS":arr,
                    }
                };
                print_str = "</br>生产单号："+rsp.results[0].production_number
                    + "</br> 物料号：" + rsp.results[0].out_materials[0].material_item_no
                    + "</br>批次号：" + rsp.results[0].out_materials[0].lot
                    + "</br>完工时间：" + rsp.results[0].end_time.substr(0,11)
                    + "</br> 数量：" + rsp.results[0].out_materials[0].GMNGA
                    + "</br> 工厂：" + rsp.results[0].planfactory_code
                    + "</br> 地点：" + rsp.results[0].plan_LGPRO;
            }else {
                print_str_qrcode = {
                    "HEADER":{
                        "SURNO":rsp.results[0].code,
                        "SURST":"01",
                        "CDAT":rsp.results[0].ctime.substr(0,10),
                        "WERKS":rsp.results[0].planfactory_code,
                        "INTYP":"E"
                    },
                    "LINE":{
                        "PNO":rsp.results[0].production_number,
                        "PLN":"",
                        "LGORT":rsp.results[0].plan_LGPRO,
                        "MATNR":rsp.results[0].out_materials[0].material_item_no,
                        "PLNTN":rsp.results[0].out_materials[0].GMNGA,
                        "KDAUF":rsp.results[0].sales_order_code,
                        "KDPOS":rsp.results[0].sales_order_project_code,
                        "MEINS":rsp.results[0].out_materials[0].commercial,
                        "BATLS":arr,
                    }
                };
                print_str = "销售订单号："+rsp.results[0].sales_order_code
                    +"</br>销售行项号："+rsp.results[0].sales_order_project_code
                    +"</br>生产单号："+rsp.results[0].production_number
                    + "</br> 物料号：" + rsp.results[0].out_materials[0].material_item_no
                    + "</br>批次号：" + rsp.results[0].out_materials[0].lot
                    + "</br>完工时间：" + rsp.results[0].end_time.substr(0,11)
                    + "</br> 数量：" + rsp.results[0].out_materials[0].GMNGA
                    + "</br> 工厂：" + rsp.results[0].planfactory_code
                    + "</br> 地点：" + rsp.results[0].plan_LGPRO;
            }

            //二维码
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 255,
                height: 255,
            });

            var margin = ($("#qrcode").height() - $("#qrCodeIco").height()) / 2; //控制Logo图标的位置
            $("#qrCodeIco").css("margin", margin);
            makeCode(JSON.stringify(print_str_qrcode), qrcode);

            if(rsp.results && rsp.results.length){
                if(!rsp.results[0].plan_LGPRO){
                    var textarea = "销售订单号："+rsp.results[0].sales_order_code
                        +"\r\n生产单号：" + rsp.results[0].production_number
                        +"\r\n工单："+rsp.results[0].workOrder_number
                        +"\r\n完工时间：" + rsp.results[0].end_time.substr(0,11)
                        +"\r\n计划工厂：" + rsp.results[0].planfactory_code
                        +"\r\n批次号：" + rsp.results[0].out_materials[0].lot
                        +"\r\n数量：" + rsp.results[0].out_materials[0].GMNGA
                        +"\r\n单位：" + rsp.results[0].out_materials[0].commercial
                        +"\r\n产成品生产仓储地点未找到";
                    $('#work_order_form').val(textarea);
                }else {
                    var textarea = "销售订单号："+rsp.results[0].sales_order_code
                        +"\r\n生产单号："+rsp.results[0].production_number
                        +"\r\n工单："+rsp.results[0].workOrder_number
                        +"\r\n完工时间：" + rsp.results[0].end_time.substr(0,11)
                        +"\r\n计划工厂：" + rsp.results[0].planfactory_code
                        +"\r\n批次号：" + rsp.results[0].out_materials[0].lot
                        +"\r\n数量：" + rsp.results[0].out_materials[0].GMNGA
                        +"\r\n单位：" + rsp.results[0].out_materials[0].commercial
                        +"\r\n生产仓储地点：" + rsp.results[0].plan_LGPRO;
                    $('#work_order_form').val(textarea);
                }
            }
            if(rsp.results[0].start_time=='1970-01-01 08:00:00'){
                $('#start_time').val(getCurrentDateZore);
                $('#end_time').val(getCurrentTime);
                $('#start_time_input').text(getCurrentDateZore);
                $('#end_time_input').text(getCurrentTime);
            }else {
                $('#start_time').val(rsp.results[0].start_time);
                $('#end_time').val(rsp.results[0].end_time);
                $('#start_time_input').text(rsp.results[0].start_time);
                $('#end_time_input').text(rsp.results[0].end_time);
            }
            if(rsp.results[0].stands.length>0){
                var workCenterHtml=''
                rsp.results[0].stands.forEach(function (item) {
                    if(item.code =='ZPP001' || item.code=='ZPP002'){
                    }else {
                        workCenterHtml+= `<div class="work_center_item" data-id="${item.param_item_id}" data-item_id="${item.id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
                    }
                });
                $('#show_workcenter').html(workCenterHtml);
                $('#show_workcenter').show();
            }
            showInItemView(rsp.results[0].in_materials,rsp.results[0].status);
            showOutItemView(rsp.results[0].out_materials,rsp.results[0].status);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','获取报工单详情失败，请刷新重试')
        }
    }, this)
}
//二维码
function makeCode(str, qrcode) {
    qrcode.makeCode(str);
}

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
                LayerConfig('success','推送成功！');
                getBusteList();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}
function bindEvent() {
    $("body").on('blur','.consume_num',function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var num = $(this).val()-$(this).parent().parent().find('.beath_qty').val();
            $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
        }

    });
    $("body").on('blur','.beath_qty',function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var num = $(this).parent().parent().find('.consume_num').val()-$(this).val()
            $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
        }

    });
    $('body').on('click','.submit_SAP',function (e) {
        e.stopPropagation();

        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id);
        });

    });
    $('body').on('click','.submit',function (e) {
        e.stopPropagation();
        if(edit=='edit'){
            editBuste();
        }else {
            addBuste();

        }
    });
    $(window).scroll(function() {
        scrollTop = $(document).scrollTop();
        $('.line_depot,.depot').each(function (k,v) {
            var that = $(v);
            var width=$(v).width();
            var offset=$(v).offset();
            $(v).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
        })
    });

    $('body').on('click','.line_depot,.depot',function (e) {
        e.stopPropagation();
        var that = $(this);
        var width=$(this).width();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
    });
    $('body').on('click','.table_tbody .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
    $('body').on('blur','#work_order_form',function (e) {
        if(edit!='edit'){
            var arr = $('#work_order_form').val();
            wo_number = arr.substr(arr.indexOf('WO'),15);
            $('#JsBarcode').JsBarcode(wo_number);
            if(wo_number){
                // $('.submit').show();
                getWorkOrderform(wo_number);
                getBusteList(wo_number)

            }
        }
    });
    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var that = $(this);
            var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
            start_time = laydate.render({
                elem: '#start_time_input',
                max: max,
                format:'yyyy-MM-dd HH:mm:ss',
                type: 'time',
                show: true,
                closeStop: '#start_time',
                done: function (value, date, endDate) {
                    that.val(value);
                }
            });
        }
    });
    $('#end_time').on('click', function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var that = $(this);
            var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
            end_time = laydate.render({
                elem: '#end_time_input',
                min: min,
                format:'yyyy-MM-dd HH:mm:ss',
                max: getCurrentDate(),
                type: 'time',
                show: true,
                closeStop: '#end_time',
                done: function (value, date, endDate) {
                    that.val(value);
                }
            });
        }
    });

    $('body').on('click','.print',function (e) {
        e.stopPropagation();
        showPrintModal()

    });
    $('body').on('click', '#printWt', function (e) {
        $("#dowPrintWt").print();
    });
    $('body').on('click','.el-checkbox_input_check',function(){
        if(edit!='edit'){
            $(this).toggleClass('is-checked');
        }
    });
    $('body').on('click','.select',function(e){
       e.stopPropagation();
       showCause($(this).attr('data-id'))
    });
    $('body').on('click','#viewCause .cause_submit',function(e){
       e.stopPropagation();
       layer.close(layerModal);
       var material_id = $("#itemId").val();
       var _ele = $("#material"+material_id);
       _ele.html('');
       $('#practice_table .table_tbody tr').each(function (item) {
           if($(this).find('.el-checkbox_input_check').hasClass('is-checked')){
               let itemc = $(this).data('trData');
               _ele.append(`<span>
                                <div style="display: inline-block">${itemc.name}-${itemc.description}</div>
                            </span>`);
               _ele.find('span:last-child').data("spanData",itemc);
           }
       })
    });
}
function showCause(id) {
    var _ele = $("#material"+id),arr_couse = [];

    _ele.find('span').each(function (item) {
        arr_couse.push($(this).data('spanData'))
    });
    layerModal = layer.open({
        type: 1,
        title: '选择原因',
        offset: '100px',
        area: ['500px', '500px'],
        shade: 0.1,
        shadeClose: false,
        resize: true,
        content: `<form class="viewAttr formModal" id="viewCause">
                    <input type="hidden" id="itemId" value="${id}">
                    <div class="table_page">
                        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
                            <table id="practice_table" class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th class="left nowrap tight">名称</th>
                                    <th class="left nowrap tight">备注</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                                </thead>
                                <tbody class="table_tbody"></tbody>
                            </table>
                        </div>
                        <div id="pagenationItem" class="pagenation bottom-page"></div>
                    </div>
                    <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary cause_submit">确定</button>
                    </div>
                </div>
                </form>`,
        success: function (layero, index) {
            getSpecialCauseData(arr_couse)
        }
    })
}
function bindPagenationClickItem(totalData,pageSize){
    $('#pagenationItem').show();
    $('#pagenationItem').pagination({
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
            getSpecialCauseData();
        }
    });
}
function getSpecialCauseData(arr_couse){
    $('#practice_table .table_tbody').html('');
    var urlLeft='';

    urlLeft+="&page_no="+pageNoItem+"&page_size="+pageSizeItem;
    AjaxClient.get({
        url: URLS['specialCause'].pageIndex+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtmlItem($('#practice_table .table_tbody'),rsp.results,arr_couse)
            }else{
                noData('暂无数据',9)
            }
            if(totalData>pageSizeItem){
                bindPagenationClickItem(totalData,pageSizeItem);
            }else{
                $('#pagenationItem').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',4);
        }
    })
}
function createHtmlItem(ele,data,arr_couse) {
    data.forEach(function (item,index) {
        if(arr_couse.length>0){
            var index_arr = 0;
            arr_couse.forEach(function (itemc,index) {
                if(item.preselection_id==itemc.preselection_id){
                    var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                    index_arr = index+1;
                    ele.append(tr);
                    ele.find('tr:last-child').data("trData",item);
                }
            });
            // console.log(arr_couse.length-1);
            if(index_arr==0){
                var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);
            }

        }else {
            var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        }

    })
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

//获取粗排列表
function getBusteList(wo_number){
    var urlLeft='';

        urlLeft+='&workOrder_number='+wo_number;

    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);

            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation.unpro').html('');
            }
            if(rsp.results.length>0){
                uniteTdCells('work_order_table');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',12);
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
		    <a class="button pop-button view" href="${viewurl}?id=${item.id}&type=edit">查看</a>	         
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="12" class="center">暂无数据</td></tr>';
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
function showPrintModal() {

    layerModal = layer.open({
        type: 1,
        title: '打印',
        offset: '200px',
        area: ['500px', '400px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="viewAttr formModal" id="viewattr">
	
					<div style="height: 40px;text-align: right;">
						<button data-id="" type="button" class="button pop-button" id="printWt">打印</button>
					</div>
					<div id="dowPrintWt" style="width: 10cm;height: 7cm;border: 1px;">
					    <div style="display: flex;">
					        <div id="formPrintWt" style="flex: 1;">${print_str}</div>
						    <div style="flex: 1;">
							    <div id="qrcodewt" style="width:220px; height:220px;">
								    <div id="qrCodeIcowt"></div>
							    </div>
						    </div>
                        </div>		
					</div>
                </form>`,
        success: function (layero, index) {
            //二维码
            var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
                width: 220,
                height: 220,
                correctLevel : QRCode.CorrectLevel.L
            });
            makeCode(JSON.stringify(print_str_qrcode), qrcodewt);
        },
        end: function () {
            $('.out_material .item_out .table_tbody').html('');
        }

    })
}
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
function getCurrentDateZore() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 00:00:00';
}
function getCurrentTime() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate(),
        _h = curDate.getHours(),
        _m = curDate.getMinutes(),
        _s = curDate.getSeconds();
    return _year + '-' + _month + '-' + _day +' ' + _h +':' + _m +':' + _s;
}
function editBuste() {
    var in_materials=[],out_materials=[];
    $('#show_in_material .table_tbody tr').each(function (k,v) {
        var $itemPo=$(v).find('.depot');
        var line_depot_id=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').id:'';
        var line_depot_code=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').code:'';
        in_materials.push({

            id:$(v).attr('data-item-id'),
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            GMNGA:$(v).find('.consume_num').val(),
            lot:$(v).find('.batch').text(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            material_spec:$(v).find('.material_spec').text(),
            qty:$(v).find('.qty').text(),
            line_depot_id:line_depot_id,
            line_depot_code:line_depot_code,
            MKPF_BKTXT:$(v).find('.MKPF_BKTXT').val(),
            MSEG_ERFMG:$(v).find('.difference_num').val(),
            is_spec_stock:$(v).attr('data-spec_stock'),
        })
    });

    $('#show_out_material .table_tbody tr').each(function (k,v) {
        var $itemPo=$(v).find('.line_depot');
        var line_depot_id=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').id:'';
        var line_depot_code=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').code:'';
        out_materials.push({
            id:$(v).attr('data-item-id'),
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            GMNGA:$(v).find('.consume_num').val(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            material_spec:$(v).find('.material_spec').text(),
            qty:$(v).find('.qty').text(),
            line_depot_id:line_depot_id,
            line_depot_code:line_depot_code,
            MKPF_BKTXT:'',
            MSEG_ERFMG:'',
            is_spec_stock:$(v).attr('data-spec_stock'),
        })
    });
    var workCenter = $('#show_workcenter .work_center_item');
    var workCenterArr=[];
    workCenter.each(function (k,v) {
        workCenterArr.push({
            id:$(v).attr('data-item_id'),
            standard_item_id:$(v).attr('data-id'),
            standard_item_code:$(v).attr('data-code'),
            value:$(v).find('.workValue').val()?$(v).find('.workValue').val():'',
        })
    });

    if($('#start_time').val().length<0 || $('#end_time').val()<0){
        LayerConfig('fail','请选择报工单执行时间！');
    }else {
        var data = {
            id:id,
            work_order_id:work_order_id,
            production_order_id:production_order_id,
            operation_order_id:operation_order_id,
            start_time: $('#start_time').val(),
            end_time: $('#end_time').val(),
            in_materials:JSON.stringify(in_materials),
            out_materials:JSON.stringify(out_materials),
            stands:JSON.stringify(workCenterArr),
            _token:TOKEN
        };
        AjaxClient.post({
            url: URLS['work'].update,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success','成功！');
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail','失败！');

            }
        }, this)
    }
}

function addBuste() {
    var flag=true;
    var in_materials=[],out_materials=[];
    item_no.forEach(function (nitem) {
        var count = 0;
        var qty = 0;
        var mater=''
        $('#show_in_material .table_tbody tr').each(function (k,v) {
            var trDataMt = $(v).data('trDataMt');
            if(trDataMt.item_no==nitem){
                qty=trDataMt.qty;
                count += Number($(v).find('.beath_qty').val());
            }
            mater=trDataMt.item_no
        });
        if(count>qty){
            LayerConfig('fail',nitem+'物料的定额总量不能大于计划数量')
            // layer.msg(mater+'物料的定额总量不能大于计划数量', {icon: 3,offset: '250px'});
            flag=false;
            return false;
        }

    });


    $('#show_in_material .table_tbody tr').each(function (k,v) {
        var trData = $(v).data('trData');
        var trDataMt = $(v).data('trDataMt');
        if(Number($(v).find('.beath_qty').val())>Number(trData.storage_number)){
            LayerConfig('fail',trDataMt.item_no+'物料的额定数量不能大于库存数量')

            // layer.msg(trDataMt.item_no+'物料的额定数量不能大于库存数量', {icon: 3,offset: '250px'});
            flag=false;
            return false;
        }else if(Number($(v).find('.consume_num').val())>Number(trData.storage_number)){
            LayerConfig('fail',trDataMt.item_no+'物料的消耗数量不能大于库存数量')

            // layer.msg(trDataMt.item_no+'物料的消耗数量不能大于库存数量', {icon: 3,offset: '250px'});
            flag=false;
            return false;
        }else {
            if(trDataMt.item_no!=="99999999"){
                var arr_couse = [];
                var _ele = $(v).find('.MKPF_BKTXT'),arr_couse = [];

                _ele.find('span').each(function (item) {
                    arr_couse.push($(this).data('spanData').preselection_id)
                });
                var str = arr_couse.join()
                in_materials.push({
                    id:'',
                    material_id:$(v).attr('data-id'),
                    LGFSB:$(v).attr('data-LGFSB'),
                    LGPRO:$(v).attr('data-LGPRO'),
                    GMNGA:$(v).find('.consume_num').val(),
                    lot:$(v).find('.batch').text(),
                    batch_qty:$(v).find('.beath_qty').val(),
                    unit_id:$(v).find('.unit').attr('data-unit'),
                    qty:$(v).find('.qty').text(),
                    MKPF_BKTXT:str,
                    MSEG_ERFMG:$(v).find('.difference_num').val(),
                    is_spec_stock:$(v).attr('data-spec_stock')?$(v).attr('data-spec_stock'):'',
                    batch:trData.batch,
                    depot_id:trData.depot_id,
                    inve_id:trData.inve_id,
                    storage_number:trData.storage_number,
                });

            }
        }
    });

    $('#show_out_material .table_tbody tr').each(function (k,v) {
        var $itemPo=$(v).find('.line_depot');

        var line_depot_id=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').id:'';
        var line_depot_code=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').code:'';
        out_materials.push({
            id:'',
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            GMNGA:$(v).find('.consume_num').val(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            qty:$(v).find('.qty').text(),
            line_depot_id:line_depot_id,
            line_depot_code:line_depot_code,
            MKPF_BKTXT:'',
            MSEG_ERFMG:'',
            is_spec_stock:$(v).attr('data-spec_stock')?$(v).attr('data-spec_stock'):'',
        })
    });
    var workCenter = $('#show_workcenter .work_center_item');
    var workCenterArr=[];
    workCenter.each(function (k,v) {
        workCenterArr.push({
            id:'',
            standard_item_id:$(v).attr('data-id'),
            standard_item_code:$(v).attr('data-code'),
            value:$(v).find('.workValue').val()?$(v).find('.workValue').val():'',
        })
    });
    if($('#start_time').val().length<0 || $('#end_time').val()<0){
        LayerConfig('fail','请选择报工单执行时间！');
    }else {
        var data = {
            work_order_id:work_order_id,
            routing_node_id:routing_node_id,
            sale_order_code:sales_order_code,
            sales_order_project_code:sales_order_project_code,
            product_order_code:po_number,
            factory_id:factory_id,
            line_depot_id:depot_id,
            start_time: $('#start_time').val(),
            end_time: $('#end_time').val(),
            in_materials:JSON.stringify(in_materials),
            out_materials:JSON.stringify(out_materials),
            stands:JSON.stringify(workCenterArr),
            is_teco:$('#is_teco').hasClass('is-checked')?1:0,
            _token:TOKEN
        };
        if(flag){
            AjaxClient.post({
                url: URLS['work'].WorkDeclareOrder,
                data:data,
                dataType: 'json',
                beforeSend: function () {
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    layer.confirm('工单保存成功！', {icon: 1, title:'提示',offset: '250px',end:function(){
                    }}, function(index){
                        layer.close(index);
                        window.location.href = "/Buste/busteIndex?id="+rsp.results.instore_id+"&type=edit";
                    });
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail',rsp.message);

                }
            }, this)
        }

    }



}

function getWorkOrderform(wo_number) {
    AjaxClient.get({
        url: URLS['order'].workOrderShow + _token + "&wo_number=" + wo_number,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            work_order_id = rsp.results.work_order_id;
            routing_node_id = rsp.results.routing_node_id;
            sales_order_code = rsp.results.sales_order_code;
            sales_order_project_code = rsp.results.sales_order_project_code;
            po_number = rsp.results.po_number;
            factory_id = rsp.results.factory_id;
            depot_id = rsp.results.depot_id;
            getWorkcenter(rsp.results.workcenter_id);

            $('.submit').show();
            $('.print').hide();
             //
             in_material = JSON.parse(rsp.results.in_material);
             out_material = JSON.parse(rsp.results.out_material);
             var material_arr = [];
             item_no = [];
             in_material.forEach(function (item) {
                 material_arr.push(item.material_id);
                 item_no.push(item.item_no);
             });
            line_depot_id=rsp.results.line_depot_id,line_depot_code=rsp.results.line_depot_code,depot_name=rsp.results.depot_name;
            if(material_arr.length>0){
                getMaterialBatch(rsp.results.po_number,rsp.results.sales_order_code,rsp.results.wo_number,material_arr);
            }else {
                showOutItem();
            }
        //
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)
}

function getWorkcenter(id) {
    AjaxClient.get({
        url: URLS['order'].workcenter+"?"+_token+"&workcenter_id="+id,
        dataType: 'json',
        success:function (rsp) {
            var workCenterHtml=''
            rsp.results.forEach(function (item) {
                if(item.code =='ZPP001' || item.code=='ZPP002'){
                }else {
                    workCenterHtml+= `<div class="work_center_item" data-id="${item.param_item_id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
                }
            });
            $('#show_workcenter').html(workCenterHtml);
            $('#show_workcenter').show();
        },
        fail: function(rsp){
            console.log('获取车间列表失败');
        }
    });
}
function getMaterialBatch(po,so,wo,mt) {
    AjaxClient.get({
        url: URLS['order'].getMaterialBatch + _token + "&work_order_code=" + wo+ "&sale_order_code=" + so+ "&product_order_code=" + po+ "&material_ids=" + mt+"&line_depot_id="+line_depot_id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            new_in_material=[];
            in_material.forEach(function (item) {
                var batch_arr=[];
                var materials = rsp.results[item.material_id];
                if(materials){
                    if(materials.length>0){
                        materials.forEach(function (mater) {
                            batch_arr.push({
                                batch : mater.batch,
                                inve_id : mater.inve_id,
                                depot_id : mater.depot_id,
                                depot_code : mater.depot_code,
                                unit_name : mater.unit_name,
                                unit_id : mater.unit_id,
                                storage_number : mater.storage_number,
                                sale_order_code : mater.sale_order_code,
                                product_order_code : mater.product_order_code,
                            })

                        })
                    }
                }else {
                    batch_arr.push({
                        batch : '',
                        inve_id : '',
                        depot_id : '',
                        depot_code : '',
                        unit_name : '',
                        unit_id : '',
                        storage_number : '',
                        sale_order_code : '',
                        product_order_code : '',
                    })
                }
                item.batchs=batch_arr;
                new_in_material.push(item);

            });
            showInItem(new_in_material);
            showOutItem();
            // getWorkOrderform(wo_number,rsp.results);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('fail','获取工单详情失败，请刷新重试')
        }
    }, this)
}

//出料
function showOutItem() {
    $('#batch').hide();
    var ele = $('#show_out_material .table_tbody');
    ele.html("");
    out_material.forEach(function (item, index) {
        var tempt = item.material_attributes;
        var inattrs = '';
        tempt.forEach(function (item) {
            inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
        })
        var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                    <td width="100px;">${tansferNull(item.item_no)}</td>
                    <td width="150px;">${tansferNull(item.name)}</td>
                    <td class="qty">${tansferNull(item.qty)}</td>
                    <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
                    <td  class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(item.qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    <td  class="firm" style="padding: 3px;">
                        <div class="el-select-dropdown-wrap">
                                <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${line_depot_id}" value="${line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                        </div>
                    </td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
        if(depot_name){
            $('#line_depot'+out_flag).val(depot_name+'（'+line_depot_code+'）').data('inputItem',{id:line_depot_id,depot_name:depot_name,code:line_depot_code}).blur();
        }
        $('#line_depot'+out_flag).autocomplete({
            url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
            param:'depot_name',
            showCode:'depot_name'
        });
        out_flag++;

    })
}



//进料
function showInItem(data) {
    var _ele = $("#show_in_material .table_tbody");
    _ele.html("");
    data.forEach(function (item) {
        if(item.item_no!="99999999") {
            item.batchs.forEach(function (bitem) {
                var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                        <td width="100px;">${tansferNull(item.item_no)}</td>
                        <td width="150px;">${tansferNull(item.name)}</td>
                        <td class="batch">${bitem.batch}</td>
                        <td class="qty ${tansferNull(item.item_no)}">${item.qty}</td>
                        <td><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.qty}"  placeholder="" class="beath_qty deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td class="storage">${tansferNull(bitem.sale_order_code)}</td>
                        <td class="storage">${tansferNull(bitem.product_order_code)}</td>
                        <td class="storage">${tansferNull(bitem.storage_number)}</td>
                        <td style="padding: 3px;"><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
                        <td style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td style="padding: 3px;">
                            <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                            <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
                        </td>
                   </tr>`;
                _ele.append(tr);
                _ele.find('tr:last-child').data("trData", bitem).data("trDataMt", item);
            });
        }
    });
    uniteTdCells('show_in_material');
    uniteTdCellsitem('show_in_material');
}
function uniteTdCellsitem(tableId) {
    var table = document.getElementById(tableId);
    for (let i = 0; i < table.rows.length; i++) {
        for (let c = 0; c < table.rows[i].cells.length; c++) {
            if (c == 0 || c == 1) { //选择要合并的列序数，去掉默认全部合并
                for (let j = i + 1; j < table.rows.length; j++) {
                    let cell1 = table.rows[i].cells[c].innerHTML;
                    let cell2 = table.rows[j].cells[c].innerHTML;
                    if (cell1 == cell2) {
                        table.rows[j].cells[c].style.display = 'none';
                        table.rows[j].cells[c].style.verticalAlign = 'middle';
                        table.rows[i].cells[c].rowSpan++;
                    } else {
                        table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
                        break;
                    };
                }
            }
        }
    }
};
function uniteTdCells(tableId) {
    var table = document.getElementById(tableId);
    for (let i = 0; i < table.rows.length; i++) {
        var c=3;
        for (let j = i + 1; j < table.rows.length; j++) {
            let cell1 = table.rows[i].cells[c].getAttribute('class');
            let cell2 = table.rows[j].cells[c].getAttribute('class');
            if (cell1 == cell2) {
                table.rows[j].cells[c].style.display = 'none';
                table.rows[j].cells[c].style.verticalAlign = 'middle';
                table.rows[i].cells[c].rowSpan++;
            } else {
                table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
                break;
            };
        }
    }
};
// 出料
function showOutItemView(data,status) {
    var ele = $('#show_out_material .table_tbody');
    ele.html("");
    data.forEach(function (item, index) {


        var tr = `<tr data-id="${item.material_id}"  data-spec_stock="${item.is_spec_stock}" data-item-id="${item.id}" data-declare="${item.declare_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                        <td width="100px;">${tansferNull(item.material_item_no)}</td>
                        <td width="150px;">${tansferNull(item.material_name)}</td>
                        <td>${tansferNull(item.lot)}</td>
                        <td class="qty">${tansferNull(item.qty)}</td>
                        <td  class="unit"  data-unit="${item.unit_id}">${tansferNull(item.commercial?item.commercial:'')}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" ${status!=1?'readonly="readonly"':''}  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td  class="firm" style="padding: 3px;">
                            <div class="el-select-dropdown-wrap">
                                     <input type="text"  class="el-input line_depot" ${status!=1?'readonly="readonly"':''} id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.line_depot_id}" value="${item.line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                            </div>
                        </td>
                    </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);
        if(item.depot_name){
            $('#line_depot'+out_flag).val(item.depot_name+'（'+item.line_depot_code+'）').data('inputItem',{id:item.line_depot_id,depot_name:item.depot_name,code:item.line_depot_code}).blur();
        }
        $('#line_depot'+out_flag).autocomplete({
            url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
            param:'depot_name',
            showCode:'depot_name'
        });
        out_flag++;
    })
}

//进料
function showInItemView(data,status) {
    var ele = $('#show_in_material .table_tbody');
    ele.html("");
    data.forEach(function (item, index) {
        var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.is_spec_stock}" data-item-id="${item.id}" data-declare="${item.declare_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                        <td width="100px;">${tansferNull(item.material_item_no)}</td>
                        <td width="150px;">${tansferNull(item.material_name)}</td>
                        <td class="batch">${tansferNull(item.lot)}</td>
                        <td class="qty ${tansferNull(item.material_item_no)}">${tansferNull(item.qty)}</td>
                        <td class="batch_qty"><input type="number" min="0" readonly class="batch_qty deal" value="${tansferNull(item.batch_qty)}" style="line-height:20px;width: 100px;font-size: 10px;"> </td>
                        <td class="storage">${tansferNull(item.sale_order_code)}</td>
                        <td class="storage">${tansferNull(item.product_order_code)}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td  class="unit" data-unit="${item.unit_id}">${tansferNull(item.commercial)}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="${item.MSEG_ERFMG}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td  class="firm" style="padding: 3px;"><textarea name="" readonly id="" class="MKPF_BKTXT" cols="20" rows="3">${item.MKPF_BKTXT}</textarea></td>
                    </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);
    });
    uniteTdCells('show_in_material');
    uniteTdCellsitem('show_in_material');
}


