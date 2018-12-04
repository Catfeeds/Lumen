/**
 * Created by admin on 2017/10/9.
 */


$(function () {
    getAlarmHistogramCharts();
    getAlarmPieCharts();
})

function getAlarmHistogramCharts() {
    var myChart = echarts.init(document.getElementById('alarm-histogram'));
    var option = {
        title: {
            text: '报警类型统计',
            x:'center'
        },
        tooltip: {},
        legend: {
            data:['来料异常','设备异常','工艺异常','人员异常'],
            top:30
        },
        xAxis: {
            data: ["周一","周二","周三","周四","周五","周六","周日"]
        },
        yAxis: {},
        series: [{
            name: '来料异常',
            type: 'bar',
            data: [23, 34, 45, 65, 65, 98,110],
        },{
            name: '设备异常',
            type: 'bar',
            data: [43, 55, 98, 94, 103, 80,60],
        },{
            name: '工艺异常',
            type: 'bar',
            data: [79, 76, 43, 82, 70, 109,29],
        },{
            name: '人员异常',
            type: 'bar',
            data: [98, 43, 44, 36, 10, 24,75],
        }],
        color:['#fe9c91','#ffe5a8','#98c7cd','#cccccc'],
        barGap:0
    };
    myChart.setOption(option);
}

function getAlarmPieCharts() {
    var myChart = echarts.init(document.getElementById('alarm-piechart'));
    var option = {
        title : {
            text: '处理结果',
            subtext:'对报警操作的处理结果',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            data: ['已处理','未处理'],
            top:50
        },
        series : [
            {
                name: '处理结果',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                    {value:320, name:'已处理'},
                    {value:50, name:'未处理'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },

                }
            }
        ],
        color:['#57c3f4','#cccccc']
    };
    myChart.setOption(option);
}