<?php
/**
 * 格式胡整型
 * User: ruiyanchao
 * Date: 2017/12/13
 * Time: 上午10:15
 */

namespace  App\Libraries\RequestFormatter;

use App\Libraries\RequestFormatter;


class FormatterInt extends FormatterBase implements RequestFormatter {

    /**
     * 对整型进行格式化
     *
     * @param mixed $value 变量值
     * @param array $rule array('min' => '最小值', 'max' => '最大值')
     * @return int/string 格式化后的变量
     *
     */
    public function parse($value, $rule) {
        return intval($this->filterByRange(intval($value), $rule));
    }
}