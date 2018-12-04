<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/9/14
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class WorkDeclareOrderItem extends  Base
{
    public function __construct()
    {
        $this->table='ruis_work_declare_order_item';
    }

    /**
	 * 保存数据
	 */
	public function save($data, $id)
	{
		if ($id > 0)
		{
                try{
                    //开启事务
                    DB::connection()->beginTransaction();
                    $upd=DB::table($this->table)->where('id',$id)->update($data);
                    if($upd===false) TEA('804');
                }catch(\ApiException $e){
                    //回滚
                    DB::connection()->rollBack();
                    TEA($e->getCode());
                }
                //提交事务
                DB::connection()->commit();
				$this->pk = $id;
		}
		else
		{
            //添加
            $item_id=DB::table($this->table)->insertGetId($data);
            if(!$item_id) TEA('802');
			$this->pk = $item_id;
		}
	}


    /**
	 * 保存明细数据
	 */
	public function saveItem($input, $order_id,$type)
	{	
		$in_materials  =json_decode($input['in_materials'],true);
		if (count($in_materials)>0)
		{
			foreach ($in_materials as $k => $in) 
			{
				$in_materials[$k]['type'] ='1';  //进料为1
			}
		}
		
		$out_materials  =json_decode($input['out_materials'],true);
		if (count($out_materials)>0)
		{
			foreach ($out_materials as $kk => $out)
		    {
		    	if ($type ==2) 
		    	{
		    		  	//查找物料类型
                       $material_id  = $out['material_id'];
                       //查物料分类
                       $catergory  =   DB::table('ruis_material  as  material')
                                     ->leftJoin('ruis_material_category as category', 'category.id','=','material.material_category_id')
                                     ->select('category.warehouse_management','material.item_no')
                                     ->where('material.id',$material_id)
                                     ->first();
                       if ($catergory->warehouse_management  == 1) 
                       {
			                    //判断出料的类型
						    	$out_category   =  DB::table(config('alias.rm').' as   material')
						                    ->leftJoin(config('alias.rmc').' as  category', 'category.id', '=', 'material.material_category_id')
											->select('category.code')
											->where('material.id',$out['material_id'])
											->first();
						        $out_category_code   = $out_category->code;
						        $out_category_preg_arr = config('app.pattern.out_material_category_preg');
				                $sign = 0;
				                foreach ($out_category_preg_arr as $keee=> $vaaa) 
				                {
				                    if(preg_match($vaaa,$out_category_code))   
				                    {
				                        $sign  = $keee;
				                    }
				                }
				                if ($sign == 0) 
				                {
				                	TEA('9531');
				                }
				                if ($sign == 1) 
				                {
				                	$out_materials[$kk]['line_depot_code'] ='1104'; //
				                	$depot_res  =  DB::table('ruis_storage_depot')->select('id','plant_id')->where('code','1104')->first();
				                	$out_materials[$kk]['line_depot_id'] =$depot_res->id; 
				                }

				                if ($sign == 2  || $sign == 3) 
				                {
				                	$out_materials[$kk]['line_depot_code'] ='1103'; //
				                	$depot_res  =  DB::table('ruis_storage_depot')->select('id','plant_id')->where('code','1103')->first();
				                	$out_materials[$kk]['line_depot_id'] =$depot_res->id; 
				                }

				                if ($sign == 4) 
				                {
				                	$out_materials[$kk]['line_depot_code'] ='1102'; //裁剪
				                	$depot_res  =  DB::table('ruis_storage_depot')->select('id','plant_id')->where('code','1102')->first();
				                	$out_materials[$kk]['line_depot_id'] =$depot_res->id;
				                }
                       }
		    	}
				$out_materials[$kk]['type'] ='-1'; //出料为-1
			}
		}
		$items=array_merge($in_materials,$out_materials);
		foreach ($items  as  $key=>$item)
		{
			 $item_data = [
                    'id'         => $item['id'],
                    'declare_id' => $order_id,
                    'material_id' => $item['material_id'],
                    'GMNGA' => $item['GMNGA'],
                    // 'MEINH' => $item['MEINH'],     //单位
                    'unit_id' => $item['unit_id'],
                    'type' => $item['type'],
                    'line_depot_id' =>isset($item['line_depot_id'])?$item['line_depot_id']:'',
                    'line_depot_code' =>isset($item['line_depot_code'])?$item['line_depot_code']:'',
                    'MSEG_ERFMG' =>isset($item['MSEG_ERFMG'])?$item['MSEG_ERFMG']:'',       //差异值
                    'MKPF_BKTXT' =>$item['MKPF_BKTXT'],       //差异原因
             		// 'material_spec'=>$item['material_spec'],  //物料属性
             		'qty'=>$item['qty'],      //工单定额数量
             		'LGFSB'=>$item['LGFSB'],  //采购仓储
             		'LGPRO'=>$item['LGPRO'],  //生产仓储
             		'batch_qty'=>isset($item['batch_qty'])?$item['batch_qty']:'',  //批次额定数量
             		'is_spec_stock'=>($item['is_spec_stock'] == 'undefined')?'':$item['is_spec_stock'],
             		'inve_id'=>isset($item['inve_id'])?$item['inve_id']:'',
                    'production_order_id'=>$input['production_order_id'],
                    'operation_order_id'=>$input['operation_order_id'],
                    'work_order_id'=>isset($input['work_order_id'])?$input['work_order_id']:'',   //工单id
             		'routing_node_id'=>isset($input['routing_node_id'])?$input['routing_node_id']:'',//节点
             		'expend'=>isset($item['expend'])?$item['expend']:'',//实际使用
                ];
                //如果是进料  获取原有的批号
                if ($item['type'] == '1')
                {
                	$item_data['lot']=isset($item['lot'])?$item['lot']:'';  //有批号则保存批号
                }

                // 如果是出料  则要生成 批号
                if ($item['type'] == '-1') 
                {
                	//找物料分类
					$category  =  DB::table(config('alias.rm').' as   material')
                    ->leftJoin(config('alias.rmc').' as  category', 'category.id', '=', 'material.material_category_id')
					->select('category.code')
					->where('material.id',$item['material_id'])
					->first();
                	$category_code   = $category->code;

                	if(isset($input['factory_code']))
                	{
                	   $lot  =  $this->getLot($item['material_id'],$category_code,$input['factory_code']);
                	}
                	else
                	{
                		$lot  ='';
                	}
                	$item_data['lot'] =$lot;
                }
            $id  =  $item['id']? $item['id'] : 0;
		    $this->save($item_data,$id);
			$id = $this->pk;
			$act_ids[] = $id;
		}
		// 获取明细
		$db_ids = $this->_get_ids($order_id);

		// 需要删除的id
		$del_ids = array_diff($db_ids, empty($act_ids) ? array() : $act_ids);
		if ($del_ids)
		{
			foreach ($del_ids as $id)  $this->destroyById($id);
		}
	}

	/**
	 * @message 生成批次
	 * @author  liming
	 * @time    年 月 日
	 */	
	public   function   getLot($material_id,$category,$factory='',$device='',$class='')
	{
		$lot='';
		$XCHAR_WHERE=[
			'WERKS'=>$factory,
			'material_id'=>$material_id
		];
		$temp_res = DB::table('ruis_material_marc')->select('XCHAR')->where($XCHAR_WHERE)->first();
		if (!$temp_res) 
		{
			return  $lot;	
		}

		$xchar =$temp_res->XCHAR;
		if ($xchar != 'X') 
		{
			return  $lot;
		}
		else
		{
			$mp_search = '/^3002.*/';   //绵泡
			$qgm_search = '/^3001.*/';  //切割棉
			$fhm_search = '/^20006.*/'; //符合棉
			$ms_search = '/^33.*/';     //模塑
			$cp_search = '/^1.*/';      //成品

			$temp_class  = 'A';
			$hour_num =  date('H');
			if ($hour_num>8 &&  $hour_num<20 ) 
			{
				$temp_class ='A';
			}
			else
			{
				$temp_class ='B';
			}

			$factory_str  = substr($factory, -2);

			$date_str  = gmstrftime("%d %B %Y",time());
			$arr=explode(' ', $date_str);
			$year = substr($arr[2], -2);
			$month = substr($arr[1],0,1);
			$day =$arr[0];
			$da_str= $year.$month.$day;

			$ls_str = '01';

			// 如果符合棉泡  设备  班次 日期 流水   
			if(preg_match($mp_search,$category))   
			{
			  $lot='00'.$temp_class.$da_str.$ls_str;
			}

			// 如果符合切割棉  工厂  班次 日期 流水   
			if(preg_match($qgm_search,$category))   
			{
			  $lot=$factory_str.$temp_class.$da_str.$ls_str;
			}


			// 如果符合复合棉  工厂  班次 日期 流水   
			if(preg_match($fhm_search,$category))   
			{
			  $lot=$factory_str.$temp_class.$da_str.$ls_str;
			}

			// 如果符合模塑  工厂  班次 日期 流水   
			if(preg_match($ms_search,$category))   
			{
			  $lot=$factory_str.$temp_class.$da_str.$ls_str;
			}

			// 如果符合成品  工厂  班次 日期 流水   
			if(preg_match($cp_search,$category))   
				
			{
			    $lot=$factory_str.$temp_class.$da_str.$ls_str;
			}
			return  $lot;
		}

	}	



	/**
	 * @message 获取顶级物料分类
	 * @author  liming
	 * @time    年 月 日
	 */	
	public function  final_category($category_id)
	{
		$now_category_id = $category_id;
		//查找当前物料分类的 parent_id
		$parent =   DB::table(config('alias.rmc'))->select('parent_id')->where('id',$now_category_id)->first();
		$parent_id = $parent->parent_id;
		if ($parent_id >0) 
		{
			//如果当前parent_id >0  就继续找父级
			$this->final_category($parent_id);
		}else
		{
			return  $now_category_id; 
		}
	}



	/**
	 * 获取明细id
	 * @param int $id
	 */
	private function _get_ids($id)
	{
		$list = $this->getLists([['declare_id','=',$id]], 'id');
		foreach ($list as $val) 
			$ids[] = $val;
		return empty($ids) ? array() : $ids;
	}



	/**
	 * 获取明细list
	 * @param array   list
	 */
	public function getItems($id)
	{
		$list = $this->getListsByWhere([['declare_id','=',$id]]);
		return empty($list) ? array() : $list;
	}


}