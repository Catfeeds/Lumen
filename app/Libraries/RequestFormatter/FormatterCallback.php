<?php
/**
 * 格式化回调类型
 * User: ruiyanchao
 * Date: 2017/12/13
 * Time: 上午11:08
 */

namespace  App\Libraries\RequestFormatter;

use App\Libraries\RequestFormatter;

class FormatterCallback extends FormatterBase implements RequestFormatter {

    /**
     * 对回调类型进行格式化
     *
     * @param mixed $value 变量值
     * @param array $rule array('callback' => '回调函数', 'params' => '第三个参数')
     * @return boolean/string 格式化后的变量
     *
     */
    protected  $prefix = 'App\\Http\\Models\\';

    public function parse($value, $rule) {

        $callback = isset($rule['callback'])
            ? $rule['callback']
            : (isset($rule['callable']) ? $rule['callable'] : NULL);
        // 提前触发回调类的加载，以便能正常回调
        if (is_array($callback) && count($callback) >= 2 && is_string($callback[0])) {
            // Type 2：静态类方法，如：array('MyClass', 'myCallbackMethod')
            $callback[0] = $this->prefix.$callback[0];
            class_exists($this->prefix.$callback[0]);
            $callback[0] = new $callback[0];
        } else if (is_string($callback) && preg_match('/(.*)\:\:/', $callback, $macthes)) {
            // Type 4：静态类方法，如：'MyClass::myCallbackMethod'
            $callback    = $this->prefix.$callback;
            $macthes[1]  = $this->prefix.$macthes[1];
            class_exists($this->prefix.$macthes[1]);
        }
        if (empty($callback) || !is_callable($callback)) {
            $name = $rule['name'];
            TEA('3001',"invalid callback for rule: $name'");
        }

        if (isset($rule['params'])) {
            return call_user_func($callback, $value, $rule['params']);
        } else {
            return call_user_func($callback, $value);
        }
    }
}
