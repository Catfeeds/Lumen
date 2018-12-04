{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/product_order.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="order_edit" value="/ProductOrder/productOrderEdit">
<div class="bom_wrap">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-item="orderBasic_from" class="el-tap active">常规</span>
        </div>
        <div class="el-form-item btnShow saveBtn">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary submit save">保存</button>
            </div>
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel orderBasic_from active">
            <form id="orderBasic_from" class="formTemplate basicForm">
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative">
                            <label class="el-form-item-label">产品<span class="mustItem">*</span></label>
                            <input type="text" id="material_id" readonly class="el-input" placeholder="请选择物料" value="">
                            <span class="fa fa-table pos-icon choose-product"></span>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item route-line">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">工艺路线<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="routing_id" value="">
                                </div>
                                <div class="el-select-dropdown list">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">数量<span class="mustItem">*</span></label>
                            <input type="number" step="1" id="qty" min="0" class="el-input" placeholder="请输入数量" value="" onkeyup="value=this.value.replace(/\-/g,'')">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">废料[%]<span class="mustItem">*</span></label>
                            <input type="number" step="0.01" id="scrap" min="0" class="el-input" placeholder="请输入废料" value="" onkeyup="value=this.value.replace(/\-/g,'')">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">开始日期<span class="mustItem">*</span></label>
                            <input type="text" id="start_date" class="el-input" placeholder="请选择开始日期" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">结束日期<span class="mustItem">*</span></label>
                            <input type="text" id="end_date" class="el-input" placeholder="请选择结束日期" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item route-line">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">销售订单号<span class="mustItem">*</span></label>
                            <input type="text" id="sales_order_code" placeholder="请填写销售订单号" class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item priority-list">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">优先级<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="priority_id" value="">
                                </div>
                                <div class="el-select-dropdown list">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        <li data-id="1" class="el-select-dropdown-item kong">低</li>
                                        <li data-id="2" class="el-select-dropdown-item kong">中</li>
                                        <li data-id="3" class="el-select-dropdown-item kong">高</li>
                                        <li data-id="4" class="el-select-dropdown-item kong">紧急</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">描述</label>
                            <textarea type="textarea" maxlength="200"  id="remark" rows="5" class="el-textarea" placeholder="请输入描述，最多能输入200个字符"></textarea>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/product_order_add.js?v={{$release}}"></script>
@endsection