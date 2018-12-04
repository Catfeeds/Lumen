{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        特采审核
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")

@endsection