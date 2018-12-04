var orderId,layerLoading,
    bomShowData = {},
    topMaterial = {},
    itemData = [];
$(function () {
   orderId=getQueryString('id');
   if(orderId!=undefined){
      getOrderForm(orderId);
      getPOInfo(orderId);
   }else{
      layer.msg('url链接缺少id参数，请给到id参数', {icon: 5
         ,offset: '250px'});
   }
   bindEvent()
});

function bindEvent() {
   //tap切换按钮
   $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){

      if(!$(this).hasClass('active')){
         if($(this).hasClass('el-ma-tap')){//替代物料相互切换
            var former=$('.el-ma-tap.active'),
                formerMId=former.attr('data-main-id'),
                formerPId=former.attr('data-pid'),
                formerREId=former.attr('data-id');
            formerMId==undefined?addExtendData(formerREId,formerPId):addExtendData(formerMId,formerPId,formerREId);
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var data=$(this).data('spanItem'),
                ppid=$(this).attr('data-pid');
            createMDetailInfo(data,false,ppid);
         }else{
            $(this).addClass('active').siblings('.el-tap').removeClass('active');

            var form=$(this).attr('data-item');

            if(form == 'viewBomExtend'){

               var existData = bomShowData;
               existData.children == undefined ? existData.children=[]: null;

               bomShowData = {};

               createExistBomData(existData)
            }

            $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');

         }

      }

   });

    // BOM信息 切换 BOM结构图 
    $('body').on('click','.bom-structure',function () {
        $(".el-panel.orderInfo_from").removeClass('active');
        $(".el-panel.orderPic_from").addClass('active'); 
    });

    // BOM结构图 切换 BOM信息 
    $('body').on('click','.go-back',function () {
        $(".el-panel.orderInfo_from").addClass('active');
        $(".el-panel.orderPic_from").removeClass('active'); 
    });


   $('body').on('click','.bom-tap-wrap .bom-tap',function () {
      var form=$(this).attr('data-item');
      if(!$(this).hasClass('active')){
         $(this).addClass('active').siblings('.bom-tap').removeClass('active');
         if(form=='materialDesignBom_from'){
            var version=$(this).attr('data-version');
            getDesignBom($(this).attr('data-ma-id'),'pop',version);
         }
         $('#'+form).addClass('active').siblings().removeClass('active');
      }
   });

   //下拉框点击事件
   $('body').on('click','.el-select',function(){
      $(this).find('.el-input-icon').toggleClass('is-reverse');
      $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
      $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
      $(this).siblings('.el-select-dropdown').toggle();
   });
   //下拉框item点击事件
   $('body').on('click','.el-select-dropdown-item:not(.el-auto,.ability-item)',function(e){
      e.stopPropagation();
      $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
      $(this).addClass('selected');
      if($(this).hasClass('selected')){
         var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
         var idval=$(this).attr('data-id');
         ele.find('.el-input').val($(this).text());
         ele.find('.val_id').val($(this).attr('data-id'));
      }

      $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
   });

   
}

 //物料详细信息
 $('body').on('click','.show-material',function (e) {
    e.stopPropagation();
   if($(this).hasClass("top-material")){
      if($(this).hasClass("mater-active")){
         var id=topMaterial.material_id;
         getMaterialInfoData(id,'top');
      }

   }else{
      var id=$(this).attr('data-id');
      if($(this).attr('data-has-bom')==1){
         var curversion=$(this).attr('data-version');
         getMaterialInfoData(id,'item',curversion);
      }else{
         getMaterialInfoData(id,'top');
      }

   }

});

// 点击WT
$('body').on('click','.wt-item',function(e){
    e.stopPropagation();
    var wtId = $(this).attr('data-id');
    if(!$('.wt-item'+ wtId).hasClass('wt-select')) {
        $('.wt-item'+ wtId).addClass('wt-select');
        getWOInfo(wtId);
    }
    if(!$('.wt-item'+ wtId).hasClass('collasped')) {
        $('.wt-item'+ wtId).addClass('collasped');
    } else {
        $('.wt-item'+ wtId).removeClass('collasped');
    }
    if ($('.wt-child'+ wtId).hasClass('active')) {
        $('.wt-child'+ wtId).prev().removeClass('active');
        $('.wt-child'+ wtId).removeClass('active');
    } else {
        $('.wt-child'+ wtId).prev().addClass('active');
        $('.wt-child'+ wtId).addClass('active');
    }
});

// 点击WO 展示工单详情 
$('body').on('click','.wo-deinfo',function(e){
    e.stopPropagation();
    var woId = $(this).attr('data-id');
    var qty = $(this).attr('data-qty');
    var status = $(this).attr('data-status');
    var operation_name = $(this).attr('data-operationName');
    var number = $(this).attr('data-number');
    var commercial = $(this).attr('data-commercial');
    var total_workhour = $(this).attr('data-totalWorkhour');
    woInfoModal(woId, qty, status, operation_name, number, commercial, total_workhour);
});
function showWOInfoFu(woId, status) {
    var _token = '8b5491b17a70e24107c89f37b1036078';
    AjaxClient.get({
        url: URLS['pro'].showWOInfo + '?_token=' +_token+'&work_order_id='+woId,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                $("#qrcode").html('');
                var workOrderList = rsp.results;
                //二维码
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    width: 100,
                    height: 100,
                });
                makeCode(workOrderList.po_number, workOrderList.sales_order_code, workOrderList.wo_number, workOrderList.qty, workOrderList.work_order_id, qrcode);

                $('.wo-deinfo-wrap span.wt-number').html(rsp.results.wt_number);
                $('.wo-deinfo-wrap span.wt-input-number').val(rsp.results.wt_number);
                $('.wo-deinfo-wrap #workorder_time').html(dateFormat(rsp.results.work_station_time));
                $('.wo-deinfo-wrap #factory_name').html(rsp.results.factory_name);
                $('.wo-deinfo-wrap #workcenter_name').html(rsp.results.workcenter_name);
                $('.wo-deinfo-wrap #workshop_name').html(rsp.results.workshop_name); 
                $('.wo-deinfo-wrap #ability_name').html(rsp.results.ability_name);
                var indata=[],outdata=[];
                if(rsp.results.in_material){
                    indata=JSON.parse(rsp.results.in_material);
                }
                var inhtml=createwoDetail(indata,status);
                $('.basic-info.income .table_tbody').html(inhtml);
                if(rsp.results.out_material){
                    outdata=JSON.parse(rsp.results.out_material);
                }
                var outhtml=createwoDetail(outdata,status);
                $('.basic-info.outcome .table_tbody').html(outhtml);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工单详情失败');
        }
    }, this);
};
// 时间戳转换成指定格式日期
// dateFormat(11111111111111, 'Y年m月d日 H时i分')
function dateFormat (timestamp, formats) {
    // formats格式包括
    // 1. Y-m-d
    // 2. Y-m-d H:i:s
    // 3. Y年m月d日
    // 4. Y年m月d日 H时i分
    formats = formats || 'Y-m-d';

    var zero = function (value) {
        if (value < 10) {
            return '0' + value;
        }
        return value;
    };

    var myDate = timestamp? new Date(timestamp*1000): new Date();

    var year = myDate.getFullYear();
    var month = zero(myDate.getMonth() + 1);
    var day = zero(myDate.getDate());

    var hour = zero(myDate.getHours());
    var minite = zero(myDate.getMinutes());
    var second = zero(myDate.getSeconds());

    return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
        return ({
            Y: year,
            m: month,
            d: day,
            H: hour,
            i: minite,
            s: second
        })[matches];
    });
};
//生成工单详情表格
function createwoDetail(data,status){
    var trs='';
    if(data&&data.length){
        data.forEach(function (item) {
            var mattrs=item.material_attributes,
                opattr=item.operation_attributes,
                imgs=item.drawings,
                mattrhtml='',
                opattrhtml='',
                imghtml='';
            mattrs.length&&mattrs.forEach(function (k,v) {
                mattrhtml+=`<p><span>${k.name}: </span><span>${k.value}${k.unit?k.unit:''}</span></p>`;
            });
            opattr.length&&opattr.forEach(function (k,v) {
                opattrhtml+=`<p><span>${k.name}: </span><span>${k.value}${k.unit?k.unit:''}</span></p>`;
            });
            imgs.length&&imgs.forEach(function (k,v) {
                imghtml+=`<p attachment_id="${k.drawing_id}" data-creator="${k.creator_name}" data-ctime="${k.ctime}" data-url="${k.image_path}"  title="${k.name}"><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="80" height="40" src="/storage/${k.image_path}" data-src="/storage/${k.image_path}" alt="${k.name}"></p>`;
            });
            trs+=`<tr>
            <td>${item.item_no}</td>
            <td>${item.name}</td>
            <td>${item.qty} [${item.bom_commercial || item.material_commercial}]</td>
            <td>${mattrhtml}</td>
            <td>${opattrhtml}</td>
            <td>${imghtml}</td>
            <td>${status == 0 ? '未排' : '已排'}</td>
        </tr>`;
        });
    }else{
        trs='<tr><td colspan="7">暂无数据</td></tr>';
    }
    return trs;
}

function woInfoModal(woId, qty, status, operation_name, number, commercial, total_workhour) {
    var wt_number = '';
    var height=($(window).height()-250)+'px';
    var title=`工单${number}详情`;
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '80px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="wo-deinfo-wrap" style="padding: 6px 10px;max-height: ${height};overflow-y: auto;position: relative;">
        <div class="qrcode-conten" style="float: right;">
            <div id="qrcode" style="width:100px; height:100px;">
                <div id="qrCodeIco"></div>
            </div>
        </div>
        <div class="block-div" style="height: 110px;">
            <div class="basic-infos">
                <p><span>&nbsp;&nbsp;工艺单号：<span class="highlight wt-number"></span><input type="hidden" class="wt-input-number"> </span></p>
                <p><span>&nbsp;&nbsp;数量[<span id="po-commercial">${commercial}</span>]：<span class="highlight">${qty}</span></span>&nbsp;&nbsp;&nbsp;&nbsp;<span>工序：<span class="highlight">${operation_name}</span></span></p>
                ${status!=='0' ? `<p><span>&nbsp;&nbsp;总工时：<span>${total_workhour}</span>s</span></p>`:''}
            </div>
        </div>
        ${status == 1 ? `<div class="block-div">
            <h4 class="wo-title">排单详情</h4>
            <div class="basic_info yipai_info">
                <div class="table-wrap" style="width: 100%;">
                    <table class="sticky uniquetable commontable">
                      <thead>
                        <tr>
                          <th>排单日期</th>
                          <th>工厂</th>
                          <th>车间</th>
                          <th>工作中心</th>
                          <th>工作中心的能力</th>
                        </tr>
                      </thead>
                      <tbody class="table_tbody">
                        <tr>
                            <td><span id="workorder_time"></span></td>
                            <td><span id="factory_name"></span></td>
                            <td><span id="workshop_name"></span></td>
                            <td><span id="workcenter_name"></span></td>
                            <td><span id="ability_name"></span></td>
                        </tr>
                      </tbody>
                    </table>
                </div>
            </div>
        </div>`:''}
        <div class="block-div">
            <h4 class="wo-title">进料</h4>
            <div class="basic-info income">
                <div class="table_page">
		                <div class="table-wrap">
		                    <table class="sticky uniquetable commontable">
		                      <thead>
		                        <tr>
		                          <th>编码</th>
                              <th>名称</th>
                              <th>数量</th>
                              <th>物料属性</th>
                              <th>工艺属性</th>
                              <th>图纸</th>
                              <th>是否排单</th>
		                        </tr>
		                      </thead>
		                      <tbody class="table_tbody">
		                        <tr><td colspan="7">暂无数据</td></tr>
		                      </tbody>
		                    </table>
		                </div>
		          	</div>
            </div>
        </div>
        <div class="block-div">
            <h4 class="wo-title">出料</h4>
            <div class="basic-info outcome">
                <div class="table_page">
		                <div class="table-wrap">
		                    <table class="sticky uniquetable commontable">
		                      <thead>
		                        <tr>
		                          <th>编码</th>
                              <th>名称</th>
                              <th>数量</th>
                              <th>物料属性</th>
                              <th>工艺属性</th>
                              <th>图纸</th>
                              <th>是否排单</th>
		                        </tr>
		                      </thead>
		                      <tbody class="table_tbody">
		                        <tr><td colspan="7">暂无数据</td></tr>
		                      </tbody>
		                    </table>
		                </div>
		          	</div>
            </div>
        </div>
    </div>` ,
        success: function(layero,index){
            showWOInfoFu(woId, status);
        },
        cancel: function(index,layero){
        },
        end: function(){
        }
    });
};
// 二维码
function makeCode(po_number, sales_order_code, wo_number, qty, work_order_id, qrcode) {
    var elText = "生产订单号：" + po_number + "\r\n销售订单号：" + sales_order_code + "\r\n工单：" + wo_number + "\r\n工单数量[PCS]：" + qty + "\r\n工单Id：" + work_order_id;
    qrcode.makeCode(elText);
};

// 获取工艺路线
function procedureRouteData(routeid) {
    var _token = '8b5491b17a70e24107c89f37b1036078';
    AjaxClient.get({
        url: URLS['order'].procedureShow + '?_token=' +_token+'&id='+routeid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            
            layer.close(layerLoading);
            if(rsp.code == "200") {
                if (rsp && rsp.results && rsp.results.operations && rsp.results.orderlist) {
                    var data = rsp.results;
                    if (data.routeInfo.length) {
                        showBasicInfo(data.routeInfo[0])
                    }
                    if (data.operations.length) {
                        $('.route_wrap').html('');
                        showRouteTap($('.route_wrap'), data.operations);
                        showRouteLine(data, 900, 280);
                    }
                }
            } else {
                LayerConfig('fail', rsp.message);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工艺路线详情失败');
        }
    }, this);
};

// 获取PO数据
function getPOInfo(opId) {
    var _token = '8b5491b17a70e24107c89f37b1036078';
    AjaxClient.get({
        url: URLS['pro'].getPOInfo + '?_token=' +_token + '&production_order_id=' + opId + '&page_no=1&page_size=20&sort=id&order=asc&operation_ids=',
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            
            layer.close(layerLoading);
            if(rsp.code == "200") {
                if (rsp && rsp.results ) {
                    var data = rsp.results.wt_info;
                    creatWTList(data, rsp.results.commercial);
                }
            } else {
                LayerConfig('fail', rsp.message);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取PO数据失败');
        }
    }, this);
};

// wt 列表
function creatWTList(wtList, commercial) {
  
    if(wtList.length) {
        var poHtml = '';
        var wtHtml = '';
        if(wtList.length) {
            wtList.forEach(function(item, index) {
                wtHtml += `
                    <tr class="tr-item${item.wt_id}">
                        <td width="80"><span class="wt-item wt-item${item.wt_id} collasped" data-id="${item.wt_id}"><i class="tag-i el-icon itemIcon"></i><span style="padding-left: 6px; cursor: pointer;color: #20A0FF;" >查看WO</span></span></td>
                        <td>${item.number}</td>
                        <td>${item.operation_name}</td>
                        <td>${item.item_no}</td>
                        <td>${item.out_material_name}</td>
                        <td>${item.qty}</td>
                        <td>${item.wt_status == 0?'未拆单':'已拆单'}</td>
                        <td>${item.wt_completion}</td>
                        <td>${item.wt_estimate_workhour}s</td>
                    </tr>
                    
                `;
            });
        } else {
            wtHtml += `<tr><td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td></tr>`;
        }
        
        poHtml = `
                <thead>
                    <tr>
                        <th width="80"></th>
                        <th>WT编码</th>
                        <th>工序</th>
                        <th>出料编码</th>
                        <th>出料名称</th>
                        <th>数量[${commercial}]</th>
                        <th>是否拆单</th>
                        <th>已排完成度</th>
                        <th>预估工时</th>
                    </tr> 
                </thead>
                <tbody class="t-body">${wtHtml}</tbody>
        `;
        $('#pScheduleInfo_from').html(poHtml);
    }
};



// 获取WO信息 
function getWOInfo(workTaskId) {
    
    var tempHtml = '';
    var _token = '8b5491b17a70e24107c89f37b1036078';
    AjaxClient.get({
        url: URLS['pro'].getWOInfo + '?_token=' +_token + '&work_task_id=' + workTaskId + '&page_no=1&page_size=5&sort=id&order=asc&status=',
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            
            layer.close(layerLoading);
            if(rsp.code == "200") {
                if (rsp && rsp.results ) {
                    var data = rsp.results;
                    tempHtml = creatWOList(data,workTaskId);
                    return  tempHtml;
                }
            } else {
                LayerConfig('fail', rsp.message);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取WO数据失败');
        }
    }, this);
   
};

// wo 列表
function creatWOList(WOList, workTaskId) {
    if(WOList.length) {
        var woHtml = `<tr class="wt-child active" style="font-size: 14px; color: #333; font-weight: bold;"> <td width="80"></td><td>WO编码</td><td>qty</td><td>总工时</td><td>排单状态</td><td class="nowrap" colspan="4"></td></tr>`;
        if(WOList.length) {
            WOList.forEach(function(item, index) {
                woHtml += `<tr class="wt-child wt-child${workTaskId} active">
                            <td width="80"></td>
                            <td>
                                <span style="padding-left: 6px; cursor: pointer;color: #20A0FF;" class="wo-deinfo" data-id="${item.work_order_id}" data-commercial="${item.commercial}" data-number="${item.number}" data-status="${item.status}" data-qty="${item.qty}" data-operationName="${item.operation_name}" data-totalWorkhour="${item.total_workhour}">${item.number}</span>
                                <i style="cursor: pointer;" class="fa fa-info-circle wo-deinfo" data-id="${item.work_order_id}" data-commercial="${item.commercial}" data-number="${item.number}" data-status="${item.status}" data-qty="${item.qty}" data-operationName="${item.operation_name}" data-totalWorkhour="${item.total_workhour}"></i>
                            </td>
                            <td><span>${item.qty}${item.commercial || item.bom_commercial}</span></td>
                            <td><span>${item.total_workhour}s</span></td>
                            <td><span>${item.status == 0?'未排':'已排'}</span></td>
                            <td class="nowrap" colspan="4"></td>
                        </tr>`;
            });
        } else {
            woHtml += `<tr class="wt-child wt-child${workTaskId} active"><td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td></tr>`;
        }
        
        $('.tr-item'+ workTaskId).after(woHtml)
        return woHtml;
    }
};

//获取物料信息
function getMaterialInfoData(id,flag,version) {

   AjaxClient.get({
      url: URLS['order'].materialShow+"?"+_token+"&material_id="+id,
      dataType: 'json',
      beforeSend: function(){
         layerLoading = LayerConfig('load');
      },
      success:function (rsp) {
         layer.close(layerLoading);
         if(rsp&&rsp.results){
            showMaterialModal(rsp.results,flag,version)
         }
      },
      fail:function (rsp) {
         layer.close(layerLoading);
      }
   })
}
function showMaterialModal(data,flag,version) {
   if(data != null){
      var attrData = {
         material_attributes: data.material_attributes,
         operation_attributes: data.operation_attributes
      }
   }else{
      return
   }

   layerModal = layer.open({
      type:1,
      title: `物料${data.item_no}详细信息`,
      offset: '100px',
      area: ['900px','444px'],
      shade: 0.1,
      shadeClose: true,
      resize: false,
      move: false,
      content:`
            <div class="bom-wrap-container" id="materialModal">
                <div class="bom-wrap">
                    <div class="bom-tap-wrap">
                        <span data-item="materialBasicInfo_from" class="bom-tap active">基础信息</span>
                        <span data-item="materialAttribute_from" class="bom-tap">属性</span>
                        <span data-item="materialPlan_from" class="bom-tap">计划</span>
                        <span data-item="materialPic_from" class="bom-tap">图纸</span>
                        <span data-item="materialFile_from" class="bom-tap">附件</span>
                        <span data-item="materialDesignBom_from" data-ma-id="${data.material_id}" data-version="${version||0}" class="bom-tap" style="display: ${flag=='top'?'none':''}">设计Bom</span>
                    </div>
                    <div class="bom-panel-wrap" style="padding-top: 10px;">
                         <!--基础信息-->
                         <div class="bom-panel active" id="materialBasicInfo_from">
                              <div class="material_block">
                                   <h3>基本信息</h3>
                                   <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料分类:</label>
                                                    <span>${tansferNull(data.material_category_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">批次号前缀:</label>
                                                    <span>${tansferNull(data.batch_no_prefix)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">名称:</label>
                                                    <span>${tansferNull(data.name)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小订单数量:</label>
                                                    <span>${tansferNull(data.moq)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料编码号:</label>
                                                    <span>${tansferNull(data.item_no)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">描述:</label>
                                                    <p class="des" title="${data.description}">${tansferNull(data.description)}</p>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                              </div>
                              <div class="material_block">
                                    <h3>包装设置</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">基本单位:</label>
                                                    <span>${tansferNull(data.unit_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装长度:</label>
                                                    <span>${tansferNull(data.length)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装数量</label>
                                                    <span>${tansferNull(data.mpq)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装宽度:</label>
                                                    <span>${tansferNull(data.width)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装重量:</label>
                                                    <span>${tansferNull(data.weight)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装高度:</label>
                                                    <span>${tansferNull(data.height)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div>
                         </div>
                         <!--基础信息-->
                         <!--属性-->
                         <div class="bom-panel" id="materialAttribute_from">
                               <div class="material_block">
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料模板:</label>
                                                    <span>${data.template_name==''?'--无--':tansferNull(data.template_name)}</span>
                                                </div> 
                                            </div>
                                        </div>
                                    </div>
                               </div> 
                               <div class="material_block">
                                    <h3>物料属性</h3>
                                    <div class="basic_info">
                                        <div class="item attr_item">
                                          ${createAttrHtml(attrData,'self','attr')}
                                        </div>
                                    </div>
                               </div> 
                                <div class="material_block">
                                    <h3>工艺属性</h3>
                                    <div class="basic_info">
                                        <div class="item attr_item">
                                            ${createAttrHtml(attrData,'self','opattr')}
                                        </div>
                                    </div>
                                </div> 
                         </div>
                         <!--属性-->
                         <!--计划信息-->
                         <div class="bom-panel" id="materialPlan_from">
                              <div class="material_block">
                                    <h3>计划信息</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料来源:</label>
                                                    <span>${createSource(meterielSource,data.source)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">安全库存:</label>
                                                    <span>${tansferNull(data.safety_stock)}</span>
                                                </div>
                                            </div> 
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">低阶码:</label>
                                                    <span>${tansferNull(data.low_level_code)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">固定提前期:</label>
                                                    <span>${tansferNull(data.fixed_advanced_period)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最高库存:</label>
                                                    <span>${tansferNull(data.max_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">累计提前期:</label>
                                                    <span>${tansferNull(data.cumulative_lead_time)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最低库存:</label>
                                                    <span>${tansferNull(data.min_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                              </div> 
                         </div>
                         <!--计划信息-->
                         <!--图纸-->
                         <div class="bom-panel clearfix" id="materialPic_from">
                              ${createPicList(data.drawings)} 
                         </div>
                         <!--图纸-->
                         <!--附件-->
                         <div class="bom-panel" id="materialFile_from">
                              <div class="table-container">
                                    <table class="bom_table">
                                      <thead>
                                        <tr>
                                          <th class="thead">缩略图</th>
                                          <th class="thead">名称</th>
                                          <th class="thead">创建人</th>
                                          <th class="thead">创建时间</th>
                                          <th class="thead">注释</th>
                                          <th class="thead">操作</th>
                                        </tr>
                                      </thead>
                                      <tbody class="t-body">
                                        ${createAttachTable(data.attachments)}
                                      </tbody>
                                    </table>
                              </div>
                         </div>
                         <!--附件-->
                         <!--设计bom-->
                         <div class="bom-panel" id="materialDesignBom_from" style="display: ${flag=='top'?'none':''}">
                                <div class="materialInfo_container">
                                    <div class="materialInfo_table" style="overflow-y: auto;">
                                         <div class="table-container select_table_margin">
                                            <div class="table-container">
                                              <table class="bom_table design_table">
                                                <thead>
                                                  <tr>
                                                    <th class="thead">物料清单编码</th>
                                                    <th class="thead">物料清单名称</th>
                                                    <th class="thead">创建人</th>
                                                    <th class="thead">版本</th>
                                                    <th class="thead">版本描述</th>
                                                  </tr>
                                                </thead>
                                                <tbody class="t-body">
                                                  
                                                </tbody>
                                              </table>
                                            </div>
                                         </div>
                                    </div>  
                                    <div class="materialInfo_tree">
                                          <div class="bom_tree_container">
                                                <div class="bom-tree">
                                                </div>
                                          </div>
                                    </div>
                                </div>
                         </div>
                         <!--设计bom-->
                    </div>  
                </div>
            </div>`
   })
}

function getDesignBom(id,flag,version) {
   AjaxClient.get({
      url: URLS['order'].bomDesign+"?"+_token+'&material_id='+id,
      dataType: 'json',
      success:function (rsp) {

         if(rsp.results&&rsp.results.length){
            if(flag=='pop'){
               var tr=showModalDesignTable(rsp.results);
               $('.materialInfo_table .t-body').html(tr);

               if(version!=0){
                  $('.materialInfo_table .t-body').find('.tr-bom-item[data-version='+version+']').click();
               }else{
                  $('.materialInfo_table .t-body').find('.tr-bom-item:first-child').click();
               }
            }
         }
      },
      fail:function (rsp) {

      }
   },this)
}
function showModalDesignTable(data) {
   var ele = [];
   if(data.length){
      data.forEach(function(item,index){
         var tr=`
            <tr class="tr-bom-item" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.user_name}</td>
                 <td>${item.version}.0</td>
                <td><p title="item.version_description">${item.version_description.length>25?item.version_description.substring(0,24)+'...':item.version_description}</p></td>             
            </tr>
        `;
         ele.push(tr);
      });
   }else{
      var tr=`<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
            </tr>`;
      ele.push(tr);
   }

   return ele;
}

//物料详情属性tab
function createAttrHtml(data,flag,type){
   var divCon=[];
   if(type=='opattr'){
      divCon.push(createAttrli(data,data.operation_attributes,flag,type));
   }else{
      if(flag=='self'){
         divCon.push(createAttrli(data,data.material_attributes,flag,type));
      }else{
         data.forEach(function(item){
            divCon.push(createAttrli(item,item.material_attributes,flag,type));
         });
      }
   }
   return divCon.join('');
}

//物料详情属性tab 项
function createAttrli(item,itemdata,flag,type){
   var divwrap='',lis='',len=0;
   if(itemdata&&itemdata.length){
      var divitems=[];
      itemdata.forEach(function(attritem,index){
         var inputhtml='',divitem='',unithtml='',deletehtml='';
         inputhtml=`<span>${attritem.value||''}</span>`;
         unithtml=attritem.unit!==null&&attritem.unit!==''&&attritem.unit!==undefined?`<span class="unit">[${attritem.unit}]</span>`:'<span class="unit"></span>';
         if(attritem.datatype_id==2){
            inputhtml=createOption(attritem.range,attritem.value);
         }
         divitem=`<div class="attr_wrap">
                  <p>名称：${attritem.name}</p>
                    <p>值：${inputhtml}${unithtml}</p>
                </div>`;
         divitems.push(divitem);
      });
      divwrap=`<h4>${item.template_name==undefined?'':item.template_name}</h4> 
                <div class="attr_wrap_con">
                    ${divitems.join('')}
                </div>`;
   }
   return divwrap;
}

//生成属性下拉框数据
function createOption(data,value){
   var opdata=JSON.parse(data);
   var innerhtml,selectVal;
   if(opdata.options&&opdata.options.length){
      opdata.options.forEach(function(item){
         if(value!=''&&value!=undefined&&item.index==value){
            selectVal=item.label;
         }
      });
   }
   innerhtml=`<span>${selectVal!=undefined&&selectVal!=''?selectVal:'--无--'}</span>`;
   selectVal='';
   return innerhtml;
}

//生成物料来源数据
function createSource(data,val){
   var sItem=[];
   data&&data.length&&data.forEach(function(item){
      if(val&&val==item.id){
         sItem.push(item);
      }
   });
   var uname='--无--',uid='';
   if(sItem.length){
      uname=sItem[0].name;
      uid=sItem[0].id;
   }
   var eleSource=`<span>${uname}</span>`;
   return eleSource;
}

//生成图纸列表
function createPicList(picData){
   var items=[];
   if(picData.length){
      picData.forEach(function(item){
         var item=`<div class="pic_item">
                 <div class="pic_img">
                    <img width="370" height="170" src="/storage/${item.image_path}${item.image_name}.jpg370x170.jpg" alt="">
                 </div>
                 <div class="pic_text"><span>${item.code}(${item.drawing_name})</span></div>
            </div>`;
         items.push(item);
      });
   }
   return items.join('');
}

//生成附件表格
function createAttachTable(data){
   var trs=[];
   if(data.length){
      data.forEach(function(item,index){
         var path=item.path.split('/');
         var name=path[path.length-1],
             namepre=name.split('.')[0],
             nameSuffix=name.split('.')[1],
             nameSub=namepre.length>4?namepre.substring(0,4)+'...':namepre;
         var tr=`
              <tr class="tritem" data-id="${item.attachment_id}">
                  <td style="font-size: 20px;">
                    <i class="el-icon el-input-icon el-icon-file"></i>
                  </td>
                  <td><p style="cursor: default;" title="${name}">${nameSub}.${nameSuffix}</p></td>
                  <td><p>${item.creator_name}</p></td>
                  <td>
                    <p>${item.ctime}</p>
                  </td>
                  <td><p title="${item.comment}">${item.comment.length>11?item.comment.substring(0,9)+'...':item.comment}</p></td>
                  <td><a download="${namepre}" href="/storage/${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a></td>             
              </tr>
          `;
         trs.push(tr);
      });
   }else{
      var tr=`<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
      trs.push(tr);
   }
   return trs.join('');
}

function getOrderForm(id) {
   AjaxClient.get({
      url: URLS['order'].orderShow+'?'+_token+"&product_order_id="+id,
      dataType:'json',
      beforeSend:function () {
         layerLoading = LayerConfig('load');
      },
      success:function (rsp) {
         layer.close(layerLoading);
         if(rsp&&rsp.results){
            var order = rsp.results.order,bom = rsp.results.bom;
            if(order != {}){
               showOrderBasicInfo(order);
               procedureRouteData(order.routing_id);
            }
            if(bom != {}){
               showOrderView(bom);
               getBOMGroup(bom.bom_group_id);
               var obj = JSON.parse(bom.bom_tree);
               getProcedureSource(obj.item_no,obj.operation_id,obj);
            }
         }else{
            layer.msg("获取信息失败",{icon:5,offset:'250px'});
         }
      },
      fail:function (rsp) {
         layer.close(layerLoading);
         layer.msg("获取信息失败",{icon:5,offset:'250px'});
      }
   })
}

function showOrderBasicInfo(data) {
   var basicForm = $('#orderBasic_from');
   basicForm.find('#productionOrderNumber').val(data.number);
   basicForm.find('#basic_material_id').val(data.material_name).attr('data-id',data.product_id);
   basicForm.find('#basic_qty').val(data.qty);
   basicForm.find('#basic_routing_name').val(data.routing_name);
   basicForm.find('#basic_scrap').val(data.scrap);
   basicForm.find('#basic_start_date').val(data.start_date);
   basicForm.find('#basic_end_date').val(data.end_date);
   basicForm.find('#sales_order_code').val(data.sales_order_code);
   basicForm.find('#priority_id').val(data.priority);
   if (data.remark){
       basicForm.find('#remark').val(data.remark);
   }else{
       basicForm.find('#remark').val('暂无信息');
   }
   if (data.unit){
     basicForm.find('#unit_name').val(data.unit);
   }else{
     basicForm.find('#unit_name').val('无');
   }

   var priority_text = '';
   if (data.priority == 1){
     priority_text = '低';
   }else if (data.priority == 2){
     priority_text = '中';
   }else if (data.priority == 3){
     priority_text = '高';
   }else if (data.priority == 4){
     priority_text = '紧急';
   }else{
      priority_text = '无';
   }
   basicForm.find('#priority').val(priority_text);
}

function showOrderView(data) {
   var productBomData=JSON.parse(data.bom_tree);
   bomShowData=productBomData;
   topMaterial=productBomData;
   //常规页面
   var parentForm = $('#orderInfo_from');
   $('#orderInfo_from #material_id').val(productBomData.name);
   var labelId = ['code','name','bom_group_name','qty','operation_id','loss_rate','description','version','version_description'];
   labelId.forEach(function (item,index) {
      parentForm.find('#'+item).val(data[item]);
   });
   itemData = [];
   if(productBomData.children && productBomData.children.length){
      productBomData.children.forEach(function (item) {
         item.itemAddFlag=1;
         itemData.push(item);
         if(item.replaces&&item.replaces.length){
            item.replaces.forEach(function(reitem) {
               reitem.itemAddFlag=2;
               reitem.replaceItemId = item.material_id;
               itemData.push(reitem);
            })
         }
      })
   }
   showAddItem(itemData);
   showBomPic(bomShowData);
   //附件页面
   showBomFile(data.attachments);
}

//获取bom分组
function getBOMGroup(val){
   AjaxClient.get({
      url: URLS['order'].bomGroupSelect+"?"+_token,
      dataType: 'json',
      success: function(rsp){
         if(rsp.results&&rsp.results.length){
            var ele=$('#bom_group_id');
            rsp.results.forEach(function(item){
               if(val == item.bom_group_id){
                  ele.val(item.name)
               }
            });
         }
      },
      fail: function(rsp){
         console.log('获取物料清单分组失败');
      }
   },this);
}
function getProcedureSource(id,val,obj) {
   AjaxClient.get({
      url:URLS['order'].workMaterialNo+'?'+_token+'&page_no=1&page_size=10&material_no='+id,
      dataType: 'json',
      success:function (rsp) {
         var ele = $('.operation-wrap .el-select-dropdown');
         ele.html('');
         var abNames=obj.operation_ability_pluck;
         var abilityArr=[];
         var data = rsp.results.list;
         var _checkbox = $('.ability_wrap .ability ul');
         if(data&&data.length){
            console.log(abNames);
            if(abNames instanceof Array){
                  abNames.forEach(function(val,i){
                     for(var index in val){
                        abilityArr.push(val[index]);
                     }
                  })
            }else{
                 for(var i in abNames){
                     abilityArr.push(abNames[i]);
                 }
             }

            console.log(abilityArr);
            var li = $('#operation_id');
            data.forEach(function (item,index) {
               if(val == item.operation_id){
                  li.val(item.operation_name);
                  if(obj.operation_ability!=''){
                      $('.ability_wrap .el-select').find('.el-input').val(abilityArr.length+'项被选中');
                  }
                  abilityArr.forEach(function(val,i){
                      var innerHtml=`<li class="el-select-dropdown-item ability-item">
                                 <span class="el-checkbox_input operation-check is-checked">
                                 <span class="el-checkbox-outset"></span>
                                 <span class="el-checkbox__label">${val}</span>
                                 </span>
                            </li>`;
                            _checkbox.append(innerHtml)
                  })
                 // if(item.ability.length){
                 //    $('.ability_wrap .el-select').find('.el-input').val(item.ability.length+'项被选中');
                 //    item.ability.forEach(function (r,x) {
                 //       var innerHtml=`<li class="el-select-dropdown-item ability-item">
                 //                 <span class="el-checkbox_input operation-check is-checked">
                 //                 <span class="el-checkbox-outset"></span>
                 //                 <span class="el-checkbox__label">${r.ability_name}</span>
                 //                 </span>
                 //            </li>`;
                 //       _checkbox.append(innerHtml)
                 //    })
                 // }
               };
            });

         }
      },
      fail:function (rsp) {
         if(rsp&&rsp.message!=undefined&&rsp.message!=null){
            LayerConfig('fail',rsp.message);
         }
      }
   },this);
}

//添加项
function showAddItem(data) {
   var ele = $('#orderInfo_from .item_table .t-body');
   ele.html("");
   if(data.length){
      data.forEach(function (item,index) {

         var replacetr='',replacetrId='', version='',maxVersion=0;
         if(item.itemAddFlag==2){
            replacetr = 'tr-replace';
            replacetrId=`data-replace-id="${item.replaceItemId}"`
         }

         if(item.is_assembly>0){
            if(item.versions&&item.versions.length){
               if(item.version){
                  maxVersion=item.version;
               }else{
                  maxVersion=Math.max.apply(null, item.versions);
               }
            }
         }
         console.log(item.has_bom);
         var tr =  `
            <tr class="ma-tritem ${replacetr}" data-id="${item.material_id}" ${replacetrId}>
                  <td><p class="show-material" data-version="${maxVersion}" data-has-bom="${item.has_bom>0?'1':'0'}" data-assembly="${item.is_assembly>0?'1':'0'}" data-id="${item.material_id}">${item.item_no}</p></td>
                  <td>${item.name}</td>
                  <td><input type="number" step="0.01" value="${item.loss_rate!=undefined?item.loss_rate:'0.00'}" readonly class="el-input bom-ladder-input loss_rate"></td>
                  <td>
                      <span class="el-checkbox_input assembly-check ${item.has_bom?'':'noedit'} ${item.is_assembly!=undefined&&item.is_assembly?'is-checked':''}" data-id="${item.material_id}" data-has-bom="${item.has_bom}" data-version="${item.version||0}">
                          <span class="el-checkbox-outset"></span>
                      </span>
                  </td>
                  <td><input type="text" value="${item.usage_number!=undefined?item.usage_number:''}" readonly class="bom-ladder-input usage_number"> <span>${item.commercial!=undefined?item.commercial:''}</span></td>
                  <td><textarea class="el-textarea bom-textarea comment" readonly name="" id="" cols="30" rows="3">${item.comment!=undefined?item.comment:''}</textarea></td>
            </tr>`;
         ele.append(tr);
         ele.find('tr:last-child').data("matableItem",item);
      });
   }else{
      var tr =`<tr>
                   <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
                </tr>`;
      ele.append(tr);
   }
}

//orgchart树形图
function showBomPic(data) {
   $('#orgchart-container').html('');
   var nodeTemplate = function (data) {
      return `<div class="title">
                   ${data.item_no}
                </div>
                <div class="content">
                    <p class="name" title="${data.name}"><span style="color: #666;">名称：</span>${data.name.length>6?data.name.substring(0,4)+'...':data.name}</p>
                    <p class="name"><span style="color: #666;">数量：</span>${data.usage_number == undefined ? '':data.usage_number}${data.commercial!=undefined?'['+data.commercial+']':''}</p>
                </div>`;
   };

   $('#orgchart-container').orgchart({
      'data' : bomShowData,
      'zoom' : true,
      'pan' : true,
      'depth': 99,
      'exportButton': true,
      'exportFilename': `物料${data.name}的树形图`,
      'nodeTemplate': nodeTemplate,
      'createNode': function($node, data){
         var replaceClass=data.replaces!=undefined&&data.replaces.length ? 'nodeReplace': '';
         $node.addClass(replaceClass);
         if(data.bom_item_qty_levels&&data.bom_item_qty_levels.length){
            var secondMenuIcon = $('<i>', {
               'class': 'fa fa-info-circle second-menu-icon',
               'node-id':`${data.material_id}`,
               click: function(e) {
                  e.stopPropagation();
                  var that=$(this);
                  if($(this).siblings('.second-menu').is(":hidden")){
                     $('.second-menu').hide();
                     $(this).siblings('.second-menu').show();
                  }else{
                     $(this).siblings('.second-menu').hide();
                  }
               }
            });
            var trs='';
            data.bom_item_qty_levels.forEach(function(item){
               trs+=` <tr>
                  <td>${item.parent_min_qty}</td>
                  <td>${item.qty}</td>
              </tr>`;
            });
            var table=`<table class="bordered">
                <tr>
                    <th> 父项最小数量 </th>
                    <th> 用量 </th>
                </tr>
                ${trs}            
          </table>`;
            var secondMenu = `<div id="second-menu" class="second-menu">${table}</div>`;
            $node.append(secondMenuIcon).append(secondMenu);}
      }
   });
}

function showBomFile(data) {
   console.log(data);
   var ele = $('#orderFile_from .bom_table .t-body');
   if(data && data.length){
      data.forEach(function (item) {
         var url=window.storage+item.path,
             preview = '';

         if(item.path.indexOf('jpg')>-1||item.path.indexOf('png')>-1||item.path.indexOf('jpeg')>-1){
            preview = `<img width="60" height="60" src="${url}" alt="">`
         }else{
            preview = `<div class='file-preview-text existAttch'>
                               <h3 style="font-size: 50px;color: #428bca;"><i class="el-icon el-icon-file"></i></h3>
                           </div>`
         }
          if (item.path.indexOf('jpg') > -1 || item.path.indexOf('png') > -1 || item.path.indexOf('jpeg') > -1) {
              preview = `<img width="60" height="60" src="${url}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch'>`;
          } else {
              preview = `<div class='file-preview-text existAttch' data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}">
                      <h3 style="font-size: 50px;"><i class='el-icon el-icon-file'></i></h3>
                      </div>`;
          }

         var size =item.size >= 1024 ?  `${(item.size/1024).toFixed(2)}KB` : `${item.size}B`;
         var tr= ` <tr class="tritem" data-id="${item.attachment_id}">
                  <td style="font-size: 18px;">
                    ${preview}
                  </td>
                  <td style="text-align:left">${item.filename}<span style="color: #999;">(${size})</span></td>
                  <td style="text-align: left">${item.creator_name}<br/><span style="color: #666;">${item.ctime}</span></td>
                  <td><textarea readonly class="fujiantext" maxlength="50" rows="1">${item.comment}</textarea></td>
                  <td class="storage_path"><a download="${item.filename}"  href="${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a></td>             
              </tr>`;
         ele.append(tr);

      });

   }else{
      var tr= `<tr>
                    <td colspan="6" style="color:#666">暂无数据</td> 
                 </tr>`;
      ele.append(tr);
   }

}