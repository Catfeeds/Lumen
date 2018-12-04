<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/11/16
 * Time: 上午15:14
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use App\Http\Models\CareLabel;
use App\Http\Models\ImageAttribute;
use App\Jobs\PushCareLabel;
use App\Libraries\Thumb;
use App\Libraries\Trace;
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;


/**
 * 图纸库之图纸管理器
 * @author  hao.wei   <weihao>
 */
class ImageController extends Controller
{
    protected $allowed_extensions = ["png", "jpg", "jpeg", "gif"];

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Image();
    }

//region 增

    /**
     * 上传图纸
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @throws \Exception
     * @author hao.wei <weihao>
     */
    public function uploadDrawing(Request $request)
    {
        $input = $request->all();
        trim_strings($request);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['drawing'])) TEA('700', 'drawing');
        $data = [];
        $admin = session('administrator');
        $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $data['extension'] = $input['drawing']->getClientOriginalExtension();//文件后缀
        if (!$data['extension'] || !in_array(strtolower($data['extension']), $this->allowed_extensions)) TEA('1101');//不被允许的文件
        $category = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$category) TEA('700', 'category_id');
        $data['image_path'] = Storage::disk('public')->putFile(config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $input['drawing']);
        if (empty($data['image_path'])) TEA('7028');//上传失败
        $data['image_orgin_name'] = $input['drawing']->getClientOriginalName();
        $data['category_id'] = $input['category_id'];
        $temp = explode('/', $data['image_path']);
        $data['image_name'] = end($temp);
        $data['ctime'] = time();
        $data['mtime'] = time();
        $data['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0;
        $data['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $insert_id = $this->model->addDrawing($data);
        $obj = $this->model->getRecordById($insert_id, ['image_path']);
        Thumb::createDrawingThump([$obj], $category->owner);//生成缩略图
        //操作日志
        $events = [
            'field' => $this->model->apiPrimaryKey,
            'comment' => '图纸',
            'action' => 'add',
            'extra' => $obj,
            'desc' => '上传了一张图纸[' . $obj->image_path . ']并生成了缩略图',
        ];
        Trace::save(config('alias.rdr'), $insert_id, $data['creator_id'], $events);
        return response()->json(get_success_api_response(['insert_id' => $insert_id, 'image_path' => $data['image_path']]));
    }

    /**
     * 保存图纸及图纸属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function store(Request $request)
    {
        //获取所有参数并检测
        $input = $request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->save($input);
        $input['image_path'] = $this->model->getImagePathBy($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($input));
    }

    /**
     * 批量上传图片
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     */
    public function batchUploadDrawing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        $categoryObj = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$categoryObj) TEA('700', 'category_id');
        if (empty($input['drawings'])) TEA('700', 'drawings');

        $keyVal = [
            'ctime' => time(),
            'mtime' => time(),
            'category_id' => $input['category_id'],
            'company_id' => (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0,
            'factory_id' => (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'creator_id' => (session('administrator')) ? session('administrator')->admin_id : 0,
        ];

        $results = [];
        foreach ($input['drawings'] as $drawing) {
            $keyVal['extension'] = $drawing->getClientOriginalExtension();
            if (!$keyVal['extension'] || !in_array(strtolower($keyVal['extension']), $this->allowed_extensions)) TEA('1101');//不被允许的文件

            $keyVal['image_path'] = Storage::disk('public')
                ->putFile(config('app.drawing_library') . $categoryObj->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $drawing);
            if (empty($keyVal['image_path'])) TEA('7028');//上传失败

            $keyVal['image_orgin_name'] = $drawing->getClientOriginalName();
            $temp = explode('/', $keyVal['image_path']);
            $keyVal['image_name'] = end($temp);
            $insertID = $this->model->addDrawing($keyVal);
            $obj = $this->model->getRecordById($insertID, ['image_path']);
            Thumb::createDrawingThump([$obj], $categoryObj->owner);//生成缩略图
            $results[] = [
                'insert_id' => $insertID,
                'image_path' => $keyVal['image_path'],
            ];
        }

        return response()->json(get_success_api_response($results));
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function batchStore(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkBatchStore($input);

        $CareLabel = new CareLabel();

        $drawingIDArr = [];

        $keyVal = [
            'group_id' => $input['group_id'],
            'category_id' => $input['category_id']
        ];

        try {
            DB::connection()->beginTransaction();
            foreach ($input['drawings'] as $drawingItem) {
                $keyVal['drawing_id'] = $drawingItem['drawing_id'];
                $keyVal['code'] = $drawingItem['code'];
                $keyVal['name'] = $drawingItem['name'];
                $this->model->batchSave($keyVal);
                $CareLabel->store($drawingItem);
                $drawingIDArr[] = $drawingItem['drawing_id'];
            }
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();

        /**
         * 上面的保存 执行完成之后，把洗标的推送操作放在队列里面
         */
        foreach ($drawingIDArr as $drawingID) {
            $param['drawing_id'] = $drawingID;
            $job = (new PushCareLabel($param))->onQueue('pushCareLabel');
            $this->dispatch($job);
        }

        return response()->json(get_success_api_response(200));
    }

//endregion

//region 查

    /**
     * 查询图纸详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function show(Request $request)
    {
        $input = $request->all();
        if (empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $obj = $this->model->get($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 图纸分页列表
     * @param $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getDrawingListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 根据图纸来源获取图纸
     * @param $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function getImagesByCategory(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['owner'])) TEA('700', 'owner');
        $this->checkPageParams($input);
        $obj_list = $this->model->getDrawingListByCategory($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 获取图纸的属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getImagesAttributes(Request $request)
    {
        $drawing_id = $request->input('drawing_id');
        if (empty($drawing_id)) TEA('700', 'drawing_id');
        $imageAttributeDao = new ImageAttribute();
        $obj_list = $imageAttributeDao->getDrawingAttributeList($drawing_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据分类查找图纸
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectByCategory(Request $request)
    {
        $owner = $request->input('owner');
        if (empty(trim($owner))) TEA('700', 'owner');
        $obj_list = $this->model->selectByCategory($owner);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取和做法关联的数据(分页)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-04-26
     */
    public function selectPracticeDrawing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getDrawingListByPractice($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * drawing_attributes 是必传的
     * 根据属性和属性值搜索出响应的图纸
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-05-02
     */
    public function listBySearchStr(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->getDrawingListBySearchStr($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 洗标列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function careLabelPageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->getPageIndexByCareLabel($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

//endregion

//region 修

    /**
     * 修改图纸
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update(Request $request)
    {
        $input = $request->all();
        $this->model->checkFormFields($input);
        $this->model->update($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 重新上传文件，并保存文件数据
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author lester.you
     */
    public function reUploadImage(Request $request)
    {
        $input = $request->all();
        trim_strings($request);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['drawing'])) TEA('700', 'drawing');
        $data = [];
        $admin = session('administrator');
        $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $data['extension'] = $input['drawing']->getClientOriginalExtension();//文件后缀
        if (!$data['extension'] || !in_array(strtolower($data['extension']), $this->allowed_extensions)) TEA('1101');//不被允许的文件
        $category = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$category) TEA('700', 'category_id');
        $data['image_path'] = Storage::disk('public')->putFile(config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $input['drawing']);
        if (empty($data['image_path'])) TEA('7028');//上传失败
        $data['image_orgin_name'] = $input['drawing']->getClientOriginalName();
        $data['category_id'] = $input['category_id'];
        $temp = explode('/', $data['image_path']);
        $data['image_name'] = end($temp);
        $data['ctime'] = time();
        $insert_id = $this->model->addTempFileData($data);
        return response()->json(get_success_api_response(['drawing_temp_id' => $insert_id, 'image_path' => $data['image_path']]));
    }

//endregion

//region 删

    /**
     * 删除图纸
     * @param Request $request
     */
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function destroy(Request $request)
    {
        $input = $request->all();
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        if (empty($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $this->model->delete($input[$this->model->apiPrimaryKey], $creator_id);
        $events = [
            'action' => 'delete', //必填字段,值为add|delete|update            Y
            'desc' => '删除图纸及其属性',//对当前事件行为的描述         Y
        ];
        Trace::save(config('alias.rdr'), $input[$this->model->apiPrimaryKey], $creator_id, $events);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion
//test_test

}