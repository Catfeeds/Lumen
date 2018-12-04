{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/factory/factory.css">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="company_wrap">
    <div class="company_tree_container">
        <div class="company_tree">

        </div>
    </div>
    <div class="company_content">
        <div class="basicInfo">
           <h3 class="none">基本信息</h3>
           <div class="basic_form"></div>
        </div>
        <div class="table_page">
            <div class="basicChildInfo">

            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/factory/factory-url.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/factory/factoryDefine.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
@endsection