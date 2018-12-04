{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
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
                                    <label class="el-form-item-label">订单号</label>
                                    <input type="text" id="order_id" class="el-input" placeholder="订单号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料</label>
                                    <input type="text" id="material_id" class="el-input" placeholder="物料" value="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
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
                        <th>
                            <div class="el-sort">
                                订单号
                                <span class="caret-wrapper">
                                    <i data-key="order_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="order_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                物料信息
                                <span class="caret-wrapper">
                                    <i data-key="material_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="material_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>

                        <th>
                            <div class="el-sort">
                                问题描述
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                紧急处置措施
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                创建时间
                            </div>
                        </th>
                        <th class="right"></th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/abnormal/qc-abnormal-apply.js?v={{$release}}"></script>
@endsection