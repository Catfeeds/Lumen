<?php
/**
 * 格式化接口
 * User: ruiyanchao
 * Date: 2017/12/13
 * Time: 上午10:05
 */
namespace  App\Libraries;

interface RequestFormatter {

    public function parse($value, $rule);

}