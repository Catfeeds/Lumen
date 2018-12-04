<?php 
/**
 *8000-9000  为仓库的所有错误编码
 *8000-8300  为仓库基础设置错误编码
 *8300-8999  为仓库业务设置错误编码
 */

return [
	//仓位管理
    '8200' => '仓位名称不可以为空',
    '8201' => '仓位编号格式错误(1-10个大写字母组成)',
    '8202' => '仓位编号不可以为空',
    '8203' => '仓位地址描述字数不可以超过500个字符',
    '8204' => '仓位名称已经注册过',
    '8205' => '仓位容量不可以为空',
    '8206' => '仓位所属仓库不能为空',
    '8207' => '仓位编号已经注册过',
    '8208' => '该仓位下存在货物',
    '8209' => '仓库和分区至少选一项',
    '8210' => '仓位描述字数不可以超过500个字符',
    '8211' => '请检查是否存在page_no、page_size',
];





