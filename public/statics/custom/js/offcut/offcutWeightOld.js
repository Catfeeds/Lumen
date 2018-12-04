var  allFormData=[];
$(function () {
    bindEvent();
    getOffcutData();
    var factoryName=localStorage.getItem("factory_name");
    if(factoryName){
        $("#choose_factory").html('').html(factoryName);
    }

});
function bindEvent() {
    $('body').on('click','table tr td',function (e) {
        e.stopPropagation();
        var oldValue = $("#weight").val();
        if(oldValue){
            if($(this).attr('data-id')){
                if($(this).attr('data-id')==11){

                    var newValue=oldValue.substring(0,oldValue.length-1);
                    $("#weight").val(newValue);
                }else if($(this).attr('data-id')==10){
                    var n = (oldValue.split('.')).length-1;
                    if(n>0){
                        var newValue = oldValue
                    }else {
                        var newValue = oldValue+'.';

                    }
                    $("#weight").val(newValue);
                } else {

                    var newValue = oldValue+$(this).attr('data-id');
                    newValue = newValue.replace(/[^\d.]/g,"")
                    $("#weight").val(newValue);
                }
            }
        }else {
            if($(this).attr('data-id')=='0' || $(this).attr('data-id')=='10' || $(this).attr('data-id')=='11'){
                var newValue = oldValue;
                newValue = newValue.replace(/[^\d.]/g,"")
                $("#weight").val(newValue);
            }else {
                var newValue = oldValue+$(this).attr('data-id');
                newValue = newValue.replace(/[^\d.]/g,"")
                $("#weight").val(newValue);
            }

        }


    });
    $('body').on('click','.type_item',function (e) {
        e.stopPropagation();
        $(this).addClass('type_item_active');
        $(this).siblings().removeClass('type_item_active');
        showOffcut($(this).attr('data-id'))
    });
    $('body').on('click','.offcut_item',function (e) {
        e.stopPropagation();
        $(this).addClass('offcut_item_active');
        $(this).siblings().removeClass('offcut_item_active');
    });
    $('body').on('click','#submit',function (e) {
        e.stopPropagation();
        var id=$('.offcut_item_active').attr('data-id');
        var value = $('#weight').val()?$('#weight').val():'';
        var factory_id=localStorage.getItem("factory_id");

        if(value!=''){
            addOffcutWeight({
                MATNR: id,
                MENGE:value,
                factory_id:factory_id,
                _token: TOKEN
            })
        }

    });
    $('body').on('click','#choose_factory',function (e) {
        e.stopPropagation();
        getFactory();
    });
    $('body').on('click','.item_factory',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var name = $(this).attr('data-name');
        layer.close(layerModal);
        localStorage.setItem("factory_id",id);
        localStorage.setItem("factory_name",name);
        $("#choose_factory").html('').html(name);
    });

}
//获取工厂列表
function getFactory(){
    AjaxClient.get({
        url: URLS['Offcut'].factory+"?"+_token,
        dataType: 'json',
        success:function (rsp) {
            factoryModel(rsp.results)
        },
        fail: function(rsp){
            layer.msg('获取工厂列表失败,请重试', {icon: 2,offset: '250px'});
        }
    });
}
function factoryModel(data) {
    console.log(data);
    layerModal = layer.open({
        type: 1,
        title: '选择工厂',
        offset: '100px',
        area: ['300px','200px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<div class="formModal" id="select_form">
                   
                     
                    
        </div>`,
        success: function(layero,index){
            var factoryHtml = '';
            data.forEach(function (item) {
                factoryHtml+=`<div class="item_factory"  data-id="${item.id}" data-name="${item.name}">
                       <span>${item.name}</span> 
                   </div>`
            });
            $('#select_form').html(factoryHtml)

        },
        end:function () {
        }
    })
}
function addOffcutWeight(data) {
    AjaxClient.post({
        url: URLS['OffcutWeight'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            $('#weight').val('');
            $('#showOldWeight').html('');
            $('#showOldWeight').css('background-color','red')
            $('#showOldWeight').html(data.MENGE);
            LayerConfig('success','添加成功');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        }
    },this)
}

function getOffcutData(){
    $('.table_tbody').html('');

    AjaxClient.get({
        url: URLS['Offcut'].selete+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results && rsp.results.length){
                allFormData = rsp.results;
                showOffcutType()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','获取列表失败，请刷新重试');
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}
function showOffcutType() {
    var type = [];
    allFormData.forEach(function (item) {
        if(item.level==0){
            type.push(item);
        }
    });
    var typeHtml = '';
    type.forEach(function (item) {
        typeHtml+=`<div class="type_item" data-id="${item.id}">
                       <span>${item.offcut_name}</span> 
                   </div>`
    });
    $('#offcut_type').html(typeHtml)
}

function showOffcut(id) {
    var offcut = [];
    $('#offcun_from').html('');
    allFormData.forEach(function (item) {
        if(item.parent_id==id){
            offcut.push(item);
        }
    });
    var offcutHtml = '';
    offcut.forEach(function (item) {
        offcutHtml+=`<div class="offcut_item" data-id="${item.offcut_code}">
                       <span>${item.offcut_name}</span> 
                   </div>`
    });
    $('#offcun_from').html(offcutHtml);
}