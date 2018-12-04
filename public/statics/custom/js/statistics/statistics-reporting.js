/**
 * Created by admin on 2017/10/9.
 */

$(function () {
    getReportingCompleteCharts();
    getReportingTimeCharts();
})

function getReportingCompleteCharts() {
    var myChart = echarts.init(document.getElementById('reporting-sheet'));
    var option = {
        title : {
            text: '工单完成率',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            data: ['已完成','未完成'],
            top:50
        },
        series : [
            {
                name: '处理结果',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                    {value:320, name:'已完成'},
                    {value:50, name:'未完成'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ],
        color:['#57c3f4','#cccccc']
    };
    myChart.setOption(option);
}

function getReportingTimeCharts() {
    var myChart = echarts.init(document.getElementById('reporting-time'));
    var option = {
        title : {
            text: '按时完成率',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            data: ['已按时完成','未按时完成'],
            top:50
        },
        series : [
            {
                name: '处理结果',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                    {value:200, name:'已按时完成'},
                    {value:50, name:'未按时完成'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ],
        color:['#57c3f4','#cccccc']
    };
    myChart.setOption(option);
}