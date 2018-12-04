<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2017/12/21
 * Time: 下午4:42
 */

namespace  App\Libraries;
class BomIterator implements \Iterator
{
    private $_items ;
    public  $_materials = array();
    public  $_row = array();
    private $_type = 1;


    public function __construct(&$data,$type)
    {
        $this->_items = $data;
        $this->_type  = $type;
    }

    public function current()
    {
        return current($this->_items);
    }

    public function next()
    {
        next($this->_items);
    }

    public function key()
    {
        return key($this->_items);
    }

    public function rewind() {
        if(is_array($this->_items)){
            reset($this->_items);
        }
    }

    public function valid()
    {
        if(!is_array($this->_items)){
            $this->_items = array();
        }
        $tmp = current($this->_items);
        if($tmp){
            $material_id =  $tmp['material_id'];
            $this->_row[$material_id] = $this->_items;
            $i = 0;
            if(!empty($tmp['bom_item_qty_levels'])) unset($this->_items[$this->key()]['bom_item_qty_levels']);
            foreach ($tmp['bom_item_qty_levels'] as $row){
                $bom_item_qty_level_id = $row['bom_item_qty_level_id'];
                if(isset($row['bom_item_qty_level_id'])) unset($row['bom_item_qty_level_id']);
                if(isset($row['bom_item_id'])) unset($row['bom_item_id']);

                $this->_items[$this->key()]['bom_item_qty_levels'][$bom_item_qty_level_id] = $this->encryptBase64($row);
                $i++;
            }

            if(isset($tmp['name'])) unset($tmp['name']);
            if(isset($tmp['bom_material_id'])) unset($tmp['bom_material_id']);
            if(isset($tmp['item_no'])) unset($tmp['item_no']);
            if(isset($tmp['bom_id'])) unset($tmp['bom_id']);
            if(isset($tmp['parent_id'])) unset($tmp['parent_id']);
            if(isset($tmp['children'])) unset($tmp['children']);
            if(isset($tmp['parent_id'])) unset($tmp['parent_id']);
            if(isset($tmp['son_material_id'])) unset($tmp['son_material_id']);
            if(isset($tmp['versions'])) unset($tmp['versions']);

            unset($tmp['bom_item_id']);
            unset($tmp['bom_item_qty_levels']);
            unset($tmp['replaces']);
            $str       = $this->encryptBase64($tmp);
            $this->_materials[$material_id] = $str;
        }

        return ($this->current() !== FALSE);
    }

    public function encryptBase64($params)
    {
        $str = "";
        ksort($params);
        reset($params);
        $i = 0;
        foreach ($params as $k=>$v){
            $tmp   = $i==0?'':',';
            $str = $str.$tmp.trim($v);
            $i++;
        }
        return base64_encode($str);
    }

}