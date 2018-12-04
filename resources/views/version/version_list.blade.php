{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/storage-initial-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/version/version.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
	<div class="el-form-item verno">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">版本号:</label>
			<span id="sno"></span>
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item time">
         <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 100px;">更新时间:</label>
            <span id="stime"></span>
         </div>
         <p class="errorMessage" style="padding-left: 20px;"></p>
    </div>
    <div class="el-form-item detial">
         <label class="el-form-item-label" style="width: 100px;">更新内容:</label>
         <div>
         <ol id="detial">
         <li>
         </li>
         </ol>
         </div>
    </div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/version/version-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/version/version.js?v={{$release}}"></script>
@endsection

