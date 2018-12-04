<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/8/23
 * Time: 下午10:15
 */

class ConfigBomRoutingWorkcenter{
    protected $conn;
    public function __construct()
    {
        $this->conn = mysqli_connect('127.0.0.1','root','root','ruis_enterprise');
    }

    public function configWorkcenter(){
        $res = $this->query("select count(*) as count from ruis_bom_routing_base");
        $count = $res[0]['count'];
        foreach ($this->getData(0,$count) as $k=>$v){
            if(empty($v)){
                echo 'end';
                exit(0);
            }
            echo 'tolal:'.$count.'current: '.($k+1).PHP_EOL;
            foreach ($v['workcenters'] as $j=>$w){
                $count_res = $this->query("select count(*) as count from ruis_bom_routing_workcenter where bom_routing_base_id = ".$v['base_id']." and workcenter_id = ".$w['workcenter_id']);
                if(!$count_res[0]['count']){
                    $query_res = $this->update("insert into ruis_bom_routing_workcenter(bom_routing_base_id,workcenter_id) values(".$v['base_id'].",".$w['workcenter_id'].")");
                    var_dump($query_res);
                }
            }
        }
    }

    public function getData($start,$stop){
        for($i = $start;$i < $stop;$i ++){
            $res = $this->query("select id,operation_id,step_id from ruis_bom_routing_base limit $i,1");
            $workcenter_sql = "select workcenter_id from ruis_workcenter_operation_step where operation_id =".$res[0]['operation_id']." and step_id = ".$res[0]['step_id'];
            $wokcenter_List = $this->query($workcenter_sql);
            yield $i=>['base_id'=>$res[0]['id'],'workcenters'=>$wokcenter_List];
        }
    }

    public function query($sql){
        $result = [];
        $handler = mysqli_query($this->conn,$sql);
        while ($row = $handler->fetch_array()){
            $result[] = $row;
        }
        return $result;
    }

    public function update($sql){
        return mysqli_query($this->conn,$sql);
    }
}
$dao = new ConfigBomRoutingWorkcenter();
$dao->configWorkcenter();