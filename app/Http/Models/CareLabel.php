<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/26 22:12
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class CareLabel extends Base
{
    protected $apiPrimaryKey = 'care_label_id';

    public function __construct()
    {
        !$this->table && $this->table = config('alias.rdcl');
    }

//region 检

    /**
     *
     * 检验 SAP 翻单 参数
     *
     * VBELN 销售凭证
     * POSNR 销售凭证项目
     * MATNR 物料编号
     * VER   版本
     * VGBEL 参考单据的单据编号
     * VGPOS 参考项目的项目号
     *
     * @param $input
     * @throws \App\Exceptions\ApiSapException
     */
    public function checkSapParams($input)
    {
        $data = $input['DATA'];
        foreach ($data as $value) {
            if (empty($value['VBELN'])) TESAP('700', 'VBELN');
            if (empty($value['POSNR'])) TESAP('700', 'POSNR');
            if (empty($value['MATNR'])) TESAP('700', 'MATNR');
            if (empty($value['VER'])) TESAP('700', 'VER');
            if (empty($value['VGBEL'])) TESAP('700', 'VGBEL');
            if (empty($value['VGPOS'])) TESAP('700', 'VGPOS');
            $has = $this->isExisted([
                ['sale_order_code', '=', $value['VGBEL']],
                ['line_project_code', '=', $value['VGPOS']],
                ['material_code', '=', $value['MATNR']],
                ['version_code', '=', $value['VER']],
            ]);
            if (!$has) TESAP('2435');
        }
    }


    /**
     * 检查洗标参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkCareLabel(&$input)
    {
        if (empty($input['drawing_id'])) TEA('700', 'drawing_id');
        $drawing_has = $this->isExisted([['id', '=', $input['drawing_id']]], config('alias.rdr'));
        if (!$drawing_has) TEA('700', 'drawing_id');

        if (empty($input['items'])) TEA('700', 'items');

        foreach ($input['items'] as $value) {
            if (empty($value['sale_order_code'])) TEA('700', 'sale_order_code');
            if (empty($value['line_project_code'])) TEA('700', 'line_project_code');
            if (empty($value['material_code'])) TEA('700', 'material_code');
            if (empty($value['version_code'])) TEA('700', 'version_code');
        }
    }

//endregion

//region 增

    /**
     * 增 & 删 & 修改
     *
     * @param array $input
     */
    public function store($input)
    {
        $db_obj_lists = DB::table($this->table)->select('id')->where('drawing_id', $input['drawing_id'])->get();

        $db_id_arr = [];
        foreach ($db_obj_lists as $value) {
            $db_id_arr[] = $value->id;
        }

        $add_arr = [];
        $update_id_arr = [];
        $update_arr = [];
        foreach ($input['items'] as $value) {
            if (!isset($value[$this->apiPrimaryKey])) {
                $add_arr[] = $value;
            } else {
                $update_id_arr[] = $value[$this->apiPrimaryKey];
                $update_arr[$value[$this->apiPrimaryKey]] = $value;
            }
        }

        $delete_id_arr = array_diff($db_id_arr, $update_id_arr);

        // 增
        $temp = ['drawing_id' => $input['drawing_id']];
        $keyVal_arr = [];
        foreach ($add_arr as $v) {
            $temp['sale_order_code'] = $v['sale_order_code'];
            $temp['line_project_code'] = str_pad($v['line_project_code'],6,'0');
            $temp['material_code'] = $v['material_code'];
            $temp['version_code'] = $v['version_code'];
            $keyVal_arr[] = $temp;
        }
        //如果不为空，则插入
        if (!empty($keyVal_arr)) {
            DB::table($this->table)->insert($keyVal_arr);
            //如果为增加，更新当前图片 为 洗标类型
            DB::table(config('alias.rdr'))->where('id', $input['drawing_id'])->update(['is_care_label' => 1]);
        }

        // 删
        DB::table($this->table)->whereIn('id', $delete_id_arr)->delete();

        // 改
        foreach ($update_arr as $value) {
            DB::table($this->table)
                ->where('id', $value[$this->apiPrimaryKey])
                ->update([
                    'sale_order_code' => $value['sale_order_code'],
                    'line_project_code' => str_pad($value['line_project_code'],6,'0'),
                    'material_code' => $value['material_code'],
                    'version_code' => $value['version_code'],
                ]);
        }
    }

    /**
     * SAP 翻单
     *
     * @param array $input
     */
    public function copyCareLabel($input)
    {
        $data = $input['DATA'];
        foreach ($data as $value) {
            // 判断 待添加的 是否存在
            $has = $this->isExisted([
                ['sale_order_code', '=', $value['VBELN']],
                ['line_project_code', '=', $value['POSNR']],
                ['material_code', '=', $value['MATNR']],
                ['version_code', '=', $value['VER']],
            ]);
            if ($has) {     // 待添加的已存在，则跳过
                continue;
            }

            // 获取参照 洗标
            $obj = DB::table($this->table)
                ->select([
                    'drawing_id',
                    'sale_order_code',
                    'line_project_code',
                    'material_code',
                    'version_code'
                ])
                ->where([
                    ['sale_order_code', '=', $value['VGBEL']],
                    ['line_project_code', '=', $value['VGPOS']],
                    ['material_code', '=', $value['MATNR']],
                    ['version_code', '=', $value['VER']],
                ])
                ->first();
            $keyValue = [
                'drawing_id' => $obj->drawing_id,
                'sale_order_code' => $value['VBELN'],
                'line_project_code' => $value['POSNR'],
                'material_code' => $obj->material_code,
                'version_code' => $obj->version_code,
            ];
            DB::table($this->table)->insert($keyValue);
        }
    }

//endregion

//region 删
//endregion

//region 改

    /**
     * 推送完成之后更新状态
     *
     * @param int $drawing_id
     */
    public function updatePushed($drawing_id)
    {
        DB::table(config('alias.rdr'))->where('id', $drawing_id)->update(['is_pushed' => 1]);
    }
//endregion

//region 查

    /**
     * 详情
     * @param int $drawing_id
     * @return mixed
     */
    public function show($drawing_id)
    {
        $obj_lists = DB::table($this->table)
            ->select([
                'id as ' . $this->apiPrimaryKey,
                'sale_order_code',
                'line_project_code',
                'material_code',
                'version_code'
            ])
            ->where('drawing_id', $drawing_id)
            ->get();
        return $obj_lists;
    }

    /**
     * 获取同步洗标数据
     *
     * @param int $id 图片drawing_id
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getSyncDataByDrawingID($id)
    {
        $obj_lists = DB::table($this->table . ' as rdcl')
            ->leftJoin(config('alias.rdr') . ' as rdr', 'rdcl.drawing_id', '=', 'rdr.id')
            ->select([
                'rdr.image_path',
                'rdcl.sale_order_code',
                'rdcl.line_project_code',
                'rdcl.material_code',
                'rdcl.version_code'
            ])
            ->where('rdr.id', $id)
            ->get();
        if (empty(obj2array($obj_lists))) {
            TEA('2436');
        }
        $syncData = [];
        foreach ($obj_lists as &$value) {
            $temp = [
                'VBELN' => $value->sale_order_code,
                'POSNR' => $value->line_project_code,
                'MATNR' => $value->material_code,
                'VER' => $value->version_code,
                'URL' => get_host(). '/storage/' . $value->image_path
            ];
            $syncData['CONTENT'][] = $temp;
        }
        return $syncData;
    }

//endregion


}