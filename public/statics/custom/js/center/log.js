//定义当前脚本的一些公共变量   sam.shan  <sam.shan@ruis-ims.cn>
var layerLoading, pageNo=1, pageSize=20,layerEle='';

//页面初始化的时候调用下面方法
$(function(){
	getLoginLog();

});




//获取个人中心-登陆日志接口数据,并渲染到表格中
function getLoginLog(){

    //先将table主题元素清空
    $('.table_tbody').html('');
    //获取传递的参数
    var send={
        '_token':window.TOKEN,
        'page_size':pageSize,
        'page_no':pageNo,
        'order': 'desc',
        'sort': 'id'
    };
    //发送get请求
    AjaxClient.get({
        url: URLS['log'].login,
        data:send,

        //请求发送前的回调函数,在beforeSend函数中返回false将取消这个请求[ajax事件函数之一]
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
             //请求成功,且返回的code码为200才会进入这里头的(判断机制在ajax-client.js中完成了)

            //填充table行元素
            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('没有找到匹配的记录',2);
            }
            //分页按钮绑定
            var totalData=rsp.paging.total_records;
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            noData('获取失败，请刷新重试',2);
        },
        //请求完成后回调函数 (请求success 和 error之后均调用)。
        complete: function(){
             layer.close(layerLoading);
        }
    },this);
}


/**
 * 生成table行数据
 * @param ele   jquery获取的tbody元素
 * @param data  接口返回的数据
 * @author  ally
 * @reviser sam.shan  <sam.shan@ruis-ims.cn>
 */
function createHtml(ele,data)
{
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.admin_id}">
                <td>${item.login_ip}</td>
                <td>${item.login_time}</td>
            </tr>
        `;
        ele.append(tr);
        //将数据绑定到每行的tr元素上
        ele.find('tr:last-child').data("trData",item);
    });
}


/**
 *
 * @param totalData  总记录数
 * @param pageSize   每页显示的个数
 * @author  ally
 * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
 */
function bindPagenationClick(totalData,pageSize)
{
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,//数据总条数
        showData:pageSize,//每页显示的条数
        current: pageNo,//当前第几页
        isHide: true,//总页数为0或1时隐藏分页控件
        coping:true,//是否开启首页和末页
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,//是否开启跳转到指定页数
        callback:function(api){
            pageNo=api.getCurrent();//当用户点击分页按钮的时候,获取当前页,并改变变量pageNo的值
            getLoginLog();
        }
    });
}





