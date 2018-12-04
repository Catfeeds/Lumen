<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/8/8 9:50
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class SapApiRecord extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.sar');
    }

    /**
     * @param $input
     * @throws \App\Exceptions\ApiSapException
     */
    public function checkControl($input)
    {
        if (empty($input['CONTROL'])) TESAP('700', 'CONTROL');
        $control = $input['CONTROL'];
        if (empty($control['SERVICEID'])) TESAP('700', 'SERVICEID');
        if (empty($control['SRVGUID'])) TESAP('700', 'SRVGUID');
        if (empty($control['SRVTIMESTAMP'])) TESAP('700', 'SRVTIMESTAMP');
        if (empty($control['SOURCESYSID'])) TESAP('700', 'SOURCESYSID');
        if (empty($control['TARGETSYSID'])) TESAP('700', 'TARGETSYSID');
    }

    /**
     * @param $input
     * @throws \App\Exceptions\ApiSapException
     */
    public function checkData($input)
    {
        if (empty($input['DATA'])) TESAP('700', 'DATA');
    }

    /**
     * 存储 control
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     * @return mixed
     */
    public function store($input)
    {
        $this->checkControl($input);
        $this->checkData($input);
        $control = $input['CONTROL'];
        $keyVal = [
            'serviceID' => $control['SERVICEID'],
            'srvGUID' => $control['SRVGUID'],
            'srvTimestamp' => $control['SRVTIMESTAMP'],
            'sourceSysID' => $control['SOURCESYSID'],
            'targetSysID' => $control['TARGETSYSID'],
            'ctime' => time(),
            'returnCode' => empty($input['returnCode']) ? 0 : $input['returnCode'], // 默认为 0 成功
            'data_json' => json_encode($input['DATA']),
            'request_uri' => empty($_SERVER['REQUEST_URI']) ? ((empty($input['REQUEST_URI']) ? '' : $input['REQUEST_URI'])) : $_SERVER['REQUEST_URI']
        ];

        $sapApiRecordID = DB::table($this->table)->insertGetId($keyVal);
        if (!$sapApiRecordID) TEA('2450');
        session(['sap_api_record_id' => $sapApiRecordID]);
        return $sapApiRecordID;
    }

    /**
     * @param int $id
     * @param string $code
     * @param array $returnData
     */
    public function updateStatus($id, $code, $returnData = [])
    {
        $returnJson = empty($returnData) ? '' : json_encode($returnData);
        DB::table($this->table)
            ->where('id', $id)
            ->update([
                'returnCode' => $code,
                'return_json' => $returnJson
            ]);
    }

    /**
     * 获取control字段数据
     *
     * @param $id
     * @return mixed
     */
    public function getControl($id)
    {
        return DB::table($this->table)->where('id', $id)->select(['serviceID', 'srvGUID'])->first();
    }


    /**
     * @param $input
     * @return mixed
     */
    public function pageIndex(&$input)
    {
        $where = [];
        if(!empty($input['start_time'])) $where[] = ['ctime', '>', strtotime($input['start_time'])];
        if(!empty($input['end_time'])) $where[] = ['ctime', '<', strtotime($input['end_time'])];
        if(!empty($input['keyword'])) $where[] = ['data_json', 'like', '%' . $input['keyword'] . '%'];
        if(empty($input['page_no'])) $input['page_no'] = 1;
        if(empty($input['page_size'])) $input['page_size'] = 20;
        $builder = DB::table($this->table)
            ->select("*")
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->forPage($input['page_no'], $input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy( $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->sourceSysName = $this->sysCodeToString($v->sourceSysID);
            $v->targetSysName = $this->sysCodeToString($v->targetSysID);
        }
        return $obj_list;
    }

    /**
     * @param $sysCode
     * @return string
     */
    private function sysCodeToString($sysCode)
    {
        if (empty($sysCode)) {
            return '';
        }
        $string = '';
        switch ($sysCode) {
            case '0002':
                $string = 'SAP_MM';
                break;
            case '0003':
                $string = 'SAP_PP';
                break;
            case '0021':
                $string = 'WMS';
                break;
            case '0022':
                $string = 'MES';
                break;
            case '0024':
                $string = 'SRM';
                break;
        }
        return $string;
    }

}