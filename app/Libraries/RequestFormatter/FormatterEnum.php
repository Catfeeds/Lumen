<?php
/**
 * 格式化枚举类型
 * User: ruiyanchao
 * Date: 2017/12/13
 * Time: 下午2:27
 */

namespace  App\Libraries\RequestFormatter;

use App\Libraries\RequestFormatter;

class FormatterEnum extends FormatterBase implements RequestFormatter {

    /**
     * 检测枚举类型
     * @param string $value 变量值
     * @param array $rule array('name' => '', 'type' => 'enum', 'default' => '', 'range' => array(...))
     * @return 当不符合时返回$rule
     */
    public function parse($value, $rule) {
        $this->formatEnumRule($rule);

        $this->formatEnumValue($value, $rule);

        return $value;
    }

    /**
     * 检测枚举规则的合法性
     * @param array $rule array('name' => '', 'type' => 'enum', 'default' => '', 'range' => array(...))
     */
    protected function formatEnumRule($rule) {
        $name  = $rule['name'];
        if (!isset($rule['range'])) {
            throw new \Exception("miss $name's enum range");
        }

        if (empty($rule['range']) || !is_array($rule['range'])) {
            throw new \Exception("$name's enum range can not be empty");
        }
    }
}