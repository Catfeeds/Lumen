
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/routing/routing.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="route_edit" value="/Procedure/procedureEdit">
    <div class="div_con_wrapper">
        <div class="tap-btn-wrap">
            <div class="el-tap-wrap edit">
                <span data-item="routeCommon" class="el-tap active">常规</span>
                <!--<span data-item="routeProcedure" class="el-tap active">工序</span>-->
            </div>
            <!--<div class="el-form-item btnShow saveBtn">-->
                <!--<div class="el-form-item-div btn-group">-->
                    <!--<button type="button" class="el-button el-button&#45;&#45;primary submit save">保存</button>-->
                <!--</div>-->
            <!--</div>-->
        </div>

        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="el-panel routeCommon active">
                <form id="route_basic_form" class="formTemplate basicForm">
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">编码<span class="mustItem">*</span></label>
                                <input type="text" id="code" class="el-input" placeholder="编码由2-50位字母数字下划线中划线组成" value="" maxlength="50">
                            </div>
                            <p class="errorMessage"  id="codeMessage" style="padding-left: 30px;display: block"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">名称<span class="mustItem">*</span></label>
                                <input type="text" id="name" class="el-input" placeholder="请输入名称" value="" maxlength="30">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;display: block"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">描述</label>
                                <textarea type="textarea" id="description" maxlength="200" rows="5" class="el-textarea" placeholder="请输入描述，最多能输入200个字符" maxlength="200"
                                ></textarea>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>
                    <div class="el-form-item btnShow">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit">保存</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!--<div role="switch" class="el-switch">-->
    <!--<input type="checkbox" name="" class="el-switch__input">-->
    <!--&lt;!&ndash;&ndash;&gt;-->
    <!--<span class="el-switch__core" style="">-->
    <!--<span class="el-switch__button" style=""></span>-->
    <!--</span>-->
    <!--<span class="el-switch__label el-switch__label&#45;&#45;right is-active">-->
    <!--<span>顺序</span>-->
    <!--</span>-->
    <!--&lt;!&ndash;&ndash;&gt;-->
    <!--</div>-->
    <!--&lt;!&ndash;<span class="sequence">顺序</span>&ndash;&gt;-->
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/routing/routing-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/schedule/routing.js?v={{$release}}"></script>
    <script src="/statics/custom/js/routing/routing_add.js?v={{$release}}"></script>
@endsection

