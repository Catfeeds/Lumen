<?php
/**
 * Created by PhpStorm.
 * User: weihao
 * Date: 18/1/15
 * Time: 上午11:17
 */

namespace App\Http\Models;//定义命名空间
use App\Exceptions\ApiException;
use App\Http\Models\Encoding\EncodingSetting;
use App\Libraries\Trace;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;//引入DB操作类
use App\Libraries\Thumb;

/**
 * 图纸库
 * @author  weihao
 * @time    2017年1月15日 16:29
 */
class Image extends Base
{

    public $apiPrimaryKey = 'drawing_id';

    public function __construct()
    {
        $this->table = config('alias.rdr');
    }


//region 检

    /**
     * 检查传入的参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @since lester.you 去除名称和属性唯一性判断
     * @since lester.you 对关联图纸的数据的判断
     */
    public function checkFormFields(&$input)
    {
        //检查图纸参数
        $this->checkDrawings($input);

        //检查图纸属性参数
        $imageAttributeDao = new ImageAttribute();
        $imageAttributeDao->checkFormFields($input);
//        $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
//        $has_name_attribute = $this->isExisted([['name', '=', $input['name']], ['search_string', '=', $search_str],['id','<>',$input['drawing_id']]], $this->table);
//        if ($has_name_attribute) {
//            TEA('1106');
//        }
        //检测图纸关联参数
        if (!empty($input['links']) && is_json($input['links'])) {
            $linkArr = json_decode($input['links'], true);
            $idArr = [];
            $input['linkArr'] = [];
            foreach ($linkArr as $key => $value) {
                if (!isset($value['link_id']) || !isset($value['count']) || !is_numeric($value['link_id']) || !is_numeric($value['count'])) {
                    TEA('700', 'links');
                }
                $idArr[] = intval($value['link_id']);
                $input['linkArr'][intval($value['link_id'])] = $value;
            }
            //判断关联图纸是否存在
            $obj_count = DB::Table($this->table)
                ->whereIn('id', array_unique($idArr))
                ->count();
            if ($obj_count != count(array_unique($idArr))) TEA('1109');
        } else {
            $input['linkArr'] = [];
        }

        //检测附件关联参数
        if (!empty($input['attachments']) && is_json($input['attachments'])) {
            $attachmentArr = json_decode($input['attachments'], true);
            $idArr = [];
            $input['attachmentsArr'] = [];
            foreach ($attachmentArr as $index => $value) {
                if (!isset($value['attachment_id']) || !is_numeric($value['attachment_id'])) {
                    TEA('700', 'attachments');
                }
                $idArr[] = $value['attachment_id'];
                $input['attachmentsArr'][$value['attachment_id']] = $value;
            }
            //判断附件是否存在
            $obj_count = DB::Table(config('alias.attachment'))
                ->whereIn('id', array_unique($idArr))
                ->count();
            if ($obj_count != count(array_unique($idArr))) TEA('1110');
        } else {
            $input['attachmentsArr'] = [];
        }


    }

    /**
     * 检查传入的图纸参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function checkDrawings(&$input)
    {
        if (empty($input['drawing_id'])) TEA('700', 'drawing_id');
        if (!isset($input['comment'])) TEA('700', 'comment');
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['name'])) TEA('700', 'name');
        $has = $this->isExisted([['id', '=', $input['category_id']]], config('alias.rdc'));
        if (!$has) TEA('700', 'category_id');
        $input['group_id'] = isset($input['group_id']) ? $input['group_id'] : 0;
        if ($input['group_id']) {
            $has = $this->isExisted([['id', '=', $input['group_id']]], config('alias.rdg'));
            if (!$has) TEA('700', 'group_id');
        }
        if (empty($input['code'])) {
            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $input['code'] = $res['code'];
        }
//        $has = $this->isExisted([['id', '<>', $input['drawing_id']], ['code', '=', $input['code']], ['status', '=', 1]]);
//        if ($has) TEA('700', 'code');

        $emi2c_mes_code_url = storage_path('app/public') . DIRECTORY_SEPARATOR;
        $newCategory = $this->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));//新上传的分类
        //新的分类指向的图纸文件夹
        $newImageDirPath = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;

        //判断数据库图纸记录存不存在
        $drawing = $this->getRecordById($input[$this->apiPrimaryKey], ['image_path', 'image_name', 'status', 'category_id']);
        if (!$drawing) TEA('1116');
        //判断文件存不存在
        $path = $emi2c_mes_code_url . $drawing->image_path;
        if (!is_file($path)) TEA('1113');
        //如果图纸分类改变则需要移动图纸
        if ($drawing->category_id != $input['category_id']) {
            $oldCategory = $this->getRecordById($drawing->category_id, ['owner'], config('alias.rdc'));
            //旧的分类指向的图纸文件夹
            $oldImageDirPath = config('app.drawing_library') . $oldCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;
            $res = Storage::disk('public')->move($oldImageDirPath . $drawing->image_name, $newImageDirPath . $drawing->image_name);
            if (!$res) TEA('500');//未知名错误
            //记录一下新的图纸路径
            $v['image_path'] = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR . $drawing->image_name;
            //缩略图也需要移动
            if (in_array($newCategory->owner, Thumb::$sizes)) {
                $tempArr = explode('/', $drawing->image_path);
                $imageName = end($tempArr);
                $imageMake = explode('.', $imageName);
                foreach (Thumb::$sizes[$newCategory->owner] as $size) {
                    $thumbImageName = $imageMake[0] . $size . '.' . Thumb::IMG_EXT;
                    //原文件夹有的缩略图则移动，没有的需要新生成
                    if (is_file(storage_path('app/public') . DIRECTORY_SEPARATOR . $oldImageDirPath . $thumbImageName)) {
                        $res = Storage::disk('public')->move($oldImageDirPath . $thumbImageName, $newImageDirPath . $thumbImageName);
                        if (!$res) TEA('500');
                    } else {
                        Thumb::createOnlyDrawingThump($v['image_path'], $newCategory->owner);//生成缩略图
                    }
                }
            }
        }

    }

    /**
     * 批量上传图片 参数检查
     *
     * @param $input
     * @throws ApiException
     * @author lester.you
     */
    public function checkBatchStore(&$input)
    {
        if (empty($input['category_id'])) TEA('700', 'category_id');
        $has = $this->isExisted([['id', '=', $input['category_id']]], config('alias.rdc'));
        if (!$has) TEA('700', 'category_id');

        if (empty($input['group_id'])) TEA(700, 'group_id');
        $has = $this->isExisted([['id', '=', $input['group_id']]], config('alias.rdg'));
        if (!$has) TEA('700', 'group_id');

        if (empty($input['drawings'])) TEA(700, 'drawings');
        foreach ($input['drawings'] as &$drawingItem) {
            if (empty($drawingItem['drawing_id'])) TEA(700, 'drawing_id');
            $has = $this->isExisted([['id', '=', $drawingItem['drawing_id']]]);
            if (!$has) TEA('700', 'drawing_id');

            if (!isset($drawingItem['name'])) TEA(700, 'name');
            strripos($drawingItem['name'], '.') != 0 && $drawingItem['name'] = substr($drawingItem['name'], 0, strripos($drawingItem['name'], '.'));

            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $drawingItem['code'] = $res['code'];

            // 检查洗标参数
            (new CareLabel())->checkCareLabel($drawingItem);

            /**
             * 检查 分类并判断是否需要移动文件位置
             */
            $emi2c_mes_code_url = storage_path('app/public') . DIRECTORY_SEPARATOR;
            $newCategory = $this->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));//新上传的分类
            //新的分类指向的图纸文件夹
            $newImageDirPath = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;

            //判断数据库图纸记录存不存在
            $drawing = $this->getRecordById($drawingItem[$this->apiPrimaryKey], ['image_path', 'image_name', 'status', 'category_id']);
            if (!$drawing) TEA('1116');
            //判断文件存不存在
            $path = $emi2c_mes_code_url . $drawing->image_path;
            if (!is_file($path)) TEA('1113');
            //如果图纸分类改变则需要移动图纸
            if ($drawing->category_id != $input['category_id']) {
                $oldCategory = $this->getRecordById($drawing->category_id, ['owner'], config('alias.rdc'));
                //旧的分类指向的图纸文件夹
                $oldImageDirPath = config('app.drawing_library') . $oldCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;
                $res = Storage::disk('public')->move($oldImageDirPath . $drawing->image_name, $newImageDirPath . $drawing->image_name);
                if (!$res) TEA('500');//未知名错误
                //记录一下新的图纸路径
                $v['image_path'] = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR . $drawing->image_name;
                //缩略图也需要移动
                if (in_array($newCategory->owner, Thumb::$sizes)) {
                    $tempArr = explode('/', $drawing->image_path);
                    $imageName = end($tempArr);
                    $imageMake = explode('.', $imageName);
                    foreach (Thumb::$sizes[$newCategory->owner] as $size) {
                        $thumbImageName = $imageMake[0] . $size . '.' . Thumb::IMG_EXT;
                        //原文件夹有的缩略图则移动，没有的需要新生成
                        if (is_file(storage_path('app/public') . DIRECTORY_SEPARATOR . $oldImageDirPath . $thumbImageName)) {
                            $res = Storage::disk('public')->move($oldImageDirPath . $thumbImageName, $newImageDirPath . $thumbImageName);
                            if (!$res) TEA('500');
                        } else {
                            Thumb::createOnlyDrawingThump($v['image_path'], $newCategory->owner);//生成缩略图
                        }
                    }
                }
            }
        }

    }

//endregion


//region 增

    /**
     * 添加图纸
     * @param array
     * @return int 插入记录的主键
     * @author  hao.wei  <weihao>
     * @throws ApiException
     */
    public function addDrawing($data)
    {
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) {
            if (is_file($data['image_path']) && is_readable($data['image_path'])) {
                Storage::disk('emi2c-mes')->delete($data['image_path']);
            }
            TEA('802');
        }
        return $insert_id;
    }


    /**
     * 添加图纸库图纸属性及图纸关联属性
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @since 20180622 lester.you
     */
    public function save($input)
    {
        /**
         * 判断当前是否已经保存过。
         * 防止因为网络问题，重复提交。
         * 原理： 判断code是否为空
         */
        $has_code = DB::table($this->table)->select(['id', 'code'])->where('id', '=', $input['drawing_id'])->first();
        if (!empty($has_code->code)) {
            TEA('1115');
        }

        /**
         * 验证code是否被使用
         */
        $code_is_existed = DB::table($this->table)->select(['id', 'code'])->where('code', '=', $input['code'])->count();
        if ($code_is_existed) {
            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $input['code'] = $res['code'];
        }

        try {
            DB::connection()->beginTransaction();
            $encodingDao = new EncodingSetting();
            $input['code'] = $encodingDao->useEncoding(6, $input['code']);
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $update_arr = [
                'group_id' => $input['group_id'],
                'code' => $input['code'],
                'comment' => $input['comment'],
                'name' => $input['name'],
                'status' => 1,
                'search_string' => $search_str,
                'source' => empty($input['source']) ? 1 : intval($input['source'])
            ];
            DB::table($this->table)->where('id', $input['drawing_id'])
                ->update($update_arr);
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->saveImageAttribute($input['input_ref_arr_drawing_attributes'], $input['drawing_id']);
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 拼接 搜索条件预收集字符串
     * @param $input_attributes_arr
     * @return string
     * @author lester.you
     */
    public function fixSearchStr($input_attributes_arr)
    {
        $search_string = "";
        $search_arr = [];
        ksort($input_attributes_arr);
        foreach ($input_attributes_arr as $k => $v) {
            if (!empty($v['value'])) {
                $search_arr[] = $k . ',' . $v['value'];
            }
        }
        if (!empty($search_arr)) {
            $search_string = join('|', $search_arr);
        }
        return $search_string;
    }

    /**
     * @param $input
     * @throws ApiException
     */
    public function batchSave($input)
    {
        /**
         * 判断当前是否已经保存过。
         * 防止因为网络问题，重复提交。
         * 原理： 判断code是否为空
         */
        $has_code = DB::table($this->table)->select(['id', 'code'])->where('id', '=', $input['drawing_id'])->first();
        if (!empty($has_code->code)) {
            TEA('1115');
        }

        /**
         * 验证code是否被使用
         */
        $code_is_existed = DB::table($this->table)->select(['id', 'code'])->where('code', '=', $input['code'])->count();
        if ($code_is_existed) {
            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $input['code'] = $res['code'];
        }

        $encodingDao = new EncodingSetting();
        $input['code'] = $encodingDao->useEncoding(6, $input['code']);
        $update_arr = [
            'group_id' => $input['group_id'],
            'code' => $input['code'],
            'name' => $input['name'],
            'status' => 1,
            'is_care_label' => 1,
            'source' => empty($input['source']) ? 1 : intval($input['source'])
        ];
        DB::table($this->table)->where('id', $input['drawing_id'])
            ->update($update_arr);
    }
//endregion

//region 查

    /**
     * 图纸详情
     * @param $drawing_id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @since 添加关联图纸的数据 lester.you  2018-05-03
     */
    public function get($drawing_id)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.code',
            'rdr.group_id',
            'rdr.ctime',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
            'rdgt.id as type_id'
        ];
        $drawing = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->where([['rdr.' . $this->primaryKey, '=', $drawing_id], ['rdr.status', '=', 1]])
            ->first();
        if (!$drawing) TEA('404');
        $drawing->ctime = date('Y-m-d', $drawing->ctime);
        $imageAttributeDao = new ImageAttribute();
        $drawing->attributes = $imageAttributeDao->getDrawingAttributeList($drawing->drawing_id);
//        $tempArr = explode('/',$drawing->image_path);
//        $imageName = end($tempArr);
//        $imageMake = explode('.',$imageName);
//        $tempImagePath = str_replace($imageName,'',$drawing->image_path);
//        $thumbArr = [];
//        foreach(Thumb::$sizes[$drawing->owner] as $size){
//            $thumbImage = $tempImagePath.$imageMake[0].$size.'.'.Thumb::IMG_EXT;
//            if(is_file(storage_path('app/public').DIRECTORY_SEPARATOR.$thumbImage)){
//                $thumbArr[] = $thumbImage;
//            }
//        }
//        $drawing->thumbImages = $thumbArr;
        //关联图纸
        $selectArr = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.code',
            'rdr.group_id',
            'rdr.ctime',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
            'rdgt.id as type_id',
            'rdl.count',
            'rdl.description'
        ];
        $link_obj_list = DB::Table(config('alias.rdl') . ' as rdl')
            ->select($selectArr)
            ->leftJoin($this->table . ' as rdr', 'rdr.id', '=', 'rdl.link_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->where([
                ['rdl.drawing_id', '=', $drawing_id],
                ['rdr.status', '=', 1]
            ])
            ->get();
        foreach ($link_obj_list as $index => &$value) {
            $value->attributes = $imageAttributeDao->getDrawingAttributeList($value->{$this->apiPrimaryKey});
            $value->ctime = date('Y-m-d H:i:s', $value->ctime);
        }
        $drawing->linkArr = $link_obj_list;

        //附件
        $selectArr = [
            'rdat.attachment_id',
            'rdat.description as comment',
            'att.name',
            'att.filename',
            'att.ctime',
            'att.creator_id',
            'att.path',
            'att.size',
            'u.name as creator_name'
        ];
        $attachment_obj_list = DB::Table(config('alias.rdat') . ' as rdat')
            ->select($selectArr)
            ->leftJoin(config('alias.attachment') . ' as att', 'att.id', '=', 'rdat.attachment_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'att.creator_id')
            ->where('rdat.drawing_id', $drawing_id)
            ->get();
        foreach ($attachment_obj_list as $index => &$value) {
            $value->ctime = date('Y-m-d H:i:s', $value->ctime);
        }
        $drawing->attachments = $attachment_obj_list;

        //组合图
        $groupPic_drawing_id_list = DB::Table(config('alias.rdl') . ' as rdl')
            ->select([
                'rd.id',
                'rd.code',
                'rd.name',
                'rd.image_path',
                'rd.image_name',
                'rdl.link_id'
            ])
            ->leftJoin($this->table . ' as rd', 'rdl.drawing_id', '=', 'rd.id')
            ->where([
                ['rdl.link_id', '=', $drawing_id],
                ['rd.status', '=', 1],
            ])
            ->get();
        foreach ($groupPic_drawing_id_list as $key => &$_value) {
            if (empty($_value->id)) {
                continue;
            }
            $_value->attributes = $imageAttributeDao->getDrawingAttributeList($_value->id);
            $link_drawing = DB::Table(config('alias.rdl') . ' as rdl')
                ->select(['rd.id', 'rd.code', 'rd.name', 'rd.image_path', 'rd.image_name'])
                ->leftJoin($this->table . ' as rd', 'rdl.link_id', '=', 'rd.id')
                ->where([
                    ['rdl.drawing_id', '=', $_value->id],
                    ['rd.status', '=', 1]
                ])
                ->get();
            foreach ($link_drawing as $k => &$v) {
                $attribute = $imageAttributeDao->getDrawingAttributeList($v->id);
                $v->attributes = $attribute;
            }
            $_value->links = $link_drawing;
        }
        $drawing->groupDrawing = $groupPic_drawing_id_list;

        return $drawing;
    }


    /**
     * 图纸分页列表
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function getDrawingListByPage(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdr.comment as description',
            'rdg.name as group_name',
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }
        //根据图纸属性搜索
        if (!empty($input['drawing_attributes'])) {
            //检查图纸属性参数
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->checkFormFields($input);
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $where[] = ['rdr.search_string', 'like', '%' . $search_str . '%'];
        }
        // 洗标 销售订单和物料号 搜索
        if (!empty($input['sale_order_code'])) $where[] = ['rdcl.sale_order_code', 'like', '%' . $input['sale_order_code'] . '%'];
        if (!empty($input['material_code'])) $where[] = ['rdcl.material_code', 'like', '%' . $input['material_code'] . '%'];
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->leftJoin(config('alias.rdcl') . ' as rdcl', 'rdcl.drawing_id', '=', 'rdr.id')
            ->where($where);
        $input['total_records'] = $builder->count(DB::raw('distinct rdr.id'));
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        $obj_list = $builder->distinct()->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }


    /**
     * 根据分类获取图纸分页列表
     * @param $input
     * @return object
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function getDrawingListByCategory(&$input)
    {
        $category = DB::table(config('alias.rdc'))->select('id')->where('owner', '=', $input['owner'])->first();
        if (!$category) TEA('700', 'owner');
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name'
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        $where[] = ['rdr.category_id', '=', $category->id];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', $input['code']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['type_id'])) $where[] = ['rdg.type_id', '=', $input['type_id']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * 根据来源查找图纸
     * @param $owner
     * @return mixed
     */
    public function selectByCategory($owner)
    {
        $obj_list = DB::table($this->table . ' as rdr')->select('rdr.id as ' . $this->apiPrimaryKey, 'rdr.code', 'rdr.image_path', 'rdr.name')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', 'rdr.category_id')
            ->where([['rdc.owner', '=', $owner], ['rdr.status', '=', 1]])
            ->get();
        return $obj_list;
    }


    /**
     * 获取和做法关联的数据（分页）
     * 只限做法使用
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-04-26
     */
    public function getDrawingListByPractice(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
        ];
        $fields_rpd = $fields_rppf = $fields;
        $fields_rpd[] = 'rpd.practice_id';
        $fields_rpd[] = 'rpd.description';

        $fields_rppf[] = 'rppf.practice_id';
        $fields_rppf[] = 'rppf.description';

        $where = [];
        $where[] = ['rdr.status', '=', 1];

        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }
        //根据图纸属性搜索
        if (!empty($input['drawing_attributes'])) {
            //检查图纸属性参数
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->checkFormFields($input);
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $where[] = ['rdr.search_string', 'like', '%' . $search_str . '%'];
        }
        $where_rpd = $where_rppf = $where;
        if (!empty($input['practice_id'])) {
            $where_rpd[] = ['rpd.practice_id', '=', $input['practice_id']];
            $where_rppf[] = ['rppf.practice_id', '=', $input['practice_id']];
        }


        $builder_rpd = DB::table(config('alias.rpd') . ' as rpd')->select($fields_rpd)
            ->leftJoin($this->table . ' as rdr', 'rdr.id', '=', 'rpd.drawing_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where_rpd);

        $builder_rppf = DB::table(config('alias.rppf') . ' as rppf')->select($fields_rppf)
            ->leftJoin($this->table . ' as rdr', 'rdr.id', '=', 'rppf.img_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where_rppf)
            ->union($builder_rpd);

        $sql = $builder_rppf->toSql();
        $builder_res = DB::table(DB::raw("($sql) as res"))->mergeBindings($builder_rppf);

        $input['total_records'] = $builder_res->count();
        $builder_res->forPage($input['page_no'], $input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder_res->orderBy('res.' . $input['sort'], $input['order']);
        $obj_list = $builder_res->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * drawing_attributes 是必传的
     * 根据属性和属性值搜索出响应的图纸
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-05-02
     */
    public function getDrawingListBySearchStr(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }
        //根据图纸属性搜索
        if (!empty($input['drawing_attributes'])) {
            //检查图纸属性参数
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->checkFormFields($input);
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $where[] = ['rdr.search_string', 'like', '%' . $search_str . '%'];
            !empty($input['drawing_id']) && $where[] = ['rdr.id', '<>', $input['drawing_id']];
        } else {
            TEA('700', 'drawing_attributes');
        }
        $obj_list = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where)
            ->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * 根据drawing_id 获取图纸路径
     * @param $drawing_id
     * @return string
     */
    public function getImagePathBy($drawing_id)
    {
        $path = "";
        if (is_numeric($drawing_id)) {
            $obj = DB::Table($this->table)->select(['id', 'image_path'])->where('id', $drawing_id)->first();
            if (!empty($obj) && isset($obj->image_path)) {
                $path = $obj->image_path;
            }
        }
        return $path;
    }

    /**
     * 获取洗标列表
     *
     * @param $input
     * @return mixed
     * @throws ApiException
     */
    public function getPageIndexByCareLabel(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdr.comment as description',
            'rdg.name as group_name',
            'rdr.is_care_label',
            'rdr.is_pushed'
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        $where[] = ['rdr.is_care_label', '=', 1];
        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }

        // 洗标 销售订单和物料号 搜索
        if (!empty($input['sale_order_code'])) $where[] = ['rdcl.sale_order_code', 'like', '%' . $input['sale_order_code'] . '%'];
        if (!empty($input['material_code'])) $where[] = ['rdcl.material_code', 'like', '%' . $input['material_code'] . '%'];
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->leftJoin(config('alias.rdcl') . ' as rdcl', 'rdcl.drawing_id', '=', 'rdr.id')
            ->where($where);
        $input['total_records'] = $builder->count(DB::raw('distinct rdr.id'));
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        $obj_list = $builder->distinct()->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }


//endregion

//region 修

    /**
     * 修改图纸属性及备注、添加图纸关联
     *
     * @param $input
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update($input)
    {
        /**
         * 取出上传图纸的临时数据
         * 如果drawing_temp_id为空，表示修改的过程中没有重新上传图皮
         */
        $tempData = [];
        if (!empty($input['drawing_temp_id'])) {
            $tempData = DB::table(config('alias.rdt'))->where('id', $input['drawing_temp_id'])->first();
            if (empty($tempData) || !Storage::disk('public')->exists($tempData->image_path)) {
                TEA('1112');
            }
            //先获取老图纸数据，留后面备用
            $old_image_obj = $this->getRecordById($input['drawing_id'], ['image_path']);
        }
        try {
            DB::connection()->beginTransaction();
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $update_arr = [
                'group_id' => $input['group_id'],
//                'code' => $input['code'],
                'comment' => $input['comment'],
                'name' => $input['name'],
                'search_string' => $search_str,
                'mtime' => time()
            ];
            if (!empty($tempData)) {
                $update_arr['image_orgin_name'] = $tempData->image_orgin_name;
                $update_arr['image_name'] = $tempData->image_name;
                $update_arr['image_path'] = $tempData->image_path;
                $update_arr['extension'] = $tempData->extension;

                //删除对应临时表的记录
                DB::table(config('alias.rdt'))
                    ->where('id', $input['drawing_temp_id'])
                    ->delete();
            }
            DB::table($this->table)
                ->where('id', $input['drawing_id'])
                ->update($update_arr);
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->saveImageAttribute($input['input_ref_arr_drawing_attributes'], $input['drawing_id']);
            $this->linkImage($input[$this->apiPrimaryKey], $input['linkArr']);
            $this->linkAttachment($input[$this->apiPrimaryKey], $input['attachmentsArr']);
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();

        //删除老图纸，添加上传图纸日志
        if (!empty($tempData)) {
            //操作日志
            $events = [
                'field' => 'image_path',
                'comment' => '图纸路径',
                'action' => 'update',
                'from' => $old_image_obj->image_path,
                'to' => $tempData->image_path,
                'desc' => '修改图纸，新上传了一张图纸',
                'extra' => $old_image_obj,
            ];
            Trace::save(config('alias.rdr'), $input['drawing_id'], (session('administrator')) ? session('administrator')->admin_id : 0, $events);
            if ((Storage::disk('public')->exists($old_image_obj->image_path))) {
                Storage::disk('public')->delete($old_image_obj->image_path);
            }
        }

        /**
         * 每次请求清理两个临时表的记录
         * 清理的时间为一天之前的
         */
        $deleteTempList = DB::table(config('alias.rdt'))
            ->where([['ctime', '<', time() - 86400]])
            ->limit(2)
            ->get();
        foreach ($deleteTempList as $key => $value) {
            DB::table(config('alias.rdt'))->where('id', $value->id)->delete();
            if (Storage::disk('public')->exists($value->image_path)) {
                Storage::disk('public')->delete($value->image_path);
            }
        }
    }

    /**
     * 关联图纸的操作
     * 增和删
     *
     * @param $id
     * @param $linkArr
     * @author lester.you 2018-05-03
     */
    public function linkImage($id, $linkArr)
    {
        $obj_list = DB::Table(config('alias.rdl'))
            ->where('drawing_id', $id)
            ->select(['id', 'drawing_id', 'link_id', 'count', 'description'])
            ->get();
        $db_id_arr = [];
        foreach (obj2array($obj_list) as $k => $v) {
            $db_id_arr[$v['link_id']] = $v;
        }
        $res = get_array_diff_intersect(array_keys($linkArr), array_keys($db_id_arr));
        //添加
        if (!empty($res['add_set'])) {
            $insertArr = [];
            foreach ($res['add_set'] as $key => $value) {
                $insertArr[] = [
                    'drawing_id' => $id,
                    'link_id' => $value,
                    'count' => $linkArr[$value]['count'],
                    'description' => $linkArr[$value]['description']
                ];
            }
            DB::Table(config('alias.rdl'))->insert($insertArr);
        }
        //删除
        if (!empty($res['del_set'])) {
            $deleteIDArr = [];
            foreach ($res['del_set'] as $key => $value) {
                $deleteIDArr[] = $db_id_arr[$value]['id'];
            }
            DB::Table(config('alias.rdl'))
                ->whereIn('id', $deleteIDArr)
                ->delete();
        }
        //修改
        if (!empty($res['common_set'])) {
            foreach ($res['common_set'] as $value) {
                if ($db_id_arr[$value]['description'] != $linkArr[$value]['description'] || $db_id_arr[$value]['count'] != $linkArr[$value]['count']) {
                    DB::Table(config('alias.rdl'))
                        ->where('id', $db_id_arr[$value]['id'])
                        ->update(
                            [
                                'description' => $linkArr[$value]['description'],
                                'count' => $linkArr[$value]['count']
                            ]
                        );
                }
            }
        }
    }

    /**
     * 关联附件
     * @param $drawing_id
     * @param $attachmentsArr
     * @author lester.you 2018-05-03
     */
    public function linkAttachment($drawing_id, $attachmentsArr)
    {
        $obj_list = DB::Table(config('alias.rdat'))
            ->where('drawing_id', $drawing_id)
            ->select(['id', 'drawing_id', 'attachment_id', 'description'])
            ->get();
        $db_id_arr = [];
        foreach (obj2array($obj_list) as $k => $v) {
            $db_id_arr[$v['attachment_id']] = $v;
        }
        $res = get_array_diff_intersect(array_keys($attachmentsArr), array_keys($db_id_arr));
        if (!empty($res['add_set'])) {
            $insertArr = [];
            foreach ($res['add_set'] as $key => $value) {
                $insertArr[] = ['drawing_id' => $drawing_id, 'attachment_id' => $value, 'description' => $attachmentsArr[$value]['comment']];
            }
            DB::Table(config('alias.rdat'))->insert($insertArr);
        }
        if (!empty($res['del_set'])) {
            $deleteIDArr = [];
            foreach ($res['del_set'] as $key => $value) {
                $deleteIDArr[] = $db_id_arr[$value]['id'];
            }
            DB::Table(config('alias.rdat'))
                ->whereIn('id', $deleteIDArr)
                ->delete();
        }
        if (!empty($res['common_set'])) {
            foreach ($res['common_set'] as $value) {
                if ($db_id_arr[$value]['description'] != $attachmentsArr[$value]['comment']) {
                    DB::Table(config('alias.rdat'))
                        ->where('id', $db_id_arr[$value]['id'])
                        ->update(
                            ['description' => $attachmentsArr[$value]['comment']]
                        );
                }
            }
        }
    }

    /**
     * @param $data
     * @return bool
     * @throws \App\Exceptions\ApiException
     */
    public function addTempFileData($data)
    {
        if (empty($data)) {
            return false;
        }
        $insertID = DB::table(config('alias.rdt'))->insertGetId($data);
        if (!$insertID) {
            if (Storage::disk('public')->exists($data['image_path'])) {
                Storage::disk('public')->delete($data['image_path']);
            }
            TEA('802');
        }
        return $insertID;

    }



//endregion

//region 删

    /**
     * 删除图纸（逻辑删除）
     * @param $drawing_id
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @throws \Exception
     * @since lester.you 添加删除前判断
     */
    public function delete($drawing_id, $creator_id)
    {
        $has = $this->isExisted([['drawing_id', '=', $drawing_id]], config('alias.rmd'));
        if ($has) TEA('1102');
        $has = $this->isExisted([['drawing_id', '=', $drawing_id]], config('alias.rpd'));
        if ($has) TEA('1114');
        $_has = $this->isExisted([['img_id', '=', $drawing_id]], config('alias.rppf'));
        if ($_has) TEA('1114');
        $image = $this->getRecordById($drawing_id, ['name', 'image_path']);
        $res = DB::table($this->table)->where($this->primaryKey, '=', $drawing_id)->update(['status' => 0]);
        if (!$res) TEA('803');
        //操作日志
        $events = [
            'action' => 'delete',
            'extra' => $image,
            'desc' => '删除图纸[' . $image->name . ']',
        ];
        Trace::save($this->table, $drawing_id, $creator_id, $events);
    }

//endregion

}