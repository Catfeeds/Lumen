{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/factory/factory.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/personnel/personnel.css?v={{$release}}">
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
        <div class="basicChildInfo">

        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/personnel/personnel-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/personnel/department-change.js?v={{$release}}"></script>
@endsection