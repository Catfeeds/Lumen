var layerModal,
    layerLoading,
    layerOffset,
    pageNo=1,
    showFlag = 0,
    pageSize=20,
    ajaxData={},
    ids=[],
    itemIds=[],
    chooseId,
    unitData=[],
    disposeData=[
        {
            id:1,
            name:'退货'
        },
        {
            id:2,
            name:'让步接收'
        },
        {
            id:3,
            name:'特采'
        }
    ],
    departmentData=[
    ],
    sceneData=[
        {
            id:1,
            name:'进料'
        },{
            id:2,
            name:'制程'
        },{
            id:3,
            name:'成品'
        }
    ],
    chooseArr=[];
$(function(){
    resetParam();
    getSearch();
    getChecks();
    bindEvent();
    $('#type_id').autocomplete({
        url: URLS['check'].templateList+"?"+_token,
        param:'name'
    });

});

function getSearch(){
    $.when(getDepartment())
        .done(function(departmentrsp){
            departmentData = departmentrsp.results;
        }).fail(function(departmentrsp){
        console.log('获取失败');
    }).always(function(){
        layer.close(layerLoading);
    });
};
function getDepartment(val) {
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['abnormal'].department+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
};



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
            getChecks();
        }
    });
};

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        material_name: '',
        check_type_code: '',
        factory_name: '',
        LGFSB:'',
        LGPRO:'',
        start_time: '',
        end_time: '',
        operation_name:''
    };
}

//获取检验列表
function getChecks(){
    var urlLeft='&check_resource=3';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    var  url = URLS['check'].export+"?"+_token+urlLeft;
    $('#exportExcel').attr('href',url)
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['check'].select+"?"+_token+urlLeft,
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
            console.log(showFlag);
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',15);
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
            noData('获取物料列表失败，请刷新重试',15);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}



//生成列表数
function createHtml(ele,data){
    ele.html('');
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td class="left norwap">
		             <span class="el-checkbox_input el-checkbox_input_check" id="${item.id}">
		                <span class="el-checkbox-outset"></span>
                    </span>
		        </td>
                <td>${tansferNull(item.code)}</td>
                <td>${tansferNull(item.sales_order_code)}</td>
                <td>${tansferNull(item.sales_order_project_code)}</td>
                <td>${tansferNull(item.po_number)}</td>
                <td>${tansferNull(item.wo_number)}</td>
                <td>${tansferNull(item.operation_name)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td width="100px;">${tansferNull(item.attr)}</td>
                <td>${tansferNull(item.pro_factory_name)}</td>
                <td>${tansferNull(item.order_number)}</td>
                <td> <input type="number" onkeyup="value=value.replace(/\\-/g,'')" data-id="${item.id}" class="number_val deal" value="${tansferNull(item.amount_of_inspection)}" style="border: none;color: #393939;font-size: 12px;"></td>
                <td class="showtime" ${showFlag==0?'style="display: none;"':''}>${item.ctime}</td>
                <td class="showtime" ${showFlag==0?'style="display: none;"':''}>${item.check_time}</td>
                <td>${item.result==null?'':item.result==0?'合格':'不合格'}</td>
                <td>${tansferNull(item.admin_name)}</td>
                <td>${tansferNull(item.card_id)}</td>
                <td class="right">
                    <button data-id="${item.work_order_id}" class="button pop-button process">工艺文件</button>
                    <button data-id="${item.material_id}" class="button pop-button attachment">附件</button>
             
                    <button data-id="${item.id}" class="button pop-button check">检验</button>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

function getworkOrderView(id) {
    AjaxClient.get({
        url: URLS['order'].workOrderShow + _token + "&work_order_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var group_routing_package = JSON.parse(rsp.results.group_routing_package);
            viewWtModal(group_routing_package)


        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取工单详情失败，请刷新重试', {icon: 5,offset: '250px',time: 1500});
        }

    }, this)
}
function viewWtModal(group_routing_package) {
    var wwidth = $(window).width() - 80,
        wheight = $(window).height() - 80,
        mwidth = wwidth + 'px',
        mheight = wheight + 'px';
    var lableWidth = 100;
    layerModal = layer.open({
        type: 1,
        title: '查看工艺',
        offset: '40px',
        area: [mwidth, mheight],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="viewAttr formModal" id="viewattr">	
					<div id="formPrintWt"></div>
    </form>`,
        success: function (layero, index) {
            createPreview(group_routing_package);
        },
        end: function () {
            $('.out_material .item_out .table_tbody').html('');
        }

    })
}
function createPreview(data) {
    if(typeof data == 'string') {
        data = JSON.parse(data);
    }
    var stepBlocks = '', in_flag = '';
    var stepItems = '';
    var step_draw = '';
    data.forEach(function (sitem) {


        var s_draw = [], s_material_in = '', s_material_out = '';
        if (sitem.step_drawings && sitem.step_drawings.length) {
            sitem.step_drawings.forEach(function (sditem) {
                s_draw.push(sditem.image_name)
            })
        }
        if (sitem.material && sitem.material.length) {
            var material_in = getFilterPreviewData(sitem.material, 1),
                material_out = getFilterPreviewData(sitem.material, 2);
            if (material_in.length) {
                s_material_in = cpreviewAttr(material_in, 'in');
            } else {
                s_material_in = `<span class="no_material">无</span>`;
            }
            if (material_out.length) {
                s_material_out = cpreviewAttr(material_out, 'out');
            } else {
                s_material_out = `<span class="no_material">无</span>`;
            }
        } else {
            s_material_out = s_material_in = `<span class="no_material">无</span>`;
        }
        // 能力
        var name_desc = '', work_center = '';
        if (sitem.abilitys && sitem.abilitys.length) {
            sitem.abilitys.forEach(function (descitem, sindex) {
                name_desc += `<table width="400" style="background: #f0f0f0; text-align: left; margin: 5px 0;">
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">${sindex + 1}.能力&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${descitem.ability_name}</td>
                          </tr>
                          ${descitem.description != null && descitem.description != '' ? `<tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;能力描述&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
                              ${descitem.description}
                            </td>
                          </tr>`: ''}
                        </table>`;
            });
        } else {
            name_desc = '';
        }
        var work_arr = sitem.workcenters;
        // 工作中心
        if (work_arr) {
            work_arr.forEach(function (witem,windex) {
                work_center += `<table width="200" style="background: #f0f0f0; text-align: left; margin: 5px;">
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">${windex + 1}.编码&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${witem.code}</td>
                          </tr>
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;名称&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
                              ${witem.name}
                            </td>
                          </tr>
                        </table>`;
            });

        } else {
            work_center = '';
        }
        stepItems += `<tr>
                   <td>${sitem.index}</td>
                   <td>${sitem.name}</td>
                   <td align="left">${name_desc}</td>
                   <td>${work_center}</td>
                   <td class="pre_material ma_in">${s_material_in}</td>
                   <td class="pre_material ma_out">${s_material_out}</td>
                   <!--<td class="pre_bgcolor imgs">${s_draw.join(',')}</td>-->
                   <td class="pre_bgcolor desc" style="word-break: break-all">${tansferNull(sitem.description)}</td>
                   <td class="pre_bgcolor desc">${tansferNull(sitem.comment)}</td>
                 </tr>`;

        if (sitem.step_drawings && sitem.step_drawings.length) {
            sitem.step_drawings.forEach(function (ditem) {
                step_draw += `<div class="preview_draw_wrap" data-url="${ditem.image_path}">
				 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
				 <p>${ditem.code}</p>
				 </div>`;
            })
        } else {
            step_draw = '';
        }

    });

    stepBlocks = `<div class="route_preview_container">
                    <table>
                        <thead>
                          <tr>
                              <th style="width:45px;">序号</th>
                              <th style="width:60px;">步骤</th>
                              <th style="width:200px;">能力</th>
                              <th>工作中心</th>
                              <th>消耗品</th>
                              <th>产成品</th>
                              <!--<th>图纸</th>-->
                              <th>标准工艺</th>
                              <th>特殊工艺</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${stepItems}
                          <tr><td colspan="8"><div class="draw_content clearfix">${step_draw}</div></td></tr>

                        </tbody>
                    </table>
                    <div class="img_expand_pre"></div>
                 </div>`
    if (stepBlocks) {
        $('#formPrintWt').html(stepBlocks);
    } else {
        $('#formPrintWt').html('');
    }
}

function getFilterPreviewData(dataArr, type) {
    return dataArr.filter(function (e) {
        return e.type == type;
    });
}
function cpreviewAttr(data, flag) {
    var bgColor = '', str = '';
    if (flag == 'in') {
        bgColor = 'ma_in';
    } else {
        bgColor = 'ma_out';
    }
    data.forEach(function (mitem) {
        var ma_attr = '', ma_attr_container = '';
        if (mitem.attributes && mitem.attributes.length) {
            mitem.attributes.forEach(function (aitem) {
                if (aitem.from == 'erp') {
                    aitem.commercial = "null";
                }
                ma_attr += `<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.commercial == 'null' ? '' : [aitem.commercial]}</td></tr>`;
            });
            ma_attr_container = `<table>${ma_attr}</table>`;
        } else {
            ma_attr = `<span>暂无数据</span>`;
            ma_attr_container = `<div style="color:#999;margin-top: 20px;">${ma_attr}</div>`;
        }
        str += `<div class="route_preview_material ${bgColor}">
              <div class="pre_code">${mitem.material_code}(${mitem.material_name})</div>
              <div class="pre_attr">${ma_attr_container}</div>
              <div class="pre_unit"><span>${mitem.qty}</span><p>${mitem.commercial}</p></div>
              <div class="pre_unit" style="width: 100px"><span>描述</span><p>${mitem.desc}</p></div>
          </div>`;
    });
    return str;
}

//获取类别列表
function getQCType(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['type'].select+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}



//生成下拉框数据
function selectHtml(fileData,parent_id){
    var innerhtml,selectVal,parent_id;
    var lis=selecttreeHtml(fileData,parent_id);
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="type_id" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            ${lis}
        </ul>
    </div>`;
    itemSelect=[];
    return innerhtml;
}

function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
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
    //显示与隐藏
    $('body').on('click','#show_all_time',function(e){
        e.stopPropagation();
        $('.showtime').toggle();
        if($(this).text()=='显示'){
            $(this).text('隐藏');
            showFlag=1;
        }else {
            $(this).text('显示');
            showFlag=0;
        }
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    //弹窗取消
    $('body').on('click','.formIQCCheck:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('body').on('blur','.number_val',function (e) {
        e.stopPropagation();
        updateAmountInspection($(this).attr('data-id'),$(this).val())
    });

    // //排序
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
        getChecks();
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
        var width=$(this).width();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width).css({top: offset.top+33-layerOffset.top,left: offset.left-layerOffset.left});
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
    //搜索物料属性
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        var $itemJP=$('#type_id');
        var type_code=$itemJP.data('inputItem')==undefined||$itemJP.data('inputItem')==''?'':
            $itemJP.data('inputItem').name==$itemJP.val().trim().replace(/\（.*?）/g,"")?$itemJP.data('inputItem').code:'';

        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                code: parentForm.find('#order_id').val().trim(),
                material_name: parentForm.find('#material_id').val().trim(),
                factory_name: parentForm.find('#factory_name').val().trim(),
                LGPRO: parentForm.find('#LGPRO').val().trim(),
                LGFSB: parentForm.find('#LGFSB').val().trim(),
                start_time: parentForm.find('#start_time').val(),
                end_time: parentForm.find('#end_time').val(),
                operation_name: parentForm.find('#operation').val().trim(),
                check_type_code: type_code,
            };
            getChecks();
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
    //树形表格展开收缩
    $('body').on('click','.treeNode .itemIcon',function(){
        if($(this).parents('.treeNode').hasClass('collasped')){
            $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
            showChildren($(this).parents('.treeNode').attr("data-id"));
        }else{
            $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
            hideChildren($(this).parents('.treeNode').attr("data-id"));
        }
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
        parentForm.find('#order_id').val('');
        parentForm.find('#material_id').val('');
        parentForm.find('#factory_name').val('');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        parentForm.find('#operation').val('');
        parentForm.find('#LGFSB').val('');
        parentForm.find('#LGPRO').val('');
        parentForm.find('#type_id').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getChecks();
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

    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("id")
        if($(this).hasClass('is-checked')){
            if(ids.indexOf(id)==-1){
                ids.push(id);
            }
        }else{
            var index=ids.indexOf(id);
            ids.splice(index,1);
        }
    });

    $('body').on('click','.el-checkbox_input_items',function(){
        $(this).toggleClass('is-checked');
        var parent = $(this).parent().parent();
        var index = [].indexOf.call(parent.parent().children(), parent[0]);

        if($(this).hasClass('is-checked')&&index==0){
            $('.el-checkbox_input_items').each(function () {
                $(this).addClass('is-checked');
                var itemid=$(this).attr("id")
                if($(this).hasClass('is-checked')){
                    if(itemIds.indexOf(itemid)==-1){
                        itemIds.push(itemid);
                    }
                }
            })
        }else {
            var id=$(this).attr("id")
            if($(this).hasClass('is-checked')){
                if(itemIds.indexOf(id)==-1){
                    itemIds.push(id);
                }
            }else{
                var index=itemIds.indexOf(id);
                itemIds.splice(index,1);
            }
        }
    });


    $('.button_check').on('click',function(){
        if(ids.length){
            checkResult('more');
        }else{
            LayerConfig('fail','请选择检验单！');
        }
    });

    $('.table_tbody').on('click','.check',function(){
        ids=[];
        $(this).parent().parent().parent().find('.el-checkbox_input_check').each(function (v,i) {
            $(i).removeClass('is-checked');
        })
        $(this).parent().parent().find('.el-checkbox_input_check').addClass('is-checked');
        ids.push($(this).attr('data-id'));
        checkResult('single');
    });
    $('body').on('click','#addIQCCheck_from:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addIQCCheck_from');
            $(this).addClass('is-disabled');
            parentForm.addClass('disabled');
            var check_result=parentForm.find("input[name='check_result']:checked").val(),
                dispose = $('#dispose').val()?$('#dispose').val():'',
                unit_id = $('#unit_id').val()?$('#unit_id').val():'',
                question_description = $('#question_description').val()?$('#question_description').val():'',
                deadly = $('#deadly').val()?$('#deadly').val():'',
                seriousness = $('#seriousness').val()?$('#seriousness').val():'',
                slight = $('#slight').val()?$('#slight').val():'',
                dispose_ideas = $('#dispose_ideas').val()?$('#dispose_ideas').val():'',
                missing_items = $('#missing_items').val()?$('#missing_items').val():'',
                scene = $('#scene').val()?$('#scene').val():'',
                department = $('#department').val()?$('#department').val():'';
            checkSubmit({
                check_result:check_result,
                dispose:dispose,
                unit_id:unit_id,
                question_description:question_description,
                deadly:deadly,
                seriousness:seriousness,
                slight:slight,
                dispose_ideas:dispose_ideas,
                missing_items:missing_items,
                scene:scene,
                department:department,
                _token:TOKEN
            });
        }

    });
    $('body').on('click','#addBindTemplate_from:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addBindTemplate_from');
            $(this).addClass('is-disabled');
            parentForm.addClass('disabled');
            var id=parentForm.find("#id").val();
            var $itemJP=$('#template');
            var template=$itemJP.data('inputItem')==undefined||$itemJP.data('inputItem')==''?'':
                $itemJP.data('inputItem').name==$itemJP.val().trim().replace(/\（.*?）/g,"")?$itemJP.data('inputItem').id:'';
            bindTemplate({
                check_id:id,
                check_type:template,
                _token:TOKEN
            });
        }

    });
    //
    // $('body').on('click','.bind_template',function (e) {
    //     e.stopPropagation();
    //     viewTemplate($(this).attr('data-id'));
    // });
    $('body').on('click','.sumbit',function (e) {
        e.stopPropagation();
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行推送操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            sumbitCheck(id);
        });
    });
    $('body').on('click','.attachment',function (e) {
        e.stopPropagation();
        var id=$(this).attr("data-id");
        getMaterial(id);

    });
    $('body').on('click','.process',function (e) {
        e.stopPropagation();
        var id=$(this).attr("data-id");
        getworkOrderView(id);

    });
    //弹窗取消
    $('body').on('click','.cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    //图片放大
    $('body').on('click', '.pic-img', function () {
        var imgList, current;
        if ($(this).hasClass('pic-list-img')) {
            imgList = $(this).parents('ul').find('.pic-li');
            current = $(this).parents('.pic-li').attr('data-id');
        } else {
            imgList = $(this);
            current = $(this).attr('data-id');
        }
        showBigImg(imgList, current);
    });


};

function updateAmountInspection(id,value) {
    AjaxClient.post({
        url: URLS['check'].updateAmountInspection,
        dataType: 'json',
        data:{'check_id':id,'amount_of_inspection':value,_token:TOKEN},
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getChecks();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

            getChecks();

        }
    },this);
}

function getMaterial(id) {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['check'].Material + "?" + _token + "&material_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                showAttachment(rsp.results.attachments);
            } else {
                console.log('获取附件失败');
            }
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取附件失败');
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}
//查询图纸模态框
function showAttachment(formData) {
    var title = '附件',

        layerModal = layer.open({
            type: 1,
            title: title,
            offset: '70px',
            area: '300px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            move: '.layui-layer-title',
            moveOut: true,
            content: `<form class="attachmentForm formModal formAttachment" id="attachment_form">
            
            
            <div class="table table_page">
                <div id="pagenation" class="pagenation"></div>
                <table id="table_pic_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th class="center">缩略图</th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody">
                        <tr>
                            <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </form>`,
            success: function (layero, index) {
                layerEle = layero;
                createAttachmentTable(formData);
                getLayerSelectPosition($(layero));
            },
            end: function () {

            }
        });
}
function createAttachmentTable(data) {
    $('#attachment_form .table_tbody').html('');
    if (data.length) {
        data.forEach(function (item, index) {
            var str = item.filename.substring(item.filename.indexOf('.')+1,item.filename.length),_html='';
            if(str=='jpg'||str=='png'||str=='jpeg'||str=='gif'){
                _html=`<img width="60px;" heigth="60px;" data-id="${item.attachment_id}" data-src="${window.storage}${item.path}" class="pic-img" width="80" height="40" src="${window.storage}${item.path}"/>`;
            }else {
                _html=`<a href="${window.storage}${item.path}"><i style="font-size: 48px;color: #428bca;" class="el-icon el-input-icon fa-file-o"></i></a>`;
            }
            var tr = `
                <tr class="tritem" data-id="${item.attachment_id}">
                    <td><div style="width: 120px;word-break: break-all;white-space: normal;word-wrap: break-word;">${tansferNull(item.name)}</div></td>
                    <td class="center">${_html}</td>              
                </tr>`;
            $('#attachment_form .table_tbody').append(tr);
            $('#attachment_form .table_tbody').find('tr:last-child').data('picItem', item);
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('#attachment_form .table_tbody').append(tr);
    }
}
function sumbitCheck(id) {
    AjaxClientSap.get({
        url: URLS['check'].pushInspectOrder+"?"+_token+"&check_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getChecks();
            LayerConfig('success','推送成功！');
            updateStatus(id);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','推送失败！');
            getChecks();
        }
    },this);
}
function updateStatus(id) {
    AjaxClient.get({
        url: URLS['check'].pushInspectOrder+"?"+_token+"&check_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    },this);
}

function bindTemplate(data) {
    AjaxClient.post({
        url: URLS['check'].selectTemplate,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getChecks();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addBindTemplate_from').removeClass('disabled').find('.submit').removeClass('is-disabled');

        }
    },this);
}
function bindTemplateModal(id,data) {
    var labelWidth=100,
        btnShow='btnShow',
        title='绑定模板',

        textareaplaceholder='',
        readonly='',
        noEdit='';
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="formModal formBindTemplate" id="addBindTemplate_from" >
            <input type="hidden" id="id" value="${id}">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">模板</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" id="template" class="el-input" autocomplete="off" placeholder="模板" value="">
                    </div>
                </div>
            </div>

            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));

            $('#template').autocomplete({
                url: URLS['check'].templateList+"?"+_token,
                param:'name'
            });
            $('#template').each(function(item){
                var width=$(this).parent().width();
                $(this).siblings('.el-select-dropdown').width(width);

            });
            if(data.name){
                $('#template').val(data.name+'（'+data.code+'）').data('inputItem',data).blur();

            }

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });

}

function checkResult(flag) {
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['template'].select+"?"+_token+"&ids="+ids.toString(),
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results.template&&rsp.results.template.length){
                Modal(flag,rsp.results);
                dtd.resolve(rsp);
            }else{
                LayerConfig('fail','暂无模板！');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
            dtd.reject(rsp);
        }
    },this);
    return dtd;

}

//查看和添加和编辑模态框
function Modal(flag,checkItems){
    var {result='',dispose='',department_id='',missing_items='',dispose_ideas='',unit='',unit_text='',commercial='',question_description='',scene='',deadly='',seriousness='',slight=''}={};
    if(flag=='single'){
        if(checkItems.check_res){
            ({result='',dispose='',department_id='',missing_items='',dispose_ideas='',unit='',unit_text='',commercial='',question_description='',scene='',deadly='',seriousness='',slight=''}=checkItems.check_res);
        }

    }

    var labelWidth=100,
        btnShow='btnShow',
        title='OQC质检',

        disposeHtml='',
        departmentHtml='',
        sceneHtml='',
        result_true='',
        result_flase='',
        dispose_val = '--请选择--',
        department_val = '--请选择--',
        scene_val = '--请选择--',
        noEdit='';


    if(disposeData.length){
        disposeData.forEach(function(item){
            disposeHtml+=`<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;
        });
    }
    if(departmentData.length){
        departmentHtml=departTreeHtml(departmentData,departmentData[0].parent_id);

    }
    if(sceneData.length){
        sceneData.forEach(function(item){
            sceneHtml+=`<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;
        });
    }
    if(result!==''){
        if(result==0){
            result_true='checked="checked"'
        }else if(result==1){
            result_flase='checked="checked"'
        }
    }

    if(dispose){
        disposeData.forEach(function (item) {
            if(item.id==dispose){
                dispose_val = item.name;
            }
        })
    }
    if(department_id){
        departmentData.forEach(function (item) {
            if(item.id==department_id){
                department_val = item.name;
            }
        })
    }
    if(scene){
        departmentData.forEach(function (item) {
            if(item.id==scene){
                scene_val = item.name;
            }
        })
    }
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: ['1000px','600px;'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        moveOut: true,
        move: '.layui-layer-title',
        content: `<form class="formModal formIQCCheck" id="addIQCCheck_from" data-flag="${flag}">
                <table class="checkbox el-item-show">
                    <tr>
                        <td style="width: 100px;text-align: center;">检验结果</td>
                        <td style="width: 400px;">
                            <input type="radio" id="result_true" name="check_result" ${result_true} value="0">
                            <label for="result_true" style="margin-left: -10px;">合格</label>
                            <input type="radio" id="result_false" name="check_result" ${result_flase} value="1">
                            <label for="result_false" style="margin-left: -10px;">不合格</label>
                            <div class="el-form-item" style="display:inline-block;width:120px;margin-left: 40px;">
                                    <div class="el-form-item-div" id="unitDiv">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="${dispose_val}">
                                                <input type="hidden" class="val_id" id="dispose" value="${dispose}">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    ${disposeHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                        <td style="width: 100px;">责任单位</td>
                        <td style="width: 400px;">
                            <div class="el-form-item" style="display:inline-block;width:300px;">
                                    <div class="el-form-item-div" id="unitDiv">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="${department_val}">
                                                <input type="hidden" class="val_id" id="department" value="${department_id}">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    ${departmentHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                    </tr>
                    <tr>
                        <td>不合格类型</td>
                        <td>
                            <textarea type="textarea" style="width: 100%"  maxlength="500" id="missing_items" rows="5" class="el-textarea" placeholder="">${missing_items!='null'?missing_items:''}</textarea>
                        </td>
                        <td>计量单位</td>
                        <td>
                            <div class="el-form-item" style="display:inline-block;width:300px;">
                                    <div class="el-form-item-div">
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="unit_now" class="el-input" placeholder="请输入单位" value="">
                                        </div>    
                                    </div>
                                </div>
                             </div>
                        </td>
                    </tr>
                    <tr>
                        <td>问题描述</td>
                        <td>
                            <textarea type="textarea" style="width: 100%"  maxlength="500" id="question_description" rows="5" class="el-textarea" placeholder="">${question_description!='null'?question_description:''}</textarea>
                        </td>
                        <td>处理意见</td>
                        <td>
                            <textarea type="textarea" style="width: 100%"  maxlength="500" id="dispose_ideas" rows="5" class="el-textarea" placeholder="">${dispose_ideas?dispose_ideas:''}</textarea>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>发现现场</td>
                        <td>
                            <div class="el-form-item" style="display:inline-block;width:300px;">
                                    <div class="el-form-item-div" id="unitDiv">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="${scene_val}">
                                                <input type="hidden" class="val_id" id="scene" value="${scene}">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    ${sceneHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                        <td>不良数量</td>
                        <td>
                            <p>
                            <label for="deadly">致命</label>
                            <input  id="deadly" type="number" value="${deadly}">
                            </p>
                            <p>
                            <label for="seriousness">严重</label>
                            <input  id="seriousness" type="number" value="${seriousness}">
                            </p>
                            <p>
                            <label for="slight">轻微</label>
                            <input  id="slight" type="number" value="${slight}">
                            </p>
                        
                        </td>
                    </tr>
                    <tr> 
                        <td colspan="4">
                        <table id="check_item" class="sticky uniquetable  check_table">
                            <thead>
                            <tr>
                                <th class="center nowrap tight" colspan="4">检验项</th>                       
                            </tr>
                            </thead>
                            <tbody class="table_tbody">
        
                            </tbody>
                        </table>
                        </td>
                    </tr>
                    
                </table>
                

            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            checkItems.template.forEach(function (item03) {
                item03.item_id='';
                item03.value='';
            })
            if(flag=='single'){
                if(checkItems.result_res && checkItems.result_res.length){
                    checkItems.result_res.forEach(function (item01) {
                        checkItems.template.forEach(function (item02) {
                            if(item01.qc_template==item02.id){
                                itemIds.push(item02.id);
                                item02.item_id=item01.id;
                                item02.value=item01.value;
                            }
                        })
                    })
                }
            }

            if(checkItems.template.length){
                $('#check_item .table_tbody').html(treeHtml(checkItems.template,checkItems.template[0].parent_id));

            }

            $('#unit_now').autocomplete({
                url: URLS['check'].unit+"?"+_token+"&page_no=1&page_size=10",
                param:'commercial',
                showCode:'commercial'
            });
            if(unit){
                $('#unit_now').val(commercial).data('inputItem',{id:unit,commercial:commercial}).blur();
            }
            $('#unit_now').on('click',function (e) {
                e.stopPropagation();
                $(this).next().width(300);
            })
            getLayerSelectPosition($(layero));



            layerOffset=layero.offset();

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
};
function departTreeHtml(fileData, parent_id) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        distance=level * 20,tagI='',itemcode=''
        var distance,className,itemImageClass,tagI,itemcode='';
        distance=level * 20,tagI='',itemcode=''

        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`: `<span>${item.name}</span> `;

        _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${encodeURI(item.name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${departTreeHtml(fileData, item.id)}
	        `;

    });
    return _html;
};


function treeHtml(fileData, parent_id) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        var distance,className,itemImageClass,tagI,itemcode='';
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`,itemcode=`(${item.code})` ;
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`: `${tagI}<span>${item.name}</span> ${itemcode}`;

        _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}" >
	        <input type="hidden" id="item${item.id}" data-code="${item.template_code}" data-tem="${item.template_id}" value="${item.item_id}">
	          <td width="30%">${span}</td>
	          <td width="20%">${item.type==0?`<div class="el-form-item-div" style="width: 200px;" id="unitDiv">
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" readonly="readonly" class="el-input" value="${item.value==0?'合格':item.value==1?'不合格':'--请选择--'}">
                            <input type="hidden" class="val_id check_please" id="value${item.id}" value="${item.value}">
                        </div>
                        <div class="el-select-dropdown">
                            <ul class="el-select-dropdown-list">
                                <li data-id="0" data-name="true" class=" el-select-dropdown-item">合格</li>
                                <li data-id="1" data-name="false" class=" el-select-dropdown-item">不合格</li>
                            </ul>
                        </div>
                    </div>
                </div>`:item.type==1?`<div class="el-select"><input class="el-select" id="value${item.id}" style="width:189px;" placeholder="请输入" type="number" value="${item.value}"></div>`:`<div class="el-select"><input class="el-input" style="width:189px;" id="value${item.id}" placeholder="请输入"  type="text" value="${item.value}"></div>`}  
	            
              </td>
              <td width="40%">${item.remark}</td>
              <td>
                <span class="el-checkbox_input el-checkbox_input_items ${item.item_id!=''?'is-checked':''}"  style="vertical-align:middle"  id="${item.id}">
                    <span class="el-checkbox-outset" ></span>
                </span>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id)}
	        `;

    });
    return _html;
};
function checkSubmit(data) {
    var check_choose=[],
        check_item=[];
    ids.forEach(function (item) {
        check_choose.push({"check_id":item})
    });
    itemIds.forEach(function (item) {
        check_item.push({"item_id":$("#item"+item).val(),"template_code":$("#item"+item).attr('data-code'),"template_id":$("#item"+item).attr('data-tem'),"value":$("#value"+item).val()})
    });


    data.check_choose=JSON.stringify(check_choose);
    data.check_item=JSON.stringify(check_item);
    AjaxClient.post({
        url: URLS['check'].check,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            ids=[];
            itemIds=[];
            getChecks();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
$('body').on('input','.el-item-show input',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im,"");
})