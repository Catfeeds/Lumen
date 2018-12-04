var layerLoading,
    ajaxData={};

$(function(){
    versionView();
});

function versionView(){
    AjaxClient.get({
        url: URLS['version'].detial+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp.results.version)
            console.log(rsp.results.time.addtime)
            console.log(rsp.results.comment.join('<br>'))
            showdetialList($('.detial ol'),rsp.results.comment);
            $('#sno').html(rsp.results.version);
            $('#stime').html(rsp.results.time);

        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log("获取详情失败");
            // layer.msg('获取版本详情失败，请刷新重试',9);
        }
    },this);
}

function showdetialList(ele,data) {
    ele.html('');
    data.forEach(function (item,index) {
        var list = `<li><i class="item-dot expand-icon"></i>${item}</li>`;
        ele.append(list);
    })
}