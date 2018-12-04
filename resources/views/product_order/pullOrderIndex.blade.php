{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/pull-order-index-css.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_content_wrapper">

        <div class="table_page div_con_wrapper">
            <div class="actions">
                <span class="title_order">订单列表</span>
                <button id="pull_all" class="button"><i class="fa fa-plus"></i>批量拉取</button>
            </div>
            <div class="wrap_table_div" id="pull_all_order_value">
                <table id="product_order_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th class="left norwap">
                            <span class="el-checkbox_input" id="checkAll">
                                <span class="el-checkbox-outset"></span>
                            </span>
                        </th>
                        <th>销售订单号</th>
                        <th>订单号</th>
                        <th>产品</th>
                        <th>产品编号</th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody">

                    </tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/pull-order-index.js?v={{$release}}"></script>

@endsection