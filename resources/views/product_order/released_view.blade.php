{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/common/ace/assets/css/fullcalendar.min.css" />
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <input type="hidden" id="fineLine" value="/Schedule/detail">
    <input type="hidden" id="calendarLine" value="/ProductOrder/productOrderReleasedView">
    <div class="div_con_wrapper">
        <div id="wrap" style="max-width: 100%;">
            <div id="all-wrap">

                <div id="calendar-wrap" class="calendar-wrap" style="position: fixed;right: 0;background-color: #fff;">
                    <div id="PO-info">

                    </div>
                    <div class="op-wrap">
                        <button class="btn btn-choose-op" style="top: auto;">选择工序</button>
                    </div>

                    <div class="fineLine" style="right: 121px;">
                        <button class="btn btn-fine-line">细排</button>
                    </div>
                    <div class="calendar" id="calendar"></div>
                </div>
                <div id="wrap">
                    <div class="placeholder"></div>

                    <div id='external-events' style="width: 400px;position: absolute;left: 0;">
                        <h4 id="po_number">当前生产订单</h4>
                        <div class="order-wrap" style="border: 1px solid #c2c2c2;">
                            <table class="order_table sticky uniquetable commontable" style="border-bottom: 0">
                                <thead>
                                <tr>
                                    <th class="text-left">销售<br>订单号</th>
                                    <th class="text-left">产品</th>
                                    <th class="text-left">数量[PCS]</th>
                                    <th class="text-left">废料[%]</th>
                                    <th class="text-left">开始日期<br>结束日期</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td style="border-bottom: 0"><span class="sales_order_code"></span></td>
                                    <td style="border-bottom: 0"><span class="product"></span></td>
                                    <td style="border-bottom: 0"><span class="number"></span></td>
                                    <td style="border-bottom: 0"><span class="scrap"></span></td>
                                    <td style="border-bottom: 0"><span class="start"></span><br><span class="end"></span></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <p class="nodata">暂无数据</p>
                        <div class="table_page">
                            <div class="event-list work-order">
                                <div class="bom-tree"></div>
                            </div>
                            <div id="pagenation" class="pagenation bottom-page"></div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/schedule/aps-url.js?v={{$release}}"></script>
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/common/fullcalendar/lunar.js"></script>
    <script src="/statics/common/fullcalendar/fullcalendar.js"></script>
    <script src="/statics/common/fullcalendar/locale/locale-all.js"></script>
    <script src="/statics/common/echarts/echarts.common.min.js"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/product_order/product_released_view.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>

@endsection

