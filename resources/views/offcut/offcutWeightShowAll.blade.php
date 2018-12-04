<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <title>称重</title>

    <meta name="description" content="overview &amp; stats" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    {{--icon--}}
    <link rel="shortcut icon" href="../../../statics/custom/img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="../../../statics/custom/css/offcutWeight/offcutWeight.css?v={{$release}}" />




</head>

<body >




<div>
    <div style="display: flex">
        <div style="flex: 7;">
            <div>
                <div style="display: flex;flex-direction: row;">
                    <div style="flex: 1;height: 100px;text-align: center;line-height: 100px;background-color: #f2f4f8;">边角料类型</div>
                    <div style="flex: 6" id="offcut_type"></div>
                </div>
                <div style="display: flex;flex-direction: row;margin-top: 10px;">
                    <div style="flex: 1;height: 100px;text-align: center;line-height: 100px;background-color: #f2f4f8;">边角料</div>
                    <div style="flex: 6" id="offcun_from"></div>
                </div>
            </div>
        </div>
        <div style="flex: 1;">
            <div>
                <div id="choose_factory" style="width: 100px;height: 100px;margin: 10px auto;border: 1px solid #cccccc;background-color: #e50220; border-radius: 3px; color:white;cursor: pointer;text-align: center;padding: 5px;overflow: hidden">请选着工厂</div>
            </div>
        </div>
    </div>
    <div id="showOldWeight" style="position: fixed;left: 10px;top:335px;width: 100px;height: 100px;display: inline-block;color: white;text-align: center;line-height: 100px;"></div>
    <div style="display: flex;flex-direction: row;">
        <div style="flex: 1;text-align: center;vertical-align: middle;position:relative;">
            <input type="text" id="weight">
            <br>
            <button class="submit_offcut"  id="submit">提交</button>
        </div>
        <div style="flex: 1" class="left_table">

            <div class="table_center">
                <table>
                    <tr>
                        <td data-id="1">1</td>
                        <td data-id="2">2</td>
                        <td data-id="3">3</td>
                    </tr>
                    <tr>
                        <td data-id="4">4</td>
                        <td data-id="5">5</td>
                        <td data-id="6">6</td>
                    </tr>
                    <tr>
                        <td data-id="7">7</td>
                        <td data-id="8">8</td>
                        <td data-id="9">9</td>
                    </tr>
                    <tr>
                        <td data-id="0">0</td>
                        <td data-id="10">.</td>
                        <td data-id="11"><-</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="../../../statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
<script src="../../../statics/custom/js/offcut/offcutWeightOld.js"></script>
<script src="../../../statics/common/layer/layer.js"></script>

<!-- 自定义的公共js -->
<script type="text/javascript" src="../../../statics/custom/js/functions.js?v={{$release}}"></script>{{-- 自定义的公共函数 --}}
<script src="../../../statics/custom/js/custom-public.js?v={{$release}}"></script>{{-- 自定义公共js文件 --}}
<script src="../../../statics/custom/js/ajax-client.js?v={{$release}}"></script> {{-- 包围函数封装的 AjaxClient --}}

<script src="../../../statics/custom/js/offcut/offcut_url.js?v={{$release}}"></script>

</body>
</html>
