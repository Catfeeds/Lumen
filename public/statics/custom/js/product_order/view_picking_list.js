var id,
pickingList='',push_type,type;
$(function () {
    id = getQueryString('id');

    if (id != undefined) {
        getPickView();
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }
    bindEvent();
});

function getPickView() {

    AjaxClient.get({
        url: URLS['order'].workPick +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            pickingList=rsp.results;
            push_type=rsp.results.push_type;
            type=rsp.results.type;
            $('#status').val(rsp.results.status);
            if(rsp.results.type==1){
                if(rsp.results.status==3){
                    $('.save').text('');
                    $('.save').text('入库');
                }
                if(rsp.results.push_type==2){
                    $('#picking_title').text('车间领料单');
                }else if(rsp.results.push_type==1){
                    $('#picking_title').text('SAP领料单');
                }else if(rsp.results.push_type==0){
                    $('#picking_title').text('线边仓领料单');
                }
                if(rsp.results.status==4||rsp.results.status==2){
                    $('.save').hide();
                }else {
                    $('.save').show();
                }
                if(rsp.results.push_type==0){
                    $('.save').hide();
                }
                $('#basic_form_show').html(`<div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">工单</label>
                            <input type="text" id="wo_number" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">单号</label>
                            <input type="text" id="code" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    
                    ${rsp.results.push_type==2?'':`<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">采购仓储</label>
                            <input type="text" id="send_depot" readonly class="el-input" placeholder="请输入采购仓储" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>`}
                </div>
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">销售单号</label>
                            <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                     <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <input type="text" id="workbench_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">需求库存地点</label>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" id="storage_wo" readonly class="el-input" placeholder="请输入需求库存地点" value="">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                   
                </div>
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">销售行项目号</label>
                            <input type="text" id="sales_order_project_code" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">责任人</label>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" id="employee" readonly class="el-input" placeholder="请输入责任人" value="">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                </div>`);
                $('#status').val(rsp.results.status);
                $('#workbench_code').val(rsp.results.workbench_code);
                $('#send_depot').val(rsp.results.send_depot);
                $('#wo_number').val(rsp.results.work_order_code);
                $('#code').val(rsp.results.code);
                $('#storage_wo').val(rsp.results.line_depot_name);
                $('#storage_wo_send').val(rsp.results.send_depot_name);
                $('#employee').val(rsp.results.employee_name);
                if(rsp.results.push_type==1){
                    $('.push_type.yes').parent('.el-radio-input').removeClass('is-radio-checked');
                    $('.push_type.no').parent('.el-radio-input').addClass('is-radio-checked');
                }
                $('#sales_order_code').val(rsp.results.sales_order_code);
                $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
                if(rsp.results.materials){
                    showInItem(rsp.results.sales_order_code,rsp.results.sales_order_project_code,rsp.results.materials,rsp.results.status,rsp.results.push_type);
                }
                if(rsp.results.status==4){
                    $('.save').hide();
                }

            }
            if(rsp.results.type==2){
                if(rsp.results.status==1){
                    $('.save').text('');
                    $('.save').text('出库');
                }else {
                    $('.save').hide();
                }
                if(rsp.results.push_type==2){
                    $('#picking_title').text('车间退料单');
                    if(rsp.results.status==2){
                        $('.save').text('');
                        $('.save').text('确认退料');
                        $('.save').show();
                    }

                }else if(rsp.results.push_type==1){
                    $('#picking_title').text('SAP退料单');
                }else if(rsp.results.push_type==0){
                    $('#picking_title').text('线边仓退料单');
                }
                $('#basic_form_show').html(`<div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单</label>
                                <input type="text" id="wo_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">生产订单号</label>
                                <input type="text" id="po_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                      
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人</label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" readonly id="employee" class="el-input" placeholder="请输入责任人" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <input type="text" id="workbench_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工厂</label>
                                <input type="text" id="factory" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        
                    </div>`);
                $('#storage_wo').val(rsp.results.line_depot_name+'（'+rsp.results.line_depot_code+'）');
                $('#po_number').val(rsp.results.product_order_code);
                $('#workbench_code').val(rsp.results.workbench_code);
                $('#wo_number').val(rsp.results.work_order_code);
                $('#factory').val(rsp.results.factory_name);
                $('#sales_order_code').val(rsp.results.sale_order_project_code);
                $('#employee').val(rsp.results.employee_name);
                if(rsp.results.push_type==1){
                    $('.push_type.yes').parent('.el-radio-input').removeClass('is-radio-checked');
                    $('.push_type.no').parent('.el-radio-input').addClass('is-radio-checked');
                }
                if(rsp.results.materials){
                    showReturnInItem(rsp.results.materials,rsp.results.status);
                }

            }
            if(rsp.results.type==7){
                if(rsp.results.push_type==2){
                    $('#picking_title').text('车间补料单');
                }else if(rsp.results.push_type==1){
                    $('#picking_title').text('SAP补料单');
                }else if(rsp.results.push_type==0){
                    $('#picking_title').text('线边仓补料单');
                }
                if(rsp.results.status==4||rsp.results.status==2){
                    $('.save').hide();
                }else {
                    $('.save').text('入库');
                    $('.save').show();
                }

                $('#basic_form_show').html(`<div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">工单</label>
                            <input type="text" id="wo_number" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">单号</label>
                            <input type="text" id="code" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                     
                    ${rsp.results.push_type == 2 ? '' :`
                            <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">采购仓储</label>
                                        <input type="text" id="send_depot" readonly class="el-input" placeholder="请输入采购仓储" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>`}
                            </div>
                            <div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">销售单号</label>
                                        <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">工位</label>
                                        <input type="text" id="workbench_code" readonly class="el-input"  value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">需求库存地点</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="storage_wo" readonly class="el-input" placeholder="请输入需求库存地点" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                               
                            </div>
                            <div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">销售行项目号</label>
                                        <input type="text" id="sales_order_project_code" readonly class="el-input"  value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">责任人</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="employee" readonly class="el-input" placeholder="请输入责任人" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                            </div>`);
                $('#status').val(rsp.results.status);
                $('#send_depot').val(rsp.results.send_depot);
                $('#workbench_code').val(rsp.results.workbench_code);
                $('#wo_number').val(rsp.results.work_order_code);
                $('#code').val(rsp.results.code);
                $('#storage_wo').val(rsp.results.line_depot_name);
                $('#storage_wo_send').val(rsp.results.send_depot_name);
                $('#employee').val(rsp.results.employee_name);
                if(rsp.results.push_type==1){
                    $('.push_type.yes').parent('.el-radio-input').removeClass('is-radio-checked');
                    $('.push_type.no').parent('.el-radio-input').addClass('is-radio-checked');
                }
                $('#sales_order_code').val(rsp.results.sales_order_code);
                $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
                if(rsp.results.materials){
                    showInItem(rsp.results.sales_order_code,rsp.results.sales_order_project_code,rsp.results.materials,rsp.results.status,rsp.results.push_type);
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            // layer.msg('获取工单详情失败，请刷新重试', 9);
        }
    }, this)
}

//进料
function showReturnInItem(data) {

        var ele = $('.storage_blockquote .item_table .t-body');
        $('#operation').hide();
        $('#salere').hide();
        $('#rbqty').hide();
        $('#runit').hide();
        ele.html("");
        data.forEach(function (item, index) {
            var piciHtml = createREturnPiciHtml(item.batches)
            var tr = `
                <tr data-id="${item.item_id}" class="show_item">                
                <td >${tansferNull(item.material_code)}</td>
                <td >${tansferNull(item.material_name)}</td>
                
                <td>
                     ${piciHtml} 
                </td>
                </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", data);

        })




}

function createREturnPiciHtml(data,status,unit){

    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){
            trs+= `
			<tr data-id="${item.batch_id}">
			<td>${tansferNull(item.order)}</td>
			<td>${tansferNull(item.batch)}</td>
			<td>
                <input readonly type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input actual_receive_qty"   value="${tansferNull(item.actual_send_qty)}">
            </td>
			<td>${tansferNull(item.actual_receive_qty)}</td>
			
			<td>${tansferNull(unit?unit:item.bom_unit)}</td>
			
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">序号</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">退料数量</th>
                        <th class="left nowrap tight">实退数量</th>
                        <th class="left nowrap tight">单位</th>
                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
}

function bindEvent() {
    $('body').on('click','.save',function (e) {
        e.stopPropagation();
        var msg= '';
        var status= $('#status').val();
        if(status==1 && pickingList.type == 2){
            msg = '是否确认出库？';
        }else if(status==3 && pickingList.type == 1){
            msg = '是否确认入库？';
        }else {
            msg = '是否确认保存？';
        }
        layer.confirm(msg, {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submitPickingList(status);
        });

    });
     $('body').on('click','.table-bordered .delete',function () {
         $(this).parents().parents().eq(0).remove();
         var id = $(this).attr('data-id');
         layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
         }}, function(index){
             layer.close(index);
             deleteItem(id);
         });
     });
}

function submitPickingList(status) {
    var data ={};
    var url = '';
   if(status==1){
       var pickItems=[];
       $('#show_item .show_item').each(function (k,v) {
           pickItems.push({
               item_id: $(v).attr('data-id'),
               demand_qty:$(v).find('.demand_qty').val(),
           })
       });

       data= {
           material_requisition_id:id,
           demands:pickItems,
           _token:TOKEN
       };
       url = URLS['work'].updateItem;
   }else {
       var flag=true;
       if(push_type==2){
           var pickItems=[];
           $('#work_order_table .table_tbody tr').each(function (k,v) {
               pickItems.push({
                   batch_id: $(v).attr('data-id'),
                   actual_receive_qty:$(v).find('.actual_receive_qty').val(),
               })
           })
           data= {
               material_requisition_id:id,
               status:status,
               type:type,
               batches:pickItems,
               _token:TOKEN
           };
           url = URLS['work'].workShopConfirmAndUpdate;
       }else {
           var pickItems=[];
           $('#work_order_table .table_tbody tr').each(function (k,v) {
               pickItems.push({
                   batch_id: $(v).attr('data-id'),
                   actual_receive_qty:$(v).find('.actual_receive_qty').val(),
               })
           });
           $("#show_item .show_item").each(function (k,v) {
               if($(v).find('#work_order_table .table_tbody .work_order_table_item').length==0){
                   flag=false;
                   return;
               }
           });
           data= {
               material_requisition_id:id,
               batches:pickItems,
               _token:TOKEN
           };
           url = URLS['work'].updateActualReceive;
       }

   }
    var msg ='';
    if(status==1 && pickingList.type == 2){
        msg = '出库成功';
    }else if(status==3 && pickingList.type == 1){
        msg = '入库成功';
    }else {
        msg = '保存成功';
    }

    if(flag){
        AjaxClient.post({
            url: url,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                if(rsp.results==200){
                    layer.confirm(msg, {icon: 1, title:'提示',offset: '250px',end:function(){
                    }}, function(index){
                        layer.close(index);
                        window.location.reload();
                    });
                }

            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail',rsp.message)
            }
        }, this)
    }else {
        layer.confirm('数据没到齐！', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
        });
    }

}

function deleteItem(id) {
    AjaxClient.post({
        url: URLS['work'].deleteItem,
        data:{
            item_id:id,
            _token:TOKEN
        },
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
                LayerConfig('success','删除成功！')


        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','删除失败！')
        }
    }, this)
}

//进料
function showInItem(code,line,data,status,push_type) {
    if(push_type==1){
        var ele = $('.storage_blockquote .item_table .t-body');
        ele.html("");
        $('#deport').hide();

        var readonly1='';
        if(status==2 || status==3 || status==4 ){
            readonly1='readonly="readonly"';
        }

        data.forEach(function (item, index) {

            var piciHtml = createPiciHtml(item.batches,status)
            var tr = `
                    <tr data-id="${item.item_id}" class="show_item">
                     <td >
                                    ${item.special_stock == 'E' ?`<div>
                                            <p>销售订单号：${code}</p>
                                            <p>行项目号：${line}</p>
                                        </div>`:''}
                                    </td>
                        <td >${tansferNull(item.material_code)}</td>
                    <td >${tansferNull(item.material_name)}</td>
                    <td >
                          <input ${readonly1}  type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(item.demand_qty)}">
                    </td>	
                    <td >${tansferNull(item.demand_unit)}</td>	
                    <td>
                         ${piciHtml} 
                    </td>
                    <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="${item.item_id}" style="font-size: 2em;"></i></td>
                    </tr>`;
                            ele.append(tr);
                            ele.find('tr:last-child').data("trData", data);

        })
    }else {
        var ele = $('.storage_blockquote .item_table .t-body');
        ele.html("");
        $('#deport').show();
        $('#operation').hide();
        var readonly1='';
        if(status==2 || status==3 || status==4){
            readonly1='readonly="readonly"';
        }

        data.forEach(function (item, index) {
            var piciHtml = createPiciHtml(item.batches,status,item.demand_unit,push_type)
            var tr = `
                <tr data-id="${item.item_id}" class="show_item">
                <td >
                ${item.special_stock == 'E' ?`<div>
                        <p>销售订单号：${code}</p>
                        <p>行项目号：${line}</p>
                    </div>`:''}
                </td>
                <td >${tansferNull(item.material_code)}</td>
                <td >${tansferNull(item.material_name)}</td>
                <td >
                      <input ${readonly1}  type="number" min="0" readonly style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(item.demand_qty)}">
                </td>	
                <td >${tansferNull(item.demand_unit)}</td>
                <td >${tansferNull(item.depot_code)}</td>	
                <td>
                     ${piciHtml} 
                </td>
                </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", data);

        })
    }



}

function createPiciHtml(data,status,unit,push_type){
    var readonly2='';
    if(status==4||(status==3 && push_type==2)){
        readonly2='readonly="readonly"';
    }
    if(push_type==0){
        readonly2='readonly="readonly"';
    }
    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){

            trs+= `
			<tr data-id="${item.batch_id}" class="work_order_table_item">
			<td>${tansferNull(item.order)}</td>
			<td>${tansferNull(item.batch)}</td>
			<td>${tansferNull(item.actual_send_qty)}</td>
			<td>
                <input ${readonly2} type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="el-input actual_receive_qty"   value="${tansferNull(status==3?item.actual_send_qty:item.actual_receive_qty)}">
            </td>
			<td>${tansferNull(item.bom_unit)}</td>
			
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">序号</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">实发数量</th>
                        <th class="left nowrap tight">实收数量</th>
                        <th class="left nowrap tight">单位</th>
                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
}
