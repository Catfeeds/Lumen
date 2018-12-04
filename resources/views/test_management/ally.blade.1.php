
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="route_container clearfix">
        <div class="route_item">
            <div class="title"><h5>(1)多针绗缝</h5></div>
            <div class="select_route">
                <table class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>物料</th>
                            <th>数量</th>
                            <th>类型</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>棉布 (ML05-145J01-0012)</td>
                            <td><input type="text" class="el-input el-input-num" value="1">[m]</td>
                            <td><span class="income">进料</span></td>
                            <td><i class="fa fa-times-circle icon-delete"></i></td>
                        </tr>
                        <tr>
                            <td>衬衫前片 (CJ-Q-SXW-0001)</td>
                            <td><input type="text" class="el-input el-input-num" value="1">[p]</td>
                            <td><span class="outcome">出料</span></td>
                            <td><i class="fa fa-times-circle icon-delete"></i></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="bottom">
                <span class="ma_item_add">添加出料</span>
            </div>
        </div>
        <div class="route_item">
            <div class="title"><h5>(2)裁剪</h5></div>
            <div class="select_route">
                <table class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>物料</th>
                        <th>数量</th>
                        <th>类型</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>棉布 (ML05-145J01-0012)</td>
                        <td><input type="text" class="el-input el-input-num" value="1">[m]</td>
                        <td><span class="income">进料</span></td>
                        <td><i class="fa fa-times-circle icon-delete"></i></td>
                    </tr>
                    <tr>
                        <td>衬衫前片 (CJ-Q-SXW-0001)</td>
                        <td><input type="text" class="el-input el-input-num" value="1">[p]</td>
                        <td><span class="outcome">出料</span></td>
                        <td><i class="fa fa-times-circle icon-delete"></i></td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="bottom">
                <span class="ma_item_add">添加出料</span>
            </div>
        </div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>
@endsection

