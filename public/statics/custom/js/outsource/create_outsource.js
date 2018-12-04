var id,type,type_code,
pickingList='';
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    type_code = getQueryString('type_code');
    var typeStr = {
        ZY03:'委外定额领料单号',
        ZB03:'委外补料单号',
        ZY06:'委外定额退料单号',
        ZY05:'委外超耗补料单号',
        ZY04:'委外超发退料单号'
    };
    $('#show_title').text(typeStr[type_code])
    if (id != undefined) {
        getOutsourceItem(id);
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }
    $('#storage').autocomplete({
        url: URLS['outsource'].Factory+"?"+_token+"&sort=id&order=asc&page_no=1&page_size=10",
        param:'factory_name',
        showCode:'factory_name'
    });
    $('#employee').autocomplete({
        url: URLS['outsource'].judge_person+"?"+_token+"&page_no=1&page_size=10",
        param:'name'
    });

    bindEvent();
});
function getOutsourceItem(id) {
    AjaxClient.get({
        url: URLS['outsource'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            $('#EBELN').val(rsp.results[0].EBELN);
            $('#BUKRS').val(rsp.results[0].BUKRS);
            $('#BSTYP').val(rsp.results[0].BSTYP);
            $('#BSART').val(rsp.results[0].BSART);
            $('#LIFNR').val(rsp.results[0].LIFNR);
            $('#EKORG').val(rsp.results[0].EKORG);
            $('#EKGRP').val(rsp.results[0].EKGRP);
            createOutsourceHtml($('.item_outsource_table .t-body'),rsp.results[0].lines);

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
        if($(v).find('.demand_num').val()!=''){
            material_arr.push({
                id:'',
                EBELN:$('#EBELN').val(),
                EBELP:$(v).find('.EBELP').text(),
                BANFN:$(v).find('.BANFN').text(),
                BNFPO:$(v).find('.BNFPO').text(),
                XQSLDW:$(v).find('.DMEINS').text(),
                LGFSB:$(v).find('.LGFSB').text(),
                DWERKS:$(v).find('.DWERKS').text(),
                MATNR:$(v).find('.DMATNR').text(),
                XQSL:$(v).find('.demand_num').val(),
                picking_line_item_id:$(v).attr('data-id'),
            })
        }

    })
    var data= {
        out_picking_id:id,
        items:JSON.stringify(material_arr),
        type:type,
        type_code:type_code,
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
            LayerConfig('success','成功！')


        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)


}

function createOutsourceHtml(ele,data){
    ele.html('');
    data.forEach(function (item) {
        item.items.forEach(function (val) {
            if(val.zuofei!=1){
                var tr=`
                        <tr class="tritem" data-id="${val.id}">
                            <td  class="EBELP">${tansferNull(item.EBELP)}</td>
                            <td  class="AUFNR">${tansferNull(item.AUFNR)}</td>
                            <td  class="DMATNR">${tansferNull(val.DMATNR)}</td>
                            <td  class="material_name">${tansferNull(val.material_name)}</td>
                            <td  class="DWERKS">${tansferNull(val.DWERKS)}</td>
                            <td  class="LGFSB">${tansferNull(val.LGFSB)}</td>
                            <td  class="BANFN">${tansferNull(val.BANFN)}</td>
                            <td  class="BNFPO">${tansferNull(val.BNFPO)}</td>
                            <td>${tansferNull(val.DBDMNG)}</td>
                            <td>${tansferNull(val.actual_send_qty)}</td>
                            ${type_code=='ZY03'?``:''}
                            <td><input type="number" min="0" style="line-height: 40px;" value="${type_code=='ZY03'?(Subtr(val.DBDMNG,val.actual_send_qty)>0?Subtr(val.DBDMNG,val.actual_send_qty):0):''}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="" class="el-input demand_num" ></td>
                            <td  class="DMEINS">${tansferNull(val.DMEINS)}</td>         
                            <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
                        </tr>
                    `;
                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);
            }

        })
    })

}
function Subtr(arg1,arg2){
    var r1,r2,m,n;
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    n=(r1>=r2)?r1:r2;
    return ((arg1*m-arg2*m)/m).toFixed(n);
}