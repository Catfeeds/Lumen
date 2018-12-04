{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div-all-wrap">
        <div class="bom_wrap">
            <div class="tap-btn-wrap">
                <div class="el-tap-wrap" style="display: block">
                    <span data-item="addBBasic_from" class="el-tap active">常规</span>
                    <span data-item="addDocument_from" class="el-tap submit_plan">关联文档</span>
                    <span data-item="addImagen_form" id="show_addPlan_form" class="el-tap submit_plan">图片</span>
                </div>

            </div>


            <div class="el-panel-wrap" style="margin-top: 20px;">
                <!--常规 start-->
                <div class="el-panel addBBasic_from active">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit basic_save">保存</button>
                        </div>
                    </div>
                    <div id="addBBasic_from" class="formTemplate formBom normal">
                        <div style="width: 800px; padding: 20px;margin-top: 20px;">
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">设备</label>
                                    <div class="el-select-dropdown-wrap">
                                        <input type="text" id="device" class="el-input" autocomplete="off" placeholder="设备" value="">
                                    </div>
                                </div>

                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div" id="repairRange">
                                    <label class="el-form-item-label" style="width: 100px;">故障等级</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="faulty_range" value="">
                                        </div>
                                        <div class="el-select-dropdown repairRange_wrap">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="el-form-item"  style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div" id="faultyType">
                                    <label class="el-form-item-label" style="width: 100px;">故障类别</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="faulty_type" value="">
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="el-form-item provider" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">维修班组</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="provider_view" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="repair_group" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div" id="priority">
                                    <label class="el-form-item-label" style="width: 100px;">紧急程度</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="priority_rang" value="">
                                        </div>
                                        <div class="el-select-dropdown priority_wrap">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>



                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">发生时间</label>
                                    <input type="text" id="happen_date" readonly  data-name="发生时间" class="el-input" placeholder="发生时间" >
                                </div>
                            </div>

                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">操作人</label>
                                    <div class="el-select-dropdown-wrap">
                                        <input type="text" id="employee" class="el-input" autocomplete="off" placeholder="操作人" value="">
                                    </div>
                                </div>

                            </div>

                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">描述</label>
                                    <textarea type="textarea"  maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="描述"></textarea>
                                </div>
                            </div>

                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" id="submit_plan" class="el-button next" style="display: block" data-next="addDocument_from">下一步</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!--常规 end-->
                <!--关联文档 start-->
                <div class="el-panel addDocument_from">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit document_save">保存</button>
                        </div>
                    </div>
                    <form id="addDocument_from" class="formTemplate formBom normal">

                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="addBBasic_from">上一步</button>
                                <button type="button" class="el-button next" style="display: block" data-next="addImagen_form">下一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--关联文档 end-->
                <!--关联图片 start-->
                <div class="el-panel addImagen_form">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit image_save">保存</button>
                        </div>
                    </div>
                    <form id="addImagen_form" class="formTemplate formPlan normal">

                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="addDocument_from">上一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--关联图片 end-->
            </div>
        </div>
    </div>


@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/device/device-repairs-item.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>


@endsection