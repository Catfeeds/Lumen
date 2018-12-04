<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/10/19
 * Time: 上午9:02
 */

namespace App\Http\Controllers\Test;
use App\Http\Models\Bom;
use App\Http\Models\OperationOrder;
use App\Http\Models\ProductionWorkOrder;
use Codeception\Module\Memcache;
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
 * 大山用来测试的控制器
 * Class SamController
 * @package App\Http\Controllers\Test
 */
class SamController extends BaseController
{


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


        Cache::store('memcached')->put('name2', 'aha',120);


        p(Cache::store('memcached')->get('name2'));


        Cache::store('redis')->put('who', 'sam is a good man',120);

        $value=Cache::store('redis')->get('ceshi');
        pd($value);

        //读取
        Cache::get('company');
        //写入
        Cache::put('company','ruis',2);//2分钟
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
    public function  redis()
    {
        Redis::set('shit','lilin');
        $user=Redis::get('shit');
        pd($user);
    }


    public function index()
    {

        //return '{"min_value":0,"max_value":0,"default_value":0}';
        //return '{"default_value":"4","options":[{"label":"居中","code":"","index":"1"},{"label":"偏X居中","code":"","index":"2"},{"label":"偏Y居中","code":"","index":"3"},{"label":"固定值","code":"","index":"4"}]}';

        //return  '{"options":[{"label":"底布凹进","code":"","index":"1"}],"default_value":0}';


        return '{"title":"BPT1-CQ-SHJD-0002","name":"床裙","qty":"10[PCS]","id":"24083","type":"bom","children":[{"title":"BPQ-HQ2810B-0053","name":"绗缝绵","id":"109297","type":"bom_item","qty":"1.8[m]","not_accurate":0,"have_replace":0,"is_level_qty":0},{"title":"ML26-225030-0001","name":"无纺布","id":"109298","type":"bom_item","qty":"0.16[kg]","not_accurate":0,"have_replace":0,"is_level_qty":0},{"title":"ML11-220090-0002","name":"罗纹布","id":"109301","type":"bom_item","qty":"0.21[kg]","not_accurate":0,"have_replace":0,"is_level_qty":0},{"title":"ML05-212J01-0004","name":"TC布","id":"109302","type":"bom_item","qty":"2.33[m]","not_accurate":0,"have_replace":0,"is_level_qty":0},{"title":"CJ-C-HDW-4346","name":"TEST2","id":"109303","type":"bom_item","qty":"1[PCS]","not_accurate":0,"have_replace":0,"is_level_qty":0,"children":[{"title":"ML11-220090-0002","name":"罗纹布","id":"24323","type":"bom_item","qty":"0.14[kg]","not_accurate":1,"have_replace":0,"is_level_qty":0}]},{"title":"CJ-C-HDW-4345","name":"床垫罗纹布","id":"109304","type":"bom_item","qty":"1[PCS]","not_accurate":0,"have_replace":0,"is_level_qty":0,"children":[{"title":"ML11-220090-0002","name":"罗纹布","id":"24322","type":"bom_item","qty":"0.14[kg]","not_accurate":1,"have_replace":0,"is_level_qty":1}]},{"title":"DZHF-C-HDW-0387","name":"床垫tc布多针绗缝表面","id":"109305","type":"bom_item","qty":"1[PCS]","not_accurate":0,"have_replace":0,"is_level_qty":0,"children":[{"title":"BPQ-HQ2810B-0053","name":"绗缝绵","id":"24828","type":"bom_item","qty":"0[m]","not_accurate":1,"have_replace":0,"is_level_qty":0},{"title":"ML26-225030-0001","name":"无纺布","id":"24829","type":"bom_item","qty":"0[kg]","not_accurate":1,"have_replace":0,"is_level_qty":1},{"title":"ML05-212J01-0004","name":"TC布","id":"24833","type":"bom_item","qty":"0[m]","not_accurate":1,"have_replace":0,"is_level_qty":1}]}]}';

    }







    public function automaticCode()
    {

//        $set_code=DB::table('material_template_set_code')->where('template_id',29)->first();
//
//
//        $material_template_automatic_code =isset($set_code->code)?$set_code->code:'';
//        if (!$material_template_automatic_code)  return null;
//        eval($material_template_automatic_code);

        //JS-Q-HDW-0001
        $attributes=[];
        $attributes['category'] =[
            '17'=>'HD',//厚垫
            '28'=>'W',//外套
        ];//旧版是多选,新版是多选
        $attributes['group'] ='';//旧版是单选,新版是多选


        //编码第一部分:来源于物料模板中添加的自动编码代码
        $code = 'JS-';

        //编码第二部分:来源于添加物料时候选择的物料分组code
        $code .= 'Q' . '-';//物料分组为其他的时候,值是Q
        //编码第三部分:来源于添加物料时候选择的物料分类code的拼接
        $categories = $attributes['category'];
        foreach($categories as $category)
        {
            $code .=  $category;
        }

        $code .= '-';

        //编码第四部分,要么是0001,要么是匹配到的进行截取
        //去数据库搜索,看是否已经存在前三部分的编码组合了,比如我们在数据库中找到了一个即可,物料编码DESC排序
        $db_material_code ='JS-Q-HDW-0002';

        if ($db_material_code){
            //$zero = '';
            //code 后缀
            $code_sufix = (int)substr($db_material_code,-4,4) + 1;//0002+1=3
            //若不足4位，左侧补0
            $zero=str_pad($code_sufix,4,'0',STR_PAD_LEFT);
            /*
            for ($i=strlen($code_sufix); $i<4; $i++){
                $zero .= '0';
            }
            */
            $code .=  $zero;
        }else
        {
            $code .= '0001';
        }


       pd($code);

        return $code;


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


    public function  upload(Request $request)
    {
        //p($request->input());
        p($_FILES);
        p($request->file('attachment'));



    }

    public function  upload2(Request $request)
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
        $path = Storage::disk('upload')->putFileAs(date('Y-m-d'), $request->file('attachment'),'test2.jpg');
        pd($path);


    }



    public  function  image()
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



        $color = Image::make('../storage/app/public/upload/2017-11-14/test.jpg')->resize(500,500)->save('thumb.jpg');








    }


    /**
     * 测试PHP语法
     */
    public function   syntax()
    {
        //获得脚本进程中定义的所有类的数组
        pd(get_declared_classes());


    }


    /**
     * @param int $id         节点ID,一棵树的节点应该是唯一的,但是这里的节点可以是0,是0的话显示的就是整个家谱树了
     * @param array $results  返回值址传递声明
     * @param int $level      层级,默认是0
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
    $person=[
        'name'=>'sam',
        'age'=>23,
    ];
    return view('test.view01',compact('person'));
}



public function ajax01()
{
    return view('test.ajax01');

}


public function cookie01()
{
    $id=session()->getId();
    $name=session()->getName();
    $value = app('request')->cookie('honesty');
    pd($value,$id,$name);
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
        $builder->build($width =100, $height =30, $font = null);
        // 获取验证码的内容
        $phrase = $builder->getPhrase();
        // 把内容存入session
//        \Session::flash('code', $phrase);
        // 生成图纸

        $builder->save('captcha/'.date('Y-m-d').'/'.rand().'.jpg');

        //直接输出到浏览器
        //header("Cache-Control: no-cache, must-revalidate");
        //header("Content-Type:image/jpeg");
        //$builder->output();

    }




    ###### excel测试




    /**
     * 经营信息上传模板下载
     */
    public function  managementInfo()
    {
        #【第一步】首先创建一个新的对象  PHPExcel object 获取活动sheet
        $objPHPExcel = new PHPExcel();
        $objPHPExcel->setActiveSheetIndex(0);//选中第一个sheet，其实默认就已经选中第一个了，可以省略的
        $objActSheet=$objPHPExcel->getActiveSheet();
        $objActSheet->setTitle(date('Y',time()).'年');
        #【第二步】该sheet的整体样式
        $objActSheet->getDefaultStyle()->getAlignment()->setVertical(\PHPExcel_Style_Alignment::VERTICAL_CENTER)
            ->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
        $objActSheet->freezePane('B2');  //冻结窗口 A2冻结的是首行    B1冻结的是首列    B2冻结的是首行和首列，规律自己总结，以单元格来参考的
        $objActSheet->getDefaultStyle()->getFont()->setSize(14)->setName("宋体");
        $objActSheet->getDefaultRowDimension()->setRowHeight(25);//设置默认行高

        $objActSheet->getColumnDimension('A')->setWidth(10);//序号
        $objActSheet->getColumnDimension('B')->setWidth(40);//企业名称
        $objActSheet->getColumnDimension('C')->setWidth(20);//纳税总额
        $objActSheet->getColumnDimension('D')->setWidth(20);//资产总额
        $objActSheet->getColumnDimension('E')->setWidth(20);//营业收入
        $objActSheet->getColumnDimension('F')->setWidth(20);//利润总额
        $objActSheet->getColumnDimension('G')->setWidth(20);//用工人数


        $objActSheet->getStyle("A")->getNumberFormat()->setFormatCode(\PHPExcel_Style_NumberFormat::FORMAT_TEXT);//设置某列单元格格式为文本格式
        $objActSheet->getStyle("B")->getAlignment()->setWrapText(true);




        #【第三步】单元格标题
        $title=array(
            "A"=>"序号",
            "B"=>"企业名称",
            "C"=>"纳税总额（万元）",
            "D"=>"资产总额（万元）",
            "E"=>"营业收入（万元）",
            "F"=>"利润总额（万元）",
            "G"=>"用工人数（人）"
        );
        foreach ($title as $key => $value) {
            //$cell_position=$objPHPExcel->getColumnIndex($key).'1';
            $cell_position=$key.'1';
            $objActSheet->getStyle($cell_position)->getFont()->setBold(true)->setSize(16);
            $objActSheet->setCellValue($cell_position,$value);
        }

        #【第四步】自动生成序号值

        for ($i=1;$i<=1000;$i++){
            $objActSheet ->setCellValue("A".($i+1),$i);
        }

        #【第五步】生成处理
        //excel 2007 .xlsx    生成2007excel格式的xlsx文件
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="经营信息上传模板.xlsx"');
        header('Cache-Control: max-age=0');

        $objWriter = \PHPExcel_IOFactory:: createWriter($objPHPExcel, 'Excel2007');
        $objWriter->save( 'php://output');

        exit;


    }


    public function excelExport()
    {
        $cellData = [
            ['学号','姓名','成绩'],
            ['10001','AAAAA','99'],
            ['10002','BBBBB','92'],
            ['10003','CCCCC','95'],
            ['10004','DDDDD','89'],
            ['10005','EEEEE','96'],
        ];
        Excel::create('学生成绩',function($excel) use ($cellData){
            $excel->sheet('score', function($sheet) use ($cellData){
                $sheet->rows($cellData);
            });
            //ob_end_clean();
        })->export('xlsx');
    }
    public function excelImport()
    {
        $filePath = 'storage/exports/'.iconv('UTF-8', 'GBK', '学生成绩').'.xls';
        Excel::load($filePath, function($reader) {
            $data = $reader->all();
            dd($data);
        });
        // 加载文件
        Excel::load('file.xls', function($reader) {

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
            $reader->each(function($sheet) {

                // 遍历行
                $sheet->each(function($row) {

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














//if(is_numeric($input['condition'])){
//switch ($input['condition'])
//{
//case config('app.bom.condition.unactivated'):
//    //未激活
//break;
//case config('app.bom.condition.activated'):
//    //激活
//
//break;
//case config('app.bom.condition.released'):
//    //发布
//
//break;
//
//}


//}





  public function splitOrder()
  {

      $m = new Bom();
      $dBom=$m->get(10);



      $m2=new OperationOrder();


      //$m2->splitProductionOrder(rand(10000,999999999999999),$dBom->bom_tree,rand(1,20));


      pd($m2->getOperationOrderSons(31));






  }



    public function bomAttributes()
    {


        pd('shit');



    }















}


