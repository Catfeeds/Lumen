var id,type,type_code,
pickingList='';
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    var typeStr = {
        ZY03:'委外定额领料单号',
        ZB03:'委外补料单号',
        ZY06:'委外超发退料单号',
        ZY05:'委外超耗补料单号',
        ZY04:'委外定额退料单号'
    };
    $('#show_title').text(typeStr[type])
    $('#change_lable').text(typeStr[type]);

    if (id != undefined) {
        getOutsourceItem(id);
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }
    bindEvent();
});
function getOutsourceItem(id) {
    AjaxClient.get({
        url: URLS['outsource'].OutMachineZyShow+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);

            $('#out_picking_id').val(rsp.results[0].out_picking_id)
            $('#storage').val(rsp.results[0].factory_name);
            $('#code').val(rsp.results[0].code);
            $('#EBELN').val(rsp.results[0].EBELN);
            $('#warehouse').val(rsp.results[0].wms_depot_name);
            $('#time').val(rsp.results[0].time);
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
}

function submitPickingList() {

    var material_arr = [];

    $('.table-bordered .t-body tr').each(function (k,v) {
        material_arr.push({
            id:$(v).attr('data-id'),
            EBELN:$('#EBELN').val(),
            EBELP:$(v).find('.EBELP').text(),
            BANFN:$(v).find('.BANFN').text(),
            BNFPO:$(v).find('.BNFPO').text(),
            LGFSB:$(v).find('.LGFSB').text(),
            line_project_code:$(v).find('.line_project_code').text(),
            XQSLDW:$(v).find('.DMEINS').text(),
            MATNR:$(v).find('.DMATNR').text(),
            XQSL:$(v).find('.demand_num').val()?$(v).find('.demand_num').val():'',

        })
    })


        var data= {
            id:id,
            out_picking_id: $('#out_picking_id').val(),
            items:JSON.stringify(material_arr),
            _token:TOKEN
        };
        AjaxClient.post({
            url: URLS['outsource'].store,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success','保存成功！');
                getOutsourceItem(id);


            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail','保存失败！错误日志为：'+rsp.message)
            }
        }, this)


}

function createOutsourceHtml(ele,data){
    ele.html('');
    data.forEach(function (item) {

            var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td  class="EBELP">${tansferNull(item.EBELP)}</td>
                <td  class="line_project_code">${tansferNull(item.line_project_code)}</td>
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="DMATNR">${tansferNull(item.material_name)}</td>
                <td  class="LGFSB">${tansferNull(item.LGFSB)}</td>
                <td  class="BANFN">${tansferNull(item.BANFN)}</td>
                <td  class="BNFPO">${tansferNull(item.BNFPO)}</td>
                <td><input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="el-input demand_num" value="${item.XQSL}" ></td>
                <td  class="DMEINS">${tansferNull(item.XQSLDW)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);

    })

}