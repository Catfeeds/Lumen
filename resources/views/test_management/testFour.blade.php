

{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/taskboard/taskboard.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<!-- <script src="/statics/common/vue/vue.js?v={{$release}}"></script> -->
<script src="/statics/common/vue/vue.js"></script>
<!-- <script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script> -->

<div class="div_con_wrapper" id="appss">
    <!-- <div v-text = "message"></div> -->
    <div>
    <div style="display:none">
        <svg>
            <symbol id="wave">
            <path d="M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z"></path>
            <path d="M420,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z"></path>
            <path d="M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z"></path>
            <path d="M140,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z"></path>
            </symbol>
        </svg>
    </div>
        <div class="task-project">
            <span class ="title-font">生产实时看板</span>
            <span class="data-time">2018-07-31 11:15:59</span>
        </div>
        <div class="task-table-card">
            <div class="table-header-title">
                <!-- <div v-for = "items in 10 ">工位</div> -->
                <ul class="table-list" >
                    <li>
                        <div>工位</div>
                        <div>工单号</div>
                        <div>当前工序</div>
                        <div>下道工序</div>
                        <div>实际开始</div>
                        <div>预计结束</div>
                        <div>完工/计划</div>
                        <div class="progress-box" style="padding:0 20px">
                        <div>达成率</div>
                        </div>
                        <div>状态</div>
                    </li>
                </ul>
            </div>
            <div class="table-body" >
                <ul class="table-list" >
                <li  >
                        <div>工位</div>
                        <div>工单号</div>
                        <div>当前工序</div>
                        <div>下道工序</div>
                        <div>实际开始</div>
                        <div>预计结awdaw束</div>
                        <div>完工/asdasdasdasdasddasdasd计划</div>
                        <div class="progress-box">
                            <span class="progress-bar"></span>
                        </div>
                        <div style="color:red">未开始</div>
                        
                    </li>
                <li  >
                        <div>工位</div>
                        <div>工单号</div>
                        <div>当前工序</div>
                        <div>下道工序</div>
                        <div>实际开始</div>
                        <div>预计结awdaw束</div>
                        <div>完工/asdasdasdasdasddasdasd计划</div>
                        <div class="progress-box">
                            <span class="progress-bar">
                                <span class="progress-autobar" style="width:30%"></span>
                                <span class="number-prencent">30%</span>
                            </span>
                        </div>
                        <div style="color:orange">进行中</div>
                    </li>
                <li  >
                        <div>工位</div>
                        <div>工单号</div>
                        <div>当前工序</div>
                        <div>下道工序</div>
                        <div>实际开始</div>
                        <div>预计结awdaw束</div>
                        <div>完工/asdasdasdasdasddasdasd计划</div>
                        <div class="progress-box">
                            <span class="progress-bar">
                                <span class="progress-autobar" style="width:100%"></span>
                                <span class="number-prencent">100%</span>
                            </span> 
                        </div>
                        <div style="color:#85ca46">完成</div>
                    </li>
                    <li v-for="items in 3">
                        <div>工位</div>
                        <div>工单号</div>
                        <div>当前工序</div>
                        <div>下道工序</div>
                        <div>实际开始</div>
                        <div>预计结束</div>
                        <div>完工/计划</div>
                        <div class="progress-box">
                            <span class="progress-bar"></span>
                        </div>
                        <div>状态</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="secend-box">
            <div class="task-table-card card-img">
                <div class="table-header-title color-green">作业完成率</div>
                <div class="img-mask">
                    <div class="left-img">
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" style="transform: translate(0, 5%);">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#fff;text-shadow: 0px 0px 8px #FF0000;">
                                        95%
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img">
                        <ul>
                            <li class="sun-img moon"></li>
                            <li style="color:#fff" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water"  style="transform: translate(0, 65%);">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#f49c05">
                                        35%
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="task-table-card card-img">
                <div class="table-header-title color-green">按时完成率</div>
                <div class="img-mask">
                    <div class="left-img">
                    <ul>
                            <li class="sun-img sun2"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water origin" id="water" style="transform: translate(0, 5%);">
                                        <svg class="water__wave water__wave_back origin" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front origin" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#fff;text-shadow: 0px 0px 8px #FF0000;">
                                        95%
                                    </span>
                                </div>
                            </li>
                        </ul>                        
                    </div>
                    <div class="right-img"  style="background-color:rgb(242, 242, 242)">
                    <ul>
                            <li class="sun-img moon2" ></li>
                            <li style="color:#333" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water blue" id="water"  style="transform: translate(0, 65%);">
                                        <svg class="water__wave water__wave_back blue" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front blue" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#f49c05">
                                        35%
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                </div>
            </div>
            <div class="task-table-card card-table">
                <div class="table-header-title color-origin">
                <ul class="table-list" >
                    <li>
                        <div>工位</div>
                        <div>工单号</div>
                        <div>报警时间</div>
                        <div>报警信息</div>
                        <div>报警状态</div>
                    </li>
                </ul>
                </div>

                <div class="table-body" >
                <ul class="table-list" >
                <li  >
                        <div>工位</div>
                        <div>工单号</div>
                        <div>报警时间</div>
                        <div>报警信息</div>
                        <div style="color:orange">处理中</div>
                    </li>
                <li  >
                        <div>工位</div>
                        <div>工单号</div>
                        <div>报警时间</div>
                        <div>报警信息</div>
                        <div style="color:red">等待处理</div>
                    </li>
                <li  >
                        <div>工位</div>
                        <div>工单号</div>
                        <div>报警时间</div>
                        <div>报警信息</div>
                        <div style="color:orange">处理中</div>
                    </li>
                    <li v-for="items in 3">
                        <div>工位</div>
                        <div>工单号</div>
                        <div>报警时间</div>
                        <div>报警信息</div>
                        <div style="color:red">等待处理</div>
                    </li>
                </ul>
            </div>
            </div>
        </div>
  
    </div>
</div>
@endsection

@section("inline-bottom")
<script>
        var app = new Vue({
            el: '#appss',
            data: {
                message: 'He'
            }
        })
    </script>
<script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>
@endsection


