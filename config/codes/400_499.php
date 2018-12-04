<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/21
 * Time: 下午5:02
 */


return [

    /*
     |--------------------------------------------------
     |Restful风格的客户端行为导致的错误码
     |----------------------------------------------------
     |@author sam.shan  <sam.shan@ruis-ims.cn>
     */

    '400'=>'Invalid Request',//用户发出的请求有错误，服务器没有进行新建或修改数据的操作
    '401'=>'Unauthorized',//表示用户没有权限（令牌、用户名、密码错误）。
    '403'=>'Forbidden',//表示用户得到授权（与401错误相对），但是访问是被禁止的。
    '404'=>'Not Found',//用户发出的请求针对的是不存在的记录，服务器没有进行操作|比如要删除要更新的记录早已经不在数据库中了
    '406'=>'Not Acceptable',//用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
    '410'=>'Gone',//用户请求的资源被永久删除，且不会再得到的。
    //'411'=>"You don't Login or haven't used the system for long time, please login again! ",
    '411'=>"登陆状态已经丢失,请重新登陆!",
    //'412'=>'No permission to access the uri.',
    '412'=>'对不起,您没有权限访问该资源,如有需要,请联系系统管理员!',
    '414'=>"Uncle,the page you are looking for could not be found.",

];