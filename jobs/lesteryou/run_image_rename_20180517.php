<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/5/17 10:21
 * Desc:
 */
require_once __DIR__ . '/config/config.php';

$Attachment = new BasicClass('attachment');
$select = [
    'id',
    'path',
    'extension'
];
$basePath = '/ruis/wwwroot/emi2c-mes-enterprise/public/storage/';
//$basePath = '/home/ally/emi2c-mes-enterprise/public/storage/';
$startPage = 1;
$dataList = $Attachment->getData($select, ['comment' => 'pretreatment'], [], true, $startPage, 20, 'id', 'ASC');

while (!empty($dataList)) {
    foreach ($dataList as $key => $value) {
        if (strpos($value['path'], $value['extension']) == false) {
            //1.改路径名称
            $newPath = str_replace('.txt', '.' . $value['extension'], $value['path']);
            //2.改文件名称
            if (is_file($basePath . $value['path'])) {
                $update_res = $Attachment->updateData(['path' => $newPath], ['id' => $value['id']]);
                $res = rename($basePath . $value['path'], $basePath . $newPath);
                echo 'id:' . $value['id'] .
                    "\n oldPath:" . $value['path'] .
                    "\n newPath:" . $newPath .
                    "\n update_res:" . $update_res .
                    "\n res:" . $res . "\n";
            } else {
                echo "id:" . $value['id'] . ",the file not exist \n";
            }
        }
    }
    $startPage++;
    $dataList = $Attachment->getData($select, ['comment' => 'pretreatment'], [], true, $startPage, 20, 'id', 'ASC');
}