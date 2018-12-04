<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 18/05/30
 * Time: 上午9:02
 */

namespace App\Http\Controllers\Mes;
use App\Http\Models\Version;
use App\Libraries\Trace;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class VersionController extends Controller
{

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Version();
    }

    public function managerVersion(){
        $version_config = config('version','undefined');
        $time = $this->model->checkVersion($version_config);

        $tmp = explode('|',$version_config['comment']);
        $info = [];
        foreach ($tmp as $key => $v) {
            $info[$key] = trim($v);
        }
        $data = [];
        $data['version'] = $version_config['version'];
        $data['time'] = $version_config['time'];
        //$data['time'] = $time->addtime;
        $data['comment'] = $info;

        return  response()->json(get_success_api_response($data));
    }


}


