@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/orgChart/css/jquery.orgchart.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/log.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/practice/img_upload.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="bom_view" value="/BomManagement/bomView">
<input type="hidden" id="bom_edit" value="/BomManagement/bomEdit">
<input type="hidden" id="product_bom_view" value="/BomManagement/manufactureBomView">
<input type="hidden" id="show_control_code">
<div class="div-all-wrap">
    <div class="bom-fake-tree" style="cursor: e-resize;">
        <div class="bom_tree_container">
            <div class="bom-tree"></div>
        </div>
    </div>
    <div class="bom_wrap">
        <div class="tap-btn-wrap">
            <div class="el-tap-wrap">
                <span data-item="addBBasic_from" class="el-tap active">常规</span>
                <span data-item="addExtend_from" class="el-tap">结构</span>
                <span data-item="addRoute_form" class="el-tap none">工艺路线</span>
                <span data-item="addBFujian_from" class="el-tap">附件</span>
                 <span data-item="addDesignBom_from" class="el-tap none">BOM版本</span>
                <span data-item="addMakeBom_from" class="el-tap none">制造BOM</span>
            </div>
             <div class="el-form-item btnShow saveBtn">
                <div class="el-form-item-div btn-group">
                    <button id="ecm_warning" style="background:#FF5722;margin-right: 10px;margin-bottom: 8px;color:#ffffff;display:none;">ECM</button>
                    <button type="button" class="el-button status-btn freeze none" >冻结所有版本</button>
                    <button type="button" class="el-button status-btn activate none">激活</button>
                    <button type="button" class="el-button el-button--primary submit save" >保存版本</button>
                    <div class="saveoption" style="margin-top: 5px;">
                        <span class="el-checkbox_input editOption upgrade">
                            <span class="el-checkbox-outset"></span>
                        </span>
                        <div class="tipinfo">
                            <p>升级版本</p>
                        </div>
                    </div>
                    <div class="saveoption" style="margin-top: 5px;">
                        <span class="el-checkbox_input editOption up-to-product">
                            <span class="el-checkbox-outset"></span>
                        </span>
                        <div class="tipinfo">
                            <p>生成制造BOM</p>
                        </div>
                    </div>
                </div>
            </div>
             <div class="logBtnWrap">
                <i class="fa fa-file-text-o" id="showLog" aria-hidden="true" title="显示日志"></i>
            </div>
        </div>
        <div class="el-panel-wrap" style="margin-top: 20px;">
            <!--常规 start-->
            <div class="el-panel addBBasic_from active">
                <form id="addBBasic_from" class="formTemplate formBom normal">
                    <div class="bom_blockquote">
                        <h4>基本信息</h4>
                        <div class="basic_info">
                            <div style="flex: 1;">
                                <div class="el-form-item">
                                    <div class="el-form-item-div" style="position: relative;">
                                        <label class="el-form-item-label show-material top-material">物料名称<span class="mustItem">*</span></label>
                                        <input type="text" id="material_id" disabled class="el-input" placeholder="请选择物料" value="">
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
                                        <input type="text" id="qty" class="el-input" value="1" maxlength="10">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 20px;"></p>
                                </div>

                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">BOM编号</label>
                                        <input type="text" id="bom_no" class="el-input" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>

                                <div class="el-form-item BOM_unit" style="display: none;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">BOM基本单位</label>
                                        <input type="text" id="bom_unit" class="el-input" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div" style="display: none">
                                        <label class="el-form-item-label">用途</label>
                                        <input type="text" id="use" class="el-input" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>

                            </div>
                            <div style="flex: 1;">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">物料清单编码<span class="mustItem">*</span></label>
                                        <input type="text" id="code"  class="el-input" placeholder="请输入物料清单编码" value="">
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
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">标签</label>
                                        <input type="text" id="label" class="el-input" placeholder="请输入标签" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 20px;"></p>
                                </div>

                                <div class="el-form-item BOM_from" style="display: none;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">来源</label>
                                        <input type="text" id="bom_from" class="el-input" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>

                                <div class="el-form-item version" style="display: none;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">版本</label>
                                        <input type="text" readonly="readonly" id="version" class="el-input" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 20px;"></p>
                                </div>
                                <!--<div class="el-form-item" style="display: none">-->
                                    <!--<div class="el-form-item-div">-->
                                        <!--<label class="el-form-item-label">有效期</label>-->
                                        <!--<input type="text" id="validity" class="el-input" value="" placeholder="请填写有效期">-->
                                    <!--</div>-->
                                    <!--<p class="errorMessage" style="padding-left: 30px;"></p>-->
                                <!--</div>-->
                            </div>
                            <div style="flex: 1;">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">物料清单名称<span class="mustItem">*</span></label>
                                        <input type="text" id="name" class="el-input" placeholder="请输入物料清单名称" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
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
                                        <textarea type="textarea" maxlength="200" id="description" rows="4" class="el-textarea" placeholder="请输入描述，最多只能输入200字"></textarea>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item" style="display: none;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">bom_unit_id</label>
                                        <input type="text" id="bom_unit_id" class="el-input" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <!--<div class="el-form-item">-->
                                    <!--<div class="el-form-item-div">-->
                                        <!--<label class="el-form-item-label">更改编号</label>-->
                                        <!--<input type="text" id="update_no" class="el-input" value="">-->
                                    <!--</div>-->
                                    <!--<p class="errorMessage" style="padding-left: 30px;"></p>-->
                                <!--</div>-->
                                <div class="el-form-item sap_desc" style="display: none;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">SAP描述</label>
                                        <textarea type="textarea" maxlength="200" id="SAP_desc" rows="4" class="el-textarea"></textarea>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>

                            </div>

                        </div>
                        <div id="factory_toggle" style="display: none;">
                            <div class="el-form-item">
                                <div class="el-form-item-div" style="position: relative;">
                                    <label class="el-form-item-label show-material top-material">工厂</label>
                                    <div style="padding: 5px;min-height: 36px;width:100%;line-height: 22px;border: 1px solid #bfcbd9;" id="factory"></div>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
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
                                        <th class="thead">单位</th>
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
                    <div class="el-form-item btnShow btnMargin">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button next" data-next="addExtend_from">下一步</button>
                        </div>
                    </div>
                </form>
            </div>
            <!--常规 end-->
            <!--扩展 start-->
            <div class="el-panel addExtend_from">
                <form id="addExtend_from" class="formTemplate formBom normal">
                    <div class="extend_wrap">
                        <div>
                            <h3>
                                <!-- <span class="showBomCode">编码<span class="showcode"></span>的物料信息</span> -->
                                <button type="button" id="showBomTree" class="bom-button">显示树形图</button>
                            </h3>
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
                                <div class="bom_blockquote" style="display: none;">
                                    <h3>默认工艺路线</h3>
                                    <div class="bom_route">
                                        <!--工艺路线图-->
                                        <div class="routing_graph" id="routing_graph"></div>
                                    </div>
                                </div>
                                <div class="bom_blockquote_wrap qty">

                                </div>
                                <div class="bom_blockquote_wrap consum">

                                </div>
                            </div>
                        </div>
                        <div class="basic_info bom_tree_wrap">
                            <div id="orgchart-container"></div>
                        </div>
                    </div>
                    <div class="el-form-item btnShow btnMargin">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button prev" data-prev="addBBasic_from">上一步</button>
                            <button type="button" class="el-button next" data-next="addBFujian_from">下一步</button>
                        </div>
                    </div>
                </form>
            </div>
            <!--扩展 end-->
            <div class="el-panel addRoute_form">
                <form id="addRoute_form" class="formTemplate formBom normal">
                    <div class="el-form-item route-line" style="display: flex;justify-content: space-between;">
                        <div class="el-form-item-div" style="width: 1100px;">
                            <label class="el-form-item-label" style="width:50px;">工厂</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input show_desc" value="--请选择--" style="width: 270px">
                                    <input type="hidden" class="factory_val_id" id="factory_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list-factory">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                            <label class="el-form-item-label">工艺路线组</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input show_desc" value="--请选择--">
                                    <input type="hidden" class="group_val_id" id="route_group_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list-group">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                            <label class="el-form-item-label" style="width: 80px;">工艺路线</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input show_desc" value="--请选择--">
                                    <input type="hidden" class="val_id" id="route_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list-route">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="save-route-btn" style="padding-right: 10px;margin-left: 20px">
                                <button class="el-button el-button--primary save-route">保存工艺文件</button>
                            </div>
                        </div>

                        <div class="save-route-btn" style="padding-right: 10px;">
                            <button class="el-button preview-route">工艺文件预览</button>
                        </div>
                    </div>
                    <div class="el-form-item version_release" style="color: red;text-align: right;padding-right: 10px;"></div>
                    <div class="bom_blockquote" style="display: none;">
                        <h3>已选工艺路线（勾选默认工艺路线）</h3>
                        <div class="route-lists">
                        </div>
                    </div>
                    <div class="bom_blockquote" style="display: none;">
                        <h3>路线可视化</h3>
                        <div class="route_pic-wrap">
                            <div class="route_pic">
                                <div class="routing_graph" id="routing_graph_new"></div>
                            </div>
                            <div class="make_list">
                                <h4>做法列表</h4>
                                <div class="make-search">
                                    <div class="search-div">
                                        <input type="text" class="el-input el-input-search" placeholder="做法名称">
                                        <span class="search-icon search-span"><i class="fa fa-search"></i></span>
                                    </div>
                                </div>
                                <div class="make-search">
                                    <div class="search-div">
                                        <input type="text" class="el-input el-input-search" placeholder="做法编码">
                                        <span class="search-code search-span"><i class="fa fa-search"></i></span>
                                    </div>
                                </div>
                                <div class="make_list_all">
                                    <p style="padding-left: 10px;">暂无数据</p>
                                </div>
                                <div class="self-btn"><button type="button" class="el-button self-make-btn is-disabled" data-num="" disabled="true">自定义步骤</button></div>
                            </div>
                            <div class="make_list_line">
                                <h4>关联的做法线</h4>
                                <div class="make_list_line_all">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bom_blockquote route" style="display: none;">
                        <h3>
                            <div style="height: 60px;line-height: 60px;display: inline-block;">
                                 <span style="color: #f00;"></span>
                            </div>

                            <div class="el-form-item " id="select_type_code" style="display: none;position: relative;left: 20px;">
                                <div style="display: flex">
                                    <div style="margin-top: 25px;">工序控制码：</div>
                                    <div>
                                        <div class="el-form-item-div">
                                            <div class="el-select other-info">
                                                <i class="el-input-icon_routing el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly id="selectVal" class="el-input" value="自制">
                                                <input type="hidden" readonly class="val_id" data-code="" id="type_code" value="PP01">
                                            </div>
                                            <div class="el-select-dropdown other-info">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="PP01" class=" el-select-dropdown-item other-info">自制（PP01）</li>
                                                    <li data-id="PP02" class=" el-select-dropdown-item other-info">外发（PP02）</li>
                                                    <li data-id="PP05" class=" el-select-dropdown-item other-info">定制（PP05）</li>
                                                    <li data-id="PP06" class=" el-select-dropdown-item other-info">熟化（PP06）</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </h3>

                        <div class="route_container">
                            <div class="route_overflow">
                                <table class="uniquetable">
                                    <thead>
                                    <tr>
                                        <th>序号</th>
                                        <th>步骤</th>
                                        <th style="width: 150px;">能力</th>
                                        <th style="width: 150px;">工作中心</th>
                                        <th style="width: 150px;">设备</th>
                                        <th style="width: 130px;">进/出料模式</th>
                                        <th style="width: 418px">进/出料</th>
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

                        <div class="save-route-btn" style="padding-right: 10px;">
                            <div class="el-form-item">
                                <div class="el-form-item-div" style="margin-top: 70px;justify-content: flex-end;margin-bottom: 30px">
                                    <button class="el-button el-button--primary save-route">保存工艺文件</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <!--附件 start-->
            <div class="el-panel addBFujian_from">
                <form id="addBFujian_from" class="formTemplate formBom normal">
                    <div class="file-loading">
                        <input id="attachment" name="attachment" type="file" class="file" data-preview-file-type="text">
                    </div>
                </form>
            </div>
            <!-- 附件 end-->
            <!--设计bom start-->
            <div class="el-panel addDesignBom_from">
                <form id="addDesignBom_from" class="formTemplate formBom normal">
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
                                <tr>
                                    <td class="nowrap" colspan="7" style="text-align: center;">暂无数据</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>
            </div>
            <!--设计bom end-->
            <!--制造bom start-->
            <div class="el-panel addMakeBom_from productBom">
                <div class="pagenation_wrap">
                    <div id="producePagenation" class="pagenation"></div>
                </div>
                <form id="addMakeBom_from" class="formTemplate formBom normal">
                    <div class="basic_info">
                        <div class="table-container">
                            <table class="bom_table">
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
            <!--制造bom end-->
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
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/orgChart/js/html2canvas.min.js"></script>
<script src="/statics/common/orgChart/js/jquery.orgchart.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/bom/bom-url.js"></script>
<script src="/statics/custom/js/practice/img_upload.js?v={{$release}}"></script>
<script src="/statics/common/routing/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/auto-size.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/bom-add.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/log.js?v={{$release}}"></script>
<script src="/statics/custom/js/schedule/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/qrcode.js?v={{$release}}"></script>
@endsection