{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-item="CoarseProduct_from" class="el-tap active">粗排产</span>
            <span data-item="CoarseStatus_from" class="el-tap">粗排产状态</span>
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel CoarseProduct_from active">
            <form id="CoarseProduct_from" class="formTemplate formBom normal">
                <div class="table_page">
                    <div class="wrap_table_div">
                        <table id="work_task_table" class="sticky uniquetable commontable">
                            <thead>
                                <tr>
                                    <th class="left nowrap tight">工艺单</th>
                                    <th class="left nowrap tight">生产订单</th>
                                    <th class="left nowrap tight">产品</th>
                                    <th class="left nowrap tight">工序</th>
                                    <th class="left nowrap tight">当前状态</th>
                                    <th class="left nowrap tight">开始日期</th>
                                    <th class="left nowrap tight">结束日期</th>
                                    <th class="left nowrap tight">车间</th>
                                    <th class="left nowrap tight">排产时间</th>
                                    <th class="left nowrap tight">提前天数</th>
                                    <th class="left nowrap tight">延迟天数</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                            </thead>
                            <tbody class="table_tbody">
                                <tr>
                                    <td>OO000013053</td>
                                    <td>PO0007219</td>
                                    <td>T恤 (BPT4-CPC-0005)</td>
                                    <td></td>
                                    <td>新建</td>
                                    <td>2018-02-09</td>
                                    <td>2018-02-12</td>
                                    <td></td>
                                    <td>2018-02-08 09:58</td>
                                    <td></td>
                                    <td></td>
                                    <td class="right">
                                        <a class="link_button" style="border: none;padding: 0;" href="http://192.168.1.110:999/WorkTask/workTaskView"><button type="button" class="button pop-button">查看</button></a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="coarse_pagenation" class="pagenation bottom-page"></div>
                </div>
            </form>
        </div>

        <div class="el-panel CoarseStatus_from">
            <form id="CoarseStatus_from" class="formTemplate formBom normal">
                <div class="table_page">
                    <div class="wrap_table_div">
                        <table id="status_task_table" class="sticky uniquetable commontable">
                            <thead>
                            <tr>
                                <th class="left nowrap tight">工艺单</th>
                                <th class="left nowrap tight">生产订单</th>
                                <th class="left nowrap tight">产品</th>
                                <th class="left nowrap tight">工序</th>
                                <th class="left nowrap tight">当前状态</th>
                                <th class="left nowrap tight">开始日期</th>
                                <th class="left nowrap tight">结束日期</th>
                                <th class="right nowrap tight">操作</th>
                            </tr>
                            </thead>
                            <tbody class="table_tbody">
                            <tr>
                                <td>OO000013053</td>
                                <td>PO0007219</td>
                                <td>T恤 (BPT4-CPC-0005)</td>
                                <td></td>
                                <td>新建</td>
                                <td>2018-02-09</td>
                                <td>2018-02-12</td>
                                <td class="right">
                                    <a href=""><button class="button pop-button" type="button">查看</button></a>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="coarse_status_pagenation" class="pagenation bottom-page"></div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/work_task.js?v={{$release}}"></script>
@endsection