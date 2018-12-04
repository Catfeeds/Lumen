;
(function($, window, document, undefined) {
	var GanttWrapDiv='';
    var Gantt = function(ele, opt) {
        this.$element = ele,
        this.defaults = {
            'startDate': null,
            'endDate': null,
            'ajaxUrl': null,
            'arrdata': null,
            'layer': null,
            'parameters': null, //其他参数
            'fn': null //回调方法
        },
        this.options = $.extend({}, this.defaults, opt)
    }

    Gantt.prototype = {
        initDom: function() {
            GanttWrapDiv = this.$element;
            GanttWrapDiv.empty().append('<div class="GanttHeadWrap">\
                                            <div class="GanttTitleDiv">\
                                                <table class="GanttTitleFixed GanttFixed">\
                                                    <thead>\
                                                        <tr>\
                                                            <th><div class="out"><b>任务</b><em>订单</em></div></th>\
                                                        </tr>\
                                                    </thead>\
                                                </table>\
                                            </div>\
                                            <div class="GanttTaskDiv">\
                                                <table class="GanttTaskFixed GanttFixed">\
                                                    <thead>\
                                                        <tr class="month"></tr>\
                                                        <tr class="days"></tr>\
                                                    </thead>\
                                                </table>\
                                            </div>\
                                        </div>\
                                        <div class="GanttTaskWrap"><div class="GanttTitleDiv">\
                                                <table class="GanttTitle">\
                                                    <thead>\
                                                        <tr>\
                                                            <th><div class="out"><b>任务</b><em>订单</em></div></th>\
                                                        </tr>\
                                                    </thead>\
                                                    <tbody></tbody>\
                                                </table>\
                                            </div>\
                                            <div class="GanttTaskDiv">\
                                                <table class="GanttTask">\
                                                    <thead>\
                                                        <tr class="month"></tr>\
                                                        <tr class="days"></tr>\
                                                    </thead>\
                                                    <tbody></tbody>\
                                                </table>\
                                            </div></div>');
            //获取时间
            var startDate = this.options.startDate;
            var endDate = this.options.endDate;

            var DateArr = getMonthDay(startDate, endDate);
            if(DateArr){
                //显示天
                DAYS=DateArr.dArr.length;
                oneDayWidth = $(".GanttTaskDiv").width()/DAYS;
                oneDayWidth<30?oneDayWidth=30:null;
                if (DateArr.dArr && DateArr.dArr.length > 0) {
                    for (var d = 0; d < DateArr.dArr.length; d++) {
                        $(".days").append('<th style="width:'+ oneDayWidth +'px" data-today='+DateArr.dArr[d].v+'  data-date='+DateArr.dArr[d].date+'>' + DateArr.dArr[d].d + '</th>');
                    }
                }
                //显示月
                if (DateArr.mArr && DateArr.mArr.length > 0) {
                    var mData = getRepeat(DateArr.mArr)
                    for (var m = 0; m < mData.length; m++) {
                        $(".month").append('<th colspan=' + mData[m].count + '>' + mData[m].Y+ '' + monthFormat(mData[m].M) + '</th>');
                    }
                }
                $(".GanttTask,.GanttTaskFixed").css("width",(oneDayWidth*DAYS)+'px');
            }
            //发异步
            getDataList(this.options);
        }
    }

    //设置滚动条
    function scrollBar(ele){
    	$('.scrollDiv').remove();
        if(!$('.scrollDiv').length){
            ele.after('<div class="scrollDiv"><div><div class="scrollBar"></div></div></div>');
        }
        //设置滚动条
        var GanttTaskDivWidth=$(".GanttTaskDiv").innerWidth();
        var GanttTaskWidth=$(".GanttTask").width();
        var rate = GanttTaskDivWidth/GanttTaskWidth;

        $(".scrollDiv").css({"width":GanttTaskDivWidth});
        var scrollBarWidth=GanttTaskDivWidth*rate;
        $(".scrollBar").css({"width":scrollBarWidth});
        var widthSub=GanttTaskDivWidth-scrollBarWidth;
        var moveoutFlag = true;
        if(widthSub>0){
           $(".scrollDiv").css("display","block");
        }else{
           $(".scrollDiv").css("display","none");
        }
        var isDown=false;
        $(".scrollBar").on('mousedown',function(e){
          e.preventDefault();
          e.stopPropagation();
          moveoutFlag = false;
          isDown=true;
          var startOffsetLeft=e.clientX;
          var startLeft=parseInt($(".scrollBar").css("left"));
          if(isDown){
              $(document).on('mousemove',function(e){
                  e.stopPropagation();
                  var moveLeft=e.clientX-startOffsetLeft;
                  var left=moveLeft+startLeft;
                  if(left>widthSub){
                      left=widthSub;
                  }else if(left<0){
                      left=0;
                  }
                  $(".scrollBar").css('left',left+'px');
                  $(".GanttTask,.GanttTaskFixed").css('left',(-left/rate)+'px');
                  moveoutFlag = false;
              });
              $(document).on('mouseup',function(e){
                  e.stopPropagation();
                  isDown=false;
                  $(document).unbind('mouseup');
                  $(document).unbind('mousemove');
              });
          }
        });
    }

    var DAYS;//相差天数

    function getDataList(options) {
        var data=options.arrdata;
        setDataList(data,options);
        // if(data && JSON.parse(data).length){
        //     var dataJson = JSON.parse(data)
            
        // }
        // var getDataAjax = $.ajax({
        //     url:options.ajaxUrl,
        //     type:"post",
        //     timeout:10000,
        //     beforeSend:function(){
        //         $("#loading").show();
        //     },
        //     success:function(data){
        //         $("#loading").hide();
        //         if(data && JSON.parse(data).length){
        //             var dataJson = JSON.parse(data)
        //             setDataList(dataJson,options);
        //         }
        //     },
        //     complete:function(XMLHttpRequest,status){
        //         if(status == 'timeout'){
        //             getDataAjax.abort();
        //             alert('请求超时，请重试')
        //         }
        //     }
        // })
    }

    function setDataList(orderList,options){
        //今天显示红色分割线
        var thObj=$(".GanttTask .days th[data-today=1]");
        thObj.addClass("active").append('<i></i>');
        var index=thObj.index();

        for(var i=0;i<orderList.length;i++){
            var taskList=orderList[i].taskList;
            var height='35px';
            if(taskList && taskList.length){
                height=(36*(taskList.length)-1)+'px';
                setTaskList(i,index,taskList,options);
            }else{
                var setTrtd=$(setTr(DAYS));
                $(".GanttTask tbody").append(setTrtd);
                setTrtd.css("border-bottom","1px solid #eee");
            }
            var perTr=$('<tr><td style="height:'+height+'"><span>'+orderList[i].name+'</span></td></tr>');
            createPanel(perTr.find('td'));
            perTr.find('td').hover(function(e){
                if(layer!=null){
                    var ele=options.layer;
                    offset=$(ele).offset();
                }
                var top=e.clientY - offset.top -80;
                if(top > $('.GanttWrap').height()){
                    $(this).find('.op-panel').css({'top':(top - 310)+'px'});
                }else{
                    $(this).find('.op-panel').css({'top':(top-10)+'px'});
                }
                $(this).find('.op-panel').css('display','flex');
            },function(e){
                $(this).find('.op-panel').css('display','none');
            })
            $(".GanttTitle tbody").append(perTr);
        }

        var height=$(".GanttTask tbody").height()+30;
        thObj.find("i").css("height",height+'px');
        setTimeout(function(){
        	scrollBar(GanttWrapDiv);
        },0);
    }

    function setTaskList(perIdx,todayIdx,taskList,options){
        var START=(new Date(options.startDate)).getTime();//查询开始时间
        var End=(new Date(options.endDate)).getTime();//查询结束时间
        for(var j=0;j<taskList.length;j++){
            $(".GanttTask tbody").append(setTr(DAYS));
            var allLen=$(".GanttTask tbody").find("tr").length-1;
            var progress=100;
            var Tuprogress=100;//用于显示进度条
            var sDate=(new Date(taskList[j].StartDate)).getTime();//任务开始时间
            var eDate=(new Date(taskList[j].DueDate)).getTime();//任务结束时间
            var taskDays=((eDate-sDate)/1000/60/60/24)+1;//任务天数
            var colspan=taskDays//显示进度条的长度
            var thPro=100/taskDays;//每个格的进度
            var thStartObj=$(".GanttTask .days th[data-date="+sDate+"]");
            var thEndObj=$(".GanttTask .days th[data-date="+eDate+"]");
            var thStartIdx=thStartObj.index();
            var thEndIdx=thEndObj.index();
            // console.log(thStartIdx+' '+thEndIdx);
            //如果开始 或结束时间不在选择的时间内
            if(thStartIdx=='-1' && thEndIdx!='-1'){
               thStartIdx=0;
               colspan=thEndIdx-thStartIdx+1;
               console.log(colspan);
               var sDiffer=(START-sDate)/1000/60/60/24;
               var sDifferPro=sDiffer*thPro;//到查询开始显示时应多少进度
               var nowthPro=100/colspan;
               if(Tuprogress<=sDifferPro){
                   Tuprogress='0';
               }else{
                   Tuprogress=(Tuprogress-sDifferPro)*(100/(100-sDifferPro));
               }
           }
           if(thEndIdx=='-1' && thStartIdx!='-1'){
               thEndIdx=DAYS-1;
               colspan=thEndIdx-thStartIdx+1;
               var eDiffer=((End-sDate)/1000/60/60/24)+1;
               var eDifferPro=eDiffer*thPro;//到查询开始显示时应多少进度
               if(Tuprogress<=eDifferPro){
                   Tuprogress=Tuprogress*(100/eDifferPro);
               }else{
                   Tuprogress=100;
               }
           }
           if(thStartIdx=='-1' && thEndIdx=='-1'){
               thStartIdx=0;
               thEndIdx=DAYS-1;
               colspan=thEndIdx-thStartIdx+1;
               var sDiffer=(START-sDate)/1000/60/60/24;
               var eDiffer=(eDate-End)/1000/60/60/24;
               var sDifferPro=sDiffer*thPro;//到查询开始显示时应多少进度
               var eDifferPro=eDiffer*thPro;
               if(Tuprogress<=sDifferPro){
                   Tuprogress='0';
               }else{
                   Tuprogress=(Tuprogress-sDifferPro)*(100/(100-sDifferPro-eDifferPro));
               }
           }
           if(Tuprogress>100){
               Tuprogress=100;
           }
            $(".GanttTask tbody").find("tr:eq("+allLen+") td").each(function (index, item){
                if(index>thStartIdx && index<=thEndIdx){
                    $(item).remove();
                }else if(index==thStartIdx){
                    $(item).attr("colspan",colspan).append('<span class="Tname" taskid="'+ taskList[j].IssueId +'"><i>'+taskList[j].Subject+'</i></span><div class="detail"></div><div class="pro"><span class="finished" style="width:'+Tuprogress+'%"></span></div>');
                    $(item).css({"position":"relative","cursor":"pointer"});
                    if(j==(taskList.length-1)){
                        $(item).parent().css("border-bottom","1px solid #eee");
                    }else{
                        $(item).parent().css("border-bottom","1px solid transparent");
                    }

                    if(((DAYS-thStartIdx)*40)<$(item).find(".Tname").width()){
                        $(item).find(".Tname").css("width",((DAYS-thStartIdx)*40)+'px');
                    }

                    var detail=$(item).find(".detail");
                    $(detail).append('<p><label>任务名称：</label><span>'+taskList[j].Subject+'</span></p>\
                                <p><label>开始时间：</label><span>'+taskList[j].StartDate+'</span></p>\
                                <p><label>结束时间：</label><span>'+taskList[j].DueDate+'</span></p>');
                    //鼠标悬浮出现详情
                    $(item).mouseover(function(e){
                        if(e.target.tagName=='TD' || $(e.target).hasClass(".Tname") ||$(e.target).parents(".Tname").length>0){
                            var offset={
                                top: 0,
                                left: 0,
                            };
                            if(layer!=null){
                                var ele=options.layer;
                                offset=$(ele).offset();
                            }
                            var newOffset={
                                top: e.clientY - offset.top -80,
                                left: e.clientX - offset.left
                            };
                            if(newOffset.top > $('.GanttWrap').height()){
                                $(detail).css({'left':(newOffset.left+10)+'px','top':(newOffset.top - 90)+'px'});
                            }else{
                                $(detail).css({'left':(newOffset.left+10)+'px','top':(newOffset.top-10)+'px'});
                            }
                        }
                        $(detail).css("display","block");
                    });
                    $(item).mouseout(function(){
                        $(detail).css("display","none")
                    });
                    $(item).find(".Tname").on("click", function () {
                       
                        // window.open( 'http://jqrdms.tcent.cn/redmine/issues/' + $(this).attr('taskid'));
                        
                    })
                }
            })
        }
    }

    //拼接tr字符串，包含tdNum个td
    function setTr(tdNum) {
        var returnStr = "<tr>"
        for (var index = 0; index < tdNum; index++) {
            returnStr = returnStr + "<td></td>";
        }
        returnStr = returnStr + "</tr>";
        return returnStr;
    }

    //获取数组重复年月，和重复个数
    function getRepeat(Arr) {
        var res = [];
        var obj = {};
        for (var m = 0; m <Arr.length;) {
            var count = 0;
            for (var n = m; n<Arr.length; n++) {
                if (Arr[m].mm == Arr[n].mm) {
                    count++;
                }
            }
            obj.M = Arr[m].mm;
            obj.Y=Arr[m].yy;
            obj.count = count;
            res.push(obj);
            obj = {};
            m+=count;
        }
        return res;
    }

    //判断日期是否合法的
    function checkDate(date) {
        return (new Date(date).getDate() == date.substring(date.length - 2));
    }

    //判断是否今天
    function isToday(dateTxt){
      var todayDate = new Date();
      return (todayDate.getFullYear() == dateTxt.getFullYear() && todayDate.getMonth() == dateTxt.getMonth() && todayDate.getDate() == dateTxt.getDate());
    }

    //获取两个日期之间的日期
    function getMonthDay(start, end) {
        var StartDate = new Date(start);
        var EndDate = new Date(end);
        var days = Math.ceil((EndDate.getTime() - StartDate.getTime()) / 1000 / 60 / 60 / 24);
        var monthArr = [],dayArr = [];
        for (var i = 0; i <= days; i++) {
            var monthObj={},dayObj={};
            var year = StartDate.getFullYear();
            var month = StartDate.getMonth() + 1;
            var day = StartDate.getDate();
            var val=0;
            if(isToday(StartDate)){
                val=1;
            };
            monthObj.yy=year;
            monthObj.mm=month;
            monthArr.push(monthObj);
            dayObj.d=day;
            dayObj.v=val;
            dayObj.date=StartDate.getTime();
            dayArr.push(dayObj);
            StartDate.setDate(StartDate.getDate() + 1);
        }
        return {
            mArr: monthArr,
            dArr: dayArr,
        }
    }
    //月份format
    function monthFormat(month) {
        var m;
        switch (month) {
            case 1:
                m = '一月';
                break;
            case 2:
                m = '二月';
                break;
            case 3:
                m = '三月';
                break;
            case 4:
                m = '四月';
                break;
            case 5:
                m = '五月';
                break;
            case 6:
                m = '六月';
                break;
            case 7:
                m = '七月';
                break;
            case 8:
                m = '八月';
                break;
            case 9:
                m = '九月';
                break;
            case 10:
                m = '十月';
                break;
            case 11:
                m = '十一月';
                break;
            case 12:
                m = '十二月';
                break;
        }
        return m;
    }

    //生成PO分析数据
    function createPanel(ele){
        var panelWrap=$('<div class="op-panel">\
            <div class="chart-con"><div id="pie-chart" style="width: 400px;height: 300px;"></div></div>\
            <div class="other-info">\
                <p>po其他信息</p>\
                <p>总时长：100小时</p>\
                <p>加工时长：80小时</p>\
                <p>等待及流转时长：20小时</p>\
            </div>\
        </div>');
        var pieChart=echarts.init(panelWrap.find('#pie-chart')[0],null,{renderer: 'svg'});
        var option = {
                title : {
                    text: 'PO耗时分析',
                    textStyle: {
                        fontSize: 14
                    },
                    x:'center'
                },
                color: ['#77c34f','#e0c66c'],
                tooltip : {
                    trigger: 'item',
                    formatter: "{b} : {c} ({d}%)"
                },
                legend: {
                    show: false
                },
                series : [
                    {
                        name: 'PO耗时分析',
                        type: 'pie',
                        radius : '55%',
                        center: ['50%', '50%'],
                        data:[
                            {value:80, name:'加工时长'},
                            {value:20, name:'等待及流转时长'}
                        ]
                    }
                ]
            };
            pieChart.setOption(option);
        ele.append(panelWrap);
    }

    $.fn.GanttTool = function(options) {
        var tool = new Gantt(this, options);
        tool.initDom();
        return tool;
    }
})(jQuery, window, document);
