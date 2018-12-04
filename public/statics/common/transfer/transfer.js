;(function($, window, document, undefined) {
    var sHistoryData=[],//原始源数据
    tHistoryData=[],//原始目标数据
    sChangeData=[], //展示给用户源数据
    sArrKey=[],//源数据key值
    sCArrKey=[],//展示数据key值
    tArrKey=[],
    searchNum=0,
    attrflag='',
    extendFlag=true;
    var TransferTool = function(ele, opt) {
        this.$element = ele,
        this.defaults = {
            'sourceTitle': 'source', //源标题
            'targetTitle': 'target', //目标标题
            'link': '',
            'sdata': [], //源数据
            'tdata': [], //目标数据
            'pdata': [],//继承数据
            'flag': '',
            'extendFlag': true,
            'fn':null  //回调方法
        },
        this.options = $.extend({}, this.defaults, opt);
    }

    TransferTool.prototype = {
        initDom: function() {
            attrflag=this.options.flag;
            extendFlag=this.options.extendFlag;
            sHistoryData=this.options.sdata.concat();
            sChangeData=this.options.sdata.concat();
            tHistoryData=this.options.tdata.concat();
            this.$element.append(domCreate(this.options));
            createhtml(this.$element.find('.source-panel'),this.options.sdata);
            createhtml(this.$element.find('.target-panel'),this.options.tdata);
            if(this.options.pdata.length){
                createhtml(this.$element.find('.parent-panel'),this.options.pdata);
            }else{
                this.$element.find('.parent-panel').hide();
            }
        },
        bindEvent:function(){
            this.$element.off('click','.el-button.import').on('click','.el-button.import',{"options": this.options},importClick);
            this.$element.find('.source-panel').off('click','.el-checkbox_input').on('click','.el-checkbox_input',sourceInputClick);
            this.$element.find('.target-panel').off('click','.el-checkbox_input').on('click','.el-checkbox_input',targetInputClick);
            this.$element.find('.target-panel').off('click','.el-radio-input').on('click','.el-radio-input',{"options": this.options},radioInputClick);
        },
        destroy: function(){
            this.$element.html('');
        },
        changeData: function(ele,data){
            sChangeData=data.concat();
            createhtml(ele,data);
        },
        changeGYData: function(ele,data){
            sChangeData=data.concat();
            sHistoryData=data.concat();
            createhtml(ele,data);
        },
        getLastData: function(){
            return sHistoryData;
        },
        getSubmitEle: function(){
            return getData(this.$element);
        }
    }

    function getData(ele){
        var data=[],itemData={};
        var elem=ele.find('.target-panel .el-checkbox-item');
        return elem;
    }
    //每一项模板
    function itemTemplate(flag,item){
        return flag==='source'?`<div class="el-checkbox el-checkbox-item" data-id="${item.id}">
                        <span class="el-checkbox_input">
                            <span class="el-checkbox-outset"></span>
                            <input type="hidden" value="${item.id}">
                        </span>
                        <div class="el-checkbox-template">
                            <div class="info ${attrflag}" data-id="${item.attribute_definition_id}">
                                <p><b>键值：</b>${item.key}</p>
                                <p><b>名称：</b>${item.name} &nbsp;&nbsp; <b>标签: </b>${item.label}</p>
                            </div>
                        </div>
                    </div>`:flag==='target'?`<div class="el-checkbox el-checkbox-item" data-id="${item.attribute_definition_id}">
                        <span class="el-checkbox_input">
                            <span class="el-checkbox-outset"></span>
                            <input class="selected" type="hidden" value="${item.attribute_definition_id}">
                        </span>
                        <div class="el-checkbox-template">
                            <div class="info ${attrflag}" data-id="${item.attribute_definition_id}">
                                <p><b>键值：</b>${item.key}</p>
                                <p><b>名称：</b>${item.name} &nbsp;&nbsp; <b>标签: </b>${item.label}</p>
                            </div>
                            <div class="is-radio">
                                <label class="el-radio">
                                    <span class="el-radio-input ${item.is_extends?'is-radio-checked':''}">
                                        <span class="el-radio-inner"></span>
                                    </span>
                                    <span class="el-radio-label">可继承？</span>
                                </label>
                            </div>
                        </div>
                    </div>`:flag==='gytarget'?`<div class="el-checkbox el-checkbox-item" data-id="${item.attribute_definition_id}">
                        <span class="el-checkbox_input">
                            <span class="el-checkbox-outset"></span>
                            <input class="selected" type="hidden" value="${item.attribute_definition_id}">
                        </span>
                        <div class="el-checkbox-template">
                            <div class="info ${attrflag}" data-id="${item.attribute_definition_id}">
                                <p><b>键值：</b>${item.key}</p>
                                <p><b>名称：</b>${item.name} &nbsp;&nbsp; <b>标签: </b>${item.label}</p>
                            </div>
                        </div>
                    </div>`:`<div class="el-checkbox el-checkbox-item" data-id="${item.attribute_definition_id}">
                        <input type="hidden" value="${item.attribute_definition_id}">
                        <div class="el-checkbox-template">
                            <div class="info ${attrflag}" data-id="${item.attribute_definition_id}">
                                <p><b>键值：</b>${item.key}</p>
                                <p><b>名称：</b>${item.name} &nbsp;&nbsp; <b>标签: </b>${item.label}</p>
                            </div>
                        </div>
                    </div>`;
    }
    //初始化dom结构
    function domCreate(options){
        var dom=$(`
                <div class="panel_wrapper transfer_panel_wrapper">
                <div class="panel source-panel">
                    <div class="panel-head">${options.sourceTitle}</div>
                    <div class="panel-body">
                        <div class="checkbox-item">                          
                        </div>
                    </div>
                    <div class="panel-footer">
                        <div class="el-checkbox">
                            <span class="el-checkbox_input">
                                <span class="el-checkbox-outset"></span>
                                <input class="el-checkbox-input" type="checkbox" value="">
                            </span>
                            <div class="el-checkbox-template"><div>已选<span class="select-num">0</span>/<span class="all-num">${options.sdata.length}</span>项</div></div>
                        </div>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="el-button import is-disabled to-source">&lt;</button>
                    <button class="el-button import is-disabled to-target">&gt;</button>
                </div>
                <div class="panel target-panel">
                    <div class="panel-head">${options.targetTitle}</div>
                    <div class="panel-body">
                        <div class="checkbox-item">                         
                        </div>
                    </div>
                    <div class="panel-footer">
                        <div class="el-checkbox">
                            <span class="el-checkbox_input">
                                <span class="el-checkbox-outset"></span>
                                <input class="el-checkbox-input" type="checkbox" value="">
                            </span>
                            <div class="el-checkbox-template"><div>已选<span class="select-num">0</span>/<span class="all-num">${options.tdata.length}</span>项</div></div>
                        </div>
                    </div>
                </div>
                <div class="panel parent-panel" style="width: 300px;margin-left: 10px;">
                    <div class="panel-head">继承属性</div>
                    <div class="panel-body">
                        <div class="checkbox-item">                         
                        </div>
                    </div>
                </div>
            </div>
            `);
        return dom;
    }

    function createhtml(ele,data){
        ele.find('.panel-footer .el-checkbox_input').removeClass('is-checked');
        ele.find('.select-num').html(0);
        ele.find('.all-num').html(data.length);
        var nodata=`<p class="el-panel-empty">无数据</p>`;
        var $ele=ele.find('.checkbox-item');
        var flag=ele.hasClass('source-panel')?'source':
        ele.hasClass('target-panel')&&extendFlag==false?'gytarget':
        ele.hasClass('target-panel')&&extendFlag==true?'target':'parent';
        $ele.html('');
        if(data&&data.length){
            data.forEach(function(item,index){
                $ele.append(itemTemplate(flag,item));
                $ele.find('.el-checkbox-item:last-child').data({"item":item});
            });
        }else{
            $ele.append(nodata);
        }
    }

    //获取key值
    function getKey(arr2){
        var arr1=[];
        arr2.forEach(function(item){
            arr1.push(item.key);
        });

        return arr1;
    }

    //源面板checkbox点击事件
    function sourceInputClick(e){
        var ele=e.target,
            panel=$(ele).parents('.source-panel'),
            length=panel.find('.checkbox-item .el-checkbox-item').length,
            footerNum=panel.find('.el-checkbox-template .select-num'),
            toTarget=panel.siblings('.btn-group').find('.to-target');
        commonClick(ele,length,panel,footerNum,toTarget);
    }
    //目标面板checkbox点击事件
    function targetInputClick(e){
        var ele=e.target,
            panel=$(ele).parents('.target-panel'),
            length=panel.find('.checkbox-item .el-checkbox-item').length,
            footerNum=panel.find('.el-checkbox-template .select-num'),
            toSource=panel.siblings('.btn-group').find('.to-source');
        commonClick(ele,length,panel,footerNum,toSource)
    }

    function commonClick(ele,length,panel,footerNum,btnAction){
        $(ele).parent().toggleClass('is-checked');
        if($(ele).parents('.panel-footer').length){
            $(ele).parent().hasClass('is-checked')? 
            (btnAction.removeClass('is-disabled').addClass('el-button--primary'),
            panel.find('.panel-body .el-checkbox_input').addClass('is-checked'),
            footerNum.html(length)):
            (panel.find('.panel-body .el-checkbox_input').removeClass('is-checked'),
            footerNum.html(0),
            btnAction.removeClass('el-button--primary').addClass('is-disabled'));
        }else{
            var panelBody=$(ele).parents('.panel-body');            
            var num=panelBody.find('.el-checkbox_input.is-checked').length;
            footerNum.html(num);
            num===length?panel.find('.panel-footer .el-checkbox_input').addClass('is-checked'):panel.find('.panel-footer .el-checkbox_input').removeClass('is-checked');
            if(num){
                btnAction.removeClass('is-disabled').addClass('el-button--primary');
            }else{
                btnAction.removeClass('el-button--primary').addClass('is-disabled');
            } 
        } 
    }

    //导入导出按钮事件
    function importClick(e){
        e.stopPropagation();
        e.preventDefault();
        var ele=$(e.target);
        if(ele.hasClass('is-disabled')){
            return false;
        }
        var options=e.data.options,
            sourcePanel=ele.parents('.btn-group').siblings('.source-panel'),
            targetPanel=ele.parents('.btn-group').siblings('.target-panel'),
            sindex=-1,scindex=-1,tindex=-1;
        tArrKey=getKey(tHistoryData);
        sArrKey=getKey(sHistoryData);
        sCArrKey=getKey(sChangeData);
        ele.hasClass('to-target')?(options.fn&&typeof options.fn=='function'?(options.fn()):null,sourcePanel.find('.panel-body .el-checkbox_input.is-checked').each(function(index,item){
            $(item).parent().data('item').is_extends=1;
            tHistoryData.push($(item).parent().data('item'));
            sindex=sArrKey.indexOf($(item).parent().data('item').key);
            sindex>-1?(sHistoryData.splice(sindex,1),sArrKey=getKey(sHistoryData)):null;
            scindex=sCArrKey.indexOf($(item).parent().data('item').key);
            scindex>-1?(sChangeData.splice(scindex,1),sCArrKey=getKey(sChangeData)):null;
        }),
        targetPanel.siblings('.btn-group').find('.to-target').removeClass('el-button--primary').addClass('is-disabled'),
        createhtml(targetPanel,tHistoryData),
        createhtml(sourcePanel,sChangeData)
        ):(options.fn&&typeof options.fn=='function'?(options.fn()):null,targetPanel.find('.panel-body .el-checkbox_input.is-checked').each(function(index,item){
            tindex=tArrKey.indexOf($(item).parent().data('item').key);
            tindex>-1?(tHistoryData.splice(tindex,1),
            tArrKey=getKey(tHistoryData),
            $(item).parent().data('item').is_extends=0,
            sHistoryData.push($(item).parent().data('item')),   
            sChangeData.push($(item).parent().data('item')),
            sArrKey=getKey(sHistoryData),
            sCArrKey=getKey(sChangeData)):null;  
        }),
        sourcePanel.siblings('.btn-group').find('.to-source').removeClass('el-button--primary').addClass('is-disabled'),
        createhtml(targetPanel,tHistoryData),
        createhtml(sourcePanel,sChangeData));
    }
    //单选按钮点击事件
    function radioInputClick(e){
        e.stopPropagation();
        e.preventDefault();
        var ele=$(e.target),
        options=e.data.options;
        ele.parent().toggleClass('is-radio-checked');
        var key=ele.parents('.el-checkbox-item').data('item').key;
        tArrKey=getKey(tHistoryData);
        var index=tArrKey.indexOf(key);
        index>-1?tHistoryData[index].is_extends=Number(ele.parent().hasClass('is-radio-checked')):null;
        ele.siblings('input').val(Number(ele.parent().hasClass('is-radio-checked')));
        options.fn&&typeof options.fn=='function'?(options.fn()):null;
    }
    
    $.fn.MTransferTool = function(options) {
        var tool = new TransferTool(this, options);
        tool.initDom();
        tool.bindEvent();
        return tool;
    }
})(jQuery, window, document);