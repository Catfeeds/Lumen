/**
 * 前端公共js方法放置处
 * @author  sam.shan@ruis-ims.cn
 * @time    2018年01月11日13:11:31
 */




/**
 * 只需要将一个jquery 表单对象传递过来即可获得该表单所有选中的元素的值
 * @param  {obj} self   如：$('#form')(某个表单的主键选择器名为form)  select多选不适合   radio与checkbox如果没有任何选中项，则是没有该name对应的变量的
 * @return {obj}      json格式的js简写对象
 */
function get_form_data(self)
{

    var obj = {};

    $(self).find(':input[name],select[name],textarea[name]').each(function(i,e) {
        var name = e.name,
            type = e.type;

        if (type == 'hidden')
            type = 'text';

        if (type == 'file')
            return;

        switch (type) {
            case 'radio':      //单选框 我们是要自己判断用户选择了哪个额
                if (e.checked)
                    obj[name] = e.value;
                break;
            case 'checkbox':    //复选框数组
                if (!e.checked)
                    break;
            default:
                if ($(self).find(':input[name="'+ name +'"],select[name="'+ name +'"],textarea[name="'+ name +'"]').length > 1) {
                    if (!obj[name])
                        obj[name] = [];

                    obj[name].push(e.value);
                }else{
                    obj[name] = e.value;
                }
        }
    });

    return obj;

}









/***********检测区域*************************************/

/**
 * 检测邮箱
 * @param  {string} email 邮箱值
 * @return {string}       返回值，值为空则表示没有错
 */
function check_email(email)
{
    var email = arguments[0]? arguments[0] :$('[name="email"]').val();
    email=$.trim(email);//过滤
    var re=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    var error='';
    if(!email) error='请填写邮箱地址';//判断输入是否为空
    if(!error && email.search(re)==-1 ) error='您输入的邮箱有误';//如果前面没有错误信息则进行格式检测
    return error;
}


/**
 * 检验密码
 * @param  {string} password 密码
 * @param  {string} re       密码格式要求
 * @return {string}          通过返回空
 */
function check_password(password,re)
{
    password=$.trim(password);//过滤
    var error='';
    if(!password) error='请填写密码';//判断输入是否为空
    if(!error && password.search(re)==-1 ) error='您填写的密码不符合要求';//如果前面没有错误信息则进行格式检测
    return error;
}

/**
 * 检验确认密码
 * @param  {[type]} password         [description]
 * @param  {[type]} confirm_password [description]
 * @return {[type]}                  [description]
 */
function  check_confirm_password(password,confirm_password)
{

    password=$.trim(password);//过滤
    confirm_password=$.trim(confirm_password);//过滤

    var error='';
    if(!confirm_password) error='确认密码不可以为空';//判断输入是否为空
    if(!error && (password!= confirm_password)) error='确认密码不正确';
    return error;
}

/**
 * 检验验证码
 * @param  {[type]} captcha [description]
 * @return {[type]}         [description]
 */
function check_captcha(captcha)
{
    captcha=$.trim(captcha);//过滤
    var error='';
    if(!captcha) error='请填写验证码';//判断输入是否为空
    return error;
}

/**
 * 检验机构名称
 * @param  {[type]} agency_name [description]
 * @return {[type]}             [description]
 */
function check_agency_name(agency_name)
{
    agency_name=$.trim(agency_name);//过滤
    var error='';
    if(!agency_name) error='请填写结构名称';//判断输入是否为空
    return error;
}

/**
 * 检查姓名
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function check_name(name)
{
    name=$.trim(name);//过滤
    var re=/^\s*[\u4e00-\u9fa5]{2,5}\s*$/;
    var error='';
    if(!name) error='请填写您的真实姓名';//判断输入是否为空
    if(!error && name.search(re)==-1 ) error='请填写您的真实姓名';//如果前面没有错误信息则进行格式检测
    return error;
}

/**
 * 检查手机
 * @param  {[type]} mobile [description]
 * @return {[type]}        [description]
 */
function check_mobile(mobile)
{
    mobile=$.trim(mobile);//过滤
    var re= /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
    var error='';
    if(!mobile) error='请填写手机号';//判断输入是否为空
    if(!error && mobile.search(re)==-1 ) error='手机号格式有误';//如果前面没有错误信息则进行格式检测
    return error;
}


/*************提醒弹层*************************/




/**
 * 适用场景是，检查不通过的时候，提醒用户，并提供一个btn_name按钮让用户点击进行关闭，就是js  alert的美化版本
 * @param  {string} reminder 提醒信息
 * @param  {string} btn_name 按钮名称，如知道了，确认等
 * @return {[type]}          [description]
 */
function  check_alert(reminder,btn_name)
{
    var btn_name = arguments[1]? arguments[1] :'知道了';


    layer.alert(reminder, {
        title:false,
        closeBtn:0,
        icon: 5,
        skin: 'layer-ext-moon',
        btn: [btn_name],
    })
}







/**
 * 添加成功的msg提示
 * @param  {[type]} reminder [description]
 * @param  {[type]} go_url   [description]
 * @return {[type]}          [description]
 */
function submit_ok_msg(reminder,go_url) //js的传递参数是无法直接设置默认值的
{

    var go_url = arguments[1]? arguments[1] :window.location.href;
    layer.msg(reminder, {
        icon: 1,
        time: 3000 //2秒关闭（如果不配置，默认是3秒）
    },function(){
        window.location.href=go_url;
    });

}

/**
 * 添加成功的alert提示
 * @param  {[type]} reminder [description]
 * @param  {[type]} go_url   [description]
 * @return {[type]}          [description]
 */
function submit_ok_alert(reminder,go_url) //js的传递参数是无法直接设置默认值的
{

    //默认值通过这种形式进行设置额
    var go_url = arguments[1]? arguments[1] :window.location.href;


    layer.alert(reminder, {
        title:false,
        closeBtn:0,
        icon: 6,
        skin: 'layer-ext-moon',
        btn: ['知道了'],
    },function(){
        window.location.href=go_url;
    })
}



/**
 * 更新成功的msg提示
 * @param  {[type]} reminder [description]
 * @return {[type]}          [description]
 */
function submit_ok_msg_static(reminder)
{
    layer.msg(reminder, {
        icon: 1,
        time: 3000 //2秒关闭（如果不配置，默认是3秒）
    });

}


/**
 * 更新成功的alert提示
 * @param  {[type]} reminder [description]
 * @return {[type]}          [description]
 */
function  submit_ok_alert_static(reminder)
{


    layer.alert(reminder, {
        title:false,
        closeBtn:0,
        icon: 6,
        skin: 'layer-ext-moon',
        btn: ['知道了'],
    })
}


/**
 * 检测时候的tip提醒功能
 * @param reminder
 * @param id_value
 * @param position  支持上右下左四个方向，通过1-4进行方向设定
 * @param color
 */
function  submit_error_tip(reminder,id_value,position,color)
{
    var position = arguments[2]? arguments[2] :'2';
    var color = arguments[3]? arguments[3] :'orange';

    layer.tips(reminder, '#'+id_value,{
        tips:[position,color], //2表示右边  这里如果不配置的话是有默认值的
        time:1000,//这个也是有默认值的
    });


}





/**
 * 自动关闭的失败提醒
 * @param  {[type]} reminder [description]
 * @return {[type]}          [description]
 */
function front_fail_msg(reminder,wait_time)
{
    var wait_time = arguments[1]? arguments[1] :3000;
    layer.msg(reminder, {
        icon: 2,
        time:wait_time, //2秒关闭（如果不配置，默认是3秒）
    });

}











/**
 * 定时跳转器
 *
 */

/**
 * 定时跳转器
 * @param {int} $time 秒数
 * @param {string} $url  跳转地址
 */
function  set_time_to_redirect(time,url)
{
    var t=setTimeout("window.location.href='"+url+"'",time*1000);

}

/**
 * 定时做某件事：一般不用setInterval，而用setTimeout的延时递归来代替interval。setInterval会产生回调堆积，特别是时间很短的时候。
 */





/*****************bootstrap-table使用*************************************/


/**
 * bootstrap-table刷新
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
function bootstrap_table_refresh(self)
{
    var self = arguments[0]? arguments[0] :$('#table');
    $(self).bootstrapTable('refresh');
}


/**
 * 给行添加提醒
 * @param  {[type]} This [description]
 * @return {[type]}      [description]
 */
function remark_danger_tr(This)
{

    $(This).closest('tr').addClass('danger');
}

/**
 * 给单元格添加提醒
 * @param  {[type]} This [description]
 * @return {[type]}      [description]
 */
function remark_danger_td(This)
{
    $(This).closest('td').addClass('danger');

}


/**
 * 批量给行添加提醒
 * @param  {array} ids [description]
 * @return {[type]}     [description]
 */
function remark_danger_trs(ids)
{

    for(i=0;i<ids.length;i++){
        $('tr[data-uniqueid="'+ids[i]+'"]').addClass('danger');
    }
}




/**
 * 列表页删除弹出框
 * @param  {[type]} self             [description]
 * @param  {[type]} url              [description]
 * @param  {[type]} id               [description]
 * @param  {[type]} primary_key_name [description]
 * @param  {[type]} title            [description]
 * @return {[type]}                  [description]
 */
function  bootstrap_table_delete_reminder(self,url,id,primary_key_name,title)
{
    layer.confirm('<b>确定要删除吗</b>', {

        icon:3,
        title:'<b style="color:red;">'+title+'</b>',
        btn: ['确定', '取消'],
        closeBtn:false,
        yes: function(index, layero){
            layer.close(index);//关闭弹出框
            var loader_index = layer.load(2, {time: 10*1000});
            var send={'id':id};

            $.post(url,send,function(reback_obj) {
                layer.close(loader_index);
                if (reback_obj.status ==1) {

                    $(self).bootstrapTable('remove', {
                        field:primary_key_name,
                        values: [id]
                    });
                }else if(reback_obj.status==0){
                    check_alert(reback_obj.info);
                }

            }, "json");
        },

        btn2: function(index, layero){
            layer.close(index);
            $('table tr').removeClass('danger');

        },

    });


}



