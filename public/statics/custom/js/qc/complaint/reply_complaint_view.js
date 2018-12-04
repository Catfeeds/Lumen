var complaint_id;
$(function () {
    complaint_id=getQueryString('id');
    bindEvent();
    viewCurrentComplaint();
});
function bindEvent() {
//tap切换按钮
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){

        if(!$(this).hasClass('active')){
            if($(this).hasClass('el-ma-tap')){
                $(this).addClass('active').siblings('.el-tap').removeClass('active');

            }else{
                var formerForm=$(this).siblings('.el-tap.active').attr('data-item');
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var form=$(this).attr('data-item');
                $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');

            }
        }
    });
    //上一步按钮
    $('body').on('click','.el-button.prev',function(){
        var prevPanel=$(this).attr('data-prev');

        $(this).parents('.el-panel').removeClass('active').siblings('.'+prevPanel).addClass('active');
        $('.el-tap[data-item='+prevPanel+']').addClass('active').siblings().removeClass('active');

    });
    //下一步按钮
    $('body').on('click','.el-button.next:not(.is-disabled)',function(){
        var nextPanel=$(this).attr('data-next');
        $(this).parents('.el-panel').removeClass('active').siblings('.'+nextPanel).addClass('active');
        $('.el-tap[data-item='+nextPanel+']').addClass('active').siblings().removeClass('active');

    });


    $('body').on('click','.submit.save', function (e) {
        e.stopPropagation();
        var check_value_arr = $('#replyNow').find('.check_value'),
        items = [];
        check_value_arr.each(function (k,v) {

            if($(v).attr('data-question')==5){
                items.push({
                    customer_complaint_id:$(v).attr('data-complaint'),
                    question_id:$(v).attr('data-question'),
                    question_value:$(v).is(':checked'),
                    responsible_person_id:$(v).attr('data-employee'),
                })
            }else {
                items.push({
                    customer_complaint_id:$(v).attr('data-complaint'),
                    question_id:$(v).attr('data-question'),
                    question_value:$(v).val(),
                    responsible_person_id:$(v).attr('data-employee'),
                })
            }

        });
        reply({
            sendItem:JSON.stringify(items),
            _token:TOKEN
        });
    })
}
function reply(data) {
    AjaxClient.post({
        url: URLS['complaint'].reply,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp);



        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

        },
        complete: function(){

        }
    },this);
}

function viewCurrentComplaint() {
    AjaxClient.post({
        url: URLS['complaint'].viewCurrentComplaint,
        data:{
            customer_complaint_id:complaint_id,
            _token:TOKEN
        },
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results){
                console.log(rsp);
                if(rsp.results.answer){
                    createArealdyReply(rsp.results.answer);
                }
                if(rsp.results.question){
                    createReplyHtml(rsp.results.question);
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

        },
        complete: function(){

        }
    },this);
}


function createArealdyReply(data) {
    var ele = $('#already');
    var basic_arr  = [],
        outflow_arr = [],
        improve_arr = [],
        process_arr = [],
        tracking_arr = [],
        leaning_arr = [],
        recurring_arr = [];
    ele.html('');
    data.forEach(function (item) {

        if(item.question_order==1){
            basic_arr.push(item);
        }
        if(item.question_order==2){
            outflow_arr.push(item);
        }
        if(item.question_order==3){
            improve_arr.push(item);
        }
        if(item.question_order==4){
            process_arr.push(item);
        }
        if(item.question_order==5){
            tracking_arr.push(item);
        }
        if(item.question_order==6){
            leaning_arr.push(item);
        }
        if(item.question_order==7){
            recurring_arr.push(item);
        }



    });

    if(basic_arr.length){
        var preparation = basic_arr.reduce((r, x) => ((r[x.responsible_person_id] || (r[x.responsible_person_id] = [])).push(x), r), {});
        var achieve = Object.keys(preparation).map(x => preparation[x]);
        achieve.forEach(function (item) {
            ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
                                <h3>根本原因</h3>
                                <hr>
                                <div class="el-form-item" style="margin:20px 0 0 20px;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 200px;">根本原因</label>
                                        <textarea type="textarea" readonly data-complaint="${item[0].customer_complaint_id}" data-employee="${item[0].responsible_person_id}" data-question="${item[0].question_id}"  maxlength="500"  rows="5" class="el-textarea check_value" placeholder="">${item[0].question_value?item[0].question_value:""}</textarea>
                                    </div>
                                    <div>
                                        <p style="margin-bottom: 0;">------------${item[0].responsible_person_name}</p>
                                    </div>
                                </div>
                            </div>`);
        })


    }
    if(outflow_arr.length){
        var preparation = outflow_arr.reduce((r, x) => ((r[x.responsible_person_id] || (r[x.responsible_person_id] = [])).push(x), r), {});
        var achieve = Object.keys(preparation).map(x => preparation[x]);
        achieve.forEach(function (value) {
            var outflow01,outflow02;
            value.forEach(function (item) {
                if(item.question_id==2){
                    outflow01 = item;
                }
                if(item.question_id==3){
                    outflow02 = item;
                }
            });
            ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>流出原因</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">为何从制程管制中流出</label>
                    <textarea type="textarea" readonly data-complaint="${outflow01.customer_complaint_id}" data-employee="${outflow01.responsible_person_id}" data-question="${outflow01.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${outflow01.question_value?outflow01.question_value:""}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">为何从最终检验中流出</label>
                    <textarea type="textarea" readonly data-complaint="${outflow02.customer_complaint_id}" data-employee="${outflow02.responsible_person_id}" data-question="${outflow02.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${outflow02.question_value?outflow02.question_value:""}</textarea>
                </div>
                <div>
                        <p style="margin-bottom: 0;">------------${outflow02.responsible_person_name}</p>
                 </div>
            </div>
            
        </div>`);
        })


    }
    if(improve_arr.length){
        var preparation = improve_arr.reduce((r, x) => ((r[x.responsible_person_id] || (r[x.responsible_person_id] = [])).push(x), r), {});
        var achieve = Object.keys(preparation).map(x => preparation[x]);
        achieve.forEach(function (value) {
            var improve01,improve02,improve03;
            console.log()
            value.forEach(function (item) {
                if(item.question_id==4){
                    improve01 = item;
                }
                if(item.question_id==9){
                    improve02 = item;
                }
                if(item.question_id==10){
                    improve03 = item;
                }
            });
            ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>永久性改善措施</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">如何防止在发生</label>
                    <textarea type="textarea" readonly data-complaint="${improve01.customer_complaint_id}" data-employee="${improve01.responsible_person_id}" data-question="${improve01.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${improve01.question_value?improve01.question_value:""}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">怎样检查出此不良</label>
                    <textarea type="textarea" readonly data-complaint="${improve02.customer_complaint_id}" data-employee="${improve02.responsible_person_id}" data-question="${improve02.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${improve02.question_value?improve02.question_value:""}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">何时生产的产品为改善后产品</label>
                    <textarea type="textarea" readonly data-complaint="${improve03.customer_complaint_id}" data-employee="${improve03.responsible_person_id}" data-question="${improve03.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${improve03.question_value?improve03.question_value:""}</textarea>
                    
                </div>
                <div>
                        <p style="margin-bottom: 0;">------------${improve03.responsible_person_name}</p>
                    </div>
            </div>
        </div>`);
        })


    }
    if(process_arr.length){
        var preparation = process_arr.reduce((r, x) => ((r[x.responsible_person_id] || (r[x.responsible_person_id] = [])).push(x), r), {});
        var achieve = Object.keys(preparation).map(x => preparation[x]);
        achieve.forEach(function (value) {
            var process01,process02,process03,process04;
            value.forEach(function (item) {
                if(item.question_id==5){
                    process01 = item;
                }
                if(item.question_id==6){
                    process02 = item;
                }
                if(item.question_id==7){
                    process03 = item;
                }
                if(item.question_id==8){
                    process04 = item;
                }
            });
            ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>相关工艺文件</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">是否需要更新相关工艺文件</label>
                    <ul class="tg-list">
                        <li class="tg-list-item">
                            <input class="tgl tgl-light check_value" data-complaint="${process01.customer_complaint_id}" data-employee="${process01.responsible_person_id}" data-question="${process01.question_id}" ${process01.question_value==1?"checked":""}  type="checkbox"/>
                            <label class="tgl-btn" </label>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">文件更新日期</label>
                    <input type="text"  readonly  data-name="名称" class="el-input check_value" data-complaint="${process02.customer_complaint_id}" data-employee="${process02.responsible_person_id}" data-question="${process02.question_id}"  placeholder="" value="${process02.question_value?process02.question_value:''}">

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">文件执行日期</label>
                    <input type="text" readonly  data-name="名称" class="el-input check_value" data-complaint="${process03.customer_complaint_id}" data-employee="${process03.responsible_person_id}" data-question="${process03.question_id}"  placeholder="" value="${process03.question_value?process03.question_value:''}">

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">何时生产的产品为改善后的产品</label>
                    <input type="text"   readonly data-name="" class="el-input check_value" data-complaint="${process04.customer_complaint_id}" data-employee="${process04.responsible_person_id}" data-question="${process04.question_id}" placeholder="" value="${process04.question_value?process04.question_value:''}">
                    
                </div>
                <div>
                        <p style="margin-bottom: 0;">------------${process04.responsible_person_name}</p>
                    </div>
            </div>
        </div>`);
        })
    }
    if(tracking_arr.length){
        var preparation = tracking_arr.reduce((r, x) => ((r[x.responsible_person_id] || (r[x.responsible_person_id] = [])).push(x), r), {});
        var achieve = Object.keys(preparation).map(x => preparation[x]);
        achieve.forEach(function (value) {
            var tracking01,tracking02,tracking03;
            value.forEach(function (item) {
                if(item.question_id==11){
                    tracking01 = item;
                }
                if(item.question_id==12){
                    tracking02 = item;
                }
                if(item.question_id==13){
                    tracking03 = item;
                }
            });
            ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>改善跟踪</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">跟踪区间所产生的数量</label>
                    <input type="number" min="0" readonly class="el-input check_value" data-complaint="${tracking01.customer_complaint_id}" data-employee="${tracking01.responsible_person_id}" data-question="${tracking01.question_id}"  value="${tracking01.question_value?tracking01.question_value:''}">

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">改善措施的确认方法</label>
                    <textarea type="textarea" readonly data-complaint="${tracking02.customer_complaint_id}" data-employee="${tracking02.responsible_person_id}" data-question="${tracking02.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${tracking02.question_value?tracking02.question_value:""}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">改善措施的效果</label>
                    <textarea type="textarea" readonly data-complaint="${tracking03.customer_complaint_id}" data-employee="${tracking03.responsible_person_id}" data-question="${tracking03.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${tracking03.question_value?tracking03.question_value:""}</textarea>
                    
                </div>
                <div>
                        <p style="margin-bottom: 0;">------------${tracking03.responsible_person_name}</p>
                    </div>
            </div>
        </div>`);
        })




    }
    if(leaning_arr.length){
        var preparation = leaning_arr.reduce((r, x) => ((r[x.responsible_person_id] || (r[x.responsible_person_id] = [])).push(x), r), {});
        var achieve = Object.keys(preparation).map(x => preparation[x]);
        achieve.forEach(function (value) {
            ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
                                <h3>经验教训</h3>
                                <hr>
                                <div class="el-form-item" style="margin:20px 0 0 20px;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 200px;">经验教训</label>
                                        <textarea type="textarea" readonly data-complaint="${value[0].customer_complaint_id}" data-employee="${value[0].responsible_person_id}" data-question="${value[0].question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${value[0].question_value?value[0].question_value:""}</textarea>
                                    </div>
                                    <div>
                                        <p style="margin-bottom: 0;">------------${value[0].responsible_person_name}</p>
                                    </div>
                                </div>
                            </div>`);
        })

    }
    if(recurring_arr.length){
        var preparation = recurring_arr.reduce((r, x) => ((r[x.responsible_person_id] || (r[x.responsible_person_id] = [])).push(x), r), {});
        var achieve = Object.keys(preparation).map(x => preparation[x]);
        achieve.forEach(function (value) {
            ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
                                <h3>重复原因</h3>
                                <hr>
                                <div class="el-form-item" style="margin:20px 0 0 20px;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 200px;">重复原因</label>
                                        <textarea type="textarea" readonly data-complaint="${value[0].customer_complaint_id}" data-employee="${value[0].responsible_person_id}" data-question="${value[0].question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${value[0].question_value?value[0].question_value:""}</textarea>
                                    </div>
                                    <div>
                                        <p style="margin-bottom: 0;">------------${value[0].responsible_person_name}</p>
                                    </div>
                                </div>
                            </div>`);
        })

    }
}

function createReplyHtml(data) {
    var ele = $('#replyNow');
    var basic_arr  = [],
        outflow_arr = [],
        improve_arr = [],
        process_arr = [],
        tracking_arr = [],
        leaning_arr = [],
        recurring_arr = [];
    ele.html('');
    data.forEach(function (item) {

        if(item.question_order==1){
            basic_arr.push(item);
        }
        if(item.question_order==2){
            outflow_arr.push(item);
        }
        if(item.question_order==3){
            improve_arr.push(item);
        }
        if(item.question_order==4){
            process_arr.push(item);
        }
        if(item.question_order==5){
            tracking_arr.push(item);
        }
        if(item.question_order==6){
            leaning_arr.push(item);
        }
        if(item.question_order==7){
            recurring_arr.push(item);
        }


    });
    if(basic_arr.length){
        ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
                                <h3>根本原因</h3>
                                <hr>
                                <div class="el-form-item" style="margin:20px 0 0 20px;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 200px;">根本原因</label>
                                        <textarea type="textarea" data-complaint="${basic_arr[0].customer_complaint_id}" data-employee="${basic_arr[0].responsible_person_id}" data-question="${basic_arr[0].question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${basic_arr[0].question_value}</textarea>
                                    </div>
                                </div>
                            </div>`);
    }
    if(outflow_arr.length){
        var outflow01,outflow02;
        outflow_arr.forEach(function (item) {
            if(item.question_id==2){
                outflow01 = item;
            }
            if(item.question_id==3){
                outflow02 = item;
            }
        });
        ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>流出原因</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">为何从制程管制中流出</label>
                    <textarea type="textarea" data-complaint="${outflow01.customer_complaint_id}" data-employee="${outflow01.responsible_person_id}" data-question="${outflow01.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${outflow01.question_value}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">为何从最终检验中流出</label>
                    <textarea type="textarea" data-complaint="${outflow02.customer_complaint_id}" data-employee="${outflow02.responsible_person_id}" data-question="${outflow02.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${outflow02.question_value}</textarea>

                </div>
            </div>
        </div>`);

    }
    if(improve_arr.length){
        var improve01,improve02,improve03;
        improve_arr.forEach(function (item) {
            if(item.question_id==4){
                improve01 = item;
            }
            if(item.question_id==9){
                improve02 = item;
            }
            if(item.question_id==10){
                improve03 = item;
            }
        });
        ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>永久性改善措施</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">如何防止在发生</label>
                    <textarea type="textarea" data-complaint="${improve01.customer_complaint_id}" data-employee="${improve01.responsible_person_id}" data-question="${improve01.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${improve01.question_value}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">怎样检查出此不良</label>
                    <textarea type="textarea" data-complaint="${improve02.customer_complaint_id}" data-employee="${improve02.responsible_person_id}" data-question="${improve02.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${improve02.question_value}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">何时生产的产品为改善后产品</label>
                    <textarea type="textarea" data-complaint="${improve03.customer_complaint_id}" data-employee="${improve03.responsible_person_id}" data-question="${improve03.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${improve03.question_value}</textarea>

                </div>
            </div>
        </div>`);

    }
    if(process_arr.length){
        var process01,process02,process03,process04;
        process_arr.forEach(function (item) {
            if(item.question_id==5){
                process01 = item;
            }
            if(item.question_id==6){
                process02 = item;
            }
            if(item.question_id==7){
                process03 = item;
            }
            if(item.question_id==8){
                process04 = item;
            }
        });
        ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>相关工艺文件</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">是否需要更新相关工艺文件</label>
                    <ul class="tg-list">
                        <li class="tg-list-item">
                            <input class="tgl tgl-light check_value" data-complaint="${process01.customer_complaint_id}" data-employee="${process01.responsible_person_id}" data-question="${process01.question_id}" ${process01.question_value==1?"checked":""}  id="is_process" type="checkbox"/>
                            <label class="tgl-btn" for="is_process"></label>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">文件更新日期</label>
                    <input type="text" id="date01"  data-name="名称" class="el-input check_value" data-complaint="${process02.customer_complaint_id}" data-employee="${process02.responsible_person_id}" data-question="${process02.question_id}"  placeholder="" >

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">文件执行日期</label>
                    <input type="text" id="date02"  data-name="名称" class="el-input check_value" data-complaint="${process03.customer_complaint_id}" data-employee="${process03.responsible_person_id}" data-question="${process03.question_id}"  placeholder="" >

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">何时生产的产品为改善后的产品</label>
                    <input type="text" id=""  data-name="" class="el-input check_value" data-complaint="${process04.customer_complaint_id}" data-employee="${process04.responsible_person_id}" data-question="${process04.question_id}" placeholder="" >

                </div>
            </div>
        </div>`);

        laydate.render({
            elem: '#date01'
            ,done: function(value, date, endDate){

            }
        });
        laydate.render({
            elem: '#date02'
            ,done: function(value, date, endDate){

            }
        });

    }
    if(tracking_arr.length){
        var tracking01,tracking02,tracking03;
        tracking_arr.forEach(function (item) {
            if(item.question_id==11){
                tracking01 = item;
            }
            if(item.question_id==12){
                tracking02 = item;
            }
            if(item.question_id==13){
                tracking03 = item;
            }
        });
        ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
            <h3>改善跟踪</h3>
            <hr>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">跟踪区间所产生的数量</label>
                    <input type="number" min="0" class="el-input check_value" data-complaint="${tracking01.customer_complaint_id}" data-employee="${tracking01.responsible_person_id}" data-question="${tracking01.question_id}"  value="${tracking01.question_value}">

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">改善措施的确认方法</label>
                    <textarea type="textarea" data-complaint="${tracking02.customer_complaint_id}" data-employee="${tracking02.responsible_person_id}" data-question="${tracking02.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${tracking02.question_value}</textarea>

                </div>
            </div>
            <div class="el-form-item" style="margin:20px 0 0 20px;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 200px;">改善措施的效果</label>
                    <textarea type="textarea" data-complaint="${tracking03.customer_complaint_id}" data-employee="${tracking03.responsible_person_id}" data-question="${tracking03.question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${tracking03.question_value}</textarea>

                </div>
            </div>
        </div>`);

    }
    if(leaning_arr.length){
        ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
                                <h3>经验教训</h3>
                                <hr>
                                <div class="el-form-item" style="margin:20px 0 0 20px;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 200px;">经验教训</label>
                                        <textarea type="textarea" data-complaint="${leaning_arr[0].customer_complaint_id}" data-employee="${leaning_arr[0].responsible_person_id}" data-question="${leaning_arr[0].question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${leaning_arr[0].question_value}</textarea>
                                    </div>
                                </div>
                            </div>`);
    }
    if(recurring_arr.length){
        ele.append(`<div style="width: 800px; border: 1px solid #ccc;padding: 20px;border-radius: 5px;margin-top: 20px;">
                                <h3>重复原因</h3>
                                <hr>
                                <div class="el-form-item" style="margin:20px 0 0 20px;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 200px;">重复原因</label>
                                        <textarea type="textarea" data-complaint="${recurring_arr[0].customer_complaint_id}" data-employee="${recurring_arr[0].responsible_person_id}" data-question="${recurring_arr[0].question_id}"  maxlength="500" id="" rows="5" class="el-textarea check_value" placeholder="">${recurring_arr[0].question_value}</textarea>
                                    </div>
                                </div>
                            </div>`);
    }





}

