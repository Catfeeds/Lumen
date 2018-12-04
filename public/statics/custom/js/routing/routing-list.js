$(function () {
    // if(window.name!="procedureIndex"){
    //     location.reload();
    //     window.name = "procedureIndex";
    // }else{
    //     window.name="";
    // }

    getListData();
    bindEvent();
});


function getListData() {
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['route'].list + "?" + _token,
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results && rsp.results.length) {
                createHtml($('.table_tbody'), rsp.results)
            } else {
                noData('暂无数据', 5);
            }
        },
        fail: function (rsp) {
            console.log('获取列表信息失败');
        }
    }, this);
}

function createHtml(ele, data) {

    var editurl = $('#route_edit').val(),
        viewurl = $('#route_view').val();
    data.forEach(function (item, index) {
        var tr = ` <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td style="max-width: 500px;word-break: break-all">${tansferNull(item.description)}</td>
                    <td class="right nowrap">
                        <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.id}"><button class="button pop-button view" data-id="${item.id}">查看</button></a>
                        <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button edit">编辑</button></a>
                        <button class="button pop-button delete" data-id="${item.id}">删除</button>
                    </td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    })
}

function bindEvent() {
    $('body').on('click', '.pop-button.delete', function () {
        var id = $(this).attr('data-id');
        $(this).parents('tr').addClass('active');
        checkHasUse(id);
    })
}

function checkHasUse(id) {
    AjaxClient.get({
        url: URLS['route'].hasUsed + "?route_id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.exist == 0) {
                layer.confirm('将执行删除操作?', {
                    icon: 3, title: '提示', offset: '250px', end: function () {
                        $('.uniquetable tr.active').removeClass('active');
                    }
                }, function (index) {
                    deleteRoute(id);
                    layer.close(index);
                });
            } else {
                LayerConfig('fail', '工艺路线已经被使用，不可删除');
                $('.uniquetable tr.active').removeClass('active');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('做法检测失败');
        }
    }, this);
}

function deleteRoute(id) {
    AjaxClient.get({
        url: URLS['route'].deleteRoute + "?" + _token + '&id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            getListData();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message) {
                LayerConfig('fail', rsp.message);
            } else {
                LayerConfig('fail', '删除失败');
            }
        }
    }, this);
}