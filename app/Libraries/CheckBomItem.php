<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/8
 * Time: 上午9:39
 */
namespace  App\Libraries;

class CheckBomItem
{
    /**
     * 提交的bom树
     * @var array
     */
    public $deal = array();

    /**
     * 现有的bom树
     * @var array
     */
    public $real = array();

    /**
     * 项的 增删改 部分
     * @var array
     */
    public $add    = array();
    public $delete = array();
    public $update = array();

    /**
     * 项的 阶梯用量的 增删改 部分
     * @var array
     */
    public $qty_add    = array();
    public $qty_delete = array();
    public $qty_update = array();

    /**
     * 项的替换物料的 增删改 部分
     * @var array
     */
    public $replace_add    = array();
    public $replace_delete = array();
    public $replace_update = array();

    /**
     * 项的替换物料的阶梯用量 的增删改 部分
     * @var array
     */
    public $replace_qty_add    = array();
    public $replace_qty_delete = array();
    public $replace_qty_update = array();

    /**
     * 全路径
     * @var array
     */
    public $item_material_path = array();
    public $replace_material_path = array();

    /**
     * CheckBomItem constructor.
     * @param $deal
     * @param $real
     */
    public function  __construct($deal , $real)
    {
        //格式化现有的bom
        $this->real = $this->format($real,0);
        //格式化提交过来的bom
        $this->deal = $this->format($deal,1);
        $this->start();
    }


    /**
     * 整理格式 主要作用是整理出全路径 以及 将数组的索引值变为物料ID
     * @param $data
     * @param $is_new
     * @return array
     */
    public function format($data,$is_new)
    {
        $item_material_ids = array();
        $item_replace_material_ids = array();
        $materials = array();
        foreach ($data as $row){
            //在改动过的树里面加入主物料的全路径
            if($is_new == 1){
                $item_material_ids = array_merge($item_material_ids,$row['son_material_id']);
                array_push($item_material_ids,$row['material_id']);
            }
            //第一层 物料ID变为索引
            $materials[$row['material_id'].'-'.$row['POSNR']] = $row;
            if(!empty($materials[$row['material_id'].'-'.$row['POSNR']]['bom_item_qty_levels'])) unset($materials[$row['material_id'].'-'.$row['POSNR']]['bom_item_qty_levels']);
            //第一层的阶梯用量的 由自身的ID变为索引
            foreach ($row['bom_item_qty_levels'] as $qty_row){
                $materials[$row['material_id'].'-'.$row['POSNR']]['bom_item_qty_levels'][$qty_row['bom_item_qty_level_id']] = $qty_row;
            }
            if(!empty($materials[$row['material_id'].'-'.$row['POSNR']]['replaces'])) unset($materials[$row['material_id'].'-'.$row['POSNR']]['replaces']);
            //重复以上操作 对 替换物料进行更换索引
            foreach ($row['replaces'] as $replace_row){
                //在改动过的树里面加入主物料的替换物料的全路径
                if($is_new == 1){
                    $item_replace_material_ids = array_merge($item_replace_material_ids,$replace_row['son_material_id']);
                    array_push($item_replace_material_ids,$replace_row['material_id']);
                }


                $materials[$row['material_id'].'-'.$row['POSNR']]['replaces'][$replace_row['material_id'].'-'.$replace_row['POSNR']] = $replace_row;
                if(!empty($materials[$row['material_id'].'-'.$row['POSNR']]['replaces'][$replace_row['material_id'].'-'.$replace_row['POSNR']]['bom_item_qty_levels'])) unset($materials[$row['material_id'].'-'.$row['POSNR']]['replaces'][$replace_row['material_id'].'-'.$replace_row['POSNR']]['bom_item_qty_levels']);
                foreach ($replace_row['bom_item_qty_levels'] as $replace_qty_row){
                    $materials[$row['material_id'].'-'.$row['POSNR']]['replaces'][$replace_row['material_id'].'-'.$replace_row['POSNR']]['bom_item_qty_levels'][$replace_qty_row['bom_item_qty_level_id']] = $replace_qty_row;
                }
            }
        }
        //全路径 复制
        $this->item_material_path = empty(implode(',',$item_material_ids))?'':','.implode(',',$item_material_ids).',';
        $this->replace_material_path = empty(implode(',',$item_replace_material_ids))?'':','.implode(',',$item_replace_material_ids).',';
        return $materials;
    }

    /**
     * 整理出增删查改
     * @param $deal
     * @param $real
     * @return array
     */
    public function judge($deal , $real )
    {
        //根据key进行的计算
        //deal有的real没得为新增 （差集）
        $add    = array_diff_key($deal,$real);
        //real有的deal没得为删除  （差集）
        $delete = array_diff_key($real,$deal);
        //不变的就继续往下判断  （交集）
        $update = array_intersect_key($deal,$real);

        return array('add'=>$add,'delete'=>$delete,'update'=>$update);
    }

    /**
     * 检验开始
     */
    public function start()
    {
        $tmp = array();
        $deal = $this->deal;
        $real = $this->real;
        $materials = $this->judge($deal,$real);
        $this->add   = $materials['add'];
        $this->delete = $materials['delete'];
        //判断自身的那些变化
        $this->update = $this->checkUpdate($materials['update'],1);
        //判断替换物料的变化
        foreach ($materials['update'] as $key => $value)
        {
            $replace_qty = array();

            $qty      = $this->judge($deal[$key]['bom_item_qty_levels'],$real[$key]['bom_item_qty_levels']);
            if(!empty($qty['add'])) $this->qty_add[$key]    = $qty['add'];
            if(!empty($qty['delete'])) $this->qty_delete[$key] = $qty['delete'];
            if(!empty($this->checkUpdate($qty['update'],3,$key))) $this->qty_update[$key] = $this->checkUpdate($qty['update'],3,$key);
            $replaces = $this->judge($deal[$key]['replaces'],$real[$key]['replaces']);
            if(!empty($replaces['add']))  $this->replace_add[$key] = $replaces['add'];
            if(!empty($replaces['delete']))  $this->replace_delete[$key] = $replaces['delete'];
            if(!empty($this->checkUpdate($replaces['update'],2,$key)))  $this->replace_update[$key] = $this->checkUpdate($replaces['update'],2,$key);


            foreach ($replaces['update'] as $k => $v){
                $replace_qty      = $this->judge($deal[$key]['replaces'][$k]['bom_item_qty_levels'],$real[$key]['replaces'][$k]['bom_item_qty_levels']);
                if(!empty($replace_qty['add'])) $this->replace_qty_add[$key][$k]    = $replace_qty['add'];
                if(!empty($replace_qty['delete'])) $this->replace_qty_delete[$key][$k] = $replace_qty['delete'];
                if(!empty($this->checkUpdate($replace_qty['update'],4,$key,$k))) $this->replace_qty_update[$key][$k] = $this->checkUpdate($replace_qty['update'],4,$key,$k);
            }
            $tmp[$key] = array('qty'=>$qty,'replaces'=>$replaces,'replaces_qty'=>$replace_qty);
        }

    }

    /**
     * 检验具体更新项目
     * @param $data
     * @param $type
     * @param int $father
     * @param int $grandfather
     * @return array
     */
    public function checkUpdate($data,$type,$father = 0,$grandfather = 0)
    {
        $config = config('dictionary');
        $changeFields = array();
        switch ($type){
            //1为检查项中的内容
            case '1':
                //$fields = ['usage_number','comment','loss_rate'];
                $fields = array_keys($config['item']);
                foreach ($data as $key=>$value){
                    foreach ($fields as $field)
                    {
                        if($this->real[$key][$field] != $this->deal[$key][$field]){
                            $changeFields[$key][$field] = $this->formatValue($this->real[$key][$field]).'变为'.$this->formatValue($this->deal[$key][$field]);
                        }
                    }
                }
                break;
            //2为检查项中替换物料的内容
            case '2':
                //$fields = ['usage_number','comment','loss_rate'];
                $fields = array_keys($config['replace']);
                foreach ($data as $key=>$value){
                    foreach ($fields as $field)
                    {
                        if($this->real[$father]['replaces'][$key][$field] != $this->deal[$father]['replaces'][$key][$field]){
                            $changeFields[$key][$field] = $this->formatValue($this->real[$father]['replaces'][$key][$field]).'变为'.$this->formatValue($this->deal[$father]['replaces'][$key][$field]);
                        }
                    }
                }
                break;
            //3为检查阶梯用量的内容
            case '3':
                //$fields = ['parent_min_qty','qty'];
                $fields = array_keys($config['qty']);
                foreach ($data as $key=>$value){
                    foreach ($fields as $field)
                    {
                        if($this->real[$father]['bom_item_qty_levels'][$key][$field] != $this->deal[$father]['bom_item_qty_levels'][$key][$field]){
                            $changeFields[$key][$field] = $this->formatValue($this->real[$father]['bom_item_qty_levels'][$key][$field]).'变为'.$this->formatValue($this->deal[$father]['bom_item_qty_levels'][$key][$field]);
                        }
                    }
                }
                break;
            //4为检查替换物料的阶梯用量
            case '4':
                //$fields = ['parent_min_qty','qty'];
                $fields = array_keys($config['replace_qty']);
                foreach ($data as $key=>$value){
                    foreach ($fields as $field)
                    {
                        if($this->real[$father]['replaces'][$grandfather]['bom_item_qty_levels'][$key][$field] != $this->deal[$father]['replaces'][$grandfather]['bom_item_qty_levels'][$key][$field]){
                            $changeFields[$key][$field] = $this->formatValue($this->real[$father]['replaces'][$grandfather]['bom_item_qty_levels'][$key][$field]).'变为'.$this->formatValue($this->deal[$father]['replaces'][$grandfather]['bom_item_qty_levels'][$key][$field]);
                        }
                    }
                }
                break;
            default:
                break;
        }
        return $changeFields;
    }

    public function formatValue($value)
    {

            return '['.$value.']';

    }


}