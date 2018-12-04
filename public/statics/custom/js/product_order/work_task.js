$(function () {
    bindEvent()
})

function bindEvent() {
    $('body').on('click','.el-tap-wrap .el-tap',function () {
        var form=$(this).attr('data-item');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');

            $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
        }
    });
}