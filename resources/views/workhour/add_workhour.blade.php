{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/work_hour.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <input type="hidden" id="hour_view" value="/WorkHour/addWorkHour">
    <input type="hidden" id="hourAdd" value="/WorkHour/addWorkHour">
    <div class="work_hours_wrap">
        <div class="div-all-wrap">
            <div class="bom-fake-tree show">
                <div class="bom_tree_container">
                    <div class="bom-tree"></div>
                </div>
            </div>
            <div class="bom_wrap">
                <div class="row">
                    <div class="col-xs-6">
                        <div class="material-code alert alert-info mt-8"></div>
                    </div>
                    <div class="col-xs-6" style="padding-left: 0;">
                        <div class="version-now alert alert-info mt-8"></div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-6">
                        <div class="bom-description alert alert-info"></div>
                    </div>
                    <div class="col-xs-6" style="padding-left: 0;">
                        <div class="factory_code alert alert-info mt-8"></div>
                    </div>
                </div>

                <div class="col-sm-12 widget-container-col ui-sortable" id="widget-container-col-12">
                    <div class="widget-box ui-sortable-handle" id="addWorkHour-box">
                        <div class="widget-header widget-header-small">
                            <div class="widget-toolbar no-border">
                                <ul class="nav nav-tabs" id="myTab">
                                    <li class="active">
                                        <a data-toggle="tab" href="#addWBasic_from" aria-expanded="false">常规</a>
                                    </li>

                                    <li class="">
                                        <a data-toggle="tab" href="#addDesignBom_from" aria-expanded="false">设计bom版本</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="widget-body">
                            <div class="widget-main">
                                <div class="tab-content">
                                    <div id="addWBasic_from" class="tab-pane active">
                                        <div class="route-lists"></div>
                                        <div class="bom_procedure">
                                            <div class="tap-btn-wrap">
                                                <div class="el-tap-wrap"></div>
                                                <div class="gongshi" style="overflow: hidden;">
                                                    <button type="button" id="all_work_hour" class="button" style="float: left; margin-top: 5px;" >显示总工时</button>
                                                    <span class="total_num" style="float: left;padding-top: 10px;padding-left:15px;"></span>
                                                    <div id="show_base_num" style="display: inline-block;">
                                                        <label style="float: left;padding-top: 10px;padding-left:60px;" for="">基础数量：</label>
                                                        <input id="baseQty" style="margin-top: 5px;" min="0" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')"  class="el-input" type="number">
                                                    </div>
                                                    <div id="cure_time" style="display: none;">
                                                        <label style="float: left;padding-top: 10px;padding-left:60px;" for="">熟化时间：</label>
                                                        <input id="cureing_time" style="margin-top: 5px;" min="0" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')"  class="el-input" type="number">
                                                    </div>
                                                    <div class="is_excrete" style="display: none;">
                                                        <label style="padding-top: 10px;padding-left:60px;" for="">是否拆分：</label>
                                                        <div class="el-radio-group" style="display: inline-block;">
                                                            <label class="el-radio">
                                                                <span class="el-radio-input yes">
                                                                    <span class="el-radio-inner"></span>
                                                                    <input class="status yes" type="hidden" value="1">
                                                                </span>
                                                                <span class="el-radio-label">是</span>
                                                            </label>
                                                            <label class="el-radio">
                                                                <span class="el-radio-input no">
                                                                    <span class="el-radio-inner"></span>
                                                                    <input class="status no" type="hidden" value="0">
                                                                </span>
                                                                <span class="el-radio-label">否</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div class="is_excrete"  style="display: none;">
                                                        <label style="float: left;padding-top: 10px;padding-left:60px;" for="">最大拆分数：</label>
                                                        <input id="max_split_point" style="margin-top: 5px;" min="0" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')"  class="el-input" type="number">
                                                    </div>
                                                    <button type="button" id="addBaseQty" style="background-color: #fff;color: #20a0ff;border-color: #20a0ff;" class="button" >确认</button>
                                                </div>
                                            </div>
                                            <div class="el-panel-wrap" style="padding: 10px;min-height: 500px;">
                                                <div class="el-panel active">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="addDesignBom_from" class="tab-pane">
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


                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="clearfix"></div>


            </div>

        </div>

    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/procedure/procedure-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js"></script>
    <script src="/statics/custom/js/procedure/work_hours_add.js?v={{$release}}"></script>
@endsection