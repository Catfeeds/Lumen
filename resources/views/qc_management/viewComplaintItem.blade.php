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
                    <span data-item="addMaterial_from" class="el-tap">物料</span>
                    <span data-item="addPlan_form" class="el-tap none">紧急处置计划</span>
                </div>
            </div>


            <div class="el-panel-wrap" style="margin-top: 20px;">
                <!--常规 start-->
                <div class="el-panel addBBasic_from active">
                    <form id="addBBasic_from" class="formTemplate formBom normal">
                        <div style="width: 800px; padding: 20px;margin-top: 20px;">
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">客户名</label>
                                    <input type="text" id="customer_name" readonly  data-name="客户名" class="el-input" placeholder="客户名" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">客诉单号<span class="mustItem">*</span></label>
                                    <input type="text" id="complaint_code" readonly  data-name="客诉单号" class="el-input" placeholder="客诉单号" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">单号类型</label>
                                    <li class="tg-list-item" style="width: 200px;">
                                        <input class="tgl tgl-flip" disabled="disabled" readonly id="number_type" type="checkbox" >
                                        <label class="tgl-btn" data-tg-off="生产单号" data-tg-on="物料名称" style="display: inline-block;width: 100px;" for="number_type"></label>
                                    </li>
                                </div>
                            </div>
                            <div class="el-form-item" id="material_toggle" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">生产单号</label>
                                    <div class="el-select-dropdown-wrap">
                                        <input type="text" id="po_number" readonly class="el-input" autocomplete="off" placeholder="生产单号" value="">
                                    </div>
                                </div>

                            </div>
                            <div class="el-form-item" id="po_toggle" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料名称</label>
                                    <div class="el-select-dropdown-wrap">
                                        <input type="text" id="material_number" readonly class="el-input" autocomplete="off" placeholder="物料名称" value="">
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">接収日期</label>
                                    <input type="text" id="received_date" readonly  data-name="接収日期" class="el-input" placeholder="接収日期" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">不良品接収日期</label>
                                    <input type="text" id="samples_received_date" readonly  data-name="不良品接収日期" class="el-input" placeholder="不良品接収日期" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">缺陷比</label>
                                    <input type="text" id="defect_rate"   data-name="缺陷比" readonly class="el-input" placeholder="缺陷比" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">批次</label>
                                    <input type="number" min="0" id="defect_material_batch"   data-name="批次" class="el-input" placeholder="批次" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">拒收数量</label>
                                    <input type="number" min="0" id="defect_material_rejection_num"   data-name="拒收数量" class="el-input" placeholder="拒收数量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">描述</label>
                                    <textarea type="textarea"  maxlength="500" readonly id="defect_description" rows="5" class="el-textarea" placeholder="描述"></textarea>
                                </div>
                            </div>

                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button next" style="display: block" data-next="addMaterial_from">下一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--常规 end-->
                <!--物料 start-->
                <div class="el-panel addMaterial_from">
                    <form id="addMaterial_from" class="formTemplate formBom normal">
                        <div class="div_con_wrapper">

                            <div class="table_page">
                                <div class="wrap_table_div">
                                    <table id="table_attr_table" class="sticky uniquetable commontable">
                                        <thead>
                                        <tr>
                                            <th>
                                                <div class="el-sort">
                                                    物料编号
                                                </div>
                                            </th>
                                            <th>
                                                <div class="el-sort">
                                                    物料信息
                                                </div>
                                            </th>

                                            <th>
                                                <div class="el-sort">
                                                    问题描述
                                                </div>
                                            </th>
                                            <th>
                                                <div class="el-sort">
                                                    缺陷图
                                                </div>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody class="table_tbody">
                                        <tr>
                                            <td colspan="4" style="text-align: center;">暂无数据</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div id="pagenation" class="pagenation bottom-page"></div>
                            </div>
                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="addBBasic_from">上一步</button>
                                <button type="button" class="el-button next" style="display: block" data-next="addPlan_form">下一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--物料 end-->
                <!--紧急处置计划 start-->
                <div class="el-panel addPlan_form">
                    <form id="addPlan_form" class="formTemplate formPlan normal">
                        <div style="width: 800px; padding: 20px;margin-top: 20px;">
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">是否有库存品</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light" disabled="disabled"  id="stock" type="checkbox" />
                                            <label class="tgl-btn" for="stock"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">库存数量</label>
                                    <input type="number" min="0" id="stock_num"  readonly data-name="库存数量" class="el-input" placeholder="库存数量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">库存质量</label>
                                    <input type="text" id="stock_quality" readonly  data-name="库存质量" class="el-input" placeholder="库存质量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">库存是否要隔离标志</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light" disabled="disabled"  id="stock_flag" type="checkbox"/>
                                            <label class="tgl-btn" for="stock_flag"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">是否在制品</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light" disabled="disabled"  id="wip" type="checkbox"/>
                                            <label class="tgl-btn" for="wip"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">在制品数量</label>
                                    <input type="number" min="0" id="wip_num" readonly  data-name="在制品数量" class="el-input" placeholder="在制品数量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">在制品质量</label>
                                    <input type="text" id="wip_quality" readonly  data-name="在制品质量" class="el-input" placeholder="在制品质量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">在制品是否要隔离标志</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light" disabled="disabled"  id="wip_flag" type="checkbox"/>
                                            <label class="tgl-btn" for="wip_flag"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">是否客户库存品</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light" disabled="disabled"  id="customer_stock" type="checkbox"/>
                                            <label class="tgl-btn" for="customer_stock"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">客户库存数量</label>
                                    <input type="number" min="0" id="customer_stock_num" readonly  data-name="客户库存数量" class="el-input" placeholder="客户库存数量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">客户库存质量</label>
                                    <input type="text" id="customer_stock_quality" readonly  data-name="客户库存质量" class="el-input" placeholder="客户库存质量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">客户退货品处理</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="rejected_handle" value="">
                                        </div>

                                    </div>

                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">造成的影响</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="rejected_effect" value="">
                                        </div>

                                    </div>

                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">赔偿金额</label>
                                    <input type="number" min="0" id="pay_for_rejected" readonly  data-name="赔偿金额" class="el-input" placeholder="赔偿金额" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">运费成本</label>
                                    <input type="number" min="0" id="pay_for_travel" readonly  data-name="运费成本" class="el-input" placeholder="运费成本" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">其他费用</label>
                                    <input type="number" min="0" id="pay_for_other" readonly  data-name="其他费用" class="el-input" placeholder="其他费用" >
                                </div>
                            </div>


                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">还能维持生产到哪天</label>
                                    <input type="text" id="customer_stock_time" readonly  data-name="还能维持生产到哪天" class="el-input" placeholder="还能维持生产到哪天" >
                                </div>
                            </div>

                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">有无运货要求</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light" disabled="disabled"  id="cd" type="checkbox"/>
                                            <label class="tgl-btn" for="cd"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>


                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">计划送货时间</label>
                                    <input type="text" id="next_shipment_schedule_time" readonly  data-name="计划送货时间" class="el-input" placeholder="计划送货时间" >
                                </div>
                            </div>

                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">送货数量</label>
                                    <input type="number" min="0" id="next_shipment_schedule_num" readonly  data-name="送货数量" class="el-input" placeholder="送货数量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">原定交期能否核时完成</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light" disabled="disabled"  id="next_shipment_schedule_flag" type="checkbox"/>
                                            <label class="tgl-btn" for="next_shipment_schedule_flag"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="addMaterial_from">上一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--紧急处置计划 end-->
            </div>
        </div>
    </div>


@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/complaint/qc-view-complaint-item.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>


@endsection