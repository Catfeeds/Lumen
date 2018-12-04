{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-template.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/common/transfer/transfer.css?v={{$release}}" >
<script src="/statics/custom/js/mgm_material/material-url.js?v={{$release}}"></script>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="template_edit" value="/MaterialManagement/templateEdit">
<div class="templates_wrap">
    <div class="el-tap-wrap">
        <span data-item="addMTemplate_from" class="el-tap active">基础信息</span>
        <span data-item="addMTemplateAttr_from" class="el-tap">物料属性</span>
        <span data-item="addMTemplateGYAttr_from" class="el-tap">工艺属性</span>
        <span data-item="addMTemplateAttrFilter_from" class="el-tap">属性过滤设置</span>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel addMTemplate_from active">
            <form id="addMTemplate_from" class="formMateriel formTemplate">
                <div class="el-form-item parent">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">基于模板</label>
                        <div class="div_wrap">
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="parent_id" value="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">编码<span class="mustItem">*</span></label>
                        <input type="text" id="code" class="el-input" placeholder="由1-49个字母数字下划线组成，且字母开头" value="" maxlength="49">
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">名称<span class="mustItem">*</span></label>
                        <input type="text" id="name" class="el-input" placeholder="请输入名称" value="" maxlength="50">
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">标签</label>
                        <input type="text" id="label" class="el-input" placeholder="请输入标签" value="" maxlength="">
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item status" style="display: none;">
                    <div class="el-form-item-div" >
                        <label class="el-form-item-label">状态</label>
                        <div class="status"></div>
                    </div>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">描述</label>
                        <textarea type="textarea" maxlength="500" id="description" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
                    </div>
                    <p class="errorMessage"></p>
                </div>
                <div class="el-form-item btnShow">
                    <div class="el-form-item-div btn-group add">
                        <button type="button" class="el-button el-button--primary submit basic">提交</button>
                    </div>
                    <div class="el-form-item-div btn-group edit" style="display: none;">
                        <button type="button" class="el-button next" data-next="addMTemplateAttr_from" style="display: none;">下一步</button>
                        <button type="button" class="el-button el-button--primary submit basic">保存基础信息</button>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel addMTemplateAttr_from">
            <div class="tip-info" style="color: green;text-align: right;margin-right: 50px;display: none;">本页数据只能在本页进行保存，离开将刷新<span class="tip-close">X</span></div>
            <form id="addMTemplateAttr_from" class="formMateriel formTemplate">
                <div class="el-form-item">
                    <input type="text" style="width: 600px;" id="search_attr" class="el-input attr" placeholder="请输入键值或名称或标签" value="">
                    <button type="button" style="margin-left: 10px;" class="el-button el-button--primary search attr">搜索</button>
                </div>
                <div id="attrApp"></div>
                <div class="el-form-item btnShow btnMargin">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button prev" data-prev="addMTemplate_from" style="display: none;">上一步</button>
                        <button type="button" class="el-button next" data-next="addMTemplateGYAttr_from" style="display: none;">下一步</button>
                        <button type="button" class="el-button el-button--primary submit attr is-disabled">保存物料属性</button>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel addMTemplateGYAttr_from">
            <div class="tip-info" style="color: green;text-align: right;margin-right: 50px;display: none;">本页数据只能在本页进行保存，离开将刷新<span class="tip-close">X</span></div>
            <form id="addMTemplateGYAttr_from" class="formMateriel formTemplate">
                <div class="gongyi_wrap">
                    <div class="el-form-item">
                        <input type="text" style="width: 600px;" id="search_opattr" class="el-input opattr" placeholder="请输入键值或名称或标签" value="">
                        <button type="button" style="margin-left: 10px;" class="el-button el-button--primary search opattr">搜索</button>
                    </div>
                    <div id="craftsApp"></div>
                </div>
                <div class="el-form-item btnShow btnMargin">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button prev" data-prev="addMTemplateAttr_from" style="display: none;">上一步</button>
                        <button type="button" class="el-button next" data-next="addMTemplateAttrFilter_from" style="display: none;">下一步</button>
                        <button type="button" class="el-button el-button--primary submit opattr is-disabled">保存工艺属性</button>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel addMTemplateAttrFilter_from">
            <div class="tip-info" style="color: green;text-align: right;margin-right: 50px;display: none;">本页数据只能在本页进行保存，离开将刷新<span class="tip-close">X</span></div>
            <form id="addMTemplateAttrFilter_from" class="formMateriel formTemplate" style="margin-bottom: 200px;">
                <div class="div_con_wrapper" style="display: none;">
                    <div class="table_page">
                        <div class="wrap_table" style="overflow: hidden;">
                            <table id="table_filter_noData" class="uniquetable attr_filter_table">
                                <thead>
                                    <tr>
                                        <th>键值</th>
                                        <th>名称</th>
                                        <th>数据类型</th>
                                        <th>单位</th>
                                        <th>拼单属性？</th>
                                        <th>工位机可查看？</th>
                                        <th>过滤值</th>
                                    </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    <tr><td style="text-align: center;" colspan="7">暂无数据</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="div_con_wrapper">
                    <h4>物料属性</h4>
                    <div class="table_page">
                        <div class="wrap_table" style="overflow: hidden;">
                            <table id="table_filter_attr" class="uniquetable attr_filter_table">
                                <thead>
                                    <tr>
                                        <th>键值</th>
                                        <th>名称</th>
                                        <th>数据类型</th>
                                        <th>单位</th>
                                        <th>拼单属性？</th>
                                        <th>工位机可查看？</th>
                                        <th>过滤值</th>
                                    </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="div_con_wrapper">
                    <h4>工艺属性</h4>
                    <div class="table_page">
                        <div class="wrap_table" style="overflow: hidden;">
                            <table id="table_filter_gyattr" class="uniquetable attr_filter_table">
                                <thead>
                                    <tr>
                                        <th>键值</th>
                                        <th>名称</th>
                                        <th>数据类型</th>
                                        <th>单位</th>
                                        <th>拼单属性？</th>
                                        <th>工位机可查看？</th>
                                        <th>过滤值</th>
                                    </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="el-form-item btnShow btnMargin">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button prev" data-prev="addMTemplateGYAttr_from" style="display: none;">上一步</button>
                        <button type="button" class="el-button el-button--primary submit saveFilter">保存属性过滤值</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/transfer/transfer.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material_basic/material-template-add.js?v={{$release}}"></script>
@endsection
