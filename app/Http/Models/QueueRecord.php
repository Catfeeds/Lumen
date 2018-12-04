<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/10/11 9:57
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class QueueRecord extends Base
{
    public $apiPrimaryKey = 'queue_record_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rqr');
    }

    /**
     *
     * @param array $input
     * @return int
     */
    public function store($input)
    {
        $keyVal = [
            'queue_name' => get_value_or_default($input, 'queue_name'),
            'input_data' => json_encode(get_value_or_default($input, 'input_data')),
            'code' => get_value_or_default($input, 'code', 1),
            'output_data' => json_encode(get_value_or_default($input, 'output_data')),
            'ctime' => time(),
            'attempts' => get_value_or_default($input, 'ctime', 1),
        ];
        return DB::table($this->table)->insertGetId($keyVal);
    }

    /**
     * @param int $id
     * @param string $code
     * @param array $out_data
     * @return void
     */
    public function updateStatus($id, $code, $out_data = [])
    {
        $out_json = empty($out_data) ? '' : json_encode($out_data);
        DB::table($this->table)
            ->where('id', $id)
            ->update([
                'code' => $code,
                'output_data' => $out_json
            ]);
    }
}