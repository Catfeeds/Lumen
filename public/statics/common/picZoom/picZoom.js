// 图纸放大缩小
var transformStyle = {
    rotate:"rotate(0deg)",
    scale:"scale(1)",
}
function showBigImg(e,current){
    var imgList = e;
    var modelBg = $("#pcToolBG");
    if (modelBg.length) {
        modelBg.remove();
    }
    modelBg = $('<div id="pcToolBG"></div>');
    var closeBtn = $('<span class="el-icon closeModel"></span>');
    modelBg.append(closeBtn);
    closeBtn.on("click",closeBg);
    var target = $('<ul id="imgWrap"></ul>');
    modelBg.append(target);
    var actions=$('<div id="el-action" class="el-action"><i class="el-icon fa-search-plus"></i><i class="el-icon fa-search-minus"></i><i class="el-icon fa-rotate-right"></i></div>');
    modelBg.append(actions);
    modelBg.on("click",closeBg);
    var left=$(`<div id="el-left-action" style="display: ${imgList.length==1?'none':'block'}" class="el-action"><i class="el-icon fa-chevron-circle-left"></i></div>`);
    var right=$(`<div id="el-right-action" style="display: ${imgList.length==1?'none':'block'}" class="el-action"><i class="el-icon fa-chevron-circle-right"></i></div>`);
    modelBg.append(left).append(right);
    $("body").append(modelBg);
    initImgList(imgList, target,current); 
    zoomPcIMG();
    $('#el-action').on('click','.fa-search-plus',function(e){
        e.stopPropagation();
        e.preventDefault();
        zoomPic(1,$('#imgWrap .current .zoomImg'));
    });
    $('#el-action').on('click','.fa-search-minus',function(e){
        e.stopPropagation();
        e.preventDefault();
        zoomPic(-1,$('#imgWrap .current .zoomImg'));
    });
    $('#el-action').on('click','.fa-rotate-right',function(e){
        e.stopPropagation();
        e.preventDefault();
        rotatePic($('#imgWrap .current .zoomImg'));
    });
    $('#el-left-action:not(.is-disabled)').on('click',function(){
    	$('#el-right-action').removeClass('is-disabled');
    	var cur=$('#imgWrap .current').index();
    	if(cur==0){
    		$(this).addClass('is-disabled');
    	}else{
    		defaultStatus($('#imgWrap .current img'));
    		$('#imgWrap li').eq(cur-1).addClass('current').siblings('li').removeClass('current');
    	}
    });
    $('#el-right-action:not(.is-disabled)').on('click',function(){
    	$('#el-left-action').removeClass('is-disabled');
    	var cur=$('#imgWrap .current').index();
    	if(cur+1==$('#imgWrap li').length){
    		$(this).addClass('is-disabled');
    	}else{
    		defaultStatus($('#imgWrap .current img'));
    		$('#imgWrap li').eq(cur+1).addClass('current').siblings('li').removeClass('current');
    	}
    });
}
function defaultStatus(currImg){
    transformStyle.scale="scale(1)";
    transformStyle.rotate = "rotate(0deg)";
    currImg.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale,
        "left":($(window).width()-currImg.width())/2,
        "top":($(window).height()-currImg.height())/2
    });
    var scale=1;
    currImg.attr("data-scale", scale);
}
function initImgList(imgList, target,current) {
    var isMove = false;
    imgList.each(function() {
        var imgSrc = $(this).attr("data-src"),
        dataId=$(this).attr('data-id');
        var imgItem = $('<li data-id="'+dataId+'"><img class="zoomImg" data-scale="1" data-rotate="0" src="' + imgSrc + '" alt=""></li>');
        var imgObj = imgItem.find("img");
        //设置图纸初始大小
        var img = new Image();
        img.src = imgSrc;
        img.onload=function(){
            imgObj.css({
                "left":($(window).width() - img.width) / 2,
                "top":($(window).height() - img.height) / 2,
                'height':img.height
            });
            if(img.width>$(window).width()||img.height>document.body.clientHeight){
                var widthscale=$(window).width()/img.width,
                heightscale=$(window).height()/img.height,
                scale=Math.max(Math.min(widthscale,heightscale),0.1);
                imgObj.attr("data-scale", scale.toFixed(2));
                transformStyle.scale='scale(' + scale.toFixed(2) + ')';
                imgObj.css({
                    "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
                    "transform": transformStyle.rotate + " " + transformStyle.scale,
                    "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
                });
            }
        }
        imgObj.on({
            "mousedown":function(e){
                e.preventDefault();
                e.stopPropagation();
                isMove = false;
                var mTop = e.clientY;
                var mLeft = e.clientX;
                var oTop = parseFloat($(this).css("top"));
                var oLeft = parseFloat($(this).css("left"));
                var disTop = mTop - oTop;
                var disLeft = mLeft - oLeft;
                var that = $(this);
                that.css({
                    "cursor": "url(images/cur/closedhand.cur) 8 8, default"
                });
                $(document).on("mousemove",function(event){
                    isMove = true;
                    var x = event.clientX;
                    var y = event.clientY;
                    var posX = x - disLeft;
                    var posY = y - disTop;
                    that.css({
                        "top":posY+"px",
                        "left":posX+"px"
                    });
                });
            }
        });
        $(document).on("mouseup",function(e){
            $(document).off("mousemove");
            $(document).off("mousedown");
            $(imgObj).css({
                "cursor": "url(images/cur/openhand.cur) 8 8, default"
            });
        });
        target.append(imgItem);
    });
    target.find('li[data-id='+current+']').addClass('current');
}
function closeBg(e){
    if(e.target.tagName.toLowerCase() != "img"&&e.target.tagName.toLowerCase() != "i"){
        $("body").css("overflow-y", "auto");
        var currImg=$("#imgWrap .zoomImg");
        defaultStatus(currImg);
        $("#pcToolBG").remove();
    }
}
function zoomPcIMG() {
    $("body").css("overflow-y", "hidden");
    if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
        $("#imgWrap").on("DOMMouseScroll", function (e) {
            wheelZoom(e, $("#imgWrap .current .zoomImg"), true);
        });
    } else {
        $("#imgWrap").on("mousewheel", function (e) {
            wheelZoom(e, $("#imgWrap .current .zoomImg"));
        });
    }
}
function wheelZoom(e, obj, isFirefox) {
    var zoomDetail = e.originalEvent.wheelDelta;
    if (isFirefox) {
        zoomDetail = -e.originalEvent.detail;  
    }
    zoomPic(zoomDetail, $(obj));
}
function zoomPic(zoomDetail, obj) {
    var scale = Number($(obj).attr("data-scale"));
    if (zoomDetail > 0) {
        scale = scale + 0.05;
    } else {
        scale = scale - 0.05;
    }
    if (scale > 2) {
        scale = 2;
    } else if (scale < 0.1) {
        scale = 0.1;
    }
    obj.attr("data-scale", scale.toFixed(2));
    transformStyle.scale='scale(' + scale.toFixed(2) + ')';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}
function rotatePic(obj){
    var rotate = Number($(obj).attr("data-rotate"));
    rotate+=90;
    if(rotate>=360){
        rotate=0;
    }
    obj.attr("data-rotate", rotate);
    transformStyle.rotate='rotate(' + rotate + 'deg)';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}
//图纸缩放结束