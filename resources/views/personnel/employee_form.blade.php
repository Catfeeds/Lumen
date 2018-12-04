{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/personnel/personnel.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<!--<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">-->
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="employee_wrap">
    <form class="employeeForm formModal formTemplate" id="employee_form">
        <div class="employeeContainer clearfix">
            <div class="employeeLeft"></div>
            <div class="employeeRight"></div>
        </div>
       <div class="employeeBtn">
       </div>
    </form>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/custom-config.js?v={{$release}}"></script>
<script src="/statics/custom/js/personnel/personnel-url.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<!--<script src="/statics/common/fileinput/theme/theme.js"></script>-->
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/custom/js/personnel/employee_add.js?v={{$release}}"></script>
@endsection