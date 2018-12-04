@author  sam.shan
@time    2018年02月02日17:13:33



functions.js       =====>   自定义的公共函数
custom-public.js   =====>   里面稍微有点乱,有超全局变量,有公共方法layer弹层等公共方法
custom-config.js   =====>   配置文件,已经加入git忽略,若要使用请参考custom-config.js.example
ajax-public.js     =====>   一些公共的ajax请求封装成了 ajax_PublicFn 对象
ajax-client.js     =====>   包围函数封装的 AjaxClient (存在很大的优化空间,后续可进行优化)
ajax-client-old.js     =====>   包围函数封装的 AjaxClient旧版本
validate.js        =====>   公共使用的验证类封装,比如手机号/邮箱等数据格式的检测





部分ajax事件函数说明:http://www.css88.com/jqapi-1.9/jQuery.ajax/







推荐使用的注意事项: jqXHR.success(), jqXHR.error(), 和 jqXHR.complete()回调
从 jQuery 1.8开始 被弃用过时。他们将最终被取消，您的代码应做好准备， 从jQuery 3.0开始被删除，
你可以使用jqXHR.done(), jqXHR.fail(), 和 jqXHR.always() 代替。


成功时候的调用顺序:

options-beforeSend
options-success
jqXHR.done
jqXHR.always
options-complete

封装中由于手动回调,所以请记住下面的成功的执行顺序:
options-beforeSend
jqXHR.done
options-success
options-complete
==============================================
失败时候的调用顺序:

options-beforeSend
options-error
jqXHR.fail
jqXHR.always
options-complete

封装中由于手动回调,所以请记住下面的失败的执行顺序:

options-beforeSend
jqXHR.fail
options-fail
options-complete

