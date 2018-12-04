{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/implement/implement.css?v={{$release}}">
    {{--<script src="http://oss.sheetjs.com/js-xlsx/xlsx.full.min.js"></script>--}}

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">

        <div class="table_page">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>销售订单</th>
                        <th>销售订单行项目号</th>
                        <th>工序短文本</th>
                        <th>交货日期</th>
                        <th>采购数量</th>
                        <th>本日报工数量</th>
                        <th>累计报工数量</th>
                        <th>半成品编码</th>
                        <th>半成品描述</th>
                        <th>采购订单</th>
                        <th>生产订单</th>
                        <th>工序</th>
                        <th>统计员</th>
                        <th>供应商</th>
                        <th>供应商名称</th>
                        <th>状态</th>
                        <th>实际开工时间</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/import/import-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/import/import_item.js?v={{$release}}"></script>
@endsection