<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/4/12 17:09
 * Desc:
 */

namespace App\Console\Commands;


use App\Libraries\Thumb;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanDeletedPhoto extends Command
{
    /**
     * 控制台命令 signature 的名称
     * php artisan clean:deleted_photo
     *
     * @var string
     */
    protected $signature = 'clean:deletedPhoto';

    /**
     * 控制台命令说明。
     * php artisan help  clean:deleted_photo命令后的输出内容
     * @var string
     */
    protected $description = 'clean the deleted photo';

    /**
     * 图纸逻辑删除$deletedDays后，才物理删除
     * @var int
     */
    protected $deletedDays = 7;

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 1.物理删除指定天数之前的已经被逻辑删除的图纸
     * 2.删除图纸数据（ruis_drawing）
     * 3.删除图纸属性数据（ruis_drawing_attribute）
     * 4.回收图纸代码（ruis_encoding_list）
     */
    public function handle()
    {
        $bashPath = storage_path() . '/app/public/';

        $photoExt = Thumb::IMG_EXT;

        $photoSizesArr = [];
        foreach (Thumb::$sizes as $item) {
            foreach ($item as $size) {
                $photoSizesArr[] = $size;
            }
        }

        $deletedTime = time() - 86400 * $this->deletedDays;

        DB::table(config('alias.rdr'))
            ->select(['id', 'image_path', 'code', 'image_name'])
            ->where([['status', '=', 0], ['mtime', '<', $deletedTime]])
            ->orderBy('id', 'ASC')
            ->chunk(100, function ($dataList) use ($bashPath, $photoSizesArr, $photoExt) {
                foreach ($dataList as $key => $data) {
                    $this->info('ID:' . $data->id . ' is deleting...');
                    /**
                     * 1.物理删除指定天数之前的已经被逻辑删除的图纸
                     */
                    //图纸名称（无扩展名）
                    $imageName_no_ext = substr($data->image_name, 0, strpos($data->image_name, '.'));
                    //图纸路径 （ drawing/{{model}}/yyyy-mm-dd/ ）
                    $imagePath = substr($data->image_path, 0, strpos($data->image_path, $data->image_name));
                    //主图纸路径（drawing/{{model}}/yyyy-mm-dd/xx.png ）
                    $imagePath_png = $data->image_path;
                    if (file_exists($bashPath . $imagePath_png)) {
                        Storage::disk('public')->delete($imagePath_png);
                    }
                    foreach ($photoSizesArr as $value) {
                        $imagePath_size = $imagePath . $imageName_no_ext . $value . '.' . $photoExt;
                        if (file_exists($bashPath . $imagePath_size)) {
                            Storage::disk('public')->delete($imagePath_size);
                        }
                    }

                    /**
                     * 2.删除图纸数据（ruis_drawing）
                     */
                    DB::table(config('alias.rdr'))->where('id', '=', $data->id)->delete();

                    /**
                     * 3.删除图纸属性数据（ruis_drawing_attribute）
                     */
                    DB::table(config('alias.rda'))->where('drawing_id', '=', $data->id)->delete();

                    /**
                     * 4.回收图纸代码（ruis_encoding_list）
                     */
                    DB::table(config('alias.rel'))->where('code', '=', $data->code)->delete();

                }
            });

    }

}