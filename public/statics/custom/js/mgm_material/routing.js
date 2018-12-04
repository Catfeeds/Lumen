;(function($, window, document, undefined) {
	var canvas,cxt;
	var colors={
        'MODE_REQUIRED': {'fill': '#ff5633', 'stroke': '#b33d24'},
        'MODE_SKIPPABLE': {'fill': '#25b95d', 'stroke': '#1a8040'},
        'MODE_SELECTABLE': {'fill': '#ffb333', 'stroke': '#a67321'},
        'MODE_SKIPPABLE_SELECTABLE': {'fill': '#3f8aca', 'stroke': '#265a86'},
        'MODE_VISITED': {'fill': '#b625b9'}
    };
    var RoutingTool = function(ele, opt) {
        this.$element = ele,
        this.defaults = {
            
        },
        this.options = $.extend({}, this.defaults, opt);
    }

    RoutingTool.prototype = {
        initDom: function() {
            this.$element.append(domCreate);
            setTimeout(function(){
            	canvas=document.getElementById('routing_canvas');
            	ctx=canvas.getContext("2d");
            	drawCircle(colors['MODE_SELECTABLE'].fill);
            	drawArrow(ctx, 300, 200, 500,300,30,10,1,'#f36');
            },200);
        },
        bindEvent:function(){
            
        }
    }

    function domCreate(){
    	var dom=`<canvas id="routing_canvas" width="800px" height="600px">
    				Your browser does not support the canvas element.
                </canvas>`;
        return dom;
    }
    
    function drawReact(){

    }

    function drawArrow(ctx, fromX, fromY, toX, toY,theta,headlen,width,color) { 
    	theta = typeof(theta) != 'undefined' ? theta : 30; 
    	headlen = typeof(theta) != 'undefined' ? headlen : 10; 
    	width = typeof(width) != 'undefined' ? width : 1; 
    	color = typeof(color) != 'color' ? color : '#000'; 
    	// 计算各角度和对应的P2,P3坐标 
    	var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI, 
    	angle1 = (angle + theta) * Math.PI / 180, 
    	angle2 = (angle - theta) * Math.PI / 180, 
    	topX = headlen * Math.cos(angle1), 
    	topY = headlen * Math.sin(angle1), 
    	botX = headlen * Math.cos(angle2), 
    	botY = headlen * Math.sin(angle2); 
    	ctx.save(); 
    	ctx.beginPath(); 
    	var arrowX = fromX - topX, 
    	arrowY = fromY - topY; 
    	ctx.moveTo(arrowX, arrowY); 
    	ctx.moveTo(fromX, fromY); 
    	ctx.lineTo(toX, toY); 
    	arrowX = toX + topX; 
    	arrowY = toY + topY; 
    	ctx.moveTo(arrowX, arrowY); 
    	ctx.lineTo(toX, toY); 
    	arrowX = toX + botX; 
    	arrowY = toY + botY; 
    	ctx.lineTo(arrowX, arrowY); 
    	ctx.strokeStyle = color; 
    	ctx.lineWidth = width; 
    	ctx.stroke(); 
    	ctx.restore(); 
    }

    function drawCircle(color){
    	ctx.fillStyle=color;
		ctx.beginPath();
		ctx.arc(70,18,20,0,Math.PI*2,true);
		ctx.closePath();
		ctx.fill();
    }

    $.fn.MRoutingTool = function(options) {
        var tool = new RoutingTool(this, options);
        tool.initDom();
        tool.bindEvent();
        return tool;
    }
})(jQuery, window, document);