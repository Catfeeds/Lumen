{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="searchItem" id="searchForm">
        <form class="searchSTin searchModal formModal" id="searchSTallo_from">
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
                                <label class="el-form-item-label" style="width: 100px;">工厂</label>
                                <input type="text" id="plant" class="el-input" placeholder="请输入工厂" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">仓库</label>
                                <input type="text" id="depot" class="el-input" placeholder="请输入仓库" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">分区</label>
                                <input type="text" id="subarea" class="el-input" placeholder="请输入分区" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">仓位</label>
                                <input type="text" id="bin" class="el-input" placeholder="请输入仓位" value="">
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">开始时间</label>
                                <input type="text" id="startTime" class="el-input" placeholder="请输入开始时间" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">结束时间</label>
                                <input type="text" id="endTime" class="el-input" placeholder="请输入创建人" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item owner">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">所属者</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="ownerval" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="owner_id" value="">
                                    </div>
                                    <div class="el-select-dropdown" style="">
                                        <ul class="el-select-dropdown-list">
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 20px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料名称</label>
                                <input type="text" id="material" class="el-input" placeholder="请输入物料名称" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料编号</label>
                                <input type="text" id="material_no" class="el-input" placeholder="请输入物料编号" value="">
                            </div>
                        </div>
                        <div class="el-form-item category">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">入库类别</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="unitval" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="category" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class=" el-select-dropdown-item kong">--请选择--</li>
                                        </ul>
                                    </div>
                                </div>
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
            <table id="table_otherinstore_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight"></th>
                        <th class="left nowrap">销售订单号</th>
                        <th class="left nowrap">生产订单号</th>
                        <th class="left nowrap">工单号</th>
                        <th class="left nowrap">入库时间</th>
                        <th class="left nowrap">入库类型</th>
                        <th class="left nowrap">物料编号</th>
                        <th class="left nowrap">物料名称</th>
                        <th class="left nowrap">批次</th>
                        <th class="left nowrap">单位</th>
                        <th class="left nowrap">数量</th>
                        <th class="left nowrap">厂区</th>
                        <th class="left nowrap">仓库</th>
                        <th class="left nowrap">分区</th>
                        <th class="left nowrap">仓位</th>
                        <th class="left nowrap">所属者</th>
                        <th class="left nowrap">锁状态</th>
                        <th class="left nowrap">描述</th>
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
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/storage/storage-instore.js?v={{$release}}"></script>
    <script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/validate.js?v={{$release}}"></script>
@endsection