<?php
/**
 * Created by PhpStorm.
 * User: lester.you
 * Date: 18/09/10
 * Time: 下午18:06
 */

namespace App\Http\Controllers\Test;

use App\Http\Models\Bom;
use App\Http\Models\MaterialRequisition;
use App\Http\Models\OperationOrder;
use App\Jobs\SyncBomMaterial;
use App\Jobs\TestJob;
use App\Jobs\Test2Job;
use App\Libraries\Soap;
use App\Libraries\SoapSrm;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
//use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;//图像处理
use Intervention\Image\ImageManager;//可以直接使用
use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use Illuminate\Support\Facades\DB;//引入DB操作类
use Illuminate\Http\Request;
use App\Libraries\MongodbLog;
use Gregwar\Captcha\PhraseBuilder;
use Gregwar\Captcha\CaptchaBuilder;
use Maatwebsite\Excel\Facades\Excel;
use PHPExcel;

/**
 * 用来测试的控制器
 * Class SamController
 * @package App\Http\Controllers\Test
 */
class LesterController extends BaseController
{


    public function queueAsync(Request $request)
    {
        for ($i = 0; $i < 40; $i++) {
            $job = (new TestJob('Message:id=' . $i . ' test1 '))->onConnection('redis')->onQueue('test1');
            $this->dispatch($job);
        }
        return response()->json(json_encode([200]));
    }

    public function queueSync(Request $request)
    {
        $input = $request->all();
        $url = $request->url();


        for ($i = 0; $i < 20; $i++) {
            $job = (new Test2Job('Message:id=' . $i . ' test2 '))->onConnection('redis')->onQueue('test2');
            $this->dispatch($job);
        }
        return response()->json(json_encode([200]));
    }

    public function bom(Request $request)
    {
        $input = $request->all();
        $input['_type'] = 'bom';
        $job = (new SyncBomMaterial($input))->onQueue('bom_materiel');
        $this->dispatch($job);
    }

    public function material(Request $request)
    {
        $input = $request->all();
        $input['_type'] = 'material';
        $job = (new SyncBomMaterial($input))->onQueue('bom_materiel');
        $this->dispatch($job);
    }

    public function import(Request $request)
    {
        $objs = DB::table(config('alias.sar'))->select(['serviceID', 'data_json'])->where('id', '<', 51)->get();
        foreach ($objs as $key => $value) {
            if (!empty($value->data_json)) {
                $data = json_decode($value->data_json, true);
                if ($value->serviceID == 'INT_PP000300010') {
                    $_type = 'bom';
                } else {
                    $_type = 'materiel';
                }
                $job = (new SyncBomMaterial(['_type' => $_type, 'DATA' => $data]))->onQueue('bom_materiel');
                $this->dispatch($job);
            }
        }
        return response()->json(json_encode('ok'));
    }

    public function srm(Request $request)
    {
        //头部信息已经做公共处理
        // $header = [
        //     'BUSINESS_GROUP' => 'BG00000101',
        //     'SYSTEM_CODE' => 'BG00000101_SAP',
        //     'REQUEST_ID' => time(),
        //     'IF_CATE_CODE' => 'QMS_CLAIM_FORM',
        //     'IF_CODE' => 'PUR_QMS_CLAIM_FORM_IMP',
        //     'USER_NAME' => '86234908',
        //     'PASSWORD' => 'A083BC7AC27350AB4072E06F7CF2A53C',
        //     'BATCH_NUM' => 1,
        //     'SEG_NUM' => 1,
        //     'TOTAL_SEG_COUNT' => 1
        // ];    

        $lns_record = [
            'ES_FORM_CODE' => 1111,
            'CLAIM_ITEM_CODE' => 2222,
            'AMOUNT' => 222,
            'OCCURRED_DATE' => 1,
            'RESPONSIBLE_ITEM_CODE' => 1,
            'RESPONSIBLE_ITEM_UOM' => 1,
            'RESPONSIBLE_ITEM_SUM' => 1,
            'DEFECT_DESC' => 1,
            'DEFECT_SUM' => 1,
            'RELATIVE_ITEM_CODE' => 1,
            'RELATIVE_ITEM_UOM' => 1,
            'RELATIVE_ITEM_SUM' => 1,
            'COMMENTS' => 1,
            'CLAIM_DESC'=>1
        ];
        for ($i = 1; $i <= 10; $i++) {
            $lns_record['ATTRIBUTE_' . $i] = $i;
        }
        $hds_record = [
            'ES_FORM_ID' => 111111,
            'ES_FORM_CODE' => 2222,
            'ES_FORM_STATUS' => 123132,
            'CLAIM_TYPE_CODE' => 123,
            'DATA_SOURCE' => 1232,
            'DATA_SOURCE_CODE' => 123,
            'CLAIM_DESC' => 1232,
            'ES_VENDOR_CODE' => 12,
            'TOTAL_AMOUNT' => 1,
            'CURRENCY_CODE' => 'CNY',
            'FEEDBACK_DATE' => 2,
            'FEEDBACK_OPINION' => 2,
            'RELEASED_BY_CODE' => 1,
            'RELEASED_BY_DESC' => 1,
            'RELEASED_DATE' => 1,
            'ES_BUSINESS_UNIT_CODE' => 1,
            'ES_INV_ORGANIZATION_CODE' => 1,
            'EITF_QMS_CLAIM_FORM_LNS' => [
                'RECORD' => $lns_record
            ]
        ];
        for ($i = 1; $i <= 5; $i++) {
            $hds_record['ATTRIBUTE_' . $i] = $i;
        }
        $data = [
            'EITF_QMS_CLAIM_FORM_HDS' => [
                'RECORD' => $hds_record
            ]
        ];
//        $response_srm = SoapSrm::getParams();
//        $response = SoapSrm::getFunctions();
        $response = SoapSrm::doRequest($data);
//        print_r($response_srm);
//        print_r($response);
        return response()->json(get_success_api_response($response));
    }

    public function errorTest(Request $request)
    {
        $input = $request->all();
//        $response[2112]= get_error_info_by_code(2112);
        $response[2480]= get_error_info_by_code(2480);
        $response[2499]= get_error_info_by_code(2499);
        $response[$input['code']]= get_error_info_by_code($input['code']);
        return response()->json($response);
    }

    public function SapReturn(Request $request)
    {
        $input = $request->all();
        $MaterialRequisition = new MaterialRequisition();
        $response = $MaterialRequisition->checkIsLastReturn(273);
        return response()->json($response);
    }

    /**
     * 测试mongodb的
     */
    public function mongo()
    {
        MongodbLog::writeLog();
        //查询个数
//        $count=DB::connection('mongodb-log')->collection('test')->count();
//        p($count);
//
//        //查询列表
//        $get=DB::connection('mongodb-log')->collection('test')->get();
//        p($get);
//
//        //直接求和,注意,age字段在mongodb中一定得是number
//
//        $sum=DB::connection('mongodb-log')->collection('test')->sum('age');
//        p($sum);
//
//        //插入
//
//        $insert=DB::connection('mongodb-log')->collection('test')->insert(['name'=>'test','age'=>100,'sex'=>1]);
//        dd($insert);

    }


    /**
     * 测试缓存驱动
     * https://d.laravel-china.org/docs/5.5/cache
     */
    public function cache()
    {
        //cache未指明驱动的时候取的是.env中配置的驱动
        //另外使用cache在配置或者获取的时候,底层都会默认取laravel前缀的
//        $value = Cache::get('age');
//        p($value);

//        $value = Cache::store('memcache')->get('fpkjbe4di7eccd1hl74a3a3056');
//        //$value=explode('"',$value);
//        pd($value);
//        exit;


        Cache::store('memcached')->put('name2', 'aha', 120);


        p(Cache::store('memcached')->get('name2'));


        Cache::store('redis')->put('who', 'sam is a good man', 120);

        $value = Cache::store('redis')->get('ceshi');
        pd($value);

        //读取
        Cache::get('company');
        //写入
        Cache::put('company', 'ruis', 2);//2分钟
        //读取
        Cache::get('company');
        Cache::get('company1');
        //删除

        Cache::forget('company');
        Cache::forget('company1');
        //清空 只有上述几个操作是有监听事件的,其余的都没有,所有未监听的操作慎用
        //Cache::flush();
//        Cache::increment('key');
//
//        Cache::increment('key', $amount);
//
//        Cache::decrement('key');
//
//        Cache::decrement('key', $amount);

        //注意,如果有一组缓存是联动的,就是同时存在,同时消失的,则可以使用缓存标签,设置缓存组即可,但不建议这么用


        //先从缓存中获取
        //$sidebars=Cache::get(md5('sidebars'));
        //if(!empty($sidebars)) return unserialize($sidebars);

        //存入缓存
        //Cache::forever(md5('sidebars'),serialize($sidebars));
    }


    /**
     * 测试redis
     */
    public function redis()
    {
        Redis::set('shit', 'lilin');
        $user = Redis::get('shit');
        pd($user);
    }


    /**
     * 文件系统测试
     */
    public function filesystems(Request $request)
    {
        //php artisan storage:link

        //存储在  storage/app/public
        //软链   public/storage====>storage/app/public

        //你可以使用 Artisan 命令 storage:link 来创建符号链接：
        //php artisan storage:link

        //当然，一旦一个文件被存储并且已经创建了符号链接，你就可以使用辅助函数 asset 来创建文件的 URL：
        //echo asset('storage/file.txt'); 这个方法不存在了,在lumen中

        //这里的手法和缓存的手法一样的,disk可以指明使用哪个磁盘,不指明的话,就是默认的
        //Storage::put('file.txt', 'Contents');
        //Storage::disk('local')->put('file.txt', 'Contents');
        //Storage::disk('upload')->put('file.txt', 'Contents');
        /*
         |----------------------------------------------------------------------
         |检索文件
         |-----------------------------------------------------------------------
         */

        //get 方法可以用于检索文件的内容，此方法返回该文件的原始字符串内容。
        //切记，所有文件路径的指定都应该相对于为磁盘配置的 root 目录
        //$contents = Storage::get('file.txt');
        //pd($contents);

        //exists 方法可以用来判断磁盘上是否存在指定的文件：
        //$exists = Storage::disk('upload')->exists('file.txt');
        //dd($exists);
        /*
        |----------------------------------------------------------------------
        |文件URLs
        |-----------------------------------------------------------------------
        */

        //$url=Storage::url('file.txt');
        //$url=Storage::disk('upload')->url('file.txt');
        //pd($url);

        //切记，如果使用的是 local 驱动，则所有想被公开访问的文件都应该放在 storage/app/public 目录下。
        //此外，你应该在 public/storage 创建一个符号链接 来指向 storage/app/public 目录。


        /*
        |----------------------------------------------------------------------
        |自定义本地 URL 主机
        |-----------------------------------------------------------------------
        */
        //如果要使用 local 驱动为存储在磁盘上的文件预定义主机，可以向磁盘配置数组添加一个 url 选项：


        /*
       |----------------------------------------------------------------------
       |文件元数据
       |-----------------------------------------------------------------------
       */
        //size 方法可用来获取文件的大小（以字节为单位),请先判断是否存在额
        //$size = Storage::size('file.txt');
        //dd($size);

        //lastModified 方法返回最后一次文件被修改的 UNIX 时间戳：
        //$time = Storage::lastModified('file.txt');
        //echo date('Y-m-d H:i:s',$time);

        /*
        |----------------------------------------------------------------------
        |保存文件
        |-----------------------------------------------------------------------
        */

        //put 方法可用于将原始文件内容保存到磁盘上。
        //你也可以传递 PHP 的 resource 给 put 方法，它将使用文件系统下的底层流支持。强烈建议在处理大文件时使用流：
        //Storage::put('file.jpg', $contents);
        //Storage::put('file.jpg', $resource);

        //自动流式传输
        //这两个方法接受 Illuminate\HTTP\File 或 Illuminate\HTTP\UploadedFile 实例

        // 自动为文件名生成唯一的 ID...
        //Storage::putFile('photos', new File('/path/to/photo'));

        // 手动指定文件名...
        //Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
        //前置&追加到文件内容
        //Storage::prepend('file.txt', 'Prepended Text');
        //Storage::append('file.txt', 'Appended Text');

        //复制 & 移动,目录不存在都是会自动创建的,非常棒
        //copy 方法可用于将现有文件复制到磁盘的新位置，而 move 方法可用于重命名或将现有文件移动到新位置：
        //Storage::disk('upload')->move('file.txt','file2.txt'); 这是将upload下的file.txt剪切到upload下并重命名为file2.txt
        //Storage::move('file.txt', 'new/new_file.txt');


        /*
         |----------------------------------------------------------------------
         |文件上传
         |-----------------------------------------------------------------------
         */


        /*
       |----------------------------------------------------------------------
       |文件可见性
       |-----------------------------------------------------------------------
       */

        //Storage::put('file.jpg', $contents, 'public');
        //$visibility = Storage::getVisibility('file.jpg');

        /*
         |----------------------------------------------------------------------
         |删除文件
         |-----------------------------------------------------------------------
         |注意只能删除文件
         */

        //delete 方法接受文件名或文件名数组参数来删除磁盘中相应的文件
        //Storage::delete('file.txt');
        //Storage::disk('public')->delete('file2.txt');
        //Storage::delete(['file1.jpg', 'file2.jpg']);

        /*
         |----------------------------------------------------------------------
         |目录
         |-----------------------------------------------------------------------
         |注意只能删除文件
         */

        //获取目录中的所有文件
        //files 方法返回给定目录下的所有文件的数组。
        //如果你想检索包含所有子目录在内的给定目录中的所有文件的列表，可以使用 allFiles 方法
        //$files = Storage::disk('upload')->files(date('Y-m-d'));
        //pd($files);
        //$files = Storage::allFiles();
        //pd($files);

        //获取目录内所有目录
        //directories 方法返回给定目录下的所有目录的数组。
        //另外，你可以使用 allDirectories 方法获取给定目录及其所有子目录中的所有目录的列表
        //$directories = Storage::directories();
        //pd($directories);
        //$directories = Storage::allDirectories();
        //pd($directories);

        //创建目录
        //makeDirectory 方法将创建给定的目录，包括任何所需的子目录：
        //Storage::makeDirectory('photo');

        //删除目录
        //最后，deleteDirectory 方法可用于删除目录及其所有文件：
        //Storage::deleteDirectory('photo');

    }


    public function upload(Request $request)
    {
        //p($request->input());
        p($_FILES);
        p($request->file('attachment'));


    }

    public function upload2(Request $request)
    {
        //p($request->input());

        p($_FILES);

        p($request->file('attachment1'));
        p($request->file('attachment2'));


        // $path = $request->file('avatar')->store('avatars');


    }


    public function upload3(Request $request)
    {


        //自动生成文件名
        //$path = $request->file('attachment')->store('upload');[这个默认是用不了的,缺少包]
        //$path = Storage::disk('upload')->putFile(date('Y-m-d'), $request->file('attachment'));
        //pd($path);

        //指定文件名
        //$path = $request->file('avatar')->storeAs('avatars','test');[]
        //pd($path);
        $path = Storage::disk('upload')->putFileAs(date('Y-m-d'), $request->file('attachment'), 'test2.jpg');
        pd($path);


    }


    public function image()
    {

        /*
         |----------------------------------------------------------------------
         |框架中的通用形式
         |-----------------------------------------------------------------------
         |1.先读取图纸
         |2.调整大小
         |3.读取水印图
         |4.保存即可
         */

//        // open an image file
//        $img = Image::make('b.jpg');
//        // resize image instance
//        $img->resize(1440,900);
//        // insert a watermark
//        $img->insert('test2.jpg');
//        // save image in desired format
//        $img->save('w2.jpg');
        /*
         |----------------------------------------------------------------------
         |Color Formats
         |-----------------------------------------------------------------------
         */


        // pick color and fill image
//        $color = Image::make('../storage/app/public/upload/2017-11-14/test.jpg')->pickColor(10, 10);
//        pd($color);
//        $img->fill($color);


        $color = Image::make('../storage/app/public/upload/2017-11-14/test.jpg')->resize(500, 500)->save('thumb.jpg');


    }


    /**
     * 测试PHP语法
     */
    public function syntax()
    {
        //获得脚本进程中定义的所有类的数组
        pd(get_declared_classes());


    }


    /**
     * @param int $id 节点ID,一棵树的节点应该是唯一的,但是这里的节点可以是0,是0的话显示的就是整个家谱树了
     * @param array $results 返回值址传递声明
     * @param int $level 层级,默认是0
     * @return array          返回遍历的返回值
     * @todo  这里适合常量树节点的遍历,如果节点过多,不适合每次查询,应该一次性查询,请使用Tree操作类进行解决
     */
//    public function  getTreeList($id=0,&$results=[],$level=0)
//    {
//
//        //看看这个节点有哪些儿子再说,返回值为对象之数组对象
//        $obj_list=DB::table(self::MC)->select('id','name','parent_id')->where('parent_id','=',$id)->get();
//        //遍历的时候,会按照迭代器指定的规则进行输出
//        foreach ($obj_list as $key => $obj) {
//            $obj->level=$level;
//            $results[]=$obj;
//            $this->getTreeList($obj->id,$results,$level+1);
//        }
//
//        return $results;
//
//    }


    public function view01()
    {
        $person = [
            'name' => 'sam',
            'age' => 23,
        ];
        return view('test.view01', compact('person'));
    }


    public function ajax01()
    {
        return view('test.ajax01');

    }


    public function cookie01()
    {
        $id = session()->getId();
        $name = session()->getName();
        $value = app('request')->cookie('honesty');
        pd($value, $id, $name);
    }


    public function captcha01()
    {

        $phrase = new PhraseBuilder;
        // 设置验证码位数
        $code = $phrase->build(6);
        // 生成验证码图纸的Builder对象，配置相应属性
        $builder = new CaptchaBuilder($code, $phrase);
        // 设置背景颜色
        $builder->setBackgroundColor(220, 210, 230);
        $builder->setMaxAngle(25);
        $builder->setMaxBehindLines(0);
        $builder->setMaxFrontLines(0);
        // 可以设置图纸宽高及字体
        $builder->build($width = 100, $height = 30, $font = null);
        // 获取验证码的内容
        $phrase = $builder->getPhrase();
        // 把内容存入session
//        \Session::flash('code', $phrase);
        // 生成图纸

        $builder->save('captcha/' . date('Y-m-d') . '/' . rand() . '.jpg');

        //直接输出到浏览器
        //header("Cache-Control: no-cache, must-revalidate");
        //header("Content-Type:image/jpeg");
        //$builder->output();

    }


    public function excelExport()
    {
        $cellData = [
            ['学号', '姓名', '成绩'],
            ['10001', 'AAAAA', '99'],
            ['10002', 'BBBBB', '92'],
            ['10003', 'CCCCC', '95'],
            ['10004', 'DDDDD', '89'],
            ['10005', 'EEEEE', '96'],
        ];
        Excel::create('学生成绩', function ($excel) use ($cellData) {
            $excel->sheet('score', function ($sheet) use ($cellData) {
                $sheet->rows($cellData);
            });
            //ob_end_clean();
        })->export('xlsx');
    }

    public function excelImport()
    {
        $filePath = 'storage/exports/' . iconv('UTF-8', 'GBK', '学生成绩') . '.xls';
        Excel::load($filePath, function ($reader) {
            $data = $reader->all();
            dd($data);
        });
        // 加载文件
        Excel::load('file.xls', function ($reader) {

            // 获取数据的集合
            $results = $reader->get();

            // 获取第一行数据
            $results = $reader->first();

            // 获取前10行数据
            $reader->take(10);

            // 跳过前10行数据
            $reader->skip(10);

            // 以数组形式获取数据
            $reader->toArray();

            // 打印数据
            $reader->dump();

            // 遍历工作表
            $reader->each(function ($sheet) {

                // 遍历行
                $sheet->each(function ($row) {

                });

            });

            // 获取指定的列
            $reader->select(array('firstname', 'lastname'))->get();

            // 获取指定的列
            $reader->get(array('firstname', 'lastname'));

        });

        // 选择名为sheet1的工作表
        Excel::selectSheets('sheet1')->load();

        // 根据索引选择工作表
        Excel::selectSheetsByIndex(0)->load();
    }















########################控制器的区域划分#########################


########################模型的区域划分#########################

//region 拆生产订单


//endregion
//region  增


//endregion
//region  修


//endregion
//region  查


//endregion
//region  删


//endregion


}


