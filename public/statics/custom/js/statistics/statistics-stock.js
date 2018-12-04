/**
 * Created by admin on 2017/10/9.
 */

$(function () {
    getStockFinishedCharts();
    getStockNumberCharts();
})

function getStockFinishedCharts() {
    var myChart = echarts.init(document.getElementById('stock-finished'));
    var option = {
        title: {
            text: '每日裁片完成数',
            x:'center'
        },
        tooltip: {},
        legend: {
            data:['计划完成数量','实际完成数量'],
            top:30
        },
        xAxis: {
            data: ["周一","周二","周三","周四","周五","周六","周日"]
        },
        yAxis: {},
        series: [{
            name: '计划完成数量',
            type: 'bar',
            data: [89, 60, 98, 94, 103, 98,70],
            barGap:'-100%',
            barWidth:40
        },{
            name: '实际完成数量',
            type: 'bar',
            data: [80, 58, 97, 89, 100, 80,60],
            barWidth:40
        }],
        color:['#57c3f4','#fe9c91']
    };
    myChart.setOption(option);
}

function getStockNumberCharts() {
    var myChart = echarts.init(document.getElementById('stock-number'));
    var option = {
        title: {
            text: '每日裁片入库数',
            x:'center'
        },
        tooltip: {},
        legend: {
            data:['入库数'],
            top:30
        },
        xAxis: {
            data: ["周一","周二","周三","周四","周五","周六","周日"]
        },
        yAxis: {},
        series: [{
            name: '入库数',
            type: 'bar',
            data: [89, 60, 98, 94, 103, 98,70],
            barWidth:40
        }],
        color:['#57c3f4']
    };
    myChart.setOption(option);
}