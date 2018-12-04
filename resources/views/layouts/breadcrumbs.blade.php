<style>
    .breadcrumb>li+li:before {
        content: none;
    }
</style>
<div class="breadcrumbs ace-save-state" id="breadcrumbs">
    <ul id="topTips" class="breadcrumb" style="margin-bottom: 4px;"></ul>
</div>
<!--[if !IE]> -->
<script src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
<!-- <![endif]-->
<script type="text/javascript">
    var updateState = 'true';
    var urlArr = [];
    var oldUrlArr = sessionStorage.getItem('oldUrlArr') || '[]';
    var urlArr = JSON.parse(oldUrlArr);
    
   
    updateState = sessionStorage.getItem('updateState') || 'true';
    
    if(updateState == 'true' && $('.submenu .active a').attr('href')) {
        
        if(window.location.href == $('.submenu .active a').attr('href').trim()) {
            var urlState = true;
            if(urlArr.length) {
                urlArr.forEach(function(item) {
                    if(item.name == $('.submenu .active a').text().trim()) {
                        item.href = window.location.href;
                        urlState = false;
                    }
                });
            }
           
            if(urlState) {
                urlArr.push({
                    name: $('.submenu .active a').text().trim(),
                    href: $('.submenu .active a').attr('href')
                });
            }
           
        } else {
            var urlState = true;
            if(urlArr.length) {
                urlArr.forEach(function(item) {
                    if(item.name == $('.submenu .active a').text().trim()) {
                        item.href = window.location.href;
                        urlState = false;
                    }
                });
            }
           
            if(urlState) {
                urlArr.push({
                    name: $('.submenu .active a').text().trim(),
                    href: window.location.href
                });
            }
        }
        

        urlArr = uniqArr(urlArr);
        openPageList(urlArr);
        // 存储值：将对象转换为Json字符串
        window.sessionStorage.setItem('oldUrlArr', JSON.stringify(urlArr));
    } else {
        openPageList(urlArr);
        window.sessionStorage.setItem('updateState', 'true');
       
        // if(urlArr.length) {
        //     var state = true;
        //     urlArr.forEach(function(item) {
        //         if(item.href == $('.submenu .active a').attr('href')) {
        //             state = false;
        //         }
        //     });
        //     if(state) {
        //         window.location.href = urlArr[urlArr.length-1].href;
        //     } 
        // } else {
        //     window.location.href = '/';
        // }
    }
   
    $('body').on('click','.btn-close-page',function(e){
        $(this).parent().attr("href","javascript:void(0)");
       
        window.sessionStorage.setItem('updateState', 'false');
        var closeUrl = '';
        var currentArr = [];
        closeUrl = $(this).attr('data-url');
        urlArr.forEach(function(item) {
           if(item.href !== closeUrl) {
                currentArr.push(item);
           }
        });
       
        urlArr = currentArr;
        window.sessionStorage.setItem('oldUrlArr', JSON.stringify(urlArr));
        if(urlArr.length) {
            if(closeUrl.trim() !== window.location.href) {
                window.location.href = window.location.href;
            } else {
                window.location.href = urlArr[urlArr.length-1].href;
            }
        } else {
            window.location.href = '/';
        }
        
        openPageList(urlArr);
    });
    
    function uniqArr(arr) {
        var result = [];
        var obj = {};
        for(var i =0; i<arr.length; i++){
            if(!obj[arr[i].href] && arr[i].href && arr[i].name){
                result.push(arr[i]);
                obj[arr[i].href] = true;
            }
        }
        return result;
    };

    // 实现Tab切换
    function openPageList(urlArrList) {
        var strHtml = '';
        if(urlArrList.length) {
            urlArrList.forEach(function(item) {
                strHtml += `<li>
                    <a href="${item.href}" style="font-size: 14px;${aCss(item.href)};color:#C0C0C0;padding:4px 18px!important;" class=" btn-sm btn-white">
                        <font style="vertical-align: baseline;">
                            <font style="vertical-align: baseline;">${item.name}</font>
                        </font>
                        <i data-url="${item.href}" class="ace-icon fa  bigger-110  btn-close-page" style="${aCss(item.href)} vertical-align: super;border-bottom:none!important;box-shadow: none!important;">x</i>
                    </a>
                </li>`;
            });
        }
        $('.breadcrumb').html(strHtml);
    };

    // 给当前页面导航添加背景色
    function aCss(currUrl) {
        // if(currUrl == $('.submenu .active a').attr('href')) {
        if(currUrl.trim() ==  window.location.href) {
            return 'background: #FFFFFF !important;color: #119BE7 !important; border-bottom: 2px solid #0095E7;border-radius:0px;box-shadow: 3px 3px 2px #CCE6F1;font-weight:bold;';
        }
        return '';
    };

</script>
