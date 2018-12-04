## 1.来源表(ruis_drawing_category)
手动添加一条 物料的记录

## 2.分组分类表(ruis_drawing_group_type)
将group_type 数据导入到 ruis_drawing_group_type 

## 3.属性定义表(ruis_drawing_attribute_definition)
手动插入 插入 长、宽、高、长2、宽2、高2、是否为样板(id分别为 1,2,3,4,5,6,7)

## 4.分组表(ruis_drawing_group)
将 drawing_group 数据导入到 ruis_drawing_group

执行脚本 `php run_group.php`

## 5.图片主表(ruis_drawing)

将 drawing 数据导入到 ruis_drawing 和 ruis_drawing_attribute

执行脚本 `php run_drawing.php`

## 6.图片主表 添加属性搜索

属性收缩条件预收集

执行脚本 `php run_pic_search_20180408.php`