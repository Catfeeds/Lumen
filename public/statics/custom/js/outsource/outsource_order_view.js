var outsourceId='';
$(function(){
    outsourceId=getQueryString('id');
    getOutsourceItem(outsourceId);



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
            createOutsourceHtml($('.outsource_table .t-body'),rsp.results[0].lines);

        },
        fail: function(rsp){
        }
    },this);


}

function createOutsourceHtml(ele,data) {
    ele.html('');
    data.forEach(function (item) {
        var  itemHtml = '';
        if(item.items && item.items.length){
            itemHtml = createOutsourceItemHtml(item.items);
        }

        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td width="150px">
                    <div class="btn-group">
                        <button type="button" class="button pop-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
                        <ul class="dropdown-menu" role="menu">
                            <li><a href="/Outsource/createOutsourceOrder?id=${item.id}&type=1">生成领料单</a></li>
                            <li><a href="/Outsource/createOutsourceOrder?id=${item.id}&type=2">生成补料单</a></li>
                            <li><a href="/Outsource/createOutsourceOrder?id=${item.id}&type=3">生成退料单</a></li>
                        </ul>
                    </div>
                    <a href="/Outsource/busteOutsourceOrder?id=${item.id}&type=add" class="button pop-button " >报工</a>
                </td>
                <td>${item.has_declare==1?'是':'否'}</td>
                <td>${tansferNull(item.declare_qty)}</td>
                <td>${tansferNull(item.EBELP)}</td>
                <td>${tansferNull(item.WERKS)}</td>
                <td>${tansferNull(item.MENGE)}</td>
                <td>${tansferNull(item.MEINS)}</td>
                <td>${tansferNull(item.BANFN)}</td>
                <td>${tansferNull(item.BNFPO)}</td>
                <td>${tansferNull(item.AUFNR)}</td>         
                <td style="padding: 3px;">${itemHtml}</td>         
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })

}

function createOutsourceItemHtml(lis) {
    var tr = '',_html;
    lis.forEach(function (item) {
        tr += `<tr style="background-color: rgb(0,219,174)">
                    <td style="text-align: center;color: white">${item.RSNUM}</td>
                    <td style="text-align: center; color: white">${item.RSPOS}</td>
                    <td style="text-align: center; color: white">${item.DMATNR}</td>
                    <td style="text-align: center; color: white">${item.DWERKS}</td>
                    <td style="text-align: center; color: white">${item.DLGORT}</td>
                    <td style="text-align: center; color: white">${item.DBDMNG}</td>
                    <td style="text-align: center; color: white">${item.DMEINS}</td>
                </tr>`
    });
    _html=`<table>
                <tr style="background-color: rgb(0,161,106)">
                    <th class="thead" style="color: white">预留编号 </th>
                    <th class="thead" style="color: white">预留项目编号</th>
                    <th class="thead" style="color: white">物料编号</th>
                    <th class="thead" style="color: white">工厂</th>
                    <th class="thead" style="color: white">库存地点</th>
                    <th class="thead" style="color: white">需求量</th>
                    <th class="thead" style="color: white">计量单位</th>
                </tr>
                ${tr}
            </table>`;
    return _html;

}
