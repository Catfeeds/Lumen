var wt=[],
minQty='',
lock=false,
poFlag=1,
sameFlag=false,
wos=[],
pageNo=1,
pageNo1=1,
pageSize=20,
xhrs=[];
$(function(){
	getPo();
	bindEvent();
});


//所有的拆wt都返回结果
function xhrOut(){
    var xhrFlag=true;
    for(var i=0;i<xhrs.length;i++){
        if(xhrs[i].readyState != 4){
            xhrFlag=false;
            break;
        }
    }

    return xhrFlag;
}

//获取生产订单
function getPo(){
    AjaxClient.get({
        url: URLS['pro'].pro+"?page_no="+pageNo+"&page_size="+pageSize+"&sort=id&order=desc&status=1&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var totalCount=rsp.paging.total_records||0,
            pageCount=Math.ceil(totalCount/pageSize);
            if(rsp.results && rsp.results.length){
                createPro(rsp.results);
                if(pageNo==1&&$('.pro-item').length){
                    $('.work-order .pro-item:first-child').click();
                }
            }else if(!$('.pro-item').length){
                $('.work-order').html('<p style="text-align: center;padding: 5px;">暂无数据</p>');
                $('.el-radio-input.is-radio-checked').removeClass('is-radio-checked');
                $('.right').hide();
            }
            if(totalCount>pageSize&&pageCount>pageNo){
                $('.left .more-btn').show();
            }else{
                $('.left .more-btn').hide();
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取待处理订单列表失败');
        }
    });
}

//获取生产任务
function getWt(id){
    xhrs=[];
    AjaxClient.get({
        url: URLS['pro'].wt+"?page_no="+pageNo1+"&page_size="+pageSize+"&sort=id&order=asc&"+_token+"&production_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results && rsp.results.length){
                poFlag=0;
                createWt($('.wt-wrap .wts'),rsp.results);
            }else if(rsp.results && rsp.results.length==0){//没有可拆的wt，刷新po
                poFlag++;
                if(poFlag<2){//po最多刷两次，没有wt也不在重新刷新po
                    $('.left .work-order').html('');
                    pageNo=1;
                    pageNo1=1;
                    getPo();
                }
            }
            var totalCount=rsp.paging.total_records||0,
            pageCount=Math.ceil(totalCount/pageSize);
            if(totalCount>pageSize&&pageCount<pageNo1){
                $('.wts-wrap .more-btn').show();
            }else{
                $('.wts-wrap .more-btn').hide();
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取待处理任务列表失败');
        }
    });
}

function postSplit(data){
	var xhr=AjaxClient.post({
        url: URLS['aps'].split,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            xhrAction();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            xhrAction();
            console.log('拆单失败');
        }
    });

    return xhr;
}

function xhrAction(){
    var xhrFlag=xhrOut();
    if(xhrFlag){
        var id=$('.pro-item.selected').attr('data-id');
        var xhrErrorNum=0;
        for(var i=0;i<xhrs.length;i++){
            if(xhrs[i].status!=200||xhrs[i].responseJSON.code!=200){
                xhrErrorNum++;
            }
        }
        if(xhrErrorNum!=0){
            LayerConfig('fail',xhrErrorNum+'个wt拆单失败,请重拆',function(){
                resetSplit();
                $('.wts-wrap .wts').html('');
                getWt(id);
            });
        }else{
            console.log('拆单成功');
            LayerConfig('success','拆单成功',function(){
                resetSplit();
                $('.wts-wrap .wts').html('');
                getWt(id);
            });
        }
    }
    wt=[];
}

//重置split-wrap
function resetSplit(){
    $('#wt-input').val('').siblings('.info').html('');
    $('.wo-wrap').html('');
    $('.action2').hide();
    $('.el-button.split').removeClass('is-disabled');
    $('.split-wrap').hide();
}

//生成订单列表
function createPro(data){
    data.forEach(function(item){
       var prohtml=`<div class="pro-item" data-id="${item.product_order_id}">${item.number}</div>`;
        $('.left .work-order').append(prohtml);
        $('.left .work-order').find('.pro-item:last-child').data('proItem',item);
    });
}

//生成订单详情
function createProInfo(data){
	var proele=$('.order-wrap');
	proele.find('.product').html(data.material_name);
	proele.find('.number').html(data.qty);
	proele.find('.scrap').html(data.scrap);
	proele.find('.start').html(data.start_date);
	proele.find('.end').html(data.end_date);
}

//生成任务列表
function createWt(ele,data){
    // ele.html('');
    var editClass=$('.el-radio-input.is-radio-checked').length?'':'noedit',
    hideClass=$('.el-radio-input.is-radio-checked').find('.status.yes').length?'':'hide';
    data.forEach(function(item){
      var wtHtml=`<div class="wt-item-wrap" data-id="${item.work_task_id}">
      		  <span class="el-checkbox_input ${hideClass}">
                <span class="el-checkbox-outset"></span>
              </span>
      		  <div class="wt-item ${editClass}" data-id="${item.work_task_id}" data-qty="${item.qty}" data-num="${item.wt_number}">
				  <p class="wt-number" data-id="${item.work_task_id}">${item.wt_number}</p>
	              <p class="wt-qty">数量:<span>${item.qty}</span></p>
      		  </div>
              </div>`;
        ele.append(wtHtml);
        ele.find('.wt-item-wrap:last-child').data('wtItem',item);
    });   
}

//生成相同数量wo列表
function createSameWo(val,flag){
    wos=[];
	var wowrap='',wo='',num=0;
    if(flag=='multi'){
        $('.wt-item.active').each(function(){
            var data=$(this).parent().data('wtItem'),
            woNum=Math.ceil(data.qty/Number(val));
            var woobj={
                _token: TOKEN,
                operation_order_id: data.work_task_id
            },split_rules=[];
            for(var i=0;i<woNum;i++){
                var woNumber=val;
                if(i==(woNum-1)){
                    var left=data.qty%Number(val);
                    if(left!=0){
                        woNumber=left;
                    }
                }
                split_rules.push(Number(woNumber));
                wo+=`<tr class="wo-item"><td><span>${i+1+num}</span></td><td>${data.wt_number}</td><td><span>WO</span></td><td>数量：${woNumber}</td></tr>`;
            }
            num+=woNum;
            woobj.split_rules=JSON.stringify(split_rules);
            wos.push(woobj);
        });
    }else{
        var data=$('.wt-item.active').parent().data('wtItem'),
        woNum=Math.ceil(data.qty/Number(val));
        var woobj={
            _token: TOKEN,
            operation_order_id: data.work_task_id
        },split_rules=[];
        num=woNum;
        for(var i=0;i<woNum;i++){
            var woNumber=val;
            if(i==(woNum-1)){
                var left=data.qty%Number(val);
                if(left!=0){
                    woNumber=left;
                }
            }
            split_rules.push(Number(woNumber));
            wo+=`<tr class="wo-item"><td><span>${i+1}</span></td><td>${data.wt_number}</td><td><span>WO</span></td><td>数量：${woNumber}</td></tr>`;
        }
        woobj.split_rules=JSON.stringify(split_rules);
        wos.push(woobj);
    }
	
	wowrap=`<div class="table-wrap"><table>
	<tbody>${wo}</tbody>
	</table></div>
	<p>一共<span class="wo-num">${num}</span>个工单</p>`;
	$('.wo-wrap').html(wowrap);
	// var woWrap=`<div class="wo-wrap">${wo}</div>`;
}

// function wo(){
//     var woNum=Math.ceil(data.qty/Number(val));
// }

//生成不同数量wo列表
function createDiverseWo(val){
	if($('.wo-item').length){
		var len=$('.wo-item').length;
		var tr=`<tr class="wo-item" data-qty="${val}"><td><span>${len+1}</span></td><td><span>WO</span></td><td>数量：${val}</td></tr>`;
		$('.table-wrap tbody').append(tr);
        $('.table-wrap').siblings('p').find('span').html(len+1);
	}else{
		var wrap=`<div class="table-wrap"><table>
		<tbody><tr class="wo-item" data-qty="${val}"><td><span>1</span></td><td><span>WO</span></td><td>数量：${val}</td></tr></tbody>
		</table></div><p>一共<span class="wo-num">1</span>个工单</p>`;
		$('.wo-wrap').html(wrap);
	}
}

//获取wtid
function getWtId(data){
	var ids=[],qty=[];
	data.forEach(function(item){
		ids.push(item.work_task_id);
		qty.push(item.qty);
	});
	var obj={
		ids: ids,
		qty: qty
	};
	return obj;
}

function bindEvent(){
    //加载更多
    $('body').on('click','.el-button.more',function(){
        if($(this).hasClass('po-more')){
            pageNo++;
            getPo();
        }else if($(this).hasClass('wt-more')){
            pageNo1++;
            var id=$('.pro-item.selected').attr('data-id');
            getWt(id);
        }
    });

    //重拆
    $('body').on('click','.split-again',function(){
        $('#wt-input').val('').siblings('.info').html('');
        $('.wo-wrap').html('');
        $('.action2').hide();
        $('.el-button.split').removeClass('is-disabled');
        lock=false;
    });

    //生产单点击事件
    $('body').on('click','.pro-item',function(){
        if(lock){
            LayerConfig('fail','请先确认已拆的工单');
            return false;
        }
        $(this).addClass('selected').siblings().removeClass('selected');
    	var id=$(this).attr('data-id');
    	var data=$(this).data('proItem');
    	createProInfo(data);
        resetSplit();
        $('.wt-wrap .wts').html('');
    	getWt(id);
    });
    //wt点击事件
    $('body').on('click','.wt-item:not(.noedit)',function(){
        if(lock){
            LayerConfig('fail','请先确认已拆的工单');
            return false;
        }
    	if(!$(this).hasClass('active')){
            $('.wt-item').removeClass('active');
    		$(this).addClass('active');
            if($('.split-wrap').is(':hidden')){
                $('.split-wrap').css('display','flex');
            }
    	}
    });

    //checkbox 点击
    $('body').on('click','.el-checkbox_input',function (e) {
        $(this).toggleClass('is-checked');
        if($(this).hasClass('is-checked')){
        	var data=$(this).siblings('.wt-item').addClass('active').parent().data('wtItem');
        	var ids=getWtId(wt).ids;
        	if(ids.indexOf(data.work_task_id)==-1){
        		wt.push(data);
        	}

            $('.wt-item.active').each(function(){
                if(!$(this).siblings('.el-checkbox_input').hasClass('is-checked')){
                    $(this).removeClass('active');
                }
            })
        }else{
        	var id=$(this).siblings('.wt-item').removeClass('active').attr('data-id'),
        	ids=getWtId(wt).ids,
        	index=ids.indexOf(Number(id));
        	wt.splice(index,1);
        }
        if($('.el-checkbox_input.is-checked').length&&$('.split-wrap').is(':hidden')){
            $('.split-wrap').css('display','flex');
        }
    });

    //单选按钮点击事件
	$('body').on('click','.el-radio-input',function(e){
        if(lock){
            LayerConfig('fail','请先确认已拆的工单');
            return false;
        }
		wt=[];
        wos=[];
        $('.wt-item.noedit').removeClass('noedit');
        $('#wt-input').val('');
        $('.split-wrap').hide();
		$(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
		$(this).addClass('is-radio-checked'); 
        $('.wt-item.active').removeClass('active');
		if($(this).find('.status').hasClass('yes')){//等分
			$('.el-button.split').addClass('btn-equal').removeClass('btn-noequal');
			$('.el-checkbox_input.hide').removeClass('hide');
            sameFlag=true;
		}else{//非等分
			$('.el-button.split').addClass('btn-noequal').removeClass('btn-equal');
			$('.el-checkbox_input').addClass('hide').removeClass('is-checked');
            sameFlag=false;
		}    
	});

	$('#wt-input').on('focus',function(){
		var val='';
		if($('.el-checkbox_input.is-checked').length){
			var qty=getWtId(wt).qty;
			minQty=Math.min.apply(Math,qty);
		}else if($('.wt-item.active').length){
            if($('.status.no').parent().hasClass('is-radio-checked')){//不同数量
                var allqty=Number($('.wt-item.active').attr('data-qty'));
                if($('.wo-item').length){
                    $('.wo-item').each(function(){
                        allqty-=Number($(this).attr('data-qty'));
                    });
                }
                minQty=allqty;
                if(minQty==0){
                    $('.el-button.split').addClass('is-disabled');
                }else{
                    $('.el-button.split').removeClass('is-disabled');
                }
            }else{
                minQty=$('.wt-item.active').attr('data-qty');
            }
		}
		val='最大输入值为：'+minQty;
		$(this).siblings('.info').html(val);
	}).on('blur',function(){
		if($(this).val()>Number(minQty)){
			$(this).val(Number(minQty));
		}
        $(this).siblings('.info').html('');
	});

	//拆单
	$('body').on('click','.split:not(.is-disabled)',function(){
        lock=true;
		if($(this).hasClass('btn-equal')){//等分提交
            $(this).addClass('is-disabled');
			var num=$('.equal .el-input').val();
            var flag=$('.el-checkbox_input.is-checked').length? 'multi':'single';
			createSameWo(num,flag);
		}else{//非等分提交
			var num=$('.equal .el-input').val(),
			data=$('.wt-item.active').parent().data('wtItem');
            var allqty=Number($('.wt-item.active').attr('data-qty'));
            if($('.wo-item').length){
                $('.wo-item').each(function(){
                    allqty-=Number($(this).attr('data-qty'));
                });
            }
            if(Number(num)>allqty){
                num=allqty;
                $('.equal .el-input').val(num);
                num==0&&$(this).addClass('is-disabled');
            }
			num>0&&createDiverseWo(num);
		}
        if($('.action2').is(':hidden')){
            $('.action2').show();
        }
	});

    //拆单确认
    $('body').on('click','.split-submit',function(){
        lock=false;
        xhrs=[];
        if(wos.length&&sameFlag){
            wos.forEach(function(item){
                xhrs.push(postSplit(item));
            });
        }else if(sameFlag==false){
            var data=$('.wt-item.active').parent().data('wtItem'),
            split_rules=[];
            $('.table-wrap .wo-item').each(function(){
                split_rules.push(Number($(this).attr('data-qty')));
            });
            var allqty=split_rules.reduce(function(prev, curr, idx, arr){
                return prev + curr;
            });
            if(data.qty!=allqty){
                LayerConfig('fail','拆单后的总量与原单总量不符合');
                lock=true;
                return false;
            }
            var woobj={
                _token: TOKEN,
                operation_order_id: data.work_task_id,
                split_rules: JSON.stringify(split_rules)            
            };
            xhrs.push(postSplit(woobj));
        }
    });
}