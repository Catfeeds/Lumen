{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/center/center.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="table_page">
        <p class="noface"><img src="/statics/custom/img/nodata.png" alt="">暂无数据</p>
        <div class="wrap_table_div" style="display: none;">
            <table id="table_attr_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th>账户名</th>
                        <th>登录IP</th>
                        <th>登录时间</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="4">暂无数据</td></tr>
                </tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>   
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/account/account-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<!-- <script src="/statics/custom/js/account/log.js?v={{$release}}"></script> -->
@endsection

