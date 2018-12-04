
{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}" >
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/pull-order-index-css.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_content_wrapper">
        <div class="basic_info bom_container active">
            <div class="bom_tree_conwrap" style="min-width: 300px;">
                <div class="bom_tree_container">
                    <div class="bom-tree">

                    </div>
                </div>
            </div>
            <div class="bom_item_container">
                <div class="querywrap querywrapleft" style="flex: 1;margin-right: 0;">
                    <h4>基本信息</h4>
                    <div class="basicwrap">
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料编码</label>
                                    <input type="text" id="item_no" readonly="readonly" class="el-input" placeholder="" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">名称</label>
                                    <input type="text" id="name" readonly="readonly" class="el-input" placeholder="" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>

                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">编码类别</label>
                                    <input type="text" readonly="readonly" id="item_class" class="el-input" placeholder="" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">采购提前期</label>
                                    <input type="number"  readonly="readonly" id="procurement_lead_time" class="el-input" placeholder="" value=""><span>[天]</span>
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">最小采购周期</label>
                                    <input type="number"  readonly="readonly" id="min_procurement_cycle" class="el-input" placeholder="" value=""><span>[天]</span>
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">流水描述</label>
                                    <textarea type="textarea" maxlength="500" readonly="readonly" id="description" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
                                </div>
                                <p class="errorMessage"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    {{--<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>--}}
    <script src="/statics/custom/js/product_order/pull-order-bom.js?v={{$release}}"></script>

@endsection