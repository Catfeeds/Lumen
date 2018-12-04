;(function($,window,document,undefined){
    var ajaxurl='',
    param='name';
    var Autocomplete = function (ele,opt) {
        this.$element = ele;
        this.defaults = {
            'url': null,
            'param': 'name',
            'fn': null
        };
        this.options = $.extend({},this.defaults,opt);
    };

    Autocomplete.prototype = {
        init:function(){
            var opt = this.options;
            ajaxurl=this.options.url;
            param=this.options.param;
            ele=this.$element;
            var divwrap=`
                    <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                        </ul>
                    </div>
            `;
            this.$element.after(divwrap);
        },
        bindEvent: function(){
            this.$element.on("focus", focusSearchInput);
            this.$element.on("blur", function (event) {
                setTimeout(function () {
                    blurSearchInput(event);
                }, 500)
            });
            this.$element.on("input", inputSearchInput);
            this.$element.on('keyup', keyUpSearhInput);
            this.$element.parents('.el-select-dropdown-wrap').on("click", ".el-select-dropdown-item.el-auto", function (event) {
                if (!$(event.target).hasClass('disable')) {
                    clickSearchLi(event);
                }
            });
        }
    };

    //获取自动补齐列表
    function getQueryList(obj){
        var name = $.trim(obj.val());
        AjaxClient.get({
            url: ajaxurl+"&"+param+"="+name,
            dataType: 'json',
            success: function(rsp){
                initQueryList(rsp.results,obj); 
            },
            fail: function(rsp){
                console.log('自动补齐失败');
            }
        },this);
    }

    //拼接自动补齐列表
    function initQueryList(data,obj) {
        var ele=obj.parents('.el-select-dropdown-wrap'),
        eleul=ele.find('ul');
        ele.find('ul').empty();
        if (data.length > 0) {
            data.forEach(function(item){
                eleul.append(`<li class="el-select-dropdown-item el-auto">${item[param]}</li>`);
                eleul.find("li:last-child").data('autoItem',item);
            });
        } else {
            ele.find('ul').append('<li class="el-select-dropdown-item el-auto">搜索不到该数据……</li>');
            ele.find("li:last").addClass('disable');
        }
        if (ele.find('.el-select-dropdown').is(":hidden")) {
            ele.find('.el-select-dropdown').slideDown("200");
        }
    }

    function focusSearchInput(event) {
        var obj = $(event.target);
        if (obj.val() !== "") {
            getQueryList(obj);
        }
    }

    function blurSearchInput(event) {
        var obj = $(event.target);
        obj.siblings('.el-select-dropdown').slideUp("200");
    }

    function keyUpSearhInput(event) {
        var obj = $(event.target);
        var sceneryListObj = obj.siblings('ul');
        var activeLi = sceneryListObj.find("li.active");
        if (event.keyCode == "13") {
            if (activeLi.length > 0) {
                activeLi.click();
            }
        } else if (event.keyCode == "38") {
            if (activeLi.length > 0) {
                if (sceneryListObj.find("li:first").hasClass('active')) {
                    activeLi.removeClass('active');
                } else if(sceneryListObj.find("li:eq(1)").hasClass('active')) {
                    activeLi.removeClass('active').prev().addClass('active');
                    sceneryListObj.scrollTop(0);
                } else {
                    activeLi.removeClass('active').prev().addClass('active');
                    activeLi = sceneryListObj.find("li.active");
                    if (activeLi.position().top < 0) {
                        sceneryListObj.scrollTop(sceneryListObj.scrollTop() - activeLi.prev().outerHeight());
                    }
                }            
            }

        } else if (event.keyCode == "40") {
            if (activeLi.length === 0) {
                sceneryListObj.find("li:first").addClass('active');
            } else {
                if (!sceneryListObj.find("li:last").hasClass('active')) {
                    activeLi.removeClass('active').next().addClass('active');
                }
                activeLi = sceneryListObj.find("li.active");
                if (activeLi.position().top >= (186 - activeLi.height())) {
                    sceneryListObj.scrollTop(sceneryListObj.scrollTop() + activeLi.outerHeight());
                }
            }
        }
    }

    function inputSearchInput(event) {
        var inputObj = $(event.target);
        var currentVal = $.trim(inputObj.val());
        setTimeout(function () {
            if ($.trim(inputObj.val()) === currentVal) {
                if ($.trim(inputObj.val()) !== "") {
                    getQueryList(inputObj);
                }else{
                    inputObj.data('inputItem','').siblings('.el-select-dropdown').slideUp("200");
                }
            }
        }, 500);
    }

    function clickSearchLi(event) {
        var obj = $(event.target);
        if (!obj.hasClass('disable')) {
            var name = obj.text(),
            id = obj.attr("data-id"),
            objdata=obj.data('autoItem'),
            inputobj=obj.parents('.el-select-dropdown').siblings('input');
            inputobj.val(name).data('inputItem',objdata).blur();
        }
    }

    $.fn.autocomplete = function(options){
        var autocompleteTool = new Autocomplete(this,options);
        autocompleteTool.init();
        autocompleteTool.bindEvent();
        return autocompleteTool;
    }
})(jQuery,window,document);