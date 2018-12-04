var id,type,type_code,sub_id,picking_id,production_id,
pickingList='';
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    // type_code = getQueryString('type_code');

    if (id != undefined) {
        getOutsourceOrderItem(id);
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }



    bindEvent();
});
function getOutsourceOrderItem(id) {
    var url = '';
    if(type==3){
        url = URLS['outsource'].showSendBack+"?"+_token+"&picking_line_id="+id
    }else {
        url = URLS['outsource'].getFlowItems+"?"+_token+"&id="+id
    }
    AjaxClient.get({
        url: url,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            sub_id = rsp.results.sub_id
            picking_id = rsp.results.picking_id
            production_id = rsp.results.production_id
            BANFN = rsp.results.BANFN
            BNFPO = rsp.results.BNFPO
            $('#BNFPO').val(rsp.results.BNFPO);
            $('#BANFN').val(rsp.results.BANFN);
            $('#AUFNR').val(rsp.results.AUFNR);
            $('#sub').val(rsp.results.EBELN);
            if(type==3){
                if(rsp.results){
                    createReturnOutsourceHtml($('.item_outsource_table .t-body'),rsp.results.materials);
                }
            }else {
                if(rsp.results.diff.length>0){
                    createOutsourceHtml($('.item_outsource_table .t-body'),rsp.results.diff);
                }
            }



        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    },this);


}

function bindEvent() {
    $('body').on('click','.save',function (e) {
        e.stopPropagation();
        submitPickingList()
    });
    $('body').on('click','.table-bordered .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
}

function submitPickingList() {

if(type==3){
    var material_arr = [];
    var flag = true,message='';
    $('.table-bordered .t-body .tritem').each(function (k,v) {
        var num = 0;
        $(v).find('.wrap_table_div .table_tbody .bacth_show').each(function (kb,vb) {
            num += Number($(vb).find('.demand_num').val());
            if(Number($(vb).find('.demand_num').val()) <= Number($(vb).find('.total_qty').text())){
                material_arr.push({
                    id:'',
                    material_id:$(v).attr('data-material'),
                    depot_id:$(vb).attr('data-depot'),
                    inve_id:$(vb).attr('data-inve'),
                    lot:$(vb).attr('data-lot'),
                    qty:$(vb).find('.demand_num').val(),
                    unit_id:$(v).attr('data-unit'),
                    rated:0,
                })
            }else {
                message=$(v).find('.DMATNR').text()+"的物料的"+$(vb).find('.item_lot').text()+"批次的退料超过累计领补量！";
                flag=false;
                return;
            }
        })

    });
    if(flag) {
        if(material_arr.length>0){
            var data= {
                sub_id:sub_id,
                picking_line_id:id,
                picking_id:picking_id,
                production_id: production_id,
                BANFN:$('#BANFN').val(),
                BNFPO:$('#BNFPO').val(),
                items:JSON.stringify(material_arr),
                type:type,
                _token:TOKEN
            };
            AjaxClient.post({
                url: URLS['outsource'].storeFlowItems,
                data:data,
                dataType: 'json',
                beforeSend: function () {
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('success','保存成功！');
                    $(".save").hide();
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail','保存失败！错误日志为：'+rsp.message);
                }
            }, this)
        }
    }else {
        LayerConfig('fail',message);
    }
}else {
    var material_arr = [];
    var flag = true,message='';
    $('.table-bordered .t-body .tritem').each(function (k,v) {
        var num = 0;
        $(v).find('.wrap_table_div .table_tbody .bacth_show').each(function (kb,vb) {
            num += Number($(vb).find('.demand_num').val());
            if(Number($(vb).find('.demand_num').val()) <= Number($(vb).find('.storage_number').text())){
                material_arr.push({
                    id:'',
                    material_id:$(v).attr('data-material'),
                    depot_id:$(vb).attr('data-depot'),
                    inve_id:$(vb).attr('data-inve'),
                    lot:$(vb).attr('data-lot'),
                    qty:$(vb).find('.demand_num').val(),
                    unit_id:$(v).attr('data-unit'),
                    rated:$(v).attr('data-rated')?$(v).attr('data-rated'):'',
                })
            }else {
                message=$(v).find('.DMATNR').text()+"的物料的"+$(vb).find('.item_lot').text()+"批次的库存不足！";
                flag=false;
                return;
            }
        })
        if(flag){
            if(num>Number($(v).attr('data-rated'))){
                message=$(v).find('.DMATNR').text()+"的物料超领！";
                flag=false;
                return;
            }
        }else {
            return;
        }

    });
    if(flag) {
        if(material_arr.length>0){
            var data= {
                sub_id:sub_id,
                picking_line_id:id,
                picking_id:picking_id,
                production_id: production_id,
                BANFN:$('#BANFN').val(),
                BNFPO:$('#BNFPO').val(),
                items:JSON.stringify(material_arr),
                type:type,
                _token:TOKEN
            };
            AjaxClient.post({
                url: URLS['outsource'].storeFlowItems,
                data:data,
                dataType: 'json',
                beforeSend: function () {
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('success','保存成功！');
                    $(".save").hide();
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail','保存失败！错误日志为：'+rsp.message);
                }
            }, this)
        }
    }else {
        LayerConfig('fail',message);
    }
}


}
function createReturnOutsourceHtml(ele,data){
    ele.html('');
    $("#show_rate").hide();
    for(var i in data){
        var arr = Object.values(data[i]);
        var _html = createReturnPiciHtml(arr)
        var tr=`
            <tr class="tritem" data-material="${arr[0].material_id}" data-unit="${arr[0].unit_id}">
                <td  class="DMATNR">${tansferNull(arr[0].material_item_no)}</td>
                <td  class="material_name">${tansferNull(arr[0].material_name)}</td>
                <td>${_html}</td>
                <td  class="DMEINS">${tansferNull(arr[0].commercial)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",arr[0]);
    }
}

function createOutsourceHtml(ele,data){
    ele.html('');
    data.forEach(function (item) {
        var _html = createPiciHtml(item.storage,item.rated)
            var tr=`
            <tr class="tritem" data-material="${item.material_id}" data-unit="${item.unit_id}" data-rated="${item.rated}">
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="material_name">${tansferNull(item.material_name)}</td>
                <td  class="BNFPO">${tansferNull(item.rated)}</td>
                <td>${_html}</td>
                <td  class="DMEINS">${tansferNull(item.commercial)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
    })

}
function createReturnPiciHtml(data){
    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){
            trs+= `
			<tr class="bacth_show" data-inve="${tansferNull(item.inve_id)}" data-lot="${tansferNull(item.lot)}" data-depot="${item.depot_id}">
			<td class="item_so">${tansferNull(item.sale_order_code)}</td>
			<td class="item_po">${tansferNull(item.po_number)}</td>
			<td class="item_wo">${tansferNull(item.wo_number)}</td>
			<td class="item_lot">${tansferNull(item.lot)}</td>
			<td class="total_qty">${tansferNull(item.total_qty)}</td>
			<td>
			    <input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value=""  class="el-input demand_num" >
            </td>
			
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="6" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">累计领补量</th>
                        <th class="left nowrap tight">数量</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`;
    return thtml;
}

function createPiciHtml(data,qty){

        var trs='';
        if(data&&data.length){
            data.forEach(function(item,index){
                trs+= `
			<tr class="bacth_show" data-inve="${tansferNull(item.inve_id)}" data-lot="${tansferNull(item.lot)}" data-depot="${item.depot_id}">
			<td class="item_so">${tansferNull(item.sale_order_code)}</td>
			<td class="item_po">${tansferNull(item.po_number)}</td>
			<td class="item_wo">${tansferNull(item.wo_number)}</td>
			<td class="item_lot">${tansferNull(item.lot)}</td>
			<td class="storage_number">${tansferNull(item.storage_validate_quantity)}</td>
			<td>
			    <input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${data.length==1?qty:''}"  class="el-input demand_num" >
            </td>
			
			</tr>
			`;
            })
        }else{
            trs='<tr><td colspan="6" class="center">暂无数据</td></tr>';
        }
        var thtml=`<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`;
        return thtml;
}
