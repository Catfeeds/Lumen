## 开发须知
1.接口保持独立,别写万能的,对接口版本升级以及后续的表独立拆分都有好处.

2.不要去合并业务性很强的两个接口,接口中大量的if else乃是兵家大忌,解耦到你痛不欲生

3.针对方法的万能可以封装,但不要去封装一个迎合业务的万能方法.

4.码不是乱定义的,要区分哪些是给到用户哪些是给到前端的

5.前后端分离开发规范,详情见redmine

#### 一、字母标志说明

请先下载附件说明，然后再参考下面的字母说明：
- C 表示参数为常量值
- N 表示参数可以为空
- S 表示参数在编辑的时候不可以修改
- S+表示参数在编辑且值填写过了才不可以修改
- U 表示参数要进行唯一性检测
- Y 表示参数不可以为空

#### 二、前端后端检测一致

1. 前端尽量做到防呆检测，以及人性化的提示说明 
2. 前端必须做到防频刷
3. 能不向后端发送请求就能解决的问题就不要发送，同时禁止随随便便就触发后端请求

#### 三、参数传递问题

1. 所有的交互页面参数必须传递，后端也做好参数检测
2. 编辑时候不能修改的参数，做好disable的处理，后端只需要过滤参数即可
  
## 部署须知
1 . 路径 `storage/` 要保证PHP-fpm运行的用户(默认为www-data)有可写可执行权限(参考命令如下)
 ```bash
$ sudo chmod -R ug+wx storage/
```
2 . 添加软链`public/storage/` --> `storage/app/public/`
 - Windows (先进项目根目录):
 ```
 mklink /J public\storage storage\app\public
```
 - Linux (需要使用绝对路径) ：
 ```
$ ln -s /path/to/projects/storage/app/public /path/to/projects/public/storage
```

3 . 优化自动加载（否则会造成 20%-25%的性能损失）

```
composer dump-autoload --optimize
```
4 . 修改 `.env`文件 主要有三部分
 - 和数据库相关(以 DB_ 打头)
 - 和WebService相关 
 - CLI_HTTP_HOST 

5 . 部署监控队列脚本的软件 `supervior`