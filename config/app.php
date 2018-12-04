<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/13
 * Time: 上午10:19
 */



/**
 * 应用配置
 * @author sam.shan  <sam.shan@ruis-ims.cn>
 */



return [



    //发布的版本号,上线之后取正式的版本号,方便客户端缓存
    'release'=>time(),
    //属性类型模板类型标志位  1：人事模块 2：公司模块 3：物料模块 4:工艺参数 5：工时 6：做法库
    'category' => [
        'human'=>1,
        'company'=>2,
        'material'=>3,
        'operation'=>4
    ],
    //属性数据类型 //1:数字 2：选择  3:文字 4:日期date  5:时间 time 6:文件file 7:日期时间datetime  8:区间interval
    'data_type'=>[
        'number'=>1,//数字类型的时候,如果给到了最大最小以及默认值的时候要检测
        'select'=>2,//选择类型的时候必须有添加项
        'text'=>3,
        'date'=>4,
        'time'=>5,
        'file'=>6,
        'datetime'=>7,
        'interval'=>8,
    ],
    //模块对应取得的数据类型
    'module_data_type'=>[
        'material'=>[
            'number',
            'select',
            'string',
        ],
        'operation'=>[
            'number',
            'select',
            'string',
        ],
    ],
    //erp数据导入棉泡
    'erp_mp'=>[
        'BPM'=>'BPMC',//模塑
        'BPQ'=>'BPMP',//棉
        'FLT'=>'BPMP'//海绵
    ],

    //创建，修改时间的显示格式
    'timeFormat' => 'Y/m/d H:i',
    //上传的一些位置
    'drawing_attachment'=>'storage/mlily/demo/drawing/attachment/',
    'drawing_group_attachment'=>'storage/mlily/demo/drawing_group/attachment/',
    'drawing_image'=>'storage/mlily/demo/drawing/image/',
    'drawing_group_image'=>'storage/mlily/demo/drawing_group/image/',
    'drawing_library'=>'drawing/',
    'bpo_report_form'=>'bpo/report_form/',

    //手动填写的编码规则如下
    'pattern'=>[
        'attribute'=>'/^[0-9a-z_A-Z]{2,49}+$/',//物料属性键值,由3-50位字母下划线数字组成,字母开头
        'template'=>'/^[0-9a-z_A-Z]{0,49}+$/',//物料模板编码,由1-50位字母下划线数字组成,字母开头
        'item_no'=>'/^[0-9a-z_\-A-Z]{1,50}+$/',//物料编码,由1-50位字母下划线数字组成
        'bom_group_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{2,49}+$/',//bom组名称,由3-50位字母下划线数字组成,字母开头
        'image_attribute_name'=>'/^[\x{4e00}-\x{9fa5}_a-zA-Z]{1,30}$/u',//图纸库图纸属性名称,由1-30位字母中文或下划线组合
//        'image_category_name'=>'/^[\x{4e00}-\x{9fa5}_a-zA-Z]{1,30}$/u',//图纸库图纸模块名称,由1-30位字母中文或下划线组合
        'image_category_owner'=>'/[a-zA-Z_]{1,20}/',//图纸库图纸模块文件夹名称,由1-20位字母下划线组合
//        'image_group_name'=>'/^[\x{4e00}-\x{9fa5}_a-zA-Z]{1,30}$/u',//图纸库图纸分组名称,由1-30位字母中文或下划线组合
        'image_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//图纸模块编码，由1-20位字母下划线数字组成，字母开头
        'image_group_type_code'=>'/^[0-9a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//图纸分组分类模块编码，由1-20位字母下划线数字组成，字母数字开头
//        'factory_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//工厂模块编码,由1-20位字母下划线数字组成,字母开头
        'factory_code'=>'/^[0-9a-z_A-Z]{1,20}+$/',//工厂模块编码,由1-20位字母下划线数字组成,字母开头
        'company_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//公司模块编码,由1-20位字母下划线数字组成,字母开头
        'mobile'=>'/^1[34578]\d{9}$/',//手机号码验证
        'emplyee_card_id'=>'/^[0-9a-zA-Z]{1,20}+$/',//人员卡号,由1-20位字母数字组成
        'emplyee_password'=>'/^[0-9]{4,6}+$/',//人员密码，由4-6位数字组成
        'sell_code'=>'/^[0-9a-z_A-Z]{1,20}+$/',//客户编码，1-20位字母下划线数字组成
//        'rankplan_code'=>'/^[0-9a-z_A-Z]{1,2}+$/',
        'material_category_preg'=>[
            '1'=>'/^32.*/',    // 弹簧网
            '2'=>'/^35.*/',    // 凝胶片
            '3'=>'/^3001.*/',  //切割棉
            '4'=>'/^6101.*/',  //直条
        ],
        'out_material_category_preg'=>[
            '1'=>'/^200XH.*/',    // 绣花片流转品
            '2'=>'/^200HFN.*/',   // 绗缝片流转品
            '3'=>'/^200HFD.*/',   // 绗缝片流转品
            '4'=>'/^200CJ.*/',   // 裁剪流转品
        ],

    ],
    //描述,注释之类的限制数目如下
    'comment'=>[
        'category'=>500,//物料分类注释的个数限制
        'attribute'=>500,//物料属性注释的个数限制
        'template'=>500,//物料模板描述的个数限制
        'material'=>500,//物料描述的个数限制
        'bom_group'=>500,//物料清单分组描述个数限制
        'image_attribute'=>500,//图纸库图纸属性描述个数限制
        'image_category'=>500,//图纸模块描述个数限制
        'image_group'=>500,//图纸模块描述个数限制
        'sys_message_title'=>200,//系统消息title长度限制
        'sys_message_content'=>500,//系统消息content长度限制
        'company_desc'=>500,//公司描述字符长度限制
        'factory_desc'=>500,//公司描述字符长度限制
    ],

    //物料来源  1、采购 2、自制 3、委外 4、客供，默认为采购
    'source'=>[
        'buy'=>1,
        'self'=>2,
        'out'=>3,
        'provider'=>4,
    ],
    //应用接口层的统一参数
    'apiCommonRules' => array(
        //'sign' => array('name' => 'sign', 'require' => true),
    ),

    //Bom
    'bom'=>[
        //状态     0是未激活|已冻结    1已激活(未发布)     2 已发布
        'condition'=>['unactivated'=>0, 'activated'=>1,'released'=>2],
    ],

    //权限节点类型
    'node_type'=>[
        'ignore_login'=>1,//免登陆
        'ignore_auth'=>2,//免授权
        'need_auth'=>3,//需授权
        'out_auth'=>4,//管理型
    ],

    // sap WebService 配置
    'sap_service' => [
        'intranet_host' => env('INTRANET_HOST', 'http://192.168.4.35:8000'),
        'external_host' => env('EXTERNAL_HOST', 'http://58.221.197.202:8000'),
        'wsdl_service_host' => env('WSDL_SERVICE_HOST', 'http://HKS4DEV.mlily.com:8000'),
        'username' => env('SAP_USERNAME', 'KLTABAP2'),
        'password' => env('SAP_PASSWORD', '90-=op[]'),
        'wsdl_path' => 'storage/sap.wsdl',  // 相对于public/index.php
        'wsdl_url' => env('WSDL_URL', '/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zmlily_webservice/120/zmlily_webservice/zmlily_webservice?sap-client=120'),
    ],

    // srm WebService 配置
    'srm_webservice'=>[
        'intranet_host' => 'http://58.221.197.202:8081',
        'external_host' => 'http://58.221.197.202:8081',
        'username' => '59007094',
        'password' => 'A083BC7AC27350AB4072E06F7CF2A53C',
        'wsdl_url' => '/itf/wsdl/modules/ws_eitf/QMS_CLAIM_FORM/eitf_qms_claim_form_import_server.svc',
        'wsdl_path' => 'storage/srm.wsdl',
    ],

    'redis_timeout'=>[
        'bom' => 1440,//bom详情存于redis中超时时间,以分钟记
        'bom_routing' => 1440,//bom工艺路线详情存于redis中超时时间，以分钟记
        'brom_routing_preview' => 2880,//bom工艺路线预览数据在redis中超过时间
    ],

    'encoding'=>[
        '1'=>['field'=>'item_no', 'table'=>'rm',],
        '2'=>['field'=>'code', 'table'=>'template',],
        '3'=>['field'=>'key', 'table'=>'ad',],
        '4'=>['field'=>'code', 'table'=>'ria',],
        '5'=>['field'=>'code', 'table'=>'rio',],
        '6'=>['field'=>'code', 'table'=>'rdr',],
        '7'=>['field'=>'code', 'table'=>'rso',],
        '8'=>['field'=>'code', 'table'=>'rp',],
        '10'=>['field'=>'code', 'table'=>'rmkb',],
        '11'=>['field'=>'code','table'=>'rpr'],
        '12'=>['field'=>'code','table'=>'rpf']
    ],

    'material_category'=>[64,65,66,67,68,69,70,71,72,73,74,52,53,54,55,56,57,58,89,79,80,81,82,83,84,85,45,79,86],

    'need_send_to_sap_material_category'=>[
        46,47,48,49,50,51,
        75,76,77,78,
        89,
        123
    ],
    // qc  检验数量规则
    'qc_checkqty_rule'=>[
        'own'=>[
                'min'=>0,
                'max'=>5,
             ],
        '5'=>[
                'min'=>6,
                'max'=>25,
             ],
        '13'=>[
                'min'=>26,
                'max'=>50,
             ],
        '20'=>[
                'min'=>51,
                'max'=>150,
             ],
        '32'=>[
                'min'=>151,
                'max'=>280,
             ],
        '50'=>[
                'min'=>281,
                'max'=>500,
             ],
        '80'=>[
                'min'=>501,
                'max'=>1200,
             ],
        '125'=>[
                'min'=>1201,
                'max'=>3200,
             ],
        '200'=>[
                'min'=>3201,
                'max'=>10000,
             ],
        '315'=>[
                'min'=>10001,
                'max'=>99999999999,
             ],
    ],

    'cli_http_host' => env('CLI_HTTP_HOST', 'http://192.168.10.183'),
];






