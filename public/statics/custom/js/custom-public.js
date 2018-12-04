window.TOKEN='8b5491b17a70e24107c89f37b1036078';
window._token='_token=8b5491b17a70e24107c89f37b1036078';
window.storage='/storage/';

//从本地存储中获取选中的主题
// function getSkin(){
//     if(localStorage.getItem('ace_skin')) {
//         var skin=localStorage.getItem('ace_skin'),
//         skinColor=$('#skin-colorpicker').find('option[data-skin='+skin+']').val();
//         console.log(skin);
//         console.log($('.dropdown-menu.dropdown-caret .colorpick-btn[data-color='+skinColor+']').length)
//         $('.dropdown-menu.dropdown-caret .colorpick-btn[data-color='+skinColor+']').click();
//     }
// }
// getSkin();

// 时间格式化
function formatTime(time){
    var cur=new Date(time);
    var hour=cur.getHours()<10? '0'+cur.getHours():cur.getHours();
    var min=cur.getMinutes()<10? '0'+cur.getMinutes():cur.getMinutes();
    var dateStr=cur.getFullYear()+'/'+Number(cur.getMonth()+1)+'/'+cur.getDate()+' '+hour+':'+min;
    return dateStr;
}

//表格无数据展示
function noData(val,num){
	var noDataTr= `
            <tr>
                <td class="nowrap" colspan="${num}" style="text-align: center;">${val}</td>
            </tr>
        `;
    $('.table_tbody').html(noDataTr);
}

//获取子集
function getChildById(arr,parent_id){
	return arr.filter(function(e){
	  return e.parent_id==parent_id;
	})

}

//子集flag
function hasChilds(data,id){
	return getChildById(data,id).length !== 0;
}

//显示子树
function showChildren(pid){
    $('tr[data-pid="'+pid+'"]').each(function(k,v){
        $(v).show();
        if($(v).hasClass('expand')){
            var pid=$(v).attr("data-id");
            showChildren(pid);
        }
    });
}

//隐藏子树
function hideChildren(pid){
    $('tr[data-pid="'+pid+'"]').each(function(k,v){
        $(v).hide();
        var pid=$(v).attr("data-id");
        hideChildren(pid);
    });
}

// 计算下拉框位置
function getLayerSelectPosition(ele){
	var layerOffset=ele.offset();
    ele.find('.el-select').each(function(item){
        var width=$(this).width();
        var height = $(this).height();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width).css({top: offset.top+33-layerOffset.top,left: offset.left-layerOffset.left});
        //关联工序标签
        $('.procedureModal .el-select-dropdown').css({top: offset.top+height-layerOffset.top});
        $('.abilityModal .el-form-item.abilitySelect .el-select-dropdown').css({top: height+12+'%'});
        // $('.abilityModal .el-form-item.practiceSelect .el-select-dropdown').css({top: offset.top+height-layerOffset.top});
    });
}

//获取url参数列表
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return decodeURI(r[2]);
    return null;
}

//layer各种弹出层
function LayerConfig(type,msg,fn){
    switch(type){
        case 'success':
            return layer.confirm(msg, {
                icon: 6,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                fn&&typeof fn=='function'?fn():null;
                layer.close(index);
            });
        break;
        case 'fail':
            return layer.confirm(msg, {
                icon: 5,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                fn&&typeof fn=='function'?fn():null;
                layer.close(index);
            });
        break;
        case 'load': 
            var bodyWidth=document.body.clientWidth,
                sidebar=$('#sidebar').width(),
                center=(bodyWidth+sidebar)/2;
            return layer.load(2, {shade: 0.3,offset: ['300px',`${center}px`]});
        break;    
    }
}

//生成树结构列表
function selecttreeHtml(fileData, parent_id,flag) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';

    children.forEach(function (item, index) {
      var lastClass=index===children.length-1? 'last-tag' : '';
      var level = item.level;
      var distance,className,itemImageClass;
      var hasChild = hasChilds(fileData, item.id);
      hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
      distance=level * 25;
      var span=level?`<div style="padding-left: ${distance}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`: `<span>${item.name}</span>`;
        _html += `
        <li data-id="${item.id}" data-pid="${parent_id}" data-name="${item.name}" class="${className} el-select-dropdown-item">${span}</li>
        ${selecttreeHtml(fileData, item.id, flag)}
        `;
    });
    return _html;
};

//物料来源配置
var meterielSource=[{
    id: 1,
    name: '采购'
},{
    id: 2,
    name: '自制'
},{
    id: 3,
    name: '委外'
},{
    id: 4,
    name: '客供'
}];

function getCookie(d){
    var b = d + "=";
    var a = document.cookie.split(";");
    for (var e = 0; e < a.length; e++) {
        var f = a[e];
        while (f.charAt(0) == " ") {
            f = f.substring(1)
        }
        if (f.indexOf(b) != -1) {
            return f.substring(b.length, f.length)
        }
    }
    return ""
}

function tansferNull(val){
    return val==null?'':val;
}

//JSON数组去重

// var myArr =[{id:1,value:1,item:1},{id:2,value:1,item:2},{id:3,value:2,item:3},{id:4,value:2,item:3}];
// var check = ['value','item']
function removingDuplicateElementsFromArrays(myArr,checkValueArr) {
    var newArr = [];
    for(var s in myArr){
        if(newArr.length>0){
            var index = 0;
            for(var i in newArr){

                if(getFlag(newArr[i],myArr[s],checkValueArr)){
                    index++;
                }
            }
            if(index==0){
                newArr.push(myArr[s]);
            }
        }else{
            newArr.push(myArr[s]);
        }
    }
    return newArr
}
function getFlag(newobject,oldobject,arr) {
    var flag = false;
    for(var i in arr){
        if(newobject[arr[i]] == oldobject[arr[i]]){
            flag=true;
        }else {
            flag = false;
            break;
        }
    }
    return flag;
}