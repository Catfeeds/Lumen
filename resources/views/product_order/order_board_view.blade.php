

{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/taskboard/taskboard.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<!-- <script src="/statics/common/vue/vue.js?v={{$release}}"></script> -->
<script src="/statics/common/vue/vue.js?v={{$release}}"></script>
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
            <div class="task-title"><span class ="title-font">生产实时看板</span></div>
            <div class="task-time"><span class="data-time" v-text="this.date"></span></div>
        </div>
        <div class="task-table-card">
            <div class="table-header-title">
                <!-- <div v-for = "items in 10 ">工位</div> -->
                <ul class="table-list" v-on:click="getWorkorderDetail">
                    <li>
                        <div>工位</div>
                        <div>工单号</div>
                        <div>当前工序</div>
                        <div>预计开始</div>
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
                <ul class="table-list" v-if="orders.length">
                    <li v-for="item in orders">
                        <div :title="item.workbench_name" class="station"><span v-text="item.workbench_name">工位</span></div>
                        <div class="work-order"><span v-text="item.number">工单号</span></div>
                        <div class="current-process"><span v-text="item.operation_name">当前工序</span></div>
                        <div class="start-time"><span v-text="item.predict_start_time">预计开始</span></div>
                        <div class="expectEnd"><span v-text="item.predict_end_time">预计结束</span></div>
                        <div><span class="work-order" v-if="item.complete ==0">计划</span><span v-else-if="item.complete ==1">完工</div>
                        <div class="progress-box">
                            <span class="progress-bar">
                                <span class="progress-autobar" :style="{width: (item.complete_percent) + '%'}"></span>
                                <span class="number-prencent" v-text="item.complete_percent+'%'"></span>
                            </span>
                        </div>
                        <div class="order-status"><span v-if="item.status ==0">未开始</span><span v-else-if="item.status==1">进行中</span></div>
                    </li>
                </ul>
                <!-- <ul v-else>
                    <li style="text-align:center;font-size:12px;height:40px;line-height:40px;">暂无数据</li>
                </ul> -->
            </div>
        </div>
        <div class="secend-box">
            <div class="task-table-card card-img">
                <div class="table-header-title color-green">作业完成率</div>
                <div class="img-mask">
                    <div class="left-img" v-if="dayShift!=undefined">
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" :style="{transform: 'translate(0,'+(100-dayShift.rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#fff;text-shadow: 0px 0px 8px #FF0000;" v-text="dayShift.rank_complete_percent+'%'">
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="left-img" v-else>
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" style="transform: translate(0,100%);">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img" v-if="nightShift!=undefined">
                        <ul>
                            <li class="sun-img moon"></li>
                            <li style="color:#fff" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water"  :style="{transform: 'translate(0,'+(100-nightShift.rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#f49c05" v-text="nightShift.rank_complete_percent+'%'">
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img" v-else>
                        <ul>
                            <li class="sun-img moon"></li>
                            <li style="color:#fff" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water"  style="transform: translate(0,100%)">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
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
                    <div class="left-img" v-if="dayShift!=undefined">
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" :style="{transform: 'translate(0,'+(100-dayShift.ontime_rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#fff;text-shadow: 0px 0px 8px #FF0000;" v-text="dayShift.ontime_rank_complete_percent+'%'">
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="left-img" v-else>
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" style="transform: translate(0,100%);">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img"  v-if="nightShift!=undefined" style="background-color:rgb(242, 242, 242)">
                        <ul>
                            <li class="sun-img moon2" ></li>
                            <li style="color:#333" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water blue" id="water"  :style="{transform: 'translate(0,'+(100-nightShift.ontime_rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back blue" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front blue" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#f49c05" v-text="nightShift.ontime_rank_complete_percent+'%'">
                                        35%
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img" v-else style="background-color:rgb(242, 242, 242)">
                        <ul>
                            <li class="sun-img moon2"></li>
                            <li style="color:#333" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water"  style="transform: translate(0,100%)">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
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
                    <ul class="table-list" style="text-align:center;height:40px;line-height:40px;">
                       暂无数据
                    </ul>
                </div>
                <!-- <div class="table-body" >
                    <ul class="table-list">
                        <li v-for="items in 8">
                            <div>工位</div>
                            <div>工单号</div>
                            <div>报警时间</div>
                            <div>报警信息</div>
                            <div style="color:red">等待处理</div>
                        </li>
                    </ul>
                </div> -->
            </div>
        </div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/vue/axios.min.js"></script>
<script>
    var padDate = function (value) {    //在月份、日期、小时等小于10时在前面补0
        return value<10?'0'+value:value;
    };
    var app = new Vue({
        el: '#appss',
        data: {
            message: 'He',
            date:'',
            orders:{workbench_name: "复合A1号",number: "WO2018110610763",operation_name: "滚胶/喷胶复合",predict_start_time: "00:00:00",predict_end_time: "10:00:00",complete: 0,complete_percent:0,status: 0},
            nightShift:{ontime_rank_complete_percent: 0,rank_complete_percent: 0},
            dayShift:{ontime_rank_complete_percent: 0,rank_complete_percent: 0}
        },
        filters:{   //过滤器

        },
        created: function(){
            this.initWorkorderDetail(),
            this.getWorkorderDetail()
        },
        mounted: function () {  //定时器，用于每秒刷新时间
            var _this = this;   //声明一个变量指向Vue实例this，保证作用域一致
            this.timer = setInterval(function () {
                var date = new Date();    //修改数据date
                var year = date.getFullYear();
                var month = padDate(date.getMonth()+1);
                var day = padDate(date.getHours());
                var hours = padDate(date.getHours());
                var minutes = padDate(date.getMinutes());
                var seconds = padDate(date.getSeconds());
                //整理数据并返回
                _this.date = year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
            },1000);
        },
        methods:{
            initWorkorderDetail:function(){
                let url = `/ProductOrder/productBoard`;
                axios.get(url, {
                    params: {
                        _token: "8b5491b17a70e24107c89f37b1036078"
                    }
                }).then(res => {
                    if(res&&res.data.results){
                        this.orders=res.data.results.orders;
                        for(var i=0;i<res.data.results.orders.length;i++){
                            this.orders[i].predict_start_time=formatDuring(res.data.results.orders[i].predict_start_time);
                            this.orders[i].predict_end_time=formatDuring(res.data.results.orders[i].predict_end_time);
                        }
                        this.nightShift=res.data.results.ranks[23];
                        this.dayShift=res.data.results.ranks[22];
                    }
                })
            },
            //获取工单完成状态
            getWorkorderDetail:function() {
                let url = `/ProductOrder/productBoard`;
                setInterval(() => {
                    axios.get(url, {
                        params: {
                            _token: "8b5491b17a70e24107c89f37b1036078"
                        }
                    }).then(res => {
                        if(res&&res.data.results){
                            this.orders=res.data.results.orders;
                            for(var i=0;i<res.data.results.orders.length;i++){
                                this.orders[i].predict_start_time=formatDuring(res.data.results.orders[i].predict_start_time);
                                this.orders[i].predict_end_time=formatDuring(res.data.results.orders[i].predict_end_time);
                            }
                            this.nightShift=res.data.results.ranks[23];
                            this.dayShift=res.data.results.ranks[22];
                        }
                    })
                }, 5000)
            }
        },
        beforeDestory:function () { //清除定时器
            if (this.timer){
                clearInterval(this.timer);  //在Vue实例销毁前，清除定时器
            }
        }
    })

    function formatDuring(data) {
        var hours = parseInt((data % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((data % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((data % (1000 * 60)) / 1000);
        if (minutes >= 0 && minutes <= 9) {
            minutes = '0' + minutes
        }
        if (seconds >= 0 && seconds <= 9) {
            seconds = '0' + seconds
        }

        return hours + ":" + minutes + ":" + seconds;
    }
</script>
<script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>
@endsection
