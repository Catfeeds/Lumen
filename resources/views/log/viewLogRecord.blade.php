{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">关键字</label>
                                    <input type="text" id="keyword" class="el-input" placeholder="关键字" value="">
                                </div>
                            </div>

                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item" style="width: 100%;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 109px;">时间</label>
                                        <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                        <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                    </div>
                                </div>
                            </li>

                        </ul>
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
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>源</th>
                        <th>目标</th>
                        <th>状态</th>
                        <th>结果</th>
                        <th>数据</th>
                        <th>创建时间</th>

                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/log/view_log.js?v={{$release}}"></script>
    <script src="/statics/custom/js/log/log-url.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>

@endsection