<?php
/**
 * 公共基类
 * User: ruiyanchao
 * Date: 2017/12/13
 * Time: 上午10:16
 */

namespace  App\Libraries\RequestFormatter;

class FormatterBase {

    /**
     * 根据范围进行控制
     */
    protected function filterByRange($value, $rule) {
        $this->filterRangeMinLessThanOrEqualsMax($rule);

        $this->filterRangeCheckMin($value, $rule);

        $this->filterRangeCheckMax($value, $rule);

        return $value;
    }

    protected function filterRangeMinLessThanOrEqualsMax($rule) {
        if (isset($rule['min']) && isset($rule['max']) && $rule['min'] > $rule['max']) {
            TEA('300',$rule['name']);
        }
    }

    protected function filterRangeCheckMin($value, $rule) {
        if (isset($rule['min']) && $value < $rule['min']) {
            TEA('301',$rule['name']);
        }
    }

    protected function filterRangeCheckMax($value, $rule) {
        if (isset($rule['max']) && $value > $rule['max']) {
            TEA('302',$rule['name']);
        }
    }

    /**
     * 格式化枚举类型
     * @param string $value 变量值
     * @param array $rule array('name' => '', 'type' => 'enum', 'default' => '', 'range' => array(...))
     */
    protected function formatEnumValue($value, $rule) {
        if (!in_array($value, $rule['range'])) {
            TEA('303',$rule['name']);
        }
    }
}