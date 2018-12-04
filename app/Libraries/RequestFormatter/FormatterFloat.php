<?php
/**
 * 格式化浮点类型
 * User: ruiyanchao
 * Date: 2017/12/18
 * Time: 上午11:13
 */

namespace  App\Libraries\RequestFormatter;

use App\Libraries\RequestFormatter;

class FormatterFloat extends FormatterBase implements RequestFormatter {

    /**
     * 对浮点型进行格式化
     *
     * @param mixed $value 变量值
     * @param array $rule array('min' => '最小值', 'max' => '最大值')
     * @return float/string 格式化后的变量
     *
     */
    public function parse($value, $rule) {
        return floatval($this->filterByRange(floatval($value), $rule));
    }
}