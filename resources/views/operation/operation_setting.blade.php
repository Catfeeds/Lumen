{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">

    <div class="actions">
        <button id="proce_setting_add" class="button"><i class="fa fa-plus"></i>添加</button>
    </div>
    <div class="table_page">
        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
            <table id="proceSetting_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight">上道工序</th>
                    <th class="left nowrap tight">下道工序</th>
                    <th class="left nowrap tight">间隔时间</th>
                    <th class="left nowrap tight">方式</th>
                    <th class="left nowrap tight">描述</th>
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
    <script src="/statics/custom/js/procedure/procedure_setting.js?v={{$release}}"></script>
@endsection