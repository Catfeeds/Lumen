{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/split.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div id="wrap">
	    <div class="left">
			<div class="work-order">
		    </div>
		    <div class="more-btn"><button class="more el-button po-more">加载更多...</button></div>
	    </div>
	    <div class="right">
	    	<div class="order-wrap">
				<p>产品: <span class="product"></span></p>
				<p>数量：<span class="number"></span></p>
				<p>废料[%]：<span class="scrap"></span></p>
				<p>开始日期：<span class="start"></span></p>
				<p>结束日期：<span class="end"></span></p>
	    	</div>
	    	<div class="wt-wrap">
	    		<div class="wts-wrap">
					<div class="el-radio-group">
						<label class="el-radio">
							<span class="el-radio-input">
								<span class="el-radio-inner"></span>
								<input class="status yes" type="hidden" value="1">
							</span>
							<span class="el-radio-label">相同数量</span>
						</label>
						<label class="el-radio">
							<span class="el-radio-input">
								<span class="el-radio-inner"></span>
								<input class="status no" type="hidden" value="0">
							</span>
							<span class="el-radio-label">不同数量</span>
						</label>
						<div class="tipinfo">
							<i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i>
							<span class="tip">相同数量是指拆的每个工单数量相同<br/>不同数量是指工单数量不全相同<i></i></span>
						</div>
					</div> 
					<div class="wts"></div>
					<div class="more-btn"><button class="more el-button wt-more">加载更多...</button></div>
	    		</div>
				<div class="split-wrap">
					<div class="action">
						<div class="equal">
							<input type="number" class="el-input" id="wt-input" onkeyup="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}else{this.value=this.value.replace(/\D/g,'')}" onafterpaste="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}else{this.value=this.value.replace(/\D/g,'')}" placeholder="请输入数量">
							<button class="el-button el-button--primary split">拆</button>
							<p class="info"></p>
						</div>  
					</div>
					<div class="wo-wrap"></div>
					<div class="action2">
						<div class="el-form-item">
							<div class="el-form-item-div">
								<button class="el-button split-again">重拆</button>
								<button class="el-button el-button--primary split-submit">确认</button>
							</div>
						</div>
					</div>
				</div>
	    	</div>
	    </div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/schedule/aps-url.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/schedule/split.js?v={{$release}}"></script>
@endsection

