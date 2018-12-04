var id,type,type_code,sub_id,picking_id,production_id,employee_id,status,
pickingList='';
$(function () {
    id = getQueryString('id');
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
    AjaxClient.get({
        url: URLS['outsource'].OutWorkShop+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            sub_id = rsp.results[0].sub_id;
            picking_id = rsp.results[0].picking_id;
            production_id = rsp.results[0].production_id;
            type = rsp.results[0].type;
            if(type==3){
                $("#reat_qty").hide();
                $(".save").text('实退')
            }

            $('#BNFPO').val(rsp.results[0].BNFPO);
            $('#BANFN').val(rsp.results[0].BANFN);
            $('#AUFNR').val(rsp.results[0].code);
            $('#sub').val(rsp.results[0].EBELN);

            $('#employee').val(rsp.results[0].employee_name);
            status = rsp.results[0].status;
            if(rsp.results[0].status==0){
                $('.storage').show()
            }
            if(rsp.results[0].status==1){
                $('.return').show()
            }
            createOutsourceHtml($('.item_outsource_table .t-body'),rsp.results[0].groups);

        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','获取领料单失败！')
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
    $('body').on('click','.storage',function () {
        layer.confirm('您将执行审核入库操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            storageOut();


        });
    });
    $('body').on('click','.return',function () {
        layer.confirm('您将执行反审操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            returnOut()
        });
    });
}
function storageOut() {
    AjaxClient.get({
        url: URLS['outsource'].audit+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','审核入库成功！');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)
}
function returnOut() {
    AjaxClient.get({
        url: URLS['outsource'].noaudit+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','反审成功！');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)
}

function submitPickingList() {

    var msg = '';
    if(type==3){
        msg='实退成功！'
    }else {
        msg='实发成功！'
    }

    var material_arr = [];

    $('.table-bordered .t-body tr').each(function (k,v) {
        material_arr.push({
            id:$(v).attr('data-id'),
            material_id:$(v).attr('data-material'),
            inve_id:$(v).attr('data-inve'),
            depot_id:$(v).attr('data-depot'),
            qty:$(v).find('.qty').text(),
            lot:$(v).find('.lot').text(),
            actual_send_qty:$(v).find('.demand_num').val(),
            unit_id:$(v).attr('data-unit'),
            rated:$(v).attr('data-rated'),
        })
    })


        var data= {
            id:id,
            sub_id:sub_id,
            picking_id:picking_id,
            production_id: production_id,
            employee_id: employee_id,
            BANFN:$('#BANFN').val(),
            BNFPO:$('#BNFPO').val(),
            items:JSON.stringify(material_arr),
            type:type,
            _token:TOKEN
        };

        AjaxClient.post({
            url: URLS['outsource'].updateFlowItems,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                layer.confirm(msg, {
                    icon: 6,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    layer.close(index);
                    window.history.back();
                });

            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail',rsp.message)
            }
        }, this)


}

function createOutsourceHtml(ele,data){
    ele.html('');
    data.forEach(function (item) {
            var tr=`
            <tr class="tritem" data-id="${item.id}" data-material="${item.material_id}" data-unit="${item.unit_id}" data-rated="${item.rated}" data-inve="${item.inve_id}" data-depot="${item.depot_id}">
                <td  class="sale_order_code">${tansferNull(item.sale_order_code)}</td>
                <td  class="po_number">${tansferNull(item.po_number)}</td>
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="material_name">${tansferNull(item.material_name)}</td>
                <td  class="lot">${tansferNull(item.lot)}</td>
                <td  class="depot_name">${tansferNull(item.depot_name)}</td>
                <td  class="storage_validate_quantity">${tansferNull(item.storage_validate_quantity)}</td>
                ${type!=3?`<td  class="BNFPO">${tansferNull(item.rated)}</td>`:''}
                <td  class="qty">${tansferNull(item.qty)}</td>
                <td><input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.actual_send_qty?item.actual_send_qty:item.qty}"  class="el-input demand_num" ></td>
                <td  class="DMEINS">${tansferNull(item.unit_commercial)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
    })

}