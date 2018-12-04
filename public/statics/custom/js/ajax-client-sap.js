/**
 * 使用说明
 * 1.使用包围函数(自执行函数)封装的的一个ajax工具,并非jquery插件,可以看成一个命名空间
 * 2.将jQuery, window.BASE_URL分别传递进入内部进行使用,传递的原因是:
 *   a.底层用到$.ajax,所以将jQuery对象传递进来
 *   b.BASE_URL是url的http部分的主体host地址,如果跨站可以配置该值传递进来,该值的配置在custom-config.js中
 * 3.自执行函数会顺着代码的定义流程进行执行,但是不会自动执行里面再次定义的函数或者对象方法的.除非里面有调用程序
 * @author ally
 * @reviser  sam.shan   <sam.shan@ruis-ims.cn>
 * @time 2018年02月02日17:32:52
 * @TODO  封装的冗余代码过多,后续可以进行有效的优化,比如options是可以提取成对象client的属性的
 */


!function ($, api_baseUrl)
{

    var baseUrl = api_baseUrl || '';//定义ajax的请求host
    //通过简洁的json格式定义对象 client,这种方式定义的对象的属性和方法都是公开的
    //定义了两个方法get和post
    //options一个以"{键:值}"组成的AJAX 请求设置。所有选项都是可选的。
    //ctx是外部调用程序本身,目的就是options中在复写某个方法的时候,仍能被复写的和重写的都能执行,就是回调的时候可以用到,this
    var client = {
        get: function (options, ctx) {
            //这段代码的作用?
            var success = options.success || $.noop;
            var fail    = options.fail || $.noop;
            delete options.success;
            delete options.fail;
            //特殊的options参数项处理
            options.url      = baseUrl + options.url;//url地址,拼接上baseUrl
            options.dataType = options.dataType || 'json';//要求的数据格式,不传递是json
            options.timeout = options.timeout || 15000;//设定超时，如果不指明超时时间,则15秒内服务器端没有反应将认为是请求失败
            options.method   ='GET';//指定请求方法为GET,method可替代1.9之前的type选项了
            //执行$.ajax
            var xhr = $.ajax(options);

            xhr.done(function (data) {
                //从请求成功不代表业务成功,继续判断code码进行业务成功与否的判断
                if(data.SERVICERESPONSE){
                    if (data.SERVICERESPONSE.RETURNCODE== "0") {
                        success.call(ctx, data);
                    } else{
                        fail.call(ctx, data);
                    }
                    if(data.RETURNCODE){
                        fail.call(ctx, data);
                    }
                }else {
                    fail.call(ctx, data);
                }

            });
            xhr.fail(function (data) {
                //1.这里可以对服务器端返回出错时候进行一个公共处理
                // 略
                //2.回调客户端程序具体的请求错误处理
                fail.call(ctx, data);

            });

            return xhr;
        },
        post: function (options, ctx) {
            //这段代码的作用?
            var success = options.success || $.noop;
            var fail    = options.fail || $.noop;
            delete options.success;
            delete options.fail;
            //特殊的options参数项处理
            options.url      = baseUrl + options.url;//url地址,拼接上baseUrl
            options.dataType = options.dataType || 'json';//要求的数据格式,不传递是json
            options.timeout = options.timeout || 15000;//设定超时，如果不指明超时时间,则15秒内服务器端没有反应将认为是请求失败
            options.method   ='POST';//指定请求方法为POST,method可替代1.9之前的type选项了
            //执行$.ajax
            var xhr = $.ajax(options);

            xhr.done(function (data) {

                if (data.SERVICERESPONSE.RETURNCODE== "0") {
                    success.call(ctx, data);
                } else{
                    fail.call(ctx, data);
                }
                if(data.RETURNCODE){
                    fail.call(ctx, data);
                }
            });
            xhr.fail(function (data) {

                    fail.call(ctx, data);
            });

            return xhr;
        }
    };

    window.AjaxClientSap = client;
}(jQuery, window.BASE_URL);