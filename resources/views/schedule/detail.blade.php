
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link rel="stylesheet" href="/statics/common/gantt/Gantt.css?v={{$release}}" />
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div class="thinProduction_wrap">
		<div class="thinCalendar">
			<div class="searchItem" id="searchForm" style='height:70px;background:#FAFBFC;border-radius: 3px;box-shadow: #e0e0e0 0px 0px 20px 1px;'>
				<form class="searchAttr searchModal formModal" id="searchOrderAttr_from">
					<div class="el-item-align">
						<div class="el-form-item-div" >
							<div class="el-form-item production_no" style="margin:0px;height:60px;">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 80px;">生产单号<span class="mustItem"></span></label>
									<input type="text" class="el-input" id="production_order_no" value="" placeholder="请输入生产单号" style="width: 200px;">
								</div>
								<p class="errorMessage" style="padding-left: 80px;"></p>
							</div>
							<div class="el-form-item operation_no" style="margin:0px;height:60px;">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 80px;">工单号<span class="mustItem"></span></label>
									<input type="text" class="el-input" id="operation_order_no" value="" placeholder="请输入工单号" style="width: 200px;">
								</div>
								<p class="errorMessage" style="padding-left: 80px;"></p>
							</div>
							<div class="el-form-item search_date" style="margin:0px;height:60px;">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 60px;">日期<span class="mustItem">*</span></label>
									<input type="text" class="el-input" id="search_date" autocomplete="off" value="" placeholder="请选择日期" style="width: 100px;">
								</div>
								<p class="errorMessage" style="padding-left: 60px;"></p>
							</div>
							<div class="el-form-item searchWo" style="margin:0px;height:60px;">
								<div class="el-form-item-div" style="padding-left:60px;">
									<button type="button" class="el-button el-button--primary submit searchWo-submit">工单搜索</button>
									<!-- <span class="errorMessage" style="margin-top: 5px;"></span> -->
								</div>
							</div>
						</div>
					</div>
				</form>
			</div>
			<div class="wrap" style="height:auto;margin-top:20px;display:flex;">
				<div class="work-order-content" style="width:335px;margin-right:20px;background:#FAFBFC;border-radius: 3px;box-shadow: #e0e0e0 0px 0px 20px 1px;">
					<div class="work-order" style="height:35px;font-size:18px;margin-bottom:5px;line-height:35px;width:100%;border-radius: 3px;color: #119BE7;overflow:hidden;">
						<span>工单列表</span>
					</div>
					<div class="work-order-wrap" style="margin-left:10px;">暂无数据</div>
				</div>
				<div class="gantt-div-wrap" style="background:#FAFBFC;border-radius: 3px;box-shadow: #e0e0e0 0px 0px 20px 1px;">
					<div class="workcenter" style="width:100%;height:70px;border-radius: 3px;color: #119BE7;display:flex;">
						<div style="width:200px;font-size:18px;margin-left:10px;height:35px;line-height:35px;display:flex;"><span>工作中心: </span><div id="work-center-name" style="width:120px;padding-left: 10px;"></div></div>
						<div id="work-center-rank-plan"></div>
						<input type="hidden" class="el-input" id="work-center-id" value="">
					</div>
					<div class="GanttWrap"><span style="margin-left:10px;">暂无数据</span></div>
				</div>
			</div>
		</div>
	</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/schedule/aps-url.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/gantt/Gantt_fineLine.js?v={{$release}}"></script>
<script src="/statics/custom/js/schedule/fine-line.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>

@endsection
