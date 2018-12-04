{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">

        <div class="actions">
            <h3 class="button button_action button_check" id="title">添加维保经验</h3>
            <div class="el-form-item ">
                <div class="el-form-item-div btn-group">
                    <button type="button" id="save" class="el-button el-button--primary submit">保存</button>
                </div>
            </div>
        </div>
        <div style="display: flex;flex-direction: row;flex-wrap: nowrap;">
            <div style="flex: 2;border: 1px solid #ccc;margin: 10px 20px;">
                <form class="formModal formExperience formTemplate" id="addExperience_from">
                    <input type="hidden" id="itemId" value="">

                    <div class="el-form-item">
                        <div class="el-form-item-div" id="experience">
                            <label class="el-form-item-label" style="width: 100px;">经验类别<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap experience_wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" id="experience_type_name" value="维修经验">
                                    <input type="hidden" class="val_id" id="experience_type" value="0">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="0" data-pid="0" data-code="" data-name="" class=" el-select-dropdown-item">维修经验</li>
                                        <li data-id="1" data-pid="1" data-code="" data-name="" class=" el-select-dropdown-item">保养经验</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" id="device">
                            <label class="el-form-item-label" style="width: 100px;">设备名称</label>
                            <div class="el-select-dropdown-wrap device_wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" id="device_name" value="--请选择--">
                                    <input type="hidden" class="val_id" id="device_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 100px;"></p>
                    </div>


                    <div class="el-form-item">
                        <div class="el-form-item-div" id="deviceType">
                            <label class="el-form-item-label" style="width: 100px;">设备类别</label>
                            <div class="el-select-dropdown-wrap deviceType_wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" id="deviceType_name" value="--请选择--">
                                    <input type="hidden" class="val_id" id="deviceType_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 100px;"></p>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div" id="faultType">
                            <label class="el-form-item-label" style="width: 100px;">故障类别</label>
                            <div class="el-select-dropdown-wrap faultType_wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" id="faultType_name" value="--请选择--">
                                    <input type="hidden" class="val_id" id="faultType_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 100px;"></p>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">故障描述</label>
                            <textarea type="textarea"  maxlength="500" id="fault_remark" rows="5" class="el-textarea" placeholder=""></textarea>
                        </div>
                        <p class="errorMessage" style="display: block;"></p>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div" id="repairRange">
                            <label class="el-form-item-label" style="width: 100px;">维修级别</label>
                            <div class="el-select-dropdown-wrap repairRange_wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" id="repairRange_name" value="--请选择--">
                                    <input type="hidden" class="val_id" id="repairRange_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 100px;"></p>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">维修描述</label>
                            <textarea type="textarea"  maxlength="500" id="repair_remark" rows="5" class="el-textarea" placeholder=""></textarea>
                        </div>
                        <p class="errorMessage" style="display: block;"></p>
                    </div>


                </form>
            </div>
            <div style="flex: 3;border: 1px solid #ccc;margin: 10px 20px;padding: 10px;">
                <div class="procedure_ability_value">
                    <button class="button" id="addSpareParts">添加备件</button>
                    <div class="inputOperationValue_table">
                        <table class="info_table">
                            <thead>
                            <tr class="th_table_tbody">
                                <th class="thead">名称</th>
                                <th class="thead">编号</th>
                                <th class="thead">规格型号</th>
                                <th class="thead">删除</th>
                            </tr>
                            </thead>
                            <tbody class="table_tbody">

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/device/upkee-experience-add.js?v={{$release}}"></script>
@endsection