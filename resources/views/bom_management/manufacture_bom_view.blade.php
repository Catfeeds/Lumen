{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/log.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/orgChart/css/jquery.orgchart.css">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="bom_wrap" id="viewBom">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap">
            <span data-item="viewBomCommon" class="el-tap active">常规</span>
            <span data-item="viewBomExtend" class="el-tap none">扩展</span>
            <span data-item="viewBomFiles" class="el-tap">附件</span>
            <!--<span data-item="viewBomDesign" class="el-tap">设计BOM版本</span>-->
            <!--<span data-item="viewBomProduct" class="el-tap">制造BOM</span>-->
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
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单编码<span class="mustItem">*</span></label>
                                    <input type="text" id="code" readonly="readonly" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料清单名称<span class="mustItem">*</span></label>
                                    <input type="text" id="name" readonly="readonly" class="el-input" value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">基础数量</label>
                                    <input type="text" id="qty" readonly="readonly" class="el-input" value="1">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div" style="position: relative;">
                                    <label class="el-form-item-label show-material top-material">物料编码<span class="mustItem">*</span></label>
                                    <input type="text" id="material_id" readonly="readonly" disabled class="el-input" value="">
                                    <span class="fa fa-table pos-icon bom-add-item choose-material"></span>
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
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">版本</label>
                                    <input type="text" id="version" readonly="readonly" class="el-input" disabled value="">
                                </div>
                                <p class="errorMessage" style="padding-left: 20px;"></p>
                            </div>
                        </div>
                        <div>
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
                                    <textarea type="textarea" maxlength="500" id="description" readonly="readonly" rows="5" class="el-textarea"></textarea>
                                </div>
                                <p class="errorMessage" style="padding-left: 30px;"></p>
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
                                    <th class="thead">版本</th>
                                    <th class="thead">使用数量</th>
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
                        <button type="button" id="showBomTree" class="bom-button">显示树形图</button>
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
                                        <div class="el-form-item attr">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label" style="width: 56px;">物料属性</label>
                                                <button type="button" id="materialAttrModal" class="bom-info-button show-material">查看</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bom_blockquote">
                                <h3>默认工艺路线</h3>
                                <div class="basic_info">
                                    工艺路线图
                                </div>
                            </div>
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
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/custom-config.js"></script>
<script src="/statics/common/orgChart/js/html2canvas.min.js"></script>
<script src="/statics/common/orgChart/js/jquery.orgchart.js"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/ajax-public.js"></script>
<script src="/statics/custom/js/bom/bom-url.js"></script>
<script src="/statics/custom/js/bom/bom-manufacture.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/bom/log.js?v={{$release}}"></script>
@endsection