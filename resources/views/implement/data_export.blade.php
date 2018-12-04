{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/implement/implement.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="implement_wrap">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-item="templateView" class="el-tap active">打开模板</span>
            <span data-item="importView" class="el-tap">数据导入</span>
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">
        <div class="el-panel templateView active">
            <form action="" id="templateView" class="templateContent">

            </form>
        </div>
        <div class="el-panel importView">
            <form action="" id="importView" class="">
                <div class="importContainer">
                   <div class="import-btn el-form-item">
                       <button class="el-button" type="button" id="export_excel">导入</button>
                   </div>
                   <div class="import-top">

                   </div>
                    <div class="import-content">
                        <table id="import_table" class="sticky uniquetable commontable">
                            <thead>
                                <tr>
                                    <th class="left nowrap tight">选择</th>
                                    <th class="left nowrap tight">数据项</th>
                                </tr>
                            </thead>
                            <tbody class="table_tbody">
                                <tr>
                                    <td>
                                        <label class="el-radio">
                                            <span class="el-radio-input">
                                                <span class="el-radio-inner"></span>
                                                <input class="status yes" type="hidden" value="1">
                                            </span>
                                            <span class="el-radio-label"></span>
                                        </label>
                                    </td>
                                    <td>人员导入</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/implement/implement.js?v={{$release}}"></script>
@endsection