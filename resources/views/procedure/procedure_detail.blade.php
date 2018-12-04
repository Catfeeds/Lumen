
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/routing/routing.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="tap-btn-wrap">
            <div class="el-tap-wrap edit">
                <span data-item="routeCommon" class="el-tap">常规</span>
                <span data-item="routeProcedure" class="el-tap active">工序</span>
            </div>
        </div>

        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="el-panel routeCommon">
                <form id="route_basic_form" class="formTemplate basicForm">
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">编码<span class="mustItem">*</span></label>
                                <input type="text" id="code" class="el-input" placeholder="请输入编码" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">名称<span class="mustItem">*</span></label>
                                <input type="text" id="name" class="el-input" placeholder="请输入名称" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">描述</label>
                                <textarea type="textarea" maxlength="500" readonly id="description" rows="5" class="el-textarea" placeholder="请输入描述，最多能输入500个字符"></textarea>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>
                </form>
            </div>
            <div class="el-panel routeProcedure active">
                <div class="route_container">
                    <div class="route_wrap"></div>
                </div>
                <div class="route_line">
                    <div id="routing_graph" class="routing_graph"></div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/routing/routing-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/schedule/routing.js?v={{$release}}"></script>
    <script src="/statics/custom/js/routing/routing-view.js?v={{$release}}"></script>
@endsection

