{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/orgChart/css/jquery.orgchart.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<!--<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/product_order.css?v={{$release}}">-->
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="bom_wrap">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-item="orderBasic_from" class="el-tap active">常规</span>
            <span data-item="orderInfo_from" class="el-tap">BOM信息</span>
            <span data-item="orderPic_from" class="el-tap">BOM结构图</span>
            <span data-item="orderFile_from" class="el-tap">BOM附件</span>
        </div>
        <div class="el-form-item btnShow saveBtn edit">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary submit save confirm-ok">保存</button>
            </div>
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel orderBasic_from active">
            <form id="orderBasic_from" class="formTemplate edit basicForm">
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative">
                            <label class="el-form-item-label">产品<span class="mustItem">*</span></label>
                            <input type="text" id="basic_material_id" readonly class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item route-line">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">销售订单号<span class="mustItem">*</span></label>
                            <input type="text" id="sales_order_code" class="el-input" readonly value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item route-line">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">工艺路线<span class="mustItem">*</span></label>
                            <input type="text" readonly="readonly" id="routing_name" class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 20px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">数量<span class="mustItem">*</span></label>
                            <input type="number" step="1" id="basic_qty" readonly class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item route-line">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">单位名称<span class="mustItem">*</span></label>
                            <input type="text" id="unit_name" class="el-input" readonly value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">废料[%]<span class="mustItem">*</span></label>
                            <input type="number" step="0.01" id="basic_scrap" readonly class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">开始日期<span class="mustItem">*</span></label>
                            <input type="text" id="basic_start_date" class="el-input" readonly value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">结束日期<span class="mustItem">*</span></label>
                            <input type="text" id="basic_end_date" class="el-input" readonly value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item priority-list">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">优先级<span class="mustItem">*</span></label>
                            <input type="text" id="priority" readonly="readonly" class="el-input" value="">
                            <input type="hidden" class="val_id" id="priority_id" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">描述</label>
                            <textarea type="textarea" maxlength="200" readonly id="remark" rows="5" class="el-textarea" placeholder="请输入描述，最多能输入200个字符"></textarea>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel orderInfo_from">
            <form id="orderInfo_from" class="formTemplate formBom normal">
                <div class="bom_blockquote">
                    <h4>基本信息</h4>
                    <div class="basic_info">
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单编码<span class="mustItem">*</span></label>
                                    <input type="text" id="code"  class="el-input" placeholder="请输入物料清单编码" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单名称<span class="mustItem">*</span></label>
                                    <input type="text" id="name" class="el-input" placeholder="请输入物料清单名称" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" id="operation-data">工序</label>
                                    <div class="el-select-dropdown-wrap operation-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="basic_operation_id" value="">
                                        </div>
                                        <div class="el-select-dropdown list">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong operation-item" data-name="--请选择--">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">基础数量</label>
                                    <input type="text" id="qty" class="el-input" value="1">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div" style="position: relative;">
                                    <label class="el-form-item-label show-material top-material">物料编码<span class="mustItem">*</span></label>
                                    <input type="text" id="material_id" disabled class="el-input" placeholder="请选择物料编码" value="">
                                    <span class="fa fa-table pos-icon bom-add-item choose-material"></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item bom_group">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单分组</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="bom_group_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item ability_wrap">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">能力</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="ability" value="">
                                        </div>
                                        <div class="el-select-dropdown ability">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <!--<input type="text" readonly="readonly" id="ability" class="el-input" value="">-->
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item version" style="display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">版本</label>
                                    <input type="text" readonly="readonly" id="version" class="el-input" disabled value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">报废率（%）</label>
                                    <input type="number" step="0.01" id="loss_rate" class="el-input loss_rate" placeholder="请输入报废率" value="0.00">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">描述</label>
                                    <textarea type="textarea" maxlength="500" id="description" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bom_blockquote">
                    <h4>项 <button type="button" id="edit-add-btn" class="bom-button bom-add-item bom-add-new-item is-disabled">添加项</button></h4>
                    <div class="basic_info">
                        <div class="table-container">
                            <table class="bom_table item_table">
                                <thead>
                                <tr>
                                    <th class="thead">物料编码</th>
                                    <th class="thead">名称</th>
                                    <th class="thead">损耗率（%）</th>
                                    <th class="thead">组装</th>
                                    <th class="thead">使用数量</th>
                                    <th class="thead">简要描述</th>
                                    <th class="thead">操作</th>
                                </tr>
                                </thead>
                                <tbody class="t-body">
                                <tr>
                                    <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel orderPic_from">
            <form id="orderPic_from" class="formTemplate formBom normal">
                <div class="extend_wrap">
                    <div class=""></div>
                    <div class="basic_info bom_tree_wrap active">
                        <div id="orgchart-container"></div>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel orderFile_from">
            <form id="orderFile_from" class="formTemplate formBom normal">
                <div class="file-loading">
                    <input id="attachment" name="attachment" type="file" class="file" data-preview-file-type="text">
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/orgChart/js/html2canvas.min.js"></script>
<script src="/statics/common/orgChart/js/jquery.orgchart.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/custom/js/custom-config.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/product_order_edit.js?v={{$release}}"></script>
@endsection