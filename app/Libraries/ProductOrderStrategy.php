<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/9/20
 * Time: 上午9:51
 */
namespace  App\Libraries;

/**适配来源不同的PO
 * Interface ProductOrderStrategy
 * @package App\Libraries
 * @author Bruce.Chu
 */
interface ProductOrderStrategy
{
    public function getWorkCenterInfo();
}