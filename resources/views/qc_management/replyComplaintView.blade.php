{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div-all-wrap">
        <div class="bom_wrap">
            <div class="tap-btn-wrap">
                <div class="el-tap-wrap" style="display: block">
                    <span data-item="viewAlready_from" class="el-tap">查看已回复</span>
                    <span data-item="reply_from" class="el-tap active">当前要回复</span>
                </div>

            </div>


            <div class="el-panel-wrap" style="margin-top: 20px;">
                <!--查看已回复 start-->
                <div class="el-panel viewAlready_from">
                    <form id="viewAlready_from" class="formTemplate formBom normal">

                        <div class="div_con_wrapper" id="already">

                        </div>

                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button next" style="display: block" data-next="reply_from">下一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--查看已回复 end-->

                <!--当前要回复 start-->
                <div class="el-panel reply_from active">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit save">保存</button>
                        </div>
                    </div>
                    <form id="reply_from" class="formTemplate formPlan normal">
                        <div class="div_con_wrapper" id="replyNow">

                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="viewAlready_from">上一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--当前要回复 end-->
            </div>
        </div>
    </div>


@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/complaint/reply_complaint_view.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>

@endsection