{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/qc.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}" >
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/device/upkee-require.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    {{--<input type="hidden" id="material_view" value="/MaterialManagement/materialView">--}}
    {{--<input type="hidden" id="material_edit" value="/MaterialManagement/materialEdit">--}}


    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action button_check"><i class="fa fa-search-plus"></i>批量检验</button>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">索赔单单号</label>
                                    <input type="text" id="order_id" class="el-input" placeholder="索赔单单号" value="">
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
                                索赔单单号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                索赔单状态
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                币种
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
                    <tbody class="table_tbody" style="table-layout:fixed"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/qc_inspection/claim.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
@endsection