{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/log.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/orgChart/css/jquery.orgchart.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="bom_view" value="/BomManagement/bomView">
<input type="hidden" id="product_bom_view" value="/BomManagement/manufactureBomView">
<div class="bom_wrap" id="viewBom">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-item="viewBomCommon" class="el-tap active">常规</span>
            <span data-item="viewBomExtend" class="el-tap">结构</span>
            <span data-item="addRoute_form" class="el-tap">工艺路线</span>
            <span data-item="viewBomFiles" class="el-tap">附件</span>
            <span data-item="viewBomDesign" class="el-tap">设计BOM版本</span>
            <span data-item="viewBomProduct" class="el-tap">制造BOM</span>
        </div>
        <div class="logBtnWrap">
            <button class="log_btn" id="showLog">显示日志</button>
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel viewBomCommon active">
            <form id="viewBomCommon" class="formTemplate formViewBom normal">
                <div class="bom_blockquote">
                    <h3>基本信息</h3>
                    <div class="basic_info">
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div" style="position: relative;">
                                    <label class="el-form-item-label show-material top-material">物料编码<span class="mustItem">*</span></label>
                                    <input type="text" id="material_id" readonly="readonly" disabled class="el-input" value="">
                                    <span class="fa fa-table pos-icon bom-add-item choose-material"></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料单位</label>
                                    <input type="text" readonly id="unit" class="el-input" placeholder="请选择单位" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" id="operation-data">工序</label>
                                    <input type="text" readonly="readonly" id="basic_operation_id" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">基础数量</label>
                                    <input type="text" id="qty" readonly="readonly" class="el-input" value="1">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">版本</label>
                                    <input type="text" id="version" readonly="readonly" class="el-input" disabled value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">BOM基本单位</label>
                                    <input type="text" id="bom_unit" readonly="readonly" class="el-input" disabled value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">SAP描述</label>
                                    <textarea type="textarea" maxlength="500" id="SAP_desc" readonly="readonly" rows="3" class="el-textarea"></textarea>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单编码<span class="mustItem">*</span></label>
                                    <input type="text" id="code" readonly="readonly" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item bom_group">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单分组</label>
                                    <input type="text" id="bom_group_name" readonly="readonly" class="el-input" value="">
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

                                            </ul>
                                        </div>
                                    </div>

                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">标签</label>
                                    <input type="text" id="label" readonly="readonly" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">BOM编码</label>
                                    <input type="text" id="bom_no" readonly="readonly" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">有效期</label>
                                    <input type="text" id="validity" readonly="readonly" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单名称<span class="mustItem">*</span></label>
                                    <input type="text" id="name" readonly="readonly" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">报废率（%）</label>
                                    <input type="number" step="0.01" id="loss_rate" readonly="readonly" class="el-input loss_rate" value="0.00">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">描述</label>
                                    <textarea type="textarea" maxlength="500" id="description" readonly="readonly" rows="4" class="el-textarea"></textarea>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">更改编号</label>
                                    <input type="text" id="update_no" readonly="readonly" class="el-input loss_rate" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">来源</label>
                                    <input type="text" id="bom_from" readonly="readonly" class="el-input loss_rate" value="">
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
                            <table class="bom_table item_table">
                                <thead>
                                <tr>
                                    <th class="thead">物料编码</th>
                                    <th class="thead">名称</th>
                                    <th class="thead">损耗率（%）</th>
                                    <th class="thead">组装</th>
                                    <th class="thead">使用数量</th>
                                    <th class="thead">单位</th>
                                    <th class="thead">简要描述</th>
                                </tr>
                                </thead>
                                <tbody class="t-body">
                                <!--<tr>-->
                                <!--<td class="nowrap" colspan="7" style="text-align: center;">暂无数据</td>-->
                                <!--</tr>-->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel viewBomExtend">
            <form id="viewBomExtend" class="formTemplate formViewBom normal">
                <div class="extend_wrap">
                    <div>
                        <!--<h3>编码<span class="showcode"></span>的物料信息-->
                        <button type="button" id="showBomTree" class="bom-button">显示树形图</button></h3>
                    </div>
                    <div class="basic_info bom_container active">
                        <div class="bom_tree_conwrap">
                            <div class="bom_tree_container">
                                <div class="bom-tree"></div>
                            </div>
                        </div>
                        <div class="bom_item_container">
                            <div class="el-tap-wrap">
                            </div>
                            <div class="bom_blockquote">
                                <h3>基本信息</h3>
                                <div class="basic_info mbasic_info">
                                    <div>
                                        <div class="el-form-item name">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label" style="width: 28px;min-width: 0;">名称</label>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="el-form-item item_no">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label" style="width: 28px;min-width: 0;">编码</label>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="el-form-item attr">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label" style="width: 56px;">物料属性</label>
                                                <button type="button" id="materialAttrModal" class="bom-info-button show-material">查看</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!--<div class="bom_blockquote">-->
                                <!--<h3>默认工艺路线</h3>-->
                                <!--<div class="basic_info">-->
                                    <!--工艺路线图-->
                                <!--</div>-->
                            <!--</div>-->
                            <div class="bom_blockquote_wrap qty">

                            </div>
                            <div class="bom_blockquote_wrap consum">

                            </div>
                        </div>
                    </div>
                    <div class="bom_tree_wrap">
                        <div id="orgchart-container">

                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel addRoute_form">
            <form id="addRoute_form" class="formTemplate formBom normal">
                <div class="el-form-item route-line" style="display: flex;justify-content: space-between;">
                    <div class="el-form-item-div" style="width: 800px;">
                        <label class="el-form-item-label">工艺路线组</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="route_group_name" class="el-input" value="--请选择--">
                                <input type="hidden" class="group_val_id" id="route_group_id" value="">
                            </div>
                        </div>
                        <label class="el-form-item-label">工艺路线</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="route_id" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list">
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="save-route-btn" style="padding-right: 10px;">
                        <button class="el-button preview-route">工艺文件预览</button>
                    </div>
                </div>
                <div class="el-form-item version_release" style="color: red;text-align: right;padding-right: 40px;"></div>
                <div class="bom_blockquote">
                    <h3>已选工艺路线</h3>
                    <div class="route-lists">
                    </div>
                </div>
                <div class="bom_blockquote">
                    <h3>路线可视化</h3>
                    <div class="route_pic-wrap">
                        <div class="route_pic">
                            <div class="routing_graph" id="routing_graph_new"></div>
                        </div>
                        <div class="make_list">
                            <h4>做法列表</h4>
                            <div class="make_list_all">
                                <p style="padding-left: 10px;">暂无数据</p>
                            </div>
                            <div class="self-btn"><button class="el-button self-make-btn">自定义步骤</button></div>
                        </div>
                    </div>
                </div>
                <div class="bom_blockquote route">
                    <h3>工艺路线挂bom<span style="color: #f00;"></span></h3>
                    <div class="route_container">
                        <div class="route_overflow">
                            <table class="uniquetable">
                                <thead>
                                <tr>
                                    <th>序号</th>
                                    <th>步骤</th>
                                    <th style="width: 200px;">能力</th>
                                    <th style="width: 150px;">工作中心</th>
                                    <th>设备</th>
                                    <th style="width: 130px;">进/出料模式</th>
                                    <th>进/出料</th>
                                    <th style="width: 110px;">图纸</th>
                                    <th>标准工艺</th>
                                    <th>特殊工艺</th>
                                    <th style="width: 90px;">附件</th>
                                </tr>
                                </thead>
                                <tbody class="route-tbody">
                                <tr>
                                    <td colspan="11" style="text-align: center;">暂无数据</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel viewBomFiles">
            <form id="viewBomFiles" class="formTemplate formViewBom normal">
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
        <div class="el-panel viewBomDesign">
            <form id="viewBomDesign" class="formTemplate formViewBom normal">
                <div class="basic_info">
                    <div class="table-container">
                        <table class="bom_table design_main_table">
                            <thead>
                            <tr>
                                <th class="thead">物料清单编码</th>
                                <th class="thead">物料清单名称</th>
                                <th class="thead">创建人</th>
                                <th class="thead">版本</th>
                                <th class="thead">版本描述</th>
                                <th class="thead">状态</th>
                                <th class="thead">操作</th>
                            </tr>
                            </thead>
                            <tbody class="t-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel viewBomProduct productBom">
            <div class="pagenation_wrap">
                <div id="producePagenation" class="pagenation"></div>
            </div>
            <form id="viewBomProduct" class="formTemplate formViewBom normal">
                <div class="basic_info">
                    <div class="table-container">
                        <table class="bom_table product_main_table">
                            <thead>
                            <tr>
                                <th class="thead">物料清单编码</th>
                                <th class="thead">物料清单名称</th>
                                <th class="thead">衍生版本</th>
                                <th class="thead">版本描述</th>
                                <th class="thead">详细改动</th>
                                <th class="thead">操作</th>
                            </tr>
                            </thead>
                            <tbody class="t-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
<div class="logWrap" id="log">
    <div class="log-container">
        <div class="title">
            <span class="header">操作日志</span>
            <span class="close logClose"><i class="fa fa-close"></i></span>
        </div>
        <div class="log-content">
            <div class="log-modifier-user"></div>
            <div class="log-item-wrap">
                <div class="log-date-filter">
                    <span class="item-title"><i class="fa fa-tasks"></i>&nbsp;&nbsp;操作信息</span>
                    <div class="log-datepicker">
                        <label for="log-date"><i class="fa fa-calendar datepicker-icon"></i></label>
                        <input type="text" id="log-date" readonly class="log-datepicker-input" value="">
                    </div>
                </div>
                <div class="log-pagenation-wrap">
                    <div id="log-pagenation" class="log-pagenation"></div>
                </div>
                <div class="log-item-container">
                    <ul class="log-item-ul">
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/orgChart/js/html2canvas.min.js"></script>
<script src="/statics/common/orgChart/js/jquery.orgchart.js"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/ajax-public.js"></script>
<script src="/statics/custom/js/bom/bom-url.js"></script>
<script src="/statics/common/routing/showRouting.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/bom-view.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/bom/log.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/qrcode.js?v={{$release}}"></script>
@endsection