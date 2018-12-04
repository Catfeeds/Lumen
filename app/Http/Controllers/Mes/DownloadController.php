<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/18
 * Time: 下午1:43
 */

/**
 *MES系统通用下载控制器类
 * @author    sam.shan  <sam.shan@ruis-ims.cn>
 */

namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;




class DownloadController extends Controller
{

    /**
     * GeneralController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }



    /**
     * @param Request $request
     * 注：1.管理文件下载的 Symfony HttpFoundation 类要求被下载文件有一个 ASCII 文件名，这意味着被下载文件名不能是中文。
     *    2.注意客户端的缓存情况,如果不想缓存,请设置header一并返回
     * @author  sam.shan   <sam@ruis-ims.cn>
     */
    public function attachment(Request $request)
    {

        $pathToFile=$request->input('attachment_path');
        if(empty($pathToFile)) TEA('739','attachment_path');
        $filename=$request->input('filename');
        if(empty($filename)){
            $path_arr=explode('/',str_replace('\\','/',$pathToFile));
            $filename=end($path_arr);
        }
        //拼接路径
        $document_root=$request->server('DOCUMENT_ROOT');
        $download_path=$document_root.DIRECTORY_SEPARATOR.$pathToFile;
        //是否存在(这里用软链路径判断即可)
        if(!is_file($download_path) || !is_readable($download_path)) TEA('7026');

        return response()->download($download_path,$filename);
        //return response()->download($pathToFile, $name, $headers);
        //return response()->download($pathToFile)->deleteFileAfterSend(true);

    }












}










