{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link rel="stylesheet" href="/statics/common/ace/assets/css/fullcalendar.min.css" />
<link rel="stylesheet" href="/statics/common/gantt/Gantt.css?v={{$release}}" />
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="fineLine" value="/Schedule/detail">
<input type="hidden" id="calendarLine" value="/Schedule/master">
<div class="div_con_wrapper">
	<div id="all-wrap">
		<div class="calendar-wrap">
			<div class="op-wrap">
				<button class="btn btn-choose-op">选择工序</button>
			</div>
			<div class="lookOrder">
				<button class="btn btn-look-order">查看排产进度</button>
			</div>
			<div class="fineLine">
				<button class="btn btn-fine-line">细排</button>
			</div>
			<div class="full-screen">
				<!-- <button class="btn btn-full-screen" title="按esc可退出全屏">全屏</button> -->
				<button class="btn btn-full-screen">最大化</button>
			</div>
			<div class="calendar" id="calendar"></div>
		</div>
		<div id="wrap">
			<div class="placeholder"></div>
			<div id='external-events'>
		      <h4>待选工单</h4>
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
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/schedule/aps-url.js?v={{$release}}"></script>
<script src="/statics/common/ace/assets/js/moment.min.js"></script>
<script src="/statics/common/fullcalendar/lunar.js"></script>
<script src="/statics/common/fullcalendar/fullcalendar.js"></script>
<script src="/statics/common/fullcalendar/locale/locale-all.js"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/echarts/echarts.common.min.js"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/gantt/Gantt_order.js?v={{$release}}"></script>
<script src="/statics/custom/js/schedule/calendar.js?v={{$release}}"></script>
@endsection

