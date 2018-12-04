{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/factory/factory.css">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button id="rankPlanType_add" class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
    </div>

    <div class="table_page">
        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
            <table id="table_rankType_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight">类型名称</th>
                    <th class="left nowrap tight">班次编码</th>
                    <th class="left nowrap tight">工厂</th>
                    <th class="right nowrap tight"></th>
                </tr>
                </thead>
                <tbody class="table_tbody"></tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/factory/factory-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/factory/rankPlanType.js?v={{$release}}"></script>
@endsection