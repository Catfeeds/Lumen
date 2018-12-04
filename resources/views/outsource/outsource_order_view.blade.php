{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/outsource/outsource.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">


@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div_con_wrapper">
        <div class="actions el-form-item" style="text-align: right;">
            <button class="button el-button--primary" id="attrview" >查看工艺单</button>
        </div>
        <form id="viewBomCommon" class="formTemplate formViewBom normal">
            <div class="bom_blockquote">
                <h3>基本信息</h3>

                <div style="display: flex;">
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="position: relative;width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">委外工单号</label>
                                <input type="text" id="number" readonly="readonly" disabled class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">采购申请编号</label>
                                <input type="text" readonly id="BANFN" class="el-input" placeholder="采购申请编号" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 20px;"></p>
                        </div>

                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">采购申请的项目编号</label>
                                <input type="text" id="BNFPO" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">订单号</label>
                                <input type="text" id="production_number" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>

                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">工序名称</label>
                                <input type="text" id="operation_name" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">是否最后步骤</label>
                                <input type="text" id="is_end_operation" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 20px;"></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bom_blockquote">
                <h3>消耗品</h3>
                <div class="basic_info">
                    <div class="table-container">
                        <table class="ingroups_table item_table">
                            <thead>
                            <tr>
                                <th class="thead center" width="25%">物料名称 </th>
                                <th class="thead center" width="25%">物料编码</th>
                                <th class="thead center" width="25%">数量</th>
                                <th class="thead center" width="25%">单位</th>
                            </tr>
                            </thead>
                            <tbody class="t-body">
                                <tr>
                                    <td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="bom_blockquote">
                <h3>产成品</h3>
                <div class="basic_info">
                    <div class="table-container">
                        <table class="outgroups_table item_table">
                            <thead>
                            <tr>
                                <th class="thead center" width="25%">物料名称 </th>
                                <th class="thead center" width="25%">物料编码</th>
                                <th class="thead center" width="25%">数量</th>
                                <th class="thead center" width="25%">单位</th>
                            </tr>
                            </thead>
                            <tbody class="t-body">
                            <tr>
                                <td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="bom_blockquote">
                <h3>订单组件</h3>
                <div class="basic_info">
                    <div class="table-container">
                        <table class="prgroups_table item_table">
                            <thead>
                            <tr>
                                <th class="thead center" width="25%">物料名称 </th>
                                <th class="thead center" width="25%">物料编码</th>
                                <th class="thead center" width="25%">数量</th>
                                <th class="thead center" width="25%">单位</th>
                            </tr>
                            </thead>
                            <tbody class="t-body">
                            <tr>
                                <td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </form>

    </div>

    @endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/outsource/outsource_work_order_view.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection