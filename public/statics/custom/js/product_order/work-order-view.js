var id,
	LayerLoading,
	LayerModal,
	inData = [],
mattr = [],
wtattr = [],
    qty = 0,
    total_workhour = 0,
    po_number = '',
    wo_number = '',
    item_no = '',
    sales_order_code = '',
maattrbutes = [],
inmaattrbutes = [],
wtattrbutes = [],
outData = [], group_routing_package = [],
ajaxData = {};


$(function () {
	id = getQueryString('id');
	if (id != undefined) {
		getworkOrderView(id);
	} else {
		layer.msg('url缺少链接参数，请给到参数', {
			icon: 5,
			offset: '250px'
		});
	}
	bindEvent();
});

function getworkOrderView(id) {
	AjaxClient.get({
		url: URLS['order'].workOrderShow + _token + "&work_order_id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			$('#wo_number').val(rsp.results.wo_number);
			$('#wt_number').val(rsp.results.wt_number);
			tmp = JSON.parse(rsp.results.in_material);
            group_routing_package = JSON.parse(rsp.results.group_routing_package);
            qty = rsp.results.qty;
            sales_order_code = rsp.results.sales_order_code;
            wo_number = rsp.results.wo_number;
            po_number = rsp.results.po_number;
            total_workhour = rsp.results.total_workhour;
            item_no = rsp.results.item_no;
			outData = JSON.parse(rsp.results.out_material);
			var mattr = outData[0].material_attributes;
			mattr.forEach(function (e1, i1) {
				maattrbutes.push(e1.name + ':' + e1.value + (e1.unit?e1.unit:''));
			});
			showInItem(rsp.results.in_material);
			showOutItem(rsp.results.out_material);
			$('.pop-button.attrview').data('modalData', rsp.results);

			//二维码
			var qrcode = new QRCode(document.getElementById("qrcode"), {
				width: 110,
				height: 110,
			});
			var margin = ($("#qrcode").height() - $("#qrCodeIco").height()) / 2; //控制Logo图标的位置
			$("#qrCodeIco").css("margin", margin);
			var unit = $('.unit').text();
			makeCode(rsp.results.wo_number, rsp.results.wt_number, rsp.results.po_number, rsp.results.item_no, rsp.results.qty,total_workhour, unit, qrcode);

		},
		fail: function (rsp) {
			layer.close(layerLoading);
			layer.msg('获取工单详情失败，请刷新重试', 9);
		}
	}, this)
}
//二维码
function makeCode(wo_number, wt_number, po_number, item_no, qty, unit, total_workhour, qrcode) {
	var elText = "工单：" + wo_number + "\r\n 工艺单：" + wt_number + "\r\n 销售订单号：" + po_number + "\r\n 物料编号：" + item_no + "\r\n 工单数量：" + qty + "\r\n 单位：" + unit+ "\r\n 工时：" + total_workhour;
	qrcode.makeCode(elText);
}


//进料
function showInItem(data) {
	var ele = $('.storage_blockquote .item_table .t-body');
	ele.html("");
	var data = JSON.parse(data);
	//console.log(data);
	data.forEach(function (item, index) {
		var imgHtml = ''; // tansferNull(item.drawings)
		if (item.drawings && item.drawings.length) {
			item.drawings.forEach(function (ditem) {
				imgHtml += `<div class="preview_draw_wrap" data-url="${ditem.image_path}">
				<p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
				<p>${ditem.code}</p>
				</div>`;
			})
		} else {
			imgHtml = '';
		}


		tempt = item.material_attributes;
		var inattrs = '';

        tempt.forEach(function (item) {
            inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
        })

		var tr = `
	<tr>
	<td>${tansferNull(item.item_no)}</td>
	<td>${tansferNull(item.name)}</td>
	<td>${tansferNull(item.qty)}</td>
	<td>${tansferNull(item.bom_commercial)}</td>
	<td style= "line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
	<td>${tansferNull(item.drawings)}</td>
	</tr>`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData", data);

	})

}

//出料
function showOutItem(data) {
	var data = JSON.parse(data);
	var ele = $('.storage_blockquote .item_table_out .t-body');
	ele.html("");

	data.forEach(function (item, index) {
        tempt = item.material_attributes;
        var inattrs = '';
        tempt.forEach(function (item) {
            inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
        })
		var tr = `
	<tr>
	<td>${tansferNull(item.item_no)}</td>
	<td>${tansferNull(item.name)}</td>
	<td>${tansferNull(item.qty)}</td>
	<td>${tansferNull(item.bom_commercial)}</td>
	<td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
	<td>${tansferNull()}</td>
	<td style="display:none" class="unit">${tansferNull(item.unit?item.unit:'')}</td>
	</tr>`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData", data);
	})
}

//进料工艺属性
function createInModalHtml(ele, data) {
	ele.html('');
	//console.log(data);
	data.forEach(function (item, index) {
		temptWt = item.operation_attributes;
		var inattrsWt = [];
		temptWt.forEach(function (e4, i4) {
			inattrsWt.push(e4.name + ':' + e4.value + (e4.unit?e4.unit:''));
		})
		var tr = `
		<tr>
		<td>${tansferNull(item.item_no)}</td>
		<td>${tansferNull(item.name)}</td>
		<td style= "line-height:2em;">${tansferNull(inattrsWt.join('<br>'))}</td>
		</tr>`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData", data);
	})
}

//出料工艺属性
function createModalHtml(ele, data) {
	ele.html('');
	data.forEach(function (item, index) {
		var wtattrbutes = [];
		var wtattr = item.operation_attributes;
		wtattr.forEach(function (e5, i5) {
			wtattrbutes.push(e5.name + ':' + e5.value + (e5.unit?e5.unit:''));
		});
		tr = `
		<tr>
		<td>${tansferNull(item.item_no)}</td>
		<td>${tansferNull(item.name)}</td>
		<td style="line-height:2em;">${tansferNull(wtattrbutes.join('<br>'))}</td>
		</tr>`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData", data);
	})
}

function bindEvent() {
	//点击弹框
	$('body').on('click', '.attrview', function (e) {
		viewWtattrModal();
	});
	//点击弹框
	$('body').on('click', '.printAttr', function (e) {
		viewWtModal();
	});
	//打印


	$('body').on('click', '#printWt', function (e) {
        $("#dowPrintWt").print();
    });
}


function viewWtattrModal() {
	var lableWidth = 100;
	layerModal = layer.open({
		type: 1,
		title: '查看工艺属性',
		offset: '100px',
		area: '850px',
		shade: 0.1,
		shadeClose: false,
		resize: false,
		move: false,
		content: `<form class="viewAttr formModal" id="viewattr">
					<div class="in_material">
					  <h3 style="font-size: 14px; font-weight: bold;">消耗品</h3>
		                  <div class="table-container table_page">
	                        <table class="storage_table item_in">
	                          <thead>
	                            <tr>
	                              <th class="thead">消耗品编码</th>
	                              <th class="thead">名称</th>
	                              <th class="thead">工艺属性</th>
	                            </tr>
	                          </thead>
	                          <tbody class="table_tbody">
	                          </tbody>
	                        </table>
	                      </div>  
	                </div> 
                    <div class="out_material"> 
	                    <h3 style="font-size: 14px; font-weight: bold;">产成品</h3>      
	                        <div class="table-container table_page">
		                        <table class="storage_table item_out">
		                          <thead>
		                            <tr>
		                              <th class="thead">产成品编码</th>
		                              <th class="thead">名称</th>
		                              <th class="thead">工艺属性</th>
		                            </tr>
		                          </thead>
		                          <tbody class="table_tbody">
		                          </tbody>
		                        </table>
		                    </div>
                    </div>     
    </form>`,
		success: function (layero, index) {
			var _materialData = $('.pop-button.attrview').data('modalData');
			var _inData = JSON.parse(_materialData.in_material),
				_outData = JSON.parse(_materialData.out_material);
			createInModalHtml($('.in_material .item_in .table_tbody'), _inData);
			createModalHtml($('.out_material .item_out .table_tbody'), _outData);
		},
		end: function () {
			$('.out_material .item_out .table_tbody').html('');
		}

	})

}

function viewWtModal() {
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
	
					<div style="height: 40px;">
						<button data-id="" type="button" class="button pop-button" id="printWt">打印工艺单</button>
					</div>
					<div id="dowPrintWt" style="background-color: #F5FCFF">
						<div style="border-bottom: 1px solid #F0F1F1;display: flex;flex-direction: row;flex-wrap: wrap; justify-content: space-between;">
						<div style="flex: 9;">
							<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
								<div style="line-height: 50px;width:30%;margin-left: 10px;">销售订单号：${sales_order_code}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">生产订单号：${po_number}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">工单号：${wo_number}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">能力：${group_routing_package[0].abilitys[0].ability_name}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">工作中心：${group_routing_package[0].workcenters[0].name}</div>
							</div>
						</div>
						<div style="flex: 1;">
							<div style="border: 1px #ccc solid;background: #fff;padding: 6px;border-radius: 4px;display: inline-block;">
								<div id="qrcodewt" style="width:110px; height:110px;margin-top: -50px;">
									<div id="qrCodeIcowt"></div>
								</div>
							</div>
						</div>
					</div>	
						<div id="formPrintWt"></div>
					</div>
					

    </form>`,
		success: function (layero, index) {
            // createPreview(group_routing_package);
			createGroupRouting(group_routing_package)

            //二维码
            var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
                width: 110,
                height: 110,
            });
            var margin = ($("#qrcodewt").height() - $("#qrCodeIcowt").height()) / 2; //控制Logo图标的位置
            $("#qrCodeIcowt").css("margin", margin);
            var unit = $('.unit').text();
            var wo_number = $('.wo_number').text();
            var wt_number = $('.wt_number').text();
            makeCode(wo_number, wt_number, po_number, item_no, qty, unit,total_workhour, qrcodewt);
		},
		end: function () {
			$('.out_material .item_out .table_tbody').html('');
		}

	})
}

function createGroupRouting(data) {
	var ele = $("#formPrintWt");
    // data= [
    //         {
    //             "id":46767,
    //             "routing_node_id":275,
    //             "bom_id":40552,
    //             "comment":"",
    //             "operation_ability_ids":"88",
    //             "practice_id":-1,
    //             "step_id":24,
    //             "operation_id":15,
    //             "practice_work_hour":0,
    //             "is_start_or_end":2,
    //             "routing_id":69,
    //             "index":1,
    //             "select_type":0,
    //             "old_description":"",
    //             "group_index":"24_1-25_2",
    //             "material_category_id":215,
    //             "practice_step_order_id":0,
    //             "device_id":13,
    //             "name":"拉布/裁剪",
    //             "code":"CJ01",
    //             "description":null,
    //             "device_name":"梦二发泡机2",
    //             "field_description":"",
    //             "abilitys":[
    //                 {
    //                     "ability_name":"机械拉布+手工裁剪",
    //                     "description":"采用机械的拉布方式以及手工的裁剪方式"
    //                 }
    //             ],
    //             "abilitys_ids":[
    //                 "88"
    //             ],
    //             "material":[
    //                 {
    //                     "material_name":"空气层/2.30M/300G/M01-0295/60%涤40%人棉/无要求",
    //                     "commercial":"M",
    //                     "material_id":62767,
    //                     "is_lzp":0,
    //                     "bom_routing_base_id":46767,
    //                     "use_num":1.94,
    //                     "type":1,
    //                     "material_code":"600100000306",
    //                     "desc":"",
    //                     "POSNR":"0060",
    //                     "attributes":[
    //                         {
    //                             "value":"空气层",
    //                             "from":"3",
    //                             "name":"名称",
    //                             "commercial":null,
    //                             "unit_text":null,
    //                             "iso_code":null,
    //                             "material_id":62767
    //                         },
    //                         {
    //                             "value":"2.30M",
    //                             "from":"3",
    //                             "name":"门幅",
    //                             "commercial":null,
    //                             "unit_text":null,
    //                             "iso_code":null,
    //                             "material_id":62767
    //                         },
    //                         {
    //                             "value":"300G",
    //                             "from":"3",
    //                             "name":"克重",
    //                             "commercial":null,
    //                             "unit_text":null,
    //                             "iso_code":null,
    //                             "material_id":62767
    //                         },
    //                         {
    //                             "value":"M01-0295",
    //                             "from":"3",
    //                             "name":"样册号",
    //                             "commercial":null,
    //                             "unit_text":null,
    //                             "iso_code":null,
    //                             "material_id":62767
    //                         },
    //                         {
    //                             "value":"60%涤40%人棉",
    //                             "from":"3",
    //                             "name":"成分",
    //                             "commercial":null,
    //                             "unit_text":null,
    //                             "iso_code":null,
    //                             "material_id":62767
    //                         },
    //                         {
    //                             "value":"无要求",
    //                             "from":"3",
    //                             "name":"特殊要求",
    //                             "commercial":null,
    //                             "unit_text":null,
    //                             "iso_code":null,
    //                             "material_id":62767
    //                         },
    //                         {
    //                             "value":"",
    //                             "from":"3",
    //                             "name":"备注",
    //                             "commercial":null,
    //                             "unit_text":null,
    //                             "iso_code":null,
    //                             "material_id":62767
    //                         }
    //                     ]
    //                 }
    //             ],
    //             "workcenters":[
    //                 {
    //                     "name":"裁剪A",
    //                     "code":"M1CJ001",
    //                     "workcenter_id":154,
    //                     "bom_routing_base_id":46767
    //                 }
    //             ],
    //             "step_drawings":[
    //
    //             ]
    //         },
    //         {
    //             "id":46768,
    //             "routing_node_id":275,
    //             "bom_id":40552,
    //             "comment":"",
    //             "operation_ability_ids":"88",
    //             "practice_id":-1,
    //             "step_id":25,
    //             "operation_id":15,
    //             "practice_work_hour":0,
    //             "is_start_or_end":3,
    //             "routing_id":69,
    //             "index":2,
    //             "select_type":2,
    //             "old_description":"",
    //             "group_index":"24_1-25_2",
    //             "material_category_id":215,
    //             "practice_step_order_id":0,
    //             "device_id":0,
    //             "name":"捆扎",
    //             "code":"CJ02",
    //             "description":null,
    //             "device_name":null,
    //             "field_description":"",
    //             "abilitys":[
    //                 {
    //                     "ability_name":"机械拉布+手工裁剪",
    //                     "description":"采用机械的拉布方式以及手工的裁剪方式"
    //                 }
    //             ],
    //             "abilitys_ids":[
    //                 "88"
    //             ],
    //             "material":[
    //                 {
    //                     "material_name":"20002000000135空气层",
    //                     "commercial":"PC",
    //                     "material_id":90597,
    //                     "is_lzp":1,
    //                     "bom_routing_base_id":46768,
    //                     "use_num":1,
    //                     "type":2,
    //                     "material_code":"20002000000135",
    //                     "desc":"",
    //                     "POSNR":"",
    //                     "attributes":[
    //                         {
    //                             "value":"32.2",
    //                             "name":"长（厘米）"
    //                         },
    //                         {
    //                             "value":"11.6",
    //                             "name":"宽（厘米）"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"高（厘米）"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"长2（厘米）"
    //                         },
    //                         {
    //                             "value":"8.6",
    //                             "name":"宽2（厘米）"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"高2（厘米）"
    //                         },
    //                         {
    //                             "value":"是",
    //                             "name":"是否为样板"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"单耗"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"排版图件数"
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     "material_name":"20002000000136空气层",
    //                     "commercial":"PC",
    //                     "material_id":90598,
    //                     "is_lzp":1,
    //                     "bom_routing_base_id":46768,
    //                     "use_num":1,
    //                     "type":2,
    //                     "material_code":"20002000000136",
    //                     "desc":"",
    //                     "POSNR":"",
    //                     "attributes":[
    //                         {
    //                             "value":"74.5",
    //                             "name":"长（厘米）"
    //                         },
    //                         {
    //                             "value":"51.5",
    //                             "name":"宽（厘米）"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"高（厘米）"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"长2（厘米）"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"宽2（厘米）"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"高2（厘米）"
    //                         },
    //                         {
    //                             "value":"否",
    //                             "name":"是否为样板"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"单耗"
    //                         },
    //                         {
    //                             "value":"0",
    //                             "name":"排版图件数"
    //                         }
    //                     ]
    //                 }
    //             ],
    //             "workcenters":[
    //
    //             ],
    //             "step_drawings":[
    //                 {
    //                     "id":368,
    //                     "bom_routing_base_id":46768,
    //                     "drawing_id":50,
    //                     "image_path":"drawing/material/old/高低脚/58a3c7b4d40fa.jpg",
    //                     "image_name":"高低脚",
    //                     "step_name":"捆扎",
    //                     "code":"01GD0001"
    //                 },
    //                 {
    //                     "id":369,
    //                     "bom_routing_base_id":46768,
    //                     "drawing_id":51,
    //                     "image_path":"drawing/material/old/高低枕大片/58a3c89ba251f.jpg",
    //                     "image_name":"高低枕大片",
    //                     "step_name":"捆扎",
    //                     "code":"01CF0001"
    //                 }
    //             ]
    //         }
    //     ];routing_node_id
    // data = JSON.parse("[{\"id\":51458,\"\":203,\"bom_id\":40142,\"comment\":\"\",\"operation_ability_ids\":\"5\",\"practice_id\":-1,\"step_id\":41,\"operation_id\":7,\"practice_work_hour\":0,\"is_start_or_end\":1,\"routing_id\":63,\"index\":1,\"select_type\":0,\"old_description\":\"\",\"group_index\":\"41_1-41_1\",\"material_category_id\":295,\"practice_step_order_id\":0,\"device_id\":0,\"name\":\"\u8d34\u6807\u7b7e\",\"code\":\"0013\",\"description\":null,\"device_name\":null,\"field_description\":\"\",\"abilitys\":[{\"ability_name\":\"\u5305\u88c5\u7ebf\u8def1\",\"description\":\"\u5957\u5916\u5957+\u88c5\u888b+\u538b\u7f29\u5377\u88c5+\u5957\u7b52\u6599(\u888b)\"}],\"abilitys_ids\":[\"5\"],\"material\":{\"0\":{\"bom_commercial\":\"PC\",\"material_id\":3318,\"material_name\":\"\",\"material_code\":\"640301000182\",\"is_lzp\":0,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":1,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[{\"value\":\"\u5305\u88c5\u888b\",\"from\":\"3\",\"name\":\"\u540d\u79f0\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318},{\"value\":\"6\",\"from\":\"3\",\"name\":\"\u539a\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318},{\"value\":\"S\",\"from\":\"3\",\"name\":\"\u5355\u4f4d1\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318},{\"value\":\"135\",\"from\":\"3\",\"name\":\"\u5bbd\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318},{\"value\":\"255\",\"from\":\"3\",\"name\":\"\u957f\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318},{\"value\":\"CM\",\"from\":\"3\",\"name\":\"\u5355\u4f4d\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318},{\"value\":\"\u900f\u660e\",\"from\":\"3\",\"name\":\"\u989c\u8272\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318},{\"value\":\"\",\"from\":\"3\",\"name\":\"\u5907\u6ce8\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":3318}],\"qty\":200,\"divided_by_outusenum\":1},\"1\":{\"bom_commercial\":\"PC\",\"material_id\":6807,\"material_name\":\"\",\"material_code\":\"640501000388\",\"is_lzp\":0,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":1,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[{\"value\":\"\u7b52\u6599\",\"from\":\"3\",\"name\":\"\u540d\u79f0\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807},{\"value\":\"10\",\"from\":\"3\",\"name\":\"\u539a\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807},{\"value\":\"S\",\"from\":\"3\",\"name\":\"\u5355\u4f4d1\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807},{\"value\":\"66\",\"from\":\"3\",\"name\":\"\u5bbd\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807},{\"value\":\"110\",\"from\":\"3\",\"name\":\"\u957f\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807},{\"value\":\"CM\",\"from\":\"3\",\"name\":\"\u5355\u4f4d\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807},{\"value\":\"\u900f\u660e\",\"from\":\"3\",\"name\":\"\u989c\u8272\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807},{\"value\":\"\",\"from\":\"3\",\"name\":\"\u5907\u6ce8\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":6807}],\"qty\":200,\"divided_by_outusenum\":1},\"2\":{\"bom_commercial\":\"PC\",\"material_id\":8176,\"material_name\":\"\",\"material_code\":\"640703000012\",\"is_lzp\":0,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":1,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[{\"value\":\"\u4e03\u5c42\u5f69\u7bb1\",\"from\":\"3\",\"name\":\"\u540d\u79f0\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176},{\"value\":\"300g\u7070\u767d\u677f+140g\u91cc\u7eb8+140gA\u74e6+120gB\u74e6+90gE\u74e6+65g\u5939\u5fc3\",\"from\":\"3\",\"name\":\"\u6750\u8d28\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176},{\"value\":\"44\",\"from\":\"3\",\"name\":\"\u957f\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176},{\"value\":\"44\",\"from\":\"3\",\"name\":\"\u5bbd\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176},{\"value\":\"101\",\"from\":\"3\",\"name\":\"\u9ad8\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176},{\"value\":\"CM\",\"from\":\"3\",\"name\":\"\u5355\u4f4d\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176},{\"value\":\"\u4e9a\u819c\",\"from\":\"3\",\"name\":\"\u5de5\u827a\u8981\u6c42\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176},{\"value\":\"WX-XMLY-7001\\/10TTXLF11TTXLF13TTXL\",\"from\":\"3\",\"name\":\"\u5907\u6ce8\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8176}],\"qty\":200,\"divided_by_outusenum\":1},\"3\":{\"bom_commercial\":\"PC\",\"material_id\":82622,\"material_name\":\"\",\"material_code\":\"FH01-000658\",\"is_lzp\":1,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":1,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[],\"qty\":200,\"divided_by_outusenum\":1},\"4\":{\"bom_commercial\":\"PC\",\"material_id\":8238,\"material_name\":\"\",\"material_code\":\"310100003419\",\"is_lzp\":0,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":1,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[{\"value\":\"\u666e\u901a\u5e8a\u5916\u5957\",\"from\":\"3\",\"name\":\"\u540d\u79f0\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8238},{\"value\":\"XMLY\",\"from\":\"3\",\"name\":\"\u5ba2\u6237\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8238},{\"value\":\"79\\\"\",\"from\":\"3\",\"name\":\"\u957f\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8238},{\"value\":\"37\\\"\",\"from\":\"3\",\"name\":\"\u5bbd\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8238},{\"value\":\"13\\\"\",\"from\":\"3\",\"name\":\"\u539a\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8238},{\"value\":\"\u65e0\u8981\u6c42\",\"from\":\"3\",\"name\":\"\u7ed7\u7f1d\u82b1\u578b\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8238},{\"value\":\"\u6210\u54c1\u5c3a\u5bf8:79*37*13\\\"\",\"from\":\"3\",\"name\":\"\u5907\u6ce8\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8238}],\"qty\":200,\"divided_by_outusenum\":1},\"5\":{\"bom_commercial\":\"PC\",\"material_id\":7663,\"material_name\":\"\",\"material_code\":\"620300000932\",\"is_lzp\":0,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":1,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[{\"value\":\"\u5f69\u9875\",\"from\":\"3\",\"name\":\"\u540d\u79f0\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"\u5f69\u8272\",\"from\":\"3\",\"name\":\"\u989c\u8272\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"\u53cc\u94dc\u677f\",\"from\":\"3\",\"name\":\"\u6750\u8d28\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"21CM\",\"from\":\"3\",\"name\":\"\u957f\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"29.7CM\",\"from\":\"3\",\"name\":\"\u5bbd\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"157G\",\"from\":\"3\",\"name\":\"\u514b\u91cd\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"\u5149\u819c\",\"from\":\"3\",\"name\":\"\u7279\u6b8a\u8981\u6c42\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"\u5355\u9762\u5370\u5237\",\"from\":\"3\",\"name\":\"\u5de5\u827a\u8981\u6c42\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663},{\"value\":\"SM-XMLY-0002\",\"from\":\"3\",\"name\":\"\u5907\u6ce8\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7663}],\"qty\":200,\"divided_by_outusenum\":1},\"6\":{\"bom_commercial\":\"PC\",\"material_id\":7664,\"material_name\":\"\",\"material_code\":\"620300000933\",\"is_lzp\":0,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":1,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[{\"value\":\"\u5f69\u9875\",\"from\":\"3\",\"name\":\"\u540d\u79f0\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"\u5f69\u8272\",\"from\":\"3\",\"name\":\"\u989c\u8272\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"\u53cc\u94dc\u677f\",\"from\":\"3\",\"name\":\"\u6750\u8d28\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"29.7CM\",\"from\":\"3\",\"name\":\"\u957f\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"21CM\",\"from\":\"3\",\"name\":\"\u5bbd\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"157G\",\"from\":\"3\",\"name\":\"\u514b\u91cd\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"\u5149\u819c\",\"from\":\"3\",\"name\":\"\u7279\u6b8a\u8981\u6c42\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"\u5355\u9762\u5370\u5237\",\"from\":\"3\",\"name\":\"\u5de5\u827a\u8981\u6c42\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664},{\"value\":\"SM-XMLY-0001\",\"from\":\"3\",\"name\":\"\u5907\u6ce8\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":7664}],\"qty\":200,\"divided_by_outusenum\":1},\"8\":{\"bom_commercial\":\"PC\",\"material_id\":8234,\"material_name\":\"\",\"material_code\":\"100101001372\",\"is_lzp\":0,\"bom_routing_base_id\":51458,\"use_num\":1,\"type\":2,\"desc\":\"\",\"bom_unit_id\":229,\"attributes\":[{\"value\":\"13\\\"Serene Elite\u5e8a\u57ab\u3010PCM\u3011\",\"from\":\"3\",\"name\":\"\u540d\u79f0\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234},{\"value\":\"\u5207\u5272\u7ef5\u5e8a\u57ab\",\"from\":\"3\",\"name\":\"\u6210\u54c1\u79cd\u7c7b\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234},{\"value\":\"XMLY\",\"from\":\"3\",\"name\":\"\u5ba2\u6237\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234},{\"value\":\"79\",\"from\":\"3\",\"name\":\"\u957f\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234},{\"value\":\"37\",\"from\":\"3\",\"name\":\"\u5bbd\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234},{\"value\":\"13\",\"from\":\"3\",\"name\":\"\u539a\u5ea6\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234},{\"value\":\"\\\"\",\"from\":\"3\",\"name\":\"\u5355\u4f4d\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234},{\"value\":\"\",\"from\":\"3\",\"name\":\"\u5907\u6ce8\",\"commercial\":null,\"unit_text\":null,\"iso_code\":null,\"material_id\":8234}],\"qty\":200,\"divided_by_outusenum\":1}},\"step_drawings\":[],\"workcenters\":[{\"name\":\"\u539a\u57ab\u5305\u88c5\",\"code\":\"M2CB004\",\"workcenter_id\":217,\"bom_routing_base_id\":51458}],\"attachment\":[]}]")
	data.forEach(function (item) {
        var material_in = getFilterPreviewData(item.material, 1);
            material_out = getFilterPreviewData(item.material, 2);
        var material_in_html = '';
        material_in.forEach(function (initem) {
            var title = `
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >物料：${initem.material_name}</span>
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >编码：${initem.material_code}</span>
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >数量：${initem.qty}</span>
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >单位：${initem.bom_commercial}</span>
						`;
            var inattrs = '';
            initem.attributes.forEach(function (item) {
                inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
            })
            material_in_html+=`<div style="width:400px;margin:2px;border: 1px solid #3FEE89;padding: 2px;">
									<div style="border-bottom: 1px solid #41f68c;">${title}</div>
									<div>${inattrs}</div>
									<div style="height: 30px;margin-left: 10px;">
										<span style="display:inline-block;">批次：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
										<span style="display:inline-block;">领料数量：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
										<span style="display:inline-block;">消耗数量：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
									</div>
								</div>`
        });
        var material_out_html = '';
        material_out.forEach(function (outitem) {
        	var title = `
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >物料：${outitem.material_name}</span>
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >编码：${outitem.material_code}</span>
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >数量：${outitem.qty}</span>
						<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >单位：${outitem.bom_commercial}</span>
						`;
            var inattrs = '';
            outitem.attributes.forEach(function (item) {
                inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
            })
            material_out_html+=`<div style="width:400px;margin:2px;border: 1px solid #EA5456;">
									<div style="border-bottom: 1px solid #f15456;">${title}</div>
									<div>${inattrs}</div>
									<div style="height: 30px;margin-left: 10px;">
										<span style="display:inline-block;">产成数量：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
									</div>
								</div>`
        })
        var step_drawings_html = '';
        item.step_drawings.forEach(function (ditem) {
            step_drawings_html+=`<div style="text-align: center;margin: 10px;" data-url="${ditem.image_path}">
				 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
				 <p style="cursor: pointer;">${ditem.code}</p>
				 </div>`
        });


		var _thml = `
					<div style="border-bottom: 1px solid #F0F1F1;">
						<h4 style="color: #0510FB;">步骤${item.index}：${item.name}</h4>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #3DC08A;">消耗品</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${material_in_html}							
								</div>
							</div>
						</div>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #EA5456">产成品</div>
							<div style="flex: 11">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${material_out_html}
								</div>
							</div>
						</div>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #00a4ed;">图片</div>
							<div style="flex: 11">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${step_drawings_html}
								</div>
							</div>
						</div>
						
					</div>
					`;
        ele.append(_thml);
	})


}

function getFilterPreviewData(dataArr, type) {
	console.log(dataArr);
    return dataArr.filter(function (e) {
        return e.type == type;
    });
}


