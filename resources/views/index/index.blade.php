{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/index_page/index_page.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="index_wrap">
        <!--<div class="index_history">-->
            <!--<img src="/statics/custom/img/index_history.png" alt="history">-->
        <!--</div>-->
        <div class="index_flow">
            <img src="/statics/custom/img/index_flow3.png" alt="flow">
        </div>
    </div>
@endsection

@section("inline-bottom")
<script>
//    $(function () {
//        if($(window).width()>1400){
//            $('.index_flow img').css({width:'1000px'})
//          $('.index_flow img').attr('src','/statics/custom/img/index_flow3.png');
//        }else{
//            $('.index_flow img').css({width:'600px'})
//        }
//    });
//    setTimeout(function () {
//      if($('#sidebar-toggle-icon').hasClass('fa-angle-double-left')){
//        $('#sidebar-toggle-icon').click();
//      }
//    },40);
</script>
@endsection
