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

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="bom_wrap">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-item="orderBasic_from" class="el-tap active">PO信息</span>
            <span data-item="orderInfo_from" class="el-tap">BOM信息</span>
            <span data-item="orderRoute_from" class="el-tap">工艺路线图</span>
            <span data-item="pScheduleInfo_from" class="el-tap">排产信息</span>
            <!-- <span data-item="orderPic_from" class="el-tap">BOM结构图</span> 
            <span data-item="orderFile_from" class="el-tap">BOM附件</span> -->
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel orderBasic_from active">
            <form id="orderBasic_from" class="formTemplate edit basicForm">
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative">
                            <label class="el-form-item-label">生产订单号<span class="mustItem">*</span></label>
                            <input type="text" id="productionOrderNumber" readonly class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
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
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative">
                            <label class="el-form-item-label">工艺路线<span class="mustItem">*</span></label>
                            <input type="text" id="basic_routing_name" readonly class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
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
                    <button type="button" class="el-button bom-structure" style="padding: 8px 15px;color: #fff;background-color: #20a0ff;border-color: #20a0ff;">BOM结构图</button>
                    <h4>基本信息</h4>
                    <div class="basic_info">
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单编码<span class="mustItem">*</span></label>
                                    <input type="text" id="code" readonly class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单名称<span class="mustItem">*</span></label>
                                    <input type="text" id="name" readonly class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item operation-wrap">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">工序</label>
                                    <input type="text" id="operation_id" readonly class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">基础数量</label>
                                    <input type="text" id="qty" class="el-input" readonly value="1">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div" style="position: relative;">
                                    <label class="el-form-item-label show-material top-material mater-active">物料编码<span class="mustItem">*</span></label>
                                    <input type="text" id="material_id" disabled class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item bom_group">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单分组</label>
                                    <input type="text" class="el-input val_id" readonly id="bom_group_id" value="">
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
                            <div class="el-form-item version">
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
                                    <input type="number" step="0.01" readonly id="loss_rate" class="el-input loss_rate" value="0.00">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">描述</label>
                                    <textarea type="textarea" maxlength="500" readonly id="description" rows="5" class="el-textarea"></textarea>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bom_blockquote">
                    <h4>项</h4>
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
            <button type="button" class="el-button go-back" style="margin-left: 6px;padding: 8px 15px;color: #fff;background-color: #20a0ff;border-color: #20a0ff;">返回</button>
            <form id="orderPic_from" class="formTemplate formBom normal">
                <div class="extend_wrap">
                    <div class=""></div>
                    <div class="basic_info bom_tree_wrap active">
                        <div id="orgchart-container"></div>
                    </div>
                </div>
            </form>
        </div>

        <!-- 工艺路线图 -->
        <div class="el-panel orderRoute_from">
            <form id="orderRoute_from" class="formTemplate formBom normal">
                <div class="route_line">
                    <div id="routing_graph" class="routing_graph"></div>
                </div>
            </form>
        </div>

        <!-- 排产信息 -->
        <div class="el-panel pScheduleInfo_from">
            <table id="pScheduleInfo_from"  class="formTemplate formBom normal sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th></th>
                        <th>WT编码</th>
                        <th>工序</th>
                        <th>出料编码</th>
                        <th>出料名称</th>
                        <th>数量</th>
                        <th>是否拆单</th>
                        <th>已排完成度</th>
                        <th>预估工时</th>
                    </tr> 
                </thead>
                <tbody class="t-body">
                    <tr>
                        <td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="el-panel orderFile_from">
            <form id="orderFile_from" class="formTemplate formBom normal">
                <div class="table-container">
                    <table class="bom_table">
                        <thead>
                        <tr>
                            <th class="thead">缩略图</th>
                            <th class="thead" style="text-align: left">名称</th>
                            <th class="thead" style="text-align: left">创建人及时间</th>
                            <th class="thead">注释</th>
                            <th class="thead">操作</th>
                        </tr>
                        </thead>
                        <tbody class="t-body">
                        </tbody>
                    </table>
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
<script src="/statics/custom/js/schedule/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/routing/routing-view.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/custom/js/custom-config.js"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/product_order_view.js?v={{$release}}"></script>

@endsection