<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/22
 * Time: 下午3:21
 */
namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ImageManagementController extends Controller{

    //region 图纸

        /**
         * 图纸列表
         */
        public function imageIndex(Request $request){
            return view('image_management.image_index');
        }

        /**
         * 添加图纸
         */
        public function addImage(Request $request){
            return view('image_management.add_image');
        }

        /**
         * 编辑图纸
         */
        public function updateImage(Request $request){
            return view('image_management.add_image');
        }

    //endregion

    //region 图纸分类

        /**
         * 图纸分类/分模块
         */
        public function imageCategoryIndex(Request $request){
            return view('image_management.image_category_index');
        }



    //endregion

    //region 图纸分组

        /**
         * 图纸分组列表
         * @param Request $request
         * @return \Illuminate\View\View
         */
        public function imageGroupIndex(Request $request){
            return view('image_management.image_group_index');
        }

        public function imageAttributeDefine(Request $request){
            return view('image_management.attributeDefine');
        }

        public function ImageGroupType(Request $request){
            return view('image_management.ImageGroupType');
        }

    //endregion

    //region 洗标
        /**
         * 洗标列表
         */
        public function careLabelIndex(Request $request){
            return view('image_management.care_label_index');
        }

        /**
         * 添加图纸
         */
        public function addCareLabel(Request $request){
            return view('image_management.add_care_label');
        }
    //endregion
}