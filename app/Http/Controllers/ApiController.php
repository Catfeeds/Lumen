<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/3/8
 * Time: 上午10:22
 */

namespace App\Http\Controllers;//定义命名空间
use Laravel\Lumen\Routing\Controller as BaseController;
use Symfony\Component\HttpFoundation\Request;//引入Lumen底层控制器




/**
 * 应用模块底层控制器
 * @author  sam.shan   <sam.shan@ruis-ims.cn>
 */
class ApiController extends BaseController
{
    /**
     * 控制器连接M层的实例
     * @var
     */
    protected $model;

    /**
     * 构造方法,由于父类未定义构造方法,所以不需要执行parent::__construct()
     */
    public function __construct()
    {
        $this->middleware('api_token');
    }
}