<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <title>{{$title or "智能制造系统管理后台"}}</title>

    <meta name="description" content="overview &amp; stats" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    {{--icon--}}
    <link rel="shortcut icon" href="/statics/custom/img/favicon.ico" type="image/x-icon" />
    <!-- bootstrap & fontawesome -->
    <link rel="stylesheet" href="/statics/common/ace/assets/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/statics/common/ace/assets/font-awesome/4.5.0/css/font-awesome.min.css" />

    <!-- page specific plugin styles -->

    <!-- text fonts -->
    <link rel="stylesheet" href="/statics/common/ace/assets/css/fonts.googleapis.com.css" />

    <!-- ace styles -->
    <link rel="stylesheet" href="/statics/common/ace/assets/css/ace.min.css" class="ace-main-stylesheet" id="main-ace-style" />

    <!--[if lte IE 9]>
    <link rel="stylesheet" href="/statics/common/ace/assets/css/ace-part2.min.css" class="ace-main-stylesheet" />
    <![endif]-->
    <link rel="stylesheet" href="/statics/common/ace/assets/css/ace-skins.min.css" />
    <link rel="stylesheet" href="/statics/common/ace/assets/css/ace-rtl.min.css" />

    <!--[if lte IE 9]>
    <link rel="stylesheet" href="/statics/common/ace/assets/css/ace-ie.min.css" />
    <![endif]-->

    <!-- inline styles related to this page -->

    <!-- ace settings handler -->
    <script src="/statics/common/ace/assets/js/ace-extra.min.js"></script>

    <!-- HTML5shiv and Respond.js for IE8 to support HTML5 elements and media queries -->

    <!--[if lte IE 8]>
    <script src="/statics/common/ace/assets/js/html5shiv.min.js"></script>
    <script src="/statics/common/ace/assets/js/respond.min.js"></script>
    <![endif]-->

    <!-- 自定义的公共css -->
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/scrollbar.css">
    <!-- 仅仅与该页面有关的内部css放置位置-->
    @yield("inline-header")
</head>

<body class="no-skin">

{{--头部导航条--}}
@include('layouts.navbar')

<!-- main是左右结构，左边是sidebar，右边是main-content -->

<div class="main-container ace-save-state" id="main-container">
    <script type="text/javascript">
        try{ace.settings.loadState('main-container')}catch(e){}
    </script>

     {{--左边菜单栏--}}
     @include('layouts.sidebar')
     {{--main-content部分--}}
    <div class="main-content">
        <div class="main-content-inner">
            {{--面包屑导航,可以拿掉了--}}
            @include('layouts.breadcrumbs')
            {{--page-header--}}
            {{--<div class="page-header">--}}
                {{--<h1>--}}
                    {{--测试--}}
                    {{--<small>--}}
                        {{--<i class="ace-icon fa fa-angle-double-right"></i>--}}
                        {{--test--}}
                    {{--</small>--}}
                {{--</h1>--}}
            {{--</div><!-- /.page-header -->--}}


            {{--page-content--}}
            <div class="page-content">
                {{--ace-settings-container--}}
                {{--@include('layouts.ace-settings-container')--}}
                {{-- 将page-header和row整体作为page-main拿出来吧 --}}
                @yield("page-main")
            </div>
        </div>
    </div>
    {{--底部--}}
    @include('layouts.footer')
    {{--返回顶部按钮--}}
    @include('layouts.scroll-up')
</div><!-- /.main-container -->

<!-- basic scripts -->

<!--[if !IE]> -->
<script src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
<!-- <![endif]-->

<!--[if IE]>
<script src="/statics/common/ace/assets/js/jquery-1.11.3.min.js"></script>
<![endif]-->
<script type="text/javascript">
    if('ontouchstart' in document.documentElement) document.write("<script src='/statics/common/ace/assets/js/jquery.mobile.custom.min.js'>"+"<"+"/script>");
</script>
<script src="/statics/common/ace/assets/js/bootstrap.min.js"></script>

<!-- page specific plugin scripts -->

<!--[if lte IE 8]>
<script src="/statics/common/ace/assets/js/excanvas.min.js"></script>
<![endif]-->
<script src="/statics/common/ace/assets/js/jquery-ui.custom.min.js"></script>
<script src="/statics/common/ace/assets/js/jquery.ui.touch-punch.min.js"></script>
<script src="/statics/common/ace/assets/js/jquery.easypiechart.min.js"></script>
<script src="/statics/common/ace/assets/js/jquery.sparkline.index.min.js"></script>
<script src="/statics/common/ace/assets/js/jquery.flot.min.js"></script>
<script src="/statics/common/ace/assets/js/jquery.flot.pie.min.js"></script>
<script src="/statics/common/ace/assets/js/jquery.flot.resize.min.js"></script>

<!-- ace scripts -->
<script src="/statics/common/ace/assets/js/ace-elements.min.js"></script>
<script src="/statics/common/ace/assets/js/ace.min.js"></script>
<!-- layer  -->
<script src="/statics/common/layer/layer.js"></script>
<!-- 自定义的公共js -->
<script type="text/javascript" src="/statics/custom/js/functions.js?v={{$release}}"></script>{{-- 自定义的公共函数 --}}
<script src="/statics/custom/js/custom-public.js?v={{$release}}"></script>{{-- 自定义公共js文件 --}}
<script src="/statics/custom/js/ajax-client.js?v={{$release}}"></script> {{-- 包围函数封装的 AjaxClient --}}
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>  {{-- 公共使用的验证类封装,比如手机号/邮箱等数据格式的检测 --}}
<!-- 每个页面独有的js文件放置在这里 -->
   @yield("inline-bottom")
</body>
</html>
