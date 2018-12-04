{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="searchItem" id="searchForm">
        <form class="searchInve searchModal formModal" id="searchInve_from">
          <div class="el-item">
            <div class="el-item-show">
                <div class="el-item-align">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                            <input type="text" id="sale_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                        </div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label"style="width: 100px;">生产订单号</label>
                            <input type="text" id="po_number" class="el-input" placeholder="请输入生产订单号" value="">
                        </div>
                    </div>

                </div>
                <ul class="el-item-hide">
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                                <input type="text" id="material_item_no" class="el-input" placeholder="请输入物料编码" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料名称</label>
                                <input type="text" id="material_name" class="el-input" placeholder="请输入物料名称" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">厂区</label>
                                <input type="text" id="plant_name" class="el-input" placeholder="请输入厂区" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">仓库</label>
                                <input type="text" id="depot_name" class="el-input" placeholder="请输入仓库" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">分区</label>
                                <input type="text" id="subarea_name" class="el-input" placeholder="请输入分区" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">仓位</label>
                                <input type="text" id="bin_name" class="el-input" placeholder="请输入仓位" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label"style="width: 100px;">工单号</label>
                                <input type="text" id="wo_number" class="el-input" placeholder="请输入工单号" value="">
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
    <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
        <table id="table_inventory_table" class="sticky uniquetable commontable">
            <thead>
                <tr>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap">销售订单号</th>
                    <th class="left nowrap">生产订单号</th>
                    <th class="left nowrap">工单号</th>
                    <th class="left nowrap">物料编码</th>
                    <th class="left nowrap">物料名称</th>
                    <th class="left nowrap">数量</th>
                    <th class="left nowrap">单位</th>
                    <th class="left nowrap">批次号</th>
                    <th class="left nowrap">厂区</th>
                    <th class="left nowrap">仓库</th>
                    <th class="left nowrap">分区</th>
                    <th class="left nowrap">仓位</th>
                    <th class="left nowrap">锁状态</th>
                    <th class="left nowrap">库龄</th>
                    <th class="left nowrap">所有者</th>
                    <th class="right nowrap"></th>
                </tr>
            </thead>
            <tbody class="table_tbody">
            </tbody>
        </table>
    </div>
    <div id="pagenation" class="pagenation bottom-page"></div>
</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-inventory.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
@endsection