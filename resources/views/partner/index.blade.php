{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
        </div>
        <div class="searchItem" id="searchForm">
            <input type="text" id="add_check_checkbox" value="" style="display: none;">
            <form class="searchOutsource searchModal formModal" id="outsource_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">公司名称</label>
                                    <input type="text" id="search_name" class="el-input" placeholder="请输入公司名称" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">编码</label>
                                    <input type="text" id="search_code" class="el-input" placeholder="请输入编码" value="">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div">
                <table id="outsource_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>公司名称</th>
                        <th>编号</th>
                        <th>CEO</th>
                        <th>网址</th>
                        <th>邮箱</th>
                        <th>手机</th>
                        <th>传真</th>
                        <th>地址</th>
                        <th>信息</th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody">
                    </tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/partner/partner-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/partner/index.js?v={{$release}}"></script>

@endsection