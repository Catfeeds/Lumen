{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/qc.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}" >
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    {{--<input type="hidden" id="material_view" value="/MaterialManagement/materialView">--}}
    {{--<input type="hidden" id="material_edit" value="/MaterialManagement/materialEdit">--}}


    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action button_check"><i class="fa fa-search-plus"></i>批量检验</button>
            <button class="button button_action" id="show_all_time">显示</button>
            <button><a id="exportExcel" class="button button_action button_export" download="导出" >导出</a></button>

        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from" autocomplete="off" >
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">单  号</label>
                                    <input type="text" id="order_id" class="el-input" placeholder="单号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">产品名称</label>
                                    <input type="text" id="material_id" class="el-input" placeholder="产品名称" value="">
                                </div>
                            </div>

                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">工厂</label>
                                        <input type="text" id="factory_name" class="el-input" placeholder="工厂" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">关联模板</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="type_id" class="el-input" autocomplete="off" placeholder="关联模板" value="">
                                        </div>
                                    </div>
                                </div>

                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">采购仓储</label>
                                        <input type="text" id="LGFSB" class="el-input" placeholder="采购仓储" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">生产仓储</label>
                                        <input type="text" id="LGPRO" class="el-input" placeholder="生产仓储" value="">
                                    </div>
                                </div>

                            </li>
                            <li>
                                <div class="el-form-item" style="width: 100%;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">时间</label>
                                        <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                        <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">工序</label>
                                        <input type="text" id="operation" class="el-input" placeholder="工序" value="">
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
                        <th class="left norwap">

                        </th>
                        <th>
                            <div class="el-sort">
                                单号
                                <span class="caret-wrapper">
                                    <i data-key="order_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="order_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort" >
                                销售订单号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort" >
                                销售行项目号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort" >
                                生产订单号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort" >
                                工单号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort" >
                                工序
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                物料编码
                                <span class="caret-wrapper">
                                    <i data-key="material_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="material_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>

                        <th style="max-width: 100px;">
                            <div class="el-sort" >
                                物料属性
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                工厂
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                订单数量
                            </div>
                        </th>

                        <th>
                            <div class="el-sort">
                                抽检数
                            </div>
                        </th>

                        <th class="showtime" style="display: none;">
                            <div class="el-sort">
                                送检时间

                            </div>
                        </th>

                        <th class="showtime" style="display: none;">
                            <div class="el-sort">
                                检验时间

                            </div>
                        </th>

                        <th>
                            <div class="el-sort">
                                是否合格

                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                检验员工

                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                检验员工卡号

                            </div>
                        </th>

                        <th class="right"></th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody" style="table-layout:fixed"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/qc_inspection/inspection-oqc.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-client-sap.js?v={{$release}}"></script>
    <script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/fileinput/fileinput.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>

@endsection