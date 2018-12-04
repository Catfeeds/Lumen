{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="storage_wrap">
        <div class="tap-btn-wrap">
            <div class="el-form-item btnShow saveBtn">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button el-button--primary submit save" style="margin-right: 20px; margin-bottom: 10px;display: none;">保存</button>
                </div>
            </div>
        </div>
        <form id="addSBasic_form" class="formTemplate formStorage normal">
            <h3 id="picking_title"></h3>
            <div class="storage_blockquote">
                <h4>工单信息</h4>
                <div id="basic_info_show" class="basic_info" style="display: flex;">
                </div>
            </div>
            <div class="storage_blockquote">
                <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细 <button type="button" class="el-button el-button--primary buquan" style="display: none;">补全仓储点</button> </h4>
                <ul class="nav nav-tabs">
                    <li role="presentation" class="active pull-right choose-push-type" data-push_type="0"><a>线边仓齐料检</a></li>
                    <li role="presentation" class="pull-right choose-push-type" data-push_type="1"><a>SAP领料</a></li>
                    <li role="presentation" class="pull-right choose-push-type" data-push_type="2"><a>车间领料</a></li>
                </ul>
                <div class="basic_info">
                    <div class="table-container">
                        <table class="storage_table item_table table-bordered">
                            <thead>
                            <tr>
                                <th class="thead"></th>
                                <th class="thead" id="salere">销售订单</th>
                                <th class="thead">采购仓储</th>
                                <th class="thead" id="scck">生产仓储</th>
                                <th class="thead">编码</th>
                                <th class="thead">名称</th>
                                <th class="thead" style="display: none" id="ruturnPici">批次</th>
                                <th class="thead" id="rbqty">额定数量</th>
                                <th class="thead" id="pickingQty" style="display: none;">已领数量</th>
                                <th class="thead" id="rqty">当前车间库存数量</th>
                                <th class="thead" style="display: none;" id="orqty">其他车间库存数量</th>
                                <th class="thead" id="show_qty">数量</th>
                                <th class="thead" id="runit">单位</th>
                                <th class="thead" id="rattr">属性</th>
                                <th class="thead" id="operation"></th>
                            </tr>
                            </thead>

                            <tbody class="t-body">
                            <tr>
                                <td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </form>

    </div>

@endsection
@section("inline-bottom")
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/validate.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/create_picking_list.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
@endsection