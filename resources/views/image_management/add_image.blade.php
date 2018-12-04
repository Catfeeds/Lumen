
{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="editurl" value="/ImageManagement/updateImage">
<input type="hidden" id="addurl" value="/ImageManagement/addImage">
<div class="imgs-wrap">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-item="addImage" class="el-tap active">图纸常规</span>
            <span data-item="linkImage" class="el-tap none">关联图纸</span>
            <span data-item="addFujian" class="el-tap none">附件</span>
            <span data-item="assemblyDrawing" class="el-tap none" style="display: none;" id="showAssemblyDrawing">组合图</span>
            <span data-item="careLable" class="el-tap none">洗标</span>
        </div>
        <div class="el-form-item btnShow msaveBtn">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary submit">保存</button>
                <button type="button" class="el-button jump none">添加</button>
            </div>
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel addImage active">
            <form id="addImage" class="formMateriel formTemplate normal">
                <div class="flex-wrap">
                    <div class="basic-wrap" style="width: 500px;">
                        <div class="el-form-item source">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸来源<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="category_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item category">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸分类<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="type_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item group">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸分组<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="group_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">编码<span class="mustItem">*</span></label>
                                <input type="text" id="code"  class="el-input" placeholder="由1-20位字母、数字、下划线和中划线组成" value="" readonly="readonly">
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">名称<span class="mustItem">*</span></label>
                                <input type="text" id="name"  class="el-input" placeholder="请输入名称" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="attr-container">
                            <label class="el-form-item-label">图纸属性</label>
                            <div class="mattr-con-detail">
                                <div class="el-form-item" style="display: block;">
                                    <div class="el-form-item-div choose-btn">
                                        <button type="button" class="el-button choose choose-attr choose-template">选择图纸属性</button>
                                        <button type="button" class="el-button find-same">查找相同属性图纸</button>
                                </div>
                                </div>
                                <div class="querywrap"></div>
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">描述</label>
                                <textarea type="textarea" maxlength="500" id="comment" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸上传</label>
                                <div class="file-wrap">
                                    <div class="file-loading">
                                        <input id="drawing" name="drawing" type="file" required data-preview-file-type="image">
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                    </div>
                    <div class="sameImg" style="display: none;">
                        <h4 style="font-weight: bold;">相同属性图纸</h4>
                        <div class="table table_page">
                            <table id="table_pic_table" class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th>缩略图</th>
                                    <th>图纸编码</th>
                                    <th>图纸名称</th>
                                    <th>创建人</th>
                                    <th>创建时间</th>
                                </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    <tr class="tritem"><td colspan="5" style="text-align: center;">暂无数据</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel linkImage">
            <form id="linkImage" class="formMateriel formTemplate normal">
                <div class="picCon">
                    <div class="el-form-item btnShow">
                        <div class="el-form-item-div btn-group flexstart">
                            <button type="button" class="el-button add-linkpic">添加关联图</button>
                        </div>
                    </div>
                    <div class="link-num"><span>0</span>张</div>
                    <div class="picList ulwrap">
                        <div class="table table_page">
                            <table id="table_linkpic_table" class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th>缩略图</th>
                                    <th>图纸编码</th>
                                    <th>图纸名称</th>
                                    <th>计数<span style="color: red;">*</span></th>
                                    <th>描述</th>
                                    <th>图纸属性</th>
                                    <th class="right">操作</th>
                                </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    <tr class="tritem">
                                        <td colspan="8" style="text-align: center;">暂无数据</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="el-panel addFujian">
            <form id="addFujian" class="formMateriel formTemplate normal">
                <div class="el-form-item" style="width: 500px;">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">名称<span class="mustItem">*</span></label>
                        <input type="text" id="attchname" class="el-input" placeholder="" value="">
                    </div>
                </div>
                <div class="file-loading">
                    <input id="attachment" name="attachment" type="file" class="file" data-preview-file-type="text">
                </div>

            </form>
        </div>
        <div class="el-panel assemblyDrawing">
            <form id="assemblyDrawing" class="formMateriel formTemplate normal">
                <div id="show_arr_list">

                </div>
            </form>
        </div>
        <div class="el-panel careLable">
            <form id="careLable" class="formMateriel formTemplate normal">
                <div class="el-form-item btnShow">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button el-button--primary addCareLable">保存洗标</button>
                        <button type="button" class="el-button sendCareLable">发送</button>
                    </div>
                </div>
                <div class="careLable">
                    <table class="careLable_table">
                        <thead>
                        <tr class="th_table_tbody">
                            <th class="thead">销售单号</th>
                            <th class="thead">行项号</th>
                            <th class="thead">物料号</th>
                            <th class="thead">版本号</th>
                            <th class="thead"></th>
                        </tr>
                        </thead>
                        <tbody class="table_tbody">

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
<script src="/statics/custom/js/ajax-public.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
<script src="/statics/custom/js/image/image-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/image/image-add.js?v={{$release}}"></script>
@endsection