{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="storage_wrap">
        <div class="tap-btn-wrap">
            <div class="el-form-item btnShow saveBtn">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button el-button--primary submit save" style="margin-right: 20px; margin-bottom: 10px;">保存</button>
                </div>
            </div>
        </div>
    </div>
    <form id="addSBasic_form" class="formTemplate formStorage normal">
        <h3 id="show_title"></h3>
        <div class="bom_blockquote">
            <h4>基本信息</h4>
            <div style="display: flex;">
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative;width: 100%;">
                            <label class="el-form-item-label" style="width: 150px;">采购凭证编号</label>
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
                            <label class="el-form-item-label" style="width: 150px;">公司代码</label>
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
                            <label class="el-form-item-label" style="width: 150px;">采购凭证类别</label>
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
        <div class="storage_blockquote">
            <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细</h4>
            <div class="basic_info">
                <div class="table-container">
                    <table class="storage_table item_table table-bordered item_outsource_table">
                        <thead>
                        <tr>
                            <th  class="thead">采购凭证的项目编号</th>
                            <th  class="thead">生产订单号</th>
                            <th  class="thead">物料编号</th>
                            <th  class="thead">物料名称</th>
                            <th  class="thead">工厂</th>
                            <th  class="thead">采购仓储</th>
                            <th  class="thead">采购申请编号</th>
                            <th  class="thead">采购申请的项目编号</th>
                            <th  class="thead">额定量</th>
                            <th  class="thead">实发数量</th>
                            <th  class="thead">需求量</th>
                            <th  class="thead">计量单位</th>
                            <th class="thead"></th>
                        </tr>
                        </thead>
                        <tbody class="t-body">
                        <tr>
                            <td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </form>
@endsection
@section("inline-bottom")
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/validate.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/create_outsource.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
@endsection