<?php

define('DBAddress', 'localhost');
define('DBName', 'mes_20180605');
define('DBUser', 'root');
define('DBPassword', 'lesteryou');

//define('DBAddress', '192.168.1.110');
//define('DBName', 'ruis_enterprise');
//define('DBUser', 'ruis');
//define('DBPassword', '123456');


//恒康测试
//define('DBAddress', '101.37.22.130');
//define('DBName', 'ruis_enterprise');
//define('DBUser', 'ruis');
//define('DBPassword', 'jch9sh_shl');

function __autoload($className)
{
    $file_path = __DIR__ . '/../class/' . $className . '.php';
    /**
     * 如果类文件存在，则引入。
     * 此处不需要考虑是否重复引入，因为__autoload()只有在类未被引入的时候才被调用。
     */
    if (file_exists($file_path)) {
        require($file_path);
    } else {
        exit('Not Found The Class:' . $file_path);
    }

}