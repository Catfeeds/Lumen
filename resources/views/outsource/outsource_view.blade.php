{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/outsource/outsource.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div_con_wrapper">
        <form id="viewBomCommon" class="formTemplate formViewBom normal">
            <div class="bom_blockquote">
                <h3>基本信息</h3>
                <div style="display: flex;">
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="position: relative;width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">采购凭证编号<span class="mustItem">*</span></label>
                                <input type="text" id="EBELN" readonly="readonly" disabled class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">采购凭证类型</label>
                                <input type="text" readonly id="BSART" class="el-input" placeholder="采购凭证类型" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 20px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">采购组 </label>
                                <input type="text" readonly="readonly" id="EKGRP" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 20px;"></p>
                        </div>

                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">公司代码<span class="mustItem">*</span></label>
                                <input type="text" id="BUKRS" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">供应商或债权人的帐号</label>
                                <input type="text" id="LIFNR" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>

                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">采购凭证类别<span class="mustItem">*</span></label>
                                <input type="text" id="BSTYP" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 100%;">
                                <label class="el-form-item-label" style="width: 150px;">采购组织</label>
                                <input type="text" id="EKORG" readonly="readonly" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 20px;"></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bom_blockquote">
                <h3>项</h3>
                <div class="basic_info">
                    <div class="table-container">
                        <table class="outsource_table item_table">
                            <thead>
                            <tr>
                                <th class="thead center">操作 </th>
                                <th class="thead center">是否已报工 </th>
                                <th class="thead center">报工总数量 </th>
                                <th class="thead center">采购凭证的项目编号 </th>
                                <th class="thead center">工厂</th>
                                <th class="thead center">数量</th>
                                <th class="thead center">计量单位</th>
                                <th class="thead center">采购申请编号</th>
                                <th class="thead center">采购申请的项目编号</th>
                                <th class="thead center">生产订单号</th>
                                <th class="thead center">项</th>
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
    <script src="/statics/custom/js/outsource/outsource_order_view.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>


@endsection