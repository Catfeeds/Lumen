<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/12/12
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Basedatas extends  Base
{
	public function __construct()
    {
        $this->employee_table='ruis_employee';
        $this->department_table='ruis_department';
        $this->partner_table='ruis_partner';
        $this->plant_table='ruis_factory';
        $this->depot_table='ruis_storage_depot';
        $this->subarea_table='ruis_storage_subarea';
        $this->bin_table='ruis_storage_bin';

        //定义表别名
        $this->aliasTable=[
            'ruis_employee'=>$this->employee_table.' as ruis_employee',
            'ruis_department'=>$this->department_table.' as ruis_department',
            'ruis_partner'=>$this->partner_table.' as ruis_partner',
            'plant'=>$this->plant_table.' as plant_table',
            'depot'=>$this->depot_table.' as storage_depot',
            'subarea'=>$this->subarea_table.' as subarea_table',
            'bin'=>$this->bin_table.' as bin_table',
        ];
    }

     /**
     * 获取员工列表
     * @return array  返回数组对象集合
     */
    public function getEmployeeList($input)
    {
		$obj_list=DB::table($this->employee_table)->select('*')->get();
        return $obj_list;
    }


    /**
     * 获取部门列表
     * @return array  返回数组对象集合
     */
    public function getDepartmentList($input)
    {
		$obj_list=DB::table($this->department_table)->select('*')->get();
        return $obj_list;
    }


    /**
     * 获取往来单位
     * @return array  返回数组对象集合
     */
    public function getPartnerList($input)
    {
		$obj_list=DB::table($this->partner_table)->select('*')->get();
        return $obj_list;
    }


    /**
     * 获取供应商
     * @return array  返回数组对象集合
     */
    public function getVendorList($input)
    {
		$obj_list=DB::table($this->partner_table)->where('is_vendor','=',1)->select('*')->get();
        return $obj_list;
    }



    /**
     * 获取客户
     * @return array  返回数组对象集合
     */
    public function getCustomerList($input)
    {
		$obj_list=DB::table($this->partner_table)->where('is_customer','=',1)->select('*')->get();
        return $obj_list;
    }

    /**
     * 获取仓库树
     * @return array  返回数组对象集合
     */
    public function getWareHouseTree($input)
    {
        // 获取厂区  

        $plants   =obj2array(DB::table($this->plant_table)->select('*')->get());
        foreach ($plants as $plantkey  => $avalue) {
            $plants[$plantkey]['parent_id'] = '0';
            $plants[$plantkey]['only_id'] = 'A'.$avalue['id'];
            $plants[$plantkey]['level'] = 0;
        }

    
        //获取仓库
        $depots   =obj2array(DB::table($this->depot_table)->select('*')->get());
        foreach ($depots as $depotkey  => $bvalue) {
            $depots[$depotkey]['parent_id'] = 'A'.$bvalue['plant_id'];
            $depots[$depotkey]['only_id'] = 'B'.$bvalue['id'];
            $depots[$depotkey]['level'] = 1;
        }

        //获取分区
        $subareas =obj2array(DB::table($this->subarea_table)->select('*')->get());
        foreach ($subareas as $subkey  => $cvalue) {
            $subareas[$subkey]['parent_id'] = 'B'.$cvalue['depot_id'];
            $subareas[$subkey]['only_id'] = 'C'.$cvalue['id'];
            $subareas[$subkey]['level'] = 2;
        }


        //获取仓位
        $bins     =obj2array(DB::table($this->bin_table)->select('*')->get());
        foreach ($bins as $binkey  => $dvalue) {
            $bins[$binkey]['parent_id'] = 'C'.$dvalue['subarea_id'];
            $bins[$binkey]['only_id'] = 'D'.$dvalue['id'];
            $bins[$binkey]['level'] = 3;
        }
        $obj_list  = array_merge($plants,$depots,$subareas,$bins);
        return $obj_list;
    }


      /**
     * 获取仓库树
     * @return array  返回数组对象集合
     */
    public function getTreeFathers($input)
    {
        //判断参数
        if (!isset($input['level'])   ||  !isset($input['id'])) TEA('703','empty level or id');
        $level = $input['level'];
        $self = $input['id'];
        // 定义一个 空数组
        $fathers = [];
        switch ($level) {
            case '0':
                $self_res =obj2array(DB::table($this->plant_table)->select('*')->where('id','=',$self)->get());
                $fathers['plant'] = $self_res;
                break;
            case '1':
                $self_res   =obj2array(DB::table($this->depot_table)->select('*')->where('id','=',$self)->get());
                if (empty($self_res)) TEA('704','inexistence coord');

                $plant_id  = $self_res[0]['plant_id'];
                $plant_res =obj2array(DB::table($this->plant_table)->select('*')->where('id','=',$plant_id)->get());

                $fathers['plant'] = $plant_res;
                $fathers['depot'] = $self_res;
                break;
            case '2':
                $self_res   = obj2array(DB::table($this->subarea_table)->select('*')->where('id','=',$self)->get());
                if (empty($self_res)) TEA('704','inexistence coord');

                $depot_id =$self_res[0]['depot_id'];
                $depot_res   =obj2array(DB::table($this->depot_table)->select('*')->where('id','=',$depot_id)->get());
                $plant_res   = obj2array(DB::table($this->plant_table)->select('*')->where('id','=',$depot_res[0]['plant_id'])->get());

                $fathers['plant'] = $plant_res;
                $fathers['depot'] = $depot_res;
                $fathers['subarea'] = $self_res;
                break;
            case '3':
                $self_res     =obj2array(DB::table($this->bin_table)->select('*')->where('id','=',$self)->get());
                if (empty($self_res)) TEA('704','inexistence coord');
                $subarea_id =$self_res[0]['subarea_id'];


                $subarea_res   = obj2array(DB::table($this->subarea_table)->select('*')->where('id','=',$subarea_id)->get());
                $depot_res   = obj2array(DB::table($this->depot_table)->select('*')->where('id','=',$subarea_res[0]['depot_id'])->get());
                $plant_res   = obj2array(DB::table($this->plant_table)->select('*')->where('id','=',$depot_res[0]['plant_id'])->get());
                $fathers['plant'] = $plant_res;
                $fathers['depot'] = $depot_res;
                $fathers['subarea'] = $subarea_res;
                $fathers['bin'] = $self_res;
                break;
            default:
                $fathers = [];
                break;
        }
        return $fathers;
    }

}

 ?>