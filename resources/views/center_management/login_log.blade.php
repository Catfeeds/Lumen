{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

        <div class="table_page" style="margin-top:50px;">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>登录IP</th>
                            <th>登录时间</th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody">
                       <tr>
                           <td style="text-align: center;" colspan="3">没有找到匹配的记录</td>
                       </tr>
                    </tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>

@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/center/center-url.js?v={{$release}}"></script> {{--个人中心url地址配置--}}
    <script src="/statics/common/pagenation/jquery.pagination-1.5.1.js"></script> {{--分页插件--}}
    <script src="/statics/custom/js/center/log.js?v={{$release}}"></script>{{--当前页面js--}}
@endsection



