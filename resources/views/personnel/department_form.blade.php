{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    部门添加/编辑
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
@endsection