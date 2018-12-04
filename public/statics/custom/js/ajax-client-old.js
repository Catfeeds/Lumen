!function ($, api_baseUrl) {
    var baseUrl = api_baseUrl || '',arr=[],flag=true;

    var client = {
        get: function (options, ctx) {
            var success = options.success || $.noop;
            var fail    = options.fail || $.noop;

            delete options.success;
            delete options.fail;
            options.url      = baseUrl + options.url;
            options.dataType = options.dataType || 'jsonp';
            options.timeout = 15000;
            options.method   = 'get';
            var xhr = $.ajax(options);
            xhr.done(function (data) {

                arr.push({code:data.code,message:data.message});

                if (data.code== "200") {
                    success.call(ctx, data);
                } else{

                    if(data.code == 411 || data.code == 412){

                        LayerConfig('fail',data.message,function(){

                            fail.call(ctx, data);
                            // window.location.reload();
                        });
                    }

                    fail.call(ctx, data);
                }
            });
            xhr.fail(function (data) {

                fail.call(ctx, data);
            });
        },
        post: function (options, ctx) {
            var success = options.success || $.noop;
            var fail    = options.fail || $.noop;
            delete options.success;
            delete options.fail;

            options.url      = baseUrl + options.url;
            options.dataType = options.dataType || 'jsonp';
            options.timeout = 15000;
            options.method   = 'post';

            var xhr = $.ajax(options);
            xhr.done(function (data) {

                arr.push({code:data.code,message:data.message});

                if (data.code== "200") {
                    success.call(ctx, data);
                } else {

                    if(data.code == 411 || data.code == 412){

                        LayerConfig('fail',data.message,function(){

                            fail.call(ctx, data);
                            // window.location.reload();
                        });
                    }

                    fail.call(ctx, data);
                }
            });
            xhr.fail(function (data) {

                    fail.call(ctx, data);
            });
        }
    };

    window.AjaxClient = client;
}(jQuery, window.BASE_URL);