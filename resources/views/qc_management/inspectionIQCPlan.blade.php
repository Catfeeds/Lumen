{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">


@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action button_check"><i class="fa fa-plus"></i>添加</button>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">单据编号</label>
                                    <input type="text" id="bin_code" class="el-input" placeholder="单据编号" value="">
                                </div>
                            </div>


                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item" style="width: 100%;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" >到达时间</label>
                                        <span class="el-input span start_time"><span id="start_time_input" lay-key="1"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                        <span class="el-input span end_time"><span id="end_time_input" lay-key="2"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item" style="width: 100%;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" >检验时间</label>
                                        <span class="el-input span start_time"><span id="check_start_time_input" lay-key="1"></span><input type="text" id="check_start_time" placeholder="开始时间" value=""></span>——
                                        <span class="el-input span end_time"><span id="check_end_time_input" lay-key="2"></span><input type="text" id="check_end_time" placeholder="结束时间" value=""></span>
                                    </div>
                                </div>
                            </li>
                        </ul>

                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>

                        <th>
                            <div class="el-sort">
                                单据编号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                供应商
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                物料
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                数量
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                批号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                预计到货时间
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                检验时间
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                备注
                            </div>
                        </th>

                        <th class="right"></th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/qc_inspection/inspection-iqc-plan.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>


@endsection