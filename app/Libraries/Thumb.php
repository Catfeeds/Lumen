<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/17
 * Time: 上午10:01
 */

namespace  App\Libraries;
use Intervention\Image\Facades\Image;//图像处理

/**
 * 缩略图处理辅助类
 * Class Image
 * @package App\Libraries
 * @author  sam.shan   <sam.shan@ruis-ims.cn>
 */
class Thumb
{
    /**
     * mes虚拟主机code目录名称
     * emi2c-mes/code/
     */
    const  EMI2C_MES_CODE='emi2c-mes'.DIRECTORY_SEPARATOR.'code'.DIRECTORY_SEPARATOR;
    /**
     * 默认图纸后缀
     */
    const  IMG_EXT='jpg';
    /**
     * 缩略图规格参数
     * rm -rf *80x40.jpg
     * rm -rf *370x170.jpg
     * @var array
     */
     static $sizes=[
         'material'=>['80x40','370x170'],
         'bom'=>['80x40','370x170'],
     ];
    /**
     * 对图纸生成对应的规格缩略图
     * @param $obj_list
     * @param $size  尺寸类型
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    static  function createThumb($obj_list,$size)
    {
      //判断规格是否正确
      if(empty($size) || !array_key_exists($size,self::$sizes)) return false;
      //遍历生成缩略图

      $emi2c_mes_code_url=env('EMI2C_MES_CODE_URL');
      if(empty($emi2c_mes_code_url)) $emi2c_mes_code_url=dirname(dirname(dirname(dirname(__FILE__)))).DIRECTORY_SEPARATOR.self::EMI2C_MES_CODE;

      foreach ($obj_list as $key=>$obj){
          $abs_img_path=$emi2c_mes_code_url.$obj->image_path.$obj->image_name.'.'.self::IMG_EXT;
          //如果存在且可读,且对应的缩略图不存在则生成对应的缩略图
          if(is_file($abs_img_path) && is_readable($abs_img_path)){
              foreach(self::$sizes[$size] as $px){
               $abs_thumb_img_path=$abs_img_path.$px.'.'.self::IMG_EXT;
               if(is_file($abs_thumb_img_path)) continue;
               // open an image file
               $img = Image::make($abs_img_path);
               // resize image instance
               $px_arr=explode('x',$px);
               $img->resize($px_arr[0],$px_arr[1]);
               // save image in desired format
               $img->save($abs_thumb_img_path);
              }
          }

      }

    }

    /**
     * 对图纸生成对应的规格缩略图
     * @param $obj_list
     * @param $size  尺寸类型
     * @author  hao.wei   <weihao>
     */
    static function createDrawingThump($obj_list,$size){
        //判断规格是否正确
        if(empty($size) || !array_key_exists($size,self::$sizes)) return false;
        //遍历生成缩略图

        $emi2c_mes_code_url = storage_path('app/public').DIRECTORY_SEPARATOR;

        foreach ($obj_list as $key=>$obj){
            $abs_img_path=$emi2c_mes_code_url.$obj->image_path;
            //如果存在且可读,且对应的缩略图不存在则生成对应的缩略图
            if(is_file($abs_img_path) && is_readable($abs_img_path)){
                foreach(self::$sizes[$size] as $px){
                    $tempPathArr = explode(DIRECTORY_SEPARATOR,$abs_img_path);
                    $ext = explode('.',end($tempPathArr));
                    $abs_thumb_img_path = str_replace('.'.$ext[1],'',$abs_img_path).$px.'.'.self::IMG_EXT;
                    if(is_file($abs_thumb_img_path)) continue;
                    // open an image file
                    $img = Image::make($abs_img_path);
                    // resize image instance
                    $px_arr=explode('x',$px);
                    $img->resize($px_arr[0],$px_arr[1]);
                    // save image in desired format
                    $img->save($abs_thumb_img_path);
                }
            }
        }
    }

    /**
     * 对单张图纸生成对应的规格缩略图
     * @param $image_path
     * @param $size
     * @author hao.wei <weihao>
     */
    static function createOnlyDrawingThump($image_path,$size){
        //判断规格是否正确
        if(empty($size) || !array_key_exists($size,self::$sizes)) return false;
        //遍历生成缩略图
        $emi2c_mes_code_url = storage_path('app/public').DIRECTORY_SEPARATOR;
        $abs_img_path=$emi2c_mes_code_url.$image_path;
        //如果存在且可读,且对应的缩略图不存在则生成对应的缩略图
        if(is_file($abs_img_path) && is_readable($abs_img_path)){
            foreach(self::$sizes[$size] as $px){
                $tempPathArr = explode(DIRECTORY_SEPARATOR,$abs_img_path);
                $ext = explode('.',end($tempPathArr));
                $abs_thumb_img_path = str_replace('.'.$ext[1],'',$abs_img_path).$px.'.'.self::IMG_EXT;
                if(is_file($abs_thumb_img_path)) continue;
                // open an image file
                $img = Image::make($abs_img_path);
                // resize image instance
                $px_arr=explode('x',$px);
                $img->resize($px_arr[0],$px_arr[1]);
                // save image in desired format
                $img->save($abs_thumb_img_path);
            }
        }
    }
}