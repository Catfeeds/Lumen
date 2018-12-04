<?php

namespace  App\Libraries;


/**
 * 无限极分类处理类
 * @author  sam.shan <sam.shan@ruis-ims.cn>
 * @time    2017年09月17日08:22:40
 */
class Tree
{


    /**
     * 从数组列表中找到某个节点所有的儿子的信息
     * @param $arr    数组列表
     * @param int $id 节点ID
     * @return array  返回数组
     * @author   sam.shan   <sam.shan@ruis-ims.cn>
     */
    static function findSon($arr, $id = 0)
    {
        $sons = [];
        foreach ($arr as $key => $value) {
            if ($value->parent_id == $id) $sons[] = $value;
        }
        return $sons;
    }

    /**
     * 查找某个节点的子孙后代,如果节点为0的话,则将显示的是全部的家谱树.否则就是子孙树.
     * @param $arr      数组列表
     * @param int $id 节点ID
     * @param int $level 层级
     * @param array $descendants 址传递存储
     * @return array      返回数组
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     * @todo   缺点是,递归的时候,遍历过的且明确的节点不应该还在$arr中,后续大山会进行强有力的优化
     */
    static function findDescendants($arr, $id = 0, $level = 0, &$descendants = array())
    {

        foreach ($arr as $key => $value) {

            if ($value->parent_id == $id) {
                $value->level = $level;
                //截取description
                //if (isset($value->description)) $value->description = subtext($value->description, 20);
                //$value->format_name=str_repeat('&nbsp;',4*$level).'├─'.$value->name;
                $descendants[] = $value;
                //把这个节点从数组中移除,减少后续递归消耗 Modify By Bruce.Chu On 2018-11-16
                unset($arr[$key]);
                //调用自身看看儿子是否还有儿子,注意这里的参数不能少传递了
                self::findDescendants($arr, $value->id, $level + 1, $descendants);
            }
        }

        return $descendants;
    }


    /**
     * 寻找树中每个节点的level
     *
     * @param array $arr 二维数组
     * @param int $pid 起始的父级id
     * @param int $level 起始level
     * @param array $temp
     * @param string $pk id字段名
     * @return array
     * @author lesteryou
     */
    public static function findLevel($arr, $pid = 0, $level = 0, &$temp = [], $pk = 'id')
    {
        foreach ($arr as $key => &$value) {
            if (!isset($value['level']) && $value['parent_id'] == $pid) {
                $value['level'] = $level;
                $temp[] = $value;
                self::findLevel($arr, $value[$pk], $level + 1, $temp, $pk);
            }
        }
        return $temp;
    }

    /**
     * 滴血认亲,认祖归宗,面包屑导航,家谱树
     * @param $arr        数组列表
     * @param $id         节点ID
     * @param array $forefathers 址传递存储
     * @return array      返回数组
     * @author   sam.shan   <sam.shan@ruis-ims.cn>
     */
    static function findForefathers($arr, $id, &$forefathers = array())
    {
        foreach ($arr as $key => $value) {
            if ($value->id == $id) {
                if ($value->parent_id > 0) self::findForefathers($arr, $value->parent_id, $forefathers);
                $forefathers[] = $value;
            }
        }
        return $forefathers;
    }


    /**
     * 无限极分类在编辑的时候,需要判断辈分是否冲突
     * @param $id       当前节点ID
     * @param $parent_id  要选择作为上级的节点ID
     * @param $obj_list   数组对象
     * @return bool     true表示辈分冲突,false表示辈分不冲突
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    static function isSeniorityWrong($id, $parent_id, $obj_list)
    {
        //首先是自身不可以作为自己的上级分类
        if ($id == $parent_id) return true;//返回true,表示辈分乱了

        //判断选择的上级分类会不会是自己的子孙后代来着
        $descendants = self::findDescendants($obj_list, $id);
        if (empty($descendants)) return false;//如果本来就没有子孙后代,则自然不会辈分乱了
        foreach ($descendants as $descendant) {
            //遍历比对即可
            if ($descendant->id == $parent_id) return true;
        }
        return false;
    }

    /**
     * 需要具体划分子项的可以使用该方法
     * @param $list
     * @param string $pk
     * @param string $pid
     * @param string $child
     * @param int $root
     * @return array
     * @author  rick
     * @todo   系统菜单也使用了该方法    sam.shan  <sam.shan@ruis-ims.cn>
     */
    static function listToTree($list, $pk='id', $pid = 'parent_id', $child = 'children', $root = 0)
    {
        // 创建Tree
        $tree = array();
        if(is_array($list)) {
            // 创建基于主键的数组引用
            $refer = array();
            foreach ($list as $key => $data) {
                $refer[$data[$pk]] =& $list[$key];
            }
            foreach ($list as $key => $data) {
                // 判断是否存在parent
                $parentId =  $data[$pid];
                if ($root == $parentId) {
                    $tree[] =& $list[$key];
                }else{
                    if (isset($refer[$parentId])) {
                        $parent =& $refer[$parentId];
                        $parent[$child][] =& $list[$key];
                    }
                }
            }
        }
        return $tree;
    }



















}