{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/work_hour.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button id="work_hours_sync" class="button"><i class="fa fa-circle-o"></i>同步</button>
    </div>

    <div class="table_page">
        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
            <table id="proceSetting_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight">工序</th>
                    <th class="left nowrap tight">能力</th>
                    <th class="left nowrap tight">数量区间</th>
                    <th class="left nowrap tight">数量倍数</th>
                    <th class="left nowrap tight">准备工时  [s]</th>
                    <th class="left nowrap tight">倍数值</th>
                    <th class="nowrap tight" style="text-align: center">下道工序信息</th>
                    <th class="nowrap tight">是否为基准</th>
                    <th class="right nowrap tight">操作</th>
                </tr>
                </thead>
                <tbody class="table_tbody">

                </tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation"></div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/procedure/procedure-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/procedure/work_hour_setting.js?v={{$release}}"></script>
@endsection