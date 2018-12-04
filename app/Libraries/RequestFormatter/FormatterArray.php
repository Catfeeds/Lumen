<?php
/**
 * 格式化数组
 * User: ruiyanchao
 * Date: 2017/12/13
 * Time: 上午11:05
 */

namespace  App\Libraries\RequestFormatter;

use App\Libraries\RequestFormatter;

class FormatterArray extends FormatterBase implements RequestFormatter {

    /**
     * 对数组格式化/数组转换
     * @param string $value 变量值
     * @param array $rule array('name' => '', 'type' => 'array', 'default' => '', 'format' => 'json/explode', 'separator' => '', 'min' => '', 'max' => '')
     * @return array
     */
    public function parse($value, $rule) {
        $rs = $value;
        if (!is_array($rs)) {
            $ruleFormat = !empty($rule['format']) ? strtolower($rule['format']) : '';
            if ($ruleFormat == 'explode') {
                $rs = explode(isset($rule['separator']) ? $rule['separator'] : ',', $rs);
            } else if ($ruleFormat == 'json') {
                $rs = json_decode($rs, TRUE);
            } else {
                $rs = array($rs);
            }
        }
        $this->filterByRange(count($rs), $rule);

        return $rs;
    }
}