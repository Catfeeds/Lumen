
{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <button type="button" onclick="test();">测试ajax</button>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")

    <script>



        function test()
        {
            var url="sam/ajax01";
            var send={
                name:'shanbumin',
                age:27,
            };

            $.ajax({
                type:'post',
                url:url,
                data:send,
                dataType: "jsonp",
                timeout:1000,//设定超时，1秒内服务器端没有反应将认为是请求失败
                cache:false,//禁用缓存
                error:function(reback){
                    alert("加载失败");
                },
                success:function(reback){
                    console.log(reback);//reback被预处理成数组  [Object, Object, Object, Object]


                }


            });

        }


    </script>
@endsection