
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/routing/routing.css?v={{$release}}">
<style>
   .test{
      width:100px;
      height: 100px;
      border-radius: 50%;
      background-color: #ff563387;
      border: solid 2px #0D25F6;
      text-align: center;
      padding-top: 45px;
      font-size: 14px;
      color: #333;
      font-weight: bold;
   }
</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
   <!--<div class="test">4544</div>-->
   <div class="routing_graph" id="routing_graph"></div>

</div>
<!--<div role="switch" class="el-switch">-->
<!--<input type="checkbox" name="" class="el-switch__input">-->
<!--&lt;!&ndash;&ndash;&gt;-->
<!--<span class="el-switch__core" style="">-->
<!--<span class="el-switch__button" style=""></span>-->
<!--</span>-->
<!--<span class="el-switch__label el-switch__label&#45;&#45;right is-active">-->
<!--<span>顺序</span>-->
<!--</span>-->
<!--&lt;!&ndash;&ndash;&gt;-->
<!--</div>-->
<!--&lt;!&ndash;<span class="sequence">顺序</span>&ndash;&gt;-->
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/schedule/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/schedule/routing_show.js?v={{$release}}"></script>
@endsection

